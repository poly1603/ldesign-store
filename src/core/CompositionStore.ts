/**
 * Composition API 风格的 Store
 * 提供类似 Vue 3 Composition API 的 Store 定义方式
 */

import type { Store, StoreDefinition } from 'pinia'
import type { ComputedRef, Ref, UnwrapNestedRefs } from 'vue'
import type { CacheOptions, PersistOptions } from '../types'
import { defineStore } from 'pinia'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { PerformanceOptimizer } from './PerformanceOptimizer'
import { SubscriptionManager } from './SubscriptionManager'

/**
 * Composition Store 上下文
 */
export interface CompositionStoreContext {
  // 状态创建函数
  state: <T>(initialValue: T) => Ref<T>

  // 计算属性创建函数
  computed: <T>(getter: () => T) => ComputedRef<T>

  // 响应式对象创建函数
  reactive: <T extends object>(obj: T) => UnwrapNestedRefs<T>

  // 监听器
  watch: typeof watch

  // 生命周期
  onUnmounted: typeof onUnmounted

  // 缓存方法
  cache: {
    get: (key: string) => any
    set: (key: string, value: any, ttl?: number) => void
    delete: (key: string) => boolean
    clear: () => void
  }

  // 持久化方法
  persist: {
    save: () => void
    load: () => void
    clear: () => void
  }
}

/**
 * Composition Store 设置函数类型
 */
export type CompositionStoreSetup<T = any> = (context: CompositionStoreContext) => T

/**
 * Composition Store 选项
 */
export interface CompositionStoreOptions {
  id: string
  persist?: boolean | PersistOptions
  cache?: CacheOptions
  devtools?: boolean
}

/**
 * Composition Store 实例
 */
export interface CompositionStoreInstance<T = any> {
  readonly $id: string
  readonly $state: T

  // 状态管理方法
  $reset: () => void
  $patch: ((partialState: Partial<T>) => void) & ((mutator: (state: T) => void) => void)

  // 订阅方法
  $subscribe: (callback: (mutation: any, state: T) => void, options?: { detached?: boolean }) => () => void
  $onAction: (callback: (context: any) => void) => () => void

  // 生命周期方法
  $dispose: () => void

  // 性能优化方法
  $persist: () => void
  $hydrate: () => void
  $clearPersisted: () => void
  $getCache: (key: string) => any
  $setCache: (key: string, value: any, ttl?: number) => void
  $deleteCache: (key: string) => boolean
  $clearCache: () => void

  // 工具方法
  getStore: () => Store<string, any, any, any>
  getStoreDefinition: () => StoreDefinition<string, any, any, any>
}

/**
 * 创建 Composition Store（优化版）
 * 
 * 创建一个使用 Composition API 风格的 Store。
 * 修复了内存泄漏问题，增强了资源管理。
 * 
 * @template T - Store 状态类型
 * @param options - Store 配置选项
 * @param setup - Setup 函数，定义 Store 的状态和逻辑
 * @returns Store 工厂函数
 * 
 * @example
 * ```typescript
 * const useCounterStore = createCompositionStore(
 *   { id: 'counter' },
 *   ({ state, computed }) => {
 *     const count = state(0)
 *     const doubleCount = computed(() => count.value * 2)
 *     const increment = () => count.value++
 *     
 *     return { count, doubleCount, increment }
 *   }
 * )
 * ```
 */
export function createCompositionStore<T = any>(
  options: CompositionStoreOptions,
  setup: CompositionStoreSetup<T>
): () => CompositionStoreInstance<T> {
  // 创建性能优化器
  const optimizer = new PerformanceOptimizer({
    cache: options.cache,
    persistence: typeof options.persist === 'object' ? options.persist : undefined,
  })

  // 使用 Map 存储初始状态（而不是 WeakMap，避免引用问题）
  // 每个 store 实例只存储一份初始状态
  let initialState: T | null = null
  let isInitialized = false

  // 创建 Pinia Store 定义，使用 setup 语法
  const storeDefinition = defineStore(options.id, () => {
    // 存储清理函数，用于组件卸载时清理资源
    const cleanupFunctions: (() => void)[] = []

    // 创建 Composition API 上下文，提供 Vue 3 的响应式 API
    const context: CompositionStoreContext = {
      // 创建响应式状态，使用 ref 包装
      state: <T>(initialValue: T) => ref(initialValue) as Ref<T>,

      // 创建计算属性，使用 computed 包装
      computed: <T>(getter: () => T) => computed(getter),

      // 创建响应式对象，使用 reactive 包装
      reactive: <T extends object>(obj: T) => reactive(obj) as UnwrapNestedRefs<T>,

      // 提供 watch 功能
      watch,

      // 提供生命周期钩子，同时添加到清理函数列表
      onUnmounted: (fn: () => void) => {
        cleanupFunctions.push(fn)
        onUnmounted(fn)
      },

      cache: {
        get: (key: string) => optimizer.cache.get(`${options.id}:${key}`),
        set: (key: string, value: any, ttl?: number) => optimizer.cache.set(`${options.id}:${key}`, value, ttl),
        delete: (key: string) => optimizer.cache.delete(`${options.id}:${key}`),
        clear: () => optimizer.cache.clear(),
      },

      persist: {
        save: () => {
          // 延迟获取 storeState，确保它已经被初始化
          const currentState = storeDefinition().$state
          optimizer.persistence.save(options.id, currentState)
        },
        load: () => {
          const persistedState = optimizer.persistence.load(options.id)
          if (persistedState) {
            const currentState = storeDefinition().$state
            if (typeof currentState === 'object' && currentState !== null) {
              Object.assign(currentState as Record<string, any>, persistedState)
            }
          }
        },
        clear: () => optimizer.persistence.remove(options.id),
      },
    }

    // 执行设置函数
    const storeState = setup(context)

    // 首次初始化时，保存初始状态的深拷贝（用于 $reset）
    if (!isInitialized && typeof storeState === 'object' && storeState !== null) {
      try {
        initialState = JSON.parse(JSON.stringify(storeState)) as T
        isInitialized = true
      } catch (error) {
        console.warn('Failed to serialize initial state:', error)
        initialState = storeState
        isInitialized = true
      }
    }

    // 如果启用持久化，自动恢复状态
    if (options.persist) {
      const persistedState = optimizer.persistence.load(options.id)
      if (persistedState && typeof storeState === 'object' && storeState !== null) {
        Object.assign(storeState as Record<string, any>, persistedState)
      }
    }

    return storeState
  })

  // 返回 Store 工厂函数
  return (): CompositionStoreInstance<T> => {
    const store = storeDefinition()
    // 使用 SubscriptionManager 管理订阅
    const subscriptionManager = new SubscriptionManager()

    const instance: CompositionStoreInstance<T> = {
      $id: options.id,

      get $state() {
        return store.$state as T
      },

      $reset() {
        if (initialState && typeof initialState === 'object') {
          try {
            // 深拷贝初始状态来重置
            const resetState = JSON.parse(JSON.stringify(initialState))
            Object.assign(store.$state, resetState)
          } catch (error) {
            console.warn('Failed to reset state:', error)
          }
        }
      },

      $patch(partialStateOrMutator: any) {
        if (typeof partialStateOrMutator === 'function') {
          ; (store as any).$patch(partialStateOrMutator)
        } else {
          ; (store as any).$patch(partialStateOrMutator)
        }
      },

      $subscribe(callback, subscribeOptions) {
        const unsubscribe = store.$subscribe(callback as any, subscribeOptions)

        // 如果不是分离订阅，添加到订阅管理器
        if (!subscribeOptions?.detached) {
          subscriptionManager.add(unsubscribe)
        }

        return unsubscribe
      },

      $onAction(callback) {
        const unsubscribe = store.$onAction(callback as any)
        // 添加到订阅管理器
        subscriptionManager.add(unsubscribe)
        return unsubscribe
      },

      $dispose() {
        // 清理所有订阅
        subscriptionManager.dispose()

        // 清理性能优化器
        optimizer.dispose()
      },

      $persist() {
        if (options.persist) {
          optimizer.persistence.save(options.id, instance.$state)
        }
      },

      $hydrate() {
        if (options.persist) {
          const persistedState = optimizer.persistence.load(options.id)
          if (persistedState) {
            ; (store as any).$patch(persistedState)
          }
        }
      },

      $clearPersisted() {
        optimizer.persistence.remove(options.id)
      },

      $getCache(key: string) {
        return optimizer.cache.get(`${options.id}:${key}`)
      },

      $setCache(key: string, value: any, ttl?: number) {
        optimizer.cache.set(`${options.id}:${key}`, value, ttl)
      },

      $deleteCache(key: string) {
        return optimizer.cache.delete(`${options.id}:${key}`)
      },

      $clearCache() {
        optimizer.cache.clear()
      },

      getStore() {
        return store
      },

      getStoreDefinition() {
        return storeDefinition
      },
    }

    return instance
  }
}

/**
 * 简化的 Composition Store 创建器
 */
export function defineCompositionStore<T = any>(
  id: string,
  setup: CompositionStoreSetup<T>
): () => CompositionStoreInstance<T> {
  return createCompositionStore({ id }, setup)
}

/**
 * 带配置的 Composition Store 创建器
 */
export function defineCompositionStoreWithOptions<T = any>(
  options: CompositionStoreOptions,
  setup: CompositionStoreSetup<T>
): () => CompositionStoreInstance<T> {
  return createCompositionStore(options, setup)
}
