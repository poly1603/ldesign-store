/**
 * 核心类型定义
 * @module types/core
 */

/**
 * 状态定义类型
 */
export type StateDefinition = Record<string, any>

/**
 * Action 定义类型
 */
export type ActionDefinition = Record<string, (...args: any[]) => any>

/**
 * Getter 定义类型
 */
export type GetterDefinition = Record<string, (state: any) => any>

/**
 * 订阅回调函数
 */
export type SubscriptionCallback<T = any> = (value: T, oldValue?: T) => void

/**
 * 取消订阅函数
 */
export type Unsubscribe = () => void

/**
 * 事件回调函数
 */
export type EventCallback<T = any> = (data: T) => void

/**
 * 批量更新函数
 */
export type BatchUpdateFn = () => void

/**
 * 清理函数
 */
export type CleanupFn = () => void

/**
 * 序列化器接口
 */
export interface Serializer<T = any> {
  /**
   * 序列化
   */
  serialize(value: T): string

  /**
   * 反序列化
   */
  deserialize(str: string): T
}

/**
 * 存储适配器接口
 */
export interface StorageAdapter {
  /**
   * 获取值
   */
  getItem(key: string): string | null

  /**
   * 设置值
   */
  setItem(key: string, value: string): void

  /**
   * 删除值
   */
  removeItem(key: string): void

  /**
   * 清空
   */
  clear(): void
}



