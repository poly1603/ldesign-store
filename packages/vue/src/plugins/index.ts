/**
 * 插件模块导出
 *
 * @module plugins
 */

export {
  createPersistPlugin,
} from './pinia-plugin'

export type { PersistPluginOptions } from './pinia-plugin'

export {
  createStoreEnginePlugin,
  getGlobalStoreAPI,
} from './engine-plugin'

