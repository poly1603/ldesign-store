/**
 * Engine 插件
 *
 * 提供与 @ldesign/engine-vue3 的集成
 * @module plugins/engine-plugin
 */

import { createPinia } from 'pinia'
import type { App } from 'vue'
import type { Pinia } from 'pinia'
import type { StoreEnginePluginOptions, GlobalStoreAPI } from '../types'
import { createPersistPlugin } from './pinia-plugin'

/**
 * Store 全局 API 实例
 */
let globalStoreAPI: GlobalStoreAPI | null = null

/**
 * 获取全局 Store API
 */
export function getGlobalStoreAPI(): GlobalStoreAPI | null {
  return globalStoreAPI
}

/**
 * 创建 Store Engine 插件
 *
 * 用于与 @ldesign/engine-vue3 集成
 *
 * @param options - 插件选项
 * @returns Engine 插件
 *
 * @example
 * ```typescript
 * import { createEngine } from '@ldesign/engine-vue3'
 * import { createStoreEnginePlugin } from '@ldesign/store-vue'
 *
 * const engine = createEngine()
 *
 * engine.use(createStoreEnginePlugin({
 *   persist: true,
 *   devtools: true,
 * }))
 * ```
 */
export function createStoreEnginePlugin(options: StoreEnginePluginOptions = {}) {
  const {
    name = 'store',
    version = '1.0.0',
    persist = false,
    persistOptions = {},
    devtools = true,
    debug = false,
    globalProperties = true,
    pinia: existingPinia,
  } = options

  return {
    name,
    version,

    /**
     * 安装插件
     */
    async install(context: { engine?: { app?: App }, app?: App }) {
      const app = context?.engine?.app || context?.app

      if (!app) {
        console.error('[StorePlugin] 无法获取 Vue App 实例')
        return
      }

      // 创建或使用现有的 Pinia 实例
      const pinia: Pinia = existingPinia || createPinia()

      // 添加持久化插件
      if (persist) {
        pinia.use(createPersistPlugin({
          debug,
          ...persistOptions,
        }))
      }

      // 安装 Pinia
      app.use(pinia)

      // 创建全局 API
      const storeRegistry = new Map<string, unknown>()

      globalStoreAPI = {
        pinia,

        getStore: <T>(id: string): T | undefined => {
          return storeRegistry.get(id) as T | undefined
        },

        hasStore: (id: string): boolean => {
          return storeRegistry.has(id)
        },

        getStoreIds: (): string[] => {
          return Array.from(storeRegistry.keys())
        },

        resetAll: (): void => {
          storeRegistry.forEach((store) => {
            if (store && typeof (store as { $reset?: () => void }).$reset === 'function') {
              (store as { $reset: () => void }).$reset()
            }
          })
        },
      }

      // 注册全局属性
      if (globalProperties) {
        app.config.globalProperties.$store = globalStoreAPI
      }

      // 提供给子组件
      app.provide('store', globalStoreAPI)
      app.provide('pinia', pinia)

      if (debug) {
        console.log('[StorePlugin] 已安装', {
          persist,
          devtools,
        })
      }
    },

    /**
     * 卸载插件
     */
    uninstall() {
      globalStoreAPI = null

      if (debug) {
        console.log('[StorePlugin] 已卸载')
      }
    },
  }
}

/**
 * 默认导出
 */
export default createStoreEnginePlugin

