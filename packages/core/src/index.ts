/**
 * @ldesign/store-core - 框架无关的状态管理核心库
 *
 * 主要功能模块：
 * - 核心抽象：Store、State、Action、Getter 等核心概念
 * - 插件系统：可扩展的插件机制
 * - 中间件：日志、持久化、时间旅行等
 * - 订阅发布：状态变化订阅、事件总线
 * - 批量更新：性能优化的批量状态更新
 * - 工具函数：深拷贝、选择器等
 *
 * @module @ldesign/store-core
 */

// === 类型定义 ===
export type {
  // Store 类型
  ActionContext,
  ActionSubscriber,
  PersistOptions,
  StateSubscriber,
  StateMutation,
  StateTree,
  StorageAdapter,
  StoreAction,
  StoreActions,
  StoreDefinition,
  StoreGetter,
  StoreGetters,
  StoreId,
  StoreInstance,
  StoreOptions,
  SubscribeOptions,
  // 插件类型
  DefinePluginOptions,
  PluginContext,
  PluginFactory,
  PluginManager,
  StoreManagerLike,
  StorePlugin,
  // 中间件类型
  LoggerMiddlewareOptions,
  Middleware,
  MiddlewareActionType,
  MiddlewareContext,
  MiddlewareFunction,
  MiddlewareManager,
  PersistMiddlewareOptions,
  StateSnapshot,
  TimeTravelController,
  TimeTravelMiddlewareOptions,
  // 订阅类型
  BatchContext,
  BatchManager,
  EventBus,
  EventData,
  EventListener,
  EventType,
  PubSub,
  Selector,
  SelectorOptions,
  Subscriber,
  SubscriptionOptions,
  Unsubscribe,
} from './types'

// === 核心模块 ===
export {
  BaseStore,
  batch,
  createBatchManager,
  createEventBus,
  createPubSub,
  createPubSubWithValue,
  getGlobalBatchManager,
  globalEventBus,
  setGlobalBatchManager,
} from './core'

// === 中间件模块 ===
export {
  createLoggerMiddleware,
  createMiddlewareManager,
  createPersistMiddleware,
  createSimpleLoggerMiddleware,
  createTimeTravelMiddleware,
  getGlobalMiddlewareManager,
  restoreState,
  setGlobalMiddlewareManager,
  setRestoreCallback,
} from './middleware'

// === 插件模块 ===
export {
  composePlugins,
  createPluginFactory,
  createPluginManager,
  defineStorePlugin,
  getGlobalPluginManager,
  setGlobalPluginManager,
} from './plugins'

// === 工具函数 ===
export {
  combineSelectors,
  createCachedSelector,
  createSelector,
  deepClone,
  deepMerge,
  getByPath,
  setByPath,
  shallowClone,
} from './utils'

// === 版本信息 ===
export const version = '1.0.0'
export const name = '@ldesign/store-core'

