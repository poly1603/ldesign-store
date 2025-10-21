/**
 * 性能监控工具
 * 用于监控和优化 Store 性能
 */
export interface PerformanceMetrics {
    actionExecutionTime: Map<string, number[]>;
    getterComputationTime: Map<string, number[]>;
    stateUpdateCount: Map<string, number>;
    memoryUsage: {
        storeCount: number;
        cacheSize: number;
    };
}
export declare class PerformanceMonitor {
    private static instance;
    private metrics;
    private constructor();
    static getInstance(): PerformanceMonitor;
    /**
     * 记录 Action 执行时间
     */
    recordActionTime(actionName: string, executionTime: number): void;
    /**
     * 记录 Getter 计算时间
     */
    recordGetterTime(getterName: string, computationTime: number): void;
    /**
     * 记录状态更新次数
     */
    recordStateUpdate(stateName: string): void;
    /**
     * 更新内存使用情况
     */
    updateMemoryUsage(storeCount: number, cacheSize: number): void;
    /**
     * 获取性能报告
     */
    getPerformanceReport(): {
        slowActions: Array<{
            name: string;
            avgTime: number;
            maxTime: number;
        }>;
        slowGetters: Array<{
            name: string;
            avgTime: number;
            maxTime: number;
        }>;
        frequentUpdates: Array<{
            name: string;
            count: number;
        }>;
        memoryUsage: PerformanceMetrics['memoryUsage'];
    };
    /**
     * 清理性能数据
     */
    clearMetrics(): void;
    /**
     * 创建性能装饰器
     */
    createPerformanceDecorator(type: 'action' | 'getter'): (_target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
}
/**
 * 性能监控装饰器
 */
export declare const MonitorAction: (_target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const MonitorGetter: (_target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * 获取性能监控实例
 */
export declare function usePerformanceMonitor(): PerformanceMonitor;
/**
 * 性能优化建议
 */
export declare function getOptimizationSuggestions(report: ReturnType<PerformanceMonitor['getPerformanceReport']>): string[];
