/**
 * @ldesign/store-alpine
 * 
 * Alpine.js adapter for @ldesign/store - based on Alpine.store()
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// Alpine 适配器
export { createAlpineStore } from './create-store'
export type { AlpineStoreOptions, EnhancedAlpineStore } from './create-store'

// 版本信息
export const version = '0.1.0'



