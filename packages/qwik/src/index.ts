/**
 * @ldesign/store-qwik
 * 
 * Qwik adapter for @ldesign/store - based on Qwik signals
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// Qwik 适配器
export { createQwikStore } from './create-store'
export type { QwikStoreOptions } from './create-store'

// 版本信息
export const version = '0.1.0'




