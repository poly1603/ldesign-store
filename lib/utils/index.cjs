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

var advancedCache = require('./advanced-cache.cjs');
var cache = require('./cache.cjs');
var eventEmitter = require('./event-emitter.cjs');
var fastSerializer = require('./fast-serializer.cjs');
var helpers = require('./helpers.cjs');
var performanceMonitor = require('./performance-monitor.cjs');
var validation = require('./validation.cjs');



exports.AdaptiveCache = advancedCache.AdaptiveCache;
exports.CacheAnalyzer = advancedCache.CacheAnalyzer;
exports.CacheWarmer = advancedCache.CacheWarmer;
exports.MultiLevelCache = advancedCache.MultiLevelCache;
exports.LRUCache = cache.LRUCache;
exports.ObjectPool = cache.ObjectPool;
exports.fastHash = cache.fastHash;
exports.EventEmitter = eventEmitter.EventEmitter;
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
exports.EnhancedPerformanceMonitor = performanceMonitor.EnhancedPerformanceMonitor;
exports.measureAsyncPerformance = performanceMonitor.measureAsyncPerformance;
exports.measurePerformance = performanceMonitor.measurePerformance;
exports.performanceMonitor = performanceMonitor.performanceMonitor;
exports.Assert = validation.Assert;
exports.AssertionError = validation.AssertionError;
exports.ErrorHandler = validation.ErrorHandler;
exports.StoreConfigValidator = validation.StoreConfigValidator;
exports.TypeGuards = validation.TypeGuards;
exports.ValidationError = validation.ValidationError;
exports.Validator = validation.Validator;
exports.safeJsonParse = validation.safeJsonParse;
exports.safeJsonStringify = validation.safeJsonStringify;
//# sourceMappingURL=index.cjs.map
