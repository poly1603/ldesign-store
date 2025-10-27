/**
 * 统一的定时器管理器
 * 
 * 集中管理所有定时器，确保在组件卸载或清理时能够正确清理所有定时器，
 * 防止内存泄漏和不必要的定时器执行。
 * 
 * @example
 * ```typescript
 * const timerManager = new TimerManager()
 * 
 * // 设置定时器
 * timerManager.setTimeout(() => {
 *   console.log('延迟执行')
 * }, 1000)
 * 
 * // 设置间隔定时器
 * timerManager.setInterval(() => {
 *   console.log('周期执行')
 * }, 5000)
 * 
 * // 清理所有定时器
 * timerManager.dispose()
 * ```
 */
export class TimerManager {
  /** 存储所有 setTimeout 定时器 */
  private timeouts = new Set<NodeJS.Timeout>()

  /** 存储所有 setInterval 定时器 */
  private intervals = new Set<NodeJS.Timeout>()

  /** 标记管理器是否已销毁 */
  private disposed = false

  /**
   * 设置延迟定时器
   * 
   * 类似于原生 setTimeout，但会自动追踪定时器以便统一清理。
   * 定时器执行完成后会自动从管理器中移除。
   * 
   * @param callback - 定时器回调函数
   * @param delay - 延迟时间（毫秒）
   * @param args - 传递给回调函数的参数
   * @returns 定时器 ID，可用于取消定时器
   * 
   * @example
   * ```typescript
   * const timerId = timerManager.setTimeout(() => {
   *   console.log('1 秒后执行')
   * }, 1000)
   * ```
   */
  setTimeout<Args extends any[]>(
    callback: (...args: Args) => void,
    delay: number,
    ...args: Args
  ): NodeJS.Timeout {
    // 如果管理器已销毁，不创建新定时器
    if (this.disposed) {
      console.warn('TimerManager has been disposed, setTimeout ignored')
      return 0 as any
    }

    const timer = setTimeout(() => {
      try {
        callback(...args)
      } catch (error) {
        console.error('Timer callback error:', error)
      } finally {
        // 定时器执行完成后，从集合中移除
        this.timeouts.delete(timer)
      }
    }, delay)

    this.timeouts.add(timer)
    return timer
  }

  /**
   * 设置间隔定时器
   * 
   * 类似于原生 setInterval，但会自动追踪定时器以便统一清理。
   * 
   * @param callback - 定时器回调函数
   * @param interval - 间隔时间（毫秒）
   * @param args - 传递给回调函数的参数
   * @returns 定时器 ID，可用于取消定时器
   * 
   * @example
   * ```typescript
   * const timerId = timerManager.setInterval(() => {
   *   console.log('每 5 秒执行一次')
   * }, 5000)
   * ```
   */
  setInterval<Args extends any[]>(
    callback: (...args: Args) => void,
    interval: number,
    ...args: Args
  ): NodeJS.Timeout {
    // 如果管理器已销毁，不创建新定时器
    if (this.disposed) {
      console.warn('TimerManager has been disposed, setInterval ignored')
      return 0 as any
    }

    const timer = setInterval(() => {
      try {
        callback(...args)
      } catch (error) {
        console.error('Timer callback error:', error)
      }
    }, interval)

    this.intervals.add(timer)
    return timer
  }

  /**
   * 清除延迟定时器
   * 
   * @param timer - 定时器 ID
   * @returns 是否成功清除（如果定时器存在则返回 true）
   * 
   * @example
   * ```typescript
   * const timerId = timerManager.setTimeout(() => {...}, 1000)
   * timerManager.clearTimeout(timerId) // 取消定时器
   * ```
   */
  clearTimeout(timer: NodeJS.Timeout): boolean {
    if (this.timeouts.has(timer)) {
      clearTimeout(timer)
      this.timeouts.delete(timer)
      return true
    }
    return false
  }

  /**
   * 清除间隔定时器
   * 
   * @param timer - 定时器 ID
   * @returns 是否成功清除（如果定时器存在则返回 true）
   * 
   * @example
   * ```typescript
   * const timerId = timerManager.setInterval(() => {...}, 5000)
   * timerManager.clearInterval(timerId) // 停止定时器
   * ```
   */
  clearInterval(timer: NodeJS.Timeout): boolean {
    if (this.intervals.has(timer)) {
      clearInterval(timer)
      this.intervals.delete(timer)
      return true
    }
    return false
  }

  /**
   * 清除所有定时器
   * 
   * 停止所有通过此管理器创建的定时器。
   * 注意：这不会销毁管理器，仍可以创建新的定时器。
   * 
   * @example
   * ```typescript
   * timerManager.clearAll() // 清除所有定时器
   * ```
   */
  clearAll(): void {
    // 清除所有 setTimeout 定时器
    for (const timer of this.timeouts) {
      clearTimeout(timer)
    }
    this.timeouts.clear()

    // 清除所有 setInterval 定时器
    for (const timer of this.intervals) {
      clearInterval(timer)
    }
    this.intervals.clear()
  }

  /**
   * 销毁管理器
   * 
   * 清除所有定时器并标记管理器为已销毁状态。
   * 销毁后不能再创建新的定时器。
   * 
   * @example
   * ```typescript
   * timerManager.dispose() // 销毁管理器
   * ```
   */
  dispose(): void {
    if (this.disposed) {
      return
    }

    this.clearAll()
    this.disposed = true
  }

  /**
   * 获取当前活跃的定时器数量
   * 
   * @returns 包含 setTimeout 和 setInterval 定时器数量的对象
   * 
   * @example
   * ```typescript
   * const stats = timerManager.getStats()
   * console.log(`活跃定时器: ${stats.timeouts + stats.intervals} 个`)
   * ```
   */
  getStats(): {
    timeouts: number
    intervals: number
    total: number
    disposed: boolean
  } {
    return {
      timeouts: this.timeouts.size,
      intervals: this.intervals.size,
      total: this.timeouts.size + this.intervals.size,
      disposed: this.disposed,
    }
  }

  /**
   * 检查管理器是否已销毁
   * 
   * @returns 管理器是否已销毁
   */
  isDisposed(): boolean {
    return this.disposed
  }
}


