/**
 * Store Engine 插件
 *
 * 将 Store 功能集成到 LDesign Engine 中，提供统一的状态管理体验
 */
import type { App } from 'vue';
import type { StoreOptions } from '../types';
/**
 * Store Engine 插件配置选项
 */
export interface StoreEnginePluginOptions {
    name?: string;
    version?: string;
    description?: string;
    dependencies?: string[];
    storeConfig?: {
        enablePerformanceOptimization?: boolean;
        enablePersistence?: boolean;
        debug?: boolean;
        defaultCacheOptions?: {
            ttl?: number;
            maxSize?: number;
        };
        defaultPersistOptions?: {
            key?: string;
            storage?: Storage;
            paths?: string[];
        };
    };
    globalInjection?: boolean;
    globalPropertyName?: string;
    autoInstall?: boolean;
    enablePerformanceMonitoring?: boolean;
    debug?: boolean;
    globalConfig?: StoreOptions;
}
/**
 * Engine 插件接口
 */
interface Plugin {
    name: string;
    version: string;
    dependencies?: string[];
    install: (context: any) => Promise<void>;
    uninstall?: (context: any) => Promise<void>;
}
/**
 * Engine 插件上下文
 */
export interface EnginePluginContext {
    engine: any;
    logger: any;
    config: any;
    app?: App;
}
/**
 * 创建 Store Engine 插件
 *
 * 将 Store 功能集成到 LDesign Engine 中，提供统一的状态管理体验
 *
 * @param options 插件配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createStoreEnginePlugin } from '@ldesign/store'
 *
 * const storePlugin = createStoreEnginePlugin({
 *   storeConfig: {
 *     enablePerformanceOptimization: true,
 *     enablePersistence: true,
 *     debug: true
 *   },
 *   globalPropertyName: '$store',
 *   enablePerformanceMonitoring: true
 * })
 *
 * await engine.use(storePlugin)
 * ```
 */
export declare function createStoreEnginePlugin(options?: StoreEnginePluginOptions): Plugin;
/**
 * 创建默认 Store 插件
 */
export declare function createDefaultStoreEnginePlugin(): Plugin;
/**
 * 创建高性能 Store 插件
 */
export declare function createPerformanceStoreEnginePlugin(options?: Partial<StoreEnginePluginOptions>): Plugin;
/**
 * 创建调试模式 Store 插件
 */
export declare function createDebugStoreEnginePlugin(options?: Partial<StoreEnginePluginOptions>): Plugin;
export default createStoreEnginePlugin;
