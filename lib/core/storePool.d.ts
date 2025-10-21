/**
 * Store 实例池
 * 用于管理和复用 Store 实例，减少内存分配
 */
import type { BaseStore } from './BaseStore';
export interface StorePoolOptions {
    maxSize?: number;
    maxIdleTime?: number;
    enableGC?: boolean;
}
export declare class StorePool {
    private static instance;
    private pools;
    private options;
    private gcTimer?;
    private constructor();
    static getInstance(options?: StorePoolOptions): StorePool;
    /**
     * 获取 Store 实例（优化版：快速路径优化）
     */
    getStore<T extends BaseStore>(storeClass: new (id: string, ...args: any[]) => T, id: string, ...args: any[]): T;
    /**
     * 归还 Store 实例到池中
     */
    returnStore<T extends BaseStore>(instance: T): void;
    /**
     * 跟踪实例
     */
    private trackInstance;
    /**
     * 启动垃圾回收
     */
    private startGC;
    /**
     * 垃圾回收
     */
    private collectGarbage;
    /**
     * 获取池统计信息
     */
    getStats(): {
        totalPools: number;
        totalInstances: number;
        poolDetails: Array<{
            className: string;
            poolSize: number;
            activeInstances: number;
        }>;
    };
    /**
     * 清空所有池
     */
    clear(): void;
    /**
     * 销毁池管理器
     */
    destroy(): void;
    /**
     * 预热池
     */
    warmUp<T extends BaseStore>(storeClass: new (id: string, ...args: any[]) => T, count: number, ...args: any[]): void;
    /**
     * 设置池选项
     */
    setOptions(options: Partial<StorePoolOptions>): void;
}
/**
 * 获取默认的 Store 池实例
 */
export declare function useStorePool(options?: StorePoolOptions): StorePool;
/**
 * Store 池装饰器
 * 自动管理 Store 实例的生命周期
 */
export declare function PooledStore(options?: StorePoolOptions): <T extends new (...args: any[]) => BaseStore>(constructor: T) => T;
