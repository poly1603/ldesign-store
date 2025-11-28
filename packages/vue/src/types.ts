/**
 * Vue Store 类型定义
 *
 * @module types
 */

import type { Ref } from 'vue'
import type { Pinia, StoreDefinition as PiniaStoreDefinition } from 'pinia'

/**
 * Store 配置选项
 */
export interface StoreOptions {
  /** 是否启用持久化 */
  persist?: boolean | PersistOptions
  /** 是否启用开发工具 */
  devtools?: boolean
  /** 是否启用严格模式 */
  strict?: boolean
}

/**
 * 持久化选项
 */
export interface PersistOptions {
  /** 存储键名 */
  key?: string
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage'
  /** 要持久化的路径 */
  paths?: string[]
  /** 防抖延迟 */
  debounce?: number
  /** 恢复前回调 */
  beforeRestore?: (context: { store: unknown }) => void
  /** 恢复后回调 */
  afterRestore?: (context: { store: unknown }) => void
}

/**
 * Engine 插件配置选项
 */
export interface StoreEnginePluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 是否启用持久化 */
  persist?: boolean
  /** 持久化配置 */
  persistOptions?: PersistOptions
  /** 是否启用开发工具 */
  devtools?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否注册全局属性 */
  globalProperties?: boolean
  /** Pinia 实例（可选，用于复用已有实例） */
  pinia?: Pinia
}

/**
 * useStore 返回类型
 */
export interface UseStoreReturn<S = unknown> {
  /** 状态 */
  state: Ref<S>
  /** 重置状态 */
  reset: () => void
  /** 批量更新 */
  patch: (partial: Partial<S> | ((state: S) => void)) => void
  /** Store 实例 */
  store: unknown
}

/**
 * usePersist 选项
 */
export interface UsePersistOptions {
  /** 存储键名 */
  key: string
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage'
  /** 默认值 */
  defaultValue?: unknown
  /** 序列化函数 */
  serialize?: (value: unknown) => string
  /** 反序列化函数 */
  deserialize?: (value: string) => unknown
}

/**
 * usePersist 返回类型
 */
export interface UsePersistReturn<T> {
  /** 持久化的值 */
  value: Ref<T>
  /** 保存到存储 */
  save: () => void
  /** 从存储恢复 */
  restore: () => void
  /** 清除存储 */
  clear: () => void
}

/**
 * Store 订阅选项
 */
export interface SubscribeOptions {
  /** 是否立即执行 */
  immediate?: boolean
  /** 是否深度监听 */
  deep?: boolean
  /** 是否在组件卸载后保持订阅 */
  detached?: boolean
}

/**
 * Store 状态变化信息
 */
export interface MutationInfo<S = unknown> {
  /** 变化类型 */
  type: 'direct' | 'patch object' | 'patch function'
  /** Store ID */
  storeId: string
  /** 变化的键 */
  events?: string[]
  /** 旧状态 */
  oldState?: Partial<S>
}

/**
 * Store Provider 属性
 */
export interface StoreProviderProps {
  /** Pinia 实例 */
  pinia?: Pinia
  /** 子组件 */
  children?: unknown
}

/**
 * 全局 Store API
 */
export interface GlobalStoreAPI {
  /** Pinia 实例 */
  pinia: Pinia
  /** 获取 Store */
  getStore: <T>(id: string) => T | undefined
  /** 是否存在 Store */
  hasStore: (id: string) => boolean
  /** 获取所有 Store ID */
  getStoreIds: () => string[]
  /** 重置所有 Store */
  resetAll: () => void
}

