/**
 * TimerManager 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TimerManager } from '../core/TimerManager'

describe('TimerManager', () => {
  let timerManager: TimerManager

  beforeEach(() => {
    timerManager = new TimerManager()
    vi.useFakeTimers()
  })

  afterEach(() => {
    timerManager.dispose()
    vi.restoreAllMocks()
  })

  describe('setTimeout', () => {
    it('应该正确执行定时器', () => {
      const callback = vi.fn()
      timerManager.setTimeout(callback, 1000)

      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1000)

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('应该传递参数给回调', () => {
      const callback = vi.fn()
      timerManager.setTimeout(callback, 1000, 'arg1', 'arg2')

      vi.advanceTimersByTime(1000)

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('应该追踪定时器', () => {
      timerManager.setTimeout(() => { }, 1000)
      timerManager.setTimeout(() => { }, 2000)

      const stats = timerManager.getStats()
      expect(stats.timeouts).toBe(2)
      expect(stats.intervals).toBe(0)
      expect(stats.total).toBe(2)
    })

    it('定时器执行后应该自动移除', () => {
      timerManager.setTimeout(() => { }, 1000)

      vi.advanceTimersByTime(1000)

      const stats = timerManager.getStats()
      expect(stats.timeouts).toBe(0)
    })
  })

  describe('setInterval', () => {
    it('应该周期性执行', () => {
      const callback = vi.fn()
      timerManager.setInterval(callback, 1000)

      vi.advanceTimersByTime(3500)

      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('应该追踪间隔定时器', () => {
      timerManager.setInterval(() => { }, 1000)
      timerManager.setInterval(() => { }, 2000)

      const stats = timerManager.getStats()
      expect(stats.intervals).toBe(2)
    })
  })

  describe('clearTimeout', () => {
    it('应该取消定时器', () => {
      const callback = vi.fn()
      const timer = timerManager.setTimeout(callback, 1000)

      const cleared = timerManager.clearTimeout(timer)
      expect(cleared).toBe(true)

      vi.advanceTimersByTime(1000)
      expect(callback).not.toHaveBeenCalled()
    })

    it('清除不存在的定时器应该返回 false', () => {
      const cleared = timerManager.clearTimeout(999 as any)
      expect(cleared).toBe(false)
    })
  })

  describe('clearInterval', () => {
    it('应该停止间隔定时器', () => {
      const callback = vi.fn()
      const timer = timerManager.setInterval(callback, 1000)

      vi.advanceTimersByTime(2500)
      expect(callback).toHaveBeenCalledTimes(2)

      timerManager.clearInterval(timer)

      vi.advanceTimersByTime(2000)
      expect(callback).toHaveBeenCalledTimes(2) // 不再增加
    })
  })

  describe('clearAll', () => {
    it('应该清除所有定时器', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      timerManager.setTimeout(callback1, 1000)
      timerManager.setInterval(callback2, 1000)

      timerManager.clearAll()

      vi.advanceTimersByTime(2000)

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()

      const stats = timerManager.getStats()
      expect(stats.total).toBe(0)
    })
  })

  describe('dispose', () => {
    it('应该清除所有定时器并标记为已销毁', () => {
      const callback = vi.fn()
      timerManager.setTimeout(callback, 1000)

      timerManager.dispose()

      expect(timerManager.isDisposed()).toBe(true)

      vi.advanceTimersByTime(1000)
      expect(callback).not.toHaveBeenCalled()
    })

    it('销毁后不应该创建新定时器', () => {
      timerManager.dispose()

      const callback = vi.fn()
      timerManager.setTimeout(callback, 1000)

      vi.advanceTimersByTime(1000)
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('getStats', () => {
    it('应该返回正确的统计信息', () => {
      timerManager.setTimeout(() => { }, 1000)
      timerManager.setTimeout(() => { }, 2000)
      timerManager.setInterval(() => { }, 1000)

      const stats = timerManager.getStats()

      expect(stats.timeouts).toBe(2)
      expect(stats.intervals).toBe(1)
      expect(stats.total).toBe(3)
      expect(stats.disposed).toBe(false)
    })
  })
})


