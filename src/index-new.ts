/**
 * @ldesign/store
 * 
 * 多框架状态管理库 - 统一的 API，支持 Vue、React、Solid、Svelte 等
 * 
 * @packageDocumentation
 */

// 核心功能 - 框架无关
export * from '@ldesign/store-core'

// Vue 适配器（需要安装 pinia 和 vue）
// export * from '@ldesign/store-vue'

// React 适配器（需要安装 zustand 和 react）
// export * from '@ldesign/store-react'

// Solid 适配器（需要安装 solid-js）
// export * from '@ldesign/store-solid'

// Svelte 适配器（需要安装 svelte）
// export * from '@ldesign/store-svelte'

/**
 * 提示：
 * 
 * 1. 如果使用 Vue，请导入:
 *    import { createVueStore } from '@ldesign/store-vue'
 * 
 * 2. 如果使用 React，请导入:
 *    import { createReactStore } from '@ldesign/store-react'
 * 
 * 3. 如果只需要核心功能（框架无关），请导入:
 *    import { LRUCache, PerformanceMonitor } from '@ldesign/store-core'
 */

export const version = '0.1.0'




