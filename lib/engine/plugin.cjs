/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pinia = require('pinia');
var PerformanceOptimizer = require('../core/PerformanceOptimizer.cjs');
var StoreFactory = require('../core/StoreFactory.cjs');

const defaultConfig = {
  name: "store",
  version: "1.0.0",
  description: "LDesign Store Engine Plugin",
  dependencies: [],
  autoInstall: true,
  enablePerformanceMonitoring: false,
  debug: false,
  globalInjection: true,
  globalPropertyName: "$store",
  storeConfig: {
    enablePerformanceOptimization: true,
    enablePersistence: false,
    debug: false,
    defaultCacheOptions: {
      ttl: 3e5,
      // 5分钟
      maxSize: 100
    },
    defaultPersistOptions: {
      key: "ldesign-store",
      storage: typeof window !== "undefined" ? window.localStorage : void 0,
      paths: []
    }
  }
};
function createStoreEnginePlugin(options = {}) {
  const config = { ...defaultConfig, ...options };
  const {
    name = "store",
    version = "1.0.0",
    dependencies = [],
    enablePerformanceMonitoring = false,
    // debug = false,
    globalInjection = true,
    globalPropertyName = "$store",
    storeConfig = {}
  } = config;
  return {
    name,
    version,
    dependencies,
    async install(context) {
      try {
        const engine = context.engine || context;
        const app = context.app || engine?.app;
        const pinia$1 = pinia.createPinia();
        pinia.setActivePinia(pinia$1);
        if (app) {
          app.use(pinia$1);
        }
        let performanceOptimizer;
        if (storeConfig.enablePerformanceOptimization) {
          performanceOptimizer = new PerformanceOptimizer.PerformanceOptimizer();
        }
        const storeFactory = new StoreFactory.StoreFactory();
        if (engine) {
          if (engine.state) {
            engine.state.set("pinia", pinia$1);
            engine.state.set("storeFactory", storeFactory);
            if (performanceOptimizer) {
              engine.state.set("storePerformanceOptimizer", performanceOptimizer);
            }
          }
          if (globalInjection && app && globalPropertyName) {
            app.config.globalProperties[globalPropertyName] = {
              pinia: pinia$1,
              factory: storeFactory,
              optimizer: performanceOptimizer
            };
          } else if (globalInjection && globalPropertyName) {
            if (engine.events) {
              engine.events.on("app:created", (createdApp) => {
                createdApp.config.globalProperties[globalPropertyName] = {
                  pinia: pinia$1,
                  factory: storeFactory,
                  optimizer: performanceOptimizer
                };
              });
            }
          }
          if (engine.events) {
            engine.events.on("store:create", (storeOptions) => {
              const options2 = {
                ...storeOptions,
                type: storeOptions.type || StoreFactory.StoreType.FUNCTIONAL
              };
              return storeFactory.createStore(options2);
            });
            engine.events.on("store:destroy", (_storeName) => {
            });
          }
          if (enablePerformanceMonitoring && engine.performance) {
            engine.performance.mark("store-plugin-installed");
          }
        }
      } catch (error) {
        console.error("[Store Plugin] Failed to install store plugin:", error);
        throw error;
      }
    },
    async uninstall(context) {
      try {
        const engine = context.engine || context;
        if (engine?.state) {
          engine.state.delete("pinia");
          engine.state.delete("storeFactory");
          engine.state.delete("storePerformanceOptimizer");
        }
        if (engine?.events) {
          engine.events.off("store:create");
          engine.events.off("store:destroy");
        }
      } catch (error) {
        console.error("[Store Plugin] Failed to uninstall store plugin:", error);
        throw error;
      }
    }
  };
}
function createDefaultStoreEnginePlugin() {
  return createStoreEnginePlugin(defaultConfig);
}
function createPerformanceStoreEnginePlugin(options) {
  return createStoreEnginePlugin({
    ...defaultConfig,
    enablePerformanceMonitoring: true,
    storeConfig: {
      ...defaultConfig.storeConfig,
      enablePerformanceOptimization: true,
      enablePersistence: true
    },
    ...options
  });
}
function createDebugStoreEnginePlugin(options) {
  return createStoreEnginePlugin({
    ...defaultConfig,
    debug: true,
    enablePerformanceMonitoring: true,
    storeConfig: {
      ...defaultConfig.storeConfig,
      debug: true
    },
    ...options
  });
}

exports.createDebugStoreEnginePlugin = createDebugStoreEnginePlugin;
exports.createDefaultStoreEnginePlugin = createDefaultStoreEnginePlugin;
exports.createPerformanceStoreEnginePlugin = createPerformanceStoreEnginePlugin;
exports.createStoreEnginePlugin = createStoreEnginePlugin;
exports.default = createStoreEnginePlugin;
//# sourceMappingURL=plugin.cjs.map
