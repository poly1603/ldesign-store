/**
 * 中间件系统类型定义
 *
 * @module types/middleware
 */

import type { StateTree, StoreId } from './store'

/**
 * 中间件上下文
 * @template S - 状态类型
 */
export interface MiddlewareContext<S extends StateTree = StateTree> {
  /** Store ID */
  storeId: StoreId
  /** 当前状态 */
  state: S
  /** 操作类型 */
  type: MiddlewareActionType
  /** 操作数据 */
  payload?: unknown
  /** 元数据 */
  meta?: Record<string, unknown>
}

/**
 * 中间件操作类型
 */
export type MiddlewareActionType =
  | 'state:init'
  | 'state:patch'
  | 'state:reset'
  | 'action:before'
  | 'action:after'
  | 'action:error'

/**
 * 中间件函数类型
 * @template S - 状态类型
 */
export type MiddlewareFunction<S extends StateTree = StateTree> = (
  context: MiddlewareContext<S>,
  next: () => void | Promise<void>
) => void | Promise<void>

/**
 * 中间件接口
 * @template S - 状态类型
 */
export interface Middleware<S extends StateTree = StateTree> {
  /** 中间件名称 */
  readonly name: string
  /** 中间件优先级（数字越小越先执行） */
  readonly priority?: number
  /** 中间件处理函数 */
  handler: MiddlewareFunction<S>
}

/**
 * 中间件管理器接口
 */
export interface MiddlewareManager {
  /**
   * 添加中间件
   * @param middleware - 中间件实例
   */
  use: (middleware: Middleware) => void

  /**
   * 移除中间件
   * @param name - 中间件名称
   */
  remove: (name: string) => void

  /**
   * 获取中间件
   * @param name - 中间件名称
   */
  get: (name: string) => Middleware | undefined

  /**
   * 是否存在中间件
   * @param name - 中间件名称
   */
  has: (name: string) => boolean

  /**
   * 执行中间件链
   * @param context - 上下文
   */
  execute: (context: MiddlewareContext) => Promise<void>

  /**
   * 获取所有中间件
   */
  getAll: () => Middleware[]

  /**
   * 清空所有中间件
   */
  clear: () => void
}

/**
 * 日志中间件选项
 */
export interface LoggerMiddlewareOptions {
  /** 是否记录状态变化 */
  logState?: boolean
  /** 是否记录 action */
  logAction?: boolean
  /** 是否折叠日志 */
  collapsed?: boolean
  /** 是否显示时间戳 */
  timestamp?: boolean
  /** 日志级别 */
  level?: 'log' | 'info' | 'warn' | 'debug'
  /** 自定义日志器 */
  logger?: {
    log: (...args: unknown[]) => void
    info: (...args: unknown[]) => void
    warn: (...args: unknown[]) => void
    debug: (...args: unknown[]) => void
    group?: (...args: unknown[]) => void
    groupCollapsed?: (...args: unknown[]) => void
    groupEnd?: () => void
  }
}

/**
 * 持久化中间件选项
 */
export interface PersistMiddlewareOptions {
  /** 存储键名前缀 */
  keyPrefix?: string
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage'
  /** 要持久化的 Store ID 列表（空则全部持久化） */
  stores?: StoreId[]
  /** 要持久化的状态路径 */
  paths?: Record<StoreId, string[]>
  /** 序列化函数 */
  serialize?: (value: unknown) => string
  /** 反序列化函数 */
  deserialize?: (value: string) => unknown
  /** 防抖延迟（毫秒） */
  debounce?: number
}

/**
 * 时间旅行中间件选项
 */
export interface TimeTravelMiddlewareOptions {
  /** 最大历史记录数 */
  maxHistory?: number
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 时间旅行控制器
 */
export interface TimeTravelController {
  /** 撤销 */
  undo: () => void
  /** 重做 */
  redo: () => void
  /** 跳转到指定历史 */
  goto: (index: number) => void
  /** 获取历史记录 */
  getHistory: () => StateSnapshot[]
  /** 当前历史索引 */
  getCurrentIndex: () => number
  /** 是否可撤销 */
  canUndo: () => boolean
  /** 是否可重做 */
  canRedo: () => boolean
  /** 清空历史 */
  clear: () => void
}

/**
 * 状态快照
 */
export interface StateSnapshot {
  /** 快照时间 */
  timestamp: number
  /** 状态数据 */
  state: StateTree
  /** 操作类型 */
  type: MiddlewareActionType
  /** Store ID */
  storeId: StoreId
}

