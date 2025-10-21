/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { defineStore } from 'pinia';
import { DECORATOR_METADATA_KEY } from '../types/decorators.js';
import { PerformanceOptimizer } from './PerformanceOptimizer.js';

class BaseStore {
  /**
   * 创建 BaseStore 实例
   *
   * @param id - Store 的唯一标识符，用于在 Pinia 中注册
   * @param options - Store 配置选项，包含状态、动作、计算属性等定义
   * @param options.state - 状态初始化函数
   * @param options.actions - 动作方法定义对象
   * @param options.getters - 计算属性定义对象
   * @param options.cache - 缓存配置选项
   * @param options.persist - 持久化配置选项
   *
   * @example
   * ```typescript
   * constructor() {
   *   super('user-store', {
   *     state: () => ({ name: '', age: 0 }),
   *     actions: {
   *       setName(name: string) { this.name = name }
   *     },
   *     getters: {
   *       displayName: (state) => `User: ${state.name}`
   *     }
   *   })
   * }
   * ```
   */
  constructor(id, options) {
    this._isConstructing = true;
    this._actionsCacheVersion = 0;
    this._gettersCacheVersion = 0;
    this._cleanupFunctions = [];
    this.$id = id;
    this._optimizer = new PerformanceOptimizer({
      cache: options?.cache,
      // 缓存配置选项
      // 处理持久化配置，确保类型正确
      persistence: typeof options?.persist === "object" ? options.persist : void 0
    });
    this._initializeStore(options);
    this._isConstructing = false;
  }
  /**
   * 获取当前 Store 的状态对象
   *
   * 返回响应式的状态对象，可以直接读取和修改状态值。
   * 状态的修改会自动触发相关的响应式更新。
   *
   * @returns 当前 Store 的状态对象
   *
   * @example
   * ```typescript
   * const userStore = new UserStore()
   *  // 读取状态
   * userStore.$state.name = 'John'      // 修改状态
   * ```
   */
  get $state() {
    return this._store?.$state || {};
  }
  /**
   * 获取当前 Store 的所有动作方法
   *
   * 返回包含所有动作方法的对象，这些方法已经绑定了正确的上下文。
   * 动作方法用于修改状态，支持同步和异步操作。
   * 使用缓存避免重复构建对象。
   *
   * @returns 包含所有动作方法的对象
   *
   * @example
   * ```typescript
   * const userStore = new UserStore()
   * userStore.$actions.setName('John')  // 调用动作方法
   * ```
   */
  get $actions() {
    const currentVersion = this._actionsCacheVersion;
    if (this._cachedActions && currentVersion > 0) {
      return this._cachedActions;
    }
    const actions = {};
    const metadata = this._getDecoratorMetadata();
    metadata.filter((meta) => meta.type === "action").forEach((meta) => {
      const method = this[meta.key];
      if (typeof method === "function") {
        actions[meta.key] = method.bind(this);
      }
    });
    this._cachedActions = actions;
    this._actionsCacheVersion = currentVersion + 1;
    return actions;
  }
  /**
   * 获取当前 Store 的所有计算属性
   *
   * 返回包含所有计算属性的对象，这些属性会根据状态的变化自动重新计算。
   * 计算属性是只读的，用于派生状态值。
   * 使用缓存避免重复构建对象。
   *
   * @returns 包含所有计算属性的对象
   *
   * @example
   * ```typescript
   * const userStore = new UserStore()
   *  // 获取计算属性值
   * ```
   */
  get $getters() {
    const currentVersion = this._gettersCacheVersion;
    if (this._cachedGetters && currentVersion > 0) {
      return this._cachedGetters;
    }
    const getters = {};
    const metadata = this._getDecoratorMetadata();
    metadata.filter((meta) => meta.type === "getter").forEach((meta) => {
      const getter = this[meta.key];
      if (typeof getter === "function") {
        getters[meta.key] = getter.bind(this);
      }
    });
    this._cachedGetters = getters;
    this._gettersCacheVersion = currentVersion + 1;
    return getters;
  }
  /**
   * 重置状态
   */
  $reset() {
    if (this._store && this._initialState) {
      this._store.$patch(this._initialState);
    } else {
      this._store?.$reset();
    }
  }
  $patch(partialStateOrMutator) {
    if (!this._store)
      return;
    if (typeof partialStateOrMutator === "function") {
      this._store.$patch(partialStateOrMutator);
    } else {
      this._store.$patch((state) => {
        Object.assign(state, partialStateOrMutator);
      });
    }
  }
  /**
   * 订阅状态变化
   */
  $subscribe(callback, options) {
    if (!this._store) {
      return () => {
      };
    }
    const unsubscribe = this._store.$subscribe(callback, options);
    if (!options?.detached) {
      this._addCleanup(unsubscribe);
    }
    return unsubscribe;
  }
  /**
   * 订阅 Action
   */
  $onAction(callback) {
    if (!this._store) {
      return () => {
      };
    }
    const unsubscribe = this._store.$onAction(callback);
    this._addCleanup(unsubscribe);
    return unsubscribe;
  }
  /**
   * 获取 Pinia Store 实例
   */
  getStore() {
    return this._store;
  }
  /**
   * 获取 Store 定义
   */
  getStoreDefinition() {
    return this._storeDefinition;
  }
  /**
   * 销毁 Store，清理资源
   */
  $dispose() {
    this._cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error("Cleanup function error:", error);
      }
    });
    this._cleanupFunctions.length = 0;
    this._optimizer.dispose();
    this._cachedActions = void 0;
    this._cachedGetters = void 0;
    this._actionsCacheVersion = 0;
    this._gettersCacheVersion = 0;
    this._initialState = void 0;
    this._store = void 0;
    this._storeDefinition = void 0;
  }
  /**
   * 持久化状态到存储
   */
  $persist() {
    if (this._store) {
      this._optimizer.persistence.save(this.$id, this._store.$state);
    }
  }
  /**
   * 从存储恢复状态
   */
  $hydrate() {
    const persistedState = this._optimizer.persistence.load(this.$id);
    if (persistedState && this._store) {
      this._store.$patch(persistedState);
    }
  }
  /**
   * 清除持久化状态
   */
  $clearPersisted() {
    this._optimizer.persistence.remove(this.$id);
  }
  /**
   * 获取缓存值
   */
  $getCache(key) {
    return this._optimizer.cache.get(`${this.$id}:${key}`);
  }
  /**
   * 设置缓存值
   */
  $setCache(key, value, ttl) {
    this._optimizer.cache.set(`${this.$id}:${key}`, value, ttl);
  }
  /**
   * 删除缓存值
   */
  $deleteCache(key) {
    return this._optimizer.cache.delete(`${this.$id}:${key}`);
  }
  /**
   * 清空所有缓存
   */
  $clearCache() {
    this._optimizer.cache.clear();
  }
  /**
   * 添加清理函数
   */
  _addCleanup(cleanup) {
    this._cleanupFunctions.push(cleanup);
  }
  /**
   * 初始化 Store
   */
  _initializeStore(options) {
    const metadata = this._getDecoratorMetadata();
    const state = this._buildState(metadata, options?.state);
    this._initialState = state();
    const actions = this._buildActions(metadata, options?.actions);
    const getters = this._buildGetters(metadata, options?.getters);
    this._storeDefinition = defineStore(this.$id, {
      state,
      actions,
      getters
    });
    this._store = this._storeDefinition();
  }
  /**
   * 构建状态
   */
  _buildState(metadata, customState) {
    return () => {
      const state = customState?.() || {};
      metadata.filter((meta) => meta.type === "state").forEach((meta) => {
        const value = this[meta.key];
        if (value !== void 0) {
          state[meta.key] = value;
        }
      });
      return state;
    };
  }
  /**
   * 构建 Actions
   */
  _buildActions(metadata, customActions) {
    const actions = { ...customActions };
    metadata.filter((meta) => meta.type === "action").forEach((meta) => {
      const method = this[meta.key];
      if (typeof method === "function") {
        const boundMethod = (...args) => {
          return method.apply(this, args);
        };
        actions[meta.key] = boundMethod;
      }
    });
    return actions;
  }
  /**
   * 构建 Getters
   */
  _buildGetters(metadata, customGetters) {
    const getters = { ...customGetters };
    metadata.filter((meta) => meta.type === "getter").forEach((meta) => {
      const getter = this[meta.key];
      if (typeof getter === "function") {
        getters[meta.key] = getter.bind(this);
      }
    });
    return getters;
  }
  /**
   * 获取装饰器元数据（类级别缓存）
   * 使用 WeakMap 在所有实例间共享元数据，减少内存占用
   */
  _getDecoratorMetadata() {
    const ctor = this.constructor;
    if (!BaseStore._metadataCache.has(ctor)) {
      const metadata = Reflect.getMetadata(DECORATOR_METADATA_KEY, ctor) || [];
      BaseStore._metadataCache.set(ctor, metadata);
    }
    return BaseStore._metadataCache.get(ctor);
  }
}
BaseStore._metadataCache = /* @__PURE__ */ new WeakMap();

export { BaseStore };
//# sourceMappingURL=BaseStore.js.map
