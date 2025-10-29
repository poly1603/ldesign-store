/**
 * 订阅管理器
 * 
 * 使用优先级桶机制优化性能
 * 
 * @module subscription/subscription-manager
 */

import type { EventCallback, Unsubscribe } from '../types'

/**
 * 订阅管理器
 * 
 * ⚡ 性能优化:
 * - 使用优先级桶避免每次排序
 * - Set 数据结构提供 O(1) 添加/删除
 * - 监听器数量限制防止内存泄漏
 * 
 * @example
 * ```typescript
 * const manager = new SubscriptionManager({ maxListeners: 100 })
 * 
 * const unsubscribe = manager.subscribe('update', (data) => {
 *   console.log('Updated:', data)
 * }, 10) // 优先级 10
 * 
 * manager.notify('update', { value: 42 })
 * 
 * unsubscribe()
 * ```
 */
export class SubscriptionManager {
  private subscriptions = new Map<string, Set<EventCallback>>()
  private priorityBuckets = new Map<number, Set<EventCallback>>()
  private callbackPriorities = new WeakMap<EventCallback, number>()
  private maxListeners: number
  private listenerCount = 0

  constructor(options: { maxListeners?: number } = {}) {
    this.maxListeners = options.maxListeners ?? 1000
  }

  /**
   * 订阅事件
   * 
   * ⚡ 性能: O(1)
   * 
   * @param event - 事件名称
   * @param callback - 回调函数
   * @param priority - 优先级（数字越大优先级越高）
   * @returns 取消订阅函数
   */
  subscribe(event: string, callback: EventCallback, priority = 0): Unsubscribe {
    // 检查监听器数量限制
    if (this.listenerCount >= this.maxListeners) {
      console.warn(
        `[SubscriptionManager] 已达到最大监听器数量 (${this.maxListeners})，无法添加更多订阅`
      )
      return () => { }
    }

    // 使用优先级桶避免每次排序
    if (!this.priorityBuckets.has(priority)) {
      this.priorityBuckets.set(priority, new Set())
    }
    this.priorityBuckets.get(priority)!.add(callback)
    this.callbackPriorities.set(callback, priority)

    // 添加到事件订阅
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set())
    }
    this.subscriptions.get(event)!.add(callback)

    this.listenerCount++

    return () => this.unsubscribe(event, callback)
  }

  /**
   * 取消订阅
   * 
   * ⚡ 性能: O(1)
   * 
   * @param event - 事件名称
   * @param callback - 回调函数
   */
  unsubscribe(event: string, callback: EventCallback): void {
    const callbacks = this.subscriptions.get(event)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.subscriptions.delete(event)
      }
      this.listenerCount--
    }

    // 从优先级桶中移除
    const priority = this.callbackPriorities.get(callback)
    if (priority !== undefined) {
      const bucket = this.priorityBuckets.get(priority)
      if (bucket) {
        bucket.delete(callback)
        if (bucket.size === 0) {
          this.priorityBuckets.delete(priority)
        }
      }
      this.callbackPriorities.delete(callback)
    }
  }

  /**
   * 通知订阅者
   * 
   * ⚡ 性能: O(k)，其中 k 是订阅者数量
   * 
   * @param event - 事件名称
   * @param data - 事件数据
   */
  notify<T = any>(event: string, data: T): void {
    const callbacks = this.subscriptions.get(event)
    if (!callbacks || callbacks.size === 0) return

    // 按优先级顺序执行（优先级桶已排序）
    const priorities = Array.from(this.priorityBuckets.keys()).sort((a, b) => b - a)

    for (const priority of priorities) {
      const bucket = this.priorityBuckets.get(priority)!
      for (const callback of bucket) {
        if (callbacks.has(callback)) {
          try {
            callback(data)
          }
          catch (error) {
            console.error('[SubscriptionManager] 回调执行错误:', error)
          }
        }
      }
    }
  }

  /**
   * 清空所有订阅
   */
  clear(): void {
    this.subscriptions.clear()
    this.priorityBuckets.clear()
    this.listenerCount = 0
  }

  /**
   * 获取事件的订阅者数量
   * 
   * @param event - 事件名称
   * @returns 订阅者数量
   */
  count(event: string): number {
    return this.subscriptions.get(event)?.size ?? 0
  }

  /**
   * 获取总订阅者数量
   * 
   * @returns 总订阅者数量
   */
  totalCount(): number {
    return this.listenerCount
  }
}



