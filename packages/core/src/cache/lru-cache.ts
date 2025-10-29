/**
 * LRU 缓存实现
 * 
 * 使用双向链表 + Map 实现 O(1) 时间复杂度的 LRU 缓存
 * 
 * @module cache/lru-cache
 */

import type { CacheOptions, CacheStats } from '../types'

/**
 * LRU 缓存节点
 * @internal
 */
class LRUNode<K, V> {
  constructor(
    public key: K,
    public value: V,
    public timestamp: number,
    public ttl?: number,
    public accessCount = 0,
    public prev: LRUNode<K, V> | null = null,
    public next: LRUNode<K, V> | null = null
  ) { }
}

/**
 * LRU 缓存管理器
 * 
 * **性能特点**:
 * - ⚡ O(1) 时间复杂度的 get/set/delete 操作
 * - 🧹 自动清理过期缓存
 * - 📊 可选的统计功能
 * - 💾 内存限制保护
 * 
 * @template K - 键类型
 * @template V - 值类型
 * 
 * @example
 * ```typescript
 * const cache = new LRUCache<string, User>({
 *   maxSize: 100,
 *   defaultTTL: 5 * 60 * 1000,
 *   enableStats: true
 * })
 * 
 * cache.set('user:1', { id: 1, name: '张三' })
 * const user = cache.get('user:1')
 * 
 * // 查看统计
 * console.log(cache.getStats())
 * 
 * // 清理资源
 * cache.dispose()
 * ```
 */
export class LRUCache<K = string, V = any> {
  private cache = new Map<K, LRUNode<K, V>>()
  private head: LRUNode<K, V> | null = null
  private tail: LRUNode<K, V> | null = null
  private maxSize: number
  private defaultTTL: number
  private cleanupInterval: number
  private enableStats: boolean
  private cleanupTimer?: NodeJS.Timeout

  // 统计信息
  private stats = {
    totalRequests: 0,
    hits: 0,
    misses: 0
  }

  /**
   * 创建 LRU 缓存实例
   * 
   * @param options - 缓存选项
   */
  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 100
    this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000
    this.cleanupInterval = options.cleanupInterval ?? 60000
    this.enableStats = options.enableStats ?? false

    // 启动定期清理过期缓存
    this.startCleanup()
  }

  /**
   * 设置缓存
   * 
   * ⚡ 性能: O(1)
   * 
   * @param key - 键
   * @param value - 值
   * @param ttl - 过期时间（毫秒），可选
   */
  set(key: K, value: V, ttl?: number): void {
    const now = Date.now()
    const existingNode = this.cache.get(key)

    if (existingNode) {
      // 更新现有节点
      existingNode.value = value
      existingNode.timestamp = now
      existingNode.ttl = ttl ?? this.defaultTTL
      existingNode.accessCount++
      this.moveToHead(existingNode)
    }
    else {
      // 创建新节点
      const newNode = new LRUNode(key, value, now, ttl ?? this.defaultTTL)
      this.cache.set(key, newNode)
      this.addToHead(newNode)

      // 如果超过最大容量，删除最少使用的节点
      if (this.cache.size > this.maxSize) {
        this.removeTail()
      }
    }
  }

  /**
   * 获取缓存
   * 
   * ⚡ 性能: O(1)
   * 
   * @param key - 键
   * @returns 缓存的值，如果不存在或已过期返回 undefined
   */
  get(key: K): V | undefined {
    if (this.enableStats) {
      this.stats.totalRequests++
    }

    const node = this.cache.get(key)
    if (!node) {
      if (this.enableStats) {
        this.stats.misses++
      }
      return undefined
    }

    // 检查是否过期
    const now = Date.now()
    if (node.ttl && now - node.timestamp > node.ttl) {
      this.remove(key)
      if (this.enableStats) {
        this.stats.misses++
      }
      return undefined
    }

    // 更新访问计数
    node.accessCount++

    if (this.enableStats) {
      this.stats.hits++
    }

    // 移动到头部（最近使用）
    this.moveToHead(node)
    return node.value
  }

  /**
   * 检查缓存是否存在且未过期
   * 
   * ⚡ 性能: O(1)
   * 
   * @param key - 键
   * @returns 是否存在
   */
  has(key: K): boolean {
    const node = this.cache.get(key)
    if (!node) return false

    const now = Date.now()
    if (node.ttl && now - node.timestamp > node.ttl) {
      this.remove(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存
   * 
   * ⚡ 性能: O(1)
   * 
   * @param key - 键
   * @returns 是否删除成功
   */
  delete(key: K): boolean {
    return this.remove(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.head = null
    this.tail = null

    // 重置统计
    if (this.enableStats) {
      this.stats.totalRequests = 0
      this.stats.hits = 0
      this.stats.misses = 0
    }
  }

  /**
   * 获取缓存大小
   * 
   * @returns 当前缓存数量
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   * 
   * @returns 键数组
   */
  keys(): K[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取统计信息
   * 
   * @returns 缓存统计数据
   */
  getStats(): CacheStats {
    const hitRate = this.stats.totalRequests > 0
      ? this.stats.hits / this.stats.totalRequests
      : 0

    return {
      totalRequests: this.stats.totalRequests,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats.totalRequests = 0
    this.stats.hits = 0
    this.stats.misses = 0
  }

  /**
   * 销毁缓存，清理所有资源
   * 
   * 释放内存并停止定时清理任务
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
  }

  /**
   * 添加节点到头部
   * @private
   */
  private addToHead(node: LRUNode<K, V>): void {
    node.prev = null
    node.next = this.head

    if (this.head) {
      this.head.prev = node
    }

    this.head = node

    if (!this.tail) {
      this.tail = node
    }
  }

  /**
   * 移除节点
   * @private
   */
  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    }
    else {
      this.tail = node.prev
    }
  }

  /**
   * 移动节点到头部
   * @private
   */
  private moveToHead(node: LRUNode<K, V>): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  /**
   * 移除尾部节点
   * @private
   */
  private removeTail(): void {
    if (!this.tail) return

    const key = this.tail.key
    this.removeNode(this.tail)
    this.cache.delete(key)
  }

  /**
   * 删除指定键
   * @private
   */
  private remove(key: K): boolean {
    const node = this.cache.get(key)
    if (!node) return false

    this.removeNode(node)
    this.cache.delete(key)
    return true
  }

  /**
   * 启动定期清理
   * @private
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)

    // 使用 unref() 防止阻止进程退出
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref()
    }
  }

  /**
   * 清理过期缓存
   * @private
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: K[] = []

    for (const [key, node] of this.cache.entries()) {
      if (node.ttl && now - node.timestamp > node.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.remove(key))
  }
}



