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

var CompositionStore = require('./CompositionStore.cjs');
var FunctionalStore = require('./FunctionalStore.cjs');

exports.StoreType = void 0;
(function(StoreType2) {
  StoreType2["CLASS"] = "class";
  StoreType2["FUNCTIONAL"] = "functional";
  StoreType2["COMPOSITION"] = "composition";
})(exports.StoreType || (exports.StoreType = {}));
class StoreFactory {
  /**
   * 创建 Store 实例（用于兼容）
   */
  createStore(options) {
    return StoreFactory.create(options);
  }
  /**
   * 创建 Store 实例
   *
   * 根据配置选项创建不同类型的 Store，支持类式、函数式、组合式三种类型。
   * 自动管理 Store 实例，避免重复创建。
   *
   * @template TState - 状态定义类型
   * @template TActions - 动作定义类型
   * @template TGetters - 计算属性定义类型
   * @template T - 返回类型
   *
   * @param options - 统一的 Store 配置选项
   * @param options.type - Store 类型（class/functional/composition）
   * @param options.id - Store 唯一标识符
   * @param options.state - 状态初始化函数
   * @param options.actions - 动作方法定义
   * @param options.getters - 计算属性定义
   *
   * @returns 创建的 Store 实例
   *
   * @throws {Error} 当 Store 类型未知时抛出错误
   *
   * @example
   * ```typescript
   * const userStore = StoreFactory.create({
   *   type: StoreType.FUNCTIONAL,
   *   id: 'user-store',
   *   state: () => ({ name: '', age: 0 }),
   *   actions: {
   *     setName(name: string) { this.name = name }
   *   }
   * })
   * ```
   */
  static create(options) {
    const id = options.id;
    if (!id) {
      throw new Error("Store id is required");
    }
    if (this.definitions.has(id)) {
      console.warn(`Store with id "${id}" already exists. Returning existing definition.`);
      return this.definitions.get(id);
    }
    let storeDefinition;
    switch (options.type) {
      case exports.StoreType.CLASS: {
        const classOptions = options;
        storeDefinition = () => {
          if (!this.instances.has(id)) {
            const StoreClass = classOptions.storeClass;
            this.instances.set(id, new StoreClass(id, classOptions));
          }
          return this.instances.get(id);
        };
        break;
      }
      case exports.StoreType.FUNCTIONAL: {
        const functionalOptions = options;
        storeDefinition = FunctionalStore.createFunctionalStore(functionalOptions);
        break;
      }
      case exports.StoreType.COMPOSITION: {
        const compositionOptions = options;
        storeDefinition = CompositionStore.createCompositionStore(compositionOptions, compositionOptions.setup);
        break;
      }
      default:
        throw new Error(`Unknown store type: ${options.type}`);
    }
    this.definitions.set(id, storeDefinition);
    return storeDefinition;
  }
  /**
   * 获取已创建的 Store 定义
   */
  static get(id) {
    return this.definitions.get(id);
  }
  /**
   * 检查 Store 是否存在
   */
  static has(id) {
    return this.definitions.has(id);
  }
  /**
   * 删除 Store
   */
  static delete(id) {
    const instance = this.instances.get(id);
    if (instance && typeof instance.$dispose === "function") {
      instance.$dispose();
    }
    this.instances.delete(id);
    return this.definitions.delete(id);
  }
  /**
   * 清空所有 Store
   */
  static clear() {
    for (const instance of this.instances.values()) {
      if (instance && typeof instance.$dispose === "function") {
        instance.$dispose();
      }
    }
    this.instances.clear();
    this.definitions.clear();
  }
  /**
   * 获取所有 Store ID
   */
  static getIds() {
    return Array.from(this.definitions.keys());
  }
  /**
   * 获取 Store 统计信息
   */
  static getStats() {
    return {
      totalStores: this.definitions.size,
      activeInstances: this.instances.size,
      storeIds: this.getIds()
    };
  }
}
StoreFactory.instances = /* @__PURE__ */ new Map();
StoreFactory.definitions = /* @__PURE__ */ new Map();
function createClassStore(id, storeClass, options) {
  return StoreFactory.create({
    type: exports.StoreType.CLASS,
    id,
    storeClass,
    ...options
  });
}
function createStore(options) {
  return StoreFactory.create({
    type: exports.StoreType.FUNCTIONAL,
    ...options
  });
}
function createCompositionStoreFactory(id, setup, options) {
  return StoreFactory.create({
    type: exports.StoreType.COMPOSITION,
    id,
    setup,
    ...options
  });
}
function defineStore(options) {
  return StoreFactory.create(options);
}

exports.StoreFactory = StoreFactory;
exports.createClassStore = createClassStore;
exports.createCompositionStoreFactory = createCompositionStoreFactory;
exports.createStore = createStore;
exports.defineStore = defineStore;
exports.factory = StoreFactory;
//# sourceMappingURL=StoreFactory.cjs.map
