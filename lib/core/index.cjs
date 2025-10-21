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

var AdvancedFeatures = require('./AdvancedFeatures.cjs');
var BaseStore = require('./BaseStore.cjs');
var CompositionStore = require('./CompositionStore.cjs');
var EnhancedPerformance = require('./EnhancedPerformance.cjs');
var FunctionalStore = require('./FunctionalStore.cjs');
var MemoryMonitor = require('./MemoryMonitor.cjs');
var performance = require('./performance.cjs');
var PerformanceOptimizer = require('./PerformanceOptimizer.cjs');
var PerformanceReporter = require('./PerformanceReporter.cjs');
var PersistenceEnhancement = require('./PersistenceEnhancement.cjs');
var ReactiveSystem = require('./ReactiveSystem.cjs');
var SmartPreloader = require('./SmartPreloader.cjs');
var StoreFactory = require('./StoreFactory.cjs');
var storePool = require('./storePool.cjs');
var utils = require('./utils.cjs');



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
exports.PerformanceMonitor = performance.PerformanceMonitor;
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
exports.debounce = utils.debounce;
exports.deepClone = utils.deepClone;
exports.deepEqual = utils.deepEqual;
exports.generateId = utils.generateId;
exports.getNestedValue = utils.getNestedValue;
exports.isFunction = utils.isFunction;
exports.isObject = utils.isObject;
exports.isPromise = utils.isPromise;
exports.setNestedValue = utils.setNestedValue;
exports.throttle = utils.throttle;
//# sourceMappingURL=index.cjs.map
