/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
class EnhancedPerformanceMonitor {
  constructor() {
    this.metrics = /* @__PURE__ */ new Map();
    this.marks = /* @__PURE__ */ new Map();
    this.stats = /* @__PURE__ */ new Map();
  }
  /**
   * 标记性能测量点
   */
  mark(name) {
    this.marks.set(name, performance.now());
  }
  /**
   * 测量两个标记点之间的性能
   */
  measure(name, startMark, endMark) {
    const endTime = endMark ? this.marks.get(endMark) : performance.now();
    const startTime = startMark ? this.marks.get(startMark) : this.marks.get(name);
    if (startTime === void 0) {
      throw new Error(`Start mark "${startMark || name}" not found`);
    }
    if (endTime === void 0) {
      throw new Error(`End mark "${endMark}" not found`);
    }
    const duration = endTime - startTime;
    const memory = this.getMemoryUsage();
    const metric = {
      duration,
      memory,
      timestamp: Date.now(),
      operation: name
    };
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);
    this.updateStats(name, duration);
    return metric;
  }
  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        used: usage.heapUsed,
        total: usage.heapTotal,
        external: usage.external
      };
    }
    if (typeof performance !== "undefined" && "memory" in performance) {
      const memory = performance.memory;
      return {
        used: memory.usedJSHeapSize || 0,
        total: memory.totalJSHeapSize || 0,
        external: 0
      };
    }
    return void 0;
  }
  /**
   * 更新统计信息
   */
  updateStats(name, duration) {
    const existing = this.stats.get(name);
    if (!existing) {
      this.stats.set(name, {
        count: 1,
        avgDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        totalDuration: duration,
        lastExecution: Date.now()
      });
    } else {
      const newCount = existing.count + 1;
      const newTotal = existing.totalDuration + duration;
      this.stats.set(name, {
        count: newCount,
        avgDuration: newTotal / newCount,
        minDuration: Math.min(existing.minDuration, duration),
        maxDuration: Math.max(existing.maxDuration, duration),
        totalDuration: newTotal,
        lastExecution: Date.now()
      });
    }
  }
  /**
   * 获取指定操作的所有指标
   */
  getMetrics(name) {
    return this.metrics.get(name) || [];
  }
  /**
   * 获取指定操作的统计信息
   */
  getStats(name) {
    return this.stats.get(name);
  }
  /**
   * 获取所有统计信息
   */
  getAllStats() {
    return new Map(this.stats);
  }
  /**
   * 清理指定操作的数据
   */
  clear(name) {
    if (name) {
      this.metrics.delete(name);
      this.marks.delete(name);
      this.stats.delete(name);
    } else {
      this.metrics.clear();
      this.marks.clear();
      this.stats.clear();
    }
  }
  /**
   * 生成性能报告
   */
  generateReport() {
    const report = ["=== \u6027\u80FD\u76D1\u63A7\u62A5\u544A ===\n"];
    for (const [name, stats] of this.stats) {
      report.push(`\u64CD\u4F5C: ${name}`);
      report.push(`  \u6267\u884C\u6B21\u6570: ${stats.count}`);
      report.push(`  \u5E73\u5747\u8017\u65F6: ${stats.avgDuration.toFixed(2)}ms`);
      report.push(`  \u6700\u5C0F\u8017\u65F6: ${stats.minDuration.toFixed(2)}ms`);
      report.push(`  \u6700\u5927\u8017\u65F6: ${stats.maxDuration.toFixed(2)}ms`);
      report.push(`  \u603B\u8017\u65F6: ${stats.totalDuration.toFixed(2)}ms`);
      report.push(`  \u6700\u540E\u6267\u884C: ${new Date(stats.lastExecution).toISOString()}`);
      report.push("");
    }
    return report.join("\n");
  }
  /**
   * 异步测量函数执行性能
   */
  async measureAsync(name, fn) {
    this.mark(`${name}-start`);
    try {
      const result = await fn();
      this.measure(name, `${name}-start`);
      return result;
    } catch (error) {
      this.measure(name, `${name}-start`);
      throw error;
    }
  }
  /**
   * 同步测量函数执行性能
   */
  measureSync(name, fn) {
    this.mark(`${name}-start`);
    try {
      const result = fn();
      this.measure(name, `${name}-start`);
      return result;
    } catch (error) {
      this.measure(name, `${name}-start`);
      throw error;
    }
  }
}
const performanceMonitor = new EnhancedPerformanceMonitor();
function measurePerformance(name) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const operationName = name || `${target.constructor.name}.${propertyKey}`;
    descriptor.value = function(...args) {
      return performanceMonitor.measureSync(operationName, () => {
        return originalMethod.apply(this, args);
      });
    };
    return descriptor;
  };
}
function measureAsyncPerformance(name) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const operationName = name || `${target.constructor.name}.${propertyKey}`;
    descriptor.value = async function(...args) {
      return performanceMonitor.measureAsync(operationName, () => {
        return originalMethod.apply(this, args);
      });
    };
    return descriptor;
  };
}

export { EnhancedPerformanceMonitor, measureAsyncPerformance, measurePerformance, performanceMonitor };
//# sourceMappingURL=performance-monitor.js.map
