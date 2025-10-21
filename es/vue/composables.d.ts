import type { Store } from 'pinia';
import type { Ref } from 'vue';
import type { ActionHookReturn, BatchHookReturn, GetterHookReturn, PersistHookReturn, StateHookReturn, StoreHookReturn, UseStoreOptions } from '../types';
/**
 * 使用 Store 的组合式函数
 */
export declare function useStore<T extends Store = Store>(storeId: string, options?: UseStoreOptions): StoreHookReturn<T>;
/**
 * 使用状态的组合式函数
 */
export declare function useState<T = any>(storeId: string, stateKey: string, defaultValue?: T): StateHookReturn<T>;
/**
 * 使用 Action 的组合式函数
 */
export declare function useAction<T extends (...args: any[]) => any>(storeId: string, actionName: string): ActionHookReturn<T>;
/**
 * 使用 Getter 的组合式函数
 */
export declare function useGetter<T = any>(storeId: string, getterName: string): GetterHookReturn<T>;
/**
 * 批量操作的组合式函数
 */
export declare function useBatch(storeId: string): BatchHookReturn;
/**
 * 持久化的组合式函数
 */
export declare function usePersist(storeId: string, key?: string, storage?: Storage): PersistHookReturn;
/**
 * 简化的 Store 使用 Hook
 * 提供更简单的 API 来使用 Store
 */
export declare function useSimpleStore<T extends Store = Store>(storeId: string, options?: UseStoreOptions & {
    /** 是否自动持久化 */
    persist?: boolean;
    /** 持久化存储键 */
    persistKey?: string;
    /** 持久化存储 */
    persistStorage?: Storage;
}): {
    save: () => void;
    load: () => void;
    clear: () => void;
    isPersisted: Ref<boolean, boolean>;
    store: T;
    state: Ref<T["$state"], T["$state"]>;
    reset: () => void;
    patch: (partialState: Partial<T["$state"]>) => void;
    subscribe: (callback: (mutation: any, state: T["$state"]) => void) => () => void;
    onAction: (callback: (context: any) => void) => () => void;
};
/**
 * 响应式状态 Hook
 * 提供更简单的状态管理
 */
export declare function useReactiveState<T = any>(storeId: string, stateKey: string, options?: {
    defaultValue?: T;
    transform?: (value: any) => T;
    validate?: (value: T) => boolean;
}): StateHookReturn<T> & {
    isValid: Ref<boolean>;
    error: Ref<string | null>;
};
/**
 * 异步 Action Hook
 * 提供更好的异步操作体验
 */
export declare function useAsyncAction<T extends (...args: any[]) => Promise<any>>(storeId: string, actionName: string, options?: {
    /** 自动重试次数 */
    retries?: number;
    /** 重试延迟（毫秒） */
    retryDelay?: number;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 成功回调 */
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    /** 错误回调 */
    onError?: (error: Error) => void;
}): ActionHookReturn<T> & {
    retry: () => Promise<ReturnType<T>>;
    cancel: () => void;
    isTimeout: Ref<boolean>;
    retryCount: Ref<number>;
};
/**
 * 计算属性 Hook
 * 提供更强大的计算属性功能
 */
export declare function useComputed<T = any>(storeId: string, getter: (store: Store) => T, options?: {
    /** 是否缓存结果 */
    cache?: boolean;
    /** 缓存时间（毫秒） */
    cacheTime?: number;
    /** 依赖的状态键 */
    deps?: string[];
}): {
    value: import("vue").ComputedRef<T>;
    invalidateCache: () => void;
};
