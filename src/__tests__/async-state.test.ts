/**
 * async-state 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAsyncState, createCachedAsyncState, createParallelAsyncState } from '../utils/async-state'

describe('createAsyncState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该自动管理 loading 状态', async () => {
    const asyncFn = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return 'result'
    })

    const asyncState = createAsyncState(asyncFn)

    expect(asyncState.loading.value).toBe(false)

    const promise = asyncState.execute()

    expect(asyncState.loading.value).toBe(true)

    await promise

    expect(asyncState.loading.value).toBe(false)
  })

  it('应该正确设置数据', async () => {
    const asyncState = createAsyncState(async () => 'test-data')

    await asyncState.execute()

    expect(asyncState.data.value).toBe('test-data')
    expect(asyncState.isSuccess.value).toBe(true)
  })

  it('应该处理错误', async () => {
    const error = new Error('Test error')
    const asyncState = createAsyncState(async () => {
      throw error
    })

    await expect(asyncState.execute()).rejects.toThrow('Test error')

    expect(asyncState.error.value).toBe(error)
    expect(asyncState.isError.value).toBe(true)
  })

  it('应该支持重试', async () => {
    let attempts = 0
    const asyncFn = vi.fn(async () => {
      attempts++
      if (attempts < 3) {
        throw new Error('Retry me')
      }
      return 'success'
    })

    const asyncState = createAsyncState(asyncFn, {
      retries: 3,
      retryDelay: 100,
    })

    const result = await asyncState.execute()

    expect(result).toBe('success')
    expect(asyncFn).toHaveBeenCalledTimes(3)
  })

  it('应该支持超时', async () => {
    const asyncState = createAsyncState(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 5000))
        return 'result'
      },
      { timeout: 1000 }
    )

    await expect(asyncState.execute()).rejects.toThrow('timeout')
  })

  it('应该调用生命周期钩子', async () => {
    const onBefore = vi.fn()
    const onSuccess = vi.fn()
    const onAfter = vi.fn()

    const asyncState = createAsyncState(
      async () => 'result',
      { onBefore, onSuccess, onAfter }
    )

    await asyncState.execute()

    expect(onBefore).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith('result')
    expect(onAfter).toHaveBeenCalled()
  })

  it('reset 应该重置状态', async () => {
    const asyncState = createAsyncState(async () => 'data')

    await asyncState.execute()

    expect(asyncState.data.value).toBe('data')

    asyncState.reset()

    expect(asyncState.data.value).toBe(null)
    expect(asyncState.error.value).toBe(null)
    expect(asyncState.loading.value).toBe(false)
    expect(asyncState.executionCount.value).toBe(0)
  })

  it('refresh 应该使用上次参数重新执行', async () => {
    const asyncFn = vi.fn(async (arg: string) => `result: ${arg}`)
    const asyncState = createAsyncState(asyncFn)

    await asyncState.execute('test')
    await asyncState.refresh()

    expect(asyncFn).toHaveBeenCalledTimes(2)
    expect(asyncFn).toHaveBeenCalledWith('test')
  })

  it('cancel 应该取消请求', async () => {
    const asyncState = createAsyncState(async () => {
      await new Promise(resolve => setTimeout(resolve, 5000))
      return 'result'
    })

    const promise = asyncState.execute()
    asyncState.cancel()

    expect(asyncState.loading.value).toBe(false)
  })
})

describe('createCachedAsyncState', () => {
  it('应该缓存结果', async () => {
    const asyncFn = vi.fn(async (id: string) => `user-${id}`)
    const asyncState = createCachedAsyncState(asyncFn, {}, 5000)

    // 第一次调用
    await asyncState.execute('123')
    expect(asyncFn).toHaveBeenCalledTimes(1)

    // 第二次调用相同参数（应该返回缓存）
    await asyncState.execute('123')
    expect(asyncFn).toHaveBeenCalledTimes(1) // 不增加

    // 不同参数（应该重新调用）
    await asyncState.execute('456')
    expect(asyncFn).toHaveBeenCalledTimes(2)
  })
})

describe('createParallelAsyncState', () => {
  it('应该并行执行所有任务', async () => {
    const fn1 = vi.fn(async () => 'result1')
    const fn2 = vi.fn(async () => 'result2')
    const fn3 = vi.fn(async () => 'result3')

    const asyncState = createParallelAsyncState([fn1, fn2, fn3])

    const result = await asyncState.execute()

    expect(result).toEqual(['result1', 'result2', 'result3'])
    expect(fn1).toHaveBeenCalled()
    expect(fn2).toHaveBeenCalled()
    expect(fn3).toHaveBeenCalled()
  })
})


