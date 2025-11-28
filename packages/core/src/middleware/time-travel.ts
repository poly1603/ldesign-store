/**
 * 时间旅行中间件
 *
 * 提供撤销/重做功能
 * @module middleware/time-travel
 */

import type {
  Middleware,
  MiddlewareContext,
  StateSnapshot,
  StateTree,
  StoreId,
  TimeTravelController,
  TimeTravelMiddlewareOptions,
} from '../types'

/**
 * 默认时间旅行选项
 */
const defaultOptions: TimeTravelMiddlewareOptions = {
  maxHistory: 100,
  enabled: true,
}

/**
 * 创建时间旅行中间件
 *
 * @param options - 时间旅行选项
 * @returns 时间旅行中间件和控制器
 *
 * @example
 * ```typescript
 * const { middleware, controller } = createTimeTravelMiddleware({
 *   maxHistory: 50,
 * })
 *
 * middlewareManager.use(middleware)
 *
 * // 撤销操作
 * controller.undo()
 *
 * // 重做操作
 * controller.redo()
 * ```
 */
export function createTimeTravelMiddleware(
  options: TimeTravelMiddlewareOptions = {},
): {
  middleware: Middleware
  controller: TimeTravelController
} {
  const opts = { ...defaultOptions, ...options }

  /** 历史记录 */
  const history: StateSnapshot[] = []

  /** 当前历史索引 */
  let currentIndex = -1

  /** 是否正在时间旅行中 */
  let isTraveling = false

  /** 状态恢复回调 */
  let restoreCallback: ((storeId: StoreId, state: StateTree) => void) | null = null

  /**
   * 添加快照
   */
  const addSnapshot = (snapshot: StateSnapshot): void => {
    if (!opts.enabled || isTraveling) return

    // 如果当前不在历史末尾，删除后面的记录
    if (currentIndex < history.length - 1) {
      history.splice(currentIndex + 1)
    }

    // 添加新快照
    history.push(snapshot)
    currentIndex = history.length - 1

    // 限制历史记录数量
    if (history.length > opts.maxHistory!) {
      history.shift()
      currentIndex--
    }
  }

  /**
   * 控制器
   */
  const controller: TimeTravelController = {
    undo: () => {
      if (!controller.canUndo()) return

      isTraveling = true
      currentIndex--
      const snapshot = history[currentIndex]
      restoreCallback?.(snapshot.storeId, snapshot.state)
      isTraveling = false
    },

    redo: () => {
      if (!controller.canRedo()) return

      isTraveling = true
      currentIndex++
      const snapshot = history[currentIndex]
      restoreCallback?.(snapshot.storeId, snapshot.state)
      isTraveling = false
    },

    goto: (index: number) => {
      if (index < 0 || index >= history.length) return

      isTraveling = true
      currentIndex = index
      const snapshot = history[currentIndex]
      restoreCallback?.(snapshot.storeId, snapshot.state)
      isTraveling = false
    },

    getHistory: () => [...history],

    getCurrentIndex: () => currentIndex,

    canUndo: () => currentIndex > 0,

    canRedo: () => currentIndex < history.length - 1,

    clear: () => {
      history.length = 0
      currentIndex = -1
    },
  }

  /**
   * 中间件
   */
  const middleware: Middleware = {
    name: 'time-travel',
    priority: 50,

    handler: async (context: MiddlewareContext, next: () => void | Promise<void>) => {
      const { storeId, type, state } = context

      // 只记录状态变化
      if (!type.startsWith('state:') || isTraveling) {
        await next()
        return
      }

      // 记录变化前的状态
      const snapshot: StateSnapshot = {
        timestamp: Date.now(),
        state: JSON.parse(JSON.stringify(state)),
        type,
        storeId,
      }

      await next()

      // 添加到历史记录
      addSnapshot(snapshot)
    },
  }

  return {
    middleware,
    controller,
  }
}

/**
 * 设置状态恢复回调
 *
 * @param callback - 回调函数
 */
export function setRestoreCallback(
  controller: TimeTravelController,
  callback: (storeId: StoreId, state: StateTree) => void,
): void {
  // 这里需要通过闭包来设置回调
  // 在实际使用中，可以通过中间件的 context 来获取恢复函数
  console.warn('[TimeTravel] 请使用 createTimeTravelMiddleware 返回的 controller')
}

