/**
  *  @ldesign/store  -  现代化的  Vue  状态管理库
  *
  *  基于  Pinia  构建，提供装饰器、Hooks、类型安全等现代化特性
  *  支持多种使用方式：装饰器、函数式、Composition  API
  */
import 'reflect-metadata';
export * from './core';
export * from './decorators';
export { ConsoleFormatter, DevToolsConnection, StoreDevTools, VisualInspector } from './DevTools';
export * from './engine';
export * from './hooks';
export { PerformanceMonitor } from './PerformanceMonitoring';
export type { ActionContext, ActionDefinition, CacheOptions, DecoratorMetadata, GetterDefinition, IBaseStore, MutationCallback, PersistOptions, StateDefinition, StoreOptions, StrictActionDefinition, StrictGetterDefinition, StrictStateDefinition, } from './types';
export type { CacheStrategy, InferActions, InferGetters, InferState, ProviderOptions, SafeActionDefinition, SafeGetterDefinition, SafeStateDefinition, UseStoreReturn, } from './types';
export type { AbstractClass, AnyFunction, AnyObject, ArrayElement, ArrayType, AsyncFunction, Class, DeepMerge, DeepMutable, DeepPartial, DeepReadonly, DeepRequired, EmptyObject, Equals, Flatten, FunctionArgs, FunctionKeys, FunctionReturn, If, JSONArray, JSONObject, JSONValue, KeyOf, KeysOfType, Maybe, Merge, Mutable, NonFunctionKeys, NonPrimitive, Nullable, NullableBy, Optional, OptionalBy, OptionalKeys, Override, PartialBy, PathsOf, PathValue, Primitive, ReadonlyBy, RequiredBy, RequiredKeys, Serializable, ValueOf, WritableBy, } from './types/utility-types';
export { AdaptiveCache, CacheAnalyzer, CacheWarmer, MultiLevelCache, } from './utils/advanced-cache';
export type { CacheStats, } from './utils/advanced-cache';
export { fastHash, LRUCache, ObjectPool, } from './utils/cache';
export type { ICache, IStatisticalCache, IWarmableCache, } from "./utils/cache-interface";
export { fastEqual, fastParse, fastStringify, safeCopy, shallowCopy, } from './utils/fast-serializer';
export { batch, chunk, debounce, deepClone, deepEqual, deepFreeze, deepMerge, delay, deleteDeepValue, flattenObject, formatBytes, formatDuration, generateId, getDeepValue, groupBy, memoize, omit, pick, pLimit, retry, safeEntries, safeKeys, safeValues, setDeepValue, throttle, unflattenObject, unique, } from './utils/helpers';
export { Assert, AssertionError, ErrorHandler, safeJsonParse, safeJsonStringify, StoreConfigValidator, TypeGuards, ValidationError, Validator, } from './utils/validation';
export type { ValidationResult, ValidationRule, } from './utils/validation';
export declare const version = "0.1.0";
export * from './vue';
