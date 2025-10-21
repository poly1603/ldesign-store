import type { ComputedRef, Ref } from 'vue';
import type { ActionDefinition, GetterDefinition, StateDefinition, UseStoreReturn } from '../types';
/**
 * 创建 Store 的 Hook 工厂函数
 * 提供类似 React Hook 的使用方式
 */
export declare function createStore<TState extends StateDefinition = StateDefinition, TActions extends ActionDefinition = ActionDefinition, TGetters extends GetterDefinition = GetterDefinition>(id: string, setup: () => {
    state: TState;
    actions: TActions;
    getters: TGetters;
}): () => UseStoreReturn<TState, TActions, TGetters>;
/**
 * 创建简单状态的 Hook
 */
export declare function createState<T>(initialValue: T): () => {
    value: Ref<T>;
    setValue: (newValue: T | ((oldValue: T) => T)) => void;
    reset: () => void;
};
/**
 * 创建计算属性的 Hook
 */
export declare function createComputed<T>(getter: () => T): () => {
    value: ComputedRef<T>;
    refresh: () => void;
};
/**
 * 创建异步 Action 的 Hook
 */
export declare function createAsyncAction<T extends (...args: any[]) => Promise<any>>(action: T): () => {
    execute: T;
    loading: Ref<boolean>;
    error: Ref<Error | null>;
    data: Ref<Awaited<ReturnType<T>> | null>;
    reset: () => void;
};
/**
 * 创建持久化状态的 Hook
 */
export declare function createPersistedState<T>(key: string, initialValue: T, storage?: Storage): () => {
    value: Ref<T>;
    setValue: (newValue: T | ((oldValue: T) => T)) => void;
    reset: () => void;
    save: () => void;
    load: () => void;
    clear: () => void;
};
