/**
 * 高性能缓存工具
 * 提供 LRU 缓存、快速哈希、对象池等优化功能
 */
/**
 * LRU 缓存管理器
 * 使用双向链表 + Map 实现 O(1) 时间复杂度的 LRU 缓存
 */
export declare class LRUCache<K = string, V = any> {
    private cache;
    private head;
    private tail;
    private maxSize;
    private defaultTTL;
    private cleanupTimer?;
    constructor(maxSize?: number, defaultTTL?: number);
    /**
     * 设置缓存
     */
    set(key: K, value: V, ttl?: number): void;
    /**
     * 获取缓存
     */
    get(key: K): V | undefined;
    /**
     * 检查缓存是否存在且未过期
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
     * 获取缓存大小
     */
    size(): number;
    /**
     * 获取所有键
     */
    keys(): K[];
    /**
     * 销毁缓存，清理资源
     */
    dispose(): void;
    /**
     * 添加节点到头部
     */
    private addToHead;
    /**
     * 移除节点
     */
    private removeNode;
    /**
     * 移动节点到头部
     */
    private moveToHead;
    /**
     * 移除尾部节点
     */
    private removeTail;
    /**
     * 删除指定键
     */
    private remove;
    /**
     * 启动定期清理
     */
    private startCleanup;
    /**
     * 清理过期缓存
     */
    private cleanup;
}
/**
 * 快速哈希函数
 * 使用 FNV-1a 算法，比 JSON.stringify 快得多
 */
export declare function fastHash(value: any): string;
/**
 * 对象池（优化版：预分配对象，减少运行时创建开销）
 * 复用对象以减少 GC 压力
 */
export declare class ObjectPool<T> {
    private pool;
    private factory;
    private reset;
    private maxSize;
    private preallocateSize;
    constructor(factory: () => T, reset: (obj: T) => void, maxSize?: number, preallocateSize?: number);
    /**
     * 预分配对象（性能优化）
     */
    private preallocate;
    /**
     * 获取对象
     */
    acquire(): T;
    /**
     * 释放对象
     */
    release(obj: T): void;
    /**
     * 清空对象池
     */
    clear(): void;
    /**
     * 获取池大小
     */
    size(): number;
}
