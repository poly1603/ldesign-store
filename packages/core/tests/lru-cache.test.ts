/**
 * LRU Cache 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LRUCache } from '../src/cache/lru-cache'

describe('LRUCache', () => {
  let cache: LRUCache<string, any>

  beforeEach(() => {
    cache = new LRUCache({ maxSize: 3, defaultTTL: 1000, enableStats: true })
  })

  afterEach(() => {
    cache.dispose()
  })

  describe('基础操作', () => {
    it('应该能够设置和获取值', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('应该在键不存在时返回 undefined', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('应该能够检查键是否存在', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
    })

    it('应该能够删除键', () => {
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.has('key1')).toBe(false)
      expect(cache.delete('key1')).toBe(false)
    })

    it('应该能够清空所有缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.size()).toBe(0)
    })

    it('应该正确返回缓存大小', () => {
      expect(cache.size()).toBe(0)
      cache.set('key1', 'value1')
      expect(cache.size()).toBe(1)
      cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)
    })
  })

  describe('LRU 策略', () => {
    it('应该在超过最大大小时淘汰最少使用的项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 此时缓存满了 (maxSize = 3)
      cache.set('key4', 'value4')

      // key1 应该被淘汰
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })

    it('访问后应该移到最近使用', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 访问 key1
      cache.get('key1')

      // 添加 key4，key2 应该被淘汰（最少使用）
      cache.set('key4', 'value4')

      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })

    it('更新值应该移到最近使用', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 更新 key1
      cache.set('key1', 'updated')

      // 添加 key4，key2 应该被淘汰
      cache.set('key4', 'value4')

      expect(cache.get('key1')).toBe('updated')
      expect(cache.has('key2')).toBe(false)
    })
  })

  describe('TTL 过期', () => {
    it('应该在 TTL 过期后返回 undefined', async () => {
      cache.set('key1', 'value1', 100) // 100ms TTL

      expect(cache.get('key1')).toBe('value1')

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(cache.get('key1')).toBeUndefined()
    })

    it('应该在检查时移除过期的键', async () => {
      cache.set('key1', 'value1', 100)

      expect(cache.has('key1')).toBe(true)

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(cache.has('key1')).toBe(false)
    })

    it('应该使用默认 TTL', async () => {
      const shortCache = new LRUCache({ defaultTTL: 50 })

      shortCache.set('key1', 'value1')
      expect(shortCache.get('key1')).toBe('value1')

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(shortCache.get('key1')).toBeUndefined()

      shortCache.dispose()
    })
  })

  describe('统计信息', () => {
    it('应该正确记录统计信息', () => {
      cache.set('key1', 'value1')
      cache.get('key1') // 命中
      cache.get('key2') // 未命中
      cache.get('key1') // 命中

      const stats = cache.getStats()

      expect(stats.totalRequests).toBe(3)
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(2 / 3)
      expect(stats.size).toBe(1)
    })

    it('应该能够重置统计信息', () => {
      cache.get('key1')
      cache.resetStats()

      const stats = cache.getStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('资源管理', () => {
    it('应该能够获取所有键', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      const keys = cache.keys()
      expect(keys).toHaveLength(2)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
    })

    it('dispose 应该清理所有资源', () => {
      cache.set('key1', 'value1')
      cache.dispose()

      expect(cache.size()).toBe(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理 null 和 undefined 值', () => {
      cache.set('null', null)
      cache.set('undefined', undefined)

      expect(cache.get('null')).toBeNull()
      expect(cache.get('undefined')).toBeUndefined()
    })

    it('应该处理复杂对象', () => {
      const obj = { nested: { value: 42 }, array: [1, 2, 3] }
      cache.set('complex', obj)

      expect(cache.get('complex')).toEqual(obj)
    })

    it('应该处理大量数据', () => {
      const largeCache = new LRUCache({ maxSize: 1000 })

      for (let i = 0; i < 1000; i++) {
        largeCache.set(`key${i}`, `value${i}`)
      }

      expect(largeCache.size()).toBe(1000)

      // 添加一个新的，应该淘汰 key0
      largeCache.set('key1000', 'value1000')
      expect(largeCache.has('key0')).toBe(false)
      expect(largeCache.size()).toBe(1000)

      largeCache.dispose()
    })
  })
})

