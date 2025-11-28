/**
 * 插件系统类型定义
 *
 * @module types/plugin
 */

import type { StateTree, StoreId } from './store'

/**
 * 插件上下文
 */
export interface PluginContext {
  /** Store 管理器实例 */
  storeManager: StoreManagerLike
  /** 当前 Store ID */
  storeId: StoreId
  /** 当前 Store 实例 */
  store: unknown
  /** 插件配置选项 */
  options: Record<string, unknown>
}

/**
 * Store 管理器接口（简化版）
 */
export interface StoreManagerLike {
  /** 获取 Store */
  getStore: (id: StoreId) => unknown
  /** 是否存在 Store */
  hasStore: (id: StoreId) => boolean
  /** 获取所有 Store ID */
  getStoreIds: () => StoreId[]
}

/**
 * 插件接口
 * @template Options - 插件选项类型
 */
export interface StorePlugin<Options = Record<string, unknown>> {
  /** 插件名称 */
  readonly name: string
  /** 插件版本 */
  readonly version?: string
  /** 插件描述 */
  readonly description?: string

  /**
   * 安装插件
   * @param context - 插件上下文
   * @param options - 插件选项
   */
  install: (context: PluginContext, options?: Options) => void | Promise<void>

  /**
   * 卸载插件
   * @param context - 插件上下文
   */
  uninstall?: (context: PluginContext) => void | Promise<void>

  /**
   * Store 创建时的钩子
   * @param store - Store 实例
   */
  onStoreCreated?: (store: unknown) => void

  /**
   * Store 销毁时的钩子
   * @param store - Store 实例
   */
  onStoreDisposed?: (store: unknown) => void

  /**
   * 状态变化时的钩子
   * @param storeId - Store ID
   * @param state - 新状态
   * @param oldState - 旧状态
   */
  onStateChange?: <S extends StateTree>(
    storeId: StoreId,
    state: S,
    oldState: S
  ) => void
}

/**
 * 插件工厂函数类型
 * @template Options - 插件选项类型
 */
export type PluginFactory<Options = Record<string, unknown>> = (
  options?: Options
) => StorePlugin<Options>

/**
 * 定义插件选项
 * @template Options - 插件选项类型
 */
export interface DefinePluginOptions<Options = Record<string, unknown>> {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version?: string
  /** 插件描述 */
  description?: string
  /** 安装函数 */
  install: StorePlugin<Options>['install']
  /** 卸载函数 */
  uninstall?: StorePlugin<Options>['uninstall']
  /** Store 创建钩子 */
  onStoreCreated?: StorePlugin<Options>['onStoreCreated']
  /** Store 销毁钩子 */
  onStoreDisposed?: StorePlugin<Options>['onStoreDisposed']
  /** 状态变化钩子 */
  onStateChange?: StorePlugin<Options>['onStateChange']
}

/**
 * 插件管理器接口
 */
export interface PluginManager {
  /**
   * 注册插件
   * @param plugin - 插件实例
   * @param options - 插件选项
   */
  use: <Options>(plugin: StorePlugin<Options>, options?: Options) => void

  /**
   * 移除插件
   * @param name - 插件名称
   */
  remove: (name: string) => void

  /**
   * 获取插件
   * @param name - 插件名称
   */
  get: (name: string) => StorePlugin | undefined

  /**
   * 是否已注册插件
   * @param name - 插件名称
   */
  has: (name: string) => boolean

  /**
   * 获取所有插件
   */
  getAll: () => Map<string, StorePlugin>

  /**
   * 获取插件数量
   */
  size: () => number

  /**
   * 清空所有插件
   */
  clear: () => void
}

