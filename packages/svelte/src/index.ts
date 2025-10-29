/**
 * @ldesign/store-svelte
 * 
 * Svelte adapter for @ldesign/store - based on svelte/store with enhanced features
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// Svelte 适配器
export { createSvelteStore } from './create-store'
export type { SvelteStoreOptions, EnhancedSvelteStore } from './create-store'

// 版本信息
export const version = '0.1.0'



