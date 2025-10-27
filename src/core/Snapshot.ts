/**
 * 状态快照管理器
 * 
 * 提供状态的保存、恢复、对比等功能。
 * 支持命名快照、自动快照、快照历史等高级特性。
 * 
 * @example
 * ```typescript
 * const snapshotManager = new SnapshotManager<UserState>()
 * 
 * // 创建快照
 * snapshotManager.createSnapshot('初始状态', userStore.$state)
 * 
 * // 修改状态后
 * userStore.name = '张三'
 * 
 * // 恢复快照
 * const restored = snapshotManager.restoreSnapshot('初始状态')
 * userStore.$patch(restored)
 * 
 * // 对比快照
 * const diff = snapshotManager.diffSnapshots('初始状态', '当前状态')
 * ```
 */

/**
 * 快照元数据
 */
export interface SnapshotMetadata {
  /** 快照名称 */
  name: string
  /** 创建时间戳 */
  timestamp: number
  /** 快照描述 */
  description?: string
  /** 快照标签 */
  tags?: string[]
  /** 自定义元数据 */
  metadata?: Record<string, any>
}

/**
 * 快照数据
 */
export interface Snapshot<T = any> {
  /** 快照元数据 */
  info: SnapshotMetadata
  /** 状态数据 */
  state: T
  /** 数据大小（字节） */
  size: number
}

/**
 * 差异类型
 */
export type DiffType = 'added' | 'deleted' | 'modified' | 'unchanged'

/**
 * 状态差异
 */
export interface StateDiff {
  /** 差异路径 */
  path: string
  /** 差异类型 */
  type: DiffType
  /** 旧值 */
  oldValue?: any
  /** 新值 */
  newValue?: any
}

/**
 * 快照配置选项
 */
export interface SnapshotOptions {
  /** 最大快照数量（0 表示无限制） */
  maxSnapshots?: number
  /** 是否压缩快照数据 */
  compress?: boolean
  /** 自定义序列化器 */
  serializer?: {
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }
}

/**
 * 状态快照管理器
 * 
 * 管理多个状态快照，支持创建、恢复、对比、导出等操作。
 * 
 * @template T - 状态类型
 */
export class SnapshotManager<T = any> {
  /** 快照存储 */
  private snapshots = new Map<string, Snapshot<T>>()

  /** 快照历史（按时间排序） */
  private history: string[] = []

  /** 配置选项 */
  private options: Required<SnapshotOptions>

  /**
   * 创建快照管理器
   * 
   * @param options - 配置选项
   */
  constructor(options: SnapshotOptions = {}) {
    this.options = {
      maxSnapshots: options.maxSnapshots || 50,
      compress: options.compress || false,
      serializer: options.serializer || {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      },
    }
  }

  /**
   * 创建快照
   * 
   * 保存当前状态的快照。
   * 如果快照名称已存在，将覆盖旧快照。
   * 
   * @param name - 快照名称
   * @param state - 状态对象
   * @param description - 快照描述
   * @param tags - 快照标签
   * @returns 快照元数据
   * 
   * @example
   * ```typescript
   * snapshotManager.createSnapshot(
   *   '用户登录前',
   *   userStore.$state,
   *   '用户登录前的初始状态',
   *   ['auth', 'initial']
   * )
   * ```
   */
  createSnapshot(
    name: string,
    state: T,
    description?: string,
    tags?: string[]
  ): SnapshotMetadata {
    // 深拷贝状态以避免引用问题
    const stateCopy = this.deepClone(state)

    // 计算数据大小
    const serialized = this.options.serializer.serialize(stateCopy)
    const size = new Blob([serialized]).size

    const snapshot: Snapshot<T> = {
      info: {
        name,
        timestamp: Date.now(),
        description,
        tags,
      },
      state: stateCopy,
      size,
    }

    // 保存快照
    this.snapshots.set(name, snapshot)

    // 更新历史记录
    if (!this.history.includes(name)) {
      this.history.push(name)
    }

    // 检查是否超过最大快照数量
    if (this.options.maxSnapshots > 0 && this.snapshots.size > this.options.maxSnapshots) {
      this.removeOldestSnapshot()
    }

    return snapshot.info
  }

  /**
   * 恢复快照
   * 
   * 从快照中恢复状态。
   * 返回快照中保存的状态的深拷贝。
   * 
   * @param name - 快照名称
   * @returns 恢复的状态，如果快照不存在则返回 undefined
   * 
   * @example
   * ```typescript
   * const state = snapshotManager.restoreSnapshot('用户登录前')
   * if (state) {
   *   userStore.$patch(state)
   * }
   * ```
   */
  restoreSnapshot(name: string): T | undefined {
    const snapshot = this.snapshots.get(name)
    if (!snapshot) {
      return undefined
    }

    // 返回深拷贝以避免修改快照数据
    return this.deepClone(snapshot.state)
  }

  /**
   * 删除快照
   * 
   * @param name - 快照名称
   * @returns 是否成功删除
   */
  deleteSnapshot(name: string): boolean {
    const deleted = this.snapshots.delete(name)
    if (deleted) {
      const index = this.history.indexOf(name)
      if (index !== -1) {
        this.history.splice(index, 1)
      }
    }
    return deleted
  }

  /**
   * 检查快照是否存在
   * 
   * @param name - 快照名称
   * @returns 是否存在
   */
  hasSnapshot(name: string): boolean {
    return this.snapshots.has(name)
  }

  /**
   * 获取快照信息
   * 
   * @param name - 快照名称
   * @returns 快照元数据
   */
  getSnapshotInfo(name: string): SnapshotMetadata | undefined {
    return this.snapshots.get(name)?.info
  }

  /**
   * 列出所有快照
   * 
   * @returns 快照名称数组（按时间排序）
   */
  listSnapshots(): string[] {
    return [...this.history]
  }

  /**
   * 获取所有快照的详细信息
   * 
   * @returns 快照元数据数组
   */
  getAllSnapshotInfo(): SnapshotMetadata[] {
    return this.history
      .map(name => this.snapshots.get(name)?.info)
      .filter((info): info is SnapshotMetadata => info !== undefined)
  }

  /**
   * 根据标签查找快照
   * 
   * @param tag - 标签名称
   * @returns 匹配的快照名称数组
   * 
   * @example
   * ```typescript
   * const authSnapshots = snapshotManager.findByTag('auth')
   * ```
   */
  findByTag(tag: string): string[] {
    const result: string[] = []
    for (const [name, snapshot] of this.snapshots) {
      if (snapshot.info.tags?.includes(tag)) {
        result.push(name)
      }
    }
    return result
  }

  /**
   * 对比两个快照
   * 
   * 比较两个快照的差异，返回详细的差异列表。
   * 
   * @param snapshot1 - 第一个快照名称
   * @param snapshot2 - 第二个快照名称
   * @returns 差异数组
   * 
   * @example
   * ```typescript
   * const diff = snapshotManager.diffSnapshots('登录前', '登录后')
   * diff.forEach(({ path, type, oldValue, newValue }) => {
   *   console.log(`${path}: ${oldValue} -> ${newValue}`)
   * })
   * ```
   */
  diffSnapshots(snapshot1: string, snapshot2: string): StateDiff[] {
    const snap1 = this.snapshots.get(snapshot1)
    const snap2 = this.snapshots.get(snapshot2)

    if (!snap1 || !snap2) {
      throw new Error('One or both snapshots not found')
    }

    return this.compareObjects(snap1.state, snap2.state, '')
  }

  /**
   * 导出快照
   * 
   * 将快照序列化为 JSON 字符串。
   * 
   * @param name - 快照名称
   * @returns JSON 字符串，如果快照不存在则返回 undefined
   * 
   * @example
   * ```typescript
   * const json = snapshotManager.exportSnapshot('重要状态')
   * localStorage.setItem('snapshot', json)
   * ```
   */
  exportSnapshot(name: string): string | undefined {
    const snapshot = this.snapshots.get(name)
    if (!snapshot) {
      return undefined
    }

    return this.options.serializer.serialize(snapshot)
  }

  /**
   * 导入快照
   * 
   * 从 JSON 字符串导入快照。
   * 
   * @param json - JSON 字符串
   * @param newName - 新的快照名称（可选，默认使用原名称）
   * @returns 是否成功导入
   * 
   * @example
   * ```typescript
   * const json = localStorage.getItem('snapshot')
   * if (json) {
   *   snapshotManager.importSnapshot(json)
   * }
   * ```
   */
  importSnapshot(json: string, newName?: string): boolean {
    try {
      const snapshot: Snapshot<T> = this.options.serializer.deserialize(json)

      const name = newName || snapshot.info.name
      this.snapshots.set(name, snapshot)

      if (!this.history.includes(name)) {
        this.history.push(name)
      }

      return true
    } catch (error) {
      console.error('Failed to import snapshot:', error)
      return false
    }
  }

  /**
   * 导出所有快照
   * 
   * @returns JSON 字符串
   */
  exportAll(): string {
    const data = {
      snapshots: Array.from(this.snapshots.entries()),
      history: this.history,
    }
    return this.options.serializer.serialize(data)
  }

  /**
   * 导入所有快照
   * 
   * @param json - JSON 字符串
   * @returns 是否成功导入
   */
  importAll(json: string): boolean {
    try {
      const data = this.options.serializer.deserialize(json)
      this.snapshots = new Map(data.snapshots)
      this.history = data.history
      return true
    } catch (error) {
      console.error('Failed to import snapshots:', error)
      return false
    }
  }

  /**
   * 清空所有快照
   */
  clear(): void {
    this.snapshots.clear()
    this.history = []
  }

  /**
   * 获取快照统计信息
   * 
   * @returns 统计信息对象
   */
  getStats(): {
    count: number
    totalSize: number
    oldestSnapshot?: SnapshotMetadata
    newestSnapshot?: SnapshotMetadata
    averageSize: number
  } {
    const snapshots = Array.from(this.snapshots.values())
    const totalSize = snapshots.reduce((sum, snap) => sum + snap.size, 0)

    let oldestSnapshot: SnapshotMetadata | undefined
    let newestSnapshot: SnapshotMetadata | undefined

    if (snapshots.length > 0) {
      const sorted = snapshots.sort((a, b) => a.info.timestamp - b.info.timestamp)
      oldestSnapshot = sorted[0].info
      newestSnapshot = sorted[sorted.length - 1].info
    }

    return {
      count: this.snapshots.size,
      totalSize,
      oldestSnapshot,
      newestSnapshot,
      averageSize: this.snapshots.size > 0 ? totalSize / this.snapshots.size : 0,
    }
  }

  /**
   * 移除最旧的快照
   * 
   * @private
   */
  private removeOldestSnapshot(): void {
    if (this.history.length === 0) return

    const oldestName = this.history[0]
    this.snapshots.delete(oldestName)
    this.history.shift()
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
   * 比较两个对象的差异
   * 
   * @private
   */
  private compareObjects(obj1: any, obj2: any, path: string): StateDiff[] {
    const diffs: StateDiff[] = []

    // 处理原始类型
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
      if (obj1 !== obj2) {
        diffs.push({
          path,
          type: 'modified',
          oldValue: obj1,
          newValue: obj2,
        })
      }
      return diffs
    }

    // 获取所有键
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    const allKeys = new Set([...keys1, ...keys2])

    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key
      const hasKey1 = key in obj1
      const hasKey2 = key in obj2

      if (!hasKey1) {
        // 键在 obj2 中新增
        diffs.push({
          path: newPath,
          type: 'added',
          newValue: obj2[key],
        })
      } else if (!hasKey2) {
        // 键在 obj1 中被删除
        diffs.push({
          path: newPath,
          type: 'deleted',
          oldValue: obj1[key],
        })
      } else {
        // 键在两个对象中都存在，递归比较
        diffs.push(...this.compareObjects(obj1[key], obj2[key], newPath))
      }
    }

    return diffs
  }
}

/**
 * 创建快照管理器实例
 * 
 * @template T - 状态类型
 * @param options - 配置选项
 * @returns 快照管理器实例
 * 
 * @example
 * ```typescript
 * const snapshotManager = createSnapshotManager<UserState>({
 *   maxSnapshots: 100,
 *   compress: true
 * })
 * ```
 */
export function createSnapshotManager<T = any>(
  options?: SnapshotOptions
): SnapshotManager<T> {
  return new SnapshotManager<T>(options)
}


