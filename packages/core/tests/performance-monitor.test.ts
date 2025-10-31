/**
 * PerformanceMonitor 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PerformanceMonitor } from '../src/performance/performance-monitor'

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    monitor = new PerformanceMonitor()
  })

  describe('基础测量', () => {
    it('应该能够测量同步函数', () => {
      const result = monitor.measure('syncTask', () => {
        let sum = 0
        for (let i = 0; i < 1000; i++) {
          sum += i
        }
        return sum
      })

      expect(result).toBe(999 * 1000 / 2)

      const metrics = monitor.getMetrics('syncTask')
      expect(metrics).toBeDefined()
      expect(metrics!.count).toBe(1)
      expect(metrics!.totalTime).toBeGreaterThan(0)
    })

    it('应该能够测量异步函数', async () => {
      const result = await monitor.measure('asyncTask', async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 'done'
      })

      expect(result).toBe('done')

      const metrics = monitor.getMetrics('asyncTask')
      expect(metrics).toBeDefined()
      expect(metrics!.count).toBe(1)
      expect(metrics!.totalTime).toBeGreaterThanOrEqual(50)
    })

    it('应该能够多次测量同一任务', () => {
      monitor.measure('task', () => 1)
      monitor.measure('task', () => 2)
      monitor.measure('task', () => 3)

      const metrics = monitor.getMetrics('task')
      expect(metrics!.count).toBe(3)
    })
  })

  describe('统计信息', () => {
    it('应该正确计算平均时间', async () => {
      await monitor.measure('task', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await monitor.measure('task', async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
      })

      const metrics = monitor.getMetrics('task')
      expect(metrics!.count).toBe(2)
      expect(metrics!.avgTime).toBeGreaterThan(100)
      expect(metrics!.avgTime).toBeLessThan(200)
    })

    it('应该记录最小和最大时间', async () => {
      await monitor.measure('task', async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      await monitor.measure('task', async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      const metrics = monitor.getMetrics('task')
      expect(metrics!.minTime).toBeGreaterThanOrEqual(50)
      expect(metrics!.minTime).toBeLessThan(100)
      expect(metrics!.maxTime).toBeGreaterThanOrEqual(150)
    })

    it('应该能够获取所有指标', () => {
      monitor.measure('task1', () => 1)
      monitor.measure('task2', () => 2)

      const allMetrics = monitor.getAllMetrics()
      expect(allMetrics).toHaveLength(2)
      expect(allMetrics.find(m => m.name === 'task1')).toBeDefined()
      expect(allMetrics.find(m => m.name === 'task2')).toBeDefined()
    })
  })

  describe('重置功能', () => {
    it('应该能够重置特定任务的指标', () => {
      monitor.measure('task1', () => 1)
      monitor.measure('task2', () => 2)

      monitor.reset('task1')

      expect(monitor.getMetrics('task1')).toBeUndefined()
      expect(monitor.getMetrics('task2')).toBeDefined()
    })

    it('应该能够重置所有指标', () => {
      monitor.measure('task1', () => 1)
      monitor.measure('task2', () => 2)

      monitor.reset()

      expect(monitor.getAllMetrics()).toHaveLength(0)
    })
  })

  describe('错误处理', () => {
    it('同步函数抛出错误时应该记录指标', () => {
      expect(() => {
        monitor.measure('errorTask', () => {
          throw new Error('Test error')
        })
      }).toThrow('Test error')

      const metrics = monitor.getMetrics('errorTask')
      expect(metrics).toBeDefined()
      expect(metrics!.count).toBe(1)
    })

    it('异步函数抛出错误时应该记录指标', async () => {
      await expect(
        monitor.measure('asyncErrorTask', async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          throw new Error('Async error')
        })
      ).rejects.toThrow('Async error')

      const metrics = monitor.getMetrics('asyncErrorTask')
      expect(metrics).toBeDefined()
      expect(metrics!.count).toBe(1)
    })
  })
})


