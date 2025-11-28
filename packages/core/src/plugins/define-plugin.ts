/**
 * 插件定义辅助函数
 *
 * @module plugins/define-plugin
 */

import type { DefinePluginOptions, PluginFactory, StorePlugin } from '../types'

/**
 * 定义 Store 插件
 *
 * 提供类型安全的插件定义方式
 *
 * @template Options - 插件选项类型
 * @param options - 插件定义选项
 * @returns 插件实例
 *
 * @example
 * ```typescript
 * // 定义一个简单的日志插件
 * const loggerPlugin = defineStorePlugin({
 *   name: 'logger',
 *   version: '1.0.0',
 *   install(context) {
 *     console.log('Logger plugin installed')
 *   },
 *   onStateChange(storeId, state, oldState) {
 *     console.log(`[${storeId}] State changed:`, state)
 *   },
 * })
 * ```
 */
export function defineStorePlugin<Options = Record<string, unknown>>(
  options: DefinePluginOptions<Options>,
): StorePlugin<Options> {
  return {
    name: options.name,
    version: options.version,
    description: options.description,
    install: options.install,
    uninstall: options.uninstall,
    onStoreCreated: options.onStoreCreated,
    onStoreDisposed: options.onStoreDisposed,
    onStateChange: options.onStateChange,
  }
}

/**
 * 创建插件工厂函数
 *
 * 用于创建可配置的插件
 *
 * @template Options - 插件选项类型
 * @param factory - 插件工厂函数
 * @returns 插件工厂
 *
 * @example
 * ```typescript
 * // 创建可配置的持久化插件
 * const createPersistPlugin = createPluginFactory<{ key: string }>(
 *   (options) => ({
 *     name: 'persist',
 *     install(context) {
 *       console.log('Persist key:', options?.key)
 *     },
 *   })
 * )
 *
 * // 使用
 * const plugin = createPersistPlugin({ key: 'my-store' })
 * ```
 */
export function createPluginFactory<Options = Record<string, unknown>>(
  factory: (options?: Options) => DefinePluginOptions<Options>,
): PluginFactory<Options> {
  return (options?: Options): StorePlugin<Options> => {
    return defineStorePlugin(factory(options))
  }
}

/**
 * 组合多个插件
 *
 * @param plugins - 插件列表
 * @returns 组合后的插件
 *
 * @example
 * ```typescript
 * const combinedPlugin = composePlugins([
 *   loggerPlugin,
 *   persistPlugin,
 *   devtoolsPlugin,
 * ])
 * ```
 */
export function composePlugins(
  plugins: StorePlugin[],
): StorePlugin {
  return {
    name: 'composed-plugins',
    version: '1.0.0',

    async install(context, options) {
      for (const plugin of plugins) {
        await plugin.install(context, options)
      }
    },

    async uninstall(context) {
      // 逆序卸载
      for (let i = plugins.length - 1; i >= 0; i--) {
        await plugins[i].uninstall?.(context)
      }
    },

    onStoreCreated(store) {
      plugins.forEach(plugin => plugin.onStoreCreated?.(store))
    },

    onStoreDisposed(store) {
      plugins.forEach(plugin => plugin.onStoreDisposed?.(store))
    },

    onStateChange(storeId, state, oldState) {
      plugins.forEach(plugin => plugin.onStateChange?.(storeId, state, oldState))
    },
  }
}

