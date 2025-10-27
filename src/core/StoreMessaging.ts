/**
 * Store 消息总线
 * 
 * 提供 Store 之间的解耦通信机制。
 * 基于发布-订阅模式，允许 Store 之间通过事件进行通信，而无需直接引用。
 * 
 * @example
 * ```typescript
 * // 在 UserStore 中发布事件
 * class UserStore extends BaseStore {
 *   @Action()
 *   async login(credentials: Credentials) {
 *     const user = await api.login(credentials)
 *     this.currentUser = user
 *     
 *     // 发布登录成功事件
 *     storeMessenger.emit('user:logged-in', { user })
 *   }
 * }
 * 
 * // 在 NotificationStore 中订阅事件
 * class NotificationStore extends BaseStore {
 *   constructor() {
 *     super('notification', {})
 *     
 *     // 订阅登录成功事件
 *     storeMessenger.on('user:logged-in', ({ user }) => {
 *       this.showNotification(`欢迎回来，${user.name}！`)
 *     })
 *   }
 * }
 * ```
 */

import { SubscriptionManager } from './SubscriptionManager'

/**
 * 事件回调函数类型
 */
export type EventCallback<T = any> = (data: T) => void

/**
 * 事件订阅选项
 */
export interface SubscribeOptions {
  /** 是否只订阅一次 */
  once?: boolean
  /** 订阅优先级（数字越大优先级越高） */
  priority?: number
}

/**
 * 事件监听器信息
 */
interface EventListener<T = any> {
  callback: EventCallback<T>
  once: boolean
  priority: number
}

/**
 * Store 消息总线（单例模式）
 * 
 * 提供全局的 Store 间通信能力。
 * 支持事件发布、订阅、取消订阅等操作。
 */
export class StoreMessenger {
  /** 事件监听器映射表 */
  private events = new Map<string, Set<EventListener>>()

  /** 事件历史记录（用于调试） */
  private eventHistory: Array<{ event: string; data: any; timestamp: number }> = []

  /** 是否启用事件历史记录 */
  private enableHistory = false

  /** 最大历史记录数 */
  private maxHistorySize = 100

  /** 订阅管理器 */
  private subscriptionManager = new SubscriptionManager()

  /**
   * 发布事件
   * 
   * 向所有订阅该事件的监听器发送消息。
   * 监听器按优先级从高到低执行。
   * 
   * @param event - 事件名称
   * @param data - 事件数据
   * 
   * @example
   * ```typescript
   * messenger.emit('user:updated', { userId: 1, name: '张三' })
   * ```
   */
  emit<T = any>(event: string, data?: T): void {
    // 记录事件历史
    if (this.enableHistory) {
      this.eventHistory.push({
        event,
        data,
        timestamp: Date.now(),
      })

      // 限制历史记录大小
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift()
      }
    }

    const listeners = this.events.get(event)
    if (!listeners || listeners.size === 0) {
      return
    }

    // 按优先级排序监听器
    const sortedListeners = Array.from(listeners).sort((a, b) => b.priority - a.priority)

    // 执行所有监听器
    for (const listener of sortedListeners) {
      try {
        listener.callback(data)
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error)
      }

      // 如果是一次性监听器，执行后移除
      if (listener.once) {
        listeners.delete(listener)
      }
    }

    // 如果没有监听器了，删除事件
    if (listeners.size === 0) {
      this.events.delete(event)
    }
  }

  /**
   * 订阅事件
   * 
   * 注册一个事件监听器。
   * 返回取消订阅的函数。
   * 
   * @param event - 事件名称
   * @param callback - 回调函数
   * @param options - 订阅选项
   * @returns 取消订阅的函数
   * 
   * @example
   * ```typescript
   * const unsubscribe = messenger.on('user:updated', (user) => {
   *   console.log('用户更新:', user)
   * })
   * 
   * // 取消订阅
   * unsubscribe()
   * ```
   */
  on<T = any>(
    event: string,
    callback: EventCallback<T>,
    options: SubscribeOptions = {}
  ): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    const listener: EventListener<T> = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
    }

    this.events.get(event)!.add(listener)

    // 返回取消订阅函数
    const unsubscribe = () => {
      const listeners = this.events.get(event)
      if (listeners) {
        listeners.delete(listener)
        if (listeners.size === 0) {
          this.events.delete(event)
        }
      }
    }

    return unsubscribe
  }

  /**
   * 一次性订阅事件
   * 
   * 监听器只会被触发一次，然后自动取消订阅。
   * 
   * @param event - 事件名称
   * @param callback - 回调函数
   * @param priority - 优先级
   * @returns 取消订阅的函数
   * 
   * @example
   * ```typescript
   * messenger.once('app:initialized', () => {
   *   console.log('应用初始化完成')
   * })
   * ```
   */
  once<T = any>(event: string, callback: EventCallback<T>, priority = 0): () => void {
    return this.on(event, callback, { once: true, priority })
  }

  /**
   * 取消订阅事件
   * 
   * 移除指定事件的所有监听器，或移除所有事件的监听器。
   * 
   * @param event - 事件名称（可选，不传则移除所有事件）
   * 
   * @example
   * ```typescript
   * // 移除特定事件的所有监听器
   * messenger.off('user:updated')
   * 
   * // 移除所有事件的监听器
   * messenger.off()
   * ```
   */
  off(event?: string): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }

  /**
   * 检查是否有事件监听器
   * 
   * @param event - 事件名称（可选，不传则检查是否有任何监听器）
   * @returns 是否有监听器
   * 
   * @example
   * ```typescript
   * if (messenger.hasListeners('user:updated')) {
   *   messenger.emit('user:updated', user)
   * }
   * ```
   */
  hasListeners(event?: string): boolean {
    if (event) {
      const listeners = this.events.get(event)
      return listeners ? listeners.size > 0 : false
    }
    return this.events.size > 0
  }

  /**
   * 获取事件的监听器数量
   * 
   * @param event - 事件名称
   * @returns 监听器数量
   */
  getListenerCount(event: string): number {
    const listeners = this.events.get(event)
    return listeners ? listeners.size : 0
  }

  /**
   * 获取所有事件名称
   * 
   * @returns 事件名称数组
   */
  getEventNames(): string[] {
    return Array.from(this.events.keys())
  }

  /**
   * 启用事件历史记录
   * 
   * 启用后会记录所有发布的事件，用于调试。
   * 
   * @param maxSize - 最大历史记录数（默认 100）
   */
  enableEventHistory(maxSize = 100): void {
    this.enableHistory = true
    this.maxHistorySize = maxSize
  }

  /**
   * 禁用事件历史记录
   */
  disableEventHistory(): void {
    this.enableHistory = false
    this.eventHistory = []
  }

  /**
   * 获取事件历史记录
   * 
   * @returns 事件历史记录数组
   */
  getEventHistory(): ReadonlyArray<{ event: string; data: any; timestamp: number }> {
    return this.eventHistory
  }

  /**
   * 清除事件历史记录
   */
  clearEventHistory(): void {
    this.eventHistory = []
  }

  /**
   * 等待事件发生
   * 
   * 返回一个 Promise，在事件触发时解析。
   * 
   * @param event - 事件名称
   * @param timeout - 超时时间（毫秒），0 表示不超时
   * @returns Promise，解析为事件数据
   * 
   * @example
   * ```typescript
   * // 等待用户登录
   * const user = await messenger.waitFor('user:logged-in', 5000)
   * console.log('用户已登录:', user)
   * ```
   */
  waitFor<T = any>(event: string, timeout = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      // 设置超时
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          unsubscribe()
          reject(new Error(`Timeout waiting for event "${event}"`))
        }, timeout)
      }

      // 订阅事件
      const unsubscribe = this.once(event, (data) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        resolve(data)
      })
    })
  }

  /**
   * 清理所有资源
   * 
   * 移除所有监听器和历史记录。
   */
  dispose(): void {
    this.events.clear()
    this.eventHistory = []
    this.subscriptionManager.dispose()
  }

  /**
   * 获取统计信息
   * 
   * @returns 包含事件数量和监听器总数的对象
   */
  getStats(): {
    eventCount: number
    totalListeners: number
    events: Array<{ name: string; listenerCount: number }>
  } {
    const events: Array<{ name: string; listenerCount: number }> = []
    let totalListeners = 0

    for (const [name, listeners] of this.events) {
      const count = listeners.size
      events.push({ name, listenerCount: count })
      totalListeners += count
    }

    return {
      eventCount: this.events.size,
      totalListeners,
      events,
    }
  }
}

/**
 * 全局 Store 消息总线实例
 * 
 * 可以在整个应用中使用的单例实例。
 * 
 * @example
 * ```typescript
 * import { storeMessenger } from '@ldesign/store'
 * 
 * // 发布事件
 * storeMessenger.emit('data:updated', { id: 1 })
 * 
 * // 订阅事件
 * storeMessenger.on('data:updated', (data) => {
 *   console.log('数据更新:', data)
 * })
 * ```
 */
export const storeMessenger = new StoreMessenger()

/**
 * 创建独立的消息总线实例
 * 
 * 用于需要隔离的场景（如测试、多租户等）。
 * 
 * @returns 新的消息总线实例
 * 
 * @example
 * ```typescript
 * const messenger = createStoreMessenger()
 * ```
 */
export function createStoreMessenger(): StoreMessenger {
  return new StoreMessenger()
}


