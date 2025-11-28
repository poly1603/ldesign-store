/**
 * 基础 Store 抽象类
 *
 * 提供框架无关的 Store 基础实现
 * @module core/base-store
 */

import type {
  ActionContext,
  ActionSubscriber,
  StateSubscriber,
  StateTree,
  StoreActions,
  StoreDefinition,
  StoreGetters,
  StoreId,
  StoreInstance,
  StoreOptions,
  SubscribeOptions,
  Unsubscribe,
} from '../types'
import { createPubSub } from './pub-sub'
import { globalEventBus } from './event-bus'

/**
 * 基础 Store 类
 *
 * @template Id - Store ID 类型
 * @template S - 状态类型
 * @template G - Getters 类型
 * @template A - Actions 类型
 */
export class BaseStore<
  Id extends StoreId = StoreId,
  S extends StateTree = StateTree,
  G extends StoreGetters<S> = StoreGetters<S>,
  A extends StoreActions = StoreActions,
> implements StoreInstance<Id, S, G, A> {
  /** Store ID */
  readonly $id: Id

  /** 状态订阅管理器 */
  private stateSubscribers = createPubSub<{ mutation: any, state: S }>()

  /** Action 订阅管理器 */
  private actionSubscribers = createPubSub<ActionContext<A>>()

  /** 初始状态工厂 */
  private initialStateFactory: () => S

  /** 当前状态 */
  private _state: S

  /** Getters 定义 */
  private gettersDefinition: G

  /** Actions 定义 */
  private actionsDefinition: A

  /** 配置选项 */
  private options: StoreOptions

  /** 是否已销毁 */
  private disposed = false

  /**
   * 构造函数
   *
   * @param definition - Store 定义
   * @param options - Store 配置选项
   */
  constructor(
    definition: StoreDefinition<Id, S, G, A>,
    options: StoreOptions = {},
  ) {
    this.$id = definition.id
    this.initialStateFactory = definition.state
    this._state = definition.state()
    this.gettersDefinition = (definition.getters || {}) as G
    this.actionsDefinition = (definition.actions || {}) as A
    this.options = options

    // 发送 Store 创建事件
    globalEventBus.emit('store:created', { storeId: this.$id })
  }

  /**
   * 获取当前状态
   */
  get $state(): S {
    return this._state
  }

  /**
   * 设置状态
   */
  set $state(newState: S) {
    this._state = newState
  }

  /**
   * 重置状态到初始值
   */
  $reset(): void {
    this.checkDisposed()
    const oldState = { ...this._state }
    this._state = this.initialStateFactory()

    this.notifyStateChange({
      type: 'direct',
      storeId: this.$id,
      oldState,
    })
  }

  /**
   * 批量更新状态
   */
  $patch(partialState: Partial<S> | ((state: S) => void)): void {
    this.checkDisposed()
    const oldState = { ...this._state }

    if (typeof partialState === 'function') {
      partialState(this._state)
      this.notifyStateChange({
        type: 'patch function',
        storeId: this.$id,
        oldState,
      })
    }
    else {
      Object.assign(this._state, partialState)
      this.notifyStateChange({
        type: 'patch object',
        storeId: this.$id,
        oldState,
        events: Object.keys(partialState),
      })
    }
  }

  /**
   * 订阅状态变化
   */
  $subscribe(
    callback: StateSubscriber<S>,
    options: SubscribeOptions = {},
  ): Unsubscribe {
    this.checkDisposed()

    return this.stateSubscribers.subscribe(
      ({ mutation, state }) => callback(mutation, state),
      { immediate: options.immediate },
    )
  }

  /**
   * 订阅 Action 调用
   */
  $onAction(callback: ActionSubscriber<A>): Unsubscribe {
    this.checkDisposed()

    return this.actionSubscribers.subscribe(callback)
  }

  /**
   * 销毁 Store
   */
  $dispose(): void {
    if (this.disposed) return

    this.disposed = true
    this.stateSubscribers.clear()
    this.actionSubscribers.clear()

    globalEventBus.emit('store:disposed', { storeId: this.$id })
  }

  /**
   * 通知状态变化
   */
  protected notifyStateChange(mutation: any): void {
    this.stateSubscribers.publish({ mutation, state: this._state })
    globalEventBus.emit('state:changed', {
      storeId: this.$id,
      state: this._state,
      mutation,
    })
  }

  /**
   * 通知 Action 调用
   */
  protected notifyAction(context: ActionContext<A>): void {
    this.actionSubscribers.publish(context)
  }

  /**
   * 检查是否已销毁
   */
  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error(`[Store] Store "${this.$id}" 已被销毁`)
    }
  }
}

