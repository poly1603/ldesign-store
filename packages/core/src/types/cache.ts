/**
 * 缓存相关类型定义
 * @module types/cache
 */

/**
 * 缓存策略
 */
export enum CacheStrategy {
  /** 最近最少使用 */
  LRU = 'lru',
  /** 最不经常使用 */
  LFU = 'lfu',
  /** 先进先出 */
  FIFO = 'fifo'
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  /**
   * 最大缓存数量
   * @default 100
   */
  maxSize?: number

  /**
   * 默认过期时间（毫秒）
   * @default 300000 (5分钟)
   */
  defaultTTL?: number

  /**
   * 缓存策略
   * @default CacheStrategy.LRU
   */
  strategy?: CacheStrategy

  /**
   * 是否启用统计
   * @default false
   */
  enableStats?: boolean

  /**
   * 清理间隔（毫秒）
   * @default 60000 (1分钟)
   */
  cleanupInterval?: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 总请求数 */
  totalRequests: number
  /** 命中数 */
  hits: number
  /** 未命中数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 当前大小 */
  size: number
  /** 最大大小 */
  maxSize: number
}

/**
 * 缓存节点元数据
 */
export interface CacheNodeMetadata {
  /** 访问次数 */
  accessCount: number
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessedAt: number
  /** 过期时间 */
  expiresAt?: number
}




