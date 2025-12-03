/**
 * usePersistedState - 持久化状态管理
 * 
 * 提供响应式状态的自动持久化功能，支持多标签页同步
 * 
 * @module composables/usePersistedState
 */

import { ref, watch, onUnmounted, type Ref } from 'vue'

/**
 * 持久化状态选项
 */
export interface PersistedStateOptions<T> {
  /** 存储键名 */
  key: string
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage'
  /** 默认值 */
  defaultValue?: T
  /** 序列化函数 */
  serializer?: (value: T) => string
  /** 反序列化函数 */
  deserializer?: (value: string) => T
  /** 是否启用多标签页同步 */
  syncTabs?: boolean
  /** 防抖延迟（毫秒） */
  debounce?: number
  /** 是否深度监听 */
  deep?: boolean
  /** 过期时间（毫秒），undefined 表示永不过期 */
  ttl?: number
  /** 值变化前的回调 */
  onBeforeChange?: (newValue: T, oldValue: T) => boolean | void
  /** 值变化后的回调 */
  onAfterChange?: (newValue: T, oldValue: T) => void
  /** 从存储恢复前的回调 */
  onBeforeRestore?: (value: T) => T
  /** 从存储恢复后的回调 */
  onAfterRestore?: (value: T) => void
}

/**
 * 持久化状态返回值
 */
export interface PersistedStateReturn<T> {
  /** 响应式状态 */
  state: Ref<T>
  /** 手动保存到存储 */
  save: () => void
  /** 从存储恢复 */
  restore: () => void
  /** 清除存储 */
  clear: () => void
  /** 重置为默认值 */
  reset: () => void
  /** 检查是否已过期 */
  isExpired: () => boolean
}

/**
 * 存储项接口
 */
interface StorageItem<T> {
  /** 值 */
  value: T
  /** 创建时间戳 */
  timestamp: number
  /** 过期时间戳 */
  expiresAt?: number
}

/**
 * 默认序列化器
 */
function defaultSerializer<T>(value: T): string {
  return JSON.stringify(value)
}

/**
 * 默认反序列化器
 */
function defaultDeserializer<T>(value: string): T {
  try {
    return JSON.parse(value)
  }
  catch {
    return value as T
  }
}

/**
 * 获取存储对象
 */
function getStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  return type === 'localStorage' ? window.localStorage : window.sessionStorage
}

/**
 * usePersistedState - 持久化状态 Hook
 * 
 * @template T - 状态类型
 * @param options - 持久化选项
 * @returns 持久化状态和操作方法
 * 
 * @example
 * ```typescript
 * // 基础用法
 * const { state, save, restore, clear } = usePersistedState({
 *   key: 'user-preferences',
 *   defaultValue: { theme: 'light', language: 'zh-CN' },
 *   syncTabs: true
 * })
 * 
 * // 修改状态会自动保存
 * state.value.theme = 'dark'
 * 
 * // 手动操作
 * save()     // 手动保存
 * restore()  // 从存储恢复
 * clear()    // 清除存储
 * ```
 * 
 * @example
 * ```typescript
 * // 带过期时间
 * const { state, isExpired } = usePersistedState({
 *   key: 'session-data',
 *   defaultValue: null,
 *   ttl: 30 * 60 * 1000, // 30 分钟
 *   storage: 'sessionStorage'
 * })
 * 
 * if (isExpired()) {
 *   console.log('数据已过期')
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // 自定义序列化
 * const { state } = usePersistedState({
 *   key: 'custom-data',
 *   defaultValue: new Map(),
 *   serializer: (value) => JSON.stringify(Array.from(value.entries())),
 *   deserializer: (value) => new Map(JSON.parse(value))
 * })
 * ```
 */
export function usePersistedState<T>(
  options: PersistedStateOptions<T>
): PersistedStateReturn<T> {
  const {
    key,
    storage: storageType = 'localStorage',
    defaultValue,
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
    syncTabs = false,
    debounce: debounceDelay = 0,
    deep = true,
    ttl,
    onBeforeChange,
    onAfterChange,
    onBeforeRestore,
    onAfterRestore,
  } = options

  const storage = getStorage(storageType)
  const state = ref<T>(defaultValue as T) as Ref<T>
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  /**
   * 保存到存储
   */
  function save(): void {
    if (!storage) {
      return
    }

    try {
      const item: StorageItem<T> = {
        value: state.value,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined,
      }

      const serialized = serializer(item.value)
      const storageValue = JSON.stringify(item)
      storage.setItem(key, storageValue)
    }
    catch (error) {
      console.error(`[usePersistedState] 保存失败 (${key}):`, error)
    }
  }

  /**
   * 从存储恢复
   */
  function restore(): void {
    if (!storage) {
      return
    }

    try {
      const stored = storage.getItem(key)
      if (!stored) {
        return
      }

      const item: StorageItem<T> = JSON.parse(stored)

      // 检查是否过期
      if (item.expiresAt && Date.now() > item.expiresAt) {
        console.warn(`[usePersistedState] 数据已过期 (${key})`)
        clear()
        return
      }

      let value = item.value

      // 恢复前回调
      if (onBeforeRestore) {
        value = onBeforeRestore(value)
      }

      state.value = value

      // 恢复后回调
      onAfterRestore?.(value)
    }
    catch (error) {
      console.error(`[usePersistedState] 恢复失败 (${key}):`, error)
    }
  }

  /**
   * 清除存储
   */
  function clear(): void {
    if (!storage) {
      return
    }

    try {
      storage.removeItem(key)
    }
    catch (error) {
      console.error(`[usePersistedState] 清除失败 (${key}):`, error)
    }
  }

  /**
   * 重置为默认值
   */
  function reset(): void {
    state.value = defaultValue as T
    clear()
  }

  /**
   * 检查是否已过期
   */
  function isExpired(): boolean {
    if (!storage || !ttl) {
      return false
    }

    try {
      const stored = storage.getItem(key)
      if (!stored) {
        return false
      }

      const item: StorageItem<T> = JSON.parse(stored)
      return item.expiresAt ? Date.now() > item.expiresAt : false
    }
    catch {
      return false
    }
  }

  /**
   * 防抖保存
   */
  function debouncedSave(): void {
    if (debounceDelay > 0) {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        save()
      }, debounceDelay)
    }
    else {
      save()
    }
  }

  /**
   * 处理存储事件（多标签页同步）
   */
  function handleStorageEvent(event: StorageEvent): void {
    if (event.key !== key || !event.newValue) {
      return
    }

    try {
      const item: StorageItem<T> = JSON.parse(event.newValue)

      // 检查是否过期
      if (item.expiresAt && Date.now() > item.expiresAt) {
        return
      }

      state.value = item.value
    }
    catch (error) {
      console.error(`[usePersistedState] 同步失败 (${key}):`, error)
    }
  }

  // 初始化：从存储恢复
  restore()

  // 监听状态变化，自动保存
  watch(
    state,
    (newValue, oldValue) => {
      // 变化前回调
      if (onBeforeChange) {
        const result = onBeforeChange(newValue, oldValue)
        if (result === false) {
          return
        }
      }

      // 保存到存储
      debouncedSave()

      // 变化后回调
      onAfterChange?.(newValue, oldValue)
    },
    { deep }
  )

  // 多标签页同步
  if (syncTabs && typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent)

    onUnmounted(() => {
      window.removeEventListener('storage', handleStorageEvent)
    })
  }

  // 清理定时器
  onUnmounted(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  })

  return {
    state,
    save,
    restore,
    clear,
    reset,
    isExpired,
  }
}

