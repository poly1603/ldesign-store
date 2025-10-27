/**
 * 批量操作管理器
 * 
 * 合并多个状态更新为一次操作，减少渲染次数，提升性能。
 * 支持手动批处理和自动批处理（使用 requestIdleCallback）。
 * 
 * @example
 * ```typescript
 * const batchManager = new BatchManager()
 * 
 * // 开始批处理
 * batchManager.startBatch('updateUsers')
 * 
 * // 添加多个操作
 * batchManager.addOperation('updateUsers', () => {
 *   store.user1 = newUser1
 * })
 * batchManager.addOperation('updateUsers', () => {
 *   store.user2 = newUser2
 * })
 * 
 * // 执行批处理
 * batchManager.executeBatch('updateUsers')
 * ```
 */

import { TimerManager } from './TimerManager'

/**
 * 批处理操作
 */
export interface BatchOperation {
  /** 操作函数 */
  fn: () => void | Promise<void>
  /** 操作优先级 */
  priority: number
  /** 添加时间 */
  timestamp: number
}

/**
 * 批处理配置选项
 */
export interface BatchOptions {
  /** 是否自动执行（使用 requestIdleCallback） */
  autoExecute?: boolean
  /** 自动执行延迟（毫秒） */
  autoExecuteDelay?: number
  /** 最大批处理大小 */
  maxBatchSize?: number
  /** 是否按优先级排序 */
  sortByPriority?: boolean
}

/**
 * 批量操作管理器
 * 
 * 管理和执行批量操作，优化性能。
 */
export class BatchManager {
  /** 批处理队列 */
  private batches = new Map<string, BatchOperation[]>()

  /** 正在执行的批处理 */
  private executing = new Set<string>()

  /** 定时器管理器 */
  private timerManager = new TimerManager()

  /** 自动执行定时器 */
  private autoExecuteTimers = new Map<string, NodeJS.Timeout>()

  /**
   * 开始批处理
   * 
   * 创建一个新的批处理队列。
   * 如果队列已存在，将清空现有操作。
   * 
   * @param id - 批处理 ID
   * @param options - 批处理配置选项
   * 
   * @example
   * ```typescript
   * batchManager.startBatch('updateUsers', {
   *   autoExecute: true,
   *   autoExecuteDelay: 100
   * })
   * ```
   */
  startBatch(id: string, options?: BatchOptions): void {
    // 如果批处理正在执行，先完成它
    if (this.executing.has(id)) {
      console.warn(`Batch "${id}" is currently executing`)
      return
    }

    // 取消之前的自动执行定时器
    const existingTimer = this.autoExecuteTimers.get(id)
    if (existingTimer) {
      this.timerManager.clearTimeout(existingTimer)
      this.autoExecuteTimers.delete(id)
    }

    // 初始化批处理队列
    this.batches.set(id, [])

    // 如果启用自动执行，设置定时器
    if (options?.autoExecute) {
      const delay = options.autoExecuteDelay || 0
      const timer = this.timerManager.setTimeout(() => {
        this.executeBatch(id, options)
        this.autoExecuteTimers.delete(id)
      }, delay)
      this.autoExecuteTimers.set(id, timer)
    }
  }

  /**
   * 添加操作到批处理
   * 
   * @param id - 批处理 ID
   * @param operation - 操作函数
   * @param priority - 优先级（数字越大优先级越高），默认 0
   * 
   * @example
   * ```typescript
   * batchManager.addOperation('updateUsers', () => {
   *   store.users.push(newUser)
   * }, 10) // 高优先级
   * ```
   */
  addOperation(
    id: string,
    operation: () => void | Promise<void>,
    priority = 0
  ): void {
    let batch = this.batches.get(id)

    // 如果批处理不存在，自动创建
    if (!batch) {
      this.startBatch(id)
      batch = this.batches.get(id)!
    }

    batch.push({
      fn: operation,
      priority,
      timestamp: Date.now(),
    })
  }

  /**
   * 执行批处理
   * 
   * 执行批处理队列中的所有操作。
   * 可以按优先级排序或按添加顺序执行。
   * 
   * @param id - 批处理 ID
   * @param options - 执行选项
   * @returns Promise，在所有操作完成后解析
   * 
   * @example
   * ```typescript
   * await batchManager.executeBatch('updateUsers', {
   *   sortByPriority: true
   * })
   * ```
   */
  async executeBatch(id: string, options?: BatchOptions): Promise<void> {
    const batch = this.batches.get(id)

    if (!batch || batch.length === 0) {
      return
    }

    // 检查是否正在执行
    if (this.executing.has(id)) {
      console.warn(`Batch "${id}" is already executing`)
      return
    }

    // 标记为正在执行
    this.executing.add(id)

    try {
      // 取消自动执行定时器
      const timer = this.autoExecuteTimers.get(id)
      if (timer) {
        this.timerManager.clearTimeout(timer)
        this.autoExecuteTimers.delete(id)
      }

      // 获取操作列表
      let operations = [...batch]

      // 按优先级排序
      if (options?.sortByPriority) {
        operations.sort((a, b) => b.priority - a.priority)
      }

      // 限制批处理大小
      if (options?.maxBatchSize && operations.length > options.maxBatchSize) {
        operations = operations.slice(0, options.maxBatchSize)
      }

      // 执行所有操作
      for (const operation of operations) {
        try {
          await operation.fn()
        } catch (error) {
          console.error('Error executing batch operation:', error)
        }
      }

      // 清空批处理队列
      this.batches.delete(id)
    } finally {
      // 标记为执行完成
      this.executing.delete(id)
    }
  }

  /**
   * 取消批处理
   * 
   * 取消批处理队列并清空所有操作。
   * 
   * @param id - 批处理 ID
   * 
   * @example
   * ```typescript
   * batchManager.cancelBatch('updateUsers')
   * ```
   */
  cancelBatch(id: string): void {
    // 取消自动执行定时器
    const timer = this.autoExecuteTimers.get(id)
    if (timer) {
      this.timerManager.clearTimeout(timer)
      this.autoExecuteTimers.delete(id)
    }

    // 删除批处理队列
    this.batches.delete(id)
    this.executing.delete(id)
  }

  /**
   * 自动批处理
   * 
   * 使用 requestIdleCallback 在浏览器空闲时执行操作。
   * 如果 requestIdleCallback 不可用，使用 setTimeout。
   * 
   * @param operation - 操作函数
   * @param options - 配置选项
   * @returns Promise，在操作完成后解析
   * 
   * @example
   * ```typescript
   * await batchManager.autoBatch(() => {
   *   // 非关键更新
   *   store.updateStatistics()
   * })
   * ```
   */
  autoBatch(
    operation: () => void | Promise<void>,
    options?: { timeout?: number }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          await operation()
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      // 使用 requestIdleCallback（如果可用）
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(
          () => {
            execute()
          },
          { timeout: options?.timeout || 2000 }
        )
      } else {
        // 降级到 setTimeout
        this.timerManager.setTimeout(() => {
          execute()
        }, 0)
      }
    })
  }

  /**
   * 批量执行多个操作
   * 
   * 将多个操作合并为一次批处理并执行。
   * 
   * @param operations - 操作数组
   * @param options - 批处理选项
   * @returns Promise，在所有操作完成后解析
   * 
   * @example
   * ```typescript
   * await batchManager.batchExecute([
   *   () => store.user1 = newUser1,
   *   () => store.user2 = newUser2,
   *   () => store.user3 = newUser3,
   * ])
   * ```
   */
  async batchExecute(
    operations: Array<() => void | Promise<void>>,
    options?: BatchOptions
  ): Promise<void> {
    const batchId = `temp_${Date.now()}_${Math.random()}`

    this.startBatch(batchId, options)

    for (const op of operations) {
      this.addOperation(batchId, op)
    }

    await this.executeBatch(batchId, options)
  }

  /**
   * 获取批处理统计信息
   * 
   * @param id - 批处理 ID（可选，不传则返回所有批处理的统计）
   * @returns 统计信息
   * 
   * @example
   * ```typescript
   * const stats = batchManager.getStats('updateUsers')
   * console.log(`待执行操作: ${stats.pendingOperations}`)
   * ```
   */
  getStats(id?: string): {
    batchCount: number
    totalOperations: number
    executingCount: number
    batches?: Array<{
      id: string
      operationCount: number
      isExecuting: boolean
      hasAutoExecute: boolean
    }>
  } {
    if (id) {
      const batch = this.batches.get(id)
      return {
        batchCount: batch ? 1 : 0,
        totalOperations: batch?.length || 0,
        executingCount: this.executing.has(id) ? 1 : 0,
        batches: batch ? [{
          id,
          operationCount: batch.length,
          isExecuting: this.executing.has(id),
          hasAutoExecute: this.autoExecuteTimers.has(id),
        }] : [],
      }
    }

    const batches: Array<{
      id: string
      operationCount: number
      isExecuting: boolean
      hasAutoExecute: boolean
    }> = []

    let totalOperations = 0

    for (const [batchId, batch] of this.batches) {
      batches.push({
        id: batchId,
        operationCount: batch.length,
        isExecuting: this.executing.has(batchId),
        hasAutoExecute: this.autoExecuteTimers.has(batchId),
      })
      totalOperations += batch.length
    }

    return {
      batchCount: this.batches.size,
      totalOperations,
      executingCount: this.executing.size,
      batches,
    }
  }

  /**
   * 清空所有批处理
   * 
   * 取消所有批处理队列和自动执行定时器。
   */
  clear(): void {
    // 取消所有自动执行定时器
    for (const timer of this.autoExecuteTimers.values()) {
      this.timerManager.clearTimeout(timer)
    }
    this.autoExecuteTimers.clear()

    // 清空批处理队列
    this.batches.clear()
    this.executing.clear()
  }

  /**
   * 销毁批量操作管理器
   * 
   * 清理所有资源。
   */
  dispose(): void {
    this.clear()
    this.timerManager.dispose()
  }
}

/**
 * 创建批量操作管理器实例
 * 
 * @returns 批量操作管理器
 * 
 * @example
 * ```typescript
 * const batchManager = createBatchManager()
 * ```
 */
export function createBatchManager(): BatchManager {
  return new BatchManager()
}

/**
 * 全局批量操作管理器实例
 * 
 * 可以在整个应用中使用的单例实例。
 */
export const globalBatchManager = createBatchManager()

/**
 * 批处理装饰器
 * 
 * 自动将方法调用添加到批处理队列。
 * 
 * @param batchId - 批处理 ID
 * @param options - 批处理选项
 * 
 * @example
 * ```typescript
 * class UserStore extends BaseStore {
 *   @Batch('updateUsers', { autoExecute: true, autoExecuteDelay: 100 })
 *   updateUser(user: User) {
 *     // 这个方法的调用会被批处理
 *     this.users.push(user)
 *   }
 * }
 * ```
 */
export function Batch(batchId: string, options?: BatchOptions): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (this: any, ...args: any[]) {
      globalBatchManager.addOperation(
        batchId,
        () => originalMethod.apply(this, args)
      )

      // 如果是第一次添加到这个批处理，启动批处理
      const stats = globalBatchManager.getStats(batchId)
      if (stats.totalOperations === 1) {
        globalBatchManager.startBatch(batchId, options)
      }
    }

    return descriptor
  }
}


