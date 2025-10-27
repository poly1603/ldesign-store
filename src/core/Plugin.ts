/**
 * Store 插件系统
 * 
 * 提供可扩展的插件架构，允许开发者自定义 Store 行为。
 * 支持生命周期钩子、中间件模式、插件依赖等高级特性。
 * 
 * @example
 * ```typescript
 * // 创建插件
 * const loggerPlugin: StorePlugin = {
 *   id: 'logger',
 *   install(context) {
 *     context.onAction(({ name, args }) => {
 *       console.log(`执行 Action: ${name}`, args)
 *     })
 *   }
 * }
 * 
 * // 使用插件
 * const pluginManager = new PluginManager()
 * pluginManager.registerPlugin(loggerPlugin)
 * pluginManager.installToStore(store, 'logger')
 * ```
 */

import type { Store } from 'pinia'

/**
 * 插件上下文
 * 
 * 提供给插件的 API 接口，用于访问和修改 Store。
 */
export interface PluginContext {
  /** Store 实例 */
  store: Store

  /** Store ID */
  storeId: string

  /** 订阅状态变化 */
  onStateChange: (callback: (state: any) => void) => () => void

  /** 订阅 Action 执行 */
  onAction: (callback: (context: {
    name: string
    args: any[]
    after: (callback: (result: any) => void) => void
    onError: (callback: (error: Error) => void) => void
  }) => void) => () => void

  /** 获取状态 */
  getState: () => any

  /** 更新状态 */
  setState: (state: any) => void

  /** 添加清理函数 */
  addCleanup: (cleanup: () => void) => void

  /** 插件配置选项 */
  options?: any
}

/**
 * 插件接口
 */
export interface StorePlugin<Options = any> {
  /** 插件唯一标识符 */
  id: string

  /** 插件名称 */
  name?: string

  /** 插件版本 */
  version?: string

  /** 插件描述 */
  description?: string

  /** 插件作者 */
  author?: string

  /** 插件依赖（其他插件 ID） */
  dependencies?: string[]

  /** 安装插件 */
  install: (context: PluginContext, options?: Options) => void | Promise<void>

  /** 卸载插件（可选） */
  uninstall?: (context: PluginContext) => void | Promise<void>

  /** 插件默认配置 */
  defaultOptions?: Options
}

/**
 * 插件实例信息
 */
interface PluginInstance {
  plugin: StorePlugin
  installedStores: Set<string>
  cleanupFunctions: Map<string, Array<() => void>>
}

/**
 * 插件管理器
 * 
 * 管理插件的注册、安装、卸载等操作。
 */
export class PluginManager {
  /** 已注册的插件 */
  private plugins = new Map<string, PluginInstance>()

  /** Store 已安装的插件 */
  private storePlugins = new Map<string, Set<string>>()

  /**
   * 注册插件
   * 
   * 将插件添加到插件注册表中。
   * 
   * @param plugin - 插件对象
   * @throws 如果插件 ID 已存在或依赖项缺失
   * 
   * @example
   * ```typescript
   * pluginManager.registerPlugin({
   *   id: 'logger',
   *   name: '日志插件',
   *   install(context) {
   *     // 插件逻辑
   *   }
   * })
   * ```
   */
  registerPlugin(plugin: StorePlugin): void {
    // 检查插件 ID 是否已存在
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id "${plugin.id}" is already registered`)
    }

    // 检查依赖
    if (plugin.dependencies) {
      for (const depId of plugin.dependencies) {
        if (!this.plugins.has(depId)) {
          throw new Error(
            `Plugin "${plugin.id}" depends on "${depId}", but it is not registered`
          )
        }
      }
    }

    // 注册插件
    this.plugins.set(plugin.id, {
      plugin,
      installedStores: new Set(),
      cleanupFunctions: new Map(),
    })
  }

  /**
   * 批量注册插件
   * 
   * @param plugins - 插件数组
   * 
   * @example
   * ```typescript
   * pluginManager.registerPlugins([
   *   loggerPlugin,
   *   persistencePlugin,
   *   validationPlugin
   * ])
   * ```
   */
  registerPlugins(plugins: StorePlugin[]): void {
    for (const plugin of plugins) {
      this.registerPlugin(plugin)
    }
  }

  /**
   * 安装插件到 Store
   * 
   * @param store - Store 实例
   * @param pluginId - 插件 ID
   * @param options - 插件配置选项
   * @throws 如果插件未注册或已安装
   * 
   * @example
   * ```typescript
   * pluginManager.installToStore(userStore, 'logger', {
   *   level: 'debug'
   * })
   * ```
   */
  async installToStore(
    store: any,
    pluginId: string,
    options?: any
  ): Promise<void> {
    const pluginInstance = this.plugins.get(pluginId)

    if (!pluginInstance) {
      throw new Error(`Plugin "${pluginId}" is not registered`)
    }

    const storeId = this.getStoreId(store)

    // 检查是否已安装
    if (pluginInstance.installedStores.has(storeId)) {
      console.warn(`Plugin "${pluginId}" is already installed on store "${storeId}"`)
      return
    }

    // 先安装依赖插件
    if (pluginInstance.plugin.dependencies) {
      for (const depId of pluginInstance.plugin.dependencies) {
        await this.installToStore(store, depId)
      }
    }

    // 创建插件上下文
    const cleanupFunctions: Array<() => void> = []

    const context: PluginContext = {
      store,
      storeId,

      onStateChange: (callback) => {
        const unsubscribe = store.$subscribe((mutation: any, state: any) => {
          callback(state)
        })
        cleanupFunctions.push(unsubscribe)
        return unsubscribe
      },

      onAction: (callback) => {
        const unsubscribe = store.$onAction((actionContext: any) => {
          callback(actionContext)
        })
        cleanupFunctions.push(unsubscribe)
        return unsubscribe
      },

      getState: () => store.$state,

      setState: (state) => {
        store.$patch(state)
      },

      addCleanup: (cleanup) => {
        cleanupFunctions.push(cleanup)
      },

      options: { ...pluginInstance.plugin.defaultOptions, ...options },
    }

    // 安装插件
    await pluginInstance.plugin.install(context, context.options)

    // 记录安装信息
    pluginInstance.installedStores.add(storeId)
    pluginInstance.cleanupFunctions.set(storeId, cleanupFunctions)

    // 记录 Store 的插件
    if (!this.storePlugins.has(storeId)) {
      this.storePlugins.set(storeId, new Set())
    }
    this.storePlugins.get(storeId)!.add(pluginId)
  }

  /**
   * 从 Store 卸载插件
   * 
   * @param store - Store 实例
   * @param pluginId - 插件 ID
   * 
   * @example
   * ```typescript
   * pluginManager.uninstallFromStore(userStore, 'logger')
   * ```
   */
  async uninstallFromStore(store: any, pluginId: string): Promise<void> {
    const pluginInstance = this.plugins.get(pluginId)

    if (!pluginInstance) {
      throw new Error(`Plugin "${pluginId}" is not registered`)
    }

    const storeId = this.getStoreId(store)

    // 检查是否已安装
    if (!pluginInstance.installedStores.has(storeId)) {
      console.warn(`Plugin "${pluginId}" is not installed on store "${storeId}"`)
      return
    }

    // 创建上下文（用于卸载）
    const context: PluginContext = {
      store,
      storeId,
      onStateChange: () => () => { },
      onAction: () => () => { },
      getState: () => store.$state,
      setState: (state) => store.$patch(state),
      addCleanup: () => { },
    }

    // 调用卸载钩子
    if (pluginInstance.plugin.uninstall) {
      await pluginInstance.plugin.uninstall(context)
    }

    // 执行清理函数
    const cleanupFunctions = pluginInstance.cleanupFunctions.get(storeId)
    if (cleanupFunctions) {
      for (const cleanup of cleanupFunctions) {
        try {
          cleanup()
        } catch (error) {
          console.error('Error during plugin cleanup:', error)
        }
      }
      pluginInstance.cleanupFunctions.delete(storeId)
    }

    // 移除安装记录
    pluginInstance.installedStores.delete(storeId)

    const storePluginSet = this.storePlugins.get(storeId)
    if (storePluginSet) {
      storePluginSet.delete(pluginId)
      if (storePluginSet.size === 0) {
        this.storePlugins.delete(storeId)
      }
    }
  }

  /**
   * 注销插件
   * 
   * 从所有 Store 卸载插件并从注册表移除。
   * 
   * @param pluginId - 插件 ID
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const pluginInstance = this.plugins.get(pluginId)

    if (!pluginInstance) {
      return
    }

    // 从所有 Store 卸载
    const installedStores = Array.from(pluginInstance.installedStores)
    for (const storeId of installedStores) {
      // 注意：这里需要 store 实例，但我们只有 storeId
      // 实际使用中可能需要维护 storeId -> store 的映射
      console.warn(`Plugin "${pluginId}" is still installed on store "${storeId}"`)
    }

    // 从注册表移除
    this.plugins.delete(pluginId)
  }

  /**
   * 检查插件是否已注册
   * 
   * @param pluginId - 插件 ID
   * @returns 是否已注册
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  /**
   * 检查插件是否已安装到 Store
   * 
   * @param store - Store 实例
   * @param pluginId - 插件 ID
   * @returns 是否已安装
   */
  isInstalled(store: any, pluginId: string): boolean {
    const pluginInstance = this.plugins.get(pluginId)
    if (!pluginInstance) {
      return false
    }

    const storeId = this.getStoreId(store)
    return pluginInstance.installedStores.has(storeId)
  }

  /**
   * 获取已注册的插件列表
   * 
   * @returns 插件 ID 数组
   */
  getPluginIds(): string[] {
    return Array.from(this.plugins.keys())
  }

  /**
   * 获取插件信息
   * 
   * @param pluginId - 插件 ID
   * @returns 插件信息
   */
  getPluginInfo(pluginId: string): {
    id: string
    name?: string
    version?: string
    description?: string
    author?: string
    dependencies?: string[]
    installedStores: string[]
  } | undefined {
    const pluginInstance = this.plugins.get(pluginId)
    if (!pluginInstance) {
      return undefined
    }

    const { plugin, installedStores } = pluginInstance

    return {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      dependencies: plugin.dependencies,
      installedStores: Array.from(installedStores),
    }
  }

  /**
   * 获取 Store 已安装的插件
   * 
   * @param store - Store 实例
   * @returns 插件 ID 数组
   */
  getStorePlugins(store: any): string[] {
    const storeId = this.getStoreId(store)
    const plugins = this.storePlugins.get(storeId)
    return plugins ? Array.from(plugins) : []
  }

  /**
   * 获取统计信息
   * 
   * @returns 统计信息对象
   */
  getStats(): {
    totalPlugins: number
    totalStores: number
    plugins: Array<{
      id: string
      installedCount: number
    }>
  } {
    const plugins: Array<{ id: string; installedCount: number }> = []

    for (const [id, instance] of this.plugins) {
      plugins.push({
        id,
        installedCount: instance.installedStores.size,
      })
    }

    return {
      totalPlugins: this.plugins.size,
      totalStores: this.storePlugins.size,
      plugins,
    }
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins.clear()
    this.storePlugins.clear()
  }

  /**
   * 获取 Store ID
   * 
   * @private
   */
  private getStoreId(store: any): string {
    return store.$id || String(store)
  }
}

/**
 * 全局插件管理器实例
 */
export const globalPluginManager = new PluginManager()

/**
 * 创建插件管理器
 * 
 * @returns 插件管理器实例
 */
export function createPluginManager(): PluginManager {
  return new PluginManager()
}

/**
 * 创建简单插件
 * 
 * 辅助函数，简化插件创建。
 * 
 * @param id - 插件 ID
 * @param install - 安装函数
 * @returns 插件对象
 * 
 * @example
 * ```typescript
 * const loggerPlugin = createPlugin('logger', (context) => {
 *   context.onAction(({ name, args }) => {
 *     console.log(`Action: ${name}`, args)
 *   })
 * })
 * ```
 */
export function createPlugin(
  id: string,
  install: (context: PluginContext, options?: any) => void | Promise<void>
): StorePlugin {
  return {
    id,
    install,
  }
}

// ==================== 内置插件 ====================

/**
 * 日志插件
 * 
 * 记录所有 Action 执行和状态变化。
 */
export const loggerPlugin: StorePlugin<{
  level?: 'debug' | 'info' | 'warn' | 'error'
  logActions?: boolean
  logMutations?: boolean
}> = {
  id: 'logger',
  name: '日志插件',
  version: '1.0.0',
  description: '记录 Store 的 Action 和状态变化',

  defaultOptions: {
    level: 'info',
    logActions: true,
    logMutations: true,
  },

  install(context, options) {
    const { level = 'info', logActions = true, logMutations = true } = options || {}

    if (logActions) {
      context.onAction(({ name, args, after, onError }) => {
        console.group(`🚀 Action: ${name}`)
        console.log('参数:', args)
        console.log('Store ID:', context.storeId)

        after((result) => {
          console.log('✅ 结果:', result)
          console.groupEnd()
        })

        onError((error) => {
          console.error('❌ 错误:', error)
          console.groupEnd()
        })
      })
    }

    if (logMutations) {
      context.onStateChange((state) => {
        console.log(`📝 状态变化 [${context.storeId}]:`, state)
      })
    }
  },
}

/**
 * 性能监控插件
 * 
 * 监控 Action 执行时间。
 */
export const performancePlugin: StorePlugin = {
  id: 'performance',
  name: '性能监控插件',
  version: '1.0.0',
  description: '监控 Action 执行性能',

  install(context) {
    context.onAction(({ name, after }) => {
      const startTime = performance.now()

      after(() => {
        const duration = performance.now() - startTime
        console.log(`⏱️ ${name} 耗时: ${duration.toFixed(2)}ms`)

        if (duration > 1000) {
          console.warn(`⚠️ ${name} 执行时间过长: ${duration.toFixed(2)}ms`)
        }
      })
    })
  },
}


