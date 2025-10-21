/**
 * 函数式 Store 创建器
 * 提供函数式的 Store 定义方式
 */
import type { Store, StoreDefinition } from 'pinia';
import type { ActionDefinition, CacheOptions, GetterDefinition, PersistOptions, StateDefinition } from '../types';
/**
 * 函数式 Store 定义选项
 */
export interface FunctionalStoreOptions<TState extends StateDefinition = StateDefinition, TActions extends ActionDefinition = ActionDefinition, TGetters extends GetterDefinition = GetterDefinition> {
    id: string;
    state: () => TState;
    actions?: TActions;
    getters?: TGetters;
    persist?: boolean | PersistOptions;
    cache?: CacheOptions;
    devtools?: boolean;
}
/**
 * 函数式 Store 实例
 */
export interface FunctionalStoreInstance<TState extends StateDefinition = StateDefinition, TActions extends ActionDefinition = ActionDefinition, TGetters extends GetterDefinition = GetterDefinition> {
    readonly $id: string;
    readonly $state: TState;
    readonly $actions: TActions;
    readonly $getters: TGetters;
    $reset: () => void;
    $patch: ((partialState: Partial<TState>) => void) & ((mutator: (state: TState) => void) => void);
    $subscribe: (callback: (mutation: any, state: TState) => void, options?: {
        detached?: boolean;
    }) => () => void;
    $onAction: (callback: (context: any) => void) => () => void;
    $dispose: () => void;
    $persist: () => void;
    $hydrate: () => void;
    $clearPersisted: () => void;
    $getCache: (key: string) => any;
    $setCache: (key: string, value: any, ttl?: number) => void;
    $deleteCache: (key: string) => boolean;
    $clearCache: () => void;
    getStore: () => Store<string, TState, TGetters, TActions>;
    getStoreDefinition: () => StoreDefinition<string, TState, TGetters, TActions>;
}
/**
 * 创建函数式 Store
 */
export declare function createFunctionalStore<TState extends StateDefinition = StateDefinition, TActions extends ActionDefinition = ActionDefinition, TGetters extends GetterDefinition = GetterDefinition>(options: FunctionalStoreOptions<TState, TActions, TGetters>): () => FunctionalStoreInstance<TState, TActions, TGetters>;
/**
 * 简化的函数式 Store 创建器
 */
export declare function defineStore<TState extends StateDefinition = StateDefinition, TActions extends ActionDefinition = ActionDefinition, TGetters extends GetterDefinition = GetterDefinition>(id: string, state: () => TState, actions?: TActions, getters?: TGetters): () => FunctionalStoreInstance<TState, TActions, TGetters>;
/**
 * 带配置的函数式 Store 创建器
 */
export declare function defineStoreWithOptions<TState extends StateDefinition = StateDefinition, TActions extends ActionDefinition = ActionDefinition, TGetters extends GetterDefinition = GetterDefinition>(options: FunctionalStoreOptions<TState, TActions, TGetters>): () => FunctionalStoreInstance<TState, TActions, TGetters>;
