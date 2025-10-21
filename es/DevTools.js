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

class DevToolsConnection extends EventEmitter {
  constructor(port = 8089) {
    super();
    this.port = port;
    this.isConnected = false;
    this.messageQueue = [];
    this.connect();
  }
  async connect() {
    if (typeof WebSocket === "undefined") {
      try {
        const { default: WS } = await import('ws');
        this.ws = new WS(`ws://localhost:${this.port}/devtools`);
      } catch {
        console.warn("WebSocket not available, DevTools connection disabled");
        return;
      }
    } else {
      this.ws = new WebSocket(`ws://localhost:${this.port}/devtools`);
    }
    if (this.ws) {
      this.ws.onopen = () => {
        this.isConnected = true;
        this.emit("connected");
        this.flushMessageQueue();
      };
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.emit("message", message);
      };
      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit("disconnected");
        this.scheduleReconnect();
      };
      this.ws.onerror = (error) => {
        console.error("DevTools connection error:", error);
        this.emit("error", error);
      };
    }
  }
  scheduleReconnect() {
    if (this.reconnectTimer)
      return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = void 0;
      this.connect();
    }, 3e3);
  }
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }
  send(message) {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = void 0;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = void 0;
    }
  }
}
class StoreDevTools extends EventEmitter {
  constructor(config = {}) {
    super();
    this.stores = /* @__PURE__ */ new Map();
    this.history = /* @__PURE__ */ new Map();
    this.timeTravelIndex = /* @__PURE__ */ new Map();
    this.watchers = /* @__PURE__ */ new Map();
    this.subscribers = /* @__PURE__ */ new Map();
    this.config = {
      name: config.name || "LDesign Store",
      maxHistory: config.maxHistory || 50,
      logActions: config.logActions ?? true,
      logState: config.logState ?? false,
      enableTimeTravel: config.enableTimeTravel ?? true,
      enableHotReload: config.enableHotReload ?? true,
      port: config.port || 8089
    };
    if (this.config?.port) {
      this.setupConnection();
    }
    this.setupGlobalHooks();
  }
  // 设置连接
  setupConnection() {
    this.connection = new DevToolsConnection(this.config?.port);
    this.connection.on("message", (message) => {
      this.handleDevToolsMessage(message);
    });
    this.connection.on("connected", () => {
      this.emit("devtools:connected");
      this.syncAllStores();
    });
  }
  // 设置全局钩子
  setupGlobalHooks() {
    if (typeof window !== "undefined") {
      window.__LDESIGN_DEVTOOLS__ = this;
    }
    if (typeof globalThis !== "undefined") {
      globalThis.__LDESIGN_DEVTOOLS__ = this;
    }
  }
  // 注册 Store
  registerStore(name, store) {
    this.stores.set(name, store);
    this.history.set(name, []);
    this.timeTravelIndex.set(name, -1);
    this.watchers.set(name, []);
    this.subscribers.set(name, 0);
    this.interceptActions(name, store);
    this.watchStateChanges(name, store);
    this.trackSubscribers(name, store);
    this.sendStoreUpdate(name, store);
    this.emit("store:registered", { name, store });
  }
  // 拦截 actions
  interceptActions(storeName, store) {
    const actions = store.actions || {};
    Object.keys(actions).forEach((actionName) => {
      const originalAction = actions[actionName];
      actions[actionName] = (...args) => {
        const startTime = performance.now();
        if (this.config?.logActions) {
          console.group(`\u{1F3AF} [${storeName}] ${actionName}`);
          console.log("Args:", args);
        }
        try {
          const result = originalAction.apply(store, args);
          const duration = performance.now() - startTime;
          if (this.config?.logActions) {
            console.log(`Duration: ${duration.toFixed(2)}ms`);
            console.groupEnd();
          }
          this.recordSnapshot(storeName, store, {
            actionName,
            actionArgs: args,
            duration
          });
          return result;
        } catch (error) {
          if (this.config?.logActions) {
            console.error("Error:", error);
            console.groupEnd();
          }
          this.recordSnapshot(storeName, store, {
            actionName,
            actionArgs: args,
            error
          });
          throw error;
        }
      };
    });
  }
  // 监听状态变化
  watchStateChanges(storeName, store) {
    if (store.watch) {
      const watchersList = this.watchers.get(storeName) || [];
      watchersList.push({
        path: "*",
        callback: "DevTools.watchStateChanges"
      });
      this.watchers.set(storeName, watchersList);
      store.watch("*", (newValue, oldValue, path) => {
        if (this.config?.logState) {
          console.log(`[${storeName}] State changed at ${path}:`, { oldValue, newValue });
        }
        this.sendStoreUpdate(storeName, store);
      });
    }
    if (store.watch) {
      const originalWatch = store.watch.bind(store);
      store.watch = (path, callback) => {
        const watchersList = this.watchers.get(storeName) || [];
        watchersList.push({
          path,
          callback: callback.name || "anonymous"
        });
        this.watchers.set(storeName, watchersList);
        return originalWatch(path, callback);
      };
    }
  }
  // 追踪订阅者
  trackSubscribers(storeName, store) {
    if (store.$subscribe) {
      const original$Subscribe = store.$subscribe.bind(store);
      store.$subscribe = (callback, options) => {
        const currentCount = this.subscribers.get(storeName) || 0;
        this.subscribers.set(storeName, currentCount + 1);
        const unsubscribe = original$Subscribe(callback, options);
        return () => {
          const count = this.subscribers.get(storeName) || 0;
          this.subscribers.set(storeName, Math.max(0, count - 1));
          unsubscribe();
        };
      };
    }
    if (store.$onAction) {
      const original$OnAction = store.$onAction.bind(store);
      store.$onAction = (callback) => {
        const currentCount = this.subscribers.get(storeName) || 0;
        this.subscribers.set(storeName, currentCount + 1);
        const unsubscribe = original$OnAction(callback);
        return () => {
          const count = this.subscribers.get(storeName) || 0;
          this.subscribers.set(storeName, Math.max(0, count - 1));
          unsubscribe();
        };
      };
    }
  }
  // 记录快照
  recordSnapshot(storeName, store, metadata) {
    if (!this.config?.enableTimeTravel)
      return;
    const snapshot = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      state: this.cloneState(store.state),
      computed: this.getComputedValues(store),
      metadata
    };
    const storeHistory = this.history.get(storeName) || [];
    storeHistory.push(snapshot);
    if (storeHistory.length > this.config?.maxHistory) {
      storeHistory.shift();
    }
    this.history.set(storeName, storeHistory);
    this.timeTravelIndex.set(storeName, storeHistory.length - 1);
    this.emit("snapshot:recorded", { storeName, snapshot });
    this.sendSnapshot(storeName, snapshot);
  }
  // 克隆状态
  cloneState(state) {
    try {
      return JSON.parse(JSON.stringify(state));
    } catch {
      const seen = /* @__PURE__ */ new WeakSet();
      return JSON.parse(JSON.stringify(state, (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      }));
    }
  }
  // 获取计算属性值
  getComputedValues(store) {
    const computed = {};
    if (store.computed) {
      Object.keys(store.computed).forEach((key) => {
        try {
          computed[key] = store[key];
        } catch (e) {
          computed[key] = `[Error: ${e?.message || "Unknown error"}]`;
        }
      });
    }
    return computed;
  }
  // 时间旅行
  timeTravel(storeName, direction) {
    if (!this.config?.enableTimeTravel) {
      console.warn("Time travel is disabled");
      return;
    }
    const store = this.stores.get(storeName);
    const storeHistory = this.history.get(storeName);
    if (!store || !storeHistory || storeHistory.length === 0) {
      console.warn(`No history for store: ${storeName}`);
      return;
    }
    let currentIndex = this.timeTravelIndex.get(storeName) || 0;
    if (typeof direction === "number") {
      currentIndex = Math.max(0, Math.min(direction, storeHistory.length - 1));
    } else if (direction === "forward") {
      currentIndex = Math.min(currentIndex + 1, storeHistory.length - 1);
    } else {
      currentIndex = Math.max(currentIndex - 1, 0);
    }
    this.timeTravelIndex.set(storeName, currentIndex);
    const snapshot = storeHistory[currentIndex];
    if (snapshot && store.setState) {
      store.setState(snapshot.state);
      this.emit("time:travel", {
        storeName,
        index: currentIndex,
        timestamp: new Date(snapshot.timestamp).toLocaleTimeString(),
        action: snapshot.metadata.actionName,
        state: snapshot.state
      });
    }
  }
  // 检查 Store
  inspect(storeName) {
    const store = this.stores.get(storeName);
    if (!store)
      return null;
    const storeHistory = this.history.get(storeName) || [];
    return {
      state: this.cloneState(store.state),
      computed: this.getComputedValues(store),
      actions: Object.keys(store.actions || {}),
      watchers: this.watchers.get(storeName) || [],
      subscribers: this.subscribers.get(storeName) || 0,
      history: storeHistory
    };
  }
  // 热重载
  hotReload(storeName, newModule) {
    if (!this.config?.enableHotReload) {
      console.warn("Hot reload is disabled");
      return;
    }
    const store = this.stores.get(storeName);
    if (!store) {
      console.warn(`Store not found: ${storeName}`);
      return;
    }
    const currentState = this.cloneState(store.state);
    if (newModule.actions) {
      Object.assign(store.actions, newModule.actions);
      this.interceptActions(storeName, store);
    }
    if (newModule.computed) {
      Object.assign(store.computed, newModule.computed);
    }
    if (store.setState) {
      store.setState(currentState);
    }
    this.sendStoreUpdate(storeName, store);
    this.emit("store:reloaded", { storeName, store });
  }
  // 处理 DevTools 消息
  handleDevToolsMessage(message) {
    switch (message.type) {
      case "TIME_TRAVEL":
        this.timeTravel(message.storeName, message.index);
        break;
      case "INSPECT": {
        const inspection = this.inspect(message.storeName);
        this.connection?.send({
          type: "INSPECTION_RESULT",
          storeName: message.storeName,
          data: inspection
        });
        break;
      }
      case "EXPORT_STATE":
        this.exportState(message.storeName);
        break;
      case "IMPORT_STATE":
        this.importState(message.storeName, message.state);
        break;
    }
  }
  // 发送 Store 更新
  sendStoreUpdate(storeName, store) {
    if (!this.connection)
      return;
    this.connection.send({
      type: "STORE_UPDATE",
      storeName,
      data: {
        state: this.cloneState(store.state),
        computed: this.getComputedValues(store)
      }
    });
  }
  // 发送快照
  sendSnapshot(storeName, snapshot) {
    if (!this.connection)
      return;
    this.connection.send({
      type: "SNAPSHOT",
      storeName,
      snapshot
    });
  }
  // 同步所有 Stores
  syncAllStores() {
    this.stores.forEach((store, name) => {
      this.sendStoreUpdate(name, store);
      const storeHistory = this.history.get(name);
      if (storeHistory) {
        storeHistory.forEach((snapshot) => {
          this.sendSnapshot(name, snapshot);
        });
      }
    });
  }
  // 导出状态
  exportState(storeName) {
    if (storeName) {
      const store = this.stores.get(storeName);
      return store ? this.cloneState(store.state) : null;
    }
    const allStates = {};
    this.stores.forEach((store, name) => {
      allStates[name] = this.cloneState(store.state);
    });
    return allStates;
  }
  // 导入状态
  importState(storeName, state) {
    const store = this.stores.get(storeName);
    if (!store || !store.setState) {
      console.warn(`Cannot import state for store: ${storeName}`);
      return;
    }
    store.setState(state);
    this.emit("state:imported", { storeName, state });
  }
  // 清理
  destroy() {
    this.connection?.disconnect();
    this.stores.clear();
    this.history.clear();
    this.timeTravelIndex.clear();
    this.watchers.clear();
    this.subscribers.clear();
    this.removeAllListeners();
  }
}
class ConsoleFormatter {
  static setup() {
    if (typeof window === "undefined")
      return;
    const styles = {
      store: "color: #4CAF50; font-weight: bold",
      action: "color: #2196F3",
      state: "color: #FF9800",
      computed: "color: #9C27B0"};
    window.devtoolsFormatters = window.devtoolsFormatters || [];
    window.devtoolsFormatters.push({
      header(obj) {
        if (!obj || !obj.__isStore)
          return null;
        return ["div", { style: styles.store }, ["span", {}, "\u{1F4E6} "], ["span", { style: "font-weight: normal" }, obj.name || "Store"]];
      },
      hasBody(obj) {
        return obj && obj.__isStore;
      },
      body(obj) {
        const elements = ["div", {}];
        elements.push(["div", { style: styles.state }, ["span", {}, "\u{1F538} State: "], ["object", { object: obj.state }]]);
        if (obj.computed) {
          const computedValues = Object.keys(obj.computed).reduce((acc, key) => {
            try {
              acc[key] = obj[key];
            } catch (e) {
              acc[key] = `[Error: ${e?.message || "Unknown error"}]`;
            }
            return acc;
          }, {});
          elements.push(["div", { style: styles.computed }, ["span", {}, "\u{1F539} Computed: "], ["object", { object: computedValues }]]);
        }
        if (obj.actions) {
          elements.push(["div", { style: styles.action }, ["span", {}, "\u26A1 Actions: "], ["object", { object: Object.keys(obj.actions) }]]);
        }
        return elements;
      }
    });
  }
}
class VisualInspector {
  constructor() {
    this.isActive = false;
  }
  activate() {
    if (typeof document === "undefined" || this.isActive)
      return;
    this.isActive = true;
    this.createOverlay();
    this.setupEventListeners();
  }
  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.id = "ldesign-inspector-overlay";
    this.overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 99999;
      max-width: 400px;
      max-height: 500px;
      overflow: auto;
      display: none;
    `;
    document.body.appendChild(this.overlay);
  }
  setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        this.toggle();
      }
    });
  }
  toggle() {
    if (!this.overlay)
      return;
    if (this.overlay.style.display === "none") {
      this.overlay.style.display = "block";
      this.updateContent();
    } else {
      this.overlay.style.display = "none";
    }
  }
  updateContent() {
    if (!this.overlay)
      return;
    const devtools = window.__LDESIGN_DEVTOOLS__;
    if (!devtools) {
      this.overlay.innerHTML = "<div>DevTools not initialized</div>";
      return;
    }
    let html = '<h3 style="margin: 0 0 10px 0;">\u{1F50D} Store Inspector</h3>';
    devtools.stores.forEach((store, name) => {
      const inspection = devtools.inspect(name);
      if (!inspection)
        return;
      html += `
        <div style="margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 10px;">
          <h4 style="color: #4CAF50; margin: 5px 0;">${name}</h4>
          <div style="color: #FF9800;">State Keys: ${Object.keys(inspection.state).join(", ")}</div>
          <div style="color: #9C27B0;">Computed: ${Object.keys(inspection.computed).join(", ")}</div>
          <div style="color: #2196F3;">Actions: ${inspection.actions.join(", ")}</div>
          <div style="color: #999;">History: ${inspection.history.length} snapshots</div>
        </div>
      `;
    });
    this.overlay.innerHTML = html;
  }
  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = void 0;
    this.isActive = false;
  }
}
let devToolsInstance = null;
function initDevTools(config) {
  if (!devToolsInstance) {
    devToolsInstance = new StoreDevTools(config);
    ConsoleFormatter.setup();
    if (typeof window !== "undefined" && window.location?.hostname === "localhost") {
      const inspector = new VisualInspector();
      inspector.activate();
    }
  }
  return devToolsInstance;
}
function getDevTools() {
  return devToolsInstance;
}

export { ConsoleFormatter, DevToolsConnection, StoreDevTools, VisualInspector, getDevTools, initDevTools };
//# sourceMappingURL=DevTools.js.map
