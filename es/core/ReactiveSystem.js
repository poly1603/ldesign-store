/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { reactive, shallowRef, triggerRef, readonly, customRef } from 'vue';

class BatchUpdateManager {
  constructor() {
    this.updateQueue = /* @__PURE__ */ new Set();
    this.isFlushPending = false;
    this.flushPromise = null;
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new BatchUpdateManager();
    }
    return this.instance;
  }
  /**
   * 添加更新到队列
   */
  queueUpdate(updater) {
    this.updateQueue.add(updater);
    this.scheduleFlush();
  }
  /**
   * 调度刷新 - 使用queueMicrotask优化性能
   */
  scheduleFlush() {
    if (!this.isFlushPending) {
      this.isFlushPending = true;
      if (typeof queueMicrotask !== "undefined") {
        this.flushPromise = new Promise((resolve) => {
          queueMicrotask(() => {
            this.flush();
            resolve();
          });
        });
      } else {
        this.flushPromise = Promise.resolve().then(() => this.flush());
      }
    }
  }
  /**
   * 执行所有更新（优化版：减少迭代开销）
   */
  flush() {
    const updates = Array.from(this.updateQueue);
    this.updateQueue.clear();
    this.isFlushPending = false;
    this.flushPromise = null;
    const len = updates.length;
    for (let i = 0; i < len; i++) {
      try {
        updates[i]();
      } catch (error) {
        console.error("Batch update error:", error);
      }
    }
  }
  /**
   * 等待所有更新完成
   */
  async waitForFlush() {
    if (this.flushPromise) {
      await this.flushPromise;
    }
  }
  /**
   * 立即执行所有更新
   */
  flushSync() {
    if (this.isFlushPending) {
      this.flush();
    }
  }
}
class SmartCacheManager {
  constructor(ttl = 5e3, maxSize) {
    this.cache = /* @__PURE__ */ new WeakMap();
    this.accessCount = /* @__PURE__ */ new WeakMap();
    this.ttl = ttl;
    this.maxSize = maxSize;
  }
  /**
   * 获取缓存值
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return void 0;
    }
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return void 0;
    }
    const count = this.accessCount.get(key) || 0;
    this.accessCount.set(key, count + 1);
    return entry.value;
  }
  /**
   * 设置缓存值
   */
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    if (!this.accessCount.has(key)) {
      this.accessCount.set(key, 0);
    }
  }
  /**
   * 删除缓存
   */
  delete(key) {
    this.accessCount.delete(key);
    return this.cache.delete(key);
  }
  /**
   * 清空缓存
   */
  clear() {
    this.cache = /* @__PURE__ */ new WeakMap();
    this.accessCount = /* @__PURE__ */ new WeakMap();
  }
  /**
   * 获取或设置缓存
   */
  getOrSet(key, factory) {
    let value = this.get(key);
    if (value === void 0) {
      value = factory();
      this.set(key, value);
    }
    return value;
  }
}
class VirtualProxy {
  constructor(factory) {
    this.target = null;
    this.isInitialized = false;
    this.initPromise = null;
    this.factory = async () => {
      const result = factory();
      return result instanceof Promise ? await result : result;
    };
  }
  /**
   * 获取代理对象
   */
  getProxy() {
    return new Proxy({}, {
      get: (_, prop) => {
        if (!this.isInitialized) {
          this.initialize();
        }
        if (this.target) {
          return Reflect.get(this.target, prop);
        }
        return this.initPromise?.then((target) => Reflect.get(target, prop));
      },
      set: (_, prop, value) => {
        if (!this.isInitialized) {
          this.initialize();
        }
        if (this.target) {
          return Reflect.set(this.target, prop, value);
        }
        return false;
      },
      has: (_, prop) => {
        if (!this.isInitialized) {
          this.initialize();
        }
        if (this.target) {
          return Reflect.has(this.target, prop);
        }
        return false;
      }
    });
  }
  /**
   * 初始化目标对象
   */
  async initialize() {
    if (this.isInitialized || this.initPromise) {
      return;
    }
    this.initPromise = this.factory();
    this.target = await this.initPromise;
    this.isInitialized = true;
  }
  /**
   * 强制初始化
   */
  async forceInit() {
    await this.initialize();
    return this.target;
  }
  /**
   * 是否已初始化
   */
  get initialized() {
    return this.isInitialized;
  }
}
class ComputedOptimizer {
  constructor(getter, setter) {
    this.isDirty = true;
    this.deps = /* @__PURE__ */ new Set();
    this.getter = getter;
    this.setter = setter;
  }
  /**
   * 获取计算值
   */
  get value() {
    if (this.isDirty) {
      this.cache = this.getter();
      this.isDirty = false;
    }
    return this.cache;
  }
  /**
   * 设置计算值
   */
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    } else {
      console.warn("Computed value is readonly");
    }
  }
  /**
   * 标记为脏数据
   */
  invalidate() {
    this.isDirty = true;
  }
  /**
   * 创建响应式计算属性
   */
  toRef() {
    return customRef((track, trigger) => {
      return {
        get: () => {
          track();
          return this.value;
        },
        set: (newValue) => {
          this.value = newValue;
          trigger();
        }
      };
    });
  }
}
class ReactiveOptimizer {
  constructor() {
    this.batchManager = BatchUpdateManager.getInstance();
    this.computedCache = new SmartCacheManager();
    this.proxyCache = /* @__PURE__ */ new WeakMap();
  }
  /**
   * 创建优化的响应式状态
   */
  createOptimizedReactive(target) {
    const cached = this.proxyCache.get(target);
    if (cached) {
      return cached;
    }
    const proxy = reactive(target);
    this.proxyCache.set(target, proxy);
    return proxy;
  }
  /**
   * 创建浅响应式状态
   */
  createShallowReactive(value) {
    const ref = shallowRef(value);
    return {
      value: ref.value,
      setValue(newValue) {
        ref.value = newValue;
        triggerRef(ref);
      },
      trigger() {
        triggerRef(ref);
      }
    };
  }
  /**
   * 创建只读状态
   */
  createReadonly(target) {
    return readonly(target);
  }
  /**
   * 批量更新状态
   */
  batchUpdate(updater) {
    this.batchManager.queueUpdate(updater);
  }
  /**
   * 同步批量更新
   */
  batchUpdateSync(updater) {
    updater();
    this.batchManager.flushSync();
  }
  /**
   * 创建优化的计算属性
   */
  createComputed(getter, setter) {
    return new ComputedOptimizer(getter, setter);
  }
  /**
   * 创建虚拟代理
   */
  createVirtualProxy(factory) {
    const proxy = new VirtualProxy(factory);
    return proxy.getProxy();
  }
}
class MemoryManager {
  constructor() {
    this.cleanupCallbacks = /* @__PURE__ */ new Map();
    this.registry = typeof globalThis.FinalizationRegistry !== "undefined" ? new globalThis.FinalizationRegistry((id) => {
      const callback = this.cleanupCallbacks.get(id);
      if (callback) {
        try {
          callback();
        } catch (error) {
          console.error(`Memory cleanup error for ${id}:`, error);
        } finally {
          this.cleanupCallbacks.delete(id);
        }
      }
    }) : null;
    this.weakRefs = /* @__PURE__ */ new Map();
    this.cleanupTimers = /* @__PURE__ */ new Map();
  }
  /**
   * 注册对象进行自动清理
   */
  register(obj, id, cleanup) {
    if (typeof globalThis.WeakRef !== "undefined") {
      const weakRef = new globalThis.WeakRef(obj);
      this.weakRefs.set(obj, weakRef);
    }
    if (this.registry) {
      this.registry.register(obj, id, obj);
      if (cleanup) {
        this.cleanupCallbacks.set(id, cleanup);
      }
    }
    this.scheduleCleanup(id);
  }
  /**
   * 手动清理对象
   */
  unregister(obj) {
    this.weakRefs.delete(obj);
    if (this.registry) {
      this.registry.unregister(obj);
    }
  }
  /**
   * 调度清理检查
   */
  scheduleCleanup(id) {
    const existingTimer = this.cleanupTimers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = setTimeout(() => {
      this.performCleanup(id);
      this.cleanupTimers.delete(id);
    }, 3e5);
    this.cleanupTimers.set(id, timer);
  }
  /**
   * 执行清理
   */
  performCleanup(id) {
    for (const [obj, weakRef] of Array.from(this.weakRefs.entries())) {
      if (weakRef && typeof weakRef.deref === "function") {
        const target = weakRef.deref();
        if (!target) {
          this.weakRefs.delete(obj);
          const cleanup = this.cleanupCallbacks.get(id);
          if (cleanup) {
            try {
              cleanup();
            } catch (error) {
              console.error(`Cleanup error for ${id}:`, error);
            }
            this.cleanupCallbacks.delete(id);
          }
        }
      }
    }
  }
  /**
   * 清理所有资源
   */
  dispose() {
    this.cleanupTimers.forEach((timer) => clearTimeout(timer));
    this.cleanupTimers.clear();
    for (const [id, cleanup] of this.cleanupCallbacks.entries()) {
      try {
        cleanup();
      } catch (error) {
        console.error(`Dispose cleanup error for ${id}:`, error);
      }
    }
    this.cleanupCallbacks.clear();
    this.weakRefs = /* @__PURE__ */ new Map();
  }
}
class DependencyTracker {
  constructor() {
    this.dependencies = /* @__PURE__ */ new Map();
    this.effectScopes = /* @__PURE__ */ new WeakMap();
  }
  /**
   * 收集依赖
   */
  track(target, key, effect) {
    const id = this.getTargetKey(target, key);
    if (!this.dependencies.has(id)) {
      this.dependencies.set(id, /* @__PURE__ */ new Set());
    }
    this.dependencies.get(id).add(effect);
    if (!this.effectScopes.has(target)) {
      this.effectScopes.set(target, /* @__PURE__ */ new Set());
    }
    this.effectScopes.get(target).add(key);
  }
  /**
   * 触发更新（优化版：减少 Set 复制开销）
   */
  trigger(target, key) {
    const id = this.getTargetKey(target, key);
    const effects = this.dependencies.get(id);
    if (effects && effects.size > 0) {
      if (effects.size === 1) {
        const effect = effects.values().next().value;
        if (effect.scheduler) {
          effect.scheduler();
        } else {
          effect.run();
        }
      } else {
        const effectsToRun = Array.from(effects);
        const len = effectsToRun.length;
        for (let i = 0; i < len; i++) {
          const effect = effectsToRun[i];
          if (effect.scheduler) {
            effect.scheduler();
          } else {
            effect.run();
          }
        }
      }
    }
  }
  /**
   * 清理依赖
   */
  cleanup(target, key) {
    if (key) {
      const id = this.getTargetKey(target, key);
      this.dependencies.delete(id);
    } else {
      const keys = this.effectScopes.get(target);
      if (keys) {
        keys.forEach((k) => {
          const id = this.getTargetKey(target, k);
          this.dependencies.delete(id);
        });
        this.effectScopes.delete(target);
      }
    }
  }
  /**
   * 生成唯一标识
   */
  getTargetKey(target, key) {
    return `${target.constructor.name}_${key}`;
  }
}
const batchUpdateManager = BatchUpdateManager.getInstance();
const reactiveOptimizer = new ReactiveOptimizer();
const memoryManager = new MemoryManager();
const dependencyTracker = new DependencyTracker();
function batchUpdate(updater) {
  batchUpdateManager.queueUpdate(updater);
}
function batchUpdateSync(updater) {
  updater();
  batchUpdateManager.flushSync();
}
async function waitForUpdates() {
  await batchUpdateManager.waitForFlush();
}

export { BatchUpdateManager, ComputedOptimizer, DependencyTracker, MemoryManager, ReactiveOptimizer, SmartCacheManager, VirtualProxy, batchUpdate, batchUpdateManager, batchUpdateSync, dependencyTracker, memoryManager, reactiveOptimizer, waitForUpdates };
//# sourceMappingURL=ReactiveSystem.js.map
