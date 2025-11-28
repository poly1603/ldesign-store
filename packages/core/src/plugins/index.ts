/**
 * 插件模块导出
 *
 * @module plugins
 */

export {
  createPluginManager,
  getGlobalPluginManager,
  setGlobalPluginManager,
} from './plugin-manager'

export {
  composePlugins,
  createPluginFactory,
  defineStorePlugin,
} from './define-plugin'

