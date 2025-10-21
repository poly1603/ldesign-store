/**
 * 性能监控工具类
 * 提供更精确和稳定的性能监控功能
 */
export interface PerformanceMetrics {
    /** 执行时间（毫秒） */
    duration: number;
    /** 内存使用情况 */
    memory?: {
        used: number;
        total: number;
        external: number;
    };
    /** 时间戳 */
    timestamp: number;
    /** 操作名称 */
    operation: string;
}
export interface PerformanceStats {
    /** 总执行次数 */
    count: number;
    /** 平均执行时间 */
    avgDuration: number;
    /** 最小执行时间 */
    minDuration: number;
    /** 最大执行时间 */
    maxDuration: number;
    /** 总执行时间 */
    totalDuration: number;
    /** 最后执行时间 */
    lastExecution: number;
}
/**
 * 增强的性能监控器
 */
export declare class EnhancedPerformanceMonitor {
    private metrics;
    private marks;
    private stats;
    /**
     * 标记性能测量点
     */
    mark(name: string): void;
    /**
     * 测量两个标记点之间的性能
     */
    measure(name: string, startMark?: string, endMark?: string): PerformanceMetrics;
    /**
     * 获取内存使用情况
     */
    private getMemoryUsage;
    /**
     * 更新统计信息
     */
    private updateStats;
    /**
     * 获取指定操作的所有指标
     */
    getMetrics(name: string): PerformanceMetrics[];
    /**
     * 获取指定操作的统计信息
     */
    getStats(name: string): PerformanceStats | undefined;
    /**
     * 获取所有统计信息
     */
    getAllStats(): Map<string, PerformanceStats>;
    /**
     * 清理指定操作的数据
     */
    clear(name?: string): void;
    /**
     * 生成性能报告
     */
    generateReport(): string;
    /**
     * 异步测量函数执行性能
     */
    measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
    /**
     * 同步测量函数执行性能
     */
    measureSync<T>(name: string, fn: () => T): T;
}
export declare const performanceMonitor: EnhancedPerformanceMonitor;
export declare function measurePerformance(name?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function measureAsyncPerformance(name?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
