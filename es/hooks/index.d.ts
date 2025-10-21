/**
 * Hooks 模块
 * 提供类似 React Hook 的使用方式
 */
export type { ActionHookReturn, BatchHookReturn, GetterHookReturn, PersistHookReturn, StateHookReturn, StoreHookReturn, UseStoreOptions, } from '../types/hooks';
export { createAsyncAction, createComputed, createStore as createHookStore, // 重命名以避免与 core 模块冲突
createPersistedState, createState, } from './createStore';
export { useActionState, useDebounce, useLocalStorage, useSelector, useSessionStorage, useStateWatch, useStoreHook, useThrottle, } from './useStoreHooks';
