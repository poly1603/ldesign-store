/**
 * useStore Composable
 *
 * 提供在组件中使用 Store 的便捷方法
 * @module composables/useStore
 */

import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { StoreGeneric } from 'pinia'
import type { Ref } from 'vue'

/**
 * useStore 选项
 */
export interface UseStoreOptions {
  /** 是否立即同步状态 */
  immediate?: boolean
  /** 是否深度监听 */
  deep?: boolean
}

/**
 * 通用 Store Hook
 *
 * 提供对 Pinia Store 的便捷访问
 *
 * @template T - Store 类型
 * @param useStoreHook - Pinia useStore hook
 * @param options - 选项
 * @returns Store 包装对象
 *
 * @example
 * ```typescript
 * // 定义 Store
 * const useCounterStore = defineStore('counter', {
 *   state: () => ({ count: 0 }),
 *   actions: {
 *     increment() { this.count++ }
 *   }
 * })
 *
 * // 在组件中使用
 * const { store, refs, reset } = useStore(useCounterStore)
 *
 * // 访问响应式状态
 * console.log(refs.count.value)
 *
 * // 调用 action
 * store.increment()
 * ```
 */
export function useStore<T extends StoreGeneric>(
  useStoreHook: () => T,
  _options: UseStoreOptions = {},
): {
  store: T
  refs: ReturnType<typeof storeToRefs<T>>
  reset: () => void
  patch: (partial: Partial<T> | ((state: T) => void)) => void
} {
  const store = useStoreHook()

  // 获取响应式 refs
  const refs = storeToRefs(store)

  // 重置函数
  const reset = (): void => {
    if ('$reset' in store && typeof store.$reset === 'function') {
      (store.$reset as () => void)()
    }
  }

  // 批量更新函数
  const patch = (partial: Partial<T> | ((state: T) => void)): void => {
    if ('$patch' in store && typeof store.$patch === 'function') {
      (store.$patch as (partial: unknown) => void)(partial)
    }
  }

  return {
    store,
    refs,
    reset,
    patch,
  }
}

/**
 * 创建简单的响应式 Store
 *
 * 不依赖 Pinia，适用于简单场景
 *
 * @template S - 状态类型
 * @param initialState - 初始状态
 * @returns 响应式 Store
 *
 * @example
 * ```typescript
 * const { state, setState, reset } = useSimpleStore({
 *   count: 0,
 *   name: 'test'
 * })
 *
 * // 更新状态
 * setState({ count: 1 })
 *
 * // 重置
 * reset()
 * ```
 */
export function useSimpleStore<S extends Record<string, unknown>>(
  initialState: S,
): {
  state: Ref<S>
  setState: (partial: Partial<S>) => void
  reset: () => void
  subscribe: (callback: (state: S) => void) => () => void
} {
  const state = ref({ ...initialState }) as Ref<S>
  const initialStateCopy = { ...initialState }

  const setState = (partial: Partial<S>): void => {
    Object.assign(state.value, partial)
  }

  const reset = (): void => {
    state.value = { ...initialStateCopy } as S
  }

  const subscribe = (callback: (state: S) => void): (() => void) => {
    const stop = watch(
      state,
      (newState) => {
        callback(newState)
      },
      { deep: true },
    )
    return stop
  }

  return {
    state,
    setState,
    reset,
    subscribe,
  }
}

/**
 * 创建计算属性 Store
 *
 * @template S - 状态类型
 * @template G - Getters 类型
 * @param state - 状态
 * @param getters - 计算属性
 * @returns 带计算属性的 Store
 */
export function useComputedStore<
  S extends Record<string, unknown>,
  G extends Record<string, (state: S) => unknown>,
>(
  state: Ref<S>,
  getters: G,
): {
  state: Ref<S>
  getters: { [K in keyof G]: ReturnType<G[K]> }
} {
  const computedGetters = {} as { [K in keyof G]: ReturnType<G[K]> }

  for (const key in getters) {
    (computedGetters as Record<string, unknown>)[key] = computed(() =>
      getters[key](state.value),
    )
  }

  return {
    state,
    getters: computedGetters,
  }
}

