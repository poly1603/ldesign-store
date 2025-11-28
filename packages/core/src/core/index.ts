/**
 * 核心模块导出
 *
 * @module core
 */

export { BaseStore } from './base-store'
export { createEventBus, globalEventBus } from './event-bus'
export { createPubSub, createPubSubWithValue } from './pub-sub'
export {
  batch,
  createBatchManager,
  getGlobalBatchManager,
  setGlobalBatchManager,
} from './batch-manager'

