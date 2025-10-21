/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { PerformanceMonitor } from './performance.js';
import { StorePool } from './storePool.js';

class MemoryMonitor {
  constructor(config = {}) {
    this.history = [];
    this.storeReferences = /* @__PURE__ */ new WeakSet();
    this.cacheReferences = /* @__PURE__ */ new Map();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.listeners = /* @__PURE__ */ new Set();
    this.config = {
      enabled: config.enabled ?? true,
      sampleInterval: config.sampleInterval ?? 1e4,
      // 10秒
      historySize: config.historySize ?? 100,
      alertThreshold: config.alertThreshold ?? 100 * 1024 * 1024,
      // 100MB
      autoCleanup: config.autoCleanup ?? true,
      gcInterval: config.gcInterval ?? 3e5
      // 5分钟
    };
    if (this.config.enabled) {
      this.start();
    }
  }
  /**
   * 获取单例实例
   */
  static getInstance(config) {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor(config);
    }
    return MemoryMonitor.instance;
  }
  /**
   * 开始监控
   */
  start() {
    if (this.monitoringTimer)
      return;
    this.monitoringTimer = setInterval(() => {
      this.sample();
    }, this.config.sampleInterval);
    if (this.config.autoCleanup) {
      this.gcTimer = setInterval(() => {
        this.performGarbageCollection();
      }, this.config.gcInterval);
    }
    this.sample();
  }
  /**
   * 停止监控
   */
  stop() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = void 0;
    }
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = void 0;
    }
  }
  /**
   * 注册Store实例
   */
  registerStore(store) {
    this.storeReferences.add(store);
  }
  /**
   * 注册缓存实例
   */
  registerCache(cache, estimatedSize) {
    this.cacheReferences.set(cache, estimatedSize);
  }
  /**
   * 采样内存使用情况
   */
  sample() {
    const usage = this.collectMemoryUsage();
    this.history.push(usage);
    if (this.history.length > this.config.historySize) {
      this.history.shift();
    }
    if (usage.estimatedSize > this.config.alertThreshold) {
      this.handleMemoryAlert(usage);
    }
    this.notifyListeners(usage);
    this.performanceMonitor.updateMemoryUsage(usage.storeInstances, usage.cacheEntries);
  }
  /**
   * 收集内存使用信息
   */
  collectMemoryUsage() {
    const storePool = StorePool.getInstance();
    const poolStats = storePool.getStats();
    const storeDetails = /* @__PURE__ */ new Map();
    for (const detail of poolStats.poolDetails) {
      storeDetails.set(detail.className, detail.poolSize + detail.activeInstances);
    }
    const cacheDetails = /* @__PURE__ */ new Map();
    let totalCacheSize = 0;
    for (const [cache, size] of this.cacheReferences) {
      if (cache) {
        const cacheName = cache.constructor.name;
        cacheDetails.set(cacheName, (cacheDetails.get(cacheName) || 0) + size);
        totalCacheSize += size;
      }
    }
    const estimatedSize = this.estimateMemorySize(poolStats.totalInstances, totalCacheSize);
    return {
      storeInstances: poolStats.totalInstances,
      cacheEntries: cacheDetails.size,
      estimatedSize,
      timestamp: Date.now(),
      details: {
        stores: storeDetails,
        caches: cacheDetails
      }
    };
  }
  /**
   * 估算内存大小
   */
  estimateMemorySize(storeCount, cacheSize) {
    const storeMemory = storeCount * 5 * 1024;
    const cacheMemory = cacheSize;
    const overhead = (storeMemory + cacheMemory) * 0.1;
    return Math.floor(storeMemory + cacheMemory + overhead);
  }
  /**
   * 处理内存警报
   */
  handleMemoryAlert(usage) {
    console.warn("[MemoryMonitor] Memory usage alert:", {
      used: `${(usage.estimatedSize / 1024 / 1024).toFixed(2)}MB`,
      threshold: `${(this.config.alertThreshold / 1024 / 1024).toFixed(2)}MB`,
      stores: usage.storeInstances,
      caches: usage.cacheEntries
    });
    if (this.config.autoCleanup) {
      this.performGarbageCollection();
    }
  }
  /**
   * 执行垃圾回收
   */
  performGarbageCollection() {
    const storePool = StorePool.getInstance();
    storePool.setOptions({ maxIdleTime: 6e4 });
    const keysToDelete = [];
    for (const [cache] of this.cacheReferences) {
      if (!cache) {
        keysToDelete.push(cache);
      }
    }
    keysToDelete.forEach((key) => this.cacheReferences.delete(key));
    setTimeout(() => {
      storePool.setOptions({ maxIdleTime: 3e5 });
    }, 1e3);
    if (typeof globalThis !== "undefined" && globalThis.gc) {
      try {
        globalThis.gc();
      } catch {
      }
    }
  }
  /**
   * 检测内存泄漏
   */
  detectMemoryLeak() {
    if (this.history.length < 10) {
      return {
        suspected: false,
        growthRate: 0,
        recommendations: ["\u9700\u8981\u66F4\u591A\u5386\u53F2\u6570\u636E\u8FDB\u884C\u5206\u6790"],
        problematicStores: [],
        problematicCaches: []
      };
    }
    const recentHistory = this.history.slice(-10);
    const firstUsage = recentHistory[0].estimatedSize;
    const lastUsage = recentHistory[recentHistory.length - 1].estimatedSize;
    const growthRate = (lastUsage - firstUsage) / firstUsage * 100;
    const problematicStores = [];
    const problematicCaches = [];
    const lastDetails = recentHistory[recentHistory.length - 1].details;
    const firstDetails = recentHistory[0].details;
    for (const [name, count] of lastDetails.stores) {
      const initialCount = firstDetails.stores.get(name) || 0;
      if (count > initialCount * 2 && count > 10) {
        problematicStores.push(name);
      }
    }
    for (const [name, size] of lastDetails.caches) {
      const initialSize = firstDetails.caches.get(name) || 0;
      if (size > initialSize * 2 && size > 1024 * 1024) {
        problematicCaches.push(name);
      }
    }
    const suspected = growthRate > 50 || problematicStores.length > 0 || problematicCaches.length > 0;
    const recommendations = [];
    if (growthRate > 50) {
      recommendations.push(`\u5185\u5B58\u589E\u957F\u7387\u8FC7\u9AD8(${growthRate.toFixed(2)}%)\uFF0C\u5EFA\u8BAE\u68C0\u67E5\u4EE3\u7801`);
    }
    if (problematicStores.length > 0) {
      recommendations.push(`Store\u5B9E\u4F8B\u589E\u957F\u5F02\u5E38\uFF1A${problematicStores.join(", ")}`);
    }
    if (problematicCaches.length > 0) {
      recommendations.push(`\u7F13\u5B58\u589E\u957F\u5F02\u5E38\uFF1A${problematicCaches.join(", ")}`);
    }
    return {
      suspected,
      growthRate,
      recommendations,
      problematicStores,
      problematicCaches
    };
  }
  /**
   * 获取内存使用报告
   */
  getMemoryReport() {
    const current = this.history[this.history.length - 1] || null;
    const trend = this.analyzeTrend();
    const leakDetection = this.detectMemoryLeak();
    return {
      current,
      history: [...this.history],
      trend,
      leakDetection
    };
  }
  /**
   * 分析内存趋势
   */
  analyzeTrend() {
    if (this.history.length < 3)
      return "stable";
    const recent = this.history.slice(-3);
    const diffs = [];
    for (let i = 1; i < recent.length; i++) {
      diffs.push(recent[i].estimatedSize - recent[i - 1].estimatedSize);
    }
    const avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
    const threshold = this.config.alertThreshold * 0.01;
    if (avgDiff > threshold)
      return "growing";
    if (avgDiff < -threshold)
      return "shrinking";
    return "stable";
  }
  /**
   * 订阅内存使用更新
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * 通知监听器
   */
  notifyListeners(info) {
    this.listeners.forEach((listener) => {
      try {
        listener(info);
      } catch (error) {
        console.error("Memory monitor listener error:", error);
      }
    });
  }
  /**
   * 清理历史记录
   */
  clearHistory() {
    this.history = [];
  }
  /**
   * 更新配置
   */
  updateConfig(config) {
    Object.assign(this.config, config);
    if (this.config.enabled) {
      this.stop();
      this.start();
    }
  }
  /**
   * 销毁监控器
   */
  dispose() {
    this.stop();
    this.clearHistory();
    this.listeners.clear();
    this.storeReferences = /* @__PURE__ */ new WeakSet();
    this.cacheReferences = /* @__PURE__ */ new Map();
  }
}
function useMemoryMonitor(config) {
  return MemoryMonitor.getInstance(config);
}

export { MemoryMonitor, useMemoryMonitor };
//# sourceMappingURL=MemoryMonitor.js.map
