/**
 * 工具函数单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import {
  deepClone,
  deepEqual,
  debounce,
  throttle,
  generateId,
  delay,
  retry,
  formatBytes,
  formatDuration
} from '../src/utils/helpers'

describe('Helpers', () => {
  describe('deepClone', () => {
    it('应该克隆原始类型', () => {
      expect(deepClone(42)).toBe(42)
      expect(deepClone('hello')).toBe('hello')
      expect(deepClone(true)).toBe(true)
      expect(deepClone(null)).toBeNull()
      expect(deepClone(undefined)).toBeUndefined()
    })

    it('应该克隆普通对象', () => {
      const obj = { a: 1, b: { c: 2 } }
      const cloned = deepClone(obj)

      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
    })

    it('应该克隆数组', () => {
      const arr = [1, 2, [3, 4]]
      const cloned = deepClone(arr)

      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
      expect(cloned[2]).not.toBe(arr[2])
    })

    it('应该克隆 Date 对象', () => {
      const date = new Date('2024-01-01')
      const cloned = deepClone(date)

      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
    })

    it('应该克隆 RegExp 对象', () => {
      const regex = /test/gi
      const cloned = deepClone(regex)

      expect(cloned.source).toBe(regex.source)
      expect(cloned.flags).toBe(regex.flags)
      expect(cloned).not.toBe(regex)
    })

    it('应该克隆 Map 对象', () => {
      const map = new Map([['a', 1], ['b', 2]])
      const cloned = deepClone(map)

      expect(cloned).toEqual(map)
      expect(cloned).not.toBe(map)
    })

    it('应该克隆 Set 对象', () => {
      const set = new Set([1, 2, 3])
      const cloned = deepClone(set)

      expect(cloned).toEqual(set)
      expect(cloned).not.toBe(set)
    })
  })

  describe('deepEqual', () => {
    it('应该正确比较原始类型', () => {
      expect(deepEqual(42, 42)).toBe(true)
      expect(deepEqual('hello', 'hello')).toBe(true)
      expect(deepEqual(true, true)).toBe(true)
      expect(deepEqual(null, null)).toBe(true)

      expect(deepEqual(42, 43)).toBe(false)
      expect(deepEqual('hello', 'world')).toBe(false)
    })

    it('应该正确比较对象', () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false)
    })

    it('应该正确比较嵌套对象', () => {
      const obj1 = { a: { b: { c: 1 } } }
      const obj2 = { a: { b: { c: 1 } } }
      const obj3 = { a: { b: { c: 2 } } }

      expect(deepEqual(obj1, obj2)).toBe(true)
      expect(deepEqual(obj1, obj3)).toBe(false)
    })

    it('应该正确比较数组', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
    })

    it('应该正确比较 Date 对象', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-01')
      const date3 = new Date('2024-01-02')

      expect(deepEqual(date1, date2)).toBe(true)
      expect(deepEqual(date1, date3)).toBe(false)
    })
  })

  describe('debounce', () => {
    it('应该延迟执行函数', async () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      expect(fn).not.toHaveBeenCalled()

      await new Promise(resolve => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在延迟期间重置定时器', async () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      await new Promise(resolve => setTimeout(resolve, 50))
      debounced() // 重置定时器
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(fn).not.toHaveBeenCalled()

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    it('应该限制函数执行频率', async () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled() // 立即执行
      throttled() // 被限流
      throttled() // 被限流

      expect(fn).toHaveBeenCalledTimes(1)

      await new Promise(resolve => setTimeout(resolve, 150))

      throttled() // 可以执行
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('generateId', () => {
    it('应该生成唯一 ID', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
    })

    it('应该支持自定义前缀', () => {
      const id = generateId('user')
      expect(id).toMatch(/^user_/)
    })
  })

  describe('delay', () => {
    it('应该延迟指定时间', async () => {
      const start = Date.now()
      await delay(100)
      const elapsed = Date.now() - start

      expect(elapsed).toBeGreaterThanOrEqual(100)
    })
  })

  describe('retry', () => {
    it('应该在成功时返回结果', async () => {
      const fn = vi.fn(async () => 'success')

      const result = await retry(fn, 3, 10)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在失败时重试', async () => {
      let attempts = 0
      const fn = vi.fn(async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Failed')
        }
        return 'success'
      })

      const result = await retry(fn, 3, 10)

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('应该在重试次数用尽后抛出错误', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Always fails')
      })

      await expect(retry(fn, 2, 10)).rejects.toThrow('Always fails')
      expect(fn).toHaveBeenCalledTimes(3) // 1 次初始 + 2 次重试
    })
  })

  describe('formatBytes', () => {
    it('应该正确格式化字节数', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1.00 KB')
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB')
    })

    it('应该支持自定义小数位数', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB')
      expect(formatBytes(1536, 1)).toBe('1.5 KB')
      expect(formatBytes(1536, 2)).toBe('1.50 KB')
    })
  })

  describe('formatDuration', () => {
    it('应该正确格式化时长', () => {
      expect(formatDuration(500)).toMatch(/ms$/)
      expect(formatDuration(1500)).toMatch(/s$/)
      expect(formatDuration(90000)).toMatch(/min$/)
      expect(formatDuration(3600000)).toMatch(/h$/)
    })
  })
})


