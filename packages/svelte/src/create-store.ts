/**
 * Svelte Store 创建器
 * 
 * 基于 svelte/store，增强了缓存、持久化、性能监控等功能
 * 
 * @module create-store
 */

import { writable, derived, get, type Writable, type Readable } from 'svelte/store'
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
export interface SvelteStoreOptions<S = any, A = any> {
  /** Store 名称 */
  name: string
  /** 初始状态 */
  initialState: S
  /** Actions */
  actions?: (update: (updater: (state: S) => S) => void, getState: () => S) => A
  /** 缓存选项 */
  cache?: CacheOptions
  /** 持久化选项 */
  persist?: boolean | PersistOptions
  /** 性能监控 */
  enablePerformanceMonitor?: boolean
}

/**
 * 增强的 Svelte Store
 */
export interface EnhancedSvelteStore<S = any, A = any> extends Writable<S> {
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
 * 创建增强的 Svelte Store
 * 
 * 基于 svelte/store，添加缓存、持久化、性能监控等功能
 * 
 * @param options - Store 选项
 * @returns 增强的 Svelte Store
 * 
 * @example
 * ```typescript
 * const userStore = createSvelteStore({
 *   name: 'user',
 *   initialState: {
 *     name: '',
 *     age: 0
 *   },
 *   actions: (update, getState) => ({
 *     setName: (name: string) => update(s => ({ ...s, name })),
 *     incrementAge: () => update(s => ({ ...s, age: s.age + 1 }))
 *   }),
 *   persist: true
 * })
 * 
 * // 在组件中使用
 * // <h1>{$userStore.name}</h1>
 * // <button on:click={() => userStore.actions.setName('张三')}>
 * ```
 */
export function createSvelteStore<S = any, A = any>(
  options: SvelteStoreOptions<S, A>
): EnhancedSvelteStore<S, A> {
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
        console.error('[Svelte Store] 恢复持久化数据失败:', error)
      }
    }
  }

  // 创建 Svelte writable store
  const store = writable<S>(restoredState)

  // 获取当前状态
  const getState = (): S => get(store)

  // 更新函数
  const updateFn = (updater: (state: S) => S) => {
    store.update(updater)
  }

  // 创建 actions
  const actions = actionsFactory ? actionsFactory(updateFn, getState) : ({} as A)

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
        console.error('[Svelte Store] 恢复持久化数据失败:', error)
      }
    }
  }

  const clearPersisted = () => {
    if (!shouldPersist) return
    storage.removeItem(persistKey)
  }

  // 自动持久化
  if (shouldPersist) {
    store.subscribe(() => {
      persist()
    })
  }

  // 增强 store 对象
  const enhancedStore = {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    actions,
    $cache: cache,
    $performanceMonitor: performanceMonitor,
    $subscriptionManager: subscriptionManager,
    $persist: persist,
    $hydrate: hydrate,
    $clearPersisted: clearPersisted
  } as EnhancedSvelteStore<S, A>

  return enhancedStore
}




