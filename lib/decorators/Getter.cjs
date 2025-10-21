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

var decorators = require('../types/decorators.cjs');
var cache = require('../utils/cache.cjs');
require('reflect-metadata');

function Getter(options = {}) {
  return function(target, propertyKey, descriptor) {
    if (typeof propertyKey === "symbol") {
      throw new TypeError("Getter decorator does not support symbol properties");
    }
    const existingMetadata = Reflect.getMetadata(decorators.DECORATOR_METADATA_KEY, target.constructor) || [];
    const newMetadata = {
      type: "getter",
      key: propertyKey,
      options
    };
    existingMetadata.push(newMetadata);
    Reflect.defineMetadata(decorators.DECORATOR_METADATA_KEY, existingMetadata, target.constructor);
    const originalGetter = descriptor.get;
    if (typeof originalGetter !== "function") {
      throw new TypeError(`Getter decorator can only be applied to getter methods`);
    }
    let cachedValue;
    let isCached = false;
    let lastDepsHash;
    descriptor.get = function() {
      if (options.deps && options.deps.length > 0) {
        const currentDepsValues = options.deps.map((dep) => {
          if (this._store) {
            return this._store.$state[dep];
          }
          return this[dep];
        });
        const currentDepsHash = cache.fastHash(currentDepsValues);
        if (isCached && lastDepsHash !== currentDepsHash) {
          isCached = false;
        }
        lastDepsHash = currentDepsHash;
      }
      if (options.cache && isCached) {
        return cachedValue;
      }
      const result = originalGetter.call(this);
      if (options.cache) {
        cachedValue = result;
        isCached = true;
      }
      return result;
    };
    if (options.cache) {
      const clearCacheMethodName = `clear${propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1)}Cache`;
      Object.defineProperty(target, clearCacheMethodName, {
        value() {
          isCached = false;
          cachedValue = void 0;
        },
        writable: false,
        enumerable: false,
        configurable: true
      });
    }
    return descriptor;
  };
}
function CachedGetter(deps) {
  return Getter({
    cache: true,
    deps
  });
}
function DependentGetter(deps) {
  return Getter({
    deps
  });
}
function MemoizedGetter(deps) {
  return Getter({
    cache: true,
    deps
  });
}

exports.CachedGetter = CachedGetter;
exports.DependentGetter = DependentGetter;
exports.Getter = Getter;
exports.MemoizedGetter = MemoizedGetter;
//# sourceMappingURL=Getter.cjs.map
