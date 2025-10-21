/**
 * 智能预加载模块
 * 基于用户行为模式和优先级智能预加载数据
 *
 * @module SmartPreloader
 */
/**
 * 预加载优先级
 */
export declare enum PreloadPriority {
    /** 高优先级 - 立即加载 */
    HIGH = "high",
    /** 中优先级 - 空闲时加载 */
    MEDIUM = "medium",
    /** 低优先级 - 延迟加载 */
    LOW = "low"
}
/**
 * 预加载策略
 */
export declare enum PreloadStrategy {
    /** 预测性预加载 - 基于用户行为模式 */
    PREDICTIVE = "predictive",
    /** 路由预加载 - 基于路由变化 */
    ROUTE_BASED = "route-based",
    /** 时间预加载 - 基于时间触发 */
    TIME_BASED = "time-based",
    /** 可见性预加载 - 基于元素可见性 */
    VISIBILITY = "visibility"
}
/**
 * 预加载任务
 */
export interface PreloadTask<T = any> {
    /** 任务ID */
    id: string;
    /** 任务名称 */
    name: string;
    /** 加载函数 */
    loader: () => Promise<T>;
    /** 优先级 */
    priority: PreloadPriority;
    /** 策略 */
    strategy: PreloadStrategy;
    /** 依赖任务 */
    dependencies?: string[];
    /** 缓存时间（毫秒） */
    cacheDuration?: number;
    /** 重试次数 */
    retries?: number;
    /** 超时时间（毫秒） */
    timeout?: number;
}
/**
 * 预加载结果
 */
export interface PreloadResult<T = any> {
    /** 任务ID */
    id: string;
    /** 数据 */
    data: T | null;
    /** 是否成功 */
    success: boolean;
    /** 错误信息 */
    error?: Error;
    /** 加载时间（毫秒） */
    loadTime: number;
    /** 缓存时间戳 */
    cachedAt?: number;
}
/**
 * 智能预加载器
 */
export declare class SmartPreloader {
    private tasks;
    private results;
    private queue;
    private loading;
    private patterns;
    private currentRoute;
    private routeStartTime;
    /**
     * 注册预加载任务
     */
    register<T = any>(task: PreloadTask<T>): void;
    /**
     * 批量注册任务
     */
    registerBatch(tasks: PreloadTask[]): void;
    /**
     * 取消注册任务
     */
    unregister(taskId: string): void;
    /**
     * 预加载任务
     */
    preload(taskId: string): Promise<PreloadResult | null>;
    /**
     * 批量预加载
     */
    preloadBatch(taskIds: string[]): Promise<PreloadResult[]>;
    /**
     * 根据优先级预加载
     */
    preloadByPriority(priority: PreloadPriority): Promise<void>;
    /**
     * 智能预加载 - 基于用户行为模式
     */
    smartPreload(currentRoute: string): Promise<void>;
    /**
     * 获取预加载结果
     */
    getResult<T = any>(taskId: string): PreloadResult<T> | null;
    /**
     * 清除缓存
     */
    clearCache(taskId?: string): void;
    /**
     * 执行加载
     */
    private executeLoad;
    /**
     * 等待加载完成
     */
    private waitForLoad;
    /**
     * 获取缓存结果
     */
    private getCached;
    /**
     * 更新行为模式
     */
    private updatePattern;
    /**
     * 预测下一步路由
     */
    private predictNextRoutes;
    /**
     * 空闲时加载
     */
    private scheduleIdleLoad;
    /**
     * 延迟加载
     */
    private scheduleDelayedLoad;
    /**
     * 获取优先级值
     */
    private getPriorityValue;
}
/**
 * 创建智能预加载器
 */
export declare function createSmartPreloader(): SmartPreloader;
