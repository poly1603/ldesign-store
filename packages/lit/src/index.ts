/**
 * @ldesign/store-lit
 * 
 * Lit adapter for @ldesign/store - based on Reactive Controllers
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// Lit 适配器
export { createLitStore, LitStoreController } from './create-store'
export type { LitStoreOptions } from './create-store'

// 版本信息
export const version = '0.1.0'




