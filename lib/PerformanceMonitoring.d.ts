/**
 * Performance Monitoring and Analysis System
 * 提供高级性能监控、分析和优化建议
 */
import { EventEmitter } from './utils/event-emitter';
interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    tags?: Record<string, string>;
}
interface PerformanceReport {
    startTime: number;
    endTime: number;
    duration: number;
    metrics: PerformanceMetric[];
    suggestions: string[];
    warnings: string[];
}
interface MemorySnapshot {
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
    customMetrics?: Record<string, number>;
}
export declare class PerformanceMonitor extends EventEmitter {
    private options;
    private metrics;
    private timers;
    private counters;
    private memorySnapshots;
    private isRecording;
    private recordingStartTime;
    private maxMetricsPerKey;
    private slowThreshold;
    constructor(options?: {
        autoStart?: boolean;
        slowThreshold?: number;
        maxMetricsPerKey?: number;
        memoryInterval?: number;
    });
    startRecording(): void;
    stopRecording(): PerformanceReport;
    startTimer(name: string): void;
    endTimer(name: string, tags?: Record<string, string>): number;
    increment(name: string, value?: number): void;
    recordMetric(metric: PerformanceMetric): void;
    takeMemorySnapshot(): MemorySnapshot;
    private memoryMonitorTimer?;
    startMemoryMonitoring(interval?: number): void;
    stopMemoryMonitoring(): void;
    private calculateMemoryGrowth;
    private generateReport;
    private analyzeMetrics;
    clear(): void;
    getMetrics(name?: string): PerformanceMetric[];
    getMetricStats(metricName: string): {
        count: number;
        min: number;
        max: number;
        avg: number;
        p50: number;
        p95: number;
        p99: number;
    } | null;
    private percentile;
    destroy(): void;
}
export declare function measurePerformance(monitor: PerformanceMonitor): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare class AutoPerformanceAnalyzer {
    private options;
    private monitor;
    private analysisInterval?;
    private thresholds;
    constructor(options?: {
        analysisInterval?: number;
        autoFix?: boolean;
        thresholds?: Partial<typeof AutoPerformanceAnalyzer.prototype.thresholds>;
    });
    private setupListeners;
    private startAutoAnalysis;
    analyze(): void;
    private suggestOptimization;
    private attemptMemoryCleanup;
    getMonitor(): PerformanceMonitor;
    destroy(): void;
}
export declare function getDefaultMonitor(): PerformanceMonitor;
export declare function startTimer(name: string): void;
export declare function endTimer(name: string, tags?: Record<string, string>): number;
export declare function recordMetric(metric: PerformanceMetric): void;
export declare function getPerformanceStats(metricName: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
};
export {};
