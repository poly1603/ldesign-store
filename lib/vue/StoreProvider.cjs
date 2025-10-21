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
var provider = require('../types/provider.cjs');

const StoreProvider = vue.defineComponent({
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
    const pinia$1 = props.pinia || pinia.createPinia();
    const stores = vue.reactive(/* @__PURE__ */ new Map());
    const instances = vue.reactive(/* @__PURE__ */ new Map());
    const cleanupFunctions = vue.ref([]);
    Object.entries(props.stores).forEach(([id, storeFactory]) => {
      stores.set(id, {
        id,
        factory: storeFactory,
        singleton: true,
        lazy: false
      });
    });
    const context = {
      pinia: pinia$1,
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
    vue.provide(provider.STORE_PROVIDER_KEY, context);
    vue.onUnmounted(() => {
      context.cleanup();
    });
    return () => {
      return vue.h("div", { class: "store-provider" }, slots.default?.());
    };
  }
});
function useStoreProvider() {
  const context = vue.inject(provider.STORE_PROVIDER_KEY);
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
      const pinia$1 = options.pinia || pinia.createPinia();
      app.use(pinia$1);
      const stores = vue.reactive(/* @__PURE__ */ new Map());
      const instances = vue.reactive(/* @__PURE__ */ new Map());
      const globalContext = {
        pinia: pinia$1,
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
      app.provide(provider.STORE_PROVIDER_KEY, globalContext);
      app.config.globalProperties.$stores = globalContext;
    }
  };
}

exports.StoreProvider = StoreProvider;
exports.createStoreProviderPlugin = createStoreProviderPlugin;
exports.useStoreProvider = useStoreProvider;
exports.useStoreRegistration = useStoreRegistration;
//# sourceMappingURL=StoreProvider.cjs.map
