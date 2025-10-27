/**
 * SubscriptionManager 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SubscriptionManager } from '../core/SubscriptionManager'

describe('SubscriptionManager', () => {
  let manager: SubscriptionManager

  beforeEach(() => {
    manager = new SubscriptionManager()
  })

  describe('add', () => {
    it('应该添加订阅', () => {
      const unsubscribe = vi.fn()
      manager.add(unsubscribe)

      expect(manager.size()).toBe(1)
    })

    it('应该支持链式调用', () => {
      const unsubscribe1 = vi.fn()
      const unsubscribe2 = vi.fn()

      const result = manager.add(unsubscribe1).add(unsubscribe2)

      expect(result).toBe(manager)
      expect(manager.size()).toBe(2)
    })

    it('销毁后添加订阅应该立即执行取消订阅', () => {
      manager.dispose()

      const unsubscribe = vi.fn()
      manager.add(unsubscribe)

      expect(unsubscribe).toHaveBeenCalled()
    })
  })

  describe('addAll', () => {
    it('应该批量添加订阅', () => {
      const unsubscribes = [vi.fn(), vi.fn(), vi.fn()]
      manager.addAll(unsubscribes)

      expect(manager.size()).toBe(3)
    })
  })

  describe('remove', () => {
    it('应该移除并执行取消订阅', () => {
      const unsubscribe = vi.fn()
      manager.add(unsubscribe)

      const removed = manager.remove(unsubscribe)

      expect(removed).toBe(true)
      expect(unsubscribe).toHaveBeenCalled()
      expect(manager.size()).toBe(0)
    })

    it('移除不存在的订阅应该返回 false', () => {
      const unsubscribe = vi.fn()
      const removed = manager.remove(unsubscribe)

      expect(removed).toBe(false)
      expect(unsubscribe).not.toHaveBeenCalled()
    })
  })

  describe('unsubscribeAll', () => {
    it('应该取消所有订阅', () => {
      const unsubscribes = [vi.fn(), vi.fn(), vi.fn()]
      manager.addAll(unsubscribes)

      manager.unsubscribeAll()

      unsubscribes.forEach(fn => {
        expect(fn).toHaveBeenCalled()
      })
      expect(manager.size()).toBe(0)
    })
  })

  describe('dispose', () => {
    it('应该销毁管理器并取消所有订阅', () => {
      const unsubscribes = [vi.fn(), vi.fn()]
      manager.addAll(unsubscribes)

      manager.dispose()

      expect(manager.isDisposed()).toBe(true)
      expect(manager.size()).toBe(0)
      unsubscribes.forEach(fn => {
        expect(fn).toHaveBeenCalled()
      })
    })
  })

  describe('wrap', () => {
    it('应该包装订阅函数', () => {
      const originalUnsubscribe = vi.fn()
      const wrappedUnsubscribe = manager.wrap(originalUnsubscribe)

      expect(manager.size()).toBe(1)

      wrappedUnsubscribe()

      expect(originalUnsubscribe).toHaveBeenCalled()
      expect(manager.size()).toBe(0)
    })
  })

  describe('hasSubscriptions', () => {
    it('应该正确判断是否有订阅', () => {
      expect(manager.hasSubscriptions()).toBe(false)

      manager.add(vi.fn())

      expect(manager.hasSubscriptions()).toBe(true)
    })
  })

  describe('getStats', () => {
    it('应该返回正确的统计信息', () => {
      manager.add(vi.fn())
      manager.add(vi.fn())

      const stats = manager.getStats()

      expect(stats.subscriptions).toBe(2)
      expect(stats.disposed).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('取消订阅时的错误应该被捕获', () => {
      const unsubscribe = vi.fn(() => {
        throw new Error('Unsubscribe error')
      })

      manager.add(unsubscribe)

      // 不应该抛出错误
      expect(() => manager.remove(unsubscribe)).not.toThrow()
    })
  })
})


