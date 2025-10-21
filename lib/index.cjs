/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

require('reflect-metadata');
var AdvancedFeatures = require('./core/AdvancedFeatures.cjs');
var BaseStore = require('./core/BaseStore.cjs');
var CompositionStore = require('./core/CompositionStore.cjs');
var EnhancedPerformance = require('./core/EnhancedPerformance.cjs');
var FunctionalStore = require('./core/FunctionalStore.cjs');
var MemoryMonitor = require('./core/MemoryMonitor.cjs');
var performance = require('./core/performance.cjs');
var PerformanceOptimizer = require('./core/PerformanceOptimizer.cjs');
var PerformanceReporter = require('./core/PerformanceReporter.cjs');
var PersistenceEnhancement = require('./core/PersistenceEnhancement.cjs');
var ReactiveSystem = require('./core/ReactiveSystem.cjs');
var SmartPreloader = require('./core/SmartPreloader.cjs');
var StoreFactory = require('./core/StoreFactory.cjs');
var storePool = require('./core/storePool.cjs');
var utils = require('./core/utils.cjs');
var decorators = require('./types/decorators.cjs');
var Action = require('./decorators/Action.cjs');
var Getter = require('./decorators/Getter.cjs');
var State = require('./decorators/State.cjs');
var DevTools = require('./DevTools.cjs');
var plugin = require('./engine/plugin.cjs');
var createStore = require('./hooks/createStore.cjs');
var useStoreHooks = require('./hooks/useStoreHooks.cjs');
var PerformanceMonitoring = require('./PerformanceMonitoring.cjs');
var advancedCache = require('./utils/advanced-cache.cjs');
var cache = require('./utils/cache.cjs');
var fastSerializer = require('./utils/fast-serializer.cjs');
var helpers = require('./utils/helpers.cjs');
var validation = require('./utils/validation.cjs');
var provider = require('./types/provider.cjs');
var composables = require('./vue/composables.cjs');
var directives = require('./vue/directives.cjs');
var helpers$1 = require('./vue/helpers.cjs');
var StoreProvider = require('./vue/StoreProvider.cjs');

const version = "0.1.0";

exports.BatchOperationManager = AdvancedFeatures.BatchOperationManager;
exports.MiddlewareSystem = AdvancedFeatures.MiddlewareSystem;
exports.SnapshotManager = AdvancedFeatures.SnapshotManager;
exports.StateDiffer = AdvancedFeatures.StateDiffer;
exports.StateValidator = AdvancedFeatures.StateValidator;
exports.TimeTravelDebugger = AdvancedFeatures.TimeTravelDebugger;
exports.TransactionManager = AdvancedFeatures.TransactionManager;
exports.createAdvancedStore = AdvancedFeatures.createAdvancedStore;
exports.createMiddlewareSystem = AdvancedFeatures.createMiddlewareSystem;
exports.BaseStore = BaseStore.BaseStore;
exports.createCompositionStore = CompositionStore.createCompositionStore;
exports.defineCompositionStore = CompositionStore.defineCompositionStore;
exports.defineCompositionStoreWithOptions = CompositionStore.defineCompositionStoreWithOptions;
exports.ComputationOptimizer = EnhancedPerformance.ComputationOptimizer;
exports.ConcurrencyController = EnhancedPerformance.ConcurrencyController;
exports.EnhancedPerformanceOptimizer = EnhancedPerformance.EnhancedPerformanceOptimizer;
exports.LazyLoadManager = EnhancedPerformance.LazyLoadManager;
exports.MemoryManager = EnhancedPerformance.MemoryManager;
exports.PreloadManager = EnhancedPerformance.PreloadManager;
exports.RequestMerger = EnhancedPerformance.RequestMerger;
exports.VirtualizationManager = EnhancedPerformance.VirtualizationManager;
exports.createFunctionalStore = FunctionalStore.createFunctionalStore;
exports.defineFunctionalStore = FunctionalStore.defineStore;
exports.defineStoreWithOptions = FunctionalStore.defineStoreWithOptions;
exports.MemoryMonitor = MemoryMonitor.MemoryMonitor;
exports.useMemoryMonitor = MemoryMonitor.useMemoryMonitor;
exports.MonitorAction = performance.MonitorAction;
exports.MonitorGetter = performance.MonitorGetter;
exports.getOptimizationSuggestions = performance.getOptimizationSuggestions;
exports.usePerformanceMonitor = performance.usePerformanceMonitor;
exports.CacheManager = PerformanceOptimizer.CacheManager;
exports.DebounceManager = PerformanceOptimizer.DebounceManager;
exports.PerformanceOptimizer = PerformanceOptimizer.PerformanceOptimizer;
exports.PersistenceManager = PerformanceOptimizer.PersistenceManager;
exports.ThrottleManager = PerformanceOptimizer.ThrottleManager;
exports.PerformanceReporter = PerformanceReporter.PerformanceReporter;
exports.generatePerformanceReport = PerformanceReporter.generatePerformanceReport;
exports.usePerformanceReporter = PerformanceReporter.usePerformanceReporter;
exports.EnhancedPersistenceManager = PersistenceEnhancement.EnhancedPersistenceManager;
exports.IndexedDBStorage = PersistenceEnhancement.IndexedDBStorage;
Object.defineProperty(exports, "PersistenceStrategy", {
  enumerable: true,
  get: function () { return PersistenceEnhancement.PersistenceStrategy; }
});
exports.createEnhancedPersistence = PersistenceEnhancement.createEnhancedPersistence;
exports.BatchUpdateManager = ReactiveSystem.BatchUpdateManager;
exports.ComputedOptimizer = ReactiveSystem.ComputedOptimizer;
exports.DependencyTracker = ReactiveSystem.DependencyTracker;
exports.ReactiveOptimizer = ReactiveSystem.ReactiveOptimizer;
exports.SmartCacheManager = ReactiveSystem.SmartCacheManager;
exports.VirtualProxy = ReactiveSystem.VirtualProxy;
exports.batchUpdate = ReactiveSystem.batchUpdate;
exports.batchUpdateManager = ReactiveSystem.batchUpdateManager;
exports.batchUpdateSync = ReactiveSystem.batchUpdateSync;
exports.dependencyTracker = ReactiveSystem.dependencyTracker;
exports.memoryManager = ReactiveSystem.memoryManager;
exports.reactiveOptimizer = ReactiveSystem.reactiveOptimizer;
exports.waitForUpdates = ReactiveSystem.waitForUpdates;
Object.defineProperty(exports, "PreloadPriority", {
  enumerable: true,
  get: function () { return SmartPreloader.PreloadPriority; }
});
Object.defineProperty(exports, "PreloadStrategy", {
  enumerable: true,
  get: function () { return SmartPreloader.PreloadStrategy; }
});
exports.SmartPreloader = SmartPreloader.SmartPreloader;
exports.createSmartPreloader = SmartPreloader.createSmartPreloader;
exports.StoreFactory = StoreFactory.StoreFactory;
Object.defineProperty(exports, "StoreType", {
  enumerable: true,
  get: function () { return StoreFactory.StoreType; }
});
exports.createClassStore = StoreFactory.createClassStore;
exports.createCompositionStoreFactory = StoreFactory.createCompositionStoreFactory;
exports.createStore = StoreFactory.createStore;
exports.defineStore = StoreFactory.defineStore;
exports.factory = StoreFactory.StoreFactory;
exports.PooledStore = storePool.PooledStore;
exports.StorePool = storePool.StorePool;
exports.useStorePool = storePool.useStorePool;
exports.getNestedValue = utils.getNestedValue;
exports.isFunction = utils.isFunction;
exports.isObject = utils.isObject;
exports.isPromise = utils.isPromise;
exports.setNestedValue = utils.setNestedValue;
exports.DECORATOR_METADATA_KEY = decorators.DECORATOR_METADATA_KEY;
exports.Action = Action.Action;
exports.AsyncAction = Action.AsyncAction;
exports.CachedAction = Action.CachedAction;
exports.DebouncedAction = Action.DebouncedAction;
exports.ThrottledAction = Action.ThrottledAction;
exports.CachedGetter = Getter.CachedGetter;
exports.DependentGetter = Getter.DependentGetter;
exports.Getter = Getter.Getter;
exports.MemoizedGetter = Getter.MemoizedGetter;
exports.PersistentState = State.PersistentState;
exports.ReactiveState = State.ReactiveState;
exports.ReadonlyState = State.ReadonlyState;
exports.State = State.State;
exports.ConsoleFormatter = DevTools.ConsoleFormatter;
exports.DevToolsConnection = DevTools.DevToolsConnection;
exports.StoreDevTools = DevTools.StoreDevTools;
exports.VisualInspector = DevTools.VisualInspector;
exports.createDebugStoreEnginePlugin = plugin.createDebugStoreEnginePlugin;
exports.createDefaultStoreEnginePlugin = plugin.createDefaultStoreEnginePlugin;
exports.createPerformanceStoreEnginePlugin = plugin.createPerformanceStoreEnginePlugin;
exports.createStoreEnginePlugin = plugin.createStoreEnginePlugin;
exports.createAsyncAction = createStore.createAsyncAction;
exports.createComputed = createStore.createComputed;
exports.createHookStore = createStore.createStore;
exports.createPersistedState = createStore.createPersistedState;
exports.createState = createStore.createState;
exports.useActionState = useStoreHooks.useActionState;
exports.useDebounce = useStoreHooks.useDebounce;
exports.useLocalStorage = useStoreHooks.useLocalStorage;
exports.useSelector = useStoreHooks.useSelector;
exports.useSessionStorage = useStoreHooks.useSessionStorage;
exports.useStateWatch = useStoreHooks.useStateWatch;
exports.useStoreHook = useStoreHooks.useStoreHook;
exports.useThrottle = useStoreHooks.useThrottle;
exports.PerformanceMonitor = PerformanceMonitoring.PerformanceMonitor;
exports.AdaptiveCache = advancedCache.AdaptiveCache;
exports.CacheAnalyzer = advancedCache.CacheAnalyzer;
exports.CacheWarmer = advancedCache.CacheWarmer;
exports.MultiLevelCache = advancedCache.MultiLevelCache;
exports.LRUCache = cache.LRUCache;
exports.ObjectPool = cache.ObjectPool;
exports.fastHash = cache.fastHash;
exports.fastEqual = fastSerializer.fastEqual;
exports.fastParse = fastSerializer.fastParse;
exports.fastStringify = fastSerializer.fastStringify;
exports.safeCopy = fastSerializer.safeCopy;
exports.shallowCopy = fastSerializer.shallowCopy;
exports.batch = helpers.batch;
exports.chunk = helpers.chunk;
exports.debounce = helpers.debounce;
exports.deepClone = helpers.deepClone;
exports.deepEqual = helpers.deepEqual;
exports.deepFreeze = helpers.deepFreeze;
exports.deepMerge = helpers.deepMerge;
exports.delay = helpers.delay;
exports.deleteDeepValue = helpers.deleteDeepValue;
exports.flattenObject = helpers.flattenObject;
exports.formatBytes = helpers.formatBytes;
exports.formatDuration = helpers.formatDuration;
exports.generateId = helpers.generateId;
exports.getDeepValue = helpers.getDeepValue;
exports.groupBy = helpers.groupBy;
exports.memoize = helpers.memoize;
exports.omit = helpers.omit;
exports.pLimit = helpers.pLimit;
exports.pick = helpers.pick;
exports.retry = helpers.retry;
exports.safeEntries = helpers.safeEntries;
exports.safeKeys = helpers.safeKeys;
exports.safeValues = helpers.safeValues;
exports.setDeepValue = helpers.setDeepValue;
exports.throttle = helpers.throttle;
exports.unflattenObject = helpers.unflattenObject;
exports.unique = helpers.unique;
exports.Assert = validation.Assert;
exports.AssertionError = validation.AssertionError;
exports.ErrorHandler = validation.ErrorHandler;
exports.StoreConfigValidator = validation.StoreConfigValidator;
exports.TypeGuards = validation.TypeGuards;
exports.ValidationError = validation.ValidationError;
exports.Validator = validation.Validator;
exports.safeJsonParse = validation.safeJsonParse;
exports.safeJsonStringify = validation.safeJsonStringify;
exports.STORE_PROVIDER_KEY = provider.STORE_PROVIDER_KEY;
exports.useAction = composables.useAction;
exports.useAsyncAction = composables.useAsyncAction;
exports.useBatch = composables.useBatch;
exports.useComputed = composables.useComputed;
exports.useGetter = composables.useGetter;
exports.usePersist = composables.usePersist;
exports.useReactiveState = composables.useReactiveState;
exports.useSimpleStore = composables.useSimpleStore;
exports.useState = composables.useState;
exports.useStore = composables.useStore;
exports.createStoreDirectivesPlugin = directives.createStoreDirectivesPlugin;
exports.storeDirectives = directives.storeDirectives;
exports.vAction = directives.vAction;
exports.vLoading = directives.vLoading;
exports.vStore = directives.vStore;
exports.StoreManager = helpers$1.StoreManager;
exports.createAutoStorePlugin = helpers$1.createAutoStorePlugin;
exports.createReactiveStore = helpers$1.createReactiveStore;
exports.createSimpleStore = helpers$1.createSimpleStore;
exports.createStores = helpers$1.createStores;
exports.globalStoreManager = helpers$1.globalStoreManager;
exports.StoreProvider = StoreProvider.StoreProvider;
exports.createStoreProviderPlugin = StoreProvider.createStoreProviderPlugin;
exports.useStoreProvider = StoreProvider.useStoreProvider;
exports.useStoreRegistration = StoreProvider.useStoreRegistration;
exports.version = version;
//# sourceMappingURL=index.cjs.map
