/**
 * 性能优化器
 * 提供状态持久化、缓存、防抖等性能优化功能
 */
import type { PersistOptions } from '../types';
/**
 * 缓存管理器
 * 使用 LRU 缓存策略，自动淘汰最少使用的条目
 */
export declare class CacheManager {
    private cache;
    constructor(maxSize?: number, defaultTTL?: number);
    /**
     * 设置缓存
     */
    set(key: string, value: any, ttl?: number): void;
    /**
     * 获取缓存
     */
    get(key: string): any;
    /**
     * 检查缓存是否存在
     */
    has(key: string): boolean;
    /**
     * 删除缓存
     */
    delete(key: string): boolean;
    /**
     * 清空缓存
     */
    clear(): void;
    /**
     * 获取缓存大小
     */
    size(): number;
    /**
     * 清理过期缓存（LRU 缓存会自动清理）
     */
    cleanup(): void;
    /**
     * 销毁缓存管理器
     */
    dispose(): void;
}
/**
 * 持久化管理器
 */
export declare class PersistenceManager {
    private storage;
    private serializer;
    constructor(options?: PersistOptions);
    /**
     * 保存状态（优化版：减少序列化开销）
     */
    save(key: string, state: any, paths?: string[]): void;
    /**
     * 加载状态
     */
    load(key: string): any;
    /**
     * 删除持久化状态
     */
    remove(key: string): void;
    /**
     * 清空所有持久化状态
     */
    clear(): void;
}
/**
 * 防抖管理器
 */
export declare class DebounceManager {
    private timers;
    /**
     * 防抖执行
     */
    debounce<T extends (...args: any[]) => any>(key: string, fn: T, delay: number): (...args: Parameters<T>) => Promise<ReturnType<T>>;
    /**
     * 取消防抖
     */
    cancel(key: string): void;
    /**
     * 清空所有防抖
     */
    clear(): void;
}
/**
 * 节流管理器
 */
export declare class ThrottleManager {
    private lastExecution;
    /**
     * 节流执行
     */
    throttle<T extends (...args: any[]) => any>(key: string, fn: T, delay: number): (...args: Parameters<T>) => ReturnType<T> | undefined;
    /**
     * 重置节流状态
     */
    reset(key: string): void;
    /**
     * 清空所有节流状态
     */
    clear(): void;
}
/**
 * 性能优化器主类
 */
export declare class PerformanceOptimizer {
    readonly cache: CacheManager;
    readonly persistence: PersistenceManager;
    readonly debounce: DebounceManager;
    readonly throttle: ThrottleManager;
    constructor(options?: {
        cache?: {
            maxSize?: number;
            defaultTTL?: number;
        };
        persistence?: PersistOptions;
    });
    /**
     * 清理所有资源
     */
    dispose(): void;
    /**
     * 清空所有缓存（向后兼容）
     */
    clear(): void;
}
