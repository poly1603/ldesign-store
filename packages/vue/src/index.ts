/**
 * @ldesign/store-vue - Vue 3 状态管理适配器
 *
 * 基于 Pinia 的增强版状态管理解决方案
 *
 * 主要功能：
 * - Pinia 集成与增强
 * - 状态持久化
 * - Engine 插件集成
 * - 丰富的 Composables
 *
 * @module @ldesign/store-vue
 */

// === 从 Pinia 重新导出 ===
export {
  createPinia,
  defineStore,
  getActivePinia,
  mapActions,
  mapGetters,
  mapState,
  mapStores,
  mapWritableState,
  setActivePinia,
  storeToRefs,
} from 'pinia'

export type {
  Pinia,
  PiniaPlugin,
  PiniaPluginContext,
  StateTree,
  Store,
  StoreDefinition,
  StoreGeneric,
  StoreGetters,
  StoreState,
} from 'pinia'

// === Composables ===
export {
  useComputedStore,
  useOnAction,
  usePersist,
  usePersistedRef,
  usePersistedRefWithTTL,
  useSimpleStore,
  useStore,
  useSubscribe,
  useWatch,
} from './composables'

export type { ActionContext } from './composables'

// === 插件 ===
export {
  createPersistPlugin,
  createStoreEnginePlugin,
  getGlobalStoreAPI,
} from './plugins'

export type { PersistPluginOptions } from './plugins'

// === 类型 ===
export type {
  GlobalStoreAPI,
  MutationInfo,
  PersistOptions,
  StoreEnginePluginOptions,
  StoreOptions,
  StoreProviderProps,
  SubscribeOptions,
  UsePersistOptions,
  UsePersistReturn,
  UseStoreReturn,
} from './types'

// === 从 @ldesign/store-core 重新导出常用功能 ===
export {
  // 核心
  batch,
  createBatchManager,
  createEventBus,
  createPubSub,
  createPubSubWithValue,
  globalEventBus,
  // 中间件
  createLoggerMiddleware,
  createMiddlewareManager,
  createTimeTravelMiddleware,
  // 插件
  composePlugins,
  createPluginFactory,
  defineStorePlugin,
  // 工具
  combineSelectors,
  createSelector,
  deepClone,
  deepMerge,
} from '@ldesign/store-core'

// === 版本信息 ===
export const version = '1.0.0'
export const name = '@ldesign/store-vue'

