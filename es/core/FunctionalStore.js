/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineStore as defineStore$1 } from 'pinia';
import { PerformanceOptimizer } from './PerformanceOptimizer.js';

function createFunctionalStore(options) {
  const optimizer = new PerformanceOptimizer({
    cache: options.cache,
    // 缓存配置选项
    // 处理持久化配置，确保类型正确
    persistence: typeof options.persist === "object" ? options.persist : void 0
  });
  const storeDefinition = defineStore$1(options.id, {
    state: options.state,
    actions: options.actions || {},
    getters: options.getters || {}
  });
  return () => {
    const store = storeDefinition();
    const cleanupFunctions = [];
    if (options.persist) {
      const persistedState = optimizer.persistence.load(options.id);
      if (persistedState) {
        store.$patch(persistedState);
      }
    }
    const instance = {
      $id: options.id,
      get $state() {
        return store.$state;
      },
      get $actions() {
        return options.actions || {};
      },
      get $getters() {
        return options.getters || {};
      },
      $reset() {
        store.$reset();
      },
      $patch(partialStateOrMutator) {
        if (typeof partialStateOrMutator === "function") {
          store.$patch(partialStateOrMutator);
        } else {
          store.$patch(partialStateOrMutator);
        }
      },
      $subscribe(callback, subscribeOptions) {
        const unsubscribe = store.$subscribe(callback, subscribeOptions);
        if (!subscribeOptions?.detached) {
          cleanupFunctions.push(unsubscribe);
        }
        return unsubscribe;
      },
      $onAction(callback) {
        const unsubscribe = store.$onAction(callback);
        cleanupFunctions.push(unsubscribe);
        return unsubscribe;
      },
      $dispose() {
        cleanupFunctions.forEach((cleanup) => cleanup());
        cleanupFunctions.length = 0;
        optimizer.dispose();
      },
      $persist() {
        if (options.persist) {
          optimizer.persistence.save(options.id, store.$state);
        }
      },
      $hydrate() {
        if (options.persist) {
          const persistedState = optimizer.persistence.load(options.id);
          if (persistedState) {
            store.$patch(persistedState);
          }
        }
      },
      $clearPersisted() {
        optimizer.persistence.remove(options.id);
      },
      $getCache(key) {
        return optimizer.cache.get(`${options.id}:${key}`);
      },
      $setCache(key, value, ttl) {
        optimizer.cache.set(`${options.id}:${key}`, value, ttl);
      },
      $deleteCache(key) {
        return optimizer.cache.delete(`${options.id}:${key}`);
      },
      $clearCache() {
        optimizer.cache.clear();
      },
      getStore() {
        return store;
      },
      getStoreDefinition() {
        return storeDefinition;
      }
    };
    return instance;
  };
}
function defineStore(id, state, actions, getters) {
  return createFunctionalStore({
    id,
    state,
    actions,
    getters
  });
}
function defineStoreWithOptions(options) {
  return createFunctionalStore(options);
}

export { createFunctionalStore, defineStore, defineStoreWithOptions };
//# sourceMappingURL=FunctionalStore.js.map
