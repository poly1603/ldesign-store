/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { EventEmitter } from './utils/event-emitter.js';

class PerformanceMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.metrics = /* @__PURE__ */ new Map();
    this.timers = /* @__PURE__ */ new Map();
    this.counters = /* @__PURE__ */ new Map();
    this.memorySnapshots = [];
    this.isRecording = false;
    this.recordingStartTime = 0;
    this.maxMetricsPerKey = 1e3;
    this.slowThreshold = 16;
    this.slowThreshold = options.slowThreshold ?? this.slowThreshold;
    this.maxMetricsPerKey = options.maxMetricsPerKey ?? this.maxMetricsPerKey;
    if (options.autoStart) {
      this.startRecording();
    }
    if (options.memoryInterval) {
      this.startMemoryMonitoring(options.memoryInterval);
    }
  }
  // 开始记录
  startRecording() {
    this.isRecording = true;
    this.recordingStartTime = performance.now();
    this.emit("recording:start");
  }
  // 停止记录
  stopRecording() {
    this.isRecording = false;
    const endTime = performance.now();
    const report = this.generateReport(this.recordingStartTime, endTime);
    this.emit("recording:stop", report);
    return report;
  }
  // 开始计时
  startTimer(name) {
    if (!this.isRecording)
      return;
    this.timers.set(name, performance.now());
  }
  // 结束计时
  endTimer(name, tags) {
    if (!this.isRecording)
      return 0;
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`);
      return 0;
    }
    const duration = performance.now() - startTime;
    this.timers.delete(name);
    this.recordMetric({
      name: `timer.${name}`,
      value: duration,
      unit: "ms",
      timestamp: Date.now(),
      tags
    });
    if (duration > this.slowThreshold) {
      this.emit("slow:operation", { name, duration, tags });
    }
    return duration;
  }
  // 记录计数器
  increment(name, value = 1) {
    if (!this.isRecording)
      return;
    const current = this.counters.get(name) || 0;
    const newValue = current + value;
    this.counters.set(name, newValue);
    this.recordMetric({
      name: `counter.${name}`,
      value: newValue,
      unit: "count",
      timestamp: Date.now()
    });
  }
  // 记录度量
  recordMetric(metric) {
    if (!this.isRecording)
      return;
    const metrics = this.metrics.get(metric.name) || [];
    metrics.push(metric);
    if (metrics.length > this.maxMetricsPerKey) {
      metrics.shift();
    }
    this.metrics.set(metric.name, metrics);
    this.emit("metric:recorded", metric);
  }
  // 记录内存快照
  takeMemorySnapshot() {
    const memUsage = performance.memory ? {
      heapUsed: performance.memory.usedJSHeapSize || 0,
      heapTotal: performance.memory.totalJSHeapSize || 0,
      external: 0,
      arrayBuffers: 0
    } : {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      arrayBuffers: 0
    };
    const snapshot = {
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers
    };
    this.memorySnapshots.push(snapshot);
    if (this.memorySnapshots.length > 100) {
      this.memorySnapshots.shift();
    }
    return snapshot;
  }
  startMemoryMonitoring(interval = 1e3) {
    if (this.memoryMonitorTimer)
      return;
    this.memoryMonitorTimer = setInterval(() => {
      const snapshot = this.takeMemorySnapshot();
      this.emit("memory:snapshot", snapshot);
      if (this.memorySnapshots.length > 10) {
        const recentSnapshots = this.memorySnapshots.slice(-10);
        const avgGrowth = this.calculateMemoryGrowth(recentSnapshots);
        if (avgGrowth > 1024 * 1024) {
          this.emit("memory:leak:suspected", {
            growth: avgGrowth,
            snapshots: recentSnapshots
          });
        }
      }
    }, interval);
  }
  // 停止内存监控
  stopMemoryMonitoring() {
    if (this.memoryMonitorTimer) {
      clearInterval(this.memoryMonitorTimer);
      this.memoryMonitorTimer = void 0;
    }
  }
  // 计算内存增长率
  calculateMemoryGrowth(snapshots) {
    if (snapshots.length < 2)
      return 0;
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const timeDiff = (last.timestamp - first.timestamp) / 1e3;
    const memDiff = last.heapUsed - first.heapUsed;
    return memDiff / timeDiff;
  }
  // 生成性能报告
  generateReport(startTime, endTime) {
    const duration = endTime - startTime;
    const allMetrics = [];
    const suggestions = [];
    const warnings = [];
    this.metrics.forEach((metrics) => {
      allMetrics.push(...metrics);
    });
    this.analyzeMetrics(allMetrics, suggestions, warnings);
    return {
      startTime,
      endTime,
      duration,
      metrics: allMetrics,
      suggestions,
      warnings
    };
  }
  // 分析指标并生成建议
  analyzeMetrics(metrics, suggestions, warnings) {
    const timerMetrics = metrics.filter((m) => m.name.startsWith("timer."));
    const slowOperations = timerMetrics.filter((m) => m.value > this.slowThreshold);
    if (slowOperations.length > 0) {
      warnings.push(`Found ${slowOperations.length} slow operations (>${this.slowThreshold}ms)`);
      slowOperations.forEach((op) => {
        suggestions.push(`Optimize '${op.name.replace("timer.", "")}': ${op.value.toFixed(2)}ms`);
      });
    }
    const counterMetrics = metrics.filter((m) => m.name.startsWith("counter."));
    counterMetrics.forEach((counter) => {
      if (counter.value > 1e3) {
        suggestions.push(`High count for '${counter.name.replace("counter.", "")}': ${counter.value}`);
      }
    });
    if (this.memorySnapshots.length > 0) {
      const avgMemory = this.memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.memorySnapshots.length;
      if (avgMemory > 100 * 1024 * 1024) {
        warnings.push(`High memory usage: ${(avgMemory / 1024 / 1024).toFixed(2)}MB average`);
      }
    }
  }
  // 清理数据
  clear() {
    this.metrics.clear();
    this.timers.clear();
    this.counters.clear();
    this.memorySnapshots = [];
  }
  // 获取当前指标
  getMetrics(name) {
    if (name) {
      return this.metrics.get(name) || [];
    }
    const allMetrics = [];
    this.metrics.forEach((metrics) => allMetrics.push(...metrics));
    return allMetrics;
  }
  // 获取统计信息
  getMetricStats(metricName) {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0)
      return null;
    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count,
      min: values[0],
      max: values[count - 1],
      avg: sum / count,
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99)
    };
  }
  // 计算百分位数
  percentile(sortedValues, p) {
    const index = Math.ceil(p / 100 * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }
  // 销毁监控器
  destroy() {
    this.stopMemoryMonitoring();
    this.clear();
    this.removeAllListeners();
  }
}
function measurePerformance(monitor) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args) {
      const timerName = `${target.constructor.name}.${propertyKey}`;
      monitor.startTimer(timerName);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        monitor.endTimer(timerName);
      }
    };
    return descriptor;
  };
}
class AutoPerformanceAnalyzer {
  constructor(options = {}) {
    this.options = options;
    this.thresholds = {
      slowOperation: 50,
      // ms
      highMemory: 200 * 1024 * 1024,
      // 200MB
      memoryGrowth: 10 * 1024 * 1024
      // 10MB/min
    };
    this.monitor = new PerformanceMonitor({
      autoStart: true,
      memoryInterval: 5e3
    });
    if (options.thresholds) {
      Object.assign(this.thresholds, options.thresholds);
    }
    this.setupListeners();
    if (options.analysisInterval) {
      this.startAutoAnalysis(options.analysisInterval);
    }
  }
  setupListeners() {
    this.monitor.on("slow:operation", ({ name, duration }) => {
      console.warn(`\u26A0\uFE0F Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      if (this.options.autoFix) {
        this.suggestOptimization(name, duration);
      }
    });
    this.monitor.on("memory:leak:suspected", ({ growth }) => {
      const growthMB = (growth / 1024 / 1024).toFixed(2);
      console.error(`\u{1F6A8} Memory leak suspected: ${growthMB}MB/s growth rate`);
      if (this.options.autoFix) {
        this.attemptMemoryCleanup();
      }
    });
  }
  // 启动自动分析
  startAutoAnalysis(interval) {
    this.analysisInterval = setInterval(() => {
      this.analyze();
    }, interval);
  }
  // 执行分析
  analyze() {
    const report = this.monitor.stopRecording();
    console.log(`\u{1F4CA} Performance Analysis Report`);
    console.log(`Duration: ${report.duration.toFixed(2)}ms`);
    console.log(`Total Metrics: ${report.metrics.length}`);
    if (report.warnings.length > 0) {
      console.warn("\u26A0\uFE0F Warnings:");
      report.warnings.forEach((w) => console.warn(`  - ${w}`));
    }
    if (report.suggestions.length > 0) {
      console.log("\u{1F4A1} Suggestions:");
      report.suggestions.forEach((s) => console.log(`  - ${s}`));
    }
    this.monitor.startRecording();
  }
  // 建议优化
  suggestOptimization(operation, _duration) {
    const suggestions = [
      "Consider using memoization for expensive computations",
      "Batch multiple operations together",
      "Use virtual scrolling for large lists",
      "Implement lazy loading for heavy components",
      "Consider using Web Workers for CPU-intensive tasks"
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    console.log(`\u{1F4A1} Suggestion for ${operation}: ${randomSuggestion}`);
  }
  // 尝试内存清理
  attemptMemoryCleanup() {
    if (globalThis.gc) {
      console.log("\u{1F9F9} Attempting garbage collection...");
      globalThis.gc();
    } else {
      console.warn("\u26A0\uFE0F Manual garbage collection not available. Run Node with --expose-gc flag.");
    }
  }
  // 获取性能监控器
  getMonitor() {
    return this.monitor;
  }
  // 销毁分析器
  destroy() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
    this.monitor.destroy();
  }
}
let defaultMonitor = null;
function getDefaultMonitor() {
  if (!defaultMonitor) {
    defaultMonitor = new PerformanceMonitor({ autoStart: true });
  }
  return defaultMonitor;
}
function startTimer(name) {
  getDefaultMonitor().startTimer(name);
}
function endTimer(name, tags) {
  return getDefaultMonitor().endTimer(name, tags);
}
function recordMetric(metric) {
  getDefaultMonitor().recordMetric(metric);
}
function getPerformanceStats(metricName) {
  return getDefaultMonitor().getMetricStats(metricName);
}

export { AutoPerformanceAnalyzer, PerformanceMonitor, endTimer, getDefaultMonitor, getPerformanceStats, measurePerformance, recordMetric, startTimer };
//# sourceMappingURL=PerformanceMonitoring.js.map
