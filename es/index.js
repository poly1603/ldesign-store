/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import 'reflect-metadata';
export { BatchOperationManager, MiddlewareSystem, SnapshotManager, StateDiffer, StateValidator, TimeTravelDebugger, TransactionManager, createAdvancedStore, createMiddlewareSystem } from './core/AdvancedFeatures.js';
export { BaseStore } from './core/BaseStore.js';
export { createCompositionStore, defineCompositionStore, defineCompositionStoreWithOptions } from './core/CompositionStore.js';
export { ComputationOptimizer, ConcurrencyController, EnhancedPerformanceOptimizer, LazyLoadManager, MemoryManager, PreloadManager, RequestMerger, VirtualizationManager } from './core/EnhancedPerformance.js';
export { createFunctionalStore, defineStore as defineFunctionalStore, defineStoreWithOptions } from './core/FunctionalStore.js';
export { MemoryMonitor, useMemoryMonitor } from './core/MemoryMonitor.js';
export { MonitorAction, MonitorGetter, getOptimizationSuggestions, usePerformanceMonitor } from './core/performance.js';
export { CacheManager, DebounceManager, PerformanceOptimizer, PersistenceManager, ThrottleManager } from './core/PerformanceOptimizer.js';
export { PerformanceReporter, generatePerformanceReport, usePerformanceReporter } from './core/PerformanceReporter.js';
export { EnhancedPersistenceManager, IndexedDBStorage, PersistenceStrategy, createEnhancedPersistence } from './core/PersistenceEnhancement.js';
export { BatchUpdateManager, ComputedOptimizer, DependencyTracker, ReactiveOptimizer, SmartCacheManager, VirtualProxy, batchUpdate, batchUpdateManager, batchUpdateSync, dependencyTracker, memoryManager, reactiveOptimizer, waitForUpdates } from './core/ReactiveSystem.js';
export { PreloadPriority, PreloadStrategy, SmartPreloader, createSmartPreloader } from './core/SmartPreloader.js';
export { StoreFactory, StoreType, createClassStore, createCompositionStoreFactory, createStore, defineStore, StoreFactory as factory } from './core/StoreFactory.js';
export { PooledStore, StorePool, useStorePool } from './core/storePool.js';
export { getNestedValue, isFunction, isObject, isPromise, setNestedValue } from './core/utils.js';
export { DECORATOR_METADATA_KEY } from './types/decorators.js';
export { Action, AsyncAction, CachedAction, DebouncedAction, ThrottledAction } from './decorators/Action.js';
export { CachedGetter, DependentGetter, Getter, MemoizedGetter } from './decorators/Getter.js';
export { PersistentState, ReactiveState, ReadonlyState, State } from './decorators/State.js';
export { ConsoleFormatter, DevToolsConnection, StoreDevTools, VisualInspector } from './DevTools.js';
export { createDebugStoreEnginePlugin, createDefaultStoreEnginePlugin, createPerformanceStoreEnginePlugin, createStoreEnginePlugin } from './engine/plugin.js';
export { createAsyncAction, createComputed, createStore as createHookStore, createPersistedState, createState } from './hooks/createStore.js';
export { useActionState, useDebounce, useLocalStorage, useSelector, useSessionStorage, useStateWatch, useStoreHook, useThrottle } from './hooks/useStoreHooks.js';
export { PerformanceMonitor } from './PerformanceMonitoring.js';
export { AdaptiveCache, CacheAnalyzer, CacheWarmer, MultiLevelCache } from './utils/advanced-cache.js';
export { LRUCache, ObjectPool, fastHash } from './utils/cache.js';
export { fastEqual, fastParse, fastStringify, safeCopy, shallowCopy } from './utils/fast-serializer.js';
export { batch, chunk, debounce, deepClone, deepEqual, deepFreeze, deepMerge, delay, deleteDeepValue, flattenObject, formatBytes, formatDuration, generateId, getDeepValue, groupBy, memoize, omit, pLimit, pick, retry, safeEntries, safeKeys, safeValues, setDeepValue, throttle, unflattenObject, unique } from './utils/helpers.js';
export { Assert, AssertionError, ErrorHandler, StoreConfigValidator, TypeGuards, ValidationError, Validator, safeJsonParse, safeJsonStringify } from './utils/validation.js';
export { STORE_PROVIDER_KEY } from './types/provider.js';
export { useAction, useAsyncAction, useBatch, useComputed, useGetter, usePersist, useReactiveState, useSimpleStore, useState, useStore } from './vue/composables.js';
export { createStoreDirectivesPlugin, storeDirectives, vAction, vLoading, vStore } from './vue/directives.js';
export { StoreManager, createAutoStorePlugin, createReactiveStore, createSimpleStore, createStores, globalStoreManager } from './vue/helpers.js';
export { StoreProvider, createStoreProviderPlugin, useStoreProvider, useStoreRegistration } from './vue/StoreProvider.js';

const version = "0.1.0";

export { version };
//# sourceMappingURL=index.js.map
