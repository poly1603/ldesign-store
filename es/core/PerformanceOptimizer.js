/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { LRUCache } from '../utils/cache.js';

class CacheManager {
  constructor(maxSize = 1e3, defaultTTL = 5 * 60 * 1e3) {
    this.cache = new LRUCache(maxSize, defaultTTL);
  }
  /**
   * 设置缓存
   */
  set(key, value, ttl) {
    this.cache.set(key, value, ttl);
  }
  /**
   * 获取缓存
   */
  get(key) {
    return this.cache.get(key);
  }
  /**
   * 检查缓存是否存在
   */
  has(key) {
    return this.cache.has(key);
  }
  /**
   * 删除缓存
   */
  delete(key) {
    return this.cache.delete(key);
  }
  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
  }
  /**
   * 获取缓存大小
   */
  size() {
    return this.cache.size();
  }
  /**
   * 清理过期缓存（LRU 缓存会自动清理）
   */
  cleanup() {
  }
  /**
   * 销毁缓存管理器
   */
  dispose() {
    this.cache.dispose();
  }
}
class PersistenceManager {
  constructor(options = {}) {
    this.storage = options.storage || (typeof window !== "undefined" ? window.localStorage : {});
    this.serializer = options.serializer || {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    };
  }
  /**
   * 保存状态（优化版：减少序列化开销）
   */
  save(key, state, paths) {
    try {
      if (!state || typeof state === "object" && Object.keys(state).length === 0) {
        return;
      }
      if (state === void 0 || state === null) {
        this.storage.removeItem(key);
        return;
      }
      let dataToSave = state;
      if (paths && paths.length > 0) {
        dataToSave = {};
        for (const path of paths) {
          if (path in state && state[path] !== void 0) {
            dataToSave[path] = state[path];
          }
        }
      }
      if (dataToSave === void 0 || typeof dataToSave === "object" && Object.keys(dataToSave).length === 0) {
        this.storage.removeItem(key);
        return;
      }
      const serialized = this.serializer.serialize(dataToSave);
      this.storage.setItem(key, serialized);
    } catch (error) {
      console.warn(`Failed to persist state for key "${key}":`, error);
    }
  }
  /**
   * 加载状态
   */
  load(key) {
    try {
      const serialized = this.storage.getItem(key);
      if (serialized === null || serialized === "undefined" || serialized === "null") {
        return null;
      }
      return this.serializer.deserialize(serialized);
    } catch (error) {
      console.warn(`Failed to load persisted state for key "${key}":`, error);
      try {
        this.storage.removeItem(key);
      } catch {
      }
      return null;
    }
  }
  /**
   * 删除持久化状态
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove persisted state for key "${key}":`, error);
    }
  }
  /**
   * 清空所有持久化状态
   */
  clear() {
    try {
      this.storage.clear();
    } catch (error) {
      console.warn("Failed to clear persisted state:", error);
    }
  }
}
class DebounceManager {
  constructor() {
    this.timers = /* @__PURE__ */ new Map();
  }
  /**
   * 防抖执行
   */
  debounce(key, fn, delay) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        const existingTimer = this.timers.get(key);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        const timer = setTimeout(async () => {
          try {
            const result = await fn(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            this.timers.delete(key);
          }
        }, delay);
        this.timers.set(key, timer);
      });
    };
  }
  /**
   * 取消防抖
   */
  cancel(key) {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }
  /**
   * 清空所有防抖
   */
  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
class ThrottleManager {
  constructor() {
    this.lastExecution = /* @__PURE__ */ new Map();
  }
  /**
   * 节流执行
   */
  throttle(key, fn, delay) {
    return (...args) => {
      const now = Date.now();
      const lastTime = this.lastExecution.get(key) || 0;
      if (now - lastTime >= delay) {
        this.lastExecution.set(key, now);
        return fn(...args);
      }
      return void 0;
    };
  }
  /**
   * 重置节流状态
   */
  reset(key) {
    this.lastExecution.delete(key);
  }
  /**
   * 清空所有节流状态
   */
  clear() {
    this.lastExecution.clear();
  }
}
class PerformanceOptimizer {
  constructor(options = {}) {
    this.cache = new CacheManager(options.cache?.maxSize, options.cache?.defaultTTL);
    this.persistence = new PersistenceManager(options.persistence);
    this.debounce = new DebounceManager();
    this.throttle = new ThrottleManager();
  }
  /**
   * 清理所有资源
   */
  dispose() {
    this.cache.dispose();
    this.debounce.clear();
    this.throttle.clear();
  }
  /**
   * 清空所有缓存（向后兼容）
   */
  clear() {
    this.cache.clear();
    this.debounce.clear();
    this.throttle.clear();
  }
}

export { CacheManager, DebounceManager, PerformanceOptimizer, PersistenceManager, ThrottleManager };
//# sourceMappingURL=PerformanceOptimizer.js.map
