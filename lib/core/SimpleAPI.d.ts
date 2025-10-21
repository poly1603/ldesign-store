/**
 * 简化的Store API
 * 提供更直观的使用方式、自动类型推导、链式调用等功能
 */
import type { StoreDefinition } from 'pinia';
import type { Ref, UnwrapRef } from 'vue';
/**
 * Store 构建器
 * 支持链式调用的流畅API
 */
export declare class StoreBuilder<Id extends string = string, S extends Record<string, any> = Record<string, never>, G extends Record<string, any> = Record<string, never>, A extends Record<string, any> = Record<string, never>> {
    private id;
    private state;
    private getters;
    private actions;
    private persist;
    private devtools;
    private plugins;
    constructor(id: Id);
    /**
     * 添加状态
     */
    useState<K extends string, V>(key: K, initialValue: V | (() => V)): StoreBuilder<Id, S & Record<K, V>, G, A>;
    /**
     * 批量添加状态
     */
    useStates<T extends Record<string, any>>(states: T | (() => T)): StoreBuilder<Id, S & T, G, A>;
    /**
     * 添加计算属性
     */
    useComputed<K extends string, V>(key: K, getter: (state: S & G) => V): StoreBuilder<Id, S, G & Record<K, V>, A>;
    /**
     * 批量添加计算属性
     */
    useComputeds<T extends Record<string, (state: S & G) => any>>(getters: T): StoreBuilder<Id, S, G & {
        [K in keyof T]: ReturnType<T[K]>;
    }, A>;
    /**
     * 添加方法
     */
    useAction<K extends string, F extends (...args: any[]) => any>(key: K, action: (this: S & G & A, ...args: Parameters<F>) => ReturnType<F>): StoreBuilder<Id, S, G, A & Record<K, F>>;
    /**
     * 批量添加方法
     */
    useActions<T extends Record<string, (...args: any[]) => any>>(actions: T): StoreBuilder<Id, S, G, A & T>;
    /**
     * 启用持久化
     */
    usePersist(options?: boolean | PersistOptions): this;
    /**
     * 配置开发工具
     */
    useDevtools(options?: boolean | DevToolsOptions): this;
    /**
     * 添加插件
     */
    usePlugin(plugin: StorePlugin): this;
    /**
     * 构建Store
     */
    build(): SimpleStore<S, G, A>;
}
/**
 * 持久化配置
 */
export interface PersistOptions {
    key?: string;
    storage?: Storage;
    paths?: string[];
    serializer?: {
        serialize: (value: any) => string;
        deserialize: (value: string) => any;
    };
}
/**
 * 开发工具配置
 */
export interface DevToolsOptions {
    name?: string;
    actions?: boolean;
    timeline?: boolean;
}
/**
 * Store 插件
 */
export interface StorePlugin {
    name: string;
    install: (store: any) => void;
}
/**
 * 简化的Store接口
 */
export interface SimpleStore<S extends Record<string, any> = Record<string, never>, G extends Record<string, any> = Record<string, never>, A extends Record<string, any> = Record<string, never>> {
    state: UnwrapRef<S>;
    getters: Readonly<G>;
    actions: A;
    $reset: () => void;
    $patch: (patch: Partial<S> | ((state: S) => void)) => void;
    $subscribe: (callback: (mutation: any, state: S) => void) => () => void;
    $onAction: (callback: (action: any) => void) => () => void;
    $dispose: () => void;
    get: <K extends keyof S>(key: K) => S[K];
    set: <K extends keyof S>(key: K, value: S[K]) => void;
    update: <K extends keyof S>(key: K, updater: (value: S[K]) => S[K]) => void;
    watch: <T>(source: () => T, callback: (value: T) => void) => () => void;
    watchAll: (callback: (state: S) => void) => () => void;
    batch: (updater: () => void) => void;
    transaction: (updater: () => void | Promise<void>) => Promise<void>;
    snapshot: () => S;
    restore: (snapshot: S) => void;
    export: () => string;
    import: (data: string) => void;
}
/**
 * 创建简化的Store
 */
export declare function createSimpleStore<S extends Record<string, any>, G extends Record<string, any>, A extends Record<string, any>>(id: string, options: {
    state: S | (() => S);
    getters?: G;
    actions?: A;
    persist?: boolean | PersistOptions;
    devtools?: boolean | DevToolsOptions;
    plugins?: StorePlugin[];
}): SimpleStore<S, G, A>;
/**
 * 创建Store（快捷函数）
 */
export declare function store<Id extends string>(id: Id): StoreBuilder<Id>;
/**
 * 定义Store（Pinia兼容）
 */
export declare function defineSimpleStore<Id extends string, S extends Record<string, any>, G, A>(id: Id, setup: () => {
    state: S;
    getters?: G;
    actions?: A;
}): StoreDefinition<Id, S, G, A>;
/**
 * 自动类型推导辅助函数
 */
export declare function inferStoreType<T extends SimpleStore<any, any, any>>(store: T): T;
/**
 * 组合多个Store
 */
export declare function combineStores<T extends Record<string, SimpleStore<any, any, any>>>(stores: T): CombinedStore<T>;
/**
 * 组合Store类型
 */
export interface CombinedStore<T extends Record<string, SimpleStore<any, any, any>>> {
    stores: T;
    state: {
        [K in keyof T]: T[K] extends SimpleStore<infer S, any, any> ? S : never;
    };
    resetAll: () => void;
    batch: (updater: () => void) => void;
    snapshot: () => any;
    restore: (snapshot: any) => void;
}
/**
 * 创建异步Store
 */
export declare function createAsyncStore<T>(id: string, loader: () => Promise<T>): AsyncStore<T>;
/**
 * 异步Store类型
 */
export interface AsyncStore<T> {
    loading: Ref<boolean>;
    error: Ref<Error | null>;
    data: Ref<T | null>;
    load: () => Promise<void>;
    reload: () => Promise<void>;
    reset: () => void;
}
/**
 * Store 注册中心（支持依赖注入）
 * 注意：与 core/StoreFactory 不同，这是一个简单的依赖注入容器
 */
export declare class SimpleStoreRegistry {
    private stores;
    /**
     * 注册Store
     */
    register<T>(id: string, factory: () => T): void;
    /**
     * 获取Store
     */
    get<T>(id: string): T;
    /**
     * 检查是否存在
     */
    has(id: string): boolean;
    /**
     * 清空所有Store
     */
    clear(): void;
}
export declare const storeRegistry: SimpleStoreRegistry;
export { store as $ };
