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

var pinia = require('pinia');

function createSimpleStore(options) {
  const { id, state, actions = {}, getters = {}, persist, persistKey, persistStorage } = options;
  const useStore = pinia.defineStore(id, {
    state: typeof state === "function" ? state : () => state || {},
    actions,
    getters
  });
  if (persist) {
    const originalUseStore = useStore;
    const enhancedUseStore = () => {
      const store = originalUseStore();
      if (!store.$persist) {
        const storageKey = persistKey || `store:${id}`;
        const storage = persistStorage || localStorage;
        store.$persist = {
          save() {
            try {
              const serialized = JSON.stringify(store.$state);
              storage.setItem(storageKey, serialized);
            } catch (error) {
              console.error("Failed to save store state:", error);
            }
          },
          load() {
            try {
              const serialized = storage.getItem(storageKey);
              if (serialized && serialized !== "undefined" && serialized !== "null") {
                const parsed = JSON.parse(serialized);
                store.$patch(parsed);
              }
            } catch (error) {
              console.error("Failed to load store state:", error);
            }
          },
          clear() {
            try {
              storage.removeItem(storageKey);
            } catch (error) {
              console.error("Failed to clear store state:", error);
            }
          }
        };
        store.$persist.load();
      }
      return store;
    };
    return enhancedUseStore;
  }
  return useStore;
}
class StoreManager {
  constructor() {
    this.stores = /* @__PURE__ */ new Map();
    this.instances = /* @__PURE__ */ new Map();
  }
  /**
   * 注册 Store
   */
  register(id, storeFactory) {
    this.stores.set(id, storeFactory);
  }
  /**
   * 获取 Store 实例
   */
  get(id) {
    if (this.instances.has(id)) {
      return this.instances.get(id);
    }
    const factory = this.stores.get(id);
    if (factory) {
      const instance = factory();
      this.instances.set(id, instance);
      return instance;
    }
    console.warn(`Store "${id}" not found`);
    return void 0;
  }
  /**
   * 销毁 Store 实例
   */
  destroy(id) {
    this.instances.delete(id);
  }
  /**
   * 清理所有 Store
   */
  clear() {
    this.instances.clear();
  }
  /**
   * 获取所有注册的 Store ID
   */
  getRegisteredIds() {
    return Array.from(this.stores.keys());
  }
  /**
   * 获取所有活跃的 Store ID
   */
  getActiveIds() {
    return Array.from(this.instances.keys());
  }
}
const globalStoreManager = new StoreManager();
function createAutoStorePlugin(stores) {
  return {
    install(app) {
      Object.entries(stores).forEach(([id, factory]) => {
        globalStoreManager.register(id, factory);
      });
      app.config.globalProperties.$storeManager = globalStoreManager;
    }
  };
}
function createStores(definitions) {
  const stores = {};
  Object.entries(definitions).forEach(([id, options]) => {
    stores[id] = createSimpleStore({ ...options, id });
  });
  return stores;
}
function createReactiveStore(id, initialState, options = {}) {
  return createSimpleStore({
    id,
    state: () => initialState,
    actions: options.actions || {},
    getters: options.getters || {},
    persist: options.persist
  });
}

exports.StoreManager = StoreManager;
exports.createAutoStorePlugin = createAutoStorePlugin;
exports.createReactiveStore = createReactiveStore;
exports.createSimpleStore = createSimpleStore;
exports.createStores = createStores;
exports.globalStoreManager = globalStoreManager;
//# sourceMappingURL=helpers.cjs.map
