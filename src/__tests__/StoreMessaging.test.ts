/**
 * StoreMessaging 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StoreMessenger, createStoreMessenger } from '../core/StoreMessaging'

describe('StoreMessenger', () => {
  let messenger: StoreMessenger

  beforeEach(() => {
    messenger = createStoreMessenger()
  })

  afterEach(() => {
    messenger.dispose()
  })

  describe('emit', () => {
    it('应该发布事件给所有监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      messenger.on('test-event', listener1)
      messenger.on('test-event', listener2)

      messenger.emit('test-event', { data: 'test' })

      expect(listener1).toHaveBeenCalledWith({ data: 'test' })
      expect(listener2).toHaveBeenCalledWith({ data: 'test' })
    })

    it('不存在监听器时应该安全返回', () => {
      expect(() => {
        messenger.emit('non-existent', {})
      }).not.toThrow()
    })
  })

  describe('on', () => {
    it('应该订阅事件', () => {
      const listener = vi.fn()
      messenger.on('test-event', listener)

      messenger.emit('test-event', 'data')

      expect(listener).toHaveBeenCalledWith('data')
    })

    it('应该返回取消订阅函数', () => {
      const listener = vi.fn()
      const unsubscribe = messenger.on('test-event', listener)

      unsubscribe()

      messenger.emit('test-event', 'data')

      expect(listener).not.toHaveBeenCalled()
    })

    it('应该支持优先级', () => {
      const callOrder: number[] = []

      messenger.on('test', () => callOrder.push(1), { priority: 1 })
      messenger.on('test', () => callOrder.push(10), { priority: 10 })
      messenger.on('test', () => callOrder.push(5), { priority: 5 })

      messenger.emit('test')

      expect(callOrder).toEqual([10, 5, 1])
    })
  })

  describe('once', () => {
    it('应该只触发一次', () => {
      const listener = vi.fn()
      messenger.once('test-event', listener)

      messenger.emit('test-event', 'data1')
      messenger.emit('test-event', 'data2')
      messenger.emit('test-event', 'data3')

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith('data1')
    })
  })

  describe('off', () => {
    it('应该移除指定事件的所有监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      messenger.on('event1', listener1)
      messenger.on('event2', listener2)

      messenger.off('event1')

      messenger.emit('event1', 'data')
      messenger.emit('event2', 'data')

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })

    it('不传参数应该移除所有事件', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      messenger.on('event1', listener1)
      messenger.on('event2', listener2)

      messenger.off()

      messenger.emit('event1', 'data')
      messenger.emit('event2', 'data')

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })

  describe('hasListeners', () => {
    it('应该正确判断是否有监听器', () => {
      expect(messenger.hasListeners('test')).toBe(false)

      messenger.on('test', () => { })

      expect(messenger.hasListeners('test')).toBe(true)
    })

    it('不传参数应该判断是否有任何监听器', () => {
      expect(messenger.hasListeners()).toBe(false)

      messenger.on('test', () => { })

      expect(messenger.hasListeners()).toBe(true)
    })
  })

  describe('getListenerCount', () => {
    it('应该返回正确的监听器数量', () => {
      messenger.on('test', () => { })
      messenger.on('test', () => { })
      messenger.on('test', () => { })

      expect(messenger.getListenerCount('test')).toBe(3)
    })
  })

  describe('waitFor', () => {
    it('应该等待事件发生', async () => {
      setTimeout(() => {
        messenger.emit('async-event', { result: 'success' })
      }, 100)

      const result = await messenger.waitFor<{ result: string }>('async-event')

      expect(result).toEqual({ result: 'success' })
    })

    it('超时应该拒绝 Promise', async () => {
      await expect(
        messenger.waitFor('never-happens', 100)
      ).rejects.toThrow('Timeout waiting for event')
    })
  })

  describe('事件历史', () => {
    it('启用后应该记录事件历史', () => {
      messenger.enableEventHistory(10)

      messenger.emit('event1', 'data1')
      messenger.emit('event2', 'data2')

      const history = messenger.getEventHistory()

      expect(history).toHaveLength(2)
      expect(history[0]).toMatchObject({ event: 'event1', data: 'data1' })
      expect(history[1]).toMatchObject({ event: 'event2', data: 'data2' })
    })

    it('应该限制历史记录大小', () => {
      messenger.enableEventHistory(3)

      for (let i = 0; i < 5; i++) {
        messenger.emit(`event${i}`, i)
      }

      const history = messenger.getEventHistory()

      expect(history).toHaveLength(3)
      expect(history[0].data).toBe(2) // 最旧的是 event2
    })

    it('禁用后应该清空历史', () => {
      messenger.enableEventHistory()
      messenger.emit('event', 'data')

      messenger.disableEventHistory()

      expect(messenger.getEventHistory()).toHaveLength(0)
    })
  })

  describe('getStats', () => {
    it('应该返回正确的统计信息', () => {
      messenger.on('event1', () => { })
      messenger.on('event1', () => { })
      messenger.on('event2', () => { })

      const stats = messenger.getStats()

      expect(stats.eventCount).toBe(2)
      expect(stats.totalListeners).toBe(3)
      expect(stats.events).toHaveLength(2)
    })
  })

  describe('dispose', () => {
    it('应该清理所有资源', () => {
      messenger.on('event', () => { })
      messenger.enableEventHistory()
      messenger.emit('event', 'data')

      messenger.dispose()

      expect(messenger.hasListeners()).toBe(false)
      expect(messenger.getEventHistory()).toHaveLength(0)
    })
  })
})


