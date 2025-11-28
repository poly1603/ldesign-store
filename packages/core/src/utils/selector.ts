/**
 * 状态选择器工具
 *
 * @module utils/selector
 */

import type { Selector, StateTree } from '../types'

/**
 * 创建记忆化选择器
 *
 * @template S - 状态类型
 * @template R - 返回值类型
 * @param selector - 选择器函数
 * @param equalityFn - 相等性比较函数
 * @returns 记忆化的选择器
 *
 * @example
 * ```typescript
 * const selectTodos = createSelector(
 *   (state: AppState) => state.todos,
 * )
 *
 * const selectCompletedTodos = createSelector(
 *   (state: AppState) => state.todos.filter(t => t.completed),
 *   (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
 * )
 * ```
 */
export function createSelector<S extends StateTree, R>(
  selector: Selector<S, R>,
  equalityFn: (a: R, b: R) => boolean = Object.is,
): Selector<S, R> {
  let lastState: S | undefined
  let lastResult: R | undefined
  let initialized = false

  return (state: S): R => {
    if (!initialized || lastState !== state) {
      const result = selector(state)

      if (!initialized || !equalityFn(result, lastResult!)) {
        lastResult = result
      }

      lastState = state
      initialized = true
    }

    return lastResult!
  }
}

/**
 * 组合多个选择器
 *
 * @template S - 状态类型
 * @template R - 结果类型数组
 * @template C - 组合结果类型
 * @param selectors - 选择器数组
 * @param combiner - 组合函数
 * @returns 组合后的选择器
 *
 * @example
 * ```typescript
 * const selectUserAndTodos = combineSelectors(
 *   [
 *     (state) => state.user,
 *     (state) => state.todos,
 *   ],
 *   (user, todos) => ({ user, todos })
 * )
 * ```
 */
export function combineSelectors<
  S extends StateTree,
  R extends unknown[],
  C,
>(
  selectors: { [K in keyof R]: Selector<S, R[K]> },
  combiner: (...results: R) => C,
): Selector<S, C> {
  return (state: S): C => {
    const results = selectors.map(selector => selector(state)) as R
    return combiner(...results)
  }
}

/**
 * 创建带缓存的选择器
 *
 * @template S - 状态类型
 * @template R - 返回值类型
 * @param selector - 选择器函数
 * @param cacheSize - 缓存大小
 * @returns 带缓存的选择器
 */
export function createCachedSelector<S extends StateTree, R>(
  selector: Selector<S, R>,
  cacheSize = 10,
): Selector<S, R> {
  const cache = new Map<string, { state: S, result: R }>()
  const keys: string[] = []

  return (state: S): R => {
    // 使用简单的字符串化作为缓存键
    const key = JSON.stringify(state)

    const cached = cache.get(key)
    if (cached && cached.state === state) {
      return cached.result
    }

    const result = selector(state)

    // 管理缓存大小
    if (keys.length >= cacheSize) {
      const oldKey = keys.shift()!
      cache.delete(oldKey)
    }

    cache.set(key, { state, result })
    keys.push(key)

    return result
  }
}

/**
 * 获取嵌套对象的值
 *
 * @param obj - 对象
 * @param path - 路径
 * @returns 值
 *
 * @example
 * ```typescript
 * const value = getByPath({ a: { b: { c: 1 } } }, 'a.b.c')
 * // value: 1
 * ```
 */
export function getByPath(obj: unknown, path: string): unknown {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined
    }
    result = (result as Record<string, unknown>)[key]
  }

  return result
}

/**
 * 设置嵌套对象的值
 *
 * @param obj - 对象
 * @param path - 路径
 * @param value - 值
 * @returns 是否成功
 */
export function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): boolean {
  const keys = path.split('.')
  let current: Record<string, unknown> = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current[key] === undefined) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return true
}

