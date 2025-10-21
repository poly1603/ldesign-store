/**
 * Vue 3 集成模块
 * 提供 Vue 3 的 Provider/Inject 模式支持和组合式 API
 */
export type { ActionHookReturn, BatchHookReturn, GetterHookReturn, PersistHookReturn, StateHookReturn, StoreHookReturn, UseStoreOptions, } from '../types/hooks';
export type { ProviderPluginOptions, StoreDefinition, StoreProviderContext, StoreProviderOptions, StoreRegistration, StoreFactory as VueStoreFactory, } from '../types/provider';
export { STORE_PROVIDER_KEY } from '../types/provider';
export { useAction, useAsyncAction, useBatch, useComputed, useGetter, usePersist, useReactiveState, useSimpleStore, useState, useStore, } from './composables';
export { createStoreDirectivesPlugin, storeDirectives, vAction, vLoading, vStore, } from './directives';
export { createAutoStorePlugin, createReactiveStore, createSimpleStore, createStores, globalStoreManager, StoreManager, } from './helpers';
export type { SimpleStoreOptions } from './helpers';
export { createStoreProviderPlugin, StoreProvider, useStoreProvider, useStoreRegistration, } from './StoreProvider';
