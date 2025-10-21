import type { Store, StoreDefinition } from 'pinia';
import type { ActionContext, ActionDefinition, GetterDefinition, IBaseStore, MutationCallback, StateDefinition, StoreOptions } from '../types';
/**
 * 基础 Store 类
 *
 * 提供类式的 Store 定义方式，支持装饰器和类型安全的状态管理。
 * 是所有类式 Store 的基类，集成了状态管理、动作执行、计算属性、
 * 缓存、持久化等功能。
 *
 * @template TState - 状态定义类型，必须继承自 StateDefinition
 * @template TActions - 动作定义类型，必须继承自 ActionDefinition
 * @template TGetters - 计算属性定义类型，必须继承自 GetterDefinition
 *
 * @example
 * ```typescript
 * class UserStore extends BaseStore<
 *   () => { name: string; age: number },
 *   { setName: (name: string) => void },
 *   { displayName: (state: any) => string }
 * > {
 *   constructor() {
 *     super('user', {
 *       state: () => ({ name: '', age: 0 }),
 *       actions: {
 *         setName(name: string) {
 *           this.name = name
 *         }
 *       },
 *       getters: {
 *         displayName: (state) => `User: ${state.name}`
 *       }
 *     })
 *   }
 * }
 * ```
 */
export declare abstract class BaseStore<TState extends StateDefinition = StateDefinition, TActions extends ActionDefinition = ActionDefinition, TGetters extends GetterDefinition = GetterDefinition> implements IBaseStore<TState, TActions, TGetters> {
    /** Store ID */
    readonly $id: string;
    /** Pinia Store 实例 */
    private _store?;
    /** Store 定义 */
    private _storeDefinition?;
    /** 构造阶段标记 */
    _isConstructing: boolean;
    /** 初始状态 */
    private _initialState?;
    /** 静态元数据缓存（类级别共享，减少内存占用） */
    private static _metadataCache;
    /** 缓存的 actions 对象 */
    private _cachedActions?;
    /** actions 缓存版本号，用于失效缓存 */
    private _actionsCacheVersion;
    /** 缓存的 getters 对象 */
    private _cachedGetters?;
    /** getters 缓存版本号，用于失效缓存 */
    private _gettersCacheVersion;
    /** 清理函数列表 */
    private _cleanupFunctions;
    /** 性能优化器 */
    private _optimizer;
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
    constructor(id: string, options?: Partial<StoreOptions<TState, TActions, TGetters>>);
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
    get $state(): TState;
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
    get $actions(): TActions;
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
    get $getters(): TGetters;
    /**
     * 重置状态
     */
    $reset(): void;
    /**
     * 部分更新状态
     *
     * 支持两种更新方式：
     * 1. 传入部分状态对象，会与当前状态合并
     * 2. 传入修改函数，可以直接修改状态
     *
     * @param partialState - 部分状态对象，会与当前状态合并
     * @param mutator - 状态修改函数，接收当前状态作为参数
     *
     * @example
     * ```typescript
     * // 方式1：传入部分状态对象
     * userStore.$patch({ name: 'John' })
     *
     * // 方式2：传入修改函数
     * userStore.$patch((state) => {
     *   state.name = 'John'
     *   state.age = 25
     * })
     * ```
     */
    $patch(partialState: Partial<TState>): void;
    $patch(mutator: (state: TState) => void): void;
    /**
     * 订阅状态变化
     */
    $subscribe(callback: MutationCallback<TState>, options?: {
        detached?: boolean;
    }): () => void;
    /**
     * 订阅 Action
     */
    $onAction(callback: (context: ActionContext<TState, TActions>) => void): () => void;
    /**
     * 获取 Pinia Store 实例
     */
    getStore(): Store<string, TState, TGetters, TActions> | undefined;
    /**
     * 获取 Store 定义
     */
    getStoreDefinition(): StoreDefinition<string, TState, TGetters, TActions> | undefined;
    /**
     * 销毁 Store，清理资源
     */
    $dispose(): void;
    /**
     * 持久化状态到存储
     */
    $persist(): void;
    /**
     * 从存储恢复状态
     */
    $hydrate(): void;
    /**
     * 清除持久化状态
     */
    $clearPersisted(): void;
    /**
     * 获取缓存值
     */
    $getCache(key: string): any;
    /**
     * 设置缓存值
     */
    $setCache(key: string, value: any, ttl?: number): void;
    /**
     * 删除缓存值
     */
    $deleteCache(key: string): boolean;
    /**
     * 清空所有缓存
     */
    $clearCache(): void;
    /**
     * 添加清理函数
     */
    protected _addCleanup(cleanup: () => void): void;
    /**
     * 初始化 Store
     */
    private _initializeStore;
    /**
     * 构建状态
     */
    private _buildState;
    /**
     * 构建 Actions
     */
    private _buildActions;
    /**
     * 构建 Getters
     */
    private _buildGetters;
    /**
     * 获取装饰器元数据（类级别缓存）
     * 使用 WeakMap 在所有实例间共享元数据，减少内存占用
     */
    private _getDecoratorMetadata;
}
