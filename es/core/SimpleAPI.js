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
import { reactive, computed, ref, watch, watchEffect } from 'vue';
import { batchUpdate } from './ReactiveSystem.js';

class StoreBuilder {
  constructor(id) {
    this.state = {};
    this.getters = {};
    this.actions = {};
    this.persist = false;
    this.devtools = true;
    this.plugins = [];
    this.id = id;
  }
  /**
   * 添加状态
   */
  useState(key, initialValue) {
    const value = typeof initialValue === "function" ? initialValue() : initialValue;
    this.state[key] = value;
    return this;
  }
  /**
   * 批量添加状态
   */
  useStates(states) {
    const stateObj = typeof states === "function" ? states() : states;
    Object.assign(this.state, stateObj);
    return this;
  }
  /**
   * 添加计算属性
   */
  useComputed(key, getter) {
    this.getters[key] = getter;
    return this;
  }
  /**
   * 批量添加计算属性
   */
  useComputeds(getters) {
    Object.assign(this.getters, getters);
    return this;
  }
  /**
   * 添加方法
   */
  useAction(key, action) {
    this.actions[key] = action;
    return this;
  }
  /**
   * 批量添加方法
   */
  useActions(actions) {
    Object.assign(this.actions, actions);
    return this;
  }
  /**
   * 启用持久化
   */
  usePersist(options) {
    this.persist = options ?? true;
    return this;
  }
  /**
   * 配置开发工具
   */
  useDevtools(options) {
    this.devtools = options ?? true;
    return this;
  }
  /**
   * 添加插件
   */
  usePlugin(plugin) {
    this.plugins.push(plugin);
    return this;
  }
  /**
   * 构建Store
   */
  build() {
    const store2 = createSimpleStore(this.id, {
      state: this.state,
      getters: this.getters,
      actions: this.actions,
      persist: this.persist,
      devtools: this.devtools,
      plugins: this.plugins
    });
    return store2;
  }
}
function createSimpleStore(id, options) {
  const state = reactive(typeof options.state === "function" ? options.state() : options.state);
  const initialState = typeof structuredClone !== "undefined" ? structuredClone(state) : JSON.parse(JSON.stringify(state));
  const getters = {};
  if (options.getters) {
    for (const [key, getter] of Object.entries(options.getters)) {
      getters[key] = computed(() => getter(state));
    }
  }
  const actions = {};
  if (options.actions) {
    for (const [key, action] of Object.entries(options.actions)) {
      actions[key] = action.bind({
        ...Object.fromEntries(Object.entries(state)),
        ...getters,
        ...actions
      });
    }
  }
  const subscriptions = /* @__PURE__ */ new Set();
  const actionSubscriptions = /* @__PURE__ */ new Set();
  const store2 = {
    state,
    getters,
    actions,
    // 重置状态
    $reset() {
      batchUpdate(() => {
        Object.assign(state, initialState);
      });
    },
    // 修改状态
    $patch(patch) {
      batchUpdate(() => {
        if (typeof patch === "function") {
          patch(state);
        } else {
          Object.assign(state, patch);
        }
      });
    },
    // 订阅状态变化
    $subscribe(callback) {
      subscriptions.add(callback);
      const unwatch = watchEffect(() => {
        callback({ type: "direct" }, state);
      });
      return () => {
        subscriptions.delete(callback);
        unwatch();
      };
    },
    // 订阅动作
    $onAction(callback) {
      actionSubscriptions.add(callback);
      return () => {
        actionSubscriptions.delete(callback);
      };
    },
    // 销毁Store
    $dispose() {
      subscriptions.clear();
      actionSubscriptions.clear();
    },
    // 获取状态值
    get(key) {
      return state[key];
    },
    // 设置状态值
    set(key, value) {
      state[key] = value;
    },
    // 更新状态值
    update(key, updater) {
      state[key] = updater(state[key]);
    },
    // 监听特定值
    watch(source, callback) {
      return watch(source, callback);
    },
    // 监听所有状态
    watchAll(callback) {
      return watch(() => state, callback, { deep: true });
    },
    // 批量更新
    batch(updater) {
      batchUpdate(updater);
    },
    // 事务操作
    async transaction(updater) {
      const snapshot = this.snapshot();
      try {
        await updater();
      } catch (error) {
        this.restore(snapshot);
        throw error;
      }
    },
    // 创建快照
    snapshot() {
      return typeof structuredClone !== "undefined" ? structuredClone(state) : JSON.parse(JSON.stringify(state));
    },
    // 恢复快照
    restore(snapshot) {
      batchUpdate(() => {
        Object.assign(state, snapshot);
      });
    },
    // 导出状态
    export() {
      return JSON.stringify(state);
    },
    // 导入状态
    import(data) {
      const imported = JSON.parse(data);
      batchUpdate(() => {
        Object.assign(state, imported);
      });
    }
  };
  if (options.persist) {
    applyPersistence(store2, options.persist === true ? {} : options.persist);
  }
  if (options.devtools) {
    applyDevtools(store2, options.devtools === true ? {} : options.devtools);
  }
  if (options.plugins) {
    options.plugins.forEach((plugin) => plugin.install(store2));
  }
  return store2;
}
function applyPersistence(store2, options) {
  const key = options.key || "store";
  const storage = options.storage || localStorage;
  const paths = options.paths;
  const serializer = options.serializer || {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  };
  try {
    const saved = storage.getItem(key);
    if (saved) {
      const data = serializer.deserialize(saved);
      if (paths) {
        paths.forEach((path) => {
          const keys = path.split(".");
          let target = store2.state;
          let source = data;
          for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]];
            source = source?.[keys[i]];
          }
          if (source && keys.length > 0) {
            target[keys[keys.length - 1]] = source[keys[keys.length - 1]];
          }
        });
      } else {
        Object.assign(store2.state, data);
      }
    }
  } catch (error) {
    console.error("Failed to restore state:", error);
  }
  let saveTimeout = null;
  const debouncedSave = () => {
    if (saveTimeout)
      clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        let dataToSave = store2.state;
        if (paths) {
          dataToSave = {};
          paths.forEach((path) => {
            const keys = path.split(".");
            let source = store2.state;
            let target = dataToSave;
            for (let i = 0; i < keys.length - 1; i++) {
              source = source[keys[i]];
              if (!target[keys[i]]) {
                target[keys[i]] = {};
              }
              target = target[keys[i]];
            }
            if (keys.length > 0) {
              target[keys[keys.length - 1]] = source[keys[keys.length - 1]];
            }
          });
        }
        storage.setItem(key, serializer.serialize(dataToSave));
      } catch (error) {
        console.error("Failed to persist state:", error);
      }
    }, 300);
  };
  store2.$subscribe(debouncedSave);
}
function applyDevtools(_store, _options) {
}
function store(id) {
  return new StoreBuilder(id);
}
function defineSimpleStore(id, setup) {
  return defineStore(id, setup);
}
function inferStoreType(store2) {
  return store2;
}
function combineStores(stores) {
  const combined = {
    stores,
    // 获取所有状态
    get state() {
      const result = {};
      for (const [key, store2] of Object.entries(stores)) {
        result[key] = store2.state;
      }
      return result;
    },
    // 重置所有Store
    resetAll() {
      Object.values(stores).forEach((store2) => store2.$reset());
    },
    // 批量操作
    batch(updater) {
      batchUpdate(updater);
    },
    // 创建快照
    snapshot() {
      const result = {};
      for (const [key, store2] of Object.entries(stores)) {
        result[key] = store2.snapshot();
      }
      return result;
    },
    // 恢复快照
    restore(snapshot) {
      batchUpdate(() => {
        for (const [key, store2] of Object.entries(stores)) {
          if (snapshot[key]) {
            store2.restore(snapshot[key]);
          }
        }
      });
    }
  };
  return combined;
}
function createAsyncStore(id, loader) {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);
  const load = async () => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await loader();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };
  const reload = () => load();
  const reset = () => {
    loading.value = false;
    error.value = null;
    data.value = null;
  };
  return {
    loading,
    error,
    data,
    load,
    reload,
    reset
  };
}
class SimpleStoreRegistry {
  constructor() {
    this.stores = /* @__PURE__ */ new Map();
  }
  /**
   * 注册Store
   */
  register(id, factory) {
    this.stores.set(id, factory);
  }
  /**
   * 获取Store
   */
  get(id) {
    const factory = this.stores.get(id);
    if (!factory) {
      throw new Error(`Store "${id}" not found`);
    }
    return factory();
  }
  /**
   * 检查是否存在
   */
  has(id) {
    return this.stores.has(id);
  }
  /**
   * 清空所有Store
   */
  clear() {
    this.stores.clear();
  }
}
const storeRegistry = new SimpleStoreRegistry();

export { store as $, SimpleStoreRegistry, StoreBuilder, combineStores, createAsyncStore, createSimpleStore, defineSimpleStore, inferStoreType, store, storeRegistry };
//# sourceMappingURL=SimpleAPI.js.map
