/**
 * @ldesign/store-core
 * 
 * Framework-agnostic core for state management
 * 
 * 提供缓存、持久化、装饰器、性能监控等核心功能
 * 
 * @packageDocumentation
 */

// 类型导出
export * from './types'

// 缓存系统
export { LRUCache, fastHash, ObjectPool } from './cache'

// 工具函数
export * from './utils'

// 订阅系统
export { SubscriptionManager } from './subscription'

// 装饰器
export { State, Action, Getter, registerMetadata, getMetadata } from './decorators'

// 性能监控
export { PerformanceMonitor } from './performance'
export type { PerformanceMetrics } from './performance'

// 持久化
export {
  MemoryStorageAdapter,
  JSONSerializer,
  getDefaultStorage,
  getDefaultSerializer
} from './persistence'

// 版本信息
export const version = '0.1.0'


