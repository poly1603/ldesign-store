/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { createPinia } from 'pinia';
import { defineComponent, reactive, ref, provide, onUnmounted, h, inject } from 'vue';
import { STORE_PROVIDER_KEY } from '../types/provider.js';

const StoreProvider = defineComponent({
  name: "StoreProvider",
  props: {
    /** Pinia 实例 */
    pinia: {
      type: Object,
      default: void 0
    },
    /** 预定义的 Store */
    stores: {
      type: Object,
      default: () => ({})
    },
    /** 是否全局注册 */
    global: {
      type: Boolean,
      default: false
    },
    /** 是否启用开发工具 */
    devtools: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { slots }) {
    const pinia = props.pinia || createPinia();
    const stores = reactive(/* @__PURE__ */ new Map());
    const instances = reactive(/* @__PURE__ */ new Map());
    const cleanupFunctions = ref([]);
    Object.entries(props.stores).forEach(([id, storeFactory]) => {
      stores.set(id, {
        id,
        factory: storeFactory,
        singleton: true,
        lazy: false
      });
    });
    const context = {
      pinia,
      stores,
      instances,
      register(id, registration) {
        stores.set(id, registration);
        if (!registration.lazy) {
          this.createStore(id);
        }
      },
      getStore(id) {
        if (instances.has(id)) {
          return instances.get(id);
        }
        return this.createStore(id);
      },
      createStore(id) {
        const registration = stores.get(id);
        if (!registration) {
          console.warn(`Store "${id}" is not registered`);
          return void 0;
        }
        try {
          const store = registration.factory();
          if (registration.singleton) {
            instances.set(id, store);
          }
          return store;
        } catch (error) {
          console.error(`Failed to create store "${id}":`, error);
          return void 0;
        }
      },
      destroyStore(id) {
        instances.delete(id);
      },
      cleanup() {
        instances.clear();
        cleanupFunctions.value.forEach((cleanup) => cleanup());
        cleanupFunctions.value = [];
      }
    };
    provide(STORE_PROVIDER_KEY, context);
    onUnmounted(() => {
      context.cleanup();
    });
    return () => {
      return h("div", { class: "store-provider" }, slots.default?.());
    };
  }
});
function useStoreProvider() {
  const context = inject(STORE_PROVIDER_KEY);
  if (!context) {
    throw new Error("useStoreProvider must be used within a StoreProvider");
  }
  return context;
}
function useStoreRegistration() {
  const context = useStoreProvider();
  return {
    register: context.register.bind(context),
    getStore: context.getStore.bind(context),
    createStore: context.createStore.bind(context),
    destroyStore: context.destroyStore.bind(context)
  };
}
function createStoreProviderPlugin(options = {}) {
  return {
    install(app) {
      const pinia = options.pinia || createPinia();
      app.use(pinia);
      const stores = reactive(/* @__PURE__ */ new Map());
      const instances = reactive(/* @__PURE__ */ new Map());
      const globalContext = {
        pinia,
        stores,
        instances,
        register(id, registration) {
          stores.set(id, registration);
          if (!registration.lazy) {
            this.createStore(id);
          }
        },
        getStore(id) {
          if (instances.has(id)) {
            return instances.get(id);
          }
          return this.createStore(id);
        },
        createStore(id) {
          const registration = stores.get(id);
          if (!registration) {
            console.warn(`Store "${id}" is not registered`);
            return void 0;
          }
          try {
            const store = registration.factory();
            if (registration.singleton) {
              instances.set(id, store);
            }
            return store;
          } catch (error) {
            console.error(`Failed to create store "${id}":`, error);
            return void 0;
          }
        },
        destroyStore(id) {
          instances.delete(id);
        },
        cleanup() {
          instances.clear();
        }
      };
      if (options.stores) {
        Object.entries(options.stores).forEach(([id, storeFactory]) => {
          globalContext.register(id, {
            id,
            factory: storeFactory,
            singleton: true,
            lazy: false
          });
        });
      }
      app.provide(STORE_PROVIDER_KEY, globalContext);
      app.config.globalProperties.$stores = globalContext;
    }
  };
}

export { StoreProvider, createStoreProviderPlugin, useStoreProvider, useStoreRegistration };
//# sourceMappingURL=StoreProvider.js.map
