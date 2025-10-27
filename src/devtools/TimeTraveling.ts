/**
 * 时间旅行调试器
 * 
 * 记录状态变更历史，支持前进、后退、跳转等时间旅行功能。
 * 类似 Redux DevTools 的时间旅行调试体验。
 * 
 * @example
 * ```typescript
 * const debugger = new TimeTravelDebugger<UserState>()
 * 
 * // 记录初始状态
 * debugger.recordState(initialState, 'init')
 * 
 * // 执行操作并记录
 * store.login(credentials)
 * debugger.recordState(store.$state, 'login')
 * 
 * // 后退到上一个状态
 * const previousState = debugger.undo()
 * if (previousState) {
 *   store.$patch(previousState)
 * }
 * 
 * // 前进到下一个状态
 * const nextState = debugger.redo()
 * ```
 */

/**
 * 历史记录项
 */
export interface HistoryEntry<T = any> {
  /** 状态数据 */
  state: T
  /** 时间戳 */
  timestamp: number
  /** 动作名称 */
  action?: string
  /** 动作参数 */
  args?: any[]
  /** 变更描述 */
  description?: string
  /** 状态差异（相对于上一个状态） */
  diff?: any
}

/**
 * 时间旅行配置选项
 */
export interface TimeTravelOptions {
  /** 最大历史记录数量（0 表示无限制） */
  maxHistory?: number
  /** 是否自动记录差异 */
  recordDiff?: boolean
  /** 是否启用压缩（大状态对象） */
  compress?: boolean
  /** 状态过滤器（返回 false 则不记录） */
  stateFilter?: (state: any) => boolean
}

/**
 * 时间旅行调试器
 * 
 * @template T - 状态类型
 */
export class TimeTravelDebugger<T = any> {
  /** 历史记录栈 */
  private history: HistoryEntry<T>[] = []

  /** 当前位置（在历史记录中的索引） */
  private currentIndex = -1

  /** 配置选项 */
  private options: Required<TimeTravelOptions>

  /** 是否正在执行时间旅行（避免循环记录） */
  private isTraveling = false

  /**
   * 创建时间旅行调试器
   * 
   * @param options - 配置选项
   */
  constructor(options: TimeTravelOptions = {}) {
    this.options = {
      maxHistory: options.maxHistory || 100,
      recordDiff: options.recordDiff !== false,
      compress: options.compress || false,
      stateFilter: options.stateFilter || (() => true),
    }
  }

  /**
   * 记录状态
   * 
   * 将当前状态添加到历史记录中。
   * 如果当前不在最新位置，会清除之后的历史记录。
   * 
   * @param state - 状态对象
   * @param action - 动作名称
   * @param args - 动作参数
   * @param description - 变更描述
   * 
   * @example
   * ```typescript
   * debugger.recordState(store.$state, 'updateUser', [userId, userData])
   * ```
   */
  recordState(
    state: T,
    action?: string,
    args?: any[],
    description?: string
  ): void {
    // 如果正在执行时间旅行，不记录
    if (this.isTraveling) {
      return
    }

    // 应用状态过滤器
    if (!this.options.stateFilter(state)) {
      return
    }

    // 深拷贝状态以避免引用问题
    const stateCopy = this.deepClone(state)

    // 创建历史记录项
    const entry: HistoryEntry<T> = {
      state: stateCopy,
      timestamp: Date.now(),
      action,
      args,
      description,
    }

    // 记录差异
    if (this.options.recordDiff && this.currentIndex >= 0) {
      const previousState = this.history[this.currentIndex].state
      entry.diff = this.calculateDiff(previousState, stateCopy)
    }

    // 如果当前不在最新位置，清除之后的历史
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // 添加新记录
    this.history.push(entry)
    this.currentIndex++

    // 检查是否超过最大历史数量
    if (this.options.maxHistory > 0 && this.history.length > this.options.maxHistory) {
      // 移除最旧的记录
      this.history.shift()
      this.currentIndex--
    }
  }

  /**
   * 后退到上一个状态
   * 
   * @returns 上一个状态，如果没有则返回 undefined
   * 
   * @example
   * ```typescript
   * const previousState = debugger.undo()
   * if (previousState) {
   *   store.$patch(previousState)
   * }
   * ```
   */
  undo(): T | undefined {
    if (!this.canUndo()) {
      return undefined
    }

    this.currentIndex--
    return this.getCurrentState()
  }

  /**
   * 前进到下一个状态
   * 
   * @returns 下一个状态，如果没有则返回 undefined
   * 
   * @example
   * ```typescript
   * const nextState = debugger.redo()
   * if (nextState) {
   *   store.$patch(nextState)
   * }
   * ```
   */
  redo(): T | undefined {
    if (!this.canRedo()) {
      return undefined
    }

    this.currentIndex++
    return this.getCurrentState()
  }

  /**
   * 跳转到指定位置
   * 
   * @param index - 历史记录索引
   * @returns 目标状态，如果索引无效则返回 undefined
   * 
   * @example
   * ```typescript
   * // 跳转到第 5 个历史记录
   * const state = debugger.jumpTo(4)
   * if (state) {
   *   store.$patch(state)
   * }
   * ```
   */
  jumpTo(index: number): T | undefined {
    if (index < 0 || index >= this.history.length) {
      return undefined
    }

    this.currentIndex = index
    return this.getCurrentState()
  }

  /**
   * 跳转到指定动作
   * 
   * 跳转到执行特定动作后的状态。
   * 
   * @param action - 动作名称
   * @param occurrence - 第几次出现（默认 1，即第一次）
   * @returns 目标状态，如果未找到则返回 undefined
   * 
   * @example
   * ```typescript
   * // 跳转到第二次 'login' 动作
   * const state = debugger.jumpToAction('login', 2)
   * ```
   */
  jumpToAction(action: string, occurrence = 1): T | undefined {
    let count = 0
    for (let i = 0; i < this.history.length; i++) {
      if (this.history[i].action === action) {
        count++
        if (count === occurrence) {
          return this.jumpTo(i)
        }
      }
    }
    return undefined
  }

  /**
   * 是否可以后退
   * 
   * @returns 是否可以后退
   */
  canUndo(): boolean {
    return this.currentIndex > 0
  }

  /**
   * 是否可以前进
   * 
   * @returns 是否可以前进
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 获取当前状态
   * 
   * @returns 当前状态的深拷贝
   */
  getCurrentState(): T | undefined {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return undefined
    }

    this.isTraveling = true
    const state = this.deepClone(this.history[this.currentIndex].state)
    this.isTraveling = false

    return state
  }

  /**
   * 获取当前历史记录项
   * 
   * @returns 当前历史记录项
   */
  getCurrentEntry(): HistoryEntry<T> | undefined {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return undefined
    }

    return this.history[this.currentIndex]
  }

  /**
   * 获取历史记录
   * 
   * @param includeState - 是否包含状态数据（默认 false，只返回元数据）
   * @returns 历史记录数组
   * 
   * @example
   * ```typescript
   * // 获取历史记录元数据
   * const history = debugger.getHistory()
   * history.forEach(entry => {
   *   console.log(`${entry.action} at ${new Date(entry.timestamp)}`)
   * })
   * ```
   */
  getHistory(includeState = false): Array<Omit<HistoryEntry<T>, 'state'> | HistoryEntry<T>> {
    if (includeState) {
      return this.history.map(entry => ({ ...entry }))
    }

    return this.history.map(({ state, ...rest }) => rest)
  }

  /**
   * 获取当前位置
   * 
   * @returns 当前在历史记录中的索引
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * 获取历史记录数量
   * 
   * @returns 历史记录数量
   */
  getHistoryCount(): number {
    return this.history.length
  }

  /**
   * 清空历史记录
   * 
   * @param keepCurrent - 是否保留当前状态作为新的初始状态
   */
  clear(keepCurrent = false): void {
    if (keepCurrent && this.currentIndex >= 0) {
      const currentEntry = this.history[this.currentIndex]
      this.history = [currentEntry]
      this.currentIndex = 0
    } else {
      this.history = []
      this.currentIndex = -1
    }
  }

  /**
   * 重放历史记录
   * 
   * 从头开始重放所有历史记录，并在每一步调用回调函数。
   * 
   * @param callback - 每一步的回调函数
   * @param interval - 每步之间的间隔（毫秒）
   * 
   * @example
   * ```typescript
   * await debugger.replay((state, entry) => {
   *   store.$patch(state)
   *   console.log(`执行: ${entry.action}`)
   * }, 500) // 每 500ms 执行一步
   * ```
   */
  async replay(
    callback: (state: T, entry: HistoryEntry<T>) => void | Promise<void>,
    interval = 1000
  ): Promise<void> {
    this.isTraveling = true

    for (let i = 0; i < this.history.length; i++) {
      const entry = this.history[i]
      this.currentIndex = i

      await callback(this.deepClone(entry.state), entry)

      if (i < this.history.length - 1) {
        await this.delay(interval)
      }
    }

    this.isTraveling = false
  }

  /**
   * 导出历史记录
   * 
   * @param includeState - 是否包含完整状态数据
   * @returns JSON 字符串
   */
  exportHistory(includeState = true): string {
    const data = {
      history: includeState ? this.history : this.getHistory(),
      currentIndex: this.currentIndex,
      exportTime: Date.now(),
    }
    return JSON.stringify(data)
  }

  /**
   * 导入历史记录
   * 
   * @param json - JSON 字符串
   * @returns 是否成功导入
   */
  importHistory(json: string): boolean {
    try {
      const data = JSON.parse(json)
      this.history = data.history
      this.currentIndex = data.currentIndex
      return true
    } catch (error) {
      console.error('Failed to import history:', error)
      return false
    }
  }

  /**
   * 获取统计信息
   * 
   * @returns 统计信息对象
   */
  getStats(): {
    totalRecords: number
    currentPosition: number
    canUndo: boolean
    canRedo: boolean
    actions: Record<string, number>
    timeRange: { start: number; end: number } | null
  } {
    const actions: Record<string, number> = {}

    for (const entry of this.history) {
      if (entry.action) {
        actions[entry.action] = (actions[entry.action] || 0) + 1
      }
    }

    let timeRange: { start: number; end: number } | null = null
    if (this.history.length > 0) {
      timeRange = {
        start: this.history[0].timestamp,
        end: this.history[this.history.length - 1].timestamp,
      }
    }

    return {
      totalRecords: this.history.length,
      currentPosition: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      actions,
      timeRange,
    }
  }

  /**
   * 深拷贝对象
   * 
   * @private
   */
  private deepClone<U>(obj: U): U {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as any
    }

    if (obj instanceof Map) {
      const cloned = new Map()
      obj.forEach((value, key) => {
        cloned.set(this.deepClone(key), this.deepClone(value))
      })
      return cloned as any
    }

    if (obj instanceof Set) {
      const cloned = new Set()
      obj.forEach(value => {
        cloned.add(this.deepClone(value))
      })
      return cloned as any
    }

    const cloned: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key])
      }
    }
    return cloned
  }

  /**
   * 计算两个状态的差异
   * 
   * @private
   */
  private calculateDiff(oldState: T, newState: T): any {
    // 简化的差异计算（可以使用更复杂的算法如 diff-match-patch）
    const diff: any = {}

    if (typeof newState !== 'object' || newState === null) {
      return newState !== oldState ? { value: newState } : null
    }

    for (const key in newState) {
      if (Object.prototype.hasOwnProperty.call(newState, key)) {
        const oldValue = (oldState as any)?.[key]
        const newValue = (newState as any)[key]

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          diff[key] = { old: oldValue, new: newValue }
        }
      }
    }

    return Object.keys(diff).length > 0 ? diff : null
  }

  /**
   * 延迟执行
   * 
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 创建时间旅行调试器实例
 * 
 * @template T - 状态类型
 * @param options - 配置选项
 * @returns 时间旅行调试器
 * 
 * @example
 * ```typescript
 * const debugger = createTimeTravelDebugger<UserState>({
 *   maxHistory: 200,
 *   recordDiff: true
 * })
 * ```
 */
export function createTimeTravelDebugger<T = any>(
  options?: TimeTravelOptions
): TimeTravelDebugger<T> {
  return new TimeTravelDebugger<T>(options)
}


