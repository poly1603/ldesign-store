/**
 * useSubscribe Composable
 *
 * 提供 Store 订阅功能
 * @module composables/useSubscribe
 */

import { onUnmounted, watch } from 'vue'
import type { Ref, WatchStopHandle } from 'vue'
import type { SubscribeOptions, MutationInfo } from '../types'

/**
 * 订阅 Store 状态变化
 *
 * @template S - 状态类型
 * @param store - Pinia Store 实例
 * @param callback - 回调函数
 * @param options - 订阅选项
 * @returns 取消订阅函数
 *
 * @example
 * ```typescript
 * const store = useCounterStore()
 *
 * // 订阅状态变化
 * const unsubscribe = useSubscribe(store, (mutation, state) => {
 *   console.log('State changed:', mutation.type, state)
 * })
 *
 * // 取消订阅
 * unsubscribe()
 * ```
 */
export function useSubscribe<S extends Record<string, unknown>>(
  store: S & { $subscribe?: (callback: (mutation: MutationInfo<S>, state: S) => void, options?: { detached?: boolean }) => () => void },
  callback: (mutation: MutationInfo<S>, state: S) => void,
  options: SubscribeOptions = {},
): () => void {
  const { detached = false } = options

  // 使用 Pinia 的 $subscribe
  if (store.$subscribe) {
    const unsubscribe = store.$subscribe(
      (mutation, state) => {
        callback(mutation as MutationInfo<S>, state as S)
      },
      { detached },
    )

    // 组件卸载时自动取消订阅
    if (!detached) {
      onUnmounted(() => {
        unsubscribe()
      })
    }

    return unsubscribe
  }

  // 如果不是 Pinia Store，返回空函数
  console.warn('[useSubscribe] Store 不支持 $subscribe 方法')
  return () => {}
}

/**
 * 订阅 Store Action 调用
 *
 * @template S - Store 类型
 * @param store - Pinia Store 实例
 * @param callback - 回调函数
 * @returns 取消订阅函数
 *
 * @example
 * ```typescript
 * const store = useCounterStore()
 *
 * // 订阅 Action 调用
 * useOnAction(store, ({ name, args, after, onError }) => {
 *   console.log(`Action ${name} called with:`, args)
 *
 *   after((result) => {
 *     console.log(`Action ${name} finished with:`, result)
 *   })
 *
 *   onError((error) => {
 *     console.error(`Action ${name} failed:`, error)
 *   })
 * })
 * ```
 */
export function useOnAction<S extends Record<string, unknown>>(
  store: S & { $onAction?: (callback: (context: ActionContext) => void, detached?: boolean) => () => void },
  callback: (context: ActionContext) => void,
  detached = false,
): () => void {
  if (store.$onAction) {
    const unsubscribe = store.$onAction(callback, detached)

    if (!detached) {
      onUnmounted(() => {
        unsubscribe()
      })
    }

    return unsubscribe
  }

  console.warn('[useOnAction] Store 不支持 $onAction 方法')
  return () => {}
}

/**
 * Action 上下文
 */
export interface ActionContext {
  /** Action 名称 */
  name: string
  /** Store 实例 */
  store: unknown
  /** Action 参数 */
  args: unknown[]
  /** Action 完成后回调 */
  after: (callback: (result: unknown) => void) => void
  /** Action 错误回调 */
  onError: (callback: (error: unknown) => void) => void
}

/**
 * 监听 ref 变化
 *
 * @template T - 值类型
 * @param source - 监听源
 * @param callback - 回调函数
 * @param options - 监听选项
 * @returns 停止监听函数
 */
export function useWatch<T>(
  source: Ref<T>,
  callback: (newValue: T, oldValue: T) => void,
  options: SubscribeOptions = {},
): WatchStopHandle {
  const { immediate = false, deep = false, detached = false } = options

  const stop = watch(
    source,
    (newValue, oldValue) => {
      callback(newValue, oldValue)
    },
    { immediate, deep },
  )

  if (!detached) {
    onUnmounted(() => {
      stop()
    })
  }

  return stop
}

