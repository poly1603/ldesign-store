/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref, shallowRef, computed, watch, inject, onUnmounted } from 'vue';
import { STORE_PROVIDER_KEY } from '../types/provider.js';

function useStore(storeId, options = {}) {
  const context = inject(STORE_PROVIDER_KEY);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  const store = context.getStore(storeId);
  if (!store) {
    throw new Error(`Store "${storeId}" not found`);
  }
  const state = ref(store.$state);
  const unsubscribe = store.$subscribe((_mutation, newState) => {
    state.value = newState;
  });
  const cleanup = () => {
    unsubscribe();
  };
  if (options.autoCleanup !== false) {
    onUnmounted(cleanup);
  }
  return {
    store,
    state,
    reset: () => store.$reset(),
    patch: (partialState) => store.$patch(partialState),
    subscribe: (callback) => store.$subscribe(callback),
    onAction: (callback) => store.$onAction(callback)
  };
}
function useState(storeId, stateKey, defaultValue) {
  const { store, state } = useStore(storeId);
  const value = computed({
    get: () => state.value[stateKey] ?? defaultValue,
    set: (newValue) => {
      store.$patch({ [stateKey]: newValue });
    }
  });
  return {
    value,
    setValue: (newValue) => {
      if (typeof newValue === "function") {
        value.value = newValue(value.value);
      } else {
        value.value = newValue;
      }
    },
    reset: () => {
      if (defaultValue !== void 0) {
        value.value = defaultValue;
      }
    }
  };
}
function useAction(storeId, actionName) {
  const { store } = useStore(storeId);
  const loading = ref(false);
  const error = ref(null);
  const data = shallowRef(null);
  const execute = async (...args) => {
    loading.value = true;
    error.value = null;
    try {
      const action = store[actionName];
      if (typeof action !== "function") {
        throw new TypeError(`Action "${actionName}" not found in store "${storeId}"`);
      }
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
}
function useGetter(storeId, getterName) {
  const { store } = useStore(storeId);
  const computing = ref(false);
  const value = computed(() => {
    computing.value = true;
    try {
      const getter = store[getterName];
      if (typeof getter === "function") {
        return getter();
      }
      return getter;
    } finally {
      computing.value = false;
    }
  });
  const refresh = () => {
    store.$patch({});
  };
  return {
    value,
    computing,
    refresh
  };
}
function useBatch(storeId) {
  const { store } = useStore(storeId);
  const isBatching = ref(false);
  let batchedUpdates = {};
  const startBatch = () => {
    isBatching.value = true;
    batchedUpdates = {};
  };
  const endBatch = () => {
    if (isBatching.value && Object.keys(batchedUpdates).length > 0) {
      store.$patch(batchedUpdates);
      batchedUpdates = {};
    }
    isBatching.value = false;
  };
  const originalPatch = store.$patch;
  store.$patch = (partialState) => {
    if (isBatching.value) {
      Object.assign(batchedUpdates, partialState);
    } else {
      originalPatch.call(store, partialState);
    }
  };
  return {
    startBatch,
    endBatch,
    isBatching
  };
}
function usePersist(storeId, key, storage = localStorage) {
  const { store, state } = useStore(storeId);
  const storageKey = key || `store:${storeId}`;
  const isPersisted = ref(false);
  const save = () => {
    try {
      const serialized = JSON.stringify(state.value);
      storage.setItem(storageKey, serialized);
      isPersisted.value = true;
    } catch (error) {
      console.error("Failed to save store state:", error);
      isPersisted.value = false;
    }
  };
  const load = () => {
    try {
      const serialized = storage.getItem(storageKey);
      if (serialized && serialized !== "undefined" && serialized !== "null") {
        const parsed = JSON.parse(serialized);
        store.$patch(parsed);
        isPersisted.value = true;
      }
    } catch (error) {
      console.error("Failed to load store state:", error);
      isPersisted.value = false;
    }
  };
  const clear = () => {
    try {
      storage.removeItem(storageKey);
      isPersisted.value = false;
    } catch (error) {
      console.error("Failed to clear store state:", error);
    }
  };
  watch(state, () => {
    save();
  }, { deep: true });
  load();
  return {
    save,
    load,
    clear,
    isPersisted
  };
}
function useSimpleStore(storeId, options = {}) {
  const storeHook = useStore(storeId, options);
  const persistHook = options.persist ? usePersist(storeId, options.persistKey, options.persistStorage) : null;
  return {
    ...storeHook,
    // 添加持久化方法（如果启用）
    ...persistHook && {
      save: persistHook.save,
      load: persistHook.load,
      clear: persistHook.clear,
      isPersisted: persistHook.isPersisted
    }
  };
}
function useReactiveState(storeId, stateKey, options = {}) {
  const baseHook = useState(storeId, stateKey, options.defaultValue);
  const isValid = ref(true);
  const error = ref(null);
  const originalSetValue = baseHook.setValue;
  const setValue = (newValue) => {
    const finalValue = typeof newValue === "function" ? newValue(baseHook.value.value) : newValue;
    if (options.validate && !options.validate(finalValue)) {
      isValid.value = false;
      error.value = `Invalid value for ${stateKey}`;
      return;
    }
    const transformedValue = options.transform ? options.transform(finalValue) : finalValue;
    isValid.value = true;
    error.value = null;
    originalSetValue(transformedValue);
  };
  return {
    ...baseHook,
    setValue,
    isValid,
    error
  };
}
function useAsyncAction(storeId, actionName, options = {}) {
  const baseHook = useAction(storeId, actionName);
  const isTimeout = ref(false);
  const retryCount = ref(0);
  let abortController = null;
  let timeoutId = null;
  const executeWithRetry = async (...args) => {
    retryCount.value = 0;
    isTimeout.value = false;
    const attempt = async () => {
      try {
        abortController = new AbortController();
        if (options.timeout) {
          timeoutId = setTimeout(() => {
            isTimeout.value = true;
            abortController?.abort();
          }, options.timeout);
        }
        const result = await baseHook.execute(...args);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        options.onSuccess?.(result);
        return result;
      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (isTimeout.value || abortController?.signal.aborted) {
          throw error;
        }
        if (options.retries && retryCount.value < options.retries) {
          retryCount.value++;
          if (options.retryDelay) {
            await new Promise((resolve) => setTimeout(resolve, options.retryDelay));
          }
          return attempt();
        }
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };
    return attempt();
  };
  const retry = async (...args) => {
    if (baseHook.loading.value) {
      throw new Error("Action is already running");
    }
    return executeWithRetry(...args);
  };
  const cancel = () => {
    if (abortController) {
      abortController.abort();
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  return {
    ...baseHook,
    execute: executeWithRetry,
    retry,
    cancel,
    isTimeout,
    retryCount
  };
}
function useComputed(storeId, getter, options = {}) {
  const { store } = useStore(storeId);
  let cachedValue;
  let cacheTimestamp = 0;
  const value = computed(() => {
    if (options.cache && cachedValue !== void 0) {
      const now = Date.now();
      if (!options.cacheTime || now - cacheTimestamp < options.cacheTime) {
        return cachedValue;
      }
    }
    const newValue = getter(store);
    if (options.cache) {
      cachedValue = newValue;
      cacheTimestamp = Date.now();
    }
    return newValue;
  });
  const invalidateCache = () => {
    cachedValue = void 0;
    cacheTimestamp = 0;
  };
  return {
    value,
    invalidateCache
  };
}

export { useAction, useAsyncAction, useBatch, useComputed, useGetter, usePersist, useReactiveState, useSimpleStore, useState, useStore };
//# sourceMappingURL=composables.js.map
