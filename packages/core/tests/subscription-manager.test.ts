/**
 * SubscriptionManager 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SubscriptionManager } from '../src/subscription/subscription-manager'

describe('SubscriptionManager', () => {
  let manager: SubscriptionManager

  beforeEach(() => {
    manager = new SubscriptionManager()
  })

  describe('基础订阅', () => {
    it('应该能够订阅事件', () => {
      const callback = vi.fn()
      const unsubscribe = manager.subscribe('test', callback)

      expect(typeof unsubscribe).toBe('function')
      expect(manager.count('test')).toBe(1)
    })

    it('应该能够取消订阅', () => {
      const callback = vi.fn()
      const unsubscribe = manager.subscribe('test', callback)

      unsubscribe()

      expect(manager.count('test')).toBe(0)
    })

    it('应该能够通知订阅者', () => {
      const callback = vi.fn()
      manager.subscribe('test', callback)

      manager.notify('test', { data: 'value' })

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith({ data: 'value' })
    })

    it('应该支持多个订阅者', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const callback3 = vi.fn()

      manager.subscribe('test', callback1)
      manager.subscribe('test', callback2)
      manager.subscribe('test', callback3)

      manager.notify('test', 'data')

      expect(callback1).toHaveBeenCalledWith('data')
      expect(callback2).toHaveBeenCalledWith('data')
      expect(callback3).toHaveBeenCalledWith('data')
    })
  })

  describe('优先级', () => {
    it('应该按优先级顺序执行回调', () => {
      const order: number[] = []

      manager.subscribe('test', () => order.push(1), 1)
      manager.subscribe('test', () => order.push(3), 3)
      manager.subscribe('test', () => order.push(2), 2)

      manager.notify('test', null)

      // 优先级高的先执行: 3 -> 2 -> 1
      expect(order).toEqual([3, 2, 1])
    })

    it('相同优先级应该按订阅顺序执行', () => {
      const order: string[] = []

      manager.subscribe('test', () => order.push('a'), 1)
      manager.subscribe('test', () => order.push('b'), 1)
      manager.subscribe('test', () => order.push('c'), 1)

      manager.notify('test', null)

      expect(order).toEqual(['a', 'b', 'c'])
    })
  })

  describe('事件隔离', () => {
    it('不同事件的订阅应该隔离', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.subscribe('event1', callback1)
      manager.subscribe('event2', callback2)

      manager.notify('event1', 'data1')

      expect(callback1).toHaveBeenCalledWith('data1')
      expect(callback2).not.toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('回调错误不应该影响其他订阅者', () => {
      const callback1 = vi.fn(() => {
        throw new Error('Error in callback1')
      })
      const callback2 = vi.fn()

      manager.subscribe('test', callback1)
      manager.subscribe('test', callback2)

      // 不应该抛出错误
      expect(() => manager.notify('test', 'data')).not.toThrow()

      // callback2 仍应被调用
      expect(callback2).toHaveBeenCalledWith('data')
    })
  })

  describe('资源管理', () => {
    it('应该正确统计监听器数量', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      manager.subscribe('event1', callback1)
      manager.subscribe('event2', callback2)

      expect(manager.totalCount()).toBe(2)
    })

    it('应该能够清空所有订阅', () => {
      manager.subscribe('event1', vi.fn())
      manager.subscribe('event2', vi.fn())

      manager.clear()

      expect(manager.totalCount()).toBe(0)
      expect(manager.count('event1')).toBe(0)
    })

    it('应该限制最大监听器数量', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
      const smallManager = new SubscriptionManager({ maxListeners: 2 })

      smallManager.subscribe('test', vi.fn())
      smallManager.subscribe('test', vi.fn())
      smallManager.subscribe('test', vi.fn()) // 超过限制

      expect(consoleSpy).toHaveBeenCalled()
      expect(smallManager.totalCount()).toBe(2)

      consoleSpy.mockRestore()
    })
  })

  describe('边界情况', () => {
    it('应该处理空事件通知', () => {
      expect(() => manager.notify('nonexistent', 'data')).not.toThrow()
    })

    it('应该处理重复订阅', () => {
      const callback = vi.fn()

      manager.subscribe('test', callback)
      manager.subscribe('test', callback) // 重复订阅

      manager.notify('test', 'data')

      // 应该被调用两次
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('应该处理重复取消订阅', () => {
      const callback = vi.fn()
      const unsubscribe = manager.subscribe('test', callback)

      unsubscribe()
      unsubscribe() // 重复取消

      expect(() => unsubscribe()).not.toThrow()
    })
  })
})

