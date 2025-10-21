/**
 * 增强版性能优化模块
 * 提供懒加载、预加载、内存管理、并发控制等高级性能优化功能
 */
/**
 * 懒加载管理器
 * 支持按需加载数据，减少初始加载时间
 */
export declare class LazyLoadManager<T = any> {
    private loaders;
    private cache;
    private loading;
    /**
     * 注册懒加载器
     */
    register(key: string, loader: () => Promise<T>): void;
    /**
     * 加载数据
     */
    load(key: string): Promise<T>;
    /**
     * 预加载数据
     */
    preload(keys: string[]): Promise<void>;
    /**
     * 清除缓存
     */
    clear(key?: string): void;
    /**
     * 是否已加载
     */
    isLoaded(key: string): boolean;
    /**
     * 是否正在加载
     */
    isLoading(key: string): boolean;
}
/**
 * 预加载管理器
 * 支持预测性加载，提前加载可能需要的数据
 */
export declare class PreloadManager {
    private queue;
    private isProcessing;
    private maxConcurrent;
    private activeCount;
    constructor(options?: {
        maxConcurrent?: number;
    });
    /**
     * 添加预加载任务
     */
    add(task: () => Promise<any>, priority?: number): void;
    /**
     * 处理预加载队列
     */
    private process;
    /**
     * 清空队列
     */
    clear(): void;
    /**
     * 获取队列大小
     */
    get size(): number;
}
/**
 * 内存管理器
 * 监控和管理内存使用，防止内存泄漏
 */
export declare class MemoryManager {
    private references;
    private weakReferences;
    private memoryLimit;
    private checkInterval;
    constructor(options?: {
        memoryLimit?: number;
        autoCleanup?: boolean;
    });
    /**
     * 注册对象引用
     */
    register(key: string, value: any): void;
    /**
     * 获取对象引用
     */
    get(key: string): any;
    /**
     * 清理无效引用
     */
    cleanup(): void;
    /**
     * 开始自动清理
     */
    startAutoCleanup(interval?: number): void;
    /**
     * 停止自动清理
     */
    stopAutoCleanup(): void;
    /**
     * 获取内存使用估算
     */
    estimateMemoryUsage(): number;
    /**
     * 估算对象大小
     */
    private estimateSize;
    /**
     * 检查内存限制
     */
    checkMemoryLimit(): boolean;
}
/**
 * 并发控制器
 * 控制并发操作数量，防止资源过度消耗
 */
export declare class ConcurrencyController {
    private queue;
    private activeCount;
    private maxConcurrent;
    constructor(maxConcurrent?: number);
    /**
     * 执行任务
     */
    execute<T>(task: () => Promise<T>): Promise<T>;
    /**
     * 处理队列
     */
    private process;
    /**
     * 获取活跃任务数
     */
    getActiveCount(): number;
    /**
     * 获取队列长度
     */
    getQueueLength(): number;
    /**
     * 清空队列
     */
    clear(): void;
    /**
     * 更新最大并发数
     */
    setMaxConcurrent(max: number): void;
}
/**
 * 虚拟化管理器
 * 支持大数据集的虚拟化处理，减少DOM渲染压力
 */
export declare class VirtualizationManager<T = any> {
    private data;
    private pageSize;
    private currentPage;
    private totalPages;
    constructor(options?: {
        pageSize?: number;
    });
    /**
     * 设置数据
     */
    setData(data: T[]): void;
    /**
     * 获取当前页数据
     */
    getCurrentPage(): T[];
    /**
     * 获取指定页数据
     */
    getPage(page: number): T[];
    /**
     * 下一页
     */
    nextPage(): T[] | null;
    /**
     * 上一页
     */
    prevPage(): T[] | null;
    /**
     * 跳转到指定页
     */
    goToPage(page: number): T[];
    /**
     * 获取可见范围数据
     */
    getVisibleRange(start: number, end: number): T[];
    /**
     * 获取元信息
     */
    getMetadata(): {
        currentPage: number;
        totalPages: number;
        pageSize: number;
        totalItems: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
/**
 * 计算优化器
 * 优化复杂计算，避免重复计算
 */
export declare class ComputationOptimizer {
    private computations;
    /**
     * 注册计算函数
     */
    register(key: string, fn: (...args: any[]) => any, ttl?: number): void;
    /**
     * 执行计算
     */
    compute(key: string, ...args: any[]): any;
    /**
     * 清除缓存
     */
    clearCache(key?: string): void;
    /**
     * 移除计算函数
     */
    unregister(key: string): boolean;
}
/**
 * 请求合并器
 * 合并相同的请求，减少网络开销
 */
export declare class RequestMerger {
    private pending;
    private cache;
    private ttl;
    constructor(options?: {
        ttl?: number;
    });
    /**
     * 执行请求
     */
    execute<T>(key: string, request: () => Promise<T>, options?: {
        force?: boolean;
        ttl?: number;
    }): Promise<T>;
    /**
     * 清除缓存
     */
    clearCache(key?: string): void;
    /**
     * 取消请求
     */
    cancel(key: string): void;
}
/**
 * 增强版性能优化器
 * 整合所有性能优化功能
 */
export declare class EnhancedPerformanceOptimizer {
    readonly lazyLoad: LazyLoadManager;
    readonly preload: PreloadManager;
    readonly memory: MemoryManager;
    readonly concurrency: ConcurrencyController;
    readonly virtualization: VirtualizationManager;
    readonly computation: ComputationOptimizer;
    readonly requestMerger: RequestMerger;
    constructor(options?: {
        maxConcurrent?: number;
        memoryLimit?: number;
        pageSize?: number;
        requestTTL?: number;
    });
    /**
     * 性能监控
     */
    getMetrics(): {
        memoryUsage: number;
        activeTasks: number;
        queuedTasks: number;
        preloadQueue: number;
    };
    /**
     * 清理所有资源
     */
    dispose(): void;
}
