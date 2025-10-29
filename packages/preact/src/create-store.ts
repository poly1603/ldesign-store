/**
 * Preact Store 创建器
 * 
 * 基于 Preact Signals，增强了缓存、持久化、性能监控等功能
 * 
 * @module create-store
 */

import { signal, computed as preactComputed, batch, effect } from '@preact/signals'
import type { Signal } from '@preact/signals'
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
export interface PreactStoreOptions<S = any, A = any> {
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
 * 增强的 Preact Store
 */
export interface EnhancedPreactStore<S = any, A = any> {
  /** 响应式状态 Signal */
  state: Signal<S>
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
 * 创建增强的 Preact Store
 * 
 * 基于 Preact Signals，添加缓存、持久化、性能监控等功能
 * 
 * @param options - Store 选项
 * @returns 增强的 Preact Store
 * 
 * @example
 * ```typescript
 * const store = createPreactStore({
 *   name: 'user',
 *   initialState: {
 *     name: '',
 *     age: 0
 *   },
 *   actions: (setState, getState) => ({
 *     setName: (name: string) => setState({ name }),
 *     incrementAge: () => setState({ age: getState().age + 1 })
 *   }),
 *   persist: true
 * })
 * 
 * // 在组件中
 * function UserProfile() {
 *   return <h1>{store.state.value.name}</h1>
 * }
 * ```
 */
export function createPreactStore<S extends object = any, A = any>(
  options: PreactStoreOptions<S, A>
): EnhancedPreactStore<S, A> {
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
        console.error('[Preact Store] 恢复持久化数据失败:', error)
      }
    }
  }

  // 创建 Preact Signal
  const state = signal<S>(restoredState)

  // 状态更新函数
  const setState = (partial: Partial<S>) => {
    state.value = { ...state.value, ...partial }
  }

  // 获取状态函数
  const getState = (): S => state.value

  // 创建 actions
  const actions = actionsFactory ? actionsFactory(setState, getState) : ({} as A)

  // 持久化函数
  const persist = () => {
    if (!shouldPersist) return

    const stateValue = getState()
    const serialized = serializer.serialize(stateValue)
    storage.setItem(persistKey, serialized)
  }

  const hydrate = () => {
    if (!shouldPersist) return

    const saved = storage.getItem(persistKey)
    if (saved) {
      try {
        const deserialized = serializer.deserialize(saved)
        state.value = deserialized
      }
      catch (error) {
        console.error('[Preact Store] 恢复持久化数据失败:', error)
      }
    }
  }

  const clearPersisted = () => {
    if (!shouldPersist) return
    storage.removeItem(persistKey)
  }

  // 自动持久化
  if (shouldPersist) {
    effect(() => {
      // 访问 state.value 以建立响应式依赖
      const _ = state.value
      persist()
    })
  }

  return {
    state,
    actions,
    $cache: cache,
    $performanceMonitor: performanceMonitor,
    $subscriptionManager: subscriptionManager,
    $persist: persist,
    $hydrate: hydrate,
    $clearPersisted: clearPersisted
  }
}



