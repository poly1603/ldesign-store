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

var validation = require('./validation.cjs');

function deepClone(obj, seen = /* @__PURE__ */ new WeakMap()) {
  if (typeof structuredClone !== "undefined") {
    try {
      return structuredClone(obj);
    } catch {
    }
  }
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (seen.has(obj)) {
    return seen.get(obj);
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  if (obj instanceof Map) {
    const cloned2 = /* @__PURE__ */ new Map();
    seen.set(obj, cloned2);
    for (const [key, value] of obj) {
      cloned2.set(deepClone(key, seen), deepClone(value, seen));
    }
    return cloned2;
  }
  if (obj instanceof Set) {
    const cloned2 = /* @__PURE__ */ new Set();
    seen.set(obj, cloned2);
    for (const value of obj) {
      cloned2.add(deepClone(value, seen));
    }
    return cloned2;
  }
  if (Array.isArray(obj)) {
    const cloned2 = [];
    seen.set(obj, cloned2);
    const len = obj.length;
    for (let i = 0; i < len; i++) {
      cloned2[i] = deepClone(obj[i], seen);
    }
    return cloned2;
  }
  const cloned = {};
  seen.set(obj, cloned);
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key], seen);
    }
  }
  return cloned;
}
function deepMerge(target, ...sources) {
  if (!sources.length)
    return target;
  const source = sources.shift();
  if (!source)
    return target;
  if (validation.TypeGuards.isObject(target) && validation.TypeGuards.isObject(source)) {
    for (const key in source) {
      if (validation.TypeGuards.isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return deepMerge(target, ...sources);
}
function deepFreeze(obj) {
  Object.freeze(obj);
  if (obj && typeof obj === "object") {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const value = obj[prop];
      if (value && typeof value === "object" && !Object.isFrozen(value)) {
        deepFreeze(value);
      }
    });
  }
  return obj;
}
function getDeepValue(obj, path, defaultValue) {
  const keys = Array.isArray(path) ? path : path.split(".");
  let result = obj;
  for (const key of keys) {
    if (result === null || result === void 0) {
      return defaultValue;
    }
    result = result[key];
  }
  return result === void 0 ? defaultValue : result;
}
function setDeepValue(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split(".");
  const lastKey = keys.pop();
  if (!lastKey)
    return;
  let current = obj;
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }
  current[lastKey] = value;
}
function deleteDeepValue(obj, path) {
  const keys = Array.isArray(path) ? path : path.split(".");
  const lastKey = keys.pop();
  if (!lastKey)
    return false;
  let current = obj;
  for (const key of keys) {
    if (!current[key]) {
      return false;
    }
    current = current[key];
  }
  return delete current[lastKey];
}
function deepEqual(a, b, seen = /* @__PURE__ */ new WeakMap()) {
  if (a === b)
    return true;
  if (a === null || b === null || a === void 0 || b === void 0) {
    return a === b;
  }
  if (typeof a !== typeof b)
    return false;
  if (typeof a !== "object")
    return a === b;
  if (seen.has(a)) {
    return seen.get(a) === b;
  }
  seen.set(a, b);
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length)
      return false;
    return a.every((item, index) => deepEqual(item, b[index], seen));
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size)
      return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !deepEqual(value, b.get(key), seen)) {
        return false;
      }
    }
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size)
      return false;
    for (const item of a) {
      if (!b.has(item))
        return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length)
    return false;
  return keysA.every((key) => {
    return Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key], seen);
  });
}
function flattenObject(obj, prefix = "", separator = ".") {
  const result = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key))
      continue;
    const value = obj[key];
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    if (validation.TypeGuards.isPlainObject(value) && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey, separator));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}
function unflattenObject(obj, separator = ".") {
  const result = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key))
      continue;
    setDeepValue(result, key.split(separator), obj[key]);
  }
  return result;
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function retry(fn, options = {}) {
  const { maxAttempts = 3, delay: retryDelay = 1e3, onRetry } = options;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        onRetry?.(lastError, attempt);
        await delay(retryDelay * attempt);
      }
    }
  }
  throw lastError || new Error("Retry failed");
}
function memoize(fn, resolver) {
  const cache = /* @__PURE__ */ new Map();
  const maxCacheSize = 100;
  const keys = [];
  return function(...args) {
    let key;
    if (resolver) {
      key = resolver(...args);
    } else if (args.length === 0) {
      key = "void";
    } else if (args.length === 1 && typeof args[0] !== "object") {
      key = String(args[0]);
    } else {
      key = JSON.stringify(args);
    }
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    keys.push(key);
    if (keys.length > maxCacheSize) {
      const oldestKey = keys.shift();
      cache.delete(oldestKey);
    }
    return result;
  };
}
function batch(items, batchSize, processor) {
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return Promise.all(batches.map(processor)).then((results) => results.flat());
}
async function pLimit(tasks, limit) {
  const results = [];
  const executing = [];
  const tasksLen = tasks.length;
  for (let i = 0; i < tasksLen; i++) {
    const task = tasks[i];
    const p = task().then((result) => {
      results.push(result);
      return result;
    });
    const wrapped = p.then(() => {
      const idx = executing.indexOf(wrapped);
      if (idx !== -1) {
        executing.splice(idx, 1);
      }
    });
    executing.push(wrapped);
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}
function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0)
    return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
function formatDuration(ms) {
  if (ms < 1e3)
    return `${ms}ms`;
  if (ms < 6e4)
    return `${(ms / 1e3).toFixed(2)}s`;
  if (ms < 36e5)
    return `${(ms / 6e4).toFixed(2)}m`;
  return `${(ms / 36e5).toFixed(2)}h`;
}
function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}
function omit(obj, keys) {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
function debounce(func, delay2) {
  let timeoutId;
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay2);
  };
}
function throttle(func, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}
function safeKeys(obj) {
  return Object.keys(obj);
}
function safeValues(obj) {
  return Object.values(obj);
}
function safeEntries(obj) {
  return Object.entries(obj);
}
function unique(arr) {
  return Array.from(new Set(arr));
}
function groupBy(arr, key) {
  const result = {};
  for (const item of arr) {
    const groupKey = typeof key === "function" ? key(item) : String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }
  return result;
}
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

exports.batch = batch;
exports.chunk = chunk;
exports.debounce = debounce;
exports.deepClone = deepClone;
exports.deepEqual = deepEqual;
exports.deepFreeze = deepFreeze;
exports.deepMerge = deepMerge;
exports.delay = delay;
exports.deleteDeepValue = deleteDeepValue;
exports.flattenObject = flattenObject;
exports.formatBytes = formatBytes;
exports.formatDuration = formatDuration;
exports.generateId = generateId;
exports.getDeepValue = getDeepValue;
exports.groupBy = groupBy;
exports.memoize = memoize;
exports.omit = omit;
exports.pLimit = pLimit;
exports.pick = pick;
exports.retry = retry;
exports.safeEntries = safeEntries;
exports.safeKeys = safeKeys;
exports.safeValues = safeValues;
exports.setDeepValue = setDeepValue;
exports.throttle = throttle;
exports.unflattenObject = unflattenObject;
exports.unique = unique;
//# sourceMappingURL=helpers.cjs.map
