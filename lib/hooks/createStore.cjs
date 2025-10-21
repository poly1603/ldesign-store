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
var vue = require('vue');

function createStore(id, setup) {
  const storeDefinition = pinia.defineStore(id, () => {
    const { state, actions, getters } = setup();
    const reactiveState = vue.reactive(state);
    const computedGetters = {};
    Object.entries(getters).forEach(([key, getter]) => {
      if (typeof getter === "function") {
        computedGetters[key] = vue.computed(() => getter(reactiveState));
      }
    });
    return {
      ...reactiveState,
      ...actions,
      ...computedGetters
    };
  });
  return function useCreatedStore() {
    const store = storeDefinition();
    const state = vue.ref(store.$state);
    vue.watch(() => store.$state, (newState) => {
      state.value = newState;
    }, { deep: true, immediate: true });
    return {
      $id: store.$id,
      $state: store.$state,
      $actions: {},
      // 从 store 中提取
      $getters: {},
      // 从 store 中提取
      $reset: () => store.$reset(),
      $patch: (partialStateOrMutator) => {
        if (typeof partialStateOrMutator === "function") {
          store.$patch(partialStateOrMutator);
        } else {
          store.$patch((state2) => {
            Object.assign(state2, partialStateOrMutator);
          });
        }
      },
      $subscribe: (callback) => store.$subscribe(callback),
      $onAction: (callback) => store.$onAction(callback),
      // 生命周期方法
      $dispose: () => {
      },
      // 工具方法
      getStore: () => store,
      getStoreDefinition: () => void 0,
      // Hook 特有的属性
      state,
      getters: {},
      // 计算属性
      actions: {}
      // 方法
    };
  };
}
function createState(initialValue) {
  return function useState() {
    const value = vue.ref(initialValue);
    const setValue = (newValue) => {
      if (typeof newValue === "function") {
        value.value = newValue(value.value);
      } else {
        value.value = newValue;
      }
    };
    const reset = () => {
      value.value = initialValue;
    };
    return {
      value,
      setValue,
      reset
    };
  };
}
function createComputed(getter) {
  return function useComputed() {
    const value = vue.computed(getter);
    const refresh = () => {
    };
    return {
      value,
      refresh
    };
  };
}
function createAsyncAction(action) {
  return function useAsyncAction() {
    const loading = vue.ref(false);
    const error = vue.ref(null);
    const data = vue.shallowRef(null);
    const execute = async (...args) => {
      loading.value = true;
      error.value = null;
      try {
        const result = await action(...args);
        data.value = result;
        return result;
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err));
        throw err;
      } finally {
        loading.value = false;
      }
    };
    const reset = () => {
      loading.value = false;
      error.value = null;
      data.value = null;
    };
    return {
      execute,
      loading,
      error,
      data,
      reset
    };
  };
}
function createPersistedState(key, initialValue, storage = localStorage) {
  return function usePersistedState() {
    const value = vue.ref(initialValue);
    const load = () => {
      try {
        const stored = storage.getItem(key);
        if (stored !== null) {
          value.value = JSON.parse(stored);
        }
      } catch (error) {
        console.error("Failed to load persisted state:", error);
      }
    };
    const save = () => {
      try {
        storage.setItem(key, JSON.stringify(value.value));
      } catch (error) {
        console.error("Failed to save persisted state:", error);
      }
    };
    const clear = () => {
      try {
        storage.removeItem(key);
        value.value = initialValue;
      } catch (error) {
        console.error("Failed to clear persisted state:", error);
      }
    };
    const setValue = (newValue) => {
      if (typeof newValue === "function") {
        value.value = newValue(value.value);
      } else {
        value.value = newValue;
      }
      save();
    };
    const reset = () => {
      value.value = initialValue;
      save();
    };
    vue.watch(value, save, { deep: true });
    load();
    return {
      value,
      setValue,
      reset,
      save,
      load,
      clear
    };
  };
}

exports.createAsyncAction = createAsyncAction;
exports.createComputed = createComputed;
exports.createPersistedState = createPersistedState;
exports.createState = createState;
exports.createStore = createStore;
//# sourceMappingURL=createStore.cjs.map
