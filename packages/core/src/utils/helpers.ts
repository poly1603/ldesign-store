/**
 * 通用辅助工具函数
 * @module utils/helpers
 */

/**
 * 深度克隆对象（优化版：优先使用原生 API）
 * 
 * 支持循环引用、Map、Set、Date、RegExp 等复杂类型
 * 
 * ⚡ 性能: 优先使用 structuredClone，性能最优
 * 
 * @param obj - 要克隆的对象
 * @param seen - 循环引用检测（内部使用）
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T, seen = new WeakMap()): T {
  // 快速路径：使用原生 structuredClone（性能最优）
  if (typeof structuredClone !== 'undefined') {
    try {
      return structuredClone(obj)
    }
    catch {
      // 如果失败，继续使用自定义实现
    }
  }

  // 处理原始类型
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理循环引用
  if (seen.has(obj as any)) {
    return seen.get(obj as any)
  }

  // 处理日期
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  // 处理正则表达式
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as any
  }

  // 处理 Map
  if (obj instanceof Map) {
    const cloned = new Map()
    seen.set(obj as any, cloned)
    for (const [key, value] of obj) {
      cloned.set(deepClone(key, seen), deepClone(value, seen))
    }
    return cloned as any
  }

  // 处理 Set
  if (obj instanceof Set) {
    const cloned = new Set()
    seen.set(obj as any, cloned)
    for (const value of obj) {
      cloned.add(deepClone(value, seen))
    }
    return cloned as any
  }

  // 处理数组
  if (Array.isArray(obj)) {
    const cloned: any[] = []
    seen.set(obj as any, cloned)
    const len = obj.length
    for (let i = 0; i < len; i++) {
      cloned[i] = deepClone(obj[i], seen)
    }
    return cloned as any
  }

  // 处理普通对象
  const cloned: any = {}
  seen.set(obj as any, cloned)

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key], seen)
    }
  }

  return cloned
}

/**
 * 深度相等比较
 * 
 * @param a - 第一个值
 * @param b - 第二个值
 * @returns 是否相等
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== typeof b) return false

  if (typeof a !== 'object') return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString()
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key => deepEqual(a[key], b[key]))
}

/**
 * 防抖函数
 * 
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>): void {
    if (timerId) {
      clearTimeout(timerId)
    }

    timerId = setTimeout(() => {
      fn.apply(this, args)
      timerId = null
    }, delay)
  }
}

/**
 * 节流函数
 * 
 * @param fn - 要节流的函数
 * @param limit - 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 生成唯一 ID
 * 
 * @param prefix - ID 前缀
 * @returns 唯一 ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 批量执行函数
 * 
 * @param fns - 函数数组
 * @returns Promise
 */
export function batch(fns: Array<() => void | Promise<void>>): Promise<void> {
  return Promise.all(fns.map(fn => fn())).then(() => undefined)
}

/**
 * 延迟执行
 * 
 * @param ms - 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 * 
 * @param fn - 要重试的函数
 * @param retries - 重试次数
 * @param delayMs - 重试间隔（毫秒）
 * @returns Promise
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn()
  }
  catch (error) {
    if (retries === 0) throw error
    await delay(delayMs)
    return retry(fn, retries - 1, delayMs)
  }
}

/**
 * 格式化字节数
 * 
 * @param bytes - 字节数
 * @param decimals - 小数位数
 * @returns 格式化后的字符串
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * 格式化持续时间
 * 
 * @param ms - 毫秒数
 * @returns 格式化后的字符串
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(2)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}min`
  return `${(ms / 3600000).toFixed(2)}h`
}


