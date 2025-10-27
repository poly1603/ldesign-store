/**
 * 性能监控面板
 * 
 * 收集和分析 Store 的性能指标，提供可视化的性能报告。
 * 帮助开发者识别性能瓶颈和优化机会。
 * 
 * @example
 * ```typescript
 * const panel = new PerformancePanel()
 * 
 * // 监控 Store
 * panel.monitorStore(userStore)
 * 
 * // 记录 Action 执行
 * panel.recordAction('fetchUsers', 150)
 * 
 * // 生成报告
 * const report = panel.generateReport()
 * console.log(report)
 * 
 * // 检测瓶颈
 * const bottlenecks = panel.detectBottlenecks()
 * ```
 */

/**
 * Action 性能指标
 */
export interface ActionMetrics {
  /** Action 名称 */
  name: string
  /** 执行次数 */
  executionCount: number
  /** 总执行时间（毫秒） */
  totalTime: number
  /** 平均执行时间（毫秒） */
  averageTime: number
  /** 最小执行时间（毫秒） */
  minTime: number
  /** 最大执行时间（毫秒） */
  maxTime: number
  /** 最近一次执行时间 */
  lastExecutionTime: number
  /** 执行时间历史（最近 100 次） */
  timeHistory: number[]
}

/**
 * 缓存性能指标
 */
export interface CacheMetrics {
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 缓存大小 */
  size: number
  /** 总容量 */
  maxSize: number
  /** 使用率 */
  utilization: number
}

/**
 * 内存使用指标
 */
export interface MemoryMetrics {
  /** 估算的内存使用（字节） */
  estimatedSize: number
  /** 状态大小（字节） */
  stateSize: number
  /** 缓存大小（字节） */
  cacheSize: number
  /** 订阅数量 */
  subscriptionCount: number
  /** 定时器数量 */
  timerCount: number
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** Store ID */
  storeId: string
  /** 报告生成时间 */
  timestamp: number
  /** Action 性能指标 */
  actions: ActionMetrics[]
  /** 缓存性能指标 */
  cache: CacheMetrics
  /** 内存使用指标 */
  memory: MemoryMetrics
  /** 总体评分（0-100） */
  score: number
  /** 性能等级 */
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  /** 建议 */
  recommendations: string[]
}

/**
 * 性能瓶颈
 */
export interface Bottleneck {
  /** 瓶颈类型 */
  type: 'action' | 'cache' | 'memory' | 'subscription'
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical'
  /** 描述 */
  description: string
  /** 相关指标 */
  metrics: any
  /** 优化建议 */
  suggestions: string[]
}

/**
 * 性能监控面板
 */
export class PerformancePanel {
  /** Action 执行记录 */
  private actionMetrics = new Map<string, ActionMetrics>()

  /** 缓存命中记录 */
  private cacheHits = 0
  private cacheMisses = 0

  /** 内存使用记录 */
  private memorySnapshots: Array<{ timestamp: number; size: number }> = []

  /** 监控的 Store */
  private monitoredStores = new Map<string, any>()

  /** 是否启用监控 */
  private enabled = true

  /**
   * 监控 Store
   * 
   * 开始监控指定 Store 的性能。
   * 
   * @param store - Store 实例
   * @param options - 监控选项
   * 
   * @example
   * ```typescript
   * panel.monitorStore(userStore, {
   *   trackActions: true,
   *   trackMemory: true
   * })
   * ```
   */
  monitorStore(
    store: any,
    options: {
      trackActions?: boolean
      trackMemory?: boolean
      trackCache?: boolean
    } = {}
  ): () => void {
    const {
      trackActions = true,
      trackMemory = true,
      trackCache = true,
    } = options

    const storeId = store.$id || String(store)
    this.monitoredStores.set(storeId, store)

    const cleanups: Array<() => void> = []

    // 监控 Action 执行
    if (trackActions && typeof store.$onAction === 'function') {
      const unsubscribe = store.$onAction((context: any) => {
        const { name } = context
        const startTime = performance.now()

        context.after(() => {
          const duration = performance.now() - startTime
          this.recordAction(name, duration)
        })
      })
      cleanups.push(unsubscribe)
    }

    // 监控内存（定期采样）
    if (trackMemory) {
      const intervalId = setInterval(() => {
        this.recordMemorySnapshot(storeId)
      }, 5000) // 每 5 秒采样一次

      cleanups.push(() => clearInterval(intervalId))
    }

    // 返回清理函数
    return () => {
      cleanups.forEach(cleanup => cleanup())
      this.monitoredStores.delete(storeId)
    }
  }

  /**
   * 记录 Action 执行
   * 
   * @param actionName - Action 名称
   * @param duration - 执行时间（毫秒）
   */
  recordAction(actionName: string, duration: number): void {
    if (!this.enabled) return

    let metrics = this.actionMetrics.get(actionName)

    if (!metrics) {
      metrics = {
        name: actionName,
        executionCount: 0,
        totalTime: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        lastExecutionTime: 0,
        timeHistory: [],
      }
      this.actionMetrics.set(actionName, metrics)
    }

    // 更新指标
    metrics.executionCount++
    metrics.totalTime += duration
    metrics.averageTime = metrics.totalTime / metrics.executionCount
    metrics.minTime = Math.min(metrics.minTime, duration)
    metrics.maxTime = Math.max(metrics.maxTime, duration)
    metrics.lastExecutionTime = Date.now()

    // 记录历史（最多保留 100 次）
    metrics.timeHistory.push(duration)
    if (metrics.timeHistory.length > 100) {
      metrics.timeHistory.shift()
    }
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(): void {
    if (!this.enabled) return
    this.cacheHits++
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(): void {
    if (!this.enabled) return
    this.cacheMisses++
  }

  /**
   * 记录内存快照
   * 
   * @private
   */
  private recordMemorySnapshot(storeId: string): void {
    const store = this.monitoredStores.get(storeId)
    if (!store) return

    try {
      const stateJson = JSON.stringify(store.$state)
      const size = new Blob([stateJson]).size

      this.memorySnapshots.push({
        timestamp: Date.now(),
        size,
      })

      // 只保留最近 100 个快照
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots.shift()
      }
    } catch (error) {
      console.warn('Failed to record memory snapshot:', error)
    }
  }

  /**
   * 生成性能报告
   * 
   * @param storeId - Store ID（可选）
   * @returns 性能报告
   * 
   * @example
   * ```typescript
   * const report = panel.generateReport('user-store')
   * console.log(`性能评分: ${report.score}/100`)
   * console.log(`性能等级: ${report.grade}`)
   * ```
   */
  generateReport(storeId?: string): PerformanceReport {
    const actions = Array.from(this.actionMetrics.values())

    // 计算缓存指标
    const totalCacheRequests = this.cacheHits + this.cacheMisses
    const cache: CacheMetrics = {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: totalCacheRequests > 0 ? this.cacheHits / totalCacheRequests : 0,
      size: 0, // 需要从实际缓存获取
      maxSize: 1000, // 需要从实际缓存获取
      utilization: 0,
    }

    // 计算内存指标
    const latestMemory = this.memorySnapshots[this.memorySnapshots.length - 1]
    const memory: MemoryMetrics = {
      estimatedSize: latestMemory?.size || 0,
      stateSize: latestMemory?.size || 0,
      cacheSize: 0,
      subscriptionCount: 0,
      timerCount: 0,
    }

    // 计算性能评分
    const score = this.calculateScore(actions, cache, memory)
    const grade = this.calculateGrade(score)

    // 生成建议
    const recommendations = this.generateRecommendations(actions, cache, memory)

    return {
      storeId: storeId || 'unknown',
      timestamp: Date.now(),
      actions,
      cache,
      memory,
      score,
      grade,
      recommendations,
    }
  }

  /**
   * 检测性能瓶颈
   * 
   * 分析性能数据，识别潜在的性能问题。
   * 
   * @returns 性能瓶颈列表
   * 
   * @example
   * ```typescript
   * const bottlenecks = panel.detectBottlenecks()
   * bottlenecks.forEach(bottleneck => {
   *   console.log(`${bottleneck.severity}: ${bottleneck.description}`)
   *   bottleneck.suggestions.forEach(s => console.log(`  - ${s}`))
   * })
   * ```
   */
  detectBottlenecks(): Bottleneck[] {
    const bottlenecks: Bottleneck[] = []

    // 检测慢 Action
    for (const metrics of this.actionMetrics.values()) {
      if (metrics.averageTime > 1000) {
        bottlenecks.push({
          type: 'action',
          severity: metrics.averageTime > 3000 ? 'critical' : 'high',
          description: `Action "${metrics.name}" 平均执行时间过长: ${metrics.averageTime.toFixed(2)}ms`,
          metrics,
          suggestions: [
            '考虑添加缓存',
            '优化算法复杂度',
            '使用防抖或节流',
            '考虑异步执行',
          ],
        })
      }

      if (metrics.maxTime > 5000) {
        bottlenecks.push({
          type: 'action',
          severity: 'high',
          description: `Action "${metrics.name}" 最大执行时间过长: ${metrics.maxTime.toFixed(2)}ms`,
          metrics,
          suggestions: [
            '检查是否有阻塞操作',
            '优化数据处理逻辑',
            '考虑分批处理',
          ],
        })
      }
    }

    // 检测缓存命中率
    const totalRequests = this.cacheHits + this.cacheMisses
    if (totalRequests > 0) {
      const hitRate = this.cacheHits / totalRequests

      if (hitRate < 0.5) {
        bottlenecks.push({
          type: 'cache',
          severity: hitRate < 0.3 ? 'high' : 'medium',
          description: `缓存命中率过低: ${(hitRate * 100).toFixed(1)}%`,
          metrics: { hitRate, hits: this.cacheHits, misses: this.cacheMisses },
          suggestions: [
            '增加缓存容量',
            '延长缓存过期时间',
            '优化缓存键生成策略',
            '检查是否有不必要的缓存失效',
          ],
        })
      }
    }

    // 检测内存增长
    if (this.memorySnapshots.length >= 10) {
      const firstSnapshot = this.memorySnapshots[0]
      const lastSnapshot = this.memorySnapshots[this.memorySnapshots.length - 1]
      const growthRate = (lastSnapshot.size - firstSnapshot.size) / firstSnapshot.size

      if (growthRate > 0.5) {
        bottlenecks.push({
          type: 'memory',
          severity: growthRate > 1 ? 'critical' : 'high',
          description: `内存持续增长: ${(growthRate * 100).toFixed(1)}%`,
          metrics: { firstSize: firstSnapshot.size, lastSize: lastSnapshot.size, growthRate },
          suggestions: [
            '检查是否有内存泄漏',
            '清理不必要的缓存',
            '检查订阅是否正确清理',
            '优化状态数据结构',
          ],
        })
      }
    }

    return bottlenecks
  }

  /**
   * 获取 Action 性能排名
   * 
   * 按平均执行时间排序返回最慢的 Action。
   * 
   * @param limit - 返回数量限制
   * @returns Action 指标数组
   */
  getSlowActions(limit = 10): ActionMetrics[] {
    return Array.from(this.actionMetrics.values())
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, limit)
  }

  /**
   * 获取最频繁的 Action
   * 
   * @param limit - 返回数量限制
   * @returns Action 指标数组
   */
  getMostFrequentActions(limit = 10): ActionMetrics[] {
    return Array.from(this.actionMetrics.values())
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, limit)
  }

  /**
   * 获取缓存性能指标
   * 
   * @returns 缓存指标
   */
  getCacheMetrics(): CacheMetrics {
    const totalRequests = this.cacheHits + this.cacheMisses

    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: totalRequests > 0 ? this.cacheHits / totalRequests : 0,
      size: 0,
      maxSize: 0,
      utilization: 0,
    }
  }

  /**
   * 获取内存趋势
   * 
   * @returns 内存快照数组
   */
  getMemoryTrend(): Array<{ timestamp: number; size: number }> {
    return [...this.memorySnapshots]
  }

  /**
   * 清空统计数据
   */
  clearStats(): void {
    this.actionMetrics.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
    this.memorySnapshots = []
  }

  /**
   * 启用监控
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用监控
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 导出性能数据
   * 
   * @returns JSON 字符串
   */
  exportData(): string {
    const data = {
      actions: Array.from(this.actionMetrics.entries()),
      cache: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
      },
      memory: this.memorySnapshots,
      exportTime: Date.now(),
    }
    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入性能数据
   * 
   * @param json - JSON 字符串
   * @returns 是否成功导入
   */
  importData(json: string): boolean {
    try {
      const data = JSON.parse(json)
      this.actionMetrics = new Map(data.actions)
      this.cacheHits = data.cache.hits
      this.cacheMisses = data.cache.misses
      this.memorySnapshots = data.memory
      return true
    } catch (error) {
      console.error('Failed to import performance data:', error)
      return false
    }
  }

  /**
   * 计算性能评分
   * 
   * @private
   */
  private calculateScore(
    actions: ActionMetrics[],
    cache: CacheMetrics,
    memory: MemoryMetrics
  ): number {
    let score = 100

    // Action 性能评分（40分）
    const slowActions = actions.filter(a => a.averageTime > 1000).length
    if (slowActions > 0) {
      score -= Math.min(40, slowActions * 10)
    }

    // 缓存命中率评分（30分）
    const hitRate = cache.hitRate
    if (hitRate < 0.8) {
      score -= (0.8 - hitRate) * 30 / 0.8
    }

    // 内存使用评分（30分）
    if (this.memorySnapshots.length >= 2) {
      const first = this.memorySnapshots[0]
      const last = this.memorySnapshots[this.memorySnapshots.length - 1]
      const growthRate = (last.size - first.size) / first.size

      if (growthRate > 0.3) {
        score -= Math.min(30, growthRate * 50)
      }
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 计算性能等级
   * 
   * @private
   */
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * 生成优化建议
   * 
   * @private
   */
  private generateRecommendations(
    actions: ActionMetrics[],
    cache: CacheMetrics,
    memory: MemoryMetrics
  ): string[] {
    const recommendations: string[] = []

    // Action 优化建议
    const slowActions = actions.filter(a => a.averageTime > 1000)
    if (slowActions.length > 0) {
      recommendations.push(
        `发现 ${slowActions.length} 个慢 Action，建议添加缓存或优化算法`
      )
    }

    // 缓存优化建议
    if (cache.hitRate < 0.8) {
      recommendations.push(
        `缓存命中率偏低（${(cache.hitRate * 100).toFixed(1)}%），建议优化缓存策略`
      )
    }

    // 内存优化建议
    if (this.memorySnapshots.length >= 2) {
      const first = this.memorySnapshots[0]
      const last = this.memorySnapshots[this.memorySnapshots.length - 1]
      const growthRate = (last.size - first.size) / first.size

      if (growthRate > 0.3) {
        recommendations.push(
          `内存持续增长（${(growthRate * 100).toFixed(1)}%），建议检查内存泄漏`
        )
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表现良好，无需优化')
    }

    return recommendations
  }
}

/**
 * 创建性能监控面板
 * 
 * @returns 性能监控面板实例
 */
export function createPerformancePanel(): PerformancePanel {
  return new PerformancePanel()
}

/**
 * 全局性能监控面板实例
 */
export const globalPerformancePanel = createPerformancePanel()


