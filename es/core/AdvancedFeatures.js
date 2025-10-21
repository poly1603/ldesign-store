/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { toRaw } from 'vue';

class BatchOperationManager {
  constructor() {
    this.operations = [];
    this.isExecuting = false;
    this.rollbackStack = [];
  }
  /**
   * 添加操作到批量队列
   */
  add(operation, rollback) {
    if (this.isExecuting) {
      throw new Error("Cannot add operations while batch is executing");
    }
    this.operations.push(operation);
    if (rollback) {
      this.rollbackStack.push(rollback);
    }
    return this;
  }
  /**
   * 执行所有批量操作
   */
  async execute() {
    if (this.isExecuting) {
      throw new Error("Batch is already executing");
    }
    this.isExecuting = true;
    const executedOperations = [];
    try {
      for (let i = 0; i < this.operations.length; i++) {
        await this.operations[i]();
        executedOperations.push(i);
      }
    } catch (error) {
      for (let i = executedOperations.length - 1; i >= 0; i--) {
        const rollback = this.rollbackStack[executedOperations[i]];
        if (rollback) {
          try {
            rollback();
          } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
          }
        }
      }
      throw error;
    } finally {
      this.clear();
      this.isExecuting = false;
    }
  }
  /**
   * 清空批量操作队列
   */
  clear() {
    this.operations = [];
    this.rollbackStack = [];
  }
  /**
   * 获取待执行操作数量
   */
  get size() {
    return this.operations.length;
  }
}
class TransactionManager {
  constructor(store) {
    this.snapshot = null;
    this.inTransaction = false;
    this.transactionLog = [];
    this.store = store;
  }
  /**
   * 开始事务
   */
  begin() {
    if (this.inTransaction) {
      throw new Error("Transaction already in progress");
    }
    this.snapshot = JSON.parse(JSON.stringify(this.store.$state));
    this.inTransaction = true;
    this.transactionLog = [];
  }
  /**
   * 提交事务
   */
  commit() {
    if (!this.inTransaction) {
      throw new Error("No transaction in progress");
    }
    this.snapshot = null;
    this.inTransaction = false;
    this.transactionLog = [];
  }
  /**
   * 回滚事务
   */
  rollback() {
    if (!this.inTransaction) {
      throw new Error("No transaction in progress");
    }
    if (this.snapshot) {
      this.store.$patch(this.snapshot);
    }
    this.snapshot = null;
    this.inTransaction = false;
    this.transactionLog = [];
  }
  /**
   * 在事务中执行操作
   */
  async run(operation) {
    this.begin();
    try {
      const result = await operation();
      this.commit();
      return result;
    } catch (error) {
      this.rollback();
      throw error;
    }
  }
  /**
   * 记录事务操作
   */
  log(type, payload) {
    if (this.inTransaction) {
      this.transactionLog.push({
        type,
        payload,
        timestamp: Date.now()
      });
    }
  }
  /**
   * 获取事务日志
   */
  getLog() {
    return [...this.transactionLog];
  }
}
class SnapshotManager {
  constructor(store, options) {
    this.store = store;
    this.snapshots = /* @__PURE__ */ new Map();
    this.tags = /* @__PURE__ */ new Map();
    this.maxSnapshots = 50;
    this.autoSnapshot = false;
    this.autoSnapshotInterval = null;
    if (options?.maxSnapshots) {
      this.maxSnapshots = options.maxSnapshots;
    }
    if (options?.autoSnapshot) {
      this.enableAutoSnapshot(options.autoSnapshotInterval || 6e4);
    }
  }
  /**
   * 创建快照
   */
  create(name, metadata, tags) {
    const id = this.generateId();
    const snapshot = {
      id,
      name,
      state: JSON.parse(JSON.stringify(toRaw(this.store.$state))),
      metadata: metadata || {},
      timestamp: Date.now(),
      tags
    };
    this.snapshots.set(id, snapshot);
    if (tags) {
      tags.forEach((tag) => {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, /* @__PURE__ */ new Set());
        }
        this.tags.get(tag).add(id);
      });
    }
    if (this.snapshots.size > this.maxSnapshots) {
      const oldestKey = Array.from(this.snapshots.keys())[0];
      this.snapshots.delete(oldestKey);
    }
    return id;
  }
  /**
   * 恢复快照
   */
  restore(name) {
    const snapshot = this.snapshots.get(name);
    if (!snapshot) {
      throw new Error(`Snapshot "${name}" not found`);
    }
    this.store.$patch(snapshot.state);
  }
  /**
   * 删除快照
   */
  delete(name) {
    return this.snapshots.delete(name);
  }
  /**
   * 清空所有快照
   */
  clear() {
    this.snapshots.clear();
  }
  /**
   * 获取所有快照信息
   */
  list() {
    return Array.from(this.snapshots.entries()).map(([name, snapshot]) => ({
      name,
      metadata: snapshot.metadata,
      timestamp: snapshot.timestamp
    }));
  }
  /**
   * 启用自动快照
   */
  enableAutoSnapshot(interval) {
    this.autoSnapshot = true;
    if (this.autoSnapshotInterval) {
      clearInterval(this.autoSnapshotInterval);
    }
    this.autoSnapshotInterval = window.setInterval(() => {
      this.create(`auto_${Date.now()}`, { auto: true });
    }, interval);
  }
  /**
   * 禁用自动快照
   */
  disableAutoSnapshot() {
    this.autoSnapshot = false;
    if (this.autoSnapshotInterval) {
      clearInterval(this.autoSnapshotInterval);
      this.autoSnapshotInterval = null;
    }
  }
  /**
   * 导出快照
   */
  export(name) {
    const snapshot = this.snapshots.get(name);
    if (!snapshot) {
      throw new Error(`Snapshot "${name}" not found`);
    }
    return JSON.stringify(snapshot);
  }
  /**
   * 导入快照
   */
  import(name, data) {
    try {
      const snapshot = JSON.parse(data);
      this.snapshots.set(name, snapshot);
    } catch {
      throw new Error("Invalid snapshot data");
    }
  }
  /**
   * 生成唯一ID
   */
  generateId() {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
class TimeTravelDebugger {
  constructor(store, options) {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 100;
    this.isTimeTravel = false;
    this.store = store;
    if (options?.maxHistory) {
      this.maxHistory = options.maxHistory;
    }
    this.init();
  }
  /**
   * 初始化时间旅行
   */
  init() {
    this.record("INIT");
    this.store.$subscribe((mutation) => {
      if (!this.isTimeTravel) {
        this.record(mutation.type, mutation.payload || mutation);
      }
    });
  }
  /**
   * 记录状态
   */
  record(action, metadata) {
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    this.history.push({
      state: JSON.parse(JSON.stringify(this.store.$state)),
      action,
      timestamp: Date.now(),
      metadata
    });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }
  /**
   * 后退到上一个状态
   */
  backward() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isTimeTravel = true;
      this.store.$patch(this.history[this.currentIndex].state);
      this.isTimeTravel = false;
    }
  }
  /**
   * 前进到下一个状态
   */
  forward() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.isTimeTravel = true;
      this.store.$patch(this.history[this.currentIndex].state);
      this.isTimeTravel = false;
    }
  }
  /**
   * 跳转到指定状态
   */
  goto(index) {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index;
      this.isTimeTravel = true;
      this.store.$patch(this.history[index].state);
      this.isTimeTravel = false;
    }
  }
  /**
   * 重置到初始状态
   */
  reset() {
    this.goto(0);
  }
  /**
   * 获取历史记录
   */
  getHistory() {
    return this.history.map((item, index) => ({
      ...item,
      index,
      isCurrent: index === this.currentIndex
    }));
  }
  /**
   * 清空历史记录
   */
  clearHistory() {
    const currentState = this.history[this.currentIndex];
    this.history = [currentState];
    this.currentIndex = 0;
  }
  /**
   * 获取当前索引
   */
  getCurrentIndex() {
    return this.currentIndex;
  }
  /**
   * 获取历史长度
   */
  getHistoryLength() {
    return this.history.length;
  }
  /**
   * 导出历史记录
   */
  exportHistory() {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex
    });
  }
  /**
   * 导入历史记录
   */
  importHistory(data) {
    try {
      const { history, currentIndex } = JSON.parse(data);
      this.history = history;
      this.currentIndex = currentIndex;
      this.goto(currentIndex);
    } catch {
      throw new Error("Invalid history data");
    }
  }
}
class StateDiffer {
  /**
   * 比较两个状态的差异
   */
  diff(oldState, newState) {
    const differences = [];
    const compare = (obj1, obj2, path = "") => {
      const keys = /* @__PURE__ */ new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
      for (const key of keys) {
        const currentPath = path ? `${path}.${key}` : key;
        const value1 = obj1?.[key];
        const value2 = obj2?.[key];
        if (!(key in (obj1 || {}))) {
          differences.push({
            path: currentPath,
            oldValue: void 0,
            newValue: value2,
            type: "added"
          });
        } else if (!(key in (obj2 || {}))) {
          differences.push({
            path: currentPath,
            oldValue: value1,
            newValue: void 0,
            type: "deleted"
          });
        } else if (typeof value1 === "object" && typeof value2 === "object" && value1 !== null && value2 !== null && !Array.isArray(value1) && !Array.isArray(value2)) {
          compare(value1, value2, currentPath);
        } else if (JSON.stringify(value1) !== JSON.stringify(value2)) {
          differences.push({
            path: currentPath,
            oldValue: value1,
            newValue: value2,
            type: "modified"
          });
        }
      }
    };
    compare(oldState, newState);
    return differences;
  }
  /**
   * 应用差异到状态
   */
  applyDiff(state, differences) {
    const newState = JSON.parse(JSON.stringify(state));
    for (const diff of differences) {
      const paths = diff.path.split(".");
      let current = newState;
      for (let i = 0; i < paths.length - 1; i++) {
        if (!current[paths[i]]) {
          current[paths[i]] = {};
        }
        current = current[paths[i]];
      }
      const lastKey = paths[paths.length - 1];
      if (diff.type === "deleted") {
        delete current[lastKey];
      } else {
        current[lastKey] = diff.newValue;
      }
    }
    return newState;
  }
}
class StateValidator {
  constructor() {
    this.rules = /* @__PURE__ */ new Map();
  }
  /**
   * 添加验证规则
   */
  addRule(path, validator) {
    this.rules.set(path, validator);
  }
  /**
   * 删除验证规则
   */
  removeRule(path) {
    return this.rules.delete(path);
  }
  /**
   * 验证状态
   */
  validate(state) {
    const errors = [];
    for (const [path, validator] of this.rules) {
      const value = this.getValueByPath(state, path);
      const result = validator(value);
      if (result !== true) {
        errors.push({
          path,
          message: typeof result === "string" ? result : "Validation failed"
        });
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  /**
   * 根据路径获取值
   */
  getValueByPath(obj, path) {
    const paths = path.split(".");
    let current = obj;
    for (const p of paths) {
      if (current === null || current === void 0) {
        return void 0;
      }
      current = current[p];
    }
    return current;
  }
}
function createAdvancedStore(store) {
  const batchManager = new BatchOperationManager();
  const transactionManager = new TransactionManager(store);
  const snapshotManager = new SnapshotManager(store);
  const timeTravelDebugger = new TimeTravelDebugger(store);
  const stateDiffer = new StateDiffer();
  const stateValidator = new StateValidator();
  return {
    store,
    batch: batchManager,
    transaction: transactionManager,
    snapshot: snapshotManager,
    timeTravel: timeTravelDebugger,
    differ: stateDiffer,
    validator: stateValidator,
    // 便捷方法
    async runInBatch(operations) {
      operations.forEach((op) => batchManager.add(op));
      return batchManager.execute();
    },
    async runInTransaction(operation) {
      return transactionManager.run(operation);
    },
    createSnapshot(name) {
      snapshotManager.create(name);
    },
    restoreSnapshot(name) {
      snapshotManager.restore(name);
    },
    undo() {
      timeTravelDebugger.backward();
    },
    redo() {
      timeTravelDebugger.forward();
    },
    getDiff(oldState, newState) {
      return stateDiffer.diff(oldState, newState);
    },
    validateState(state) {
      return stateValidator.validate(state || store.$state);
    }
  };
}
class MiddlewareSystem {
  constructor() {
    this.middlewares = [];
  }
  /**
   * 注册中间件
   */
  use(middleware) {
    this.middlewares.push(middleware);
  }
  /**
   * 执行中间件链
   */
  async execute(context) {
    let index = 0;
    const next = async () => {
      if (index >= this.middlewares.length)
        return;
      const middleware = this.middlewares[index++];
      await middleware(context, next);
    };
    await next();
  }
  /**
   * 创建 action 中间件
   */
  static createActionMiddleware(handler) {
    return async (context, next) => {
      if (context.type === "action") {
        await handler(context.action, context.state);
      }
      await next();
    };
  }
  /**
   * 创建 state 中间件
   */
  static createStateMiddleware(handler) {
    return async (context, next) => {
      if (context.type === "state") {
        await handler(context.oldState, context.state);
      }
      await next();
    };
  }
  /**
   * 创建日志中间件
   */
  static createLogger(options) {
    const { collapsed = false, duration = true, diff = false } = options || {};
    return async (context, next) => {
      const startTime = performance.now();
      if (collapsed) {
        console.groupCollapsed(`[${context.type}] ${context.action?.type || "state change"}`);
      } else {
        console.group(`[${context.type}] ${context.action?.type || "state change"}`);
      }
      if (context.action) {
        console.log("Action:", context.action);
      }
      if (context.oldState) {
        console.log("Old State:", context.oldState);
      }
      await next();
      console.log("New State:", context.state);
      if (duration) {
        const endTime = performance.now();
        console.log(`Duration: ${(endTime - startTime).toFixed(2)}ms`);
      }
      if (diff && context.oldState) {
        const stateDiff = this.computeDiff(context.oldState, context.state);
        console.log("Diff:", stateDiff);
      }
      console.groupEnd();
    };
  }
  /**
   * 创建性能监控中间件
   */
  static createPerformanceMonitor(threshold = 16) {
    return async (context, next) => {
      const startTime = performance.now();
      await next();
      const duration = performance.now() - startTime;
      if (duration > threshold) {
        console.warn(`Slow ${context.type}: ${duration.toFixed(2)}ms`, context.action || context.state);
      }
    };
  }
  static computeDiff(oldObj, newObj) {
    const diff = {};
    for (const key in newObj) {
      if (oldObj[key] !== newObj[key]) {
        diff[key] = {
          old: oldObj[key],
          new: newObj[key]
        };
      }
    }
    return diff;
  }
}
function createMiddlewareSystem() {
  return new MiddlewareSystem();
}

export { BatchOperationManager, MiddlewareSystem, SnapshotManager, StateDiffer, StateValidator, TimeTravelDebugger, TransactionManager, createAdvancedStore, createMiddlewareSystem };
//# sourceMappingURL=AdvancedFeatures.js.map
