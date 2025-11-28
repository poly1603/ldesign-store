/**
 * 日志中间件
 *
 * 提供状态变化和 Action 调用的日志记录
 * @module middleware/logger
 */

import type { LoggerMiddlewareOptions, Middleware, MiddlewareContext } from '../types'

/**
 * 默认日志选项
 */
const defaultOptions: LoggerMiddlewareOptions = {
  logState: true,
  logAction: true,
  collapsed: true,
  timestamp: true,
  level: 'log',
}

/**
 * 格式化时间戳
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const ms = date.getMilliseconds().toString().padStart(3, '0')
  return `${hours}:${minutes}:${seconds}.${ms}`
}

/**
 * 创建日志中间件
 *
 * @param options - 日志选项
 * @returns 日志中间件
 *
 * @example
 * ```typescript
 * const logger = createLoggerMiddleware({
 *   logState: true,
 *   collapsed: true,
 *   timestamp: true,
 * })
 *
 * middlewareManager.use(logger)
 * ```
 */
export function createLoggerMiddleware(
  options: LoggerMiddlewareOptions = {},
): Middleware {
  const opts = { ...defaultOptions, ...options }
  const logger = opts.logger || console

  return {
    name: 'logger',
    priority: 0, // 最先执行

    handler: async (context: MiddlewareContext, next: () => void | Promise<void>) => {
      const { storeId, type, state, payload } = context
      const timestamp = opts.timestamp ? formatTime(new Date()) : ''
      const prefix = `[Store: ${storeId}]`

      // 判断是否需要记录
      const isStateChange = type.startsWith('state:')
      const isAction = type.startsWith('action:')

      if ((isStateChange && !opts.logState) || (isAction && !opts.logAction)) {
        await next()
        return
      }

      // 开始分组
      const groupTitle = `${timestamp} ${prefix} ${type}`
      if (opts.collapsed && logger.groupCollapsed) {
        logger.groupCollapsed(groupTitle)
      }
      else if (logger.group) {
        logger.group(groupTitle)
      }

      try {
        // 记录操作前的状态
        const logFn = logger[opts.level || 'log'] || logger.log
        logFn.call(logger, '%c prev state', 'color: #9E9E9E', { ...state })

        if (payload !== undefined) {
          logFn.call(logger, '%c payload', 'color: #03A9F4', payload)
        }

        // 执行下一个中间件
        await next()

        // 记录操作后的状态
        logFn.call(logger, '%c next state', 'color: #4CAF50', { ...context.state })
      }
      catch (error) {
        (logger as any).error?.('Error:', error)
        throw error
      }
      finally {
        // 结束分组
        if (logger.groupEnd) {
          logger.groupEnd()
        }
      }
    },
  }
}

/**
 * 简单日志中间件（不使用分组）
 */
export function createSimpleLoggerMiddleware(): Middleware {
  return {
    name: 'simple-logger',
    priority: 0,

    handler: async (context: MiddlewareContext, next: () => void | Promise<void>) => {
      const { storeId, type, payload } = context
      console.log(`[Store: ${storeId}] ${type}`, payload)
      await next()
    },
  }
}

