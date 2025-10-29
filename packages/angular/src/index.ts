/**
 * @ldesign/store-angular
 * 
 * Angular adapter for @ldesign/store - based on @ngrx/signals
 * 
 * @packageDocumentation
 */

// 重新导出核心功能
export * from '@ldesign/store-core'

// Angular 适配器
export { createAngularStore } from './create-store'
export type { AngularStoreOptions, EnhancedAngularStore } from './create-store'

// 版本信息
export const version = '0.1.0'



