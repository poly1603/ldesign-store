/**
 * Qwik Store 创建器
 * 
 * 基于 Qwik useStore，增强了缓存、持久化、性能监控等功能
 * 
 * @module create-store
 */

import { useStore as qwikUseStore } from '@builder.io/qwik'
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
export interface QwikStoreOptions<S = any, A = any> {
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
 * 创建增强的 Qwik Store
 * 
 * @param options - Store 选项
 * @returns 创建 store 的 Hook
 * 
 * @example
 * ```typescript
 * const useUserStore = createQwikStore({
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
 * // 在组件中
 * export default component$(() => {
 *   const store = useUserStore()
 *   return <h1>{store.name}</h1>
 * })
 * ```
 */
export function createQwikStore<S extends object = any, A = any>(
  options: QwikStoreOptions<S, A>
) {
  const {
    name,
    initialState,
    actions = {} as A,
    cache: cacheOptions,
    persist: persistOptions,
    enablePerformanceMonitor = false
  } = options

  // 创建核心组件（在函数外部，所有实例共享）
  const cache = cacheOptions ? new LRUCache(cacheOptions) : new LRUCache()
  const subscriptionManager = new SubscriptionManager()
  const performanceMonitor = enablePerformanceMonitor ? new PerformanceMonitor() : undefined

  // 持久化配置
  const persistConfig = typeof persistOptions === 'object' ? persistOptions : undefined
  const shouldPersist = persistOptions === true || !!persistConfig
  const storage = persistConfig?.storage || getDefaultStorage()
  const serializer = persistConfig?.serializer || getDefaultSerializer()
  const persistKey = persistConfig?.key || `store:${name}`

  return () => {
    // 从存储恢复状态
    let restoredState = initialState
    if (shouldPersist) {
      const saved = storage.getItem(persistKey)
      if (saved) {
        try {
          restoredState = { ...initialState, ...serializer.deserialize(saved) }
        }
        catch (error) {
          console.error('[Qwik Store] 恢复持久化数据失败:', error)
        }
      }
    }

    // 使用 Qwik useStore
    const store = qwikUseStore({
      ...restoredState,
      ...actions,
      $cache: cache,
      $performanceMonitor: performanceMonitor,
      $subscriptionManager: subscriptionManager
    } as any)

    return store
  }
}




