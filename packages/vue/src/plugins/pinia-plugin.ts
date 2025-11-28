/**
 * Pinia 插件
 *
 * 提供 Pinia 的增强功能
 * @module plugins/pinia-plugin
 */

import type { PiniaPluginContext } from 'pinia'
import type { PersistOptions } from '../types'

/**
 * 持久化插件选项
 */
export interface PersistPluginOptions {
  /** 默认存储类型 */
  storage?: 'localStorage' | 'sessionStorage'
  /** 键名前缀 */
  keyPrefix?: string
  /** 防抖延迟 */
  debounce?: number
  /** 是否启用调试 */
  debug?: boolean
}

/**
 * 创建防抖函数
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): T {
  let timer: ReturnType<typeof setTimeout> | null = null

  return ((...args: unknown[]) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }) as T
}

/**
 * 获取存储对象
 */
function getStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  return type === 'localStorage' ? localStorage : sessionStorage
}

/**
 * 创建持久化 Pinia 插件
 *
 * @param options - 插件选项
 * @returns Pinia 插件
 *
 * @example
 * ```typescript
 * import { createPinia } from 'pinia'
 * import { createPersistPlugin } from '@ldesign/store-vue'
 *
 * const pinia = createPinia()
 * pinia.use(createPersistPlugin({
 *   storage: 'localStorage',
 *   keyPrefix: 'app-',
 * }))
 * ```
 */
export function createPersistPlugin(options: PersistPluginOptions = {}) {
  const {
    storage: defaultStorage = 'localStorage',
    keyPrefix = 'ldesign-store:',
    debounce: debounceDelay = 100,
    debug = false,
  } = options

  return (context: PiniaPluginContext): void => {
    const { store, options: storeOptions } = context

    // 检查是否启用持久化
    const persistConfig = (storeOptions as { persist?: boolean | PersistOptions }).persist
    if (!persistConfig) {
      return
    }

    // 解析持久化配置
    const config: PersistOptions = typeof persistConfig === 'boolean'
      ? {}
      : persistConfig

    const storageType = config.storage || defaultStorage
    const storage = getStorage(storageType)
    const key = `${keyPrefix}${config.key || store.$id}`
    const paths = config.paths

    if (!storage) {
      if (debug) {
        console.warn(`[PersistPlugin] Storage 不可用 (${store.$id})`)
      }
      return
    }

    // 恢复状态
    const restoreState = (): void => {
      try {
        const stored = storage.getItem(key)
        if (stored) {
          const data = JSON.parse(stored)

          // 调用恢复前回调
          config.beforeRestore?.({ store })

          // 恢复状态
          if (paths && paths.length > 0) {
            // 只恢复指定路径
            paths.forEach((path) => {
              const keys = path.split('.')
              let source: unknown = data
              let target: Record<string, unknown> = store.$state

              for (let i = 0; i < keys.length - 1; i++) {
                source = (source as Record<string, unknown>)?.[keys[i]]
                target = target[keys[i]] as Record<string, unknown>
              }

              const lastKey = keys[keys.length - 1]
              if (source !== undefined && (source as Record<string, unknown>)[lastKey] !== undefined) {
                target[lastKey] = (source as Record<string, unknown>)[lastKey]
              }
            })
          }
          else {
            store.$patch(data)
          }

          // 调用恢复后回调
          config.afterRestore?.({ store })

          if (debug) {
            console.log(`[PersistPlugin] 已恢复状态 (${store.$id})`)
          }
        }
      }
      catch (error) {
        console.error(`[PersistPlugin] 恢复状态失败 (${store.$id}):`, error)
      }
    }

    // 保存状态
    const saveState = debounce((): void => {
      try {
        let dataToSave = store.$state

        // 只保存指定路径
        if (paths && paths.length > 0) {
          dataToSave = {} as typeof store.$state
          paths.forEach((path) => {
            const keys = path.split('.')
            let source: unknown = store.$state
            let target: Record<string, unknown> = dataToSave

            for (let i = 0; i < keys.length - 1; i++) {
              source = (source as Record<string, unknown>)?.[keys[i]]
              if (!target[keys[i]]) {
                target[keys[i]] = {}
              }
              target = target[keys[i]] as Record<string, unknown>
            }

            const lastKey = keys[keys.length - 1]
            target[lastKey] = (source as Record<string, unknown>)?.[lastKey]
          })
        }

        storage.setItem(key, JSON.stringify(dataToSave))

        if (debug) {
          console.log(`[PersistPlugin] 已保存状态 (${store.$id})`)
        }
      }
      catch (error) {
        console.error(`[PersistPlugin] 保存状态失败 (${store.$id}):`, error)
      }
    }, config.debounce || debounceDelay)

    // 恢复状态
    restoreState()

    // 订阅状态变化
    store.$subscribe(() => {
      saveState()
    })
  }
}

