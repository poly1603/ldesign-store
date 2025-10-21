/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { MemoryMonitor } from './MemoryMonitor.js';
import { PerformanceMonitor } from './performance.js';
import { StorePool } from './storePool.js';

class PerformanceReporter {
  constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.memoryMonitor = MemoryMonitor.getInstance();
    this.storePool = StorePool.getInstance();
  }
  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!PerformanceReporter.instance) {
      PerformanceReporter.instance = new PerformanceReporter();
    }
    return PerformanceReporter.instance;
  }
  /**
   * 生成性能报告
   */
  generateReport(config = {}) {
    const { includeMemory = true, includePerformance = true, includeStorePool = true, includeSuggestions = true } = config;
    const report = {
      timestamp: Date.now(),
      summary: this.generateSummary()
    };
    if (includeMemory) {
      report.memory = this.generateMemoryReport();
    }
    if (includePerformance) {
      report.performance = this.generatePerformanceReport();
    }
    if (includeStorePool) {
      report.storePool = this.generateStorePoolReport();
    }
    if (includeSuggestions) {
      report.suggestions = this.generateSuggestions(report);
    }
    report.summary = this.updateHealthStatus(report);
    return report;
  }
  /**
   * 生成摘要
   */
  generateSummary() {
    return {
      health: "good",
      score: 100,
      issues: []
    };
  }
  /**
   * 生成内存报告
   */
  generateMemoryReport() {
    const memoryReport = this.memoryMonitor.getMemoryReport();
    const current = memoryReport.current;
    if (!current) {
      return {
        current: {
          used: "0MB",
          stores: 0,
          caches: 0
        },
        trend: "stable",
        leakDetection: {
          suspected: false,
          growthRate: 0,
          problematic: []
        }
      };
    }
    return {
      current: {
        used: `${(current.estimatedSize / 1024 / 1024).toFixed(2)}MB`,
        stores: current.storeInstances,
        caches: current.cacheEntries
      },
      trend: memoryReport.trend,
      leakDetection: {
        suspected: memoryReport.leakDetection.suspected,
        growthRate: memoryReport.leakDetection.growthRate,
        problematic: [
          ...memoryReport.leakDetection.problematicStores,
          ...memoryReport.leakDetection.problematicCaches
        ]
      }
    };
  }
  /**
   * 生成性能报告
   */
  generatePerformanceReport() {
    const perfReport = this.performanceMonitor.getPerformanceReport();
    return {
      slowActions: perfReport.slowActions.slice(0, 5),
      slowGetters: perfReport.slowGetters.slice(0, 5),
      frequentUpdates: perfReport.frequentUpdates.slice(0, 5)
    };
  }
  /**
   * 生成Store池报告
   */
  generateStorePoolReport() {
    const stats = this.storePool.getStats();
    const maxInstances = 50;
    const utilization = stats.totalInstances / maxInstances * 100;
    const topPools = stats.poolDetails.sort((a, b) => b.poolSize + b.activeInstances - (a.poolSize + a.activeInstances)).slice(0, 5).map((detail) => ({
      className: detail.className,
      instances: detail.poolSize + detail.activeInstances
    }));
    return {
      totalPools: stats.totalPools,
      totalInstances: stats.totalInstances,
      utilization: Math.min(utilization, 100),
      topPools
    };
  }
  /**
   * 生成优化建议
   */
  generateSuggestions(report) {
    const suggestions = [];
    if (report.memory) {
      if (report.memory.leakDetection.suspected) {
        suggestions.push(`\u68C0\u6D4B\u5230\u53EF\u80FD\u7684\u5185\u5B58\u6CC4\u6F0F\uFF0C\u8BF7\u68C0\u67E5\u4EE5\u4E0B\u7EC4\u4EF6\uFF1A${report.memory.leakDetection.problematic.join(", ")}`);
      }
      if (report.memory.trend === "growing") {
        suggestions.push("\u5185\u5B58\u4F7F\u7528\u91CF\u6301\u7EED\u589E\u957F\uFF0C\u5EFA\u8BAE\uFF1A\n  - \u68C0\u67E5\u662F\u5426\u6709\u672A\u6E05\u7406\u7684\u4E8B\u4EF6\u76D1\u542C\u5668\n  - \u786E\u4FDDStore\u5B9E\u4F8B\u88AB\u6B63\u786E\u9500\u6BC1\n  - \u8003\u8651\u8BBE\u7F6E\u7F13\u5B58\u8FC7\u671F\u65F6\u95F4");
      }
      const memoryUsed = Number.parseFloat(report.memory.current.used);
      if (memoryUsed > 50) {
        suggestions.push(`\u5185\u5B58\u4F7F\u7528\u91CF\u8F83\u9AD8(${report.memory.current.used})\uFF0C\u5EFA\u8BAE\u6E05\u7406\u4E0D\u5FC5\u8981\u7684\u7F13\u5B58`);
      }
    }
    if (report.performance) {
      if (report.performance.slowActions.length > 0) {
        const slowest = report.performance.slowActions[0];
        suggestions.push(`\u53D1\u73B0\u6162\u901FAction(${slowest.name}: ${slowest.avgTime.toFixed(2)}ms)\uFF0C\u5EFA\u8BAE\uFF1A
  - \u4F7F\u7528\u9632\u6296\u6216\u8282\u6D41
  - \u8003\u8651\u5F02\u6B65\u5904\u7406
  - \u4F18\u5316\u7B97\u6CD5\u590D\u6742\u5EA6`);
      }
      if (report.performance.slowGetters.length > 0) {
        const slowest = report.performance.slowGetters[0];
        suggestions.push(`\u53D1\u73B0\u6162\u901FGetter(${slowest.name}: ${slowest.avgTime.toFixed(2)}ms)\uFF0C\u5EFA\u8BAE\uFF1A
  - \u4F7F\u7528\u8BA1\u7B97\u7F13\u5B58
  - \u7B80\u5316\u8BA1\u7B97\u903B\u8F91
  - \u8003\u8651\u4F7F\u7528memo\u6A21\u5F0F`);
      }
      if (report.performance.frequentUpdates.length > 0) {
        const most = report.performance.frequentUpdates[0];
        suggestions.push(`\u72B6\u6001\u66F4\u65B0\u8FC7\u4E8E\u9891\u7E41(${most.name}: ${most.count}\u6B21)\uFF0C\u5EFA\u8BAE\uFF1A
  - \u6279\u91CF\u66F4\u65B0\u72B6\u6001
  - \u4F7F\u7528\u8282\u6D41\u9650\u5236\u66F4\u65B0\u9891\u7387
  - \u68C0\u67E5\u662F\u5426\u6709\u4E0D\u5FC5\u8981\u7684\u66F4\u65B0`);
      }
    }
    if (report.storePool) {
      if (report.storePool.utilization > 80) {
        suggestions.push(`Store\u6C60\u5229\u7528\u7387\u8F83\u9AD8(${report.storePool.utilization.toFixed(0)}%)\uFF0C\u5EFA\u8BAE\uFF1A
  - \u589E\u52A0\u6C60\u7684\u6700\u5927\u5BB9\u91CF
  - \u53CA\u65F6\u6E05\u7406\u4E0D\u7528\u7684Store\u5B9E\u4F8B
  - \u8003\u8651\u4F7F\u7528Store\u590D\u7528`);
      }
      if (report.storePool.totalInstances > 100) {
        suggestions.push(`Store\u5B9E\u4F8B\u8FC7\u591A(${report.storePool.totalInstances}\u4E2A)\uFF0C\u5EFA\u8BAE\uFF1A
  - \u5408\u5E76\u76F8\u5173\u7684Store
  - \u4F7F\u7528\u61D2\u52A0\u8F7D\u7B56\u7565
  - \u8BBE\u7F6E\u66F4\u77ED\u7684\u7A7A\u95F2\u8D85\u65F6\u65F6\u95F4`);
      }
    }
    if (suggestions.length === 0) {
      suggestions.push("\u7CFB\u7EDF\u8FD0\u884C\u826F\u597D\uFF0C\u7EE7\u7EED\u4FDD\u6301\u5F53\u524D\u7684\u4F18\u5316\u7B56\u7565");
    }
    return suggestions;
  }
  /**
   * 更新健康状态
   */
  updateHealthStatus(report) {
    const issues = [];
    let score = 100;
    if (report.memory) {
      if (report.memory.leakDetection.suspected) {
        issues.push("\u5185\u5B58\u6CC4\u6F0F\u98CE\u9669");
        score -= 30;
      }
      if (report.memory.trend === "growing") {
        issues.push("\u5185\u5B58\u6301\u7EED\u589E\u957F");
        score -= 10;
      }
      const memoryUsed = Number.parseFloat(report.memory.current.used);
      if (memoryUsed > 100) {
        issues.push("\u5185\u5B58\u4F7F\u7528\u8FC7\u9AD8");
        score -= 20;
      } else if (memoryUsed > 50) {
        score -= 10;
      }
    }
    if (report.performance) {
      if (report.performance.slowActions.length > 3) {
        issues.push("\u591A\u4E2A\u6162\u901FAction");
        score -= 15;
      }
      if (report.performance.slowGetters.length > 3) {
        issues.push("\u591A\u4E2A\u6162\u901FGetter");
        score -= 15;
      }
      if (report.performance.frequentUpdates.length > 0) {
        issues.push("\u72B6\u6001\u66F4\u65B0\u9891\u7E41");
        score -= 10;
      }
    }
    if (report.storePool) {
      if (report.storePool.utilization > 90) {
        issues.push("Store\u6C60\u63A5\u8FD1\u9971\u548C");
        score -= 15;
      }
      if (report.storePool.totalInstances > 200) {
        issues.push("Store\u5B9E\u4F8B\u8FC7\u591A");
        score -= 10;
      }
    }
    score = Math.max(0, Math.min(100, score));
    let health = "good";
    if (score < 50) {
      health = "critical";
    } else if (score < 80) {
      health = "warning";
    }
    return {
      health,
      score,
      issues
    };
  }
  /**
   * 格式化报告
   */
  formatReport(report, format = "json") {
    switch (format) {
      case "json":
        return JSON.stringify(report, null, 2);
      case "markdown":
        return this.formatAsMarkdown(report);
      case "html":
        return this.formatAsHTML(report);
      default:
        return JSON.stringify(report);
    }
  }
  /**
   * 格式化为Markdown
   */
  formatAsMarkdown(report) {
    let md = "# \u6027\u80FD\u5206\u6790\u62A5\u544A\n\n";
    const date = new Date(report.timestamp).toLocaleString();
    md += `**\u751F\u6210\u65F6\u95F4**: ${date}

`;
    md += "## \u6458\u8981\n\n";
    md += `- **\u5065\u5EB7\u72B6\u6001**: ${this.getHealthEmoji(report.summary.health)} ${report.summary.health}
`;
    md += `- **\u8BC4\u5206**: ${report.summary.score}/100
`;
    if (report.summary.issues.length > 0) {
      md += `- **\u95EE\u9898**: ${report.summary.issues.join(", ")}
`;
    }
    md += "\n";
    if (report.memory) {
      md += "## \u5185\u5B58\u4F7F\u7528\n\n";
      md += `- **\u5F53\u524D\u4F7F\u7528**: ${report.memory.current.used}
`;
      md += `- **Store\u5B9E\u4F8B**: ${report.memory.current.stores}
`;
      md += `- **\u7F13\u5B58\u6761\u76EE**: ${report.memory.current.caches}
`;
      md += `- **\u8D8B\u52BF**: ${report.memory.trend}
`;
      if (report.memory.leakDetection.suspected) {
        md += `- **\u26A0\uFE0F \u5185\u5B58\u6CC4\u6F0F\u98CE\u9669**: \u589E\u957F\u7387 ${report.memory.leakDetection.growthRate.toFixed(2)}%
`;
      }
      md += "\n";
    }
    if (report.performance) {
      md += "## \u6027\u80FD\u6307\u6807\n\n";
      if (report.performance.slowActions.length > 0) {
        md += "### \u6162\u901FActions\n\n";
        md += "| Action | \u5E73\u5747\u65F6\u95F4(ms) | \u6700\u5927\u65F6\u95F4(ms) |\n";
        md += "|--------|-------------|-------------|\n";
        report.performance.slowActions.forEach((action) => {
          md += `| ${action.name} | ${action.avgTime.toFixed(2)} | ${action.maxTime.toFixed(2)} |
`;
        });
        md += "\n";
      }
      if (report.performance.slowGetters.length > 0) {
        md += "### \u6162\u901FGetters\n\n";
        md += "| Getter | \u5E73\u5747\u65F6\u95F4(ms) | \u6700\u5927\u65F6\u95F4(ms) |\n";
        md += "|--------|-------------|-------------|\n";
        report.performance.slowGetters.forEach((getter) => {
          md += `| ${getter.name} | ${getter.avgTime.toFixed(2)} | ${getter.maxTime.toFixed(2)} |
`;
        });
        md += "\n";
      }
    }
    if (report.suggestions && report.suggestions.length > 0) {
      md += "## \u4F18\u5316\u5EFA\u8BAE\n\n";
      report.suggestions.forEach((suggestion, index) => {
        md += `${index + 1}. ${suggestion}

`;
      });
    }
    return md;
  }
  /**
   * 格式化为HTML
   */
  formatAsHTML(report) {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>\u6027\u80FD\u5206\u6790\u62A5\u544A</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    h2 { color: #666; margin-top: 30px; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .health-good { color: green; }
    .health-warning { color: orange; }
    .health-critical { color: red; }
    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .suggestion { background: #e8f4f8; padding: 10px; margin: 10px 0; border-left: 3px solid #2196F3; }
  </style>
</head>
<body>
  <h1>\u6027\u80FD\u5206\u6790\u62A5\u544A</h1>
  <div class="summary">
    <p><strong>\u751F\u6210\u65F6\u95F4</strong>: ${new Date(report.timestamp).toLocaleString()}</p>
    <p><strong>\u5065\u5EB7\u72B6\u6001</strong>: <span class="health-${report.summary.health}">${report.summary.health}</span></p>
    <p><strong>\u8BC4\u5206</strong>: ${report.summary.score}/100</p>
    ${report.summary.issues.length > 0 ? `<p><strong>\u95EE\u9898</strong>: ${report.summary.issues.join(", ")}</p>` : ""}
  </div>
`;
    if (report.memory) {
      html += `
  <h2>\u5185\u5B58\u4F7F\u7528</h2>
  <table>
    <tr><th>\u6307\u6807</th><th>\u503C</th></tr>
    <tr><td>\u5F53\u524D\u4F7F\u7528</td><td>${report.memory.current.used}</td></tr>
    <tr><td>Store\u5B9E\u4F8B</td><td>${report.memory.current.stores}</td></tr>
    <tr><td>\u7F13\u5B58\u6761\u76EE</td><td>${report.memory.current.caches}</td></tr>
    <tr><td>\u8D8B\u52BF</td><td>${report.memory.trend}</td></tr>
  </table>
`;
    }
    if (report.suggestions && report.suggestions.length > 0) {
      html += "<h2>\u4F18\u5316\u5EFA\u8BAE</h2>";
      report.suggestions.forEach((suggestion) => {
        html += `<div class="suggestion">${suggestion.replace(/\n/g, "<br>")}</div>`;
      });
    }
    html += "</body></html>";
    return html;
  }
  /**
   * 获取健康状态emoji
   */
  getHealthEmoji(health) {
    switch (health) {
      case "good":
        return "\u2705";
      case "warning":
        return "\u26A0\uFE0F";
      case "critical":
        return "\u274C";
    }
  }
  /**
   * 保存报告到文件
   */
  async saveReport(report, filename, format = "json") {
    const formatted = this.formatReport(report, format);
    if (typeof window !== "undefined" && window.navigator) {
      const blob = new Blob([formatted], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const fs = await import('node:fs/promises');
      await fs.writeFile(filename, formatted, "utf-8");
    }
  }
}
function usePerformanceReporter() {
  return PerformanceReporter.getInstance();
}
async function generatePerformanceReport(config, save) {
  const reporter = PerformanceReporter.getInstance();
  const report = reporter.generateReport(config);
  if (save) {
    await reporter.saveReport(report, save.filename, save.format);
  }
  return report;
}

export { PerformanceReporter, generatePerformanceReport, usePerformanceReporter };
//# sourceMappingURL=PerformanceReporter.js.map
