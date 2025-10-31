/**
 * React Store 创建器
 * 
 * 基于 Zustand，增强了缓存、持久化、性能监控等功能
 * 
 * @module create-store
 */

import { create } from 'zustand'
import type { StoreApi, UseBoundStore } from 'zustand'
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
export interface ReactStoreOptions<S = any, A = any> {
  /** Store 名称 */
  name: string
  /** 初始状态 */
  initialState: S
  /** Actions */
  actions?: (set: StoreApi<S>['setState'], get: StoreApi<S>['getState']) => A
  /** 缓存选项 */
  cache?: CacheOptions
  /** 持久化选项 */
  persist?: boolean | PersistOptions
  /** 性能监控 */
  enablePerformanceMonitor?: boolean
}

/**
 * 增强的 Store 类型
 */
export type EnhancedReactStore<S = any, A = any> = S & A & {
  $cache: LRUCache
  $performanceMonitor?: PerformanceMonitor
  $subscriptionManager: SubscriptionManager
  $persist: () => void
  $hydrate: () => void
  $clearPersisted: () => void
}

/**
 * 创建增强的 React Store
 * 
 * 基于 Zustand，添加缓存、持久化、性能监控等功能
 * 
 * @param options - Store 选项
 * @returns Zustand store hook
 * 
 * @example
 * ```typescript
 * const useUserStore = createReactStore({
 *   name: 'user',
 *   initialState: {
 *     name: '',
 *     age: 0
 *   },
 *   actions: (set, get) => ({
 *     setName: (name: string) => set({ name }),
 *     incrementAge: () => set({ age: get().age + 1 })
 *   }),
 *   cache: {
 *     maxSize: 100
 *   },
 *   persist: true
 * })
 * ```
 */
export function createReactStore<S extends object = any, A = any>(
  options: ReactStoreOptions<S, A>
): UseBoundStore<StoreApi<EnhancedReactStore<S, A>>> {
  const {
    name,
    initialState,
    actions,
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
  let restoredState = initialState
  if (shouldPersist) {
    const saved = storage.getItem(persistKey)
    if (saved) {
      try {
        restoredState = { ...initialState, ...serializer.deserialize(saved) }
      }
      catch (error) {
        console.error('[React Store] 恢复持久化数据失败:', error)
      }
    }
  }

  // 创建 Zustand store
  const useStore = create<EnhancedReactStore<S, A>>((set, get) => {
    const actionsObj = actions ? actions(set, get as any) : ({} as A)

    return {
      ...restoredState,
      ...actionsObj,

      // 增强功能
      $cache: cache,
      $performanceMonitor: performanceMonitor,
      $subscriptionManager: subscriptionManager,

      $persist: () => {
        if (!shouldPersist) return

        const state = get()
        const { $cache, $performanceMonitor, $subscriptionManager, $persist, $hydrate, $clearPersisted, ...stateToSave } = state as any
        const serialized = serializer.serialize(stateToSave)
        storage.setItem(persistKey, serialized)
      },

      $hydrate: () => {
        if (!shouldPersist) return

        const saved = storage.getItem(persistKey)
        if (saved) {
          try {
            const deserialized = serializer.deserialize(saved)
            set(deserialized)
          }
          catch (error) {
            console.error('[React Store] 恢复持久化数据失败:', error)
          }
        }
      },

      $clearPersisted: () => {
        if (!shouldPersist) return
        storage.removeItem(persistKey)
      }
    } as EnhancedReactStore<S, A>
  })

  // 自动持久化
  if (shouldPersist) {
    useStore.subscribe((state) => {
      state.$persist()
    })
  }

  return useStore
}




