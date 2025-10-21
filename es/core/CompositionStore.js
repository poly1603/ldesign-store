/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineStore } from 'pinia';
import { watch, reactive, computed, ref, onUnmounted } from 'vue';
import { PerformanceOptimizer } from './PerformanceOptimizer.js';

function createCompositionStore(options, setup) {
  const optimizer = new PerformanceOptimizer({
    cache: options.cache,
    persistence: typeof options.persist === "object" ? options.persist : void 0
  });
  const stateCache = /* @__PURE__ */ new WeakMap();
  let initialStateCopy = null;
  const storeDefinition = defineStore(options.id, () => {
    const context = {
      // 创建响应式状态，使用 ref 包装
      state: (initialValue) => ref(initialValue),
      // 创建计算属性，使用 computed 包装
      computed: (getter) => computed(getter),
      // 创建响应式对象，使用 reactive 包装
      reactive: (obj) => reactive(obj),
      // 提供 watch 功能
      watch,
      // 提供生命周期钩子，同时添加到清理函数列表
      onUnmounted: (fn) => {
        onUnmounted(fn);
      },
      cache: {
        get: (key) => optimizer.cache.get(`${options.id}:${key}`),
        set: (key, value, ttl) => optimizer.cache.set(`${options.id}:${key}`, value, ttl),
        delete: (key) => optimizer.cache.delete(`${options.id}:${key}`),
        clear: () => optimizer.cache.clear()
      },
      persist: {
        save: () => {
          const currentState = storeDefinition().$state;
          optimizer.persistence.save(options.id, currentState);
        },
        load: () => {
          const persistedState = optimizer.persistence.load(options.id);
          if (persistedState) {
            const currentState = storeDefinition().$state;
            if (typeof currentState === "object" && currentState !== null) {
              Object.assign(currentState, persistedState);
            }
          }
        },
        clear: () => optimizer.persistence.remove(options.id)
      }
    };
    const storeState = setup(context);
    if (!initialStateCopy && typeof storeState === "object" && storeState !== null) {
      initialStateCopy = JSON.parse(JSON.stringify(storeState));
    }
    stateCache.set(storeDefinition, { initial: initialStateCopy, current: storeState });
    if (options.persist) {
      const persistedState = optimizer.persistence.load(options.id);
      if (persistedState && typeof storeState === "object" && storeState !== null) {
        Object.assign(storeState, persistedState);
      }
    }
    return storeState;
  });
  return () => {
    const store = storeDefinition();
    const cleanupFunctions = [];
    const instance = {
      $id: options.id,
      get $state() {
        const cached = stateCache.get(storeDefinition);
        return cached?.current || {};
      },
      $reset() {
        const cached = stateCache.get(storeDefinition);
        if (cached?.initial && typeof cached.initial === "object") {
          const resetState = JSON.parse(JSON.stringify(cached.initial));
          Object.assign(store.$state, resetState);
          cached.current = resetState;
        }
      },
      $patch(partialStateOrMutator) {
        const cached = stateCache.get(storeDefinition);
        if (typeof partialStateOrMutator === "function") {
          store.$patch(partialStateOrMutator);
          if (cached?.current) {
            partialStateOrMutator(cached.current);
          }
        } else {
          store.$patch(partialStateOrMutator);
          if (cached?.current && typeof cached.current === "object") {
            Object.assign(cached.current, partialStateOrMutator);
          }
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
          optimizer.persistence.save(options.id, instance.$state);
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
function defineCompositionStore(id, setup) {
  return createCompositionStore({ id }, setup);
}
function defineCompositionStoreWithOptions(options, setup) {
  return createCompositionStore(options, setup);
}

export { createCompositionStore, defineCompositionStore, defineCompositionStoreWithOptions };
//# sourceMappingURL=CompositionStore.js.map
