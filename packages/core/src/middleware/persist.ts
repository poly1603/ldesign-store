/**
 * 持久化中间件
 *
 * 提供状态持久化功能
 * @module middleware/persist
 */

import type { Middleware, MiddlewareContext, PersistMiddlewareOptions, StateTree, StoreId } from '../types'

/**
 * 默认持久化选项
 */
const defaultOptions: PersistMiddlewareOptions = {
  keyPrefix: 'ldesign-store:',
  storage: 'localStorage',
  debounce: 100,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
}

/**
 * 创建防抖函数
 */
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): T {
  let timer: ReturnType<typeof setTimeout> | null = null

  return ((...args: any[]) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }) as T
}

/**
 * 获取存储对象
 */
function getStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  return type === 'localStorage' ? localStorage : sessionStorage
}

/**
 * 创建持久化中间件
 *
 * @param options - 持久化选项
 * @returns 持久化中间件
 *
 * @example
 * ```typescript
 * const persist = createPersistMiddleware({
 *   storage: 'localStorage',
 *   stores: ['user', 'settings'],
 *   debounce: 200,
 * })
 *
 * middlewareManager.use(persist)
 * ```
 */
export function createPersistMiddleware(
  options: PersistMiddlewareOptions = {},
): Middleware {
  const opts = { ...defaultOptions, ...options }
  const storage = getStorage(opts.storage || 'localStorage')

  /** 保存状态的防抖函数映射 */
  const debouncedSave = new Map<StoreId, (state: StateTree) => void>()

  /**
   * 获取存储键名
   */
  const getKey = (storeId: StoreId): string => {
    return `${opts.keyPrefix}${storeId}`
  }

  /**
   * 筛选需要持久化的状态路径
   */
  const filterState = (storeId: StoreId, state: StateTree): StateTree => {
    const paths = opts.paths?.[storeId]
    if (!paths || paths.length === 0) {
      return state
    }

    const filtered: StateTree = {}
    for (const path of paths) {
      const keys = path.split('.')
      let source: unknown = state
      let target: StateTree = filtered

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (i === keys.length - 1) {
          target[key] = (source as StateTree)?.[key]
        }
        else {
          target[key] = target[key] || {}
          target = target[key] as StateTree
          source = (source as StateTree)?.[key]
        }
      }
    }

    return filtered
  }

  /**
   * 保存状态到存储
   */
  const saveState = (storeId: StoreId, state: StateTree): void => {
    if (!storage) return

    try {
      const filteredState = filterState(storeId, state)
      const serialized = opts.serialize!(filteredState)
      storage.setItem(getKey(storeId), serialized)
    }
    catch (error) {
      console.error(`[Persist] 保存状态失败 (${storeId}):`, error)
    }
  }

  /**
   * 获取或创建防抖保存函数
   */
  const getDebouncedSave = (storeId: StoreId): (state: StateTree) => void => {
    let fn = debouncedSave.get(storeId)
    if (!fn) {
      fn = debounce((state: StateTree) => saveState(storeId, state), opts.debounce!)
      debouncedSave.set(storeId, fn)
    }
    return fn
  }

  return {
    name: 'persist',
    priority: 100, // 最后执行

    handler: async (context: MiddlewareContext, next: () => void | Promise<void>) => {
      await next()

      const { storeId, type, state } = context

      // 只在状态变化时持久化
      if (!type.startsWith('state:')) {
        return
      }

      // 检查是否需要持久化此 Store
      if (opts.stores && !opts.stores.includes(storeId)) {
        return
      }

      // 使用防抖保存
      getDebouncedSave(storeId)(state)
    },
  }
}

/**
 * 从存储恢复状态
 *
 * @param storeId - Store ID
 * @param options - 持久化选项
 * @returns 恢复的状态或 null
 */
export function restoreState<S extends StateTree>(
  storeId: StoreId,
  options: PersistMiddlewareOptions = {},
): S | null {
  const opts = { ...defaultOptions, ...options }
  const storage = getStorage(opts.storage || 'localStorage')

  if (!storage) return null

  try {
    const key = `${opts.keyPrefix}${storeId}`
    const data = storage.getItem(key)
    if (data) {
      return opts.deserialize!(data) as S
    }
  }
  catch (error) {
    console.error(`[Persist] 恢复状态失败 (${storeId}):`, error)
  }

  return null
}

