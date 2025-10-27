/**
 * 异步状态管理助手
 * 
 * 简化异步操作的状态管理（loading, error, data）。
 * 自动处理加载状态、错误处理和数据更新。
 * 
 * @example
 * ```typescript
 * // 在 Store 中使用
 * class UserStore extends BaseStore {
 *   // 创建异步状态
 *   fetchUserState = createAsyncState(async (userId: string) => {
 *     return await api.fetchUser(userId)
 *   })
 *   
 *   async loadUser(userId: string) {
 *     await this.fetchUserState.execute(userId)
 *     
 *     if (this.fetchUserState.data.value) {
 *       this.currentUser = this.fetchUserState.data.value
 *     }
 *   }
 * }
 * 
 * // 在组件中使用
 * const { loading, error, data, execute } = userStore.fetchUserState
 * 
 * // 执行异步操作
 * await execute('user-123')
 * ```
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue'

/**
 * 异步状态接口
 */
export interface AsyncState<T, Args extends any[]> {
  /** 加载状态 */
  loading: Ref<boolean>

  /** 错误信息 */
  error: Ref<Error | null>

  /** 数据 */
  data: Ref<T | null>

  /** 是否成功（有数据且无错误） */
  isSuccess: ComputedRef<boolean>

  /** 是否失败（有错误） */
  isError: ComputedRef<boolean>

  /** 是否空闲（未执行过） */
  isIdle: ComputedRef<boolean>

  /** 执行次数 */
  executionCount: Ref<number>

  /** 最后执行时间 */
  lastExecutionTime: Ref<number>

  /** 执行异步函数 */
  execute: (...args: Args) => Promise<T>

  /** 重置状态 */
  reset: () => void

  /** 刷新（使用上次参数重新执行） */
  refresh: () => Promise<T | null>

  /** 取消正在进行的请求 */
  cancel: () => void

  /** 设置数据 */
  setData: (data: T | null) => void

  /** 设置错误 */
  setError: (error: Error | null) => void
}

/**
 * 异步状态配置选项
 */
export interface AsyncStateOptions {
  /** 是否立即执行 */
  immediate?: boolean

  /** 初始数据 */
  initialData?: any

  /** 错误重试次数 */
  retries?: number

  /** 重试延迟（毫秒） */
  retryDelay?: number

  /** 超时时间（毫秒） */
  timeout?: number

  /** 成功回调 */
  onSuccess?: (data: any) => void

  /** 错误回调 */
  onError?: (error: Error) => void

  /** 执行前回调 */
  onBefore?: () => void | Promise<void>

  /** 执行后回调（无论成功失败） */
  onAfter?: () => void | Promise<void>
}

/**
 * 创建异步状态管理
 * 
 * @template T - 返回数据类型
 * @template Args - 函数参数类型
 * @param asyncFn - 异步函数
 * @param options - 配置选项
 * @returns 异步状态对象
 * 
 * @example
 * ```typescript
 * const asyncState = createAsyncState(
 *   async (userId: string) => {
 *     return await api.fetchUser(userId)
 *   },
 *   {
 *     retries: 3,
 *     timeout: 5000,
 *     onSuccess: (user) => {
 *       console.log('加载成功:', user)
 *     }
 *   }
 * )
 * 
 * await asyncState.execute('user-123')
 * ```
 */
export function createAsyncState<T, Args extends any[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: AsyncStateOptions = {}
): AsyncState<T, Args> {
  // 状态
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(options.initialData || null) as Ref<T | null>
  const executionCount = ref(0)
  const lastExecutionTime = ref(0)

  // 存储上次的参数，用于刷新
  let lastArgs: Args | null = null

  // 取消控制器
  let abortController: AbortController | null = null

  // 计算属性
  const isSuccess = computed(() => data.value !== null && error.value === null)
  const isError = computed(() => error.value !== null)
  const isIdle = computed(() => executionCount.value === 0)

  /**
   * 执行异步函数
   */
  const execute = async (...args: Args): Promise<T> => {
    // 保存参数用于刷新
    lastArgs = args

    // 重置错误
    error.value = null
    loading.value = true
    executionCount.value++
    lastExecutionTime.value = Date.now()

    // 创建取消控制器
    abortController = new AbortController()

    // 执行前回调
    if (options.onBefore) {
      try {
        await options.onBefore()
      } catch (err) {
        console.error('onBefore callback error:', err)
      }
    }

    let attemptCount = 0
    const maxAttempts = (options.retries || 0) + 1

    while (attemptCount < maxAttempts) {
      try {
        // 设置超时
        let timeoutId: NodeJS.Timeout | undefined
        const timeoutPromise = options.timeout
          ? new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              abortController?.abort()
              reject(new Error('Request timeout'))
            }, options.timeout)
          })
          : null

        // 执行异步函数
        const executePromise = asyncFn(...args)

        // 使用 Promise.race 实现超时
        const result = timeoutPromise
          ? await Promise.race([executePromise, timeoutPromise])
          : await executePromise

        // 清除超时
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // 更新数据
        data.value = result
        loading.value = false

        // 成功回调
        if (options.onSuccess) {
          try {
            options.onSuccess(result)
          } catch (err) {
            console.error('onSuccess callback error:', err)
          }
        }

        // 执行后回调
        if (options.onAfter) {
          try {
            await options.onAfter()
          } catch (err) {
            console.error('onAfter callback error:', err)
          }
        }

        return result
      } catch (err) {
        attemptCount++

        // 如果还有重试机会，延迟后重试
        if (attemptCount < maxAttempts) {
          if (options.retryDelay) {
            await new Promise(resolve => setTimeout(resolve, options.retryDelay))
          }
          continue
        }

        // 所有重试失败，设置错误
        const finalError = err instanceof Error ? err : new Error(String(err))
        error.value = finalError
        loading.value = false

        // 错误回调
        if (options.onError) {
          try {
            options.onError(finalError)
          } catch (callbackErr) {
            console.error('onError callback error:', callbackErr)
          }
        }

        // 执行后回调
        if (options.onAfter) {
          try {
            await options.onAfter()
          } catch (callbackErr) {
            console.error('onAfter callback error:', callbackErr)
          }
        }

        throw finalError
      }
    }

    // 这里应该不会到达，但为了类型安全
    throw new Error('Unexpected execution path')
  }

  /**
   * 重置状态
   */
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = options.initialData || null
    executionCount.value = 0
    lastExecutionTime.value = 0
    lastArgs = null
    abortController = null
  }

  /**
   * 刷新（使用上次参数重新执行）
   */
  const refresh = async (): Promise<T | null> => {
    if (lastArgs === null) {
      console.warn('No previous arguments to refresh')
      return null
    }
    return execute(...lastArgs)
  }

  /**
   * 取消正在进行的请求
   */
  const cancel = () => {
    if (abortController) {
      abortController.abort()
      loading.value = false
    }
  }

  /**
   * 设置数据
   */
  const setData = (newData: T | null) => {
    data.value = newData
  }

  /**
   * 设置错误
   */
  const setError = (newError: Error | null) => {
    error.value = newError
  }

  // 如果设置了立即执行，并且有初始参数
  if (options.immediate && lastArgs) {
    execute(...lastArgs).catch(err => {
      console.error('Immediate execution failed:', err)
    })
  }

  return {
    loading,
    error,
    data,
    isSuccess,
    isError,
    isIdle,
    executionCount,
    lastExecutionTime,
    execute,
    reset,
    refresh,
    cancel,
    setData,
    setError,
  }
}

/**
 * 创建带缓存的异步状态
 * 
 * 自动缓存请求结果，相同参数的请求会直接返回缓存。
 * 
 * @template T - 返回数据类型
 * @template Args - 函数参数类型
 * @param asyncFn - 异步函数
 * @param options - 配置选项
 * @param cacheTTL - 缓存过期时间（毫秒），默认 5 分钟
 * @returns 异步状态对象
 * 
 * @example
 * ```typescript
 * const asyncState = createCachedAsyncState(
 *   async (userId: string) => await api.fetchUser(userId),
 *   {},
 *   60000 // 1 分钟缓存
 * )
 * ```
 */
export function createCachedAsyncState<T, Args extends any[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: AsyncStateOptions = {},
  cacheTTL = 5 * 60 * 1000
): AsyncState<T, Args> {
  const cache = new Map<string, { data: T; timestamp: number }>()

  const cachedAsyncFn = async (...args: Args): Promise<T> => {
    const cacheKey = JSON.stringify(args)
    const cached = cache.get(cacheKey)

    // 检查缓存是否有效
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data
    }

    // 执行异步函数
    const result = await asyncFn(...args)

    // 缓存结果
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    })

    return result
  }

  return createAsyncState(cachedAsyncFn, options)
}

/**
 * 创建并行异步状态
 * 
 * 同时执行多个异步操作，并管理它们的状态。
 * 
 * @template T - 返回数据类型数组
 * @param asyncFns - 异步函数数组
 * @param options - 配置选项
 * @returns 异步状态对象
 * 
 * @example
 * ```typescript
 * const asyncState = createParallelAsyncState([
 *   () => api.fetchUser('user-1'),
 *   () => api.fetchUser('user-2'),
 *   () => api.fetchUser('user-3'),
 * ])
 * 
 * await asyncState.execute()
 * // data.value 将包含三个用户的数组
 * ```
 */
export function createParallelAsyncState<T extends any[]>(
  asyncFns: Array<() => Promise<T[number]>>,
  options: AsyncStateOptions = {}
): AsyncState<T, []> {
  const parallelAsyncFn = async (): Promise<T> => {
    const results = await Promise.all(asyncFns.map(fn => fn()))
    return results as T
  }

  return createAsyncState(parallelAsyncFn, options)
}


