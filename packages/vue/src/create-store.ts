/**
 * Vue Store 创建器
 * 
 * 基于 Pinia，增强了缓存、持久化、性能监控等功能
 * 
 * @module create-store
 */

import { defineStore } from 'pinia'
import type { Store, StoreDefinition } from 'pinia'
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
export interface VueStoreOptions<S = any, G = any, A = any> {
  /** Store ID */
  id: string
  /** 状态定义 */
  state: () => S
  /** Actions */
  actions?: A
  /** Getters */
  getters?: G
  /** 缓存选项 */
  cache?: CacheOptions
  /** 持久化选项 */
  persist?: boolean | PersistOptions
  /** 性能监控 */
  enablePerformanceMonitor?: boolean
}

/**
 * 增强的 Store 实例
 */
export interface EnhancedStore<S = any, G = any, A = any> extends Store<string, S, G, A> {
  /** 缓存管理 */
  $cache: LRUCache
  /** 性能监控 */
  $performanceMonitor?: PerformanceMonitor
  /** 订阅管理 */
  $subscriptionManager: SubscriptionManager
  /** 持久化到存储 */
  $persist: () => void
  /** 从存储恢复 */
  $hydrate: () => void
  /** 清除持久化数据 */
  $clearPersisted: () => void
}

/**
 * 创建增强的 Vue Store
 * 
 * 基于 Pinia，添加缓存、持久化、性能监控等功能
 * 
 * @param options - Store 选项
 * @returns Store 创建器
 * 
 * @example
 * ```typescript
 * const useUserStore = createVueStore({
 *   id: 'user',
 *   state: () => ({
 *     name: '',
 *     age: 0
 *   }),
 *   actions: {
 *     setName(name: string) {
 *       this.name = name
 *     }
 *   },
 *   cache: {
 *     maxSize: 100,
 *     defaultTTL: 5000
 *   },
 *   persist: true
 * })
 * ```
 */
export function createVueStore<S = any, G = any, A = any>(
  options: VueStoreOptions<S, G, A>
): () => EnhancedStore<S, G, A> {
  const {
    id,
    state,
    actions = {} as A,
    getters = {} as G,
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
  const persistKey = persistConfig?.key || `store:${id}`

  // 创建 Pinia store
  const useStore = defineStore(id, {
    state,
    getters,
    actions: {
      ...actions,

      // 添加增强方法
      $persist() {
        if (!shouldPersist) return

        const stateToSave = this.$state
        const serialized = serializer.serialize(stateToSave)
        storage.setItem(persistKey, serialized)
      },

      $hydrate() {
        if (!shouldPersist) return

        const saved = storage.getItem(persistKey)
        if (saved) {
          try {
            const deserialized = serializer.deserialize(saved)
            this.$patch(deserialized)
          }
          catch (error) {
            console.error('[Store] 恢复持久化数据失败:', error)
          }
        }
      },

      $clearPersisted() {
        if (!shouldPersist) return
        storage.removeItem(persistKey)
      }
    } as any
  }) as any

  // 包装store，添加增强功能
  return () => {
    const store = useStore()

    // 添加增强属性
    if (!store.$cache) {
      Object.defineProperties(store, {
        $cache: {
          value: cache,
          writable: false,
          enumerable: false
        },
        $performanceMonitor: {
          value: performanceMonitor,
          writable: false,
          enumerable: false
        },
        $subscriptionManager: {
          value: subscriptionManager,
          writable: false,
          enumerable: false
        }
      })

      // 自动恢复持久化数据
      if (shouldPersist) {
        store.$hydrate()

        // 监听状态变化，自动持久化
        store.$subscribe(() => {
          store.$persist()
        })
      }
    }

    return store as EnhancedStore<S, G, A>
  }
}




