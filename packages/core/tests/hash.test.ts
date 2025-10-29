/**
 * 快速哈希函数单元测试
 */

import { describe, it, expect } from 'vitest'
import { fastHash } from '../src/cache/hash'

describe('fastHash', () => {
  describe('原始类型', () => {
    it('应该处理字符串', () => {
      const hash1 = fastHash('hello')
      const hash2 = fastHash('hello')
      const hash3 = fastHash('world')

      expect(hash1).toBe(hash2) // 相同输入产生相同哈希
      expect(hash1).not.toBe(hash3) // 不同输入产生不同哈希
    })

    it('应该处理数字', () => {
      const hash1 = fastHash(42)
      const hash2 = fastHash(42)
      const hash3 = fastHash(43)

      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
    })

    it('应该处理布尔值', () => {
      const hashTrue = fastHash(true)
      const hashFalse = fastHash(false)

      expect(hashTrue).toBe('2')
      expect(hashFalse).toBe('3')
      expect(hashTrue).not.toBe(hashFalse)
    })

    it('应该处理 null 和 undefined', () => {
      const hashNull = fastHash(null)
      const hashUndefined = fastHash(undefined)

      expect(hashNull).toBe('0')
      expect(hashUndefined).toBe('1')
      expect(hashNull).not.toBe(hashUndefined)
    })
  })

  describe('复杂类型', () => {
    it('应该处理对象', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, b: 2 }
      const obj3 = { a: 1, b: 3 }

      const hash1 = fastHash(obj1)
      const hash2 = fastHash(obj2)
      const hash3 = fastHash(obj3)

      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
    })

    it('应该处理数组', () => {
      const arr1 = [1, 2, 3]
      const arr2 = [1, 2, 3]
      const arr3 = [1, 2, 4]

      const hash1 = fastHash(arr1)
      const hash2 = fastHash(arr2)
      const hash3 = fastHash(arr3)

      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
    })

    it('应该处理嵌套结构', () => {
      const nested1 = { a: { b: { c: [1, 2, 3] } } }
      const nested2 = { a: { b: { c: [1, 2, 3] } } }
      const nested3 = { a: { b: { c: [1, 2, 4] } } }

      const hash1 = fastHash(nested1)
      const hash2 = fastHash(nested2)
      const hash3 = fastHash(nested3)

      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
    })
  })

  describe('边界情况', () => {
    it('应该处理空对象和空数组', () => {
      const hashEmptyObj = fastHash({})
      const hashEmptyArr = fastHash([])

      expect(hashEmptyObj).toBeDefined()
      expect(hashEmptyArr).toBeDefined()
      expect(hashEmptyObj).not.toBe(hashEmptyArr)
    })

    it('应该处理循环引用', () => {
      const obj: any = { a: 1 }
      obj.self = obj

      const hash = fastHash(obj)
      expect(hash).toBeDefined()
    })

    it('应该处理函数', () => {
      const fn1 = () => { }
      const fn2 = () => { }

      const hash1 = fastHash(fn1)
      const hash2 = fastHash(fn2)

      expect(hash1).toBeDefined()
      expect(hash2).toBeDefined()
    })
  })

  describe('一致性', () => {
    it('相同输入应该始终产生相同哈希', () => {
      const input = { a: 1, b: [1, 2, 3], c: { d: 'test' } }

      const hashes = Array.from({ length: 100 }, () => fastHash(input))

      expect(new Set(hashes).size).toBe(1) // 所有哈希值相同
    })
  })
})

