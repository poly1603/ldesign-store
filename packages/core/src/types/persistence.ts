/**
 * 持久化相关类型定义
 * @module types/persistence
 */

import type { Serializer, StorageAdapter } from './core'

/**
 * 持久化选项
 */
export interface PersistOptions {
  /**
   * 存储键名
   * @default store.$id
   */
  key?: string

  /**
   * 存储适配器
   * @default localStorage (浏览器) / 内存存储 (Node.js)
   */
  storage?: StorageAdapter

  /**
   * 要持久化的状态路径
   * @default undefined (持久化所有状态)
   * @example ['user', 'settings.theme']
   */
  paths?: string[]

  /**
   * 序列化器
   * @default JSON
   */
  serializer?: Serializer

  /**
   * 在恢复前的钩子
   */
  beforeRestore?: (context: PersistContext) => void | Promise<void>

  /**
   * 恢复后的钩子
   */
  afterRestore?: (context: PersistContext) => void

  /**
   * 防抖延迟（毫秒）
   * @default 0
   */
  debounce?: number
}

/**
 * 持久化上下文
 */
export interface PersistContext {
  /** Store ID */
  storeId: string
  /** 存储键名 */
  key: string
  /** 持久化的状态 */
  state: any
}

/**
 * 持久化策略
 */
export enum PersistStrategy {
  /** 立即持久化 */
  IMMEDIATE = 'immediate',
  /** 防抖持久化 */
  DEBOUNCED = 'debounced',
  /** 节流持久化 */
  THROTTLED = 'throttled',
  /** 手动持久化 */
  MANUAL = 'manual'
}




