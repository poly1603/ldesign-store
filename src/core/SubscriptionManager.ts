/**
 * 统一的订阅管理器
 * 
 * 集中管理所有订阅（监听器、观察者等），确保在组件卸载或清理时
 * 能够正确取消所有订阅，防止内存泄漏和意外的回调执行。
 * 
 * @example
 * ```typescript
 * const subscriptionManager = new SubscriptionManager()
 * 
 * // 添加订阅
 * const unsubscribe1 = store.$subscribe((mutation, state) => {
 *   console.log('状态变化:', state)
 * })
 * subscriptionManager.add(unsubscribe1)
 * 
 * // 添加 action 订阅
 * const unsubscribe2 = store.$onAction((context) => {
 *   console.log('动作执行:', context.name)
 * })
 * subscriptionManager.add(unsubscribe2)
 * 
 * // 清理所有订阅
 * subscriptionManager.dispose()
 * ```
 */
export class SubscriptionManager {
  /** 存储所有取消订阅的函数 */
  private subscriptions = new Set<() => void>()

  /** 标记管理器是否已销毁 */
  private disposed = false

  /**
   * 添加订阅
   * 
   * 将取消订阅函数添加到管理器中，以便统一清理。
   * 
   * @param unsubscribe - 取消订阅的函数
   * @returns 管理器自身，支持链式调用
   * 
   * @example
   * ```typescript
   * subscriptionManager
   *   .add(store.$subscribe(callback1))
   *   .add(store.$onAction(callback2))
   * ```
   */
  add(unsubscribe: () => void): this {
    if (this.disposed) {
      console.warn('SubscriptionManager has been disposed, subscription ignored')
      // 立即执行取消订阅，避免泄漏
      unsubscribe()
      return this
    }

    if (typeof unsubscribe !== 'function') {
      console.error('Invalid unsubscribe function:', unsubscribe)
      return this
    }

    this.subscriptions.add(unsubscribe)
    return this
  }

  /**
   * 添加多个订阅
   * 
   * @param unsubscribes - 取消订阅函数数组
   * @returns 管理器自身，支持链式调用
   * 
   * @example
   * ```typescript
   * const unsubscribes = [
   *   store.$subscribe(callback1),
   *   store.$onAction(callback2),
   *   watch(source, callback3)
   * ]
   * subscriptionManager.addAll(unsubscribes)
   * ```
   */
  addAll(unsubscribes: Array<() => void>): this {
    for (const unsubscribe of unsubscribes) {
      this.add(unsubscribe)
    }
    return this
  }

  /**
   * 移除指定订阅
   * 
   * @param unsubscribe - 要移除的取消订阅函数
   * @returns 是否成功移除
   * 
   * @example
   * ```typescript
   * const unsubscribe = store.$subscribe(callback)
   * subscriptionManager.add(unsubscribe)
   * 
   * // 稍后移除
   * subscriptionManager.remove(unsubscribe)
   * ```
   */
  remove(unsubscribe: () => void): boolean {
    if (this.subscriptions.has(unsubscribe)) {
      // 执行取消订阅
      try {
        unsubscribe()
      } catch (error) {
        console.error('Error during unsubscribe:', error)
      }

      // 从集合中移除
      this.subscriptions.delete(unsubscribe)
      return true
    }
    return false
  }

  /**
   * 取消所有订阅
   * 
   * 执行所有取消订阅函数，但不销毁管理器（仍可添加新订阅）。
   * 
   * @example
   * ```typescript
   * subscriptionManager.unsubscribeAll()
   * ```
   */
  unsubscribeAll(): void {
    for (const unsubscribe of this.subscriptions) {
      try {
        unsubscribe()
      } catch (error) {
        console.error('Error during unsubscribe:', error)
      }
    }
    this.subscriptions.clear()
  }

  /**
   * 销毁管理器
   * 
   * 取消所有订阅并标记管理器为已销毁状态。
   * 销毁后不能再添加新的订阅。
   * 
   * @example
   * ```typescript
   * subscriptionManager.dispose()
   * ```
   */
  dispose(): void {
    if (this.disposed) {
      return
    }

    this.unsubscribeAll()
    this.disposed = true
  }

  /**
   * 获取当前活跃的订阅数量
   * 
   * @returns 订阅数量
   * 
   * @example
   * ```typescript
   * console.log(`活跃订阅: ${subscriptionManager.size()} 个`)
   * ```
   */
  size(): number {
    return this.subscriptions.size
  }

  /**
   * 检查是否有活跃订阅
   * 
   * @returns 是否有订阅
   */
  hasSubscriptions(): boolean {
    return this.subscriptions.size > 0
  }

  /**
   * 检查管理器是否已销毁
   * 
   * @returns 管理器是否已销毁
   */
  isDisposed(): boolean {
    return this.disposed
  }

  /**
   * 创建一个包装的订阅函数
   * 
   * 返回一个新的取消订阅函数，执行时会同时从管理器中移除该订阅。
   * 
   * @param unsubscribe - 原始取消订阅函数
   * @returns 包装后的取消订阅函数
   * 
   * @example
   * ```typescript
   * const wrappedUnsubscribe = subscriptionManager.wrap(
   *   store.$subscribe(callback)
   * )
   * 
   * // 执行时会自动从管理器移除
   * wrappedUnsubscribe()
   * ```
   */
  wrap(unsubscribe: () => void): () => void {
    this.add(unsubscribe)

    return () => {
      this.remove(unsubscribe)
    }
  }

  /**
   * 获取管理器统计信息
   * 
   * @returns 包含订阅数量和状态的对象
   */
  getStats(): {
    subscriptions: number
    disposed: boolean
  } {
    return {
      subscriptions: this.subscriptions.size,
      disposed: this.disposed,
    }
  }
}

/**
 * 创建一个新的订阅管理器实例
 * 
 * @returns 新的订阅管理器
 * 
 * @example
 * ```typescript
 * const subscriptionManager = createSubscriptionManager()
 * ```
 */
export function createSubscriptionManager(): SubscriptionManager {
  return new SubscriptionManager()
}


