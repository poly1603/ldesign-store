/**
 * BatchOperations 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BatchManager } from '../core/BatchOperations'

describe('BatchManager', () => {
  let manager: BatchManager

  beforeEach(() => {
    manager = new BatchManager()
    vi.useFakeTimers()
  })

  afterEach(() => {
    manager.dispose()
    vi.restoreAllMocks()
  })

  describe('startBatch', () => {
    it('应该创建新批处理', () => {
      manager.startBatch('test-batch')

      const stats = manager.getStats('test-batch')
      expect(stats.batchCount).toBe(1)
      expect(stats.totalOperations).toBe(0)
    })

    it('应该支持自动执行', () => {
      manager.startBatch('auto-batch', {
        autoExecute: true,
        autoExecuteDelay: 100,
      })

      const stats = manager.getStats('auto-batch')
      expect(stats.batches?.[0].hasAutoExecute).toBe(true)
    })
  })

  describe('addOperation', () => {
    it('应该添加操作到批处理', () => {
      manager.startBatch('test')

      manager.addOperation('test', () => console.log('op1'))
      manager.addOperation('test', () => console.log('op2'))

      const stats = manager.getStats('test')
      expect(stats.totalOperations).toBe(2)
    })

    it('批处理不存在时应该自动创建', () => {
      manager.addOperation('new-batch', () => { })

      expect(manager.getStats('new-batch').batchCount).toBe(1)
    })
  })

  describe('executeBatch', () => {
    it('应该执行所有操作', async () => {
      const op1 = vi.fn()
      const op2 = vi.fn()
      const op3 = vi.fn()

      manager.startBatch('test')
      manager.addOperation('test', op1)
      manager.addOperation('test', op2)
      manager.addOperation('test', op3)

      await manager.executeBatch('test')

      expect(op1).toHaveBeenCalled()
      expect(op2).toHaveBeenCalled()
      expect(op3).toHaveBeenCalled()
    })

    it('应该按优先级排序', async () => {
      const callOrder: number[] = []

      manager.startBatch('test')
      manager.addOperation('test', () => callOrder.push(1), 1)
      manager.addOperation('test', () => callOrder.push(10), 10)
      manager.addOperation('test', () => callOrder.push(5), 5)

      await manager.executeBatch('test', { sortByPriority: true })

      expect(callOrder).toEqual([10, 5, 1])
    })

    it('应该处理异步操作', async () => {
      const results: string[] = []

      manager.startBatch('async-test')
      manager.addOperation('async-test', async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        results.push('op1')
      })
      manager.addOperation('async-test', async () => {
        results.push('op2')
      })

      await manager.executeBatch('async-test')

      expect(results).toEqual(['op1', 'op2'])
    })

    it('操作中的错误不应该影响其他操作', async () => {
      const op1 = vi.fn()
      const op2 = vi.fn(() => {
        throw new Error('Error in op2')
      })
      const op3 = vi.fn()

      manager.startBatch('test')
      manager.addOperation('test', op1)
      manager.addOperation('test', op2)
      manager.addOperation('test', op3)

      await manager.executeBatch('test')

      expect(op1).toHaveBeenCalled()
      expect(op2).toHaveBeenCalled()
      expect(op3).toHaveBeenCalled()
    })
  })

  describe('cancelBatch', () => {
    it('应该取消批处理', () => {
      manager.startBatch('test')
      manager.addOperation('test', () => { })

      manager.cancelBatch('test')

      const stats = manager.getStats('test')
      expect(stats.batchCount).toBe(0)
    })
  })

  describe('batchExecute', () => {
    it('应该批量执行操作数组', async () => {
      const ops = [vi.fn(), vi.fn(), vi.fn()]

      await manager.batchExecute(ops)

      ops.forEach(op => {
        expect(op).toHaveBeenCalled()
      })
    })
  })

  describe('autoBatch', () => {
    it('应该在空闲时执行', async () => {
      const op = vi.fn()

      await manager.autoBatch(op)

      expect(op).toHaveBeenCalled()
    })
  })

  describe('getStats', () => {
    it('应该返回正确的统计信息', () => {
      manager.startBatch('batch1')
      manager.addOperation('batch1', () => { })
      manager.addOperation('batch1', () => { })

      manager.startBatch('batch2')
      manager.addOperation('batch2', () => { })

      const stats = manager.getStats()

      expect(stats.batchCount).toBe(2)
      expect(stats.totalOperations).toBe(3)
    })
  })

  describe('clear', () => {
    it('应该清空所有批处理', () => {
      manager.startBatch('test1')
      manager.startBatch('test2')
      manager.addOperation('test1', () => { })

      manager.clear()

      const stats = manager.getStats()
      expect(stats.batchCount).toBe(0)
      expect(stats.totalOperations).toBe(0)
    })
  })
})


