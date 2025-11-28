/**
 * 深拷贝工具
 *
 * @module utils/deep-clone
 */

/**
 * 判断是否为对象
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

/**
 * 判断是否为普通对象
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}

/**
 * 深拷贝
 *
 * @param value - 要拷贝的值
 * @param cache - 循环引用缓存
 * @returns 拷贝后的值
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: { c: 2 } }
 * const cloned = deepClone(obj)
 * cloned.b.c = 3
 * console.log(obj.b.c) // 2
 * ```
 */
export function deepClone<T>(value: T, cache = new WeakMap()): T {
  // 基础类型直接返回
  if (!isObject(value)) {
    return value
  }

  // 检查循环引用
  if (cache.has(value)) {
    return cache.get(value)
  }

  // 处理日期
  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  // 处理正则
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T
  }

  // 处理 Map
  if (value instanceof Map) {
    const result = new Map()
    cache.set(value, result)
    value.forEach((v, k) => {
      result.set(deepClone(k, cache), deepClone(v, cache))
    })
    return result as T
  }

  // 处理 Set
  if (value instanceof Set) {
    const result = new Set()
    cache.set(value, result)
    value.forEach((v) => {
      result.add(deepClone(v, cache))
    })
    return result as T
  }

  // 处理数组
  if (Array.isArray(value)) {
    const result: unknown[] = []
    cache.set(value, result)
    value.forEach((item, index) => {
      result[index] = deepClone(item, cache)
    })
    return result as T
  }

  // 处理普通对象
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {}
    cache.set(value, result)
    Object.keys(value).forEach((key) => {
      result[key] = deepClone(value[key], cache)
    })
    return result as T
  }

  // 其他对象类型（如自定义类实例）直接返回
  return value
}

/**
 * 浅拷贝
 *
 * @param value - 要拷贝的值
 * @returns 拷贝后的值
 */
export function shallowClone<T>(value: T): T {
  if (!isObject(value)) {
    return value
  }

  if (Array.isArray(value)) {
    return [...value] as T
  }

  return { ...value }
}

/**
 * 深度合并对象
 *
 * @param target - 目标对象
 * @param sources - 源对象列表
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Partial<T>>
): T {
  if (sources.length === 0) {
    return target
  }

  const source = sources.shift()

  if (source === undefined) {
    return target
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key]
      if (isPlainObject(sourceValue)) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        deepMerge(target[key] as Record<string, unknown>, sourceValue)
      }
      else {
        Object.assign(target, { [key]: sourceValue })
      }
    })
  }

  return deepMerge(target, ...sources)
}

