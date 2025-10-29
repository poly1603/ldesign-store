/**
 * @ldesign/store-preact
 * 
 * Preact adapter for @ldesign/store - based on Preact Signals
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// Preact 适配器
export { createPreactStore } from './create-store'
export type { PreactStoreOptions, EnhancedPreactStore } from './create-store'

// 版本信息
export const version = '0.1.0'



