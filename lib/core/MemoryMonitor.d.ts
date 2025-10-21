/**
 * 内存监控器
 * 实时监控Store和缓存的内存使用情况，并提供分析报告
 */
import type { BaseStore } from './BaseStore';
/**
 * 内存使用信息
 */
export interface MemoryUsageInfo {
    storeInstances: number;
    cacheEntries: number;
    estimatedSize: number;
    timestamp: number;
    details: {
        stores: Map<string, number>;
        caches: Map<string, number>;
    };
}
/**
 * 内存泄漏检测结果
 */
export interface MemoryLeakDetection {
    suspected: boolean;
    growthRate: number;
    recommendations: string[];
    problematicStores: string[];
    problematicCaches: string[];
}
/**
 * 内存监控器配置
 */
export interface MemoryMonitorConfig {
    enabled?: boolean;
    sampleInterval?: number;
    historySize?: number;
    alertThreshold?: number;
    autoCleanup?: boolean;
    gcInterval?: number;
}
/**
 * 内存监控器
 */
export declare class MemoryMonitor {
    private static instance;
    private config;
    private history;
    private monitoringTimer?;
    private gcTimer?;
    private storeReferences;
    private cacheReferences;
    private performanceMonitor;
    private listeners;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(config?: MemoryMonitorConfig): MemoryMonitor;
    /**
     * 开始监控
     */
    start(): void;
    /**
     * 停止监控
     */
    stop(): void;
    /**
     * 注册Store实例
     */
    registerStore(store: BaseStore): void;
    /**
     * 注册缓存实例
     */
    registerCache(cache: object, estimatedSize: number): void;
    /**
     * 采样内存使用情况
     */
    private sample;
    /**
     * 收集内存使用信息
     */
    private collectMemoryUsage;
    /**
     * 估算内存大小
     */
    private estimateMemorySize;
    /**
     * 处理内存警报
     */
    private handleMemoryAlert;
    /**
     * 执行垃圾回收
     */
    private performGarbageCollection;
    /**
     * 检测内存泄漏
     */
    detectMemoryLeak(): MemoryLeakDetection;
    /**
     * 获取内存使用报告
     */
    getMemoryReport(): {
        current: MemoryUsageInfo | null;
        history: MemoryUsageInfo[];
        trend: 'stable' | 'growing' | 'shrinking';
        leakDetection: MemoryLeakDetection;
    };
    /**
     * 分析内存趋势
     */
    private analyzeTrend;
    /**
     * 订阅内存使用更新
     */
    subscribe(listener: (info: MemoryUsageInfo) => void): () => void;
    /**
     * 通知监听器
     */
    private notifyListeners;
    /**
     * 清理历史记录
     */
    clearHistory(): void;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<MemoryMonitorConfig>): void;
    /**
     * 销毁监控器
     */
    dispose(): void;
}
/**
 * 获取内存监控器实例
 */
export declare function useMemoryMonitor(config?: MemoryMonitorConfig): MemoryMonitor;
