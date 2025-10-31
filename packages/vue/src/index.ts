/**
 * @ldesign/store-vue
 * 
 * Vue adapter for @ldesign/store - based on Pinia with enhanced features
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// Vue 适配器
export { createVueStore } from './create-store'
export type { VueStoreOptions, EnhancedStore } from './create-store'

// 版本信息
export const version = '0.1.0'




