/**
 * Vue 3 集成模块
 * 
 * 提供 Vue 3 的深度集成功能：
 * - Provider/Inject 模式支持
 * - 丰富的组合式 API（Composables）
 * - 自定义指令
 * - Store 辅助工具
 * 
 * **核心功能**:
 * - `useStore` - 在组件中使用 Store
 * - `useState` - 响应式状态管理
 * - `useAction` - Action 执行管理
 * - `useGetter` - 计算属性管理
 * - `usePersist` - 持久化管理
 * - `StoreProvider` - Store 提供者组件
 * 
 * @module vue
 * 
 * @example
 * ```typescript
 * import { useStore, useState, useAction } from '@ldesign/store/vue'
 * 
 * // 使用 Store
 * const { store, state } = useStore('user')
 * 
 * // 使用状态
 * const { value, setValue } = useState('user', 'name')
 * 
 * // 使用 Action
 * const { execute, loading, error } = useAction('user', 'fetchUsers')
 * ```
 */

// Hook 返回类型
export type {
  ActionHookReturn,
  BatchHookReturn,
  GetterHookReturn,
  PersistHookReturn,
  StateHookReturn,
  StoreHookReturn,
  UseStoreOptions,
} from '../types/hooks'

// Provider 类型定义
export type {
  ProviderPluginOptions,
  StoreDefinition,
  StoreProviderContext,
  StoreProviderOptions,
  StoreRegistration,
  StoreFactory as VueStoreFactory, // 重命名以避免与 core 模块冲突
} from '../types/provider'

// 常量
export { STORE_PROVIDER_KEY } from '../types/provider'

// 组合式 API
export {
  useAction,
  useAsyncAction,
  useBatch,
  useComputed,
  useGetter,
  usePersist,
  useReactiveState,
  useSimpleStore,
  useState,
  useStore,
} from './composables'

// Vue 指令
export {
  createStoreDirectivesPlugin,
  storeDirectives,
  vAction,
  vLoading,
  vStore,
} from './directives'

// 辅助工具
export {
  createAutoStorePlugin,
  createReactiveStore,
  createSimpleStore,
  createStores,
  globalStoreManager,
  StoreManager,
} from './helpers'

export type { SimpleStoreOptions } from './helpers'

// Provider 组件和相关功能
export {
  createStoreProviderPlugin,
  StoreProvider,
  useStoreProvider,
  useStoreRegistration,
} from './StoreProvider'
