/**
 * usePersist Composable
 *
 * 提供状态持久化功能
 * @module composables/usePersist
 */

import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import type { UsePersistOptions, UsePersistReturn } from '../types'

/**
 * 获取存储对象
 */
function getStorage(type: 'localStorage' | 'sessionStorage'): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  return type === 'localStorage' ? localStorage : sessionStorage
}

/**
 * 状态持久化 Hook
 *
 * 将状态自动保存到 localStorage 或 sessionStorage
 *
 * @template T - 值类型
 * @param options - 持久化选项
 * @returns 持久化操作对象
 *
 * @example
 * ```typescript
 * const { value, save, restore, clear } = usePersist<User>({
 *   key: 'user-info',
 *   storage: 'localStorage',
 *   defaultValue: { name: '', age: 0 }
 * })
 *
 * // 更新值会自动保存
 * value.value = { name: 'John', age: 25 }
 *
 * // 手动保存
 * save()
 *
 * // 从存储恢复
 * restore()
 *
 * // 清除存储
 * clear()
 * ```
 */
export function usePersist<T>(options: UsePersistOptions): UsePersistReturn<T> {
  const {
    key,
    storage: storageType = 'localStorage',
    defaultValue,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options

  const storage = getStorage(storageType)
  const value = ref<T>(defaultValue as T) as Ref<T>

  /**
   * 从存储恢复
   */
  const restore = (): void => {
    if (!storage) return

    try {
      const stored = storage.getItem(key)
      if (stored !== null) {
        value.value = deserialize(stored) as T
      }
    }
    catch (error) {
      console.error(`[usePersist] 恢复失败 (${key}):`, error)
    }
  }

  /**
   * 保存到存储
   */
  const save = (): void => {
    if (!storage) return

    try {
      storage.setItem(key, serialize(value.value))
    }
    catch (error) {
      console.error(`[usePersist] 保存失败 (${key}):`, error)
    }
  }

  /**
   * 清除存储
   */
  const clear = (): void => {
    if (!storage) return

    try {
      storage.removeItem(key)
      value.value = defaultValue as T
    }
    catch (error) {
      console.error(`[usePersist] 清除失败 (${key}):`, error)
    }
  }

  // 组件挂载时恢复
  onMounted(() => {
    restore()
  })

  // 监听变化自动保存
  watch(
    value,
    () => {
      save()
    },
    { deep: true },
  )

  return {
    value,
    save,
    restore,
    clear,
  }
}

/**
 * 创建持久化的 ref
 *
 * @template T - 值类型
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @param storage - 存储类型
 * @returns 持久化的 ref
 *
 * @example
 * ```typescript
 * const count = usePersistedRef('count', 0)
 *
 * // 更新会自动保存
 * count.value++
 * ```
 */
export function usePersistedRef<T>(
  key: string,
  defaultValue: T,
  storage: 'localStorage' | 'sessionStorage' = 'localStorage',
): Ref<T> {
  const { value } = usePersist<T>({
    key,
    storage,
    defaultValue,
  })
  return value
}

/**
 * 创建带过期时间的持久化 ref
 *
 * @template T - 值类型
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @param ttl - 过期时间（毫秒）
 * @returns 持久化的 ref
 */
export function usePersistedRefWithTTL<T>(
  key: string,
  defaultValue: T,
  ttl: number,
): Ref<T> {
  interface StoredData {
    value: T
    expiry: number
  }

  const { value } = usePersist<StoredData>({
    key,
    defaultValue: { value: defaultValue, expiry: 0 },
    serialize: (data: unknown) => JSON.stringify(data),
    deserialize: (str: string) => {
      const data = JSON.parse(str) as StoredData
      if (data.expiry && Date.now() > data.expiry) {
        return { value: defaultValue, expiry: 0 }
      }
      return data
    },
  })

  // 包装 ref 以自动设置过期时间
  const wrappedRef = ref(value.value.value) as Ref<T>

  watch(wrappedRef, (newValue) => {
    value.value = {
      value: newValue,
      expiry: Date.now() + ttl,
    }
  })

  return wrappedRef
}

