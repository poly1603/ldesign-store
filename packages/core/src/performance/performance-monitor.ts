/**
 * 性能监控器
 * 
 * 监控 Store 操作的性能指标
 * 
 * @module performance/performance-monitor
 */

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 操作名称 */
  name: string
  /** 执行次数 */
  count: number
  /** 总耗时（毫秒） */
  totalTime: number
  /** 平均耗时（毫秒） */
  avgTime: number
  /** 最小耗时（毫秒） */
  minTime: number
  /** 最大耗时（毫秒） */
  maxTime: number
}

/**
 * 性能监控器
 * 
 * @example
 * ```typescript
 * const monitor = new PerformanceMonitor()
 * 
 * const result = monitor.measure('fetchData', async () => {
 *   const data = await fetch('/api/data')
 *   return data.json()
 * })
 * 
 * console.log(monitor.getMetrics('fetchData'))
 * ```
 */
export class PerformanceMonitor {
  private metrics = new Map<string, {
    count: number
    totalTime: number
    minTime: number
    maxTime: number
  }>()

  /**
   * 测量函数执行时间
   * 
   * @param name - 操作名称
   * @param fn - 要测量的函数
   * @returns 函数执行结果
   */
  measure<T>(name: string, fn: () => T): T {
    const startTime = performance.now()

    try {
      const result = fn()

      // 如果是 Promise，等待完成后再记录
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            this.recordMetric(name, performance.now() - startTime)
            return value
          },
          (error) => {
            this.recordMetric(name, performance.now() - startTime)
            throw error
          }
        ) as T
      }

      this.recordMetric(name, performance.now() - startTime)
      return result
    }
    catch (error) {
      this.recordMetric(name, performance.now() - startTime)
      throw error
    }
  }

  /**
   * 记录性能指标
   * 
   * @param name - 操作名称
   * @param duration - 执行时间（毫秒）
   * @private
   */
  private recordMetric(name: string, duration: number): void {
    const metric = this.metrics.get(name)

    if (metric) {
      metric.count++
      metric.totalTime += duration
      metric.minTime = Math.min(metric.minTime, duration)
      metric.maxTime = Math.max(metric.maxTime, duration)
    }
    else {
      this.metrics.set(name, {
        count: 1,
        totalTime: duration,
        minTime: duration,
        maxTime: duration
      })
    }
  }

  /**
   * 获取性能指标
   * 
   * @param name - 操作名称
   * @returns 性能指标
   */
  getMetrics(name: string): PerformanceMetrics | undefined {
    const metric = this.metrics.get(name)
    if (!metric) return undefined

    return {
      name,
      count: metric.count,
      totalTime: metric.totalTime,
      avgTime: metric.totalTime / metric.count,
      minTime: metric.minTime,
      maxTime: metric.maxTime
    }
  }

  /**
   * 获取所有性能指标
   * 
   * @returns 所有性能指标
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.entries()).map(([name, metric]) => ({
      name,
      count: metric.count,
      totalTime: metric.totalTime,
      avgTime: metric.totalTime / metric.count,
      minTime: metric.minTime,
      maxTime: metric.maxTime
    }))
  }

  /**
   * 重置指标
   * 
   * @param name - 操作名称（可选），不传则重置所有
   */
  reset(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    }
    else {
      this.metrics.clear()
    }
  }
}



