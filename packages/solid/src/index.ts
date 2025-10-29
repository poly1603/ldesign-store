/**
 * @ldesign/store-solid
 * 
 * Solid adapter for @ldesign/store - based on @solidjs/store with enhanced features
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// Solid 适配器
export { createSolidStore } from './create-store'
export type { SolidStoreOptions, EnhancedSolidStore } from './create-store'

// 版本信息
export const version = '0.1.0'



