/**
 * Snapshot 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SnapshotManager } from '../core/Snapshot'

interface TestState {
  count: number
  user: { name: string; age: number }
}

describe('SnapshotManager', () => {
  let manager: SnapshotManager<TestState>
  let initialState: TestState

  beforeEach(() => {
    manager = new SnapshotManager<TestState>({ maxSnapshots: 5 })
    initialState = {
      count: 0,
      user: { name: 'Test', age: 25 }
    }
  })

  describe('createSnapshot', () => {
    it('应该创建快照', () => {
      const info = manager.createSnapshot('initial', initialState, '初始状态')

      expect(info.name).toBe('initial')
      expect(info.description).toBe('初始状态')
      expect(manager.hasSnapshot('initial')).toBe(true)
    })

    it('应该支持标签', () => {
      manager.createSnapshot('test', initialState, '', ['tag1', 'tag2'])

      const snapshots = manager.findByTag('tag1')
      expect(snapshots).toContain('test')
    })

    it('应该限制快照数量', () => {
      for (let i = 0; i < 10; i++) {
        manager.createSnapshot(`snap-${i}`, initialState)
      }

      expect(manager.listSnapshots()).toHaveLength(5)
    })
  })

  describe('restoreSnapshot', () => {
    it('应该恢复快照', () => {
      manager.createSnapshot('snap1', initialState)

      const modifiedState = { ...initialState, count: 10 }
      manager.createSnapshot('snap2', modifiedState)

      const restored = manager.restoreSnapshot('snap1')

      expect(restored).toEqual(initialState)
      expect(restored).not.toBe(initialState) // 应该是深拷贝
    })

    it('不存在的快照应该返回 undefined', () => {
      const restored = manager.restoreSnapshot('non-existent')
      expect(restored).toBeUndefined()
    })
  })

  describe('deleteSnapshot', () => {
    it('应该删除快照', () => {
      manager.createSnapshot('test', initialState)

      const deleted = manager.deleteSnapshot('test')

      expect(deleted).toBe(true)
      expect(manager.hasSnapshot('test')).toBe(false)
    })
  })

  describe('diffSnapshots', () => {
    it('应该计算快照差异', () => {
      manager.createSnapshot('before', initialState)

      const afterState: TestState = {
        count: 5,
        user: { name: 'Modified', age: 30 }
      }
      manager.createSnapshot('after', afterState)

      const diffs = manager.diffSnapshots('before', 'after')

      expect(diffs.length).toBeGreaterThan(0)
      expect(diffs.some(d => d.path === 'count')).toBe(true)
      expect(diffs.some(d => d.path === 'user.name')).toBe(true)
    })
  })

  describe('exportSnapshot', () => {
    it('应该导出快照为 JSON', () => {
      manager.createSnapshot('test', initialState)

      const json = manager.exportSnapshot('test')

      expect(json).toBeDefined()
      expect(typeof json).toBe('string')
    })
  })

  describe('importSnapshot', () => {
    it('应该导入快照', () => {
      manager.createSnapshot('original', initialState)
      const json = manager.exportSnapshot('original')!

      const newManager = new SnapshotManager<TestState>()
      const success = newManager.importSnapshot(json)

      expect(success).toBe(true)
      expect(newManager.hasSnapshot('original')).toBe(true)
    })
  })

  describe('getStats', () => {
    it('应该返回统计信息', () => {
      manager.createSnapshot('snap1', initialState)
      manager.createSnapshot('snap2', { ...initialState, count: 5 })

      const stats = manager.getStats()

      expect(stats.count).toBe(2)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.oldestSnapshot).toBeDefined()
      expect(stats.newestSnapshot).toBeDefined()
    })
  })
})


