/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class LazyLoadManager {
  constructor() {
    this.loaders = /* @__PURE__ */ new Map();
    this.cache = /* @__PURE__ */ new Map();
    this.loading = /* @__PURE__ */ new Map();
  }
  /**
   * 注册懒加载器
   */
  register(key, loader) {
    this.loaders.set(key, loader);
  }
  /**
   * 加载数据
   */
  async load(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    if (this.loading.has(key)) {
      return this.loading.get(key);
    }
    const loader = this.loaders.get(key);
    if (!loader) {
      throw new Error(`No loader registered for key: ${key}`);
    }
    const loadPromise = loader().then((data) => {
      this.cache.set(key, data);
      this.loading.delete(key);
      return data;
    }).catch((error) => {
      this.loading.delete(key);
      throw error;
    });
    this.loading.set(key, loadPromise);
    return loadPromise;
  }
  /**
   * 预加载数据
   */
  async preload(keys) {
    await Promise.all(keys.map((key) => this.load(key).catch(() => {
    })));
  }
  /**
   * 清除缓存
   */
  clear(key) {
    if (key) {
      this.cache.delete(key);
      this.loading.delete(key);
    } else {
      this.cache.clear();
      this.loading.clear();
    }
  }
  /**
   * 是否已加载
   */
  isLoaded(key) {
    return this.cache.has(key);
  }
  /**
   * 是否正在加载
   */
  isLoading(key) {
    return this.loading.has(key);
  }
}
class PreloadManager {
  constructor(options) {
    this.queue = [];
    this.isProcessing = false;
    this.maxConcurrent = 3;
    this.activeCount = 0;
    if (options?.maxConcurrent) {
      this.maxConcurrent = options.maxConcurrent;
    }
  }
  /**
   * 添加预加载任务
   */
  add(task, priority = 0) {
    this.queue.push({ priority, task });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.process();
  }
  /**
   * 处理预加载队列
   */
  async process() {
    if (this.isProcessing || this.activeCount >= this.maxConcurrent) {
      return;
    }
    this.isProcessing = true;
    while (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const item = this.queue.shift();
      if (item) {
        this.activeCount++;
        item.task().catch((error) => console.warn("Preload failed:", error)).finally(() => {
          this.activeCount--;
          this.process();
        });
      }
    }
    this.isProcessing = false;
  }
  /**
   * 清空队列
   */
  clear() {
    this.queue = [];
  }
  /**
   * 获取队列大小
   */
  get size() {
    return this.queue.length;
  }
}
class MemoryManager {
  constructor(options) {
    this.references = /* @__PURE__ */ new Map();
    this.weakReferences = /* @__PURE__ */ new WeakMap();
    this.memoryLimit = 50 * 1024 * 1024;
    this.checkInterval = null;
    if (options?.memoryLimit) {
      this.memoryLimit = options.memoryLimit;
    }
    if (options?.autoCleanup) {
      this.startAutoCleanup();
    }
  }
  /**
   * 注册对象引用
   */
  register(key, value) {
    this.references.set(key, value);
    if (typeof value === "object" && value !== null) {
      this.weakReferences.set(value, key);
    }
  }
  /**
   * 获取对象引用
   */
  get(key) {
    return this.references.get(key);
  }
  /**
   * 清理无效引用
   */
  cleanup() {
    const keysToDelete = [];
    for (const [key, value] of this.references) {
      if (!value || typeof value === "object" && !this.weakReferences.has(value)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.references.delete(key));
  }
  /**
   * 开始自动清理
   */
  startAutoCleanup(interval = 6e4) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.checkInterval = window.setInterval(() => this.cleanup(), interval);
  }
  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  /**
   * 获取内存使用估算
   */
  estimateMemoryUsage() {
    let total = 0;
    for (const [, value] of this.references) {
      if (value) {
        total += this.estimateSize(value);
      }
    }
    return total;
  }
  /**
   * 估算对象大小
   */
  estimateSize(obj) {
    if (obj === null || obj === void 0)
      return 0;
    if (typeof obj === "boolean")
      return 4;
    if (typeof obj === "number")
      return 8;
    if (typeof obj === "string")
      return obj.length * 2;
    if (obj instanceof Date)
      return 8;
    if (obj instanceof RegExp)
      return obj.toString().length * 2;
    if (typeof obj === "object") {
      let size = 0;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          size += key.length * 2;
          size += this.estimateSize(obj[key]);
        }
      }
      return size;
    }
    return 0;
  }
  /**
   * 检查内存限制
   */
  checkMemoryLimit() {
    return this.estimateMemoryUsage() < this.memoryLimit;
  }
}
class ConcurrencyController {
  constructor(maxConcurrent = 5) {
    this.queue = [];
    this.activeCount = 0;
    this.maxConcurrent = maxConcurrent;
  }
  /**
   * 执行任务
   */
  async execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }
  /**
   * 处理队列
   */
  async process() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    const item = this.queue.shift();
    if (!item)
      return;
    this.activeCount++;
    try {
      const result = await item.task();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.activeCount--;
      this.process();
    }
  }
  /**
   * 获取活跃任务数
   */
  getActiveCount() {
    return this.activeCount;
  }
  /**
   * 获取队列长度
   */
  getQueueLength() {
    return this.queue.length;
  }
  /**
   * 清空队列
   */
  clear() {
    this.queue.forEach((item) => {
      item.reject(new Error("Queue cleared"));
    });
    this.queue = [];
  }
  /**
   * 更新最大并发数
   */
  setMaxConcurrent(max) {
    this.maxConcurrent = max;
    for (let i = 0; i < max - this.activeCount; i++) {
      this.process();
    }
  }
}
class VirtualizationManager {
  constructor(options) {
    this.data = [];
    this.pageSize = 50;
    this.currentPage = 0;
    this.totalPages = 0;
    if (options?.pageSize) {
      this.pageSize = options.pageSize;
    }
  }
  /**
   * 设置数据
   */
  setData(data) {
    this.data = data;
    this.totalPages = Math.ceil(data.length / this.pageSize);
    this.currentPage = 0;
  }
  /**
   * 获取当前页数据
   */
  getCurrentPage() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.data.slice(start, end);
  }
  /**
   * 获取指定页数据
   */
  getPage(page) {
    if (page < 0 || page >= this.totalPages) {
      throw new Error("Page out of range");
    }
    const start = page * this.pageSize;
    const end = start + this.pageSize;
    return this.data.slice(start, end);
  }
  /**
   * 下一页
   */
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      return this.getCurrentPage();
    }
    return null;
  }
  /**
   * 上一页
   */
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      return this.getCurrentPage();
    }
    return null;
  }
  /**
   * 跳转到指定页
   */
  goToPage(page) {
    if (page < 0 || page >= this.totalPages) {
      throw new Error("Page out of range");
    }
    this.currentPage = page;
    return this.getCurrentPage();
  }
  /**
   * 获取可见范围数据
   */
  getVisibleRange(start, end) {
    return this.data.slice(start, end);
  }
  /**
   * 获取元信息
   */
  getMetadata() {
    return {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      pageSize: this.pageSize,
      totalItems: this.data.length,
      hasNext: this.currentPage < this.totalPages - 1,
      hasPrev: this.currentPage > 0
    };
  }
}
class ComputationOptimizer {
  constructor() {
    this.computations = /* @__PURE__ */ new Map();
  }
  /**
   * 注册计算函数
   */
  register(key, fn, ttl = 5e3) {
    this.computations.set(key, {
      fn,
      cache: /* @__PURE__ */ new Map(),
      ttl
    });
  }
  /**
   * 执行计算
   */
  compute(key, ...args) {
    const computation = this.computations.get(key);
    if (!computation) {
      throw new Error(`No computation registered for key: ${key}`);
    }
    const cacheKey = JSON.stringify(args);
    const cached = computation.cache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < computation.ttl) {
      return cached.value;
    }
    const value = computation.fn(...args);
    computation.cache.set(cacheKey, { value, timestamp: now });
    for (const [k, v] of computation.cache) {
      if (now - v.timestamp > computation.ttl) {
        computation.cache.delete(k);
      }
    }
    return value;
  }
  /**
   * 清除缓存
   */
  clearCache(key) {
    if (key) {
      const computation = this.computations.get(key);
      if (computation) {
        computation.cache.clear();
      }
    } else {
      for (const computation of this.computations.values()) {
        computation.cache.clear();
      }
    }
  }
  /**
   * 移除计算函数
   */
  unregister(key) {
    return this.computations.delete(key);
  }
}
class RequestMerger {
  constructor(options) {
    this.pending = /* @__PURE__ */ new Map();
    this.cache = /* @__PURE__ */ new Map();
    this.ttl = 5e3;
    if (options?.ttl) {
      this.ttl = options.ttl;
    }
  }
  /**
   * 执行请求
   */
  async execute(key, request, options) {
    if (!options?.force) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < (options?.ttl || this.ttl)) {
        return cached.data;
      }
    }
    const pending = this.pending.get(key);
    if (pending) {
      return pending;
    }
    const promise = request().then((data) => {
      this.cache.set(key, { data, timestamp: Date.now() });
      this.pending.delete(key);
      return data;
    }).catch((error) => {
      this.pending.delete(key);
      throw error;
    });
    this.pending.set(key, promise);
    return promise;
  }
  /**
   * 清除缓存
   */
  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
  /**
   * 取消请求
   */
  cancel(key) {
    this.pending.delete(key);
  }
}
class EnhancedPerformanceOptimizer {
  constructor(options) {
    this.lazyLoad = new LazyLoadManager();
    this.preload = new PreloadManager({ maxConcurrent: options?.maxConcurrent });
    this.memory = new MemoryManager({
      memoryLimit: options?.memoryLimit,
      autoCleanup: true
    });
    this.concurrency = new ConcurrencyController(options?.maxConcurrent);
    this.virtualization = new VirtualizationManager({ pageSize: options?.pageSize });
    this.computation = new ComputationOptimizer();
    this.requestMerger = new RequestMerger({ ttl: options?.requestTTL });
  }
  /**
   * 性能监控
   */
  getMetrics() {
    return {
      memoryUsage: this.memory.estimateMemoryUsage(),
      activeTasks: this.concurrency.getActiveCount(),
      queuedTasks: this.concurrency.getQueueLength(),
      preloadQueue: this.preload.size
    };
  }
  /**
   * 清理所有资源
   */
  dispose() {
    this.lazyLoad.clear();
    this.preload.clear();
    this.memory.stopAutoCleanup();
    this.concurrency.clear();
    this.computation.clearCache();
    this.requestMerger.clearCache();
  }
}

export { ComputationOptimizer, ConcurrencyController, EnhancedPerformanceOptimizer, LazyLoadManager, MemoryManager, PreloadManager, RequestMerger, VirtualizationManager };
//# sourceMappingURL=EnhancedPerformance.js.map
