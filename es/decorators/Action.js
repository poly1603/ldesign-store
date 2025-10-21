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
import { LRUCache, fastHash } from '../utils/cache.js';
import 'reflect-metadata';

function Action(options = {}) {
  return function(target, propertyKey, descriptor) {
    if (typeof propertyKey === "symbol") {
      throw new TypeError("Action decorator does not support symbol properties");
    }
    const existingMetadata = Reflect.getMetadata(DECORATOR_METADATA_KEY, target.constructor) || [];
    const newMetadata = {
      type: "action",
      key: propertyKey,
      options
    };
    existingMetadata.push(newMetadata);
    Reflect.defineMetadata(DECORATOR_METADATA_KEY, existingMetadata, target.constructor);
    const originalMethod = descriptor.value;
    if (typeof originalMethod !== "function") {
      throw new TypeError(`Action decorator can only be applied to methods`);
    }
    let cache;
    if (options.cache) {
      cache = new LRUCache(100, options.cacheTime || 5 * 60 * 1e3);
    }
    descriptor.value = function(...args) {
      if (options.cache && cache) {
        const cacheKey = fastHash(args);
        const cached = cache.get(cacheKey);
        if (cached !== void 0) {
          return cached;
        }
      }
      if (options.debounce) {
        if (this[`_debounce_${propertyKey}`]) {
          clearTimeout(this[`_debounce_${propertyKey}`]);
        }
        return new Promise((resolve, reject) => {
          this[`_debounce_${propertyKey}`] = setTimeout(async () => {
            try {
              const result2 = await originalMethod.apply(this, args);
              resolve(result2);
            } catch (error) {
              reject(error);
            }
          }, options.debounce);
        });
      }
      if (options.throttle) {
        const lastCall = this[`_throttle_${propertyKey}_last`] || 0;
        const now = Date.now();
        if (now - lastCall < options.throttle) {
          return this[`_throttle_${propertyKey}_result`];
        }
        this[`_throttle_${propertyKey}_last`] = now;
      }
      const result = originalMethod.apply(this, args);
      if (options.async && result instanceof Promise) {
        return result.then((res) => {
          if (options.cache && cache) {
            const cacheKey = fastHash(args);
            cache.set(cacheKey, res);
          }
          if (options.throttle) {
            this[`_throttle_${propertyKey}_result`] = res;
          }
          return res;
        }).catch((error) => {
          console.error(`Action ${propertyKey} failed:`, error);
          throw error;
        });
      }
      if (options.cache && cache) {
        const cacheKey = fastHash(args);
        cache.set(cacheKey, result);
      }
      if (options.throttle) {
        this[`_throttle_${propertyKey}_result`] = result;
      }
      return result;
    };
    const originalDispose = target.$dispose;
    if (originalDispose) {
      target.$dispose = function() {
        if (cache) {
          cache.dispose();
        }
        return originalDispose.call(this);
      };
    }
    return descriptor;
  };
}
function AsyncAction(options = {}) {
  return Action({
    ...options,
    async: true
  });
}
function CachedAction(cacheTime) {
  return Action({
    cache: true,
    cacheTime
  });
}
function DebouncedAction(delay) {
  return Action({
    debounce: delay
  });
}
function ThrottledAction(interval) {
  return Action({
    throttle: interval
  });
}

export { Action, AsyncAction, CachedAction, DebouncedAction, ThrottledAction };
//# sourceMappingURL=Action.js.map
