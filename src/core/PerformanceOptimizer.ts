/**
 * 性能优化器
 * 提供状态持久化、缓存、防抖等性能优化功能
 */

import type { PersistOptions } from '../types'
import { LRUCache } from '../utils/cache'
import { TimerManager } from './TimerManager'

/**
 * 缓存管理器
 * 使用 LRU 缓存策略，自动淘汰最少使用的条目
 */
export class CacheManager {
  private cache: LRUCache<string, any>

  constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) {
    this.cache = new LRUCache(maxSize, defaultTTL)
  }

  /**
   * 设置缓存
   */
  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, ttl)
  }

  /**
   * 获取缓存
   */
  get(key: string): any {
    return this.cache.get(key)
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size()
  }

  /**
   * 清理过期缓存（LRU 缓存会自动清理）
   */
  cleanup(): void {
    // LRU 缓存内部已经有定期清理机制
  }

  /**
   * 销毁缓存管理器
   */
  dispose(): void {
    this.cache.dispose()
  }
}

/**
 * 持久化管理器
 */
export class PersistenceManager {
  private storage: Storage
  private serializer: {
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }

  constructor(options: PersistOptions = {}) {
    this.storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : {} as Storage)
    this.serializer = options.serializer || {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    }
  }

  /**
   * 保存状态（优化版：减少序列化开销）
   */
  save(key: string, state: any, paths?: string[]): void {
    try {
      // 快速检查：如果状态为空则跳过
      if (!state || (typeof state === 'object' && Object.keys(state).length === 0)) {
        return
      }

      // 检查状态是否有效
      if (state === undefined || state === null) {
        this.storage.removeItem(key)
        return
      }

      let dataToSave = state

      // 如果指定了路径，只保存指定的字段
      if (paths && paths.length > 0) {
        dataToSave = {}
        for (const path of paths) {
          if (path in state && state[path] !== undefined) {
            dataToSave[path] = state[path]
          }
        }
      }

      // 确保有数据要保存
      if (dataToSave === undefined || (typeof dataToSave === 'object' && Object.keys(dataToSave).length === 0)) {
        this.storage.removeItem(key)
        return
      }

      const serialized = this.serializer.serialize(dataToSave)
      this.storage.setItem(key, serialized)
    } catch (error) {
      console.warn(`Failed to persist state for key "${key}":`, error)
    }
  }

  /**
   * 加载状态
   */
  load(key: string): any {
    try {
      const serialized = this.storage.getItem(key)
      if (serialized === null || serialized === 'undefined' || serialized === 'null') {
        return null
      }

      return this.serializer.deserialize(serialized)
    } catch (error) {
      console.warn(`Failed to load persisted state for key "${key}":`, error)
      // 清理无效的存储数据
      try {
        this.storage.removeItem(key)
      } catch {
        // 忽略清理错误
      }
      return null
    }
  }

  /**
   * 删除持久化状态
   */
  remove(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to remove persisted state for key "${key}":`, error)
    }
  }

  /**
   * 清空所有持久化状态
   */
  clear(): void {
    try {
      this.storage.clear()
    } catch (error) {
      console.warn('Failed to clear persisted state:', error)
    }
  }
}

/**
 * 防抖管理器（优化版）
 * 
 * 使用 TimerManager 统一管理定时器，确保正确清理。
 * 防抖可以延迟函数执行，只在最后一次调用后的指定时间执行。
 */
export class DebounceManager {
  private timers = new Map<string, NodeJS.Timeout>()
  private timerManager = new TimerManager()

  /**
   * 防抖执行
   * 
   * 创建一个防抖函数，在连续调用时只执行最后一次。
   * 
   * @param key - 防抖键，用于区分不同的防抖操作
   * @param fn - 要防抖的函数
   * @param delay - 延迟时间（毫秒）
   * @returns 防抖包装后的函数
   * 
   * @example
   * ```typescript
   * const debouncedSearch = debounceManager.debounce(
   *   'search',
   *   async (query: string) => {
   *     return await api.search(query)
   *   },
   *   300
   * )
   * ```
   */
  debounce<T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve, reject) => {
        // 清除之前的定时器
        const existingTimer = this.timers.get(key)
        if (existingTimer) {
          this.timerManager.clearTimeout(existingTimer)
          this.timers.delete(key)
        }

        // 设置新的定时器（使用 TimerManager）
        const timer = this.timerManager.setTimeout(async () => {
          try {
            const result = await fn(...args)
            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            this.timers.delete(key)
          }
        }, delay)

        this.timers.set(key, timer)
      })
    }
  }

  /**
   * 取消防抖
   * 
   * 取消指定键的防抖定时器。
   * 
   * @param key - 防抖键
   */
  cancel(key: string): void {
    const timer = this.timers.get(key)
    if (timer) {
      this.timerManager.clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  /**
   * 清空所有防抖
   * 
   * 取消所有防抖定时器。
   */
  clear(): void {
    for (const timer of this.timers.values()) {
      this.timerManager.clearTimeout(timer)
    }
    this.timers.clear()
  }

  /**
   * 销毁防抖管理器
   * 
   * 清除所有定时器并销毁 TimerManager。
   */
  dispose(): void {
    this.clear()
    this.timerManager.dispose()
  }
}

/**
 * 节流管理器
 */
export class ThrottleManager {
  private lastExecution = new Map<string, number>()

  /**
   * 节流执行
   */
  throttle<T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      const now = Date.now()
      const lastTime = this.lastExecution.get(key) || 0

      if (now - lastTime >= delay) {
        this.lastExecution.set(key, now)
        return fn(...args)
      }

      return undefined
    }
  }

  /**
   * 重置节流状态
   */
  reset(key: string): void {
    this.lastExecution.delete(key)
  }

  /**
   * 清空所有节流状态
   */
  clear(): void {
    this.lastExecution.clear()
  }
}

/**
 * 性能优化器主类（增强版）
 * 
 * 集成缓存、持久化、防抖、节流等性能优化功能。
 * 统一管理所有性能优化资源，确保正确清理。
 * 
 * @example
 * ```typescript
 * const optimizer = new PerformanceOptimizer({
 *   cache: { maxSize: 1000, defaultTTL: 5000 },
 *   persistence: { storage: localStorage }
 * })
 * 
 * // 使用缓存
 * optimizer.cache.set('key', value, 10000)
 * 
 * // 使用持久化
 * optimizer.persistence.save('store-id', state)
 * 
 * // 清理资源
 * optimizer.dispose()
 * ```
 */
export class PerformanceOptimizer {
  /** 缓存管理器 */
  public readonly cache: CacheManager

  /** 持久化管理器 */
  public readonly persistence: PersistenceManager

  /** 防抖管理器 */
  public readonly debounce: DebounceManager

  /** 节流管理器 */
  public readonly throttle: ThrottleManager

  /**
   * 创建性能优化器实例
   * 
   * @param options - 配置选项
   * @param options.cache - 缓存配置
   * @param options.persistence - 持久化配置
   */
  constructor(options: {
    cache?: { maxSize?: number; defaultTTL?: number }
    persistence?: PersistOptions
  } = {}) {
    this.cache = new CacheManager(
      options.cache?.maxSize,
      options.cache?.defaultTTL
    )
    this.persistence = new PersistenceManager(options.persistence)
    this.debounce = new DebounceManager()
    this.throttle = new ThrottleManager()
  }

  /**
   * 清理所有资源
   * 
   * 销毁优化器并清理所有相关资源（缓存、定时器等）。
   * 调用此方法后，优化器将不可再使用。
   */
  dispose(): void {
    // 清理缓存（包括定时器）
    this.cache.dispose()

    // 清理防抖（包括 TimerManager）
    this.debounce.dispose()

    // 清理节流
    this.throttle.clear()
  }

  /**
   * 清空所有缓存（向后兼容）
   * 
   * 清空缓存和防抖/节流状态，但不销毁优化器。
   */
  clear(): void {
    this.cache.clear()
    this.debounce.clear()
    this.throttle.clear()
  }
}
