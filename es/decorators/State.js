/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { DECORATOR_METADATA_KEY } from '../types/decorators.js';
import 'reflect-metadata';

function State(options = {}) {
  return function(target, propertyKey) {
    if (typeof propertyKey === "symbol") {
      throw new TypeError("State decorator does not support symbol properties");
    }
    const existingMetadata = Reflect.getMetadata(DECORATOR_METADATA_KEY, target.constructor) || [];
    const newMetadata = {
      type: "state",
      key: propertyKey,
      options
    };
    const existingIndex = existingMetadata.findIndex((meta) => meta.type === "state" && meta.key === propertyKey);
    if (existingIndex >= 0) {
      existingMetadata[existingIndex] = newMetadata;
    } else {
      existingMetadata.push(newMetadata);
    }
    Reflect.defineMetadata(DECORATOR_METADATA_KEY, existingMetadata, target.constructor);
    const descriptor = {
      get() {
        if (this._store) {
          return this._store.$state[propertyKey];
        }
        return options.default;
      },
      set(value) {
        if (this._store) {
          this._store.$patch({ [propertyKey]: value });
        } else {
          Object.defineProperty(this, `_${propertyKey}`, {
            value,
            writable: true,
            enumerable: false,
            configurable: true
          });
        }
      },
      enumerable: true,
      configurable: true
    };
    Object.defineProperty(target, propertyKey, descriptor);
  };
}
function ReactiveState(options = {}) {
  return State({
    ...options,
    deep: true
  });
}
function PersistentState(options = {}) {
  return State({
    ...options,
    persist: true
  });
}
function ReadonlyState(options) {
  return function(target, propertyKey) {
    if (typeof propertyKey === "symbol") {
      throw new TypeError("ReadonlyState decorator does not support symbol properties");
    }
    const existingMetadata = Reflect.getMetadata(DECORATOR_METADATA_KEY, target.constructor) || [];
    const newMetadata = {
      type: "state",
      key: propertyKey,
      options: {
        ...options,
        default: options.value
      }
    };
    existingMetadata.push(newMetadata);
    Reflect.defineMetadata(DECORATOR_METADATA_KEY, existingMetadata, target.constructor);
    const descriptor = {
      get() {
        if (this._store) {
          return this._store.$state[propertyKey];
        }
        return options.value;
      },
      set(value) {
        if (this._isConstructing !== false) {
          Object.defineProperty(this, `_${propertyKey}`, {
            value,
            writable: false,
            enumerable: false,
            configurable: false
          });
          return;
        }
        if (value === options.value) {
          return;
        }
        throw new Error(`Cannot set readonly state property: ${propertyKey}`);
      },
      enumerable: true,
      configurable: true
    };
    Object.defineProperty(target, propertyKey, descriptor);
  };
}

export { PersistentState, ReactiveState, ReadonlyState, State };
//# sourceMappingURL=State.js.map
