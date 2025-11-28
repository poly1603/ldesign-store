/**
 * 插件管理器
 *
 * @module plugins/plugin-manager
 */

import type { PluginContext, PluginManager, StorePlugin } from '../types'

/**
 * 创建插件管理器
 *
 * @returns 插件管理器实例
 *
 * @example
 * ```typescript
 * const manager = createPluginManager()
 *
 * // 注册插件
 * manager.use(myPlugin, { option: 'value' })
 *
 * // 获取插件
 * const plugin = manager.get('my-plugin')
 *
 * // 移除插件
 * manager.remove('my-plugin')
 * ```
 */
export function createPluginManager(): PluginManager {
  /** 已注册的插件 */
  const plugins = new Map<string, StorePlugin>()

  /** 插件上下文缓存 */
  const contexts = new Map<string, PluginContext>()

  /**
   * 注册插件
   */
  const use = <Options>(
    plugin: StorePlugin<Options>,
    options?: Options,
  ): void => {
    if (plugins.has(plugin.name)) {
      console.warn(`[Plugin] 插件 "${plugin.name}" 已存在，将被覆盖`)
    }

    plugins.set(plugin.name, plugin as StorePlugin)

    // 创建插件上下文
    const context: PluginContext = {
      storeManager: {
        getStore: () => null,
        hasStore: () => false,
        getStoreIds: () => [],
      },
      storeId: '',
      store: null,
      options: (options || {}) as Record<string, unknown>,
    }

    contexts.set(plugin.name, context)
  }

  /**
   * 移除插件
   */
  const remove = (name: string): void => {
    const plugin = plugins.get(name)
    const context = contexts.get(name)

    if (plugin && context) {
      // 调用卸载钩子
      plugin.uninstall?.(context)
    }

    plugins.delete(name)
    contexts.delete(name)
  }

  /**
   * 获取插件
   */
  const get = (name: string): StorePlugin | undefined => {
    return plugins.get(name)
  }

  /**
   * 是否已注册插件
   */
  const has = (name: string): boolean => {
    return plugins.has(name)
  }

  /**
   * 获取所有插件
   */
  const getAll = (): Map<string, StorePlugin> => {
    return new Map(plugins)
  }

  /**
   * 获取插件数量
   */
  const size = (): number => {
    return plugins.size
  }

  /**
   * 清空所有插件
   */
  const clear = (): void => {
    // 调用所有插件的卸载钩子
    plugins.forEach((plugin, name) => {
      const context = contexts.get(name)
      if (context) {
        plugin.uninstall?.(context)
      }
    })

    plugins.clear()
    contexts.clear()
  }

  return {
    use,
    remove,
    get,
    has,
    getAll,
    size,
    clear,
  }
}

/**
 * 全局插件管理器
 */
let globalPluginManager: PluginManager | null = null

/**
 * 获取全局插件管理器
 */
export function getGlobalPluginManager(): PluginManager {
  if (!globalPluginManager) {
    globalPluginManager = createPluginManager()
  }
  return globalPluginManager
}

/**
 * 设置全局插件管理器
 */
export function setGlobalPluginManager(manager: PluginManager): void {
  globalPluginManager = manager
}

