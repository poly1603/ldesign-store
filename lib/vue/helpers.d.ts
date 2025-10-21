/**
 * Vue Store 辅助工具
 * 提供更简单的 Store 创建和使用方式
 */
import type { StateTree, Store } from 'pinia';
import type { App } from 'vue';
/**
 * 简化的 Store 定义选项
 */
export interface SimpleStoreOptions<T extends StateTree = StateTree> {
    /** Store ID */
    id: string;
    /** 初始状态 */
    state?: T | (() => T);
    /** 动作定义 */
    actions?: Record<string, (...args: any[]) => any>;
    /** 计算属性定义 */
    getters?: Record<string, (state: T) => any>;
    /** 是否持久化 */
    persist?: boolean;
    /** 持久化键 */
    persistKey?: string;
    /** 持久化存储 */
    persistStorage?: Storage;
}
/**
 * 创建简化的 Store
 */
export declare function createSimpleStore<T extends StateTree = StateTree>(options: SimpleStoreOptions<T>): import("pinia").StoreDefinition<string, T, any, any> | (() => Store<string, T, any, any>);
/**
 * Store 管理器
 * 提供全局 Store 管理功能
 */
export declare class StoreManager {
    private stores;
    private instances;
    /**
     * 注册 Store
     */
    register<T extends Store = Store>(id: string, storeFactory: () => T): void;
    /**
     * 获取 Store 实例
     */
    get<T extends Store = Store>(id: string): T | undefined;
    /**
     * 销毁 Store 实例
     */
    destroy(id: string): void;
    /**
     * 清理所有 Store
     */
    clear(): void;
    /**
     * 获取所有注册的 Store ID
     */
    getRegisteredIds(): string[];
    /**
     * 获取所有活跃的 Store ID
     */
    getActiveIds(): string[];
}
/**
 * 全局 Store 管理器实例
 */
export declare const globalStoreManager: StoreManager;
/**
 * Vue 插件：自动注册 Store
 */
export declare function createAutoStorePlugin(stores: Record<string, () => Store>): {
    install(app: App): void;
};
/**
 * 批量创建 Store
 */
export declare function createStores(definitions: Record<string, SimpleStoreOptions>): Record<string, () => Store>;
/**
 * 响应式 Store 状态
 */
export declare function createReactiveStore<T extends StateTree = StateTree>(id: string, initialState: T, options?: {
    actions?: Record<string, (state: T, ...args: any[]) => any>;
    getters?: Record<string, (state: T) => any>;
    persist?: boolean;
}): import("pinia").StoreDefinition<string, T, any, any> | (() => Store<string, T, any, any>);
