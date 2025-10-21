/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { effectScope, onScopeDispose } from 'vue';

class CircularDependencyDetector {
  /**
   * 开始依赖追踪
   */
  static startTracking(id) {
    if (this.currentPath.includes(id)) {
      const cycle = [...this.currentPath, id];
      const cycleStart = cycle.indexOf(id);
      const cyclePath = cycle.slice(cycleStart).join(" -> ");
      throw new Error(`Circular dependency detected: ${cyclePath}
This can cause infinite loops and memory leaks.
Please refactor your store dependencies.`);
    }
    this.currentPath.push(id);
  }
  /**
   * 结束依赖追踪
   */
  static endTracking(id) {
    const index = this.currentPath.indexOf(id);
    if (index >= 0) {
      this.currentPath.splice(index, 1);
    }
  }
  /**
   * 添加依赖关系
   */
  static addDependency(from, to) {
    if (!this.dependencies.has(from)) {
      this.dependencies.set(from, /* @__PURE__ */ new Set());
    }
    this.dependencies.get(from).add(to);
    this.checkCycle(from);
  }
  /**
   * 检查循环依赖
   */
  static checkCycle(start, visited = /* @__PURE__ */ new Set(), path = []) {
    if (visited.has(start)) {
      if (path.includes(start)) {
        const cycleStart = path.indexOf(start);
        const cycle = path.slice(cycleStart).concat(start);
        console.warn(`Warning: Potential circular dependency detected: ${cycle.join(" -> ")}`);
      }
      return;
    }
    visited.add(start);
    path.push(start);
    const deps = this.dependencies.get(start);
    if (deps) {
      deps.forEach((dep) => {
        this.checkCycle(dep, visited, [...path]);
      });
    }
  }
  /**
   * 清理依赖记录
   */
  static clear() {
    this.dependencies.clear();
    this.currentPath = [];
  }
  /**
   * 获取依赖图
   */
  static getDependencyGraph() {
    return new Map(this.dependencies);
  }
}
CircularDependencyDetector.dependencies = /* @__PURE__ */ new Map();
CircularDependencyDetector.currentPath = [];
class MemoryLeakGuard {
  /**
   * 创建受保护的作用域
   */
  static createScope(owner) {
    const scope = effectScope();
    this.scopes.set(owner, scope);
    scope.run(() => {
      onScopeDispose(() => {
        this.cleanup(owner);
      });
    });
    return scope;
  }
  /**
   * 在作用域内运行
   */
  static runInScope(owner, fn) {
    let scope = this.scopes.get(owner);
    if (!scope) {
      scope = this.createScope(owner);
    }
    return scope.run(fn);
  }
  /**
   * 添加监听器
   */
  static addWatcher(owner, watcher) {
    if (!this.watchers.has(owner)) {
      this.watchers.set(owner, /* @__PURE__ */ new Set());
    }
    this.watchers.get(owner).add(watcher);
  }
  /**
   * 添加定时器
   */
  static addTimer(owner, timer) {
    if (!this.timers.has(owner)) {
      this.timers.set(owner, /* @__PURE__ */ new Set());
    }
    this.timers.get(owner).add(timer);
  }
  /**
   * 添加事件监听器
   */
  static addEventListener(owner, target, type, listener, options) {
    if (!this.listeners.has(owner)) {
      this.listeners.set(owner, /* @__PURE__ */ new Map());
    }
    const ownerListeners = this.listeners.get(owner);
    if (!ownerListeners.has(target)) {
      ownerListeners.set(target, /* @__PURE__ */ new Map());
    }
    const targetListeners = ownerListeners.get(target);
    if (targetListeners.has(type)) {
      const oldListener = targetListeners.get(type);
      target.removeEventListener(type, oldListener, options);
    }
    target.addEventListener(type, listener, options);
    targetListeners.set(type, listener);
  }
  /**
   * 清理资源
   */
  static cleanup(owner) {
    const scope = this.scopes.get(owner);
    if (scope) {
      scope.stop();
      this.scopes.delete(owner);
    }
    const watchers = this.watchers.get(owner);
    if (watchers) {
      watchers.forEach((stop) => stop());
      this.watchers.delete(owner);
    }
    const timers = this.timers.get(owner);
    if (timers) {
      timers.forEach((timer) => clearTimeout(timer));
      this.timers.delete(owner);
    }
    const listeners = this.listeners.get(owner);
    if (listeners) {
      listeners.forEach((targetListeners, target) => {
        targetListeners.forEach((listener, type) => {
          target.removeEventListener(type, listener);
        });
      });
      this.listeners.delete(owner);
    }
  }
  /**
   * 检查是否有泄漏
   */
  static hasLeaks(owner) {
    return !!(this.scopes.has(owner) || this.watchers.has(owner) || this.timers.has(owner) || this.listeners.has(owner));
  }
}
MemoryLeakGuard.scopes = /* @__PURE__ */ new WeakMap();
MemoryLeakGuard.watchers = /* @__PURE__ */ new WeakMap();
MemoryLeakGuard.timers = /* @__PURE__ */ new WeakMap();
MemoryLeakGuard.listeners = /* @__PURE__ */ new WeakMap();
class AsyncRaceConditionHandler {
  /**
   * 执行异步操作（自动取消旧的）
   */
  static async execute(owner, key, executor) {
    this.cancel(owner, key);
    const controller = new AbortController();
    if (!this.requestMap.has(owner)) {
      this.requestMap.set(owner, /* @__PURE__ */ new Map());
    }
    this.requestMap.get(owner).set(key, controller);
    if (!this.versionMap.has(owner)) {
      this.versionMap.set(owner, /* @__PURE__ */ new Map());
    }
    const versionMap = this.versionMap.get(owner);
    const version = (versionMap.get(key) || 0) + 1;
    versionMap.set(key, version);
    try {
      const result = await executor(controller.signal);
      const currentVersion = versionMap.get(key);
      if (currentVersion !== version) {
        throw new Error("Stale request");
      }
      return result;
    } finally {
      const requests = this.requestMap.get(owner);
      if (requests?.get(key) === controller) {
        requests.delete(key);
      }
    }
  }
  /**
   * 取消请求
   */
  static cancel(owner, key) {
    const requests = this.requestMap.get(owner);
    const controller = requests?.get(key);
    if (controller) {
      controller.abort();
      requests.delete(key);
    }
  }
  /**
   * 取消所有请求
   */
  static cancelAll(owner) {
    const requests = this.requestMap.get(owner);
    if (requests) {
      requests.forEach((controller) => controller.abort());
      requests.clear();
    }
  }
  /**
   * 防抖执行
   */
  static debounce(fn, delay) {
    let timeoutId = null;
    return function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
        timeoutId = null;
      }, delay);
    };
  }
  /**
   * 节流执行
   */
  static throttle(fn, limit) {
    let inThrottle = false;
    return function(...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }
  /**
   * 并发控制
   */
  static createConcurrencyLimiter(maxConcurrent) {
    let running = 0;
    const queue = [];
    const run = async (fn) => {
      if (running >= maxConcurrent) {
        await new Promise((resolve) => {
          queue.push(resolve);
        });
      }
      running++;
      try {
        return await fn();
      } finally {
        running--;
        const next = queue.shift();
        if (next) {
          next();
        }
      }
    };
    return { run };
  }
}
AsyncRaceConditionHandler.requestMap = /* @__PURE__ */ new WeakMap();
AsyncRaceConditionHandler.versionMap = /* @__PURE__ */ new WeakMap();
class EnhancedErrorHandler {
  /**
   * 注册错误处理器
   */
  static register(type, handler) {
    this.errorHandlers.set(type, handler);
  }
  /**
   * 设置全局错误处理器
   */
  static setGlobalHandler(handler) {
    this.globalHandler = handler;
  }
  /**
   * 处理错误
   */
  static handle(error, context) {
    const handler = this.errorHandlers.get(error.constructor.name);
    if (handler) {
      try {
        handler(error, context);
        return;
      } catch (handlerError) {
        console.error("Error in error handler:", handlerError);
      }
    }
    if (this.globalHandler) {
      this.globalHandler(error, context);
    } else {
      console.error("Unhandled error:", error, context);
    }
  }
  /**
   * 包装函数以捕获错误
   */
  static wrap(fn, context) {
    return ((...args) => {
      try {
        const result = fn.apply(this, args);
        if (result instanceof Promise) {
          return result.catch((error) => {
            this.handle(error, context);
            throw error;
          });
        }
        return result;
      } catch (error) {
        this.handle(error, context);
        throw error;
      }
    });
  }
  /**
   * 创建安全的异步函数
   */
  static safeAsync(fn, fallback) {
    return (async (...args) => {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        this.handle(error);
        if (fallback !== void 0) {
          return typeof fallback === "function" ? fallback(error) : fallback;
        }
        throw error;
      }
    });
  }
}
EnhancedErrorHandler.errorHandlers = /* @__PURE__ */ new Map();
EnhancedErrorHandler.globalHandler = null;
class TypeSafetyEnhancer {
  /**
   * 运行时类型检查
   */
  static validateType(value, validator) {
    return validator.validate(value);
  }
  /**
   * 创建类型守卫
   */
  static createGuard(validator) {
    return (value) => validator(value);
  }
  /**
   * 安全的类型转换
   */
  static safeCast(value, type, fallback) {
    if (value instanceof type) {
      return value;
    }
    if (fallback !== void 0) {
      return fallback;
    }
    throw new TypeError(`Expected instance of ${type.name}, got ${typeof value}`);
  }
  /**
   * 深度冻结对象
   */
  static deepFreeze(obj) {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const value = obj[prop];
      if (value && typeof value === "object") {
        this.deepFreeze(value);
      }
    });
    return obj;
  }
  /**
   * 创建不可变对象
   */
  static createImmutable(obj) {
    return new Proxy(this.deepFreeze({ ...obj }), {
      set() {
        throw new Error("Cannot modify immutable object");
      },
      deleteProperty() {
        throw new Error("Cannot delete property from immutable object");
      }
    });
  }
}
class ResourceCleaner {
  constructor() {
    this.cleanupTasks = /* @__PURE__ */ new Set();
  }
  /**
   * 注册清理任务
   */
  register(task) {
    this.cleanupTasks.add(task);
  }
  /**
   * 执行清理
   */
  async cleanup() {
    const tasks = Array.from(this.cleanupTasks);
    this.cleanupTasks.clear();
    await Promise.all(tasks.map(async (task) => {
      try {
        await task();
      } catch (error) {
        console.error("Cleanup task failed:", error);
      }
    }));
  }
  /**
   * 创建可清理的资源
   */
  createDisposable(resource, cleanup) {
    this.register(() => cleanup(resource));
    return {
      resource,
      dispose: async () => {
        await cleanup(resource);
        this.cleanupTasks.delete(() => cleanup(resource));
      }
    };
  }
}
const detectCircularDependency = CircularDependencyDetector.startTracking.bind(CircularDependencyDetector);
const endCircularDependencyDetection = CircularDependencyDetector.endTracking.bind(CircularDependencyDetector);
const guardMemoryLeak = MemoryLeakGuard.createScope.bind(MemoryLeakGuard);
const cleanupResources = MemoryLeakGuard.cleanup.bind(MemoryLeakGuard);
const handleAsyncRace = AsyncRaceConditionHandler.execute.bind(AsyncRaceConditionHandler);
const handleError = EnhancedErrorHandler.handle.bind(EnhancedErrorHandler);
const validateType = TypeSafetyEnhancer.validateType.bind(TypeSafetyEnhancer);

export { AsyncRaceConditionHandler, CircularDependencyDetector, EnhancedErrorHandler, MemoryLeakGuard, ResourceCleaner, TypeSafetyEnhancer, cleanupResources, detectCircularDependency, endCircularDependencyDetection, guardMemoryLeak, handleAsyncRace, handleError, validateType };
//# sourceMappingURL=BugFixes.js.map
