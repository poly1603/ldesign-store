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

class StorePool {
  constructor(options) {
    this.pools = /* @__PURE__ */ new Map();
    this.options = {
      maxSize: 20,
      // 优化：降低最大池大小，减少内存占用
      maxIdleTime: 3e5,
      // 5分钟
      enableGC: true
    };
    if (options) {
      this.options = { ...this.options, ...options };
    }
    if (this.options.enableGC) {
      this.startGC();
    }
  }
  static getInstance(options) {
    if (!StorePool.instance) {
      StorePool.instance = new StorePool(options);
    }
    return StorePool.instance;
  }
  /**
   * 获取 Store 实例（优化版：快速路径优化）
   */
  getStore(storeClass, id, ...args) {
    const className = storeClass.name;
    const pool = this.pools.get(className);
    if (pool) {
      const instances = pool.instances;
      if (instances.length > 0) {
        const instance2 = instances.pop();
        pool.lastUsed.set(instance2, Date.now());
        if (typeof instance2._reinitialize === "function") {
          instance2._reinitialize(id, ...args);
        } else {
          instance2.$reset();
        }
        return instance2;
      }
    }
    const StoreClass = storeClass;
    const instance = new StoreClass(id, ...args);
    this.trackInstance(className, instance);
    return instance;
  }
  /**
   * 归还 Store 实例到池中
   */
  returnStore(instance) {
    const className = instance.constructor.name;
    let pool = this.pools.get(className);
    if (!pool) {
      pool = {
        instances: [],
        lastUsed: /* @__PURE__ */ new Map()
      };
      this.pools.set(className, pool);
    }
    if (pool.instances.length >= this.options.maxSize) {
      instance.$dispose();
      return;
    }
    instance.$reset();
    pool.instances.push(instance);
    pool.lastUsed.set(instance, Date.now());
  }
  /**
   * 跟踪实例
   */
  trackInstance(className, instance) {
    let pool = this.pools.get(className);
    if (!pool) {
      pool = {
        instances: [],
        lastUsed: /* @__PURE__ */ new Map()
      };
      this.pools.set(className, pool);
    }
    pool.lastUsed.set(instance, Date.now());
  }
  /**
   * 启动垃圾回收
   */
  startGC() {
    this.gcTimer = setInterval(() => {
      this.collectGarbage();
    }, this.options.maxIdleTime / 2);
  }
  /**
   * 垃圾回收
   */
  collectGarbage() {
    const now = Date.now();
    for (const [className, pool] of this.pools.entries()) {
      const instancesToRemove = [];
      for (const [instance, lastUsed] of pool.lastUsed.entries()) {
        if (now - lastUsed > this.options.maxIdleTime) {
          instancesToRemove.push(instance);
        }
      }
      for (const instance of instancesToRemove) {
        const index = pool.instances.indexOf(instance);
        if (index !== -1) {
          pool.instances.splice(index, 1);
        }
        pool.lastUsed.delete(instance);
        instance.$dispose();
      }
      if (pool.instances.length === 0 && pool.lastUsed.size === 0) {
        this.pools.delete(className);
      }
    }
  }
  /**
   * 获取池统计信息
   */
  getStats() {
    const poolDetails = Array.from(this.pools.entries()).map(([className, pool]) => ({
      className,
      poolSize: pool.instances.length,
      activeInstances: pool.lastUsed.size - pool.instances.length
    }));
    return {
      totalPools: this.pools.size,
      totalInstances: poolDetails.reduce((sum, detail) => sum + detail.poolSize + detail.activeInstances, 0),
      poolDetails
    };
  }
  /**
   * 清空所有池
   */
  clear() {
    for (const [, pool] of this.pools.entries()) {
      for (const instance of pool.instances) {
        instance.$dispose();
      }
      pool.instances.length = 0;
      pool.lastUsed.clear();
    }
    this.pools.clear();
  }
  /**
   * 销毁池管理器
   */
  destroy() {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = void 0;
    }
    this.clear();
  }
  /**
   * 预热池
   */
  warmUp(storeClass, count, ...args) {
    const className = storeClass.name;
    let pool = this.pools.get(className);
    if (!pool) {
      pool = {
        instances: [],
        lastUsed: /* @__PURE__ */ new Map()
      };
      this.pools.set(className, pool);
    }
    for (let i = 0; i < count; i++) {
      const StoreClass = storeClass;
      const instance = new StoreClass(`warmup-${i}`, ...args);
      pool.instances.push(instance);
      pool.lastUsed.set(instance, Date.now());
    }
  }
  /**
   * 设置池选项
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
    if (options.enableGC !== void 0) {
      if (options.enableGC && !this.gcTimer) {
        this.startGC();
      } else if (!options.enableGC && this.gcTimer) {
        clearInterval(this.gcTimer);
        this.gcTimer = void 0;
      }
    }
  }
}
function useStorePool(options) {
  return StorePool.getInstance(options);
}
function PooledStore(options) {
  return function(constructor) {
    const pool = StorePool.getInstance(options);
    return class extends constructor {
      constructor(...args) {
        super(...args);
        const originalDispose = this.$dispose.bind(this);
        this.$dispose = () => {
          originalDispose();
          pool.returnStore(this);
        };
      }
    };
  };
}

exports.PooledStore = PooledStore;
exports.StorePool = StorePool;
exports.useStorePool = useStorePool;
//# sourceMappingURL=storePool.cjs.map
