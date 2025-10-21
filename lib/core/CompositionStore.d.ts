/**
 * Composition API 风格的 Store
 * 提供类似 Vue 3 Composition API 的 Store 定义方式
 */
import type { Store, StoreDefinition } from 'pinia';
import type { ComputedRef, Ref, UnwrapNestedRefs } from 'vue';
import type { CacheOptions, PersistOptions } from '../types';
import { onUnmounted, watch } from 'vue';
/**
 * Composition Store 上下文
 */
export interface CompositionStoreContext {
    state: <T>(initialValue: T) => Ref<T>;
    computed: <T>(getter: () => T) => ComputedRef<T>;
    reactive: <T extends object>(obj: T) => UnwrapNestedRefs<T>;
    watch: typeof watch;
    onUnmounted: typeof onUnmounted;
    cache: {
        get: (key: string) => any;
        set: (key: string, value: any, ttl?: number) => void;
        delete: (key: string) => boolean;
        clear: () => void;
    };
    persist: {
        save: () => void;
        load: () => void;
        clear: () => void;
    };
}
/**
 * Composition Store 设置函数类型
 */
export type CompositionStoreSetup<T = any> = (context: CompositionStoreContext) => T;
/**
 * Composition Store 选项
 */
export interface CompositionStoreOptions {
    id: string;
    persist?: boolean | PersistOptions;
    cache?: CacheOptions;
    devtools?: boolean;
}
/**
 * Composition Store 实例
 */
export interface CompositionStoreInstance<T = any> {
    readonly $id: string;
    readonly $state: T;
    $reset: () => void;
    $patch: ((partialState: Partial<T>) => void) & ((mutator: (state: T) => void) => void);
    $subscribe: (callback: (mutation: any, state: T) => void, options?: {
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
    getStore: () => Store<string, any, any, any>;
    getStoreDefinition: () => StoreDefinition<string, any, any, any>;
}
/**
 * 创建 Composition Store
 */
export declare function createCompositionStore<T = any>(options: CompositionStoreOptions, setup: CompositionStoreSetup<T>): () => CompositionStoreInstance<T>;
/**
 * 简化的 Composition Store 创建器
 */
export declare function defineCompositionStore<T = any>(id: string, setup: CompositionStoreSetup<T>): () => CompositionStoreInstance<T>;
/**
 * 带配置的 Composition Store 创建器
 */
export declare function defineCompositionStoreWithOptions<T = any>(options: CompositionStoreOptions, setup: CompositionStoreSetup<T>): () => CompositionStoreInstance<T>;
