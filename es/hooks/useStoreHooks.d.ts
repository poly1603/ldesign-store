import type { Store } from 'pinia';
import type { ComputedRef, Ref } from 'vue';
/**
 * 通用 Store Hook
 * 提供对任意 Pinia Store 的 Hook 式访问
 */
export declare function useStoreHook<T extends Store>(store: T): {
    store: T;
    state: Ref<T["$state"], T["$state"]>;
    reset: () => void;
    patch: (partialState: Partial<T["$state"]>) => void;
    subscribe: (callback: (mutation: any, state: T["$state"]) => void) => () => void;
    onAction: (callback: (context: any) => void) => () => void;
    cleanup: () => void;
};
/**
 * 状态选择器 Hook
 * 从 Store 中选择特定的状态片段
 */
export declare function useSelector<T extends Store, R>(store: T, selector: (state: T['$state']) => R): ComputedRef<R>;
/**
 * 状态变化监听 Hook
 */
export declare function useStateWatch<T extends Store>(store: T, callback: (newState: T['$state'], oldState: T['$state']) => void, options?: {
    deep?: boolean;
    immediate?: boolean;
}): import("vue").WatchHandle;
/**
 * Action 执行状态 Hook
 */
export declare function useActionState<T extends (...args: any[]) => any>(action: T): {
    loading: Ref<boolean>;
    error: Ref<Error | null>;
    data: Ref<ReturnType<T> | null>;
    execute: (...args: Parameters<T>) => Promise<ReturnType<T>>;
    reset: () => void;
};
/**
 * 防抖 Hook
 */
export declare function useDebounce<T>(value: Ref<T>, delay: number): ComputedRef<T>;
/**
 * 节流 Hook
 */
export declare function useThrottle<T>(value: Ref<T>, interval: number): ComputedRef<T>;
/**
 * 本地存储同步 Hook
 */
export declare function useLocalStorage<T>(key: string, defaultValue: T): {
    value: Ref<T>;
    save: () => void;
    load: () => void;
    remove: () => void;
};
/**
 * 会话存储同步 Hook
 */
export declare function useSessionStorage<T>(key: string, defaultValue: T): {
    value: Ref<T>;
    save: () => void;
    load: () => void;
    remove: () => void;
};
