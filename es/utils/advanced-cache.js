/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { LRUCache } from './cache.js';

class CacheAnalyzer {
  constructor(cache) {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.operations = 0;
    this.accessPattern = /* @__PURE__ */ new Map();
    this.cache = cache;
  }
  /**
   * 记录缓存命中
   */
  recordHit(key) {
    this.hits++;
    this.operations++;
    this.recordAccess(key);
  }
  /**
   * 记录缓存未命中
   */
  recordMiss(key) {
    this.misses++;
    this.operations++;
    this.recordAccess(key);
  }
  /**
   * 记录缓存淘汰
   */
  recordEviction() {
    this.evictions++;
  }
  /**
   * 记录访问模式
   */
  recordAccess(key) {
    const count = this.accessPattern.get(key) || 0;
    this.accessPattern.set(key, count + 1);
  }
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.operations > 0 ? this.hits / this.operations : 0,
      size: this.cache.size(),
      evictions: this.evictions,
      operations: this.operations
    };
  }
  /**
   * 获取热门键（最频繁访问）
   */
  getHotKeys(limit = 10) {
    const sorted = Array.from(this.accessPattern.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return sorted.map(([key]) => key);
  }
  /**
   * 重置统计信息
   */
  reset() {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.operations = 0;
    this.accessPattern.clear();
  }
  /**
   * 获取访问频率
   */
  getAccessFrequency(key) {
    return this.accessPattern.get(key) || 0;
  }
}
class AdaptiveCache {
  constructor(initialSize = 1e3, minSize = 100, maxSize = 1e4, targetHitRate = 0.8, defaultTTL = 5 * 60 * 1e3) {
    this.cache = new LRUCache(initialSize, defaultTTL);
    this.analyzer = new CacheAnalyzer(this.cache);
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.targetHitRate = targetHitRate;
    this.startAutoAdjustment();
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
    const value = this.cache.get(key);
    if (value !== void 0) {
      this.analyzer.recordHit(key);
    } else {
      this.analyzer.recordMiss(key);
    }
    return value;
  }
  /**
   * 检查是否存在
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
    this.analyzer.reset();
  }
  /**
   * 获取统计信息
   */
  getStats() {
    return this.analyzer.getStats();
  }
  /**
   * 获取热门键
   */
  getHotKeys(limit) {
    return this.analyzer.getHotKeys(limit);
  }
  /**
   * 启动自动调整
   */
  startAutoAdjustment() {
    this.adjustmentTimer = setInterval(() => {
      this.adjustCacheSize();
    }, 6e4);
  }
  /**
   * 根据命中率调整缓存大小
   */
  adjustCacheSize() {
    const stats = this.analyzer.getStats();
    if (stats.operations < 100) {
      return;
    }
    const currentSize = stats.size;
    const hitRate = stats.hitRate;
    if (hitRate < this.targetHitRate && currentSize < this.maxSize) {
      const newSize = Math.min(Math.floor(currentSize * 1.2), this.maxSize);
      this.resizeCache(newSize);
    } else if (hitRate > this.targetHitRate + 0.1 && currentSize > this.minSize) {
      const newSize = Math.max(Math.floor(currentSize * 0.9), this.minSize);
      this.resizeCache(newSize);
    }
    this.analyzer.reset();
  }
  /**
   * 调整缓存大小
   */
  resizeCache(newSize) {
    const oldCache = this.cache;
    const defaultTTL = 5 * 60 * 1e3;
    this.cache = new LRUCache(newSize, defaultTTL);
    const hotKeys = this.analyzer.getHotKeys(newSize);
    for (const key of hotKeys) {
      const value = oldCache.get(key);
      if (value !== void 0) {
        this.cache.set(key, value);
      }
    }
    oldCache.dispose();
  }
  /**
   * 销毁缓存
   */
  dispose() {
    if (this.adjustmentTimer) {
      clearInterval(this.adjustmentTimer);
      this.adjustmentTimer = void 0;
    }
    this.cache.dispose();
  }
}
class CacheWarmer {
  constructor(cache) {
    this.warmupTasks = /* @__PURE__ */ new Map();
    this.cache = cache;
  }
  /**
   * 注册预热任务
   */
  register(key, loader) {
    this.warmupTasks.set(key, loader);
  }
  /**
   * 批量注册预热任务
   */
  registerBatch(tasks) {
    for (const [key, loader] of tasks) {
      this.warmupTasks.set(key, loader);
    }
  }
  /**
   * 执行预热
   */
  async warmup(keys) {
    const keysToWarm = keys || Array.from(this.warmupTasks.keys());
    const promises = keysToWarm.map(async (key) => {
      const loader = this.warmupTasks.get(key);
      if (loader) {
        try {
          const value = await loader();
          this.cache.set(key, value);
        } catch (error) {
          console.warn(`Failed to warmup cache for key: ${String(key)}`, error);
        }
      }
    });
    await Promise.all(promises);
  }
  /**
   * 并发预热（限制并发数）
   */
  async warmupConcurrent(keys, concurrency = 5) {
    const keysToWarm = keys || Array.from(this.warmupTasks.keys());
    for (let i = 0; i < keysToWarm.length; i += concurrency) {
      const batch = keysToWarm.slice(i, i + concurrency);
      const batchPromises = batch.map(async (key) => {
        const loader = this.warmupTasks.get(key);
        if (loader) {
          try {
            const value = await loader();
            this.cache.set(key, value);
          } catch (error) {
            console.warn(`Failed to warmup cache for key: ${String(key)}`, error);
          }
        }
      });
      await Promise.all(batchPromises);
    }
  }
  /**
   * 清除预热任务
   */
  clear() {
    this.warmupTasks.clear();
  }
}
class MultiLevelCache {
  constructor(l1Size = 1e3, l1TTL = 5 * 60 * 1e3, l2Storage, l2Prefix = "cache:", serializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  }) {
    this.l1Cache = new LRUCache(l1Size, l1TTL);
    this.l2Storage = l2Storage;
    this.l2Prefix = l2Prefix;
    this.serializer = serializer;
  }
  /**
   * 设置缓存（同时写入 L1 和 L2）
   */
  set(key, value, ttl) {
    this.l1Cache.set(key, value, ttl);
    if (this.l2Storage) {
      try {
        const serialized = this.serializer.serialize(value);
        this.l2Storage.setItem(this.l2Prefix + String(key), serialized);
      } catch (error) {
        console.warn("Failed to write to L2 cache:", error);
      }
    }
  }
  /**
   * 获取缓存（先从 L1，再从 L2）
   */
  get(key) {
    let value = this.l1Cache.get(key);
    if (value !== void 0) {
      return value;
    }
    if (this.l2Storage) {
      try {
        const serialized = this.l2Storage.getItem(this.l2Prefix + String(key));
        if (serialized) {
          value = this.serializer.deserialize(serialized);
          this.l1Cache.set(key, value);
          return value;
        }
      } catch (error) {
        console.warn("Failed to read from L2 cache:", error);
      }
    }
    return void 0;
  }
  /**
   * 检查是否存在
   */
  has(key) {
    if (this.l1Cache.has(key)) {
      return true;
    }
    if (this.l2Storage) {
      return this.l2Storage.getItem(this.l2Prefix + String(key)) !== null;
    }
    return false;
  }
  /**
   * 删除缓存
   */
  delete(key) {
    const l1Result = this.l1Cache.delete(key);
    if (this.l2Storage) {
      try {
        this.l2Storage.removeItem(this.l2Prefix + String(key));
      } catch (error) {
        console.warn("Failed to delete from L2 cache:", error);
      }
    }
    return l1Result;
  }
  /**
   * 清空缓存
   */
  clear() {
    this.l1Cache.clear();
    if (this.l2Storage) {
      try {
        const keys = Object.keys(this.l2Storage);
        for (const key of keys) {
          if (key.startsWith(this.l2Prefix)) {
            this.l2Storage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn("Failed to clear L2 cache:", error);
      }
    }
  }
  /**
   * 销毁缓存
   */
  dispose() {
    this.l1Cache.dispose();
  }
}

export { AdaptiveCache, CacheAnalyzer, CacheWarmer, MultiLevelCache };
//# sourceMappingURL=advanced-cache.js.map
