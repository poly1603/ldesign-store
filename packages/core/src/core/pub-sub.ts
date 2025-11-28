/**
 * 发布订阅模式实现
 *
 * @module core/pub-sub
 */

import type { PubSub, Subscriber, SubscriptionOptions, Unsubscribe } from '../types'

/**
 * 订阅者信息
 */
interface SubscriberInfo<T> {
  /** 回调函数 */
  callback: Subscriber<T>
  /** 订阅选项 */
  options: SubscriptionOptions
}

/**
 * 创建发布订阅管理器
 *
 * @template T - 数据类型
 * @returns 发布订阅管理器实例
 *
 * @example
 * ```typescript
 * const pubsub = createPubSub<number>()
 *
 * // 订阅
 * const unsubscribe = pubsub.subscribe((value, oldValue) => {
 *   console.log(`值从 ${oldValue} 变为 ${value}`)
 * })
 *
 * // 发布
 * pubsub.publish(1, 0)
 *
 * // 取消订阅
 * unsubscribe()
 * ```
 */
export function createPubSub<T = unknown>(): PubSub<T> {
  /** 订阅者列表 */
  const subscribers = new Set<SubscriberInfo<T>>()

  /**
   * 订阅
   */
  const subscribe = (
    callback: Subscriber<T>,
    options: SubscriptionOptions = {},
  ): Unsubscribe => {
    const info: SubscriberInfo<T> = {
      callback,
      options,
    }
    subscribers.add(info)

    return () => {
      subscribers.delete(info)
    }
  }

  /**
   * 发布
   */
  const publish = (value: T, oldValue?: T): void => {
    subscribers.forEach((info) => {
      try {
        info.callback(value, oldValue)
      }
      catch (error) {
        console.error('[PubSub] 订阅回调执行出错:', error)
      }
    })
  }

  /**
   * 清空所有订阅
   */
  const clear = (): void => {
    subscribers.clear()
  }

  /**
   * 获取订阅者数量
   */
  const size = (): number => {
    return subscribers.size
  }

  return {
    subscribe,
    publish,
    clear,
    size,
  }
}

/**
 * 创建带立即执行的发布订阅管理器
 *
 * @template T - 数据类型
 * @param initialValue - 初始值
 * @returns 发布订阅管理器实例
 */
export function createPubSubWithValue<T>(initialValue: T): PubSub<T> & {
  getValue: () => T
  setValue: (value: T) => void
} {
  let currentValue = initialValue
  const pubsub = createPubSub<T>()

  const getValue = (): T => currentValue

  const setValue = (value: T): void => {
    const oldValue = currentValue
    currentValue = value
    pubsub.publish(value, oldValue)
  }

  const subscribe = (
    callback: Subscriber<T>,
    options: SubscriptionOptions = {},
  ): Unsubscribe => {
    const unsubscribe = pubsub.subscribe(callback, options)

    // 立即执行
    if (options.immediate) {
      callback(currentValue)
    }

    return unsubscribe
  }

  return {
    subscribe,
    publish: pubsub.publish,
    clear: pubsub.clear,
    size: pubsub.size,
    getValue,
    setValue,
  }
}

