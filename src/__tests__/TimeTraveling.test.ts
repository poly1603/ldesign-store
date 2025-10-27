/**
 * TimeTraveling 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TimeTravelDebugger } from '../devtools/TimeTraveling'

interface TestState {
  count: number
  name: string
}

describe('TimeTravelDebugger', () => {
  let debugger: TimeTravelDebugger<TestState>

  beforeEach(() => {
    debugger = new TimeTravelDebugger<TestState>({ maxHistory: 10 })
  })

  describe('recordState', () => {
    it('应该记录状态', () => {
      debugger.recordState({ count: 0, name: 'initial' }, 'init')

      expect(debugger.getHistoryCount()).toBe(1)
    expect(debugger.getCurrentIndex()).toBe(0)
})

it('应该记录动作和参数', () => {
  debugger.recordState({ count: 0, name: '' }, 'increment', [1])

  const entry = debugger.getCurrentEntry()

  expect(entry?.action).toBe('increment')
  expect(entry?.args).toEqual([1])
})

it('应该限制历史记录数量', () => {
  for (let i = 0; i < 15; i++) {
    debugger.recordState({ count: i, name: `state${i}` })
  }

  expect(debugger.getHistoryCount()).toBe(10)
    })

it('非最新位置时记录应该清除后续历史', () => {
  debugger.recordState({ count: 0, name: '0' })
  debugger.recordState({ count: 1, name: '1' })
  debugger.recordState({ count: 2, name: '2' })

  debugger.undo() // 回到 state 1

  debugger.recordState({ count: 10, name: '10' })

  expect(debugger.getHistoryCount()).toBe(3) // 0, 1, 10
    })
  })

describe('undo', () => {
  it('应该后退到上一个状态', () => {
    debugger.recordState({ count: 0, name: '0' })
    debugger.recordState({ count: 1, name: '1' })
    debugger.recordState({ count: 2, name: '2' })

    const state = debugger.undo()

    expect(state).toEqual({ count: 1, name: '1' })
    expect(debugger.getCurrentIndex()).toBe(1)
})

it('第一个状态不能后退', () => {
  debugger.recordState({ count: 0, name: '0' })

  const state = debugger.undo()

  expect(state).toBeUndefined()
  expect(debugger.getCurrentIndex()).toBe(0)
    })
  })

describe('redo', () => {
  it('应该前进到下一个状态', () => {
    debugger.recordState({ count: 0, name: '0' })
    debugger.recordState({ count: 1, name: '1' })

    debugger.undo()
    const state = debugger.redo()

    expect(state).toEqual({ count: 1, name: '1' })
    expect(debugger.getCurrentIndex()).toBe(1)
})

it('最新状态不能前进', () => {
  debugger.recordState({ count: 0, name: '0' })

  const state = debugger.redo()

  expect(state).toBeUndefined()
})
  })

describe('jumpTo', () => {
  it('应该跳转到指定位置', () => {
    debugger.recordState({ count: 0, name: '0' })
    debugger.recordState({ count: 1, name: '1' })
    debugger.recordState({ count: 2, name: '2' })

    const state = debugger.jumpTo(1)

    expect(state).toEqual({ count: 1, name: '1' })
    expect(debugger.getCurrentIndex()).toBe(1)
})

it('无效索引应该返回 undefined', () => {
  const state = debugger.jumpTo(100)

  expect(state).toBeUndefined()
})
  })

describe('jumpToAction', () => {
  it('应该跳转到指定动作', () => {
    debugger.recordState({ count: 0, name: '0' }, 'init')
    debugger.recordState({ count: 1, name: '1' }, 'increment')
    debugger.recordState({ count: 2, name: '2' }, 'increment')

    const state = debugger.jumpToAction('increment', 2)

    expect(state).toEqual({ count: 2, name: '2' })
  })
})

describe('canUndo / canRedo', () => {
  it('应该正确判断是否可以前进后退', () => {
    expect(debugger.canUndo()).toBe(false)
  expect(debugger.canRedo()).toBe(false)

debugger.recordState({ count: 0, name: '0' })
debugger.recordState({ count: 1, name: '1' })

expect(debugger.canUndo()).toBe(true)
expect(debugger.canRedo()).toBe(false)

debugger.undo()

expect(debugger.canUndo()).toBe(true)
expect(debugger.canRedo()).toBe(true)
    })
  })

describe('getHistory', () => {
  it('应该返回历史记录', () => {
    debugger.recordState({ count: 0, name: '0' }, 'init')
    debugger.recordState({ count: 1, name: '1' }, 'increment')

    const history = debugger.getHistory()

    expect(history).toHaveLength(2)
    expect(history[0].action).toBe('init')
    expect(history[1].action).toBe('increment')
  })

  it('includeState 为 false 时不应该包含状态', () => {
    debugger.recordState({ count: 0, name: '0' })

    const history = debugger.getHistory(false)

    expect(history[0]).not.toHaveProperty('state')
  })
})

describe('clear', () => {
  it('应该清空历史', () => {
    debugger.recordState({ count: 0, name: '0' })
    debugger.recordState({ count: 1, name: '1' })

    debugger.clear()

    expect(debugger.getHistoryCount()).toBe(0)
})

it('keepCurrent 为 true 时应该保留当前状态', () => {
  debugger.recordState({ count: 0, name: '0' })
  debugger.recordState({ count: 1, name: '1' })
  debugger.recordState({ count: 2, name: '2' })

  debugger.undo()
  debugger.clear(true)

  expect(debugger.getHistoryCount()).toBe(1)
expect(debugger.getCurrentState()).toEqual({ count: 1, name: '1' })
    })
  })

describe('exportHistory / importHistory', () => {
  it('应该导出和导入历史', () => {
    debugger.recordState({ count: 0, name: '0' })
    debugger.recordState({ count: 1, name: '1' })

    const exported = debugger.exportHistory()

    const newDebugger = new TimeTravelDebugger<TestState>()
    const success = newDebugger.importHistory(exported)

    expect(success).toBe(true)
    expect(newDebugger.getHistoryCount()).toBe(2)
  })
})

describe('getStats', () => {
  it('应该返回统计信息', () => {
    debugger.recordState({ count: 0, name: '0' }, 'init')
    debugger.recordState({ count: 1, name: '1' }, 'increment')
    debugger.recordState({ count: 2, name: '2' }, 'increment')

    const stats = debugger.getStats()

    expect(stats.totalRecords).toBe(3)
    expect(stats.currentPosition).toBe(2)
    expect(stats.canUndo).toBe(true)
    expect(stats.canRedo).toBe(false)
    expect(stats.actions).toEqual({
      init: 1,
      increment: 2,
    })
  })
})
})


