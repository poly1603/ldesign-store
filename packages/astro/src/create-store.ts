/**
 * Astro Store 创建器
 * 
 * 基于 nanostores，增强了缓存、持久化、性能监控等功能
 * 
 * @module create-store
 */

import { atom, map, computed as nanoComputed } from 'nanostores'
import type { WritableAtom, MapStore } from 'nanostores'
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
export interface AstroStoreOptions<S = any, A = any> {
  /** Store 名称 */
  name: string
  /** 初始状态 */
  initialState: S
  /** Actions */
  actions?: (setState: (partial: Partial<S>) => void, getState: () => S) => A
  /** 缓存选项 */
  cache?: CacheOptions
  /** 持久化选项 */
  persist?: boolean | PersistOptions
  /** 性能监控 */
  enablePerformanceMonitor?: boolean
}

/**
 * 增强的 Astro Store
 */
export interface EnhancedAstroStore<S = any, A = any> {
  /** nanostores MapStore */
  store: MapStore<S>
  /** Actions */
  actions: A
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
 * 创建增强的 Astro Store
 * 
 * @param options - Store 选项
 * @returns 增强的 Astro Store
 * 
 * @example
 * ```typescript
 * const userStore = createAstroStore({
 *   name: 'user',
 *   initialState: { name: '', age: 0 },
 *   actions: (setState) => ({
 *     setName: (name: string) => setState({ name })
 *   }),
 *   persist: true
 * })
 * 
 * // 在组件中使用
 * import { useStore } from '@nanostores/react'
 * const user = useStore(userStore.store)
 * ```
 */
export function createAstroStore<S extends object = any, A = any>(
  options: AstroStoreOptions<S, A>
): EnhancedAstroStore<S, A> {
  const {
    name,
    initialState,
    actions: actionsFactory,
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
        console.error('[Astro Store] 恢复持久化数据失败:', error)
      }
    }
  }

  // 创建 nanostores MapStore
  const store = map<S>(restoredState)

  // 状态更新函数
  const setState = (partial: Partial<S>) => {
    store.setKey(partial as any)
  }

  // 获取状态函数
  const getState = (): S => store.get()

  // 创建 actions
  const actions = actionsFactory ? actionsFactory(setState, getState) : ({} as A)

  // 持久化函数
  const persist = () => {
    if (!shouldPersist) return

    const state = getState()
    const serialized = serializer.serialize(state)
    storage.setItem(persistKey, serialized)
  }

  const hydrate = () => {
    if (!shouldPersist) return

    const saved = storage.getItem(persistKey)
    if (saved) {
      try {
        const deserialized = serializer.deserialize(saved)
        store.set(deserialized)
      }
      catch (error) {
        console.error('[Astro Store] 恢复持久化数据失败:', error)
      }
    }
  }

  const clearPersisted = () => {
    if (!shouldPersist) return
    storage.removeItem(persistKey)
  }

  // 自动持久化
  if (shouldPersist) {
    store.listen(() => {
      persist()
    })
  }

  return {
    store,
    actions,
    $cache: cache,
    $performanceMonitor: performanceMonitor,
    $subscriptionManager: subscriptionManager,
    $persist: persist,
    $hydrate: hydrate,
    $clearPersisted: clearPersisted
  }
}




