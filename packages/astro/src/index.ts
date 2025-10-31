/**
 * @ldesign/store-astro
 * 
 * Astro adapter for @ldesign/store - based on nanostores
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// Astro 适配器
export { createAstroStore } from './create-store'
export type { AstroStoreOptions, EnhancedAstroStore } from './create-store'

// 版本信息
export const version = '0.1.0'




