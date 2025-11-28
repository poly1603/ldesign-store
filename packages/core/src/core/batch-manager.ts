/**
 * 批量更新管理器
 *
 * 用于优化多个状态更新的性能
 * @module core/batch-manager
 */

import type { BatchManager, StoreId } from '../types'

/**
 * 创建批量更新管理器
 *
 * @param onFlush - 刷新回调，接收所有待更新的 Store ID
 * @returns 批量更新管理器实例
 *
 * @example
 * ```typescript
 * const batchManager = createBatchManager((storeIds) => {
 *   storeIds.forEach(id => {
 *     // 通知订阅者更新
 *     notifySubscribers(id)
 *   })
 * })
 *
 * // 批量更新
 * batchManager.batch(() => {
 *   store1.count++
 *   store2.name = 'new name'
 * })
 * ```
 */
export function createBatchManager(
  onFlush?: (storeIds: Set<StoreId>) => void,
): BatchManager {
  /** 是否正在批量更新 */
  let batching = false

  /** 待更新的 Store ID 集合 */
  const pendingStores = new Set<StoreId>()

  /**
   * 刷新待更新的 Store
   */
  const flush = (): void => {
    if (pendingStores.size > 0) {
      const stores = new Set(pendingStores)
      pendingStores.clear()
      onFlush?.(stores)
    }
  }

  /**
   * 开始批量更新
   */
  const start = (): void => {
    batching = true
  }

  /**
   * 结束批量更新
   */
  const end = (): void => {
    batching = false
    flush()
  }

  /**
   * 标记 Store 需要更新
   */
  const markDirty = (storeId: StoreId): void => {
    pendingStores.add(storeId)

    // 如果不在批量更新中，立即刷新
    if (!batching) {
      flush()
    }
  }

  /**
   * 在批量上下文中执行
   */
  const batch = <T>(fn: () => T): T => {
    start()
    try {
      return fn()
    }
    finally {
      end()
    }
  }

  /**
   * 是否正在批量更新
   */
  const isBatching = (): boolean => batching

  return {
    start,
    end,
    markDirty,
    batch,
    isBatching,
  }
}

/**
 * 全局批量更新管理器
 */
let globalBatchManager: BatchManager | null = null

/**
 * 获取全局批量更新管理器
 */
export function getGlobalBatchManager(): BatchManager {
  if (!globalBatchManager) {
    globalBatchManager = createBatchManager()
  }
  return globalBatchManager
}

/**
 * 设置全局批量更新管理器
 */
export function setGlobalBatchManager(manager: BatchManager): void {
  globalBatchManager = manager
}

/**
 * 批量更新辅助函数
 *
 * @param fn - 执行函数
 * @returns 执行结果
 */
export function batch<T>(fn: () => T): T {
  return getGlobalBatchManager().batch(fn)
}

