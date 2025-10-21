/**
 * 高级缓存工具
 * 提供缓存预热、缓存分析、自适应缓存等高级功能
 */
import { LRUCache } from './cache';
/**
 * 缓存统计信息
 */
export interface CacheStats {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    evictions: number;
    operations: number;
}
/**
 * 缓存分析器
 * 提供缓存命中率分析和性能监控
 */
export declare class CacheAnalyzer<K = string, V = any> {
    private hits;
    private misses;
    private evictions;
    private operations;
    private accessPattern;
    private cache;
    constructor(cache: LRUCache<K, V>);
    /**
     * 记录缓存命中
     */
    recordHit(key: K): void;
    /**
     * 记录缓存未命中
     */
    recordMiss(key: K): void;
    /**
     * 记录缓存淘汰
     */
    recordEviction(): void;
    /**
     * 记录访问模式
     */
    private recordAccess;
    /**
     * 获取统计信息
     */
    getStats(): CacheStats;
    /**
     * 获取热门键（最频繁访问）
     */
    getHotKeys(limit?: number): K[];
    /**
     * 重置统计信息
     */
    reset(): void;
    /**
     * 获取访问频率
     */
    getAccessFrequency(key: K): number;
}
/**
 * 自适应缓存
 * 根据访问模式自动调整缓存策略
 */
export declare class AdaptiveCache<K = string, V = any> {
    private cache;
    private analyzer;
    private minSize;
    private maxSize;
    private targetHitRate;
    private adjustmentTimer?;
    constructor(initialSize?: number, minSize?: number, maxSize?: number, targetHitRate?: number, defaultTTL?: number);
    /**
     * 设置缓存
     */
    set(key: K, value: V, ttl?: number): void;
    /**
     * 获取缓存
     */
    get(key: K): V | undefined;
    /**
     * 检查是否存在
     */
    has(key: K): boolean;
    /**
     * 删除缓存
     */
    delete(key: K): boolean;
    /**
     * 清空缓存
     */
    clear(): void;
    /**
     * 获取统计信息
     */
    getStats(): CacheStats;
    /**
     * 获取热门键
     */
    getHotKeys(limit?: number): K[];
    /**
     * 启动自动调整
     */
    private startAutoAdjustment;
    /**
     * 根据命中率调整缓存大小
     */
    private adjustCacheSize;
    /**
     * 调整缓存大小
     */
    private resizeCache;
    /**
     * 销毁缓存
     */
    dispose(): void;
}
/**
 * 缓存预热器
 * 预先加载热门数据到缓存
 */
export declare class CacheWarmer<K = string, V = any> {
    private cache;
    private warmupTasks;
    constructor(cache: LRUCache<K, V> | AdaptiveCache<K, V>);
    /**
     * 注册预热任务
     */
    register(key: K, loader: () => Promise<V> | V): void;
    /**
     * 批量注册预热任务
     */
    registerBatch(tasks: Map<K, () => Promise<V> | V>): void;
    /**
     * 执行预热
     */
    warmup(keys?: K[]): Promise<void>;
    /**
     * 并发预热（限制并发数）
     */
    warmupConcurrent(keys?: K[], concurrency?: number): Promise<void>;
    /**
     * 清除预热任务
     */
    clear(): void;
}
/**
 * 多级缓存
 * 实现 L1（内存）+ L2（持久化）两级缓存
 */
export declare class MultiLevelCache<K = string, V = any> {
    private l1Cache;
    private l2Storage?;
    private l2Prefix;
    private serializer;
    constructor(l1Size?: number, l1TTL?: number, l2Storage?: Storage, l2Prefix?: string, serializer?: {
        serialize: {
            (value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
            (value: any, replacer?: (number | string)[] | null, space?: string | number): string;
        };
        deserialize: (text: string, reviver?: (this: any, key: string, value: any) => any) => any;
    });
    /**
     * 设置缓存（同时写入 L1 和 L2）
     */
    set(key: K, value: V, ttl?: number): void;
    /**
     * 获取缓存（先从 L1，再从 L2）
     */
    get(key: K): V | undefined;
    /**
     * 检查是否存在
     */
    has(key: K): boolean;
    /**
     * 删除缓存
     */
    delete(key: K): boolean;
    /**
     * 清空缓存
     */
    clear(): void;
    /**
     * 销毁缓存
     */
    dispose(): void;
}
