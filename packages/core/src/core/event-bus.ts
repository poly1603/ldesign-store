/**
 * 事件总线实现
 *
 * 提供事件的发布/订阅功能
 * @module core/event-bus
 */

import type { EventBus, EventData, EventListener, EventType, Unsubscribe } from '../types'

/**
 * 创建事件总线
 *
 * @returns 事件总线实例
 *
 * @example
 * ```typescript
 * const bus = createEventBus()
 *
 * // 监听事件
 * const unsubscribe = bus.on('state:changed', (data) => {
 *   console.log('状态变化:', data)
 * })
 *
 * // 发送事件
 * bus.emit('state:changed', { storeId: 'counter', newValue: 1 })
 *
 * // 取消监听
 * unsubscribe()
 * ```
 */
export function createEventBus(): EventBus {
  /** 事件监听器映射 */
  const listeners = new Map<EventType | '*', Set<EventListener>>()

  /**
   * 获取或创建监听器集合
   */
  const getListeners = (type: EventType | '*'): Set<EventListener> => {
    let set = listeners.get(type)
    if (!set) {
      set = new Set()
      listeners.set(type, set)
    }
    return set
  }

  /**
   * 监听事件
   */
  const on = (type: EventType | '*', listener: EventListener): Unsubscribe => {
    const set = getListeners(type)
    set.add(listener)

    return () => {
      set.delete(listener)
      if (set.size === 0) {
        listeners.delete(type)
      }
    }
  }

  /**
   * 监听一次
   */
  const once = (type: EventType, listener: EventListener): Unsubscribe => {
    const wrappedListener: EventListener = (data) => {
      listener(data)
      off(type, wrappedListener)
    }
    return on(type, wrappedListener)
  }

  /**
   * 取消监听
   */
  const off = (type: EventType | '*', listener?: EventListener): void => {
    if (listener) {
      const set = listeners.get(type)
      if (set) {
        set.delete(listener)
        if (set.size === 0) {
          listeners.delete(type)
        }
      }
    }
    else {
      listeners.delete(type)
    }
  }

  /**
   * 发送事件
   */
  const emit = (type: EventType, payload?: unknown): void => {
    const data: EventData = {
      type,
      payload,
      timestamp: Date.now(),
    }

    // 触发特定类型的监听器
    const typeListeners = listeners.get(type)
    if (typeListeners) {
      typeListeners.forEach(listener => listener(data))
    }

    // 触发通配符监听器
    const wildcardListeners = listeners.get('*')
    if (wildcardListeners) {
      wildcardListeners.forEach(listener => listener(data))
    }
  }

  /**
   * 清空所有监听器
   */
  const clear = (): void => {
    listeners.clear()
  }

  return {
    on,
    once,
    off,
    emit,
    clear,
  }
}

/**
 * 全局事件总线实例
 */
export const globalEventBus = createEventBus()

