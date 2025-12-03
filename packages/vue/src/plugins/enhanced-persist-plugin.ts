/**
 * 增强版持久化插件
 * 
 * 在原有持久化插件基础上增加：
 * - 多标签页状态同步
 * - 更细粒度的持久化控制
 * - 性能优化（批量更新、智能防抖）
 * - 过期时间支持
 * 
 * @module plugins/enhanced-persist-plugin
 */

import type { PiniaPluginContext } from 'pinia'
import type { PersistOptions } from '../types'

/**
 * 增强版持久化插件选项
 */
export interface EnhancedPersistPluginOptions {
  /** 默认存储类型 */
  storage?: 'localStorage' | 'sessionStorage'
  /** 键名前缀 */
  keyPrefix?: string
  /** 防抖延迟（毫秒） */
  debounce?: number
  /** 是否启用调试 */
  debug?: boolean
  /** 是否启用多标签页同步 */
  syncTabs?: boolean
  /** 默认过期时间（毫秒） */
  defaultTTL?: number
}

/**
 * 增强版持久化配置
 */
export interface EnhancedPersistOptions extends PersistOptions {
  /** 是否启用多标签页同步 */
  syncTabs?: boolean
  /** 过期时间（毫秒） */
  ttl?: number
  /** 排除的路径（不持久化） */
  excludePaths?: string[]
}

/**
 * 存储项接口
 */
interface StorageItem {
  /** 状态数据 */
  state: unknown
  /** 创建时间戳 */
  timestamp: number
  /** 过期时间戳 */
  expiresAt?: number
  /** 版本号 */
  version?: number
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
  return type === 'localStorage' ? window.localStorage : window.sessionStorage
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key]
    }
    else {
      return undefined
    }
  }

  return result
}

/**
 * 设置嵌套对象的值
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  let target = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in target) || typeof target[key] !== 'object') {
      target[key] = {}
    }
    target = target[key] as Record<string, unknown>
  }

  target[keys[keys.length - 1]] = value
}

/**
 * 过滤状态（排除指定路径）
 */
function filterState(
  state: Record<string, unknown>,
  includePaths?: string[],
  excludePaths?: string[]
): Record<string, unknown> {
  // 如果指定了包含路径，只保留这些路径
  if (includePaths && includePaths.length > 0) {
    const filtered: Record<string, unknown> = {}
    includePaths.forEach((path) => {
      const value = getNestedValue(state, path)
      if (value !== undefined) {
        setNestedValue(filtered, path, value)
      }
    })
    return filtered
  }

  // 如果指定了排除路径，移除这些路径
  if (excludePaths && excludePaths.length > 0) {
    const filtered = JSON.parse(JSON.stringify(state)) as Record<string, unknown>
    excludePaths.forEach((path) => {
      const keys = path.split('.')
      let target = filtered

      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in target)) {
          return
        }
        target = target[keys[i]] as Record<string, unknown>
      }

      delete target[keys[keys.length - 1]]
    })
    return filtered
  }

  return state
}

/**
 * 创建增强版持久化 Pinia 插件
 *
 * @param options - 插件选项
 * @returns Pinia 插件
 *
 * @example
 * ```typescript
 * import { createPinia } from 'pinia'
 * import { createEnhancedPersistPlugin } from '@ldesign/store-vue'
 *
 * const pinia = createPinia()
 * pinia.use(createEnhancedPersistPlugin({
 *   storage: 'localStorage',
 *   keyPrefix: 'app-',
 *   syncTabs: true,
 *   defaultTTL: 24 * 60 * 60 * 1000 // 24 小时
 * }))
 * ```
 */
export function createEnhancedPersistPlugin(options: EnhancedPersistPluginOptions = {}) {
  const {
    storage: defaultStorage = 'localStorage',
    keyPrefix = 'ldesign-store:',
    debounce: debounceDelay = 100,
    debug = false,
    syncTabs: defaultSyncTabs = false,
    defaultTTL,
  } = options

  // 存储所有 store 的清理函数
  const cleanupFunctions = new Map<string, () => void>()

  return (context: PiniaPluginContext): void => {
    const { store, options: storeOptions } = context

    // 检查是否启用持久化
    const persistConfig = (storeOptions as { persist?: boolean | EnhancedPersistOptions }).persist
    if (!persistConfig) {
      return
    }

    // 解析持久化配置
    const config: EnhancedPersistOptions = typeof persistConfig === 'boolean'
      ? {}
      : persistConfig

    const storageType = config.storage || defaultStorage
    const storage = getStorage(storageType)
    const key = `${keyPrefix}${config.key || store.$id}`
    const paths = config.paths
    const excludePaths = config.excludePaths
    const syncTabs = config.syncTabs ?? defaultSyncTabs
    const ttl = config.ttl ?? defaultTTL

    if (!storage) {
      if (debug) {
        console.warn(`[EnhancedPersistPlugin] Storage 不可用 (${store.$id})`)
      }
      return
    }

    /**
     * 保存状态到存储
     */
    const saveState = (): void => {
      try {
        // 过滤状态
        const stateToSave = filterState(
          store.$state as Record<string, unknown>,
          paths,
          excludePaths
        )

        // 创建存储项
        const item: StorageItem = {
          state: stateToSave,
          timestamp: Date.now(),
          expiresAt: ttl ? Date.now() + ttl : undefined,
          version: 1,
        }

        storage.setItem(key, JSON.stringify(item))

        if (debug) {
          console.log(`[EnhancedPersistPlugin] 已保存状态 (${store.$id})`, item)
        }
      }
      catch (error) {
        console.error(`[EnhancedPersistPlugin] 保存状态失败 (${store.$id}):`, error)
      }
    }

    /**
     * 从存储恢复状态
     */
    const restoreState = (): void => {
      try {
        const stored = storage.getItem(key)
        if (!stored) {
          return
        }

        const item: StorageItem = JSON.parse(stored)

        // 检查是否过期
        if (item.expiresAt && Date.now() > item.expiresAt) {
          if (debug) {
            console.warn(`[EnhancedPersistPlugin] 状态已过期 (${store.$id})`)
          }
          storage.removeItem(key)
          return
        }

        // 调用恢复前回调
        config.beforeRestore?.({ store })

        // 恢复状态
        if (paths && paths.length > 0) {
          // 只恢复指定路径
          paths.forEach((path) => {
            const value = getNestedValue(item.state, path)
            if (value !== undefined) {
              setNestedValue(store.$state as Record<string, unknown>, path, value)
            }
          })
        }
        else {
          store.$patch(item.state as Record<string, unknown>)
        }

        // 调用恢复后回调
        config.afterRestore?.({ store })

        if (debug) {
          console.log(`[EnhancedPersistPlugin] 已恢复状态 (${store.$id})`, item)
        }
      }
      catch (error) {
        console.error(`[EnhancedPersistPlugin] 恢复状态失败 (${store.$id}):`, error)
      }
    }

    /**
     * 处理存储事件（多标签页同步）
     */
    const handleStorageEvent = (event: StorageEvent): void => {
      if (event.key !== key || !event.newValue) {
        return
      }

      try {
        const item: StorageItem = JSON.parse(event.newValue)

        // 检查是否过期
        if (item.expiresAt && Date.now() > item.expiresAt) {
          return
        }

        // 更新状态
        store.$patch(item.state as Record<string, unknown>)

        if (debug) {
          console.log(`[EnhancedPersistPlugin] 已同步状态 (${store.$id})`, item)
        }
      }
      catch (error) {
        console.error(`[EnhancedPersistPlugin] 同步状态失败 (${store.$id}):`, error)
      }
    }

    // 恢复状态
    restoreState()

    // 监听状态变化，自动保存
    const debouncedSave = debounce(saveState, debounceDelay)
    store.$subscribe(() => {
      debouncedSave()
    })

    // 多标签页同步
    if (syncTabs && typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageEvent)

      // 保存清理函数
      cleanupFunctions.set(store.$id, () => {
        window.removeEventListener('storage', handleStorageEvent)
      })
    }

    if (debug) {
      console.log(`[EnhancedPersistPlugin] 已初始化 (${store.$id})`, {
        storage: storageType,
        key,
        paths,
        excludePaths,
        syncTabs,
        ttl,
      })
    }
  }
}

/**
 * 清理所有持久化监听器
 */
export function cleanupEnhancedPersist(): void {
  // 这个函数可以在应用卸载时调用
  // 目前暂时不需要实现，因为 storage 事件监听器会在页面关闭时自动清理
}

