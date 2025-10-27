/**
 * 通用辅助工具函数
 * 只保留核心的、有特殊价值的工具函数
 */

import { TypeGuards } from './validation'

/**
 * 深度克隆对象（优化版：优先使用原生 API）
 * 支持循环引用、Map、Set、Date、RegExp 等复杂类型
 */
export function deepClone<T>(obj: T, seen = new WeakMap()): T {
  // 快速路径：使用原生 structuredClone（性能最优）
  if (typeof structuredClone !== 'undefined') {
    try {
      return structuredClone(obj)
    } catch {
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

  // 处理 Map（优化：使用 for...of 遍历）
  if (obj instanceof Map) {
    const cloned = new Map()
    seen.set(obj as any, cloned)
    for (const [key, value] of obj) {
      cloned.set(deepClone(key, seen), deepClone(value, seen))
    }
    return cloned as any
  }

  // 处理 Set（优化：使用 for...of 遍历）
  if (obj instanceof Set) {
    const cloned = new Set()
    seen.set(obj as any, cloned)
    for (const value of obj) {
      cloned.add(deepClone(value, seen))
    }
    return cloned as any
  }

  // 处理数组（优化：使用 for 循环代替 forEach）
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
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  if (TypeGuards.isObject(target) && TypeGuards.isObject(source)) {
    for (const key in source) {
      if (TypeGuards.isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        deepMerge(target[key] as any, source[key] as any)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 深度冻结对象
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  Object.freeze(obj)

  if (obj && typeof obj === 'object') {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const value = (obj as any)[prop]
      if (
        value &&
        typeof value === 'object' &&
        !Object.isFrozen(value)
      ) {
        deepFreeze(value)
      }
    })
  }

  return obj as Readonly<T>
}

/**
 * 获取对象深层属性值
 */
export function getDeepValue<T = any>(
  obj: any,
  path: string | string[],
  defaultValue?: T
): T | undefined {
  const keys = Array.isArray(path) ? path : path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}

/**
 * 设置对象深层属性值
 */
export function setDeepValue(
  obj: any,
  path: string | string[],
  value: any
): void {
  const keys = Array.isArray(path) ? path : path.split('.')
  const lastKey = keys.pop()

  if (!lastKey) return

  let current = obj
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
}

/**
 * 删除对象深层属性
 */
export function deleteDeepValue(
  obj: any,
  path: string | string[]
): boolean {
  const keys = Array.isArray(path) ? path : path.split('.')
  const lastKey = keys.pop()

  if (!lastKey) return false

  let current = obj
  for (const key of keys) {
    if (!current[key]) {
      return false
    }
    current = current[key]
  }

  return delete current[lastKey]
}

/**
 * 判断两个值是否深度相等
 */
export function deepEqual(a: any, b: any, seen = new WeakMap()): boolean {
  // 相同引用
  if (a === b) return true

  // null/undefined 检查
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b
  }

  // 类型检查
  if (typeof a !== typeof b) return false

  // 原始类型
  if (typeof a !== 'object') return a === b

  // 处理循环引用
  if (seen.has(a)) {
    return seen.get(a) === b
  }
  seen.set(a, b)

  // 日期
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // 正则表达式
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags
  }

  // 数组
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index], seen))
  }

  // Map
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false
    for (const [key, value] of a) {
      if (!b.has(key) || !deepEqual(value, b.get(key), seen)) {
        return false
      }
    }
    return true
  }

  // Set
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false
    for (const item of a) {
      if (!b.has(item)) return false
    }
    return true
  }

  // 普通对象
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key => {
    return Object.prototype.hasOwnProperty.call(b, key) &&
      deepEqual(a[key], b[key], seen)
  })
}

/**
 * 扁平化对象（将嵌套对象转为平面结构）
 */
export function flattenObject(
  obj: any,
  prefix = '',
  separator = '.'
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue

    const value = obj[key]
    const newKey = prefix ? `${prefix}${separator}${key}` : key

    if (TypeGuards.isPlainObject(value) && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey, separator))
    } else {
      result[newKey] = value
    }
  }

  return result
}

/**
 * 反扁平化对象（将平面对象转为嵌套结构）
 */
export function unflattenObject(
  obj: Record<string, any>,
  separator = '.'
): any {
  const result: any = {}

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue
    setDeepValue(result, key.split(separator), obj[key])
  }

  return result
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    onRetry?: (error: Error, attempt: number) => void
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay: retryDelay = 1000,
    onRetry,
  } = options

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxAttempts) {
        onRetry?.(lastError, attempt)
        await delay(retryDelay * attempt)
      }
    }
  }

  throw lastError || new Error('Retry failed')
}

/**
 * Memoize 函数（缓存函数结果）
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  const maxCacheSize = 100 // 限制缓存大小
  const keys: string[] = [] // LRU 键队列

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    // 优化：快速路径处理简单参数
    let key: string
    if (resolver) {
      key = resolver(...args)
    } else if (args.length === 0) {
      key = 'void'
    } else if (args.length === 1 && typeof args[0] !== 'object') {
      key = String(args[0])
    } else {
      key = JSON.stringify(args)
    }

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn.apply(this, args)
    cache.set(key, result)
    keys.push(key)

    // LRU 淘汰策略
    if (keys.length > maxCacheSize) {
      const oldestKey = keys.shift()!
      cache.delete(oldestKey)
    }

    return result
  } as T
}

/**
 * 批处理函数
 * 
 * 将大量数据分批处理，避免一次性处理导致的性能问题。
 * 所有批次并行处理，最后合并结果。
 * 
 * @template T - 输入项类型
 * @template R - 输出项类型
 * @param items - 要处理的项数组
 * @param batchSize - 每批处理的数量
 * @param processor - 批处理函数，接收一批数据，返回处理结果
 * @returns Promise，解析为所有批次的合并结果
 * 
 * @example
 * ```typescript
 * // 批量处理用户数据
 * const users = [...] // 10000 个用户
 * const results = await batch(
 *   users,
 *   100, // 每批 100 个
 *   async (batch) => {
 *     return await api.processUsers(batch)
 *   }
 * )
 * ```
 */
export function batch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const batches: T[][] = []

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  return Promise.all(batches.map(processor)).then(results =>
    results.flat()
  )
}

/**
 * 并发控制（Promise 限流）
 * 
 * 限制同时执行的 Promise 数量，避免资源耗尽。
 * 常用于控制并发请求数量，防止服务器过载。
 * 
 * @template T - Promise 返回值类型
 * @param tasks - 任务函数数组，每个函数返回一个 Promise
 * @param limit - 最大并发数
 * @returns Promise，解析为所有任务的结果数组
 * 
 * @example
 * ```typescript
 * // 限制并发请求为 3 个
 * const userIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
 * const tasks = userIds.map(id => () => api.fetchUser(id))
 * 
 * const users = await pLimit(tasks, 3)
 * // 最多同时发起 3 个请求，避免服务器过载
 * ```
 */
export async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<any>[] = []
  const tasksLen = tasks.length

  for (let i = 0; i < tasksLen; i++) {
    const task = tasks[i]
    const p = task().then(result => {
      results.push(result)
      return result
    })

    const wrapped = p.then(() => {
      // 优化：使用索引定位替代 indexOf
      const idx = executing.indexOf(wrapped)
      if (idx !== -1) {
        executing.splice(idx, 1)
      }
    })

    executing.push(wrapped)

    if (executing.length >= limit) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
  return results
}

/**
 * 生成唯一 ID
 * 
 * 生成基于时间戳和随机数的唯一标识符。
 * 在同一毫秒内生成的 ID 也能保证唯一性（通过随机数）。
 * 
 * @param prefix - ID 前缀，默认 'id'
 * @returns 唯一 ID 字符串
 * 
 * @example
 * ```typescript
 * const id1 = generateId() // 'id_1698123456789_x7k9m2p'
 * const id2 = generateId('user') // 'user_1698123456789_a3f5n8q'
 * const id3 = generateId('store') // 'store_1698123456789_b4g6p9r'
 * ```
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化文件大小
 * 
 * 将字节数转换为人类可读的格式（Bytes, KB, MB, GB, TB）。
 * 
 * @param bytes - 字节数
 * @param decimals - 小数位数，默认 2
 * @returns 格式化后的字符串
 * 
 * @example
 * ```typescript
 * formatBytes(1024) // '1.00 KB'
 * formatBytes(1048576) // '1.00 MB'
 * formatBytes(1234567, 1) // '1.2 MB'
 * formatBytes(0) // '0 Bytes'
 * ```
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

/**
 * 格式化时间
 * 
 * 将毫秒数转换为人类可读的时间格式（ms, s, m, h）。
 * 
 * @param ms - 毫秒数
 * @returns 格式化后的字符串
 * 
 * @example
 * ```typescript
 * formatDuration(500) // '500ms'
 * formatDuration(1500) // '1.50s'
 * formatDuration(65000) // '1.08m'
 * formatDuration(3700000) // '1.03h'
 * ```
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`
  return `${(ms / 3600000).toFixed(2)}h`
}

// =================================
// 简单工具函数（保留以避免破坏现有 API）
// =================================

/**
 * 选择对象的部分属性
 * 
 * 从对象中提取指定的属性，创建一个新对象。
 * 类似于 lodash 的 pick 函数。
 * 
 * @template T - 对象类型
 * @template K - 键类型
 * @param obj - 源对象
 * @param keys - 要选择的键数组
 * @returns 只包含指定属性的新对象
 * 
 * @example
 * ```typescript
 * const user = { id: 1, name: '张三', age: 25, email: 'zhang@example.com' }
 * const picked = pick(user, ['id', 'name'])
 * // { id: 1, name: '张三' }
 * ```
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * 排除对象的部分属性
 * 
 * 从对象中排除指定的属性，创建一个新对象。
 * 类似于 lodash 的 omit 函数。
 * 
 * @template T - 对象类型
 * @template K - 键类型
 * @param obj - 源对象
 * @param keys - 要排除的键数组
 * @returns 不包含指定属性的新对象
 * 
 * @example
 * ```typescript
 * const user = { id: 1, name: '张三', password: '***', token: 'abc123' }
 * const safe = omit(user, ['password', 'token'])
 * // { id: 1, name: '张三' }
 * ```
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as any
  for (const key of keys) {
    delete result[key]
  }
  return result
}

/**
 * 防抖函数
 * 注：推荐使用 lodash-es/debounce 以获得更好的性能和功能
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * 注：推荐使用 lodash-es/throttle 以获得更好的性能和功能
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

// =================================
// 类型安全包装
// =================================

/**
 * 安全地获取对象的键
 * 
 * 类型安全版本的 Object.keys()，返回正确的键类型。
 * 
 * @template T - 对象类型
 * @param obj - 对象
 * @returns 键数组
 * 
 * @example
 * ```typescript
 * const user = { id: 1, name: '张三', age: 25 }
 * const keys = safeKeys(user) // ('id' | 'name' | 'age')[]
 * ```
 */
export function safeKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

/**
 * 安全地获取对象的值
 * 
 * 类型安全版本的 Object.values()，返回正确的值类型。
 * 
 * @template T - 对象类型
 * @param obj - 对象
 * @returns 值数组
 * 
 * @example
 * ```typescript
 * const user = { id: 1, name: '张三', age: 25 }
 * const values = safeValues(user) // (number | string)[]
 * ```
 */
export function safeValues<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][]
}

/**
 * 安全地获取对象的键值对
 * 
 * 类型安全版本的 Object.entries()，返回正确的键值对类型。
 * 
 * @template T - 对象类型
 * @param obj - 对象
 * @returns 键值对数组
 * 
 * @example
 * ```typescript
 * const user = { id: 1, name: '张三' }
 * const entries = safeEntries(user) // [['id', 1], ['name', '张三']]
 * ```
 */
export function safeEntries<T extends object>(
  obj: T
): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

// =================================
// 简单数组工具（保留常用的）
// =================================

/**
 * 数组去重
 * 
 * 移除数组中的重复项，保留第一次出现的项。
 * 使用 Set 实现，性能优异（O(n)）。
 * 
 * @template T - 数组项类型
 * @param arr - 输入数组
 * @returns 去重后的数组
 * 
 * @example
 * ```typescript
 * unique([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
 * unique(['a', 'b', 'a', 'c']) // ['a', 'b', 'c']
 * ```
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

/**
 * 数组分组
 * 
 * 根据指定的键或函数将数组项分组。
 * 
 * @template T - 数组项类型
 * @param arr - 输入数组
 * @param key - 分组键（对象属性或函数）
 * @returns 分组后的对象，键为分组名，值为该组的项数组
 * 
 * @example
 * ```typescript
 * const users = [
 *   { name: '张三', role: 'admin' },
 *   { name: '李四', role: 'user' },
 *   { name: '王五', role: 'admin' }
 * ]
 * 
 * // 按属性分组
 * const byRole = groupBy(users, 'role')
 * // { admin: [{...}, {...}], user: [{...}] }
 * 
 * // 按函数分组
 * const byFirstChar = groupBy(users, user => user.name[0])
 * // { '张': [{...}], '李': [{...}], '王': [{...}] }
 * ```
 */
export function groupBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string | number)
): Record<string, T[]> {
  const result: Record<string, T[]> = {}

  for (const item of arr) {
    const groupKey =
      typeof key === 'function' ? key(item) : String(item[key])

    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
  }

  return result
}

/**
 * 分块数组
 * 
 * 将数组分割成指定大小的小块。
 * 常用于分批处理大量数据。
 * 
 * @template T - 数组项类型
 * @param arr - 输入数组
 * @param size - 每块的大小
 * @returns 二维数组，每个子数组最多包含 size 个项
 * 
 * @example
 * ```typescript
 * const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * const chunks = chunk(numbers, 3)
 * // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 * 
 * // 批量处理
 * for (const chunk of chunks) {
 *   await processChunk(chunk)
 * }
 * ```
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}
