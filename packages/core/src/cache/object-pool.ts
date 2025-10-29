/**
 * 对象池实现
 * 
 * 通过复用对象减少 GC 压力和内存分配开销
 * 
 * @module cache/object-pool
 */

/**
 * 对象池（增强版）
 * 
 * 通过复用对象减少 GC 压力和内存分配开销。
 * 支持预分配和自适应池大小调整，根据使用模式优化性能。
 * 
 * ⚡ 性能优化:
 * - 预分配对象，减少运行时创建开销
 * - 自适应调整池大小
 * - 统计信息监控
 * 
 * @template T - 池中对象的类型
 * 
 * @example
 * ```typescript
 * // 创建一个缓存节点对象池
 * const nodePool = new ObjectPool(
 *   () => ({ key: '', value: null, next: null }),
 *   (node) => { node.key = ''; node.value = null; node.next = null },
 *   100,  // 最大容量
 *   10    // 预分配数量
 * )
 * 
 * const node = nodePool.acquire()
 * node.key = 'user:1'
 * node.value = { name: '张三' }
 * 
 * // 使用完毕后释放
 * nodePool.release(node)
 * ```
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void
  private maxSize: number
  private preallocateSize: number

  // 统计数据（用于自适应调整）
  private acquireCount = 0
  private releaseCount = 0
  private missCount = 0 // 池为空时的获取次数
  private lastAdjustTime = Date.now()

  /**
   * 创建对象池
   * 
   * @param factory - 对象工厂函数，用于创建新对象
   * @param reset - 重置函数，用于清理对象状态以供复用
   * @param maxSize - 池的最大容量，默认 100
   * @param preallocateSize - 预分配对象数量，默认 10
   */
  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize = 100,
    preallocateSize = 10
  ) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
    this.preallocateSize = Math.min(preallocateSize, maxSize)

    // 性能优化：预分配对象，减少运行时创建开销
    this.preallocate()
  }

  /**
   * 预分配对象
   * 
   * 在池初始化时预先创建一批对象，避免运行时频繁调用工厂函数。
   * 这可以显著提升首次使用的性能。
   * 
   * @private
   */
  private preallocate(): void {
    for (let i = 0; i < this.preallocateSize; i++) {
      this.pool.push(this.factory())
    }
  }

  /**
   * 从池中获取对象
   * 
   * 如果池中有可用对象，直接返回；否则创建新对象。
   * 自动记录统计信息以优化池大小。
   * 
   * ⚡ 性能: O(1)
   * 
   * @returns 池中的对象或新创建的对象
   */
  acquire(): T {
    this.acquireCount++

    if (this.pool.length > 0) {
      return this.pool.pop()!
    }

    // 池为空，记录未命中
    this.missCount++

    // 定期检查是否需要调整池大小（每 1000 次获取检查一次）
    if (this.acquireCount % 1000 === 0) {
      this.adjustPoolSize()
    }

    return this.factory()
  }

  /**
   * 将对象归还到池中
   * 
   * 对象会被重置后放回池中供下次使用。
   * 如果池已满，对象将被丢弃以供 GC 回收。
   * 
   * ⚡ 性能: O(1)
   * 
   * @param obj - 要归还的对象
   */
  release(obj: T): void {
    this.releaseCount++

    if (this.pool.length < this.maxSize) {
      this.reset(obj)
      this.pool.push(obj)
    }
    // 如果池已满，对象将被丢弃，由 GC 处理
  }

  /**
   * 自适应调整池大小
   * 
   * 根据使用统计动态调整预分配大小：
   * - 如果未命中率高（> 20%），增加预分配
   * - 如果池利用率低，可能减少预分配（未来扩展）
   * 
   * @private
   */
  private adjustPoolSize(): void {
    const now = Date.now()
    // 至少间隔 5 秒才调整一次
    if (now - this.lastAdjustTime < 5000) {
      return
    }

    // 计算未命中率
    const missRate = this.missCount / this.acquireCount

    // 如果未命中率超过 20%，且未达到最大容量，增加预分配
    if (missRate > 0.2 && this.preallocateSize < this.maxSize) {
      const newSize = Math.min(
        Math.floor(this.preallocateSize * 1.5),
        this.maxSize
      )

      // 预分配额外的对象
      const additionalCount = newSize - this.preallocateSize
      for (let i = 0; i < additionalCount; i++) {
        if (this.pool.length < this.maxSize) {
          this.pool.push(this.factory())
        }
      }

      this.preallocateSize = newSize
    }

    // 重置统计
    this.acquireCount = 0
    this.releaseCount = 0
    this.missCount = 0
    this.lastAdjustTime = now
  }

  /**
   * 清空对象池
   * 
   * 移除池中所有对象，由 GC 回收。
   * 注意：这不会重置统计信息。
   */
  clear(): void {
    this.pool.length = 0
  }

  /**
   * 获取当前池中对象数量
   * 
   * @returns 池中可用对象的数量
   */
  size(): number {
    return this.pool.length
  }

  /**
   * 获取池的统计信息
   * 
   * @returns 包含获取次数、释放次数、未命中次数等统计数据
   */
  getStats(): {
    poolSize: number
    maxSize: number
    preallocateSize: number
    acquireCount: number
    releaseCount: number
    missCount: number
    missRate: number
  } {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
      preallocateSize: this.preallocateSize,
      acquireCount: this.acquireCount,
      releaseCount: this.releaseCount,
      missCount: this.missCount,
      missRate: this.acquireCount > 0 ? this.missCount / this.acquireCount : 0,
    }
  }
}


