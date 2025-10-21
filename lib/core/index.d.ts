/**
 * 核心模块
 * 导出核心功能
 */
export type { ActionDefinition, GetterDefinition, BaseStore as IBaseStore, PersistOptions, StateDefinition, StoreOptions, } from '../types';
export { BatchOperationManager, createAdvancedStore, createMiddlewareSystem, MiddlewareSystem, SnapshotManager, StateDiffer, StateValidator, TimeTravelDebugger, TransactionManager } from './AdvancedFeatures';
export type { ActionInfo, LoggerOptions, Middleware, MiddlewareContext } from './AdvancedFeatures';
export { BaseStore } from './BaseStore';
export { createCompositionStore, defineCompositionStore, defineCompositionStoreWithOptions } from './CompositionStore';
export type { CompositionStoreContext, CompositionStoreInstance, CompositionStoreOptions, CompositionStoreSetup } from './CompositionStore';
export { ComputationOptimizer, ConcurrencyController, EnhancedPerformanceOptimizer, LazyLoadManager, MemoryManager, PreloadManager, RequestMerger, VirtualizationManager } from './EnhancedPerformance';
export { createFunctionalStore, defineStore as defineFunctionalStore, defineStoreWithOptions } from './FunctionalStore';
export type { FunctionalStoreInstance, FunctionalStoreOptions } from './FunctionalStore';
export { MemoryMonitor, useMemoryMonitor } from './MemoryMonitor';
export type { MemoryLeakDetection, MemoryMonitorConfig, MemoryUsageInfo } from './MemoryMonitor';
export { getOptimizationSuggestions, MonitorAction, MonitorGetter, PerformanceMonitor, usePerformanceMonitor, } from './performance';
export type { PerformanceMetrics } from './performance';
export { CacheManager, DebounceManager, PerformanceOptimizer, PersistenceManager, ThrottleManager } from './PerformanceOptimizer';
export { generatePerformanceReport, PerformanceReporter, usePerformanceReporter } from './PerformanceReporter';
export type { PerformanceReport, ReportConfig } from './PerformanceReporter';
export { createEnhancedPersistence, EnhancedPersistenceManager, IndexedDBStorage, PersistenceStrategy } from './PersistenceEnhancement';
export type { EnhancedPersistOptions, StateMigration, StorageEngine } from './PersistenceEnhancement';
export { batchUpdate, BatchUpdateManager, batchUpdateManager, batchUpdateSync, ComputedOptimizer, DependencyTracker, dependencyTracker, memoryManager, ReactiveOptimizer, reactiveOptimizer, SmartCacheManager, VirtualProxy, waitForUpdates } from './ReactiveSystem';
export { createSmartPreloader, PreloadPriority, PreloadStrategy, SmartPreloader } from './SmartPreloader';
export type { PreloadResult, PreloadTask } from './SmartPreloader';
export { createClassStore, createCompositionStoreFactory, createStore, defineStore, factory, StoreFactory, StoreType } from './StoreFactory';
export type { ClassStoreOptions, CompositionStoreFactoryOptions, FunctionalStoreFactoryOptions, UnifiedStoreOptions } from './StoreFactory';
export { PooledStore, StorePool, useStorePool } from './storePool';
export type { StorePoolOptions } from './storePool';
export * from './utils';
