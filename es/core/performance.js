/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      actionExecutionTime: /* @__PURE__ */ new Map(),
      getterComputationTime: /* @__PURE__ */ new Map(),
      stateUpdateCount: /* @__PURE__ */ new Map(),
      memoryUsage: {
        storeCount: 0,
        cacheSize: 0
      }
    };
  }
  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  /**
   * 记录 Action 执行时间
   */
  recordActionTime(actionName, executionTime) {
    if (!this.metrics.actionExecutionTime.has(actionName)) {
      this.metrics.actionExecutionTime.set(actionName, []);
    }
    const times = this.metrics.actionExecutionTime.get(actionName);
    times.push(executionTime);
    if (times.length > 100) {
      times.shift();
    }
  }
  /**
   * 记录 Getter 计算时间
   */
  recordGetterTime(getterName, computationTime) {
    if (!this.metrics.getterComputationTime.has(getterName)) {
      this.metrics.getterComputationTime.set(getterName, []);
    }
    const times = this.metrics.getterComputationTime.get(getterName);
    times.push(computationTime);
    if (times.length > 100) {
      times.shift();
    }
  }
  /**
   * 记录状态更新次数
   */
  recordStateUpdate(stateName) {
    const count = this.metrics.stateUpdateCount.get(stateName) || 0;
    this.metrics.stateUpdateCount.set(stateName, count + 1);
  }
  /**
   * 更新内存使用情况
   */
  updateMemoryUsage(storeCount, cacheSize) {
    this.metrics.memoryUsage.storeCount = storeCount;
    this.metrics.memoryUsage.cacheSize = cacheSize;
  }
  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    const slowActions = Array.from(this.metrics.actionExecutionTime.entries()).map(([name, times]) => ({
      name,
      avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      maxTime: Math.max(...times)
    })).filter((action) => action.avgTime > 10).sort((a, b) => b.avgTime - a.avgTime);
    const slowGetters = Array.from(this.metrics.getterComputationTime.entries()).map(([name, times]) => ({
      name,
      avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      maxTime: Math.max(...times)
    })).filter((getter) => getter.avgTime > 5).sort((a, b) => b.avgTime - a.avgTime);
    const frequentUpdates = Array.from(this.metrics.stateUpdateCount.entries()).map(([name, count]) => ({ name, count })).filter((update) => update.count > 100).sort((a, b) => b.count - a.count);
    return {
      slowActions,
      slowGetters,
      frequentUpdates,
      memoryUsage: this.metrics.memoryUsage
    };
  }
  /**
   * 清理性能数据
   */
  clearMetrics() {
    this.metrics.actionExecutionTime.clear();
    this.metrics.getterComputationTime.clear();
    this.metrics.stateUpdateCount.clear();
    this.metrics.memoryUsage = {
      storeCount: 0,
      cacheSize: 0
    };
  }
  /**
   * 创建性能装饰器
   */
  createPerformanceDecorator(type) {
    return function(_target, propertyKey, descriptor) {
      const originalMethod = descriptor.value || descriptor.get;
      const monitor = PerformanceMonitor.getInstance();
      if (type === "action" && descriptor.value) {
        descriptor.value = function(...args) {
          const startTime = performance.now();
          const result = originalMethod.apply(this, args);
          if (result && typeof result.then === "function") {
            return result.finally(() => {
              const endTime = performance.now();
              monitor.recordActionTime(propertyKey, endTime - startTime);
            });
          } else {
            const endTime = performance.now();
            monitor.recordActionTime(propertyKey, endTime - startTime);
            return result;
          }
        };
      } else if (type === "getter" && descriptor.get) {
        descriptor.get = function() {
          const startTime = performance.now();
          const result = originalMethod.call(this);
          const endTime = performance.now();
          monitor.recordGetterTime(propertyKey, endTime - startTime);
          return result;
        };
      }
      return descriptor;
    };
  }
}
const MonitorAction = PerformanceMonitor.getInstance().createPerformanceDecorator("action");
const MonitorGetter = PerformanceMonitor.getInstance().createPerformanceDecorator("getter");
function usePerformanceMonitor() {
  return PerformanceMonitor.getInstance();
}
function getOptimizationSuggestions(report) {
  const suggestions = [];
  if (report.slowActions.length > 0) {
    suggestions.push(`\u53D1\u73B0 ${report.slowActions.length} \u4E2A\u6162\u901F Action\uFF0C\u5EFA\u8BAE\u4F7F\u7528 @CachedAction \u6216 @DebouncedAction \u4F18\u5316`);
  }
  if (report.slowGetters.length > 0) {
    suggestions.push(`\u53D1\u73B0 ${report.slowGetters.length} \u4E2A\u6162\u901F Getter\uFF0C\u5EFA\u8BAE\u4F7F\u7528 @CachedGetter \u6216 @MemoizedGetter \u4F18\u5316`);
  }
  if (report.frequentUpdates.length > 0) {
    suggestions.push(`\u53D1\u73B0 ${report.frequentUpdates.length} \u4E2A\u9891\u7E41\u66F4\u65B0\u7684\u72B6\u6001\uFF0C\u5EFA\u8BAE\u4F7F\u7528 @ThrottledAction \u9650\u5236\u66F4\u65B0\u9891\u7387`);
  }
  if (report.memoryUsage.cacheSize > 1e3) {
    suggestions.push("\u7F13\u5B58\u5927\u5C0F\u8FC7\u5927\uFF0C\u5EFA\u8BAE\u8BBE\u7F6E\u7F13\u5B58\u8FC7\u671F\u65F6\u95F4\u6216\u9650\u5236\u7F13\u5B58\u5927\u5C0F");
  }
  if (report.memoryUsage.storeCount > 50) {
    suggestions.push("Store \u5B9E\u4F8B\u8FC7\u591A\uFF0C\u5EFA\u8BAE\u5408\u5E76\u76F8\u5173\u7684 Store \u6216\u4F7F\u7528 Store \u6C60\u7BA1\u7406");
  }
  return suggestions;
}

export { MonitorAction, MonitorGetter, PerformanceMonitor, getOptimizationSuggestions, usePerformanceMonitor };
//# sourceMappingURL=performance.js.map
