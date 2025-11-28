/**
 * Store 核心类型定义
 *
 * @module types/store
 */

/**
 * 状态对象类型
 */
export type StateTree = Record<string | number | symbol, unknown>

/**
 * Store ID 类型
 */
export type StoreId = string

/**
 * Getter 函数类型
 * @template S - 状态类型
 * @template R - 返回值类型
 */
export type StoreGetter<S extends StateTree, R> = (state: S) => R

/**
 * Getter 集合类型
 * @template S - 状态类型
 */
export type StoreGetters<S extends StateTree> = Record<string, StoreGetter<S, unknown>>

/**
 * Action 函数类型
 */
export type StoreAction = (...args: unknown[]) => unknown

/**
 * Action 集合类型
 */
export type StoreActions = Record<string, StoreAction>

/**
 * Store 定义选项
 * @template Id - Store ID 类型
 * @template S - 状态类型
 * @template G - Getters 类型
 * @template A - Actions 类型
 */
export interface StoreDefinition<
  Id extends StoreId = StoreId,
  S extends StateTree = StateTree,
  G extends StoreGetters<S> = StoreGetters<S>,
  A extends StoreActions = StoreActions,
> {
  /** Store 唯一标识 */
  id: Id
  /** 初始状态工厂函数 */
  state: () => S
  /** Getters 定义 */
  getters?: G
  /** Actions 定义 */
  actions?: A
}

/**
 * Store 实例接口
 * @template Id - Store ID 类型
 * @template S - 状态类型
 * @template G - Getters 类型
 * @template A - Actions 类型
 */
export interface StoreInstance<
  Id extends StoreId = StoreId,
  S extends StateTree = StateTree,
  G extends StoreGetters<S> = StoreGetters<S>,
  A extends StoreActions = StoreActions,
> {
  /** Store 唯一标识 */
  $id: Id

  /** 当前状态 */
  $state: S

  /**
   * 重置状态到初始值
   */
  $reset: () => void

  /**
   * 批量更新状态
   * @param partialState - 部分状态或更新函数
   */
  $patch: (partialState: Partial<S> | ((state: S) => void)) => void

  /**
   * 订阅状态变化
   * @param callback - 回调函数
   * @param options - 订阅选项
   * @returns 取消订阅函数
   */
  $subscribe: (
    callback: StateSubscriber<S>,
    options?: SubscribeOptions
  ) => () => void

  /**
   * 订阅 action 调用
   * @param callback - 回调函数
   * @returns 取消订阅函数
   */
  $onAction: (callback: ActionSubscriber<A>) => () => void

  /**
   * 销毁 store
   */
  $dispose: () => void
}

/**
 * 状态变化订阅器
 * @template S - 状态类型
 */
export type StateSubscriber<S extends StateTree> = (
  mutation: StateMutation<S>,
  state: S
) => void

/**
 * 状态变化信息
 * @template S - 状态类型
 */
export interface StateMutation<S extends StateTree> {
  /** 变化类型 */
  type: 'direct' | 'patch object' | 'patch function'
  /** Store ID */
  storeId: StoreId
  /** 变化的键路径 */
  events?: string[]
  /** 变化前的状态快照 */
  oldState?: Partial<S>
}

/**
 * 订阅选项
 */
export interface SubscribeOptions {
  /** 是否立即执行一次 */
  immediate?: boolean
  /** 是否深度监听 */
  deep?: boolean
  /** 是否在组件卸载后继续监听 */
  detached?: boolean
}

/**
 * Action 订阅器
 * @template A - Actions 类型
 */
export type ActionSubscriber<A extends StoreActions> = (context: ActionContext<A>) => void

/**
 * Action 上下文
 * @template A - Actions 类型
 */
export interface ActionContext<A extends StoreActions> {
  /** Action 名称 */
  name: keyof A
  /** Store ID */
  storeId: StoreId
  /** 调用参数 */
  args: unknown[]
  /** 执行后回调 */
  after: (callback: (result: unknown) => void) => void
  /** 错误回调 */
  onError: (callback: (error: unknown) => void) => void
}

/**
 * Store 配置选项
 */
export interface StoreOptions {
  /** 是否启用严格模式（只能通过 action 修改状态） */
  strict?: boolean
  /** 是否启用开发工具 */
  devtools?: boolean
  /** 是否启用持久化 */
  persist?: boolean
  /** 持久化配置 */
  persistOptions?: PersistOptions
}

/**
 * 持久化选项
 */
export interface PersistOptions {
  /** 存储键名 */
  key?: string
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage' | 'custom'
  /** 自定义存储适配器 */
  customStorage?: StorageAdapter
  /** 要持久化的路径 */
  paths?: string[]
  /** 序列化函数 */
  serializer?: {
    serialize: (value: unknown) => string
    deserialize: (value: string) => unknown
  }
  /** 恢复前回调 */
  beforeRestore?: (context: { store: unknown }) => void
  /** 恢复后回调 */
  afterRestore?: (context: { store: unknown }) => void
}

/**
 * 存储适配器接口
 */
export interface StorageAdapter {
  /** 获取数据 */
  getItem: (key: string) => string | null | Promise<string | null>
  /** 设置数据 */
  setItem: (key: string, value: string) => void | Promise<void>
  /** 删除数据 */
  removeItem: (key: string) => void | Promise<void>
}

