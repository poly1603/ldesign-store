/**
 * @ldesign/store-react
 * 
 * React adapter for @ldesign/store - based on Zustand with enhanced features
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// React 适配器
export { createReactStore } from './create-store'
export type { ReactStoreOptions, EnhancedReactStore } from './create-store'

// 版本信息
export const version = '0.1.0'



