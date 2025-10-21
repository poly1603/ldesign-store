/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { globalStoreManager } from './helpers.js';

const vStore = {
  mounted(el, binding) {
    const { value, arg, modifiers } = binding;
    if (!arg) {
      console.warn("v-store directive requires a store ID as argument");
      return;
    }
    const storeId = arg;
    const store = globalStoreManager.get(storeId);
    if (!store) {
      console.warn(`Store "${storeId}" not found`);
      return;
    }
    if (modifiers.text) {
      const stateKey = value;
      if (stateKey && store.$state[stateKey] !== void 0) {
        el.textContent = String(store.$state[stateKey]);
        const unsubscribe = store.$subscribe(() => {
          el.textContent = String(store.$state[stateKey]);
        });
        el.__vStoreCleanup = unsubscribe;
      }
    } else if (modifiers.html) {
      const stateKey = value;
      if (stateKey && store.$state[stateKey] !== void 0) {
        el.innerHTML = String(store.$state[stateKey]);
        const unsubscribe = store.$subscribe(() => {
          el.innerHTML = String(store.$state[stateKey]);
        });
        el.__vStoreCleanup = unsubscribe;
      }
    } else if (modifiers.class) {
      const classMap = value;
      if (typeof classMap === "object") {
        const updateClasses = () => {
          Object.entries(classMap).forEach(([stateKey, className]) => {
            const hasClass = Boolean(store.$state[stateKey]);
            el.classList.toggle(className, hasClass);
          });
        };
        updateClasses();
        const unsubscribe = store.$subscribe(updateClasses);
        el.__vStoreCleanup = unsubscribe;
      }
    } else if (modifiers.style) {
      const styleMap = value;
      if (typeof styleMap === "object") {
        const updateStyles = () => {
          Object.entries(styleMap).forEach(([stateKey, styleProp]) => {
            const styleValue = store.$state[stateKey];
            el.style[styleProp] = styleValue;
          });
        };
        updateStyles();
        const unsubscribe = store.$subscribe(updateStyles);
        el.__vStoreCleanup = unsubscribe;
      }
    } else {
      el.__storeState = store.$state;
      const unsubscribe = store.$subscribe(() => {
        el.__storeState = store.$state;
      });
      el.__vStoreCleanup = unsubscribe;
    }
  },
  unmounted(el) {
    const cleanup = el.__vStoreCleanup;
    if (cleanup) {
      cleanup();
      delete el.__vStoreCleanup;
    }
    delete el.__storeState;
  }
};
const vAction = {
  mounted(el, binding) {
    const { value, arg, modifiers } = binding;
    if (!arg) {
      console.warn("v-action directive requires a store ID as argument");
      return;
    }
    const [storeId, actionName] = arg.split(".");
    if (!storeId || !actionName) {
      console.warn("v-action directive requires format: v-action:storeId.actionName");
      return;
    }
    const store = globalStoreManager.get(storeId);
    if (!store) {
      console.warn(`Store "${storeId}" not found`);
      return;
    }
    const action = store[actionName];
    if (typeof action !== "function") {
      console.warn(`Action "${actionName}" not found in store "${storeId}"`);
      return;
    }
    const eventType = modifiers.change ? "change" : modifiers.input ? "input" : modifiers.blur ? "blur" : modifiers.focus ? "focus" : "click";
    const handler = (event) => {
      try {
        if (value !== void 0) {
          action(value);
        } else if (modifiers.value && event.target) {
          const target = event.target;
          action(target.value);
        } else if (modifiers.prevent) {
          event.preventDefault();
          action(event);
        } else {
          action(event);
        }
      } catch (error) {
        console.error(`Error executing action "${actionName}":`, error);
      }
    };
    el.addEventListener(eventType, handler);
    el.__vActionCleanup = () => {
      el.removeEventListener(eventType, handler);
    };
  },
  unmounted(el) {
    const cleanup = el.__vActionCleanup;
    if (cleanup) {
      cleanup();
      delete el.__vActionCleanup;
    }
  }
};
const vLoading = {
  mounted(el, binding) {
    const { arg } = binding;
    if (!arg) {
      console.warn("v-loading directive requires a store ID as argument");
      return;
    }
    const storeId = arg;
    const store = globalStoreManager.get(storeId);
    if (!store) {
      console.warn(`Store "${storeId}" not found`);
      return;
    }
    const unsubscribe = store.$onAction(({ after, onError }) => {
      el.classList.add("loading");
      el.setAttribute("data-loading", "true");
      after(() => {
        el.classList.remove("loading");
        el.removeAttribute("data-loading");
      });
      onError(() => {
        el.classList.remove("loading");
        el.removeAttribute("data-loading");
      });
    });
    el.__vLoadingCleanup = unsubscribe;
  },
  unmounted(el) {
    const cleanup = el.__vLoadingCleanup;
    if (cleanup) {
      cleanup();
      delete el.__vLoadingCleanup;
    }
  }
};
function createStoreDirectivesPlugin() {
  return {
    install(app) {
      app.directive("store", vStore);
      app.directive("action", vAction);
      app.directive("loading", vLoading);
    }
  };
}
const storeDirectives = {
  store: vStore,
  action: vAction,
  loading: vLoading
};

export { createStoreDirectivesPlugin, storeDirectives, vAction, vLoading, vStore };
//# sourceMappingURL=directives.js.map
