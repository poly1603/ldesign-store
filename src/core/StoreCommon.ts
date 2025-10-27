/**
 * Store 公共功能模块
 * 
 * 提取 BaseStore、FunctionalStore、CompositionStore 的公共代码，
 * 避免代码重复，提高可维护性。
 * 
 * **核心功能**:
 * - 持久化管理
 * - 缓存管理
 * - 订阅管理
 * - 状态 patch 操作
 * 
 * @module StoreCommon
 */

import type { Store } from 'pinia'
import type { PersistOptions } from '../types'
import { SubscriptionManager } from './SubscriptionManager'
import { LRUCache } from '../utils/cache'

/**
 * 持久化管理器
 * 
 * 提供统一的状态持久化功能，支持多种存储后端。
 */
export class StorePersistenceManager {
  private storage: Storage
  private key: string
  private paths?: string[]
  private serializer: {
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }

  /**
   * 创建持久化管理器
   * 
   * @param storeId - Store ID
   * @param options - 持久化配置选项
   * 
   * @example
   * ```typescript
   * const persistManager = new StorePersistenceManager('user', {
   *   storage: localStorage,
   *   paths: ['profile', 'settings']
   * })
   * ```
   */
  constructor(storeId: string, options: PersistOptions = {}) {
    this.storage = options.storage || localStorage
    this.key = options.key || `store_${storeId}`
    this.paths = options.paths
    this.serializer = options.serializer || {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    }
  }

  /**
   * 保存状态到存储
   * 
   * @param state - 要保存的状态对象
   * 
   * @example
   * ```typescript
   * persistManager.save(store.$state)
   * ```
   */
  save(state: any): void {
    try {
      let dataToSave = state

      // 如果指定了 paths，只保存指定的字段
      if (this.paths && this.paths.length > 0) {
        dataToSave = {}
        for (const path of this.paths) {
          if (path in state) {
            dataToSave[path] = state[path]
          }
        }
      }

      const serialized = this.serializer.serialize(dataToSave)
      this.storage.setItem(this.key, serialized)
    } catch (error) {
      console.error('Failed to persist state:', error)
    }
  }

  /**
   * 从存储加载状态
   * 
   * @returns 加载的状态对象，如果失败返回 null
   * 
   * @example
   * ```typescript
   * const savedState = persistManager.load()
   * if (savedState) {
   *   store.$patch(savedState)
   * }
   * ```
   */
  load(): any | null {
    try {
      const serialized = this.storage.getItem(this.key)
      if (!serialized) return null

      return this.serializer.deserialize(serialized)
    } catch (error) {
      console.error('Failed to load persisted state:', error)
      return null
    }
  }

  /**
   * 清除持久化的状态
   * 
   * @example
   * ```typescript
   * persistManager.clear()
   * ```
   */
  clear(): void {
    try {
      this.storage.removeItem(this.key)
    } catch (error) {
      console.error('Failed to clear persisted state:', error)
    }
  }
}

/**
 * 缓存管理器（公共）
 * 
 * 为 Store 提供统一的缓存功能。
 */
export class StoreCacheManager {
  private cache: LRUCache<string, any>

  /**
   * 创建缓存管理器
   * 
   * @param maxSize - 最大缓存数量
   * @param defaultTTL - 默认过期时间（毫秒）
   * 
   * @example
   * ```typescript
   * const cacheManager = new StoreCacheManager(100, 5 * 60 * 1000)
   * ```
   */
  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.cache = new LRUCache(maxSize, defaultTTL)
  }

  /**
   * 获取缓存值
   * 
   * @param key - 缓存键
   * @returns 缓存的值，如果不存在或已过期返回 undefined
   */
  get(key: string): any | undefined {
    return this.cache.get(key)
  }

  /**
   * 设置缓存值
   * 
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（毫秒），可选
   */
  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, ttl)
  }

  /**
   * 删除缓存值
   * 
   * @param key - 缓存键
   * @returns 是否成功删除
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   * 
   * @returns 当前缓存的数量
   */
  size(): number {
    return this.cache.size()
  }

  /**
   * 销毁缓存管理器
   * 
   * 清理所有资源，包括定时器。
   */
  dispose(): void {
    this.cache.dispose()
  }
}

/**
 * Store 通用方法混入
 * 
 * 提供 $patch、$subscribe、$dispose 等通用方法的实现。
 */
export interface StoreCommonMethods {
  /**
   * 部分更新状态
   * 
   * @param partialStateOrMutator - 部分状态对象或修改函数
   */
  $patch(partialStateOrMutator: any): void

  /**
   * 订阅状态变化
   * 
   * @param callback - 状态变化回调函数
   * @param options - 订阅选项
   * @returns 取消订阅函数
   */
  $subscribe(
    callback: (mutation: any, state: any) => void,
    options?: { detached?: boolean }
  ): () => void

  /**
   * 重置状态到初始值
   */
  $reset(): void

  /**
   * 销毁 Store，清理所有资源
   */
  $dispose(): void

  /**
   * 持久化状态
   */
  $persist(): void

  /**
   * 从持久化存储恢复状态
   */
  $hydrate(): void

  /**
   * 清除持久化的状态
   */
  $clearPersisted(): void

  /**
   * 获取缓存值
   * 
   * @param key - 缓存键
   */
  $getCache(key: string): any

  /**
   * 设置缓存值
   * 
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttl - 过期时间（毫秒）
   */
  $setCache(key: string, value: any, ttl?: number): void

  /**
   * 删除缓存值
   * 
   * @param key - 缓存键
   */
  $deleteCache(key: string): boolean

  /**
   * 清空所有缓存
   */
  $clearCache(): void
}

/**
 * 创建通用 Store 方法
 * 
 * 为 Store 实例添加通用方法，避免代码重复。
 * 
 * @param store - Pinia Store 实例
 * @param initialState - 初始状态
 * @param subscriptionManager - 订阅管理器
 * @param cacheManager - 缓存管理器（可选）
 * @param persistenceManager - 持久化管理器（可选）
 * @returns 包含通用方法的对象
 * 
 * @example
 * ```typescript
 * const commonMethods = createStoreCommonMethods(
 *   store,
 *   initialState,
 *   subscriptionManager,
 *   cacheManager,
 *   persistenceManager
 * )
 * 
 * // 添加到 Store 实例
 * Object.assign(storeInstance, commonMethods)
 * ```
 */
export function createStoreCommonMethods(
  store: Store<string, any, any, any>,
  initialState: any,
  subscriptionManager: SubscriptionManager,
  cacheManager?: StoreCacheManager,
  persistenceManager?: StorePersistenceManager
): StoreCommonMethods {
  return {
    // 部分更新状态
    $patch(partialStateOrMutator: any): void {
      if (typeof partialStateOrMutator === 'function') {
        partialStateOrMutator(store.$state)
      } else {
        store.$patch(partialStateOrMutator)
      }
    },

    // 订阅状态变化
    $subscribe(
      callback: (mutation: any, state: any) => void,
      options?: { detached?: boolean }
    ): () => void {
      const unsubscribe = store.$subscribe(callback, options)

      if (!options?.detached) {
        subscriptionManager.add(unsubscribe)
      }

      return unsubscribe
    },

    // 重置状态
    $reset(): void {
      store.$patch(initialState)
    },

    // 销毁 Store
    $dispose(): void {
      subscriptionManager.clear()
      cacheManager?.dispose()
      store.$dispose()
    },

    // 持久化状态
    $persist(): void {
      if (persistenceManager) {
        persistenceManager.save(store.$state)
      }
    },

    // 恢复持久化状态
    $hydrate(): void {
      if (persistenceManager) {
        const savedState = persistenceManager.load()
        if (savedState) {
          store.$patch(savedState)
        }
      }
    },

    // 清除持久化状态
    $clearPersisted(): void {
      if (persistenceManager) {
        persistenceManager.clear()
      }
    },

    // 缓存操作
    $getCache(key: string): any {
      return cacheManager?.get(key)
    },

    $setCache(key: string, value: any, ttl?: number): void {
      cacheManager?.set(key, value, ttl)
    },

    $deleteCache(key: string): boolean {
      return cacheManager?.delete(key) || false
    },

    $clearCache(): void {
      cacheManager?.clear()
    },
  }
}

/**
 * 创建初始化配置
 * 
 * 处理持久化、缓存等通用配置。
 * 
 * @param storeId - Store ID
 * @param persist - 持久化配置
 * @param cache - 缓存配置
 * @returns 初始化配置对象
 */
export function createStoreConfig(
  storeId: string,
  persist?: boolean | PersistOptions,
  cache?: { maxSize?: number; defaultTTL?: number }
) {
  // 持久化管理器
  let persistenceManager: StorePersistenceManager | undefined
  if (persist) {
    const persistOptions = typeof persist === 'object' ? persist : {}
    persistenceManager = new StorePersistenceManager(storeId, persistOptions)
  }

  // 缓存管理器
  let cacheManager: StoreCacheManager | undefined
  if (cache) {
    cacheManager = new StoreCacheManager(
      cache.maxSize || 100,
      cache.defaultTTL || 5 * 60 * 1000
    )
  }

  return {
    persistenceManager,
    cacheManager,
  }
}

/**
 * 通用的状态深拷贝函数
 * 
 * 创建状态的深拷贝，用于重置等操作。
 * 
 * @param state - 要拷贝的状态对象
 * @returns 深拷贝后的状态对象
 */
export function cloneState<T>(state: T): T {
  if (typeof structuredClone !== 'undefined') {
    try {
      return structuredClone(state)
    } catch {
      // 继续使用 JSON 方式
    }
  }

  try {
    return JSON.parse(JSON.stringify(state))
  } catch {
    // 如果 JSON 序列化失败，返回原对象
    console.warn('Failed to clone state, returning original')
    return state
  }
}

