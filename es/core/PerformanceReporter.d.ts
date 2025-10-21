/**
 * 性能分析报告生成器
 * 生成详细的性能分析报告，包括内存使用、性能瓶颈、优化建议等
 */
/**
 * 性能报告配置
 */
export interface ReportConfig {
    includeMemory?: boolean;
    includePerformance?: boolean;
    includeStorePool?: boolean;
    includeSuggestions?: boolean;
    format?: 'json' | 'html' | 'markdown';
}
/**
 * 完整性能报告
 */
export interface PerformanceReport {
    timestamp: number;
    summary: {
        health: 'good' | 'warning' | 'critical';
        score: number;
        issues: string[];
    };
    memory?: {
        current: {
            used: string;
            stores: number;
            caches: number;
        };
        trend: 'stable' | 'growing' | 'shrinking';
        leakDetection: {
            suspected: boolean;
            growthRate: number;
            problematic: string[];
        };
    };
    performance?: {
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
    };
    storePool?: {
        totalPools: number;
        totalInstances: number;
        utilization: number;
        topPools: Array<{
            className: string;
            instances: number;
        }>;
    };
    suggestions?: string[];
    raw?: any;
}
/**
 * 性能报告生成器
 */
export declare class PerformanceReporter {
    private static instance;
    private performanceMonitor;
    private memoryMonitor;
    private storePool;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): PerformanceReporter;
    /**
     * 生成性能报告
     */
    generateReport(config?: ReportConfig): PerformanceReport;
    /**
     * 生成摘要
     */
    private generateSummary;
    /**
     * 生成内存报告
     */
    private generateMemoryReport;
    /**
     * 生成性能报告
     */
    private generatePerformanceReport;
    /**
     * 生成Store池报告
     */
    private generateStorePoolReport;
    /**
     * 生成优化建议
     */
    private generateSuggestions;
    /**
     * 更新健康状态
     */
    private updateHealthStatus;
    /**
     * 格式化报告
     */
    formatReport(report: PerformanceReport, format?: 'json' | 'html' | 'markdown'): string;
    /**
     * 格式化为Markdown
     */
    private formatAsMarkdown;
    /**
     * 格式化为HTML
     */
    private formatAsHTML;
    /**
     * 获取健康状态emoji
     */
    private getHealthEmoji;
    /**
     * 保存报告到文件
     */
    saveReport(report: PerformanceReport, filename: string, format?: 'json' | 'html' | 'markdown'): Promise<void>;
}
/**
 * 获取性能报告器实例
 */
export declare function usePerformanceReporter(): PerformanceReporter;
/**
 * 快捷生成报告
 */
export declare function generatePerformanceReport(config?: ReportConfig, save?: {
    filename: string;
    format?: 'json' | 'html' | 'markdown';
}): Promise<PerformanceReport>;
