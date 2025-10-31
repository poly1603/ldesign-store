/**
 * Alpine.js Store 创建器
 * 
 * 基于 Alpine.store()，增强了缓存、持久化、性能监控等功能
 * 
 * @module create-store
 */

import {
  LRUCache,
  PerformanceMonitor,
  SubscriptionManager,
  getDefaultSerializer,
  getDefaultStorage
} from '@ldesign/store-core'
import type { CacheOptions, PersistOptions } from '@ldesign/store-core'

/**
 * Store 选项
 */
export interface AlpineStoreOptions<S = any, A = any> {
  /** Store 名称 */
  name: string
  /** 初始状态 */
  initialState: S
  /** Actions */
  actions?: A
  /** 缓存选项 */
  cache?: CacheOptions
  /** 持久化选项 */
  persist?: boolean | PersistOptions
  /** 性能监控 */
  enablePerformanceMonitor?: boolean
}

/**
 * 增强的 Alpine Store
 */
export interface EnhancedAlpineStore<S = any, A = any> {
  /** 状态和 Actions */
  store: S & A
  /** 缓存实例 */
  $cache: LRUCache
  /** 性能监控器 */
  $performanceMonitor?: PerformanceMonitor
  /** 订阅管理器 */
  $subscriptionManager: SubscriptionManager
  /** 持久化到存储 */
  $persist: () => void
  /** 从存储恢复 */
  $hydrate: () => void
  /** 清除持久化数据 */
  $clearPersisted: () => void
}

/**
 * 创建增强的 Alpine Store
 * 
 * 使用 Alpine.store() API，添加缓存、持久化等功能
 * 
 * @param options - Store 选项
 * @returns 增强的 Alpine Store
 * 
 * @example
 * ```typescript
 * import Alpine from 'alpinejs'
 * import { createAlpineStore } from '@ldesign/store-alpine'
 * 
 * const userStore = createAlpineStore({
 *   name: 'user',
 *   initialState: { name: '', age: 0 },
 *   actions: {
 *     setName(name: string) {
 *       this.name = name
 *     }
 *   },
 *   persist: true
 * })
 * 
 * // 注册到 Alpine
 * Alpine.store('user', userStore.store)
 * ```
 */
export function createAlpineStore<S extends object = any, A = any>(
  options: AlpineStoreOptions<S, A>
): EnhancedAlpineStore<S, A> {
  const {
    name,
    initialState,
    actions = {} as A,
    cache: cacheOptions,
    persist: persistOptions,
    enablePerformanceMonitor = false
  } = options

  // 创建核心组件
  const cache = cacheOptions ? new LRUCache(cacheOptions) : new LRUCache()
  const subscriptionManager = new SubscriptionManager()
  const performanceMonitor = enablePerformanceMonitor ? new PerformanceMonitor() : undefined

  // 持久化配置
  const persistConfig = typeof persistOptions === 'object' ? persistOptions : undefined
  const shouldPersist = persistOptions === true || !!persistConfig
  const storage = persistConfig?.storage || getDefaultStorage()
  const serializer = persistConfig?.serializer || getDefaultSerializer()
  const persistKey = persistConfig?.key || `store:${name}`

  // 从存储恢复状态
  let state = initialState
  if (shouldPersist) {
    const saved = storage.getItem(persistKey)
    if (saved) {
      try {
        state = { ...initialState, ...serializer.deserialize(saved) }
      }
      catch (error) {
        console.error('[Alpine Store] 恢复持久化数据失败:', error)
      }
    }
  }

  // 合并状态和 actions
  const store = {
    ...state,
    ...actions
  } as S & A

  // 持久化函数
  const persist = () => {
    if (!shouldPersist) return

    // 只持久化状态部分
    const stateKeys = Object.keys(initialState)
    const stateToSave = stateKeys.reduce((acc, key) => {
      acc[key] = (store as any)[key]
      return acc
    }, {} as any)

    const serialized = serializer.serialize(stateToSave)
    storage.setItem(persistKey, serialized)
  }

  const hydrate = () => {
    if (!shouldPersist) return

    const saved = storage.getItem(persistKey)
    if (saved) {
      try {
        const deserialized = serializer.deserialize(saved)
        Object.assign(store, deserialized)
      }
      catch (error) {
        console.error('[Alpine Store] 恢复持久化数据失败:', error)
      }
    }
  }

  const clearPersisted = () => {
    if (!shouldPersist) return
    storage.removeItem(persistKey)
  }

  return {
    store,
    $cache: cache,
    $performanceMonitor: performanceMonitor,
    $subscriptionManager: subscriptionManager,
    $persist: persist,
    $hydrate: hydrate,
    $clearPersisted: clearPersisted
  }
}




