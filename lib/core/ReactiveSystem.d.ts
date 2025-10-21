/**
 * 高性能响应式系统
 * 提供批量更新、智能缓存、虚拟代理等优化功能
 */
import type { ReactiveEffect, UnwrapRef } from 'vue';
/**
 * 批量更新管理器
 * 将多个状态更新合并为一次，减少渲染次数
 */
export declare class BatchUpdateManager {
    private static instance;
    private updateQueue;
    private isFlushPending;
    private flushPromise;
    static getInstance(): BatchUpdateManager;
    /**
     * 添加更新到队列
     */
    queueUpdate(updater: () => void): void;
    /**
     * 调度刷新 - 使用queueMicrotask优化性能
     */
    private scheduleFlush;
    /**
     * 执行所有更新（优化版：减少迭代开销）
     */
    private flush;
    /**
     * 等待所有更新完成
     */
    waitForFlush(): Promise<void>;
    /**
     * 立即执行所有更新
     */
    flushSync(): void;
}
/**
 * 智能缓存管理器
 * 使用WeakMap避免内存泄漏
 */
export declare class SmartCacheManager<K extends object = object, V = any> {
    private cache;
    private ttl;
    private maxSize?;
    private accessCount;
    constructor(ttl?: number, maxSize?: number);
    /**
     * 获取缓存值
     */
    get(key: K): V | undefined;
    /**
     * 设置缓存值
     */
    set(key: K, value: V): void;
    /**
     * 删除缓存
     */
    delete(key: K): boolean;
    /**
     * 清空缓存
     */
    clear(): void;
    /**
     * 获取或设置缓存
     */
    getOrSet(key: K, factory: () => V): V;
}
/**
 * 虚拟代理模式
 * 延迟初始化和按需加载
 */
export declare class VirtualProxy<T extends object> {
    private target;
    private factory;
    private isInitialized;
    private initPromise;
    constructor(factory: () => T | Promise<T>);
    /**
     * 获取代理对象
     */
    getProxy(): T;
    /**
     * 初始化目标对象
     */
    private initialize;
    /**
     * 强制初始化
     */
    forceInit(): Promise<T>;
    /**
     * 是否已初始化
     */
    get initialized(): boolean;
}
/**
 * 计算属性优化器
 * 智能缓存计算结果
 */
export declare class ComputedOptimizer<T = any> {
    private cache;
    private isDirty;
    private deps;
    private getter;
    private setter?;
    constructor(getter: () => T, setter?: (value: T) => void);
    /**
     * 获取计算值
     */
    get value(): T;
    /**
     * 设置计算值
     */
    set value(newValue: T);
    /**
     * 标记为脏数据
     */
    invalidate(): void;
    /**
     * 创建响应式计算属性
     */
    toRef(): import("vue").Ref<T, T>;
}
/**
 * 响应式状态优化器
 */
export declare class ReactiveOptimizer {
    private batchManager;
    private computedCache;
    private proxyCache;
    /**
     * 创建优化的响应式状态
     */
    createOptimizedReactive<T extends object>(target: T): UnwrapRef<T>;
    /**
     * 创建浅响应式状态
     */
    createShallowReactive<T>(value: T): {
        value: any;
        setValue(newValue: T): void;
        trigger(): void;
    };
    /**
     * 创建只读状态
     */
    createReadonly<T extends object>(target: T): Readonly<T>;
    /**
     * 批量更新状态
     */
    batchUpdate(updater: () => void): void;
    /**
     * 同步批量更新
     */
    batchUpdateSync(updater: () => void): void;
    /**
     * 创建优化的计算属性
     */
    createComputed<T>(getter: () => T, setter?: (value: T) => void): ComputedOptimizer<T>;
    /**
     * 创建虚拟代理
     */
    createVirtualProxy<T extends object>(factory: () => T | Promise<T>): T;
}
/**
 * 内存管理器
 * 自动清理未使用的响应式对象
 */
export declare class MemoryManager {
    private cleanupCallbacks;
    private registry;
    private weakRefs;
    private cleanupTimers;
    /**
     * 注册对象进行自动清理
     */
    register(obj: object, id: string, cleanup?: () => void): void;
    /**
     * 手动清理对象
     */
    unregister(obj: object): void;
    /**
     * 调度清理检查
     */
    private scheduleCleanup;
    /**
     * 执行清理
     */
    private performCleanup;
    /**
     * 清理所有资源
     */
    dispose(): void;
}
/**
 * 依赖追踪器
 * 优化依赖收集和触发
 */
export declare class DependencyTracker {
    private dependencies;
    private effectScopes;
    /**
     * 收集依赖
     */
    track(target: object, key: string, effect: ReactiveEffect): void;
    /**
     * 触发更新（优化版：减少 Set 复制开销）
     */
    trigger(target: object, key: string): void;
    /**
     * 清理依赖
     */
    cleanup(target: object, key?: string): void;
    /**
     * 生成唯一标识
     */
    private getTargetKey;
}
export declare const batchUpdateManager: BatchUpdateManager;
export declare const reactiveOptimizer: ReactiveOptimizer;
export declare const memoryManager: MemoryManager;
export declare const dependencyTracker: DependencyTracker;
export declare function batchUpdate(updater: () => void): void;
export declare function batchUpdateSync(updater: () => void): void;
export declare function waitForUpdates(): Promise<void>;
