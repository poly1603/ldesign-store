/**
 * 中间件管理器
 *
 * @module middleware/middleware-manager
 */

import type { Middleware, MiddlewareContext, MiddlewareManager } from '../types'

/**
 * 创建中间件管理器
 *
 * @returns 中间件管理器实例
 *
 * @example
 * ```typescript
 * const manager = createMiddlewareManager()
 *
 * // 添加日志中间件
 * manager.use({
 *   name: 'logger',
 *   priority: 1,
 *   handler: async (ctx, next) => {
 *     console.log('Before:', ctx.type)
 *     await next()
 *     console.log('After:', ctx.type)
 *   }
 * })
 *
 * // 执行中间件链
 * await manager.execute({ storeId: 'test', state: {}, type: 'state:patch' })
 * ```
 */
export function createMiddlewareManager(): MiddlewareManager {
  /** 中间件列表 */
  const middlewares = new Map<string, Middleware>()

  /** 已排序的中间件列表缓存 */
  let sortedMiddlewares: Middleware[] | null = null

  /**
   * 获取排序后的中间件列表
   */
  const getSortedMiddlewares = (): Middleware[] => {
    if (sortedMiddlewares === null) {
      sortedMiddlewares = Array.from(middlewares.values()).sort(
        (a, b) => (a.priority ?? 100) - (b.priority ?? 100),
      )
    }
    return sortedMiddlewares
  }

  /**
   * 使中间件缓存失效
   */
  const invalidateCache = (): void => {
    sortedMiddlewares = null
  }

  /**
   * 添加中间件
   */
  const use = (middleware: Middleware): void => {
    if (middlewares.has(middleware.name)) {
      console.warn(`[Middleware] 中间件 "${middleware.name}" 已存在，将被覆盖`)
    }
    middlewares.set(middleware.name, middleware)
    invalidateCache()
  }

  /**
   * 移除中间件
   */
  const remove = (name: string): void => {
    if (middlewares.delete(name)) {
      invalidateCache()
    }
  }

  /**
   * 获取中间件
   */
  const get = (name: string): Middleware | undefined => {
    return middlewares.get(name)
  }

  /**
   * 是否存在中间件
   */
  const has = (name: string): boolean => {
    return middlewares.has(name)
  }

  /**
   * 执行中间件链
   */
  const execute = async (context: MiddlewareContext): Promise<void> => {
    const sorted = getSortedMiddlewares()

    if (sorted.length === 0) {
      return
    }

    let index = 0

    const next = async (): Promise<void> => {
      if (index < sorted.length) {
        const middleware = sorted[index++]
        await middleware.handler(context, next)
      }
    }

    await next()
  }

  /**
   * 获取所有中间件
   */
  const getAll = (): Middleware[] => {
    return getSortedMiddlewares()
  }

  /**
   * 清空所有中间件
   */
  const clear = (): void => {
    middlewares.clear()
    invalidateCache()
  }

  return {
    use,
    remove,
    get,
    has,
    execute,
    getAll,
    clear,
  }
}

/**
 * 全局中间件管理器
 */
let globalMiddlewareManager: MiddlewareManager | null = null

/**
 * 获取全局中间件管理器
 */
export function getGlobalMiddlewareManager(): MiddlewareManager {
  if (!globalMiddlewareManager) {
    globalMiddlewareManager = createMiddlewareManager()
  }
  return globalMiddlewareManager
}

/**
 * 设置全局中间件管理器
 */
export function setGlobalMiddlewareManager(manager: MiddlewareManager): void {
  globalMiddlewareManager = manager
}

