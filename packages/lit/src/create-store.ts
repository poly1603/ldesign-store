/**
 * Lit Store 创建器
 * 
 * 基于 Reactive Controllers，增强了缓存、持久化、性能监控等功能
 * 
 * @module create-store
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit'
import {
  LRUCache,
  PerformanceMonitor,
  SubscriptionManager,
  getDefaultSerializer,
  getDefaultStorage
} from '@ldesign/store-core'
import type { CacheOptions, PersistOptions } from '@ldesign/store-core'

/**
 * Store 选项
 */
export interface LitStoreOptions<S = any, A = any> {
  /** Store 名称 */
  name: string
  /** 初始状态 */
  initialState: S
  /** Actions */
  actions?: (setState: (partial: Partial<S>) => void, getState: () => S) => A
  /** 缓存选项 */
  cache?: CacheOptions
  /** 持久化选项 */
  persist?: boolean | PersistOptions
  /** 性能监控 */
  enablePerformanceMonitor?: boolean
}

/**
 * 增强的 Lit Store Controller
 */
export class LitStoreController<S extends object = any, A = any> implements ReactiveController {
  private _state: S
  private _actions: A
  private _cache: LRUCache
  private _performanceMonitor?: PerformanceMonitor
  private _subscriptionManager: SubscriptionManager
  private _persist: () => void
  private _hydrate: () => void
  private _clearPersisted: () => void

  constructor(
    private host: ReactiveControllerHost,
    options: LitStoreOptions<S, A>
  ) {
    const {
      name,
      initialState,
      actions: actionsFactory,
      cache: cacheOptions,
      persist: persistOptions,
      enablePerformanceMonitor = false
    } = options

    // 创建核心组件
    this._cache = cacheOptions ? new LRUCache(cacheOptions) : new LRUCache()
    this._subscriptionManager = new SubscriptionManager()
    this._performanceMonitor = enablePerformanceMonitor ? new PerformanceMonitor() : undefined

    // 持久化配置
    const persistConfig = typeof persistOptions === 'object' ? persistOptions : undefined
    const shouldPersist = persistOptions === true || !!persistConfig
    const storage = persistConfig?.storage || getDefaultStorage()
    const serializer = persistConfig?.serializer || getDefaultSerializer()
    const persistKey = persistConfig?.key || `store:${name}`

    // 从存储恢复状态
    this._state = initialState
    if (shouldPersist) {
      const saved = storage.getItem(persistKey)
      if (saved) {
        try {
          this._state = { ...initialState, ...serializer.deserialize(saved) }
        }
        catch (error) {
          console.error('[Lit Store] 恢复持久化数据失败:', error)
        }
      }
    }

    // 状态更新函数
    const setState = (partial: Partial<S>) => {
      this._state = { ...this._state, ...partial }
      this.host.requestUpdate()
      if (shouldPersist) {
        this._persist()
      }
    }

    // 获取状态函数
    const getState = (): S => this._state

    // 创建 actions
    this._actions = actionsFactory ? actionsFactory(setState, getState) : ({} as A)

    // 持久化函数
    this._persist = () => {
      if (!shouldPersist) return
      const serialized = serializer.serialize(this._state)
      storage.setItem(persistKey, serialized)
    }

    this._hydrate = () => {
      if (!shouldPersist) return
      const saved = storage.getItem(persistKey)
      if (saved) {
        try {
          this._state = serializer.deserialize(saved)
          this.host.requestUpdate()
        }
        catch (error) {
          console.error('[Lit Store] 恢复持久化数据失败:', error)
        }
      }
    }

    this._clearPersisted = () => {
      if (!shouldPersist) return
      storage.removeItem(persistKey)
    }

    host.addController(this)
  }

  hostConnected(): void {
    // 组件连接时的初始化
  }

  hostDisconnected(): void {
    // 清理资源
    this._cache.dispose()
  }

  get state(): S {
    return this._state
  }

  get actions(): A {
    return this._actions
  }

  get $cache(): LRUCache {
    return this._cache
  }

  get $performanceMonitor(): PerformanceMonitor | undefined {
    return this._performanceMonitor
  }

  get $subscriptionManager(): SubscriptionManager {
    return this._subscriptionManager
  }

  $persist(): void {
    this._persist()
  }

  $hydrate(): void {
    this._hydrate()
  }

  $clearPersisted(): void {
    this._clearPersisted()
  }
}

/**
 * 创建增强的 Lit Store Controller
 * 
 * @param host - Lit 组件 host
 * @param options - Store 选项
 * @returns Store controller 实例
 */
export function createLitStore<S extends object = any, A = any>(
  host: ReactiveControllerHost,
  options: LitStoreOptions<S, A>
): LitStoreController<S, A> {
  return new LitStoreController(host, options)
}




