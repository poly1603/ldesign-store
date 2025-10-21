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

exports.PersistenceStrategy = void 0;
(function(PersistenceStrategy2) {
  PersistenceStrategy2["IMMEDIATE"] = "immediate";
  PersistenceStrategy2["DEBOUNCED"] = "debounced";
  PersistenceStrategy2["THROTTLED"] = "throttled";
  PersistenceStrategy2["MANUAL"] = "manual";
})(exports.PersistenceStrategy || (exports.PersistenceStrategy = {}));
class EnhancedPersistenceManager {
  constructor(options) {
    this.saveTimer = null;
    this.lastSaveTime = 0;
    this.options = {
      storage: typeof window !== "undefined" ? window.localStorage : this.createMemoryStorage(),
      strategy: exports.PersistenceStrategy.DEBOUNCED,
      delay: 1e3,
      paths: [],
      version: 1,
      compress: false,
      encrypt: false,
      serializer: JSON.stringify,
      deserializer: JSON.parse,
      onError: console.error,
      ...options
    };
  }
  /**
   * 保存状态
   */
  async save(state) {
    try {
      const { strategy, delay } = this.options;
      switch (strategy) {
        case exports.PersistenceStrategy.IMMEDIATE:
          await this.doSave(state);
          break;
        case exports.PersistenceStrategy.DEBOUNCED:
          if (this.saveTimer) {
            clearTimeout(this.saveTimer);
          }
          this.saveTimer = window.setTimeout(() => this.doSave(state), delay);
          break;
        case exports.PersistenceStrategy.THROTTLED: {
          const now = Date.now();
          if (now - this.lastSaveTime >= delay) {
            await this.doSave(state);
            this.lastSaveTime = now;
          }
          break;
        }
        case exports.PersistenceStrategy.MANUAL:
          break;
      }
    } catch (error) {
      this.options.onError(error);
    }
  }
  /**
   * 执行保存
   */
  async doSave(state) {
    const { key, storage, paths, version, compress, encrypt, encryptionKey, serializer } = this.options;
    let dataToSave = state;
    if (paths.length > 0) {
      dataToSave = {};
      paths.forEach((path) => {
        const keys = String(path).split(".");
        let value = state;
        for (const k of keys) {
          value = value?.[k];
        }
        this.setNestedValue(dataToSave, String(path), value);
      });
    }
    const wrapped = {
      version,
      data: dataToSave,
      timestamp: Date.now()
    };
    let serialized = serializer(wrapped);
    if (compress) {
      serialized = await this.compress(serialized);
    }
    if (encrypt && encryptionKey) {
      serialized = await this.encrypt(serialized, encryptionKey);
    }
    await storage.setItem(key, serialized);
  }
  /**
   * 加载状态
   */
  async load() {
    try {
      const { key, storage, version, migrations, compress, encrypt, encryptionKey, deserializer } = this.options;
      let data = await storage.getItem(key);
      if (!data)
        return null;
      if (encrypt && encryptionKey) {
        data = await this.decrypt(data, encryptionKey);
      }
      if (compress) {
        data = await this.decompress(data);
      }
      const wrapped = deserializer(data);
      let state = wrapped.data;
      if (migrations && wrapped.version < version) {
        for (let v = wrapped.version + 1; v <= version; v++) {
          if (migrations[v]) {
            state = migrations[v](state);
          }
        }
      }
      return state;
    } catch (error) {
      this.options.onError(error);
      return null;
    }
  }
  /**
   * 清除持久化数据
   */
  async clear() {
    const { key, storage } = this.options;
    await storage.removeItem(key);
  }
  /**
   * 手动触发保存（用于 MANUAL 策略）
   */
  async flush(state) {
    await this.doSave(state);
  }
  /**
   * 压缩数据
   */
  async compress(data) {
    return data;
  }
  /**
   * 解压数据
   */
  async decompress(data) {
    return data;
  }
  /**
   * 加密数据
   */
  async encrypt(data, key) {
    return btoa(data.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join(""));
  }
  /**
   * 解密数据
   */
  async decrypt(data, key) {
    const decoded = atob(data);
    return decoded.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join("");
  }
  /**
   * 设置嵌套值
   */
  setNestedValue(obj, path, value) {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }
  /**
   * 创建内存存储引擎
   */
  createMemoryStorage() {
    const storage = /* @__PURE__ */ new Map();
    return {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => {
        storage.set(key, value);
      },
      removeItem: (key) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      }
    };
  }
}
function createEnhancedPersistence(options) {
  return new EnhancedPersistenceManager(options);
}
class IndexedDBStorage {
  constructor(dbName = "ldesign-store", storeName = "state") {
    this.db = null;
    this.dbName = dbName;
    this.storeName = storeName;
  }
  async getDB() {
    if (this.db)
      return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }
  async getItem(key) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }
  async setItem(key, value) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  async removeItem(key) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  async clear() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

exports.EnhancedPersistenceManager = EnhancedPersistenceManager;
exports.IndexedDBStorage = IndexedDBStorage;
exports.createEnhancedPersistence = createEnhancedPersistence;
//# sourceMappingURL=PersistenceEnhancement.cjs.map
