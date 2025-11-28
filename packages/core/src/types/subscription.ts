/**
 * 订阅系统类型定义
 *
 * @module types/subscription
 */

import type { StateTree, StoreId } from './store'

/**
 * 订阅回调类型
 * @template T - 数据类型
 */
export type Subscriber<T = unknown> = (value: T, oldValue?: T) => void

/**
 * 取消订阅函数类型
 */
export type Unsubscribe = () => void

/**
 * 订阅选项
 */
export interface SubscriptionOptions {
  /** 是否立即执行 */
  immediate?: boolean
  /** 是否在 store 销毁后保持订阅 */
  detached?: boolean
}

/**
 * 发布订阅管理器接口
 */
export interface PubSub<T = unknown> {
  /**
   * 订阅
   * @param callback - 回调函数
   * @param options - 订阅选项
   * @returns 取消订阅函数
   */
  subscribe: (callback: Subscriber<T>, options?: SubscriptionOptions) => Unsubscribe

  /**
   * 发布
   * @param value - 新值
   * @param oldValue - 旧值
   */
  publish: (value: T, oldValue?: T) => void

  /**
   * 清空所有订阅
   */
  clear: () => void

  /**
   * 获取订阅者数量
   */
  size: () => number
}

/**
 * 事件类型
 */
export type EventType =
  | 'store:created'
  | 'store:disposed'
  | 'state:changed'
  | 'action:called'
  | 'action:completed'
  | 'action:error'
  | 'plugin:installed'
  | 'plugin:uninstalled'

/**
 * 事件数据
 */
export interface EventData {
  /** 事件类型 */
  type: EventType
  /** Store ID */
  storeId?: StoreId
  /** 事件数据 */
  payload?: unknown
  /** 时间戳 */
  timestamp: number
}

/**
 * 事件监听器类型
 */
export type EventListener = (data: EventData) => void

/**
 * 事件总线接口
 */
export interface EventBus {
  /**
   * 监听事件
   * @param type - 事件类型
   * @param listener - 监听器
   * @returns 取消监听函数
   */
  on: (type: EventType | '*', listener: EventListener) => Unsubscribe

  /**
   * 监听一次
   * @param type - 事件类型
   * @param listener - 监听器
   * @returns 取消监听函数
   */
  once: (type: EventType, listener: EventListener) => Unsubscribe

  /**
   * 取消监听
   * @param type - 事件类型
   * @param listener - 监听器
   */
  off: (type: EventType | '*', listener?: EventListener) => void

  /**
   * 发送事件
   * @param type - 事件类型
   * @param payload - 事件数据
   */
  emit: (type: EventType, payload?: unknown) => void

  /**
   * 清空所有监听器
   */
  clear: () => void
}

/**
 * 选择器函数类型
 * @template S - 状态类型
 * @template R - 返回值类型
 */
export type Selector<S extends StateTree, R> = (state: S) => R

/**
 * 选择器订阅选项
 */
export interface SelectorOptions<R> {
  /** 是否立即执行 */
  immediate?: boolean
  /** 相等性比较函数 */
  equalityFn?: (a: R, b: R) => boolean
}

/**
 * 批量更新上下文
 */
export interface BatchContext {
  /** 是否正在批量更新 */
  isBatching: boolean
  /** 待更新的 Store ID 列表 */
  pendingStores: Set<StoreId>
}

/**
 * 批量更新管理器接口
 */
export interface BatchManager {
  /**
   * 开始批量更新
   */
  start: () => void

  /**
   * 结束批量更新并通知所有订阅者
   */
  end: () => void

  /**
   * 标记 Store 需要更新
   * @param storeId - Store ID
   */
  markDirty: (storeId: StoreId) => void

  /**
   * 在批量上下文中执行
   * @param fn - 执行函数
   */
  batch: <T>(fn: () => T) => T

  /**
   * 是否正在批量更新
   */
  isBatching: () => boolean
}

