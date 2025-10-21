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

exports.PreloadPriority = void 0;
(function(PreloadPriority2) {
  PreloadPriority2["HIGH"] = "high";
  PreloadPriority2["MEDIUM"] = "medium";
  PreloadPriority2["LOW"] = "low";
})(exports.PreloadPriority || (exports.PreloadPriority = {}));
exports.PreloadStrategy = void 0;
(function(PreloadStrategy2) {
  PreloadStrategy2["PREDICTIVE"] = "predictive";
  PreloadStrategy2["ROUTE_BASED"] = "route-based";
  PreloadStrategy2["TIME_BASED"] = "time-based";
  PreloadStrategy2["VISIBILITY"] = "visibility";
})(exports.PreloadStrategy || (exports.PreloadStrategy = {}));
class SmartPreloader {
  constructor() {
    this.tasks = /* @__PURE__ */ new Map();
    this.results = /* @__PURE__ */ new Map();
    this.queue = [];
    this.loading = /* @__PURE__ */ new Set();
    this.patterns = /* @__PURE__ */ new Map();
    this.currentRoute = "";
    this.routeStartTime = 0;
  }
  /**
   * 注册预加载任务
   */
  register(task) {
    this.tasks.set(task.id, task);
  }
  /**
   * 批量注册任务
   */
  registerBatch(tasks) {
    tasks.forEach((task) => this.register(task));
  }
  /**
   * 取消注册任务
   */
  unregister(taskId) {
    this.tasks.delete(taskId);
    this.results.delete(taskId);
  }
  /**
   * 预加载任务
   */
  async preload(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.warn(`Task ${taskId} not found`);
      return null;
    }
    const cached = this.getCached(taskId);
    if (cached)
      return cached;
    if (this.loading.has(taskId)) {
      return this.waitForLoad(taskId);
    }
    if (task.dependencies && task.dependencies.length > 0) {
      await Promise.all(task.dependencies.map((dep) => this.preload(dep)));
    }
    return this.executeLoad(task);
  }
  /**
   * 批量预加载
   */
  async preloadBatch(taskIds) {
    return Promise.all(taskIds.map((id) => this.preload(id)));
  }
  /**
   * 根据优先级预加载
   */
  async preloadByPriority(priority) {
    const tasks = Array.from(this.tasks.values()).filter((task) => task.priority === priority).sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority));
    for (const task of tasks) {
      await this.preload(task.id);
    }
  }
  /**
   * 智能预加载 - 基于用户行为模式
   */
  async smartPreload(currentRoute) {
    this.updatePattern(currentRoute);
    const predictedRoutes = this.predictNextRoutes(currentRoute);
    const tasks = Array.from(this.tasks.values()).filter((task) => {
      if (task.strategy === exports.PreloadStrategy.PREDICTIVE) {
        return predictedRoutes.some((route) => task.name.includes(route));
      }
      return false;
    });
    tasks.sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority));
    const highPriority = tasks.filter((t) => t.priority === exports.PreloadPriority.HIGH);
    await Promise.all(highPriority.map((t) => this.preload(t.id)));
    const mediumPriority = tasks.filter((t) => t.priority === exports.PreloadPriority.MEDIUM);
    this.scheduleIdleLoad(mediumPriority);
    const lowPriority = tasks.filter((t) => t.priority === exports.PreloadPriority.LOW);
    this.scheduleDelayedLoad(lowPriority);
  }
  /**
   * 获取预加载结果
   */
  getResult(taskId) {
    return this.results.get(taskId) || null;
  }
  /**
   * 清除缓存
   */
  clearCache(taskId) {
    if (taskId) {
      this.results.delete(taskId);
    } else {
      this.results.clear();
    }
  }
  /**
   * 执行加载
   */
  async executeLoad(task) {
    this.loading.add(task.id);
    const startTime = Date.now();
    try {
      const timeout = task.timeout || 3e4;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), timeout);
      });
      const data = await Promise.race([task.loader(), timeoutPromise]);
      const loadTime = Date.now() - startTime;
      const result = {
        id: task.id,
        data,
        success: true,
        loadTime,
        cachedAt: Date.now()
      };
      this.results.set(task.id, result);
      this.loading.delete(task.id);
      return result;
    } catch (error) {
      const loadTime = Date.now() - startTime;
      const result = {
        id: task.id,
        data: null,
        success: false,
        error,
        loadTime
      };
      if (task.retries && task.retries > 0) {
        task.retries--;
        return this.executeLoad(task);
      }
      this.results.set(task.id, result);
      this.loading.delete(task.id);
      return result;
    }
  }
  /**
   * 等待加载完成
   */
  async waitForLoad(taskId) {
    return new Promise((resolve) => {
      const check = () => {
        if (!this.loading.has(taskId)) {
          resolve(this.results.get(taskId) || null);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
  /**
   * 获取缓存结果
   */
  getCached(taskId) {
    const result = this.results.get(taskId);
    if (!result || !result.success)
      return null;
    const task = this.tasks.get(taskId);
    if (!task || !task.cacheDuration)
      return result;
    const now = Date.now();
    if (result.cachedAt && now - result.cachedAt < task.cacheDuration) {
      return result;
    }
    return null;
  }
  /**
   * 更新行为模式
   */
  updatePattern(route) {
    const now = Date.now();
    if (this.currentRoute) {
      const pattern = this.patterns.get(this.currentRoute);
      if (pattern) {
        const duration = now - this.routeStartTime;
        pattern.avgDuration = (pattern.avgDuration * pattern.count + duration) / (pattern.count + 1);
        pattern.count++;
        pattern.lastVisit = now;
        const nextCount = pattern.nextRoutes.get(route) || 0;
        pattern.nextRoutes.set(route, nextCount + 1);
      }
    }
    if (!this.patterns.has(route)) {
      this.patterns.set(route, {
        route,
        count: 0,
        lastVisit: now,
        avgDuration: 0,
        nextRoutes: /* @__PURE__ */ new Map()
      });
    }
    this.currentRoute = route;
    this.routeStartTime = now;
  }
  /**
   * 预测下一步路由
   */
  predictNextRoutes(currentRoute) {
    const pattern = this.patterns.get(currentRoute);
    if (!pattern || pattern.nextRoutes.size === 0)
      return [];
    const sorted = Array.from(pattern.nextRoutes.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return sorted.map(([route]) => route);
  }
  /**
   * 空闲时加载
   */
  scheduleIdleLoad(tasks) {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => {
        tasks.forEach((task) => this.preload(task.id));
      });
    } else {
      setTimeout(() => {
        tasks.forEach((task) => this.preload(task.id));
      }, 100);
    }
  }
  /**
   * 延迟加载
   */
  scheduleDelayedLoad(tasks) {
    setTimeout(() => {
      tasks.forEach((task) => this.preload(task.id));
    }, 2e3);
  }
  /**
   * 获取优先级值
   */
  getPriorityValue(priority) {
    switch (priority) {
      case exports.PreloadPriority.HIGH:
        return 1;
      case exports.PreloadPriority.MEDIUM:
        return 2;
      case exports.PreloadPriority.LOW:
        return 3;
      default:
        return 999;
    }
  }
}
function createSmartPreloader() {
  return new SmartPreloader();
}

exports.SmartPreloader = SmartPreloader;
exports.createSmartPreloader = createSmartPreloader;
//# sourceMappingURL=SmartPreloader.cjs.map
