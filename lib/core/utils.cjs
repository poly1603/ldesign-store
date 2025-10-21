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

function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }
  if (typeof obj === "object") {
    const cloned = {};
    Object.keys(obj).forEach((key) => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
  return obj;
}
function deepEqual(a, b) {
  if (a === b)
    return true;
  if (a == null || b == null)
    return false;
  if (typeof a !== typeof b)
    return false;
  if (typeof a !== "object")
    return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length)
    return false;
  for (const key of keysA) {
    if (!keysB.includes(key))
      return false;
    if (!deepEqual(a[key], b[key]))
      return false;
  }
  return true;
}
function debounce(func, wait) {
  let timeout = null;
  return function(...args) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
function throttle(func, wait) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
}
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== void 0 ? current[key] : void 0;
  }, obj);
}
function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}
function isFunction(value) {
  return typeof value === "function";
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isPromise(value) {
  return value && typeof value.then === "function";
}

exports.debounce = debounce;
exports.deepClone = deepClone;
exports.deepEqual = deepEqual;
exports.generateId = generateId;
exports.getNestedValue = getNestedValue;
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isPromise = isPromise;
exports.setNestedValue = setNestedValue;
exports.throttle = throttle;
//# sourceMappingURL=utils.cjs.map
