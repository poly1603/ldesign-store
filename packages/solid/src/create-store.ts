/**
 * Solid Store 创建器
 * 
 * 基于 @solidjs/store，增强了缓存、持久化、性能监控等功能
 * 
 * @module create-store
 */

import { createStore as solidCreateStore, type SetStoreFunction, type Store } from 'solid-js/store'
import { createEffect, onCleanup } from 'solid-js'
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
export interface SolidStoreOptions<S = any, A = any> {
  /** Store 名称 */
  name: string
  /** 初始状态 */
  initialState: S
  /** Actions */
  actions?: (setState: SetStoreFunction<S>, getState: () => S) => A
  /** 缓存选项 */
  cache?: CacheOptions
  /** 持久化选项 */
  persist?: boolean | PersistOptions
  /** 性能监控 */
  enablePerformanceMonitor?: boolean
}

/**
 * 增强的 Store 返回类型
 */
export interface EnhancedSolidStore<S = any, A = any> {
  /** 响应式状态 */
  state: Store<S>
  /** 状态更新函数 */
  setState: SetStoreFunction<S>
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
 * 创建增强的 Solid Store
 * 
 * 基于 @solidjs/store，添加缓存、持久化、性能监控等功能
 * 
 * @param options - Store 选项
 * @returns 增强的 Solid Store
 * 
 * @example
 * ```typescript
 * const store = createSolidStore({
 *   name: 'user',
 *   initialState: {
 *     name: '',
 *     age: 0
 *   },
 *   actions: (setState, getState) => ({
 *     setName: (name: string) => setState('name', name),
 *     incrementAge: () => setState('age', getState().age + 1)
 *   }),
 *   persist: true
 * })
 * 
 * // 使用
 * console.log(store.state.name)
 * store.actions.setName('张三')
 * ```
 */
export function createSolidStore<S extends object = any, A = any>(
  options: SolidStoreOptions<S, A>
): EnhancedSolidStore<S, A> {
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
        console.error('[Solid Store] 恢复持久化数据失败:', error)
      }
    }
  }

  // 创建 Solid store
  const [state, setState] = solidCreateStore<S>(restoredState)

  // 获取状态的函数
  const getState = (): S => state

  // 创建 actions
  const actions = actionsFactory ? actionsFactory(setState, getState) : ({} as A)

  // 持久化函数
  const persist = () => {
    if (!shouldPersist) return

    const stateToSave = getState()
    const serialized = serializer.serialize(stateToSave)
    storage.setItem(persistKey, serialized)
  }

  const hydrate = () => {
    if (!shouldPersist) return

    const saved = storage.getItem(persistKey)
    if (saved) {
      try {
        const deserialized = serializer.deserialize(saved)
        setState(deserialized as any)
      }
      catch (error) {
        console.error('[Solid Store] 恢复持久化数据失败:', error)
      }
    }
  }

  const clearPersisted = () => {
    if (!shouldPersist) return
    storage.removeItem(persistKey)
  }

  // 自动持久化（使用 Solid 的 createEffect）
  if (shouldPersist) {
    createEffect(() => {
      // 访问 state 以建立响应式依赖
      JSON.stringify(state)
      // 持久化
      persist()
    })
  }

  // 清理函数
  onCleanup(() => {
    cache.dispose()
  })

  return {
    state,
    setState,
    actions,
    $cache: cache,
    $performanceMonitor: performanceMonitor,
    $subscriptionManager: subscriptionManager,
    $persist: persist,
    $hydrate: hydrate,
    $clearPersisted: clearPersisted
  }
}




