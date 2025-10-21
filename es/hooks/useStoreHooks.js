/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref, shallowRef, watch, computed, onUnmounted } from 'vue';

function useStoreHook(store) {
  const state = ref(store.$state);
  const unsubscribe = store.$subscribe((_mutation, newState) => {
    state.value = newState;
  });
  const cleanup = () => {
    unsubscribe();
  };
  onUnmounted(cleanup);
  return {
    store,
    state,
    reset: () => store.$reset(),
    patch: (partialState) => store.$patch(partialState),
    subscribe: (callback) => store.$subscribe(callback),
    onAction: (callback) => store.$onAction(callback),
    cleanup
    // 手动清理函数
  };
}
function useSelector(store, selector) {
  return computed(() => selector(store.$state));
}
function useStateWatch(store, callback, options) {
  const stopWatcher = watch(() => store.$state, callback, {
    deep: options?.deep ?? true,
    immediate: options?.immediate ?? false
  });
  onUnmounted(() => {
    stopWatcher();
  });
  return stopWatcher;
}
function useActionState(action) {
  const loading = ref(false);
  const error = ref(null);
  const data = shallowRef(null);
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
}
function useDebounce(value, delay) {
  const debouncedValue = ref(value.value);
  watch(value, (newValue) => {
    const timer = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
    return () => clearTimeout(timer);
  });
  return computed(() => debouncedValue.value);
}
function useThrottle(value, interval) {
  const throttledValue = ref(value.value);
  let lastUpdate = 0;
  watch(value, (newValue) => {
    const now = Date.now();
    if (now - lastUpdate >= interval) {
      throttledValue.value = newValue;
      lastUpdate = now;
    }
  });
  return computed(() => throttledValue.value);
}
function useLocalStorage(key, defaultValue) {
  const value = ref(defaultValue);
  const save = () => {
    try {
      localStorage.setItem(key, JSON.stringify(value.value));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  };
  const load = () => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        value.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      value.value = defaultValue;
    }
  };
  const remove = () => {
    try {
      localStorage.removeItem(key);
      value.value = defaultValue;
    } catch (error) {
      console.error("Failed to remove from localStorage:", error);
    }
  };
  watch(value, save, { deep: true });
  load();
  return {
    value,
    save,
    load,
    remove
  };
}
function useSessionStorage(key, defaultValue) {
  const value = ref(defaultValue);
  const save = () => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value.value));
    } catch (error) {
      console.error("Failed to save to sessionStorage:", error);
    }
  };
  const load = () => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored !== null) {
        value.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load from sessionStorage:", error);
      value.value = defaultValue;
    }
  };
  const remove = () => {
    try {
      sessionStorage.removeItem(key);
      value.value = defaultValue;
    } catch (error) {
      console.error("Failed to remove from sessionStorage:", error);
    }
  };
  watch(value, save, { deep: true });
  load();
  return {
    value,
    save,
    load,
    remove
  };
}

export { useActionState, useDebounce, useLocalStorage, useSelector, useSessionStorage, useStateWatch, useStoreHook, useThrottle };
//# sourceMappingURL=useStoreHooks.js.map
