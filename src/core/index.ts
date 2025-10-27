/**
 * 核心模块
 * 导出核心功能
 */

// 类型定义
export type {
  ActionDefinition,
  GetterDefinition,
  BaseStore as IBaseStore,
  PersistOptions,
  StateDefinition,
  StoreOptions,
} from '../types'

// 高级功能
export {
  BatchOperationManager,
  createAdvancedStore,
  createMiddlewareSystem,
  MiddlewareSystem,
  StateDiffer,
  StateValidator,
  TransactionManager
} from './AdvancedFeatures'

export type {
  ActionInfo,
  LoggerOptions,
  Middleware,
  MiddlewareContext
} from './AdvancedFeatures'

// 基础 Store 类
export { BaseStore } from './BaseStore'
// Composition Store
export { createCompositionStore, defineCompositionStore, defineCompositionStoreWithOptions } from './CompositionStore'

export type { CompositionStoreContext, CompositionStoreInstance, CompositionStoreOptions, CompositionStoreSetup } from './CompositionStore'
// 增强版性能优化器
export {
  ComputationOptimizer,
  ConcurrencyController,
  EnhancedPerformanceOptimizer,
  LazyLoadManager,
  MemoryManager,
  PreloadManager,
  RequestMerger,
  VirtualizationManager
} from './EnhancedPerformance'

// 函数式 Store
export { createFunctionalStore, defineStore as defineFunctionalStore, defineStoreWithOptions } from './FunctionalStore'
export type { FunctionalStoreInstance, FunctionalStoreOptions } from './FunctionalStore'

// 内存监控
export {
  MemoryMonitor,
  useMemoryMonitor
} from './MemoryMonitor'

export type {
  MemoryLeakDetection,
  MemoryMonitorConfig,
  MemoryUsageInfo
} from './MemoryMonitor'
// 性能监控
export {
  getOptimizationSuggestions,
  MonitorAction,
  MonitorGetter,
  PerformanceMonitor,
  usePerformanceMonitor,
} from './performance'

export type { PerformanceMetrics } from './performance'
// 性能优化器
export { CacheManager, DebounceManager, PerformanceOptimizer, PersistenceManager, ThrottleManager } from './PerformanceOptimizer'

// 性能报告
export {
  generatePerformanceReport,
  PerformanceReporter,
  usePerformanceReporter
} from './PerformanceReporter'

export type {
  PerformanceReport,
  ReportConfig
} from './PerformanceReporter'

// 持久化增强
export {
  createEnhancedPersistence,
  EnhancedPersistenceManager,
  IndexedDBStorage,
  PersistenceStrategy
} from './PersistenceEnhancement'

export type {
  EnhancedPersistOptions,
  StateMigration,
  StorageEngine
} from './PersistenceEnhancement'

// 响应式系统优化
export {
  batchUpdate,
  BatchUpdateManager,
  batchUpdateManager,
  batchUpdateSync,
  ComputedOptimizer,
  DependencyTracker,
  dependencyTracker,
  memoryManager,
  ReactiveOptimizer,
  reactiveOptimizer,
  SmartCacheManager,
  VirtualProxy,
  waitForUpdates
} from './ReactiveSystem'

// 智能预加载
export {
  createSmartPreloader,
  PreloadPriority,
  PreloadStrategy,
  SmartPreloader
} from './SmartPreloader'

export type {
  PreloadResult,
  PreloadTask
} from './SmartPreloader'

// Store 工厂
export { createClassStore, createCompositionStoreFactory, createStore, defineStore, factory, StoreFactory, StoreType } from './StoreFactory'

export type { ClassStoreOptions, CompositionStoreFactoryOptions, FunctionalStoreFactoryOptions, UnifiedStoreOptions } from './StoreFactory'

// Store 池管理
export { PooledStore, StorePool, useStorePool } from './storePool'

export type { StorePoolOptions } from './storePool'

// 定时器管理器
export { TimerManager } from './TimerManager'

// 订阅管理器
export { SubscriptionManager, createSubscriptionManager } from './SubscriptionManager'

// Store 消息总线
export { StoreMessenger, storeMessenger, createStoreMessenger } from './StoreMessaging'
export type { EventCallback, SubscribeOptions } from './StoreMessaging'

// 状态快照管理
export { SnapshotManager, createSnapshotManager } from './Snapshot'
export type { Snapshot, SnapshotMetadata, SnapshotOptions, StateDiff, DiffType } from './Snapshot'

// 批量操作管理
export { BatchManager, createBatchManager, globalBatchManager, Batch } from './BatchOperations'
export type { BatchOperation, BatchOptions } from './BatchOperations'

// 时间旅行调试
export { TimeTravelDebugger, createTimeTravelDebugger } from '../devtools/TimeTraveling'
export type { HistoryEntry, TimeTravelOptions } from '../devtools/TimeTraveling'

// 插件系统
export {
  PluginManager,
  globalPluginManager,
  createPluginManager,
  createPlugin,
  loggerPlugin,
  performancePlugin
} from './Plugin'
export type { StorePlugin, PluginContext } from './Plugin'

// 性能监控面板
export {
  PerformancePanel,
  createPerformancePanel,
  globalPerformancePanel
} from '../devtools/PerformancePanel'
export type {
  ActionMetrics,
  CacheMetrics,
  MemoryMetrics,
  PerformanceReport,
  Bottleneck
} from '../devtools/PerformancePanel'

// Store 公共功能
export {
  StorePersistenceManager,
  StoreCacheManager,
  createStoreCommonMethods,
  createStoreConfig,
  cloneState
} from './StoreCommon'
export type { StoreCommonMethods } from './StoreCommon'

// 工具函数
export * from './utils'
