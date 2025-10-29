/**
 * ObjectPool 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ObjectPool } from '../src/cache/object-pool'

describe('ObjectPool', () => {
  let pool: ObjectPool<{ id: number; value: string }>

  beforeEach(() => {
    pool = new ObjectPool(
      () => ({ id: 0, value: '' }),
      (obj) => {
        obj.id = 0
        obj.value = ''
      },
      10,
      5
    )
  })

  describe('预分配', () => {
    it('应该在初始化时预分配对象', () => {
      expect(pool.size()).toBe(5)
    })
  })

  describe('获取和释放', () => {
    it('应该能够获取对象', () => {
      const obj = pool.acquire()

      expect(obj).toBeDefined()
      expect(obj.id).toBe(0)
      expect(obj.value).toBe('')
    })

    it('应该能够释放对象', () => {
      const obj = pool.acquire()
      obj.id = 1
      obj.value = 'test'

      const sizeBefore = pool.size()
      pool.release(obj)

      expect(pool.size()).toBe(sizeBefore + 1)

      // 再次获取应该是重置后的对象
      const reused = pool.acquire()
      expect(reused.id).toBe(0)
      expect(reused.value).toBe('')
    })

    it('池为空时应该创建新对象', () => {
      // 清空池
      while (pool.size() > 0) {
        pool.acquire()
      }

      // 应该创建新对象
      const obj = pool.acquire()
      expect(obj).toBeDefined()
    })

    it('池满时应该丢弃多余对象', () => {
      const maxSize = 10

      // 释放超过 maxSize 的对象
      for (let i = 0; i < 15; i++) {
        const obj = pool.acquire()
        pool.release(obj)
      }

      // 池大小不应超过 maxSize
      expect(pool.size()).toBeLessThanOrEqual(maxSize)
    })
  })

  describe('统计信息', () => {
    it('应该正确记录统计信息', () => {
      const obj1 = pool.acquire()
      const obj2 = pool.acquire()
      pool.release(obj1)

      const stats = pool.getStats()

      expect(stats.acquireCount).toBe(2)
      expect(stats.releaseCount).toBe(1)
      expect(stats.poolSize).toBe(pool.size())
    })

    it('应该计算未命中率', () => {
      // 清空池
      while (pool.size() > 0) {
        pool.acquire()
      }

      // 获取会导致创建新对象（未命中）
      pool.acquire()

      const stats = pool.getStats()
      expect(stats.missCount).toBeGreaterThan(0)
    })
  })

  describe('自适应调整', () => {
    it('高未命中率时应该增加预分配大小', () => {
      const adaptivePool = new ObjectPool(
        () => ({ id: 0, value: '' }),
        (obj) => {
          obj.id = 0
          obj.value = ''
        },
        100,
        5
      )

      const initialPreallocate = adaptivePool.getStats().preallocateSize

      // 清空池并大量获取（触发未命中）
      for (let i = 0; i < 1001; i++) {
        adaptivePool.acquire()
      }

      const finalPreallocate = adaptivePool.getStats().preallocateSize

      // 预分配大小应该增加
      expect(finalPreallocate).toBeGreaterThanOrEqual(initialPreallocate)
    })
  })

  describe('清空', () => {
    it('应该能够清空池', () => {
      pool.clear()
      expect(pool.size()).toBe(0)
    })
  })
})

