/**
 * 高级功能模块
 * 提供批量操作、事务支持、状态快照、时间旅行调试、中间件系统、状态同步等高级功能
 *
 * @module AdvancedFeatures
 * @description 统一的高级功能模块，整合了所有高级特性
 */
import type { Store } from 'pinia';
import type { ActionDefinition, GetterDefinition, StateDefinition } from '../types';
/**
 * 批量操作管理器
 * 支持批量执行多个操作，提供原子性保障
 */
export declare class BatchOperationManager {
    private operations;
    private isExecuting;
    private rollbackStack;
    /**
     * 添加操作到批量队列
     */
    add(operation: () => void | Promise<void>, rollback?: () => void): this;
    /**
     * 执行所有批量操作
     */
    execute(): Promise<void>;
    /**
     * 清空批量操作队列
     */
    clear(): void;
    /**
     * 获取待执行操作数量
     */
    get size(): number;
}
/**
 * 事务管理器
 * 提供事务性操作支持，确保数据一致性
 */
export declare class TransactionManager<TState extends StateDefinition = StateDefinition> {
    private store;
    private snapshot;
    private inTransaction;
    private transactionLog;
    constructor(store: Store<string, TState, any, any>);
    /**
     * 开始事务
     */
    begin(): void;
    /**
     * 提交事务
     */
    commit(): void;
    /**
     * 回滚事务
     */
    rollback(): void;
    /**
     * 在事务中执行操作
     */
    run<T>(operation: () => T | Promise<T>): Promise<T>;
    /**
     * 记录事务操作
     */
    log(type: string, payload: any): void;
    /**
     * 获取事务日志
     */
    getLog(): Array<{
        type: string;
        payload: any;
        timestamp: number;
    }>;
}
/**
 * 状态快照管理器
 * 支持创建、保存、恢复状态快照，支持标签和比较功能
 */
export declare class SnapshotManager<TState extends StateDefinition = StateDefinition> {
    private store;
    private snapshots;
    private tags;
    private maxSnapshots;
    private autoSnapshot;
    private autoSnapshotInterval;
    constructor(store: Store<string, TState, any, any>, options?: {
        maxSnapshots?: number;
        autoSnapshot?: boolean;
        autoSnapshotInterval?: number;
    });
    /**
     * 创建快照
     */
    create(name: string, metadata?: any, tags?: string[]): string;
    /**
     * 恢复快照
     */
    restore(name: string): void;
    /**
     * 删除快照
     */
    delete(name: string): boolean;
    /**
     * 清空所有快照
     */
    clear(): void;
    /**
     * 获取所有快照信息
     */
    list(): Array<{
        name: string;
        metadata: any;
        timestamp: number;
    }>;
    /**
     * 启用自动快照
     */
    enableAutoSnapshot(interval: number): void;
    /**
     * 禁用自动快照
     */
    disableAutoSnapshot(): void;
    /**
     * 导出快照
     */
    export(name: string): string;
    /**
     * 导入快照
     */
    import(name: string, data: string): void;
    /**
     * 生成唯一ID
     */
    private generateId;
}
/**
 * 时间旅行调试器
 * 支持状态的时间旅行调试功能
 */
export declare class TimeTravelDebugger<TState extends StateDefinition = StateDefinition> {
    private history;
    private currentIndex;
    private maxHistory;
    private isTimeTravel;
    private store;
    constructor(store: Store<string, TState, any, any>, options?: {
        maxHistory?: number;
    });
    /**
     * 初始化时间旅行
     */
    private init;
    /**
     * 记录状态
     */
    private record;
    /**
     * 后退到上一个状态
     */
    backward(): void;
    /**
     * 前进到下一个状态
     */
    forward(): void;
    /**
     * 跳转到指定状态
     */
    goto(index: number): void;
    /**
     * 重置到初始状态
     */
    reset(): void;
    /**
     * 获取历史记录
     */
    getHistory(): Array<{
        state: TState;
        action?: string;
        timestamp: number;
        metadata?: any;
        index: number;
        isCurrent: boolean;
    }>;
    /**
     * 清空历史记录
     */
    clearHistory(): void;
    /**
     * 获取当前索引
     */
    getCurrentIndex(): number;
    /**
     * 获取历史长度
     */
    getHistoryLength(): number;
    /**
     * 导出历史记录
     */
    exportHistory(): string;
    /**
     * 导入历史记录
     */
    importHistory(data: string): void;
}
/**
 * 状态比较器
 * 用于比较两个状态之间的差异
 */
export declare class StateDiffer<TState extends StateDefinition = StateDefinition> {
    /**
     * 比较两个状态的差异
     */
    diff(oldState: TState, newState: TState): Array<{
        path: string;
        oldValue: any;
        newValue: any;
        type: 'added' | 'deleted' | 'modified';
    }>;
    /**
     * 应用差异到状态
     */
    applyDiff(state: TState, differences: Array<{
        path: string;
        newValue: any;
        type: 'added' | 'deleted' | 'modified';
    }>): TState;
}
/**
 * 状态验证器
 * 用于验证状态的合法性
 */
export declare class StateValidator<TState extends StateDefinition = StateDefinition> {
    private rules;
    /**
     * 添加验证规则
     */
    addRule(path: string, validator: (value: any) => boolean | string): void;
    /**
     * 删除验证规则
     */
    removeRule(path: string): boolean;
    /**
     * 验证状态
     */
    validate(state: TState): {
        valid: boolean;
        errors: Array<{
            path: string;
            message: string;
        }>;
    };
    /**
     * 根据路径获取值
     */
    private getValueByPath;
}
/**
 * 创建高级功能增强的 Store
 */
export declare function createAdvancedStore<TState extends StateDefinition = StateDefinition, TActions extends ActionDefinition = ActionDefinition, TGetters extends GetterDefinition = GetterDefinition>(store: Store<string, TState, TGetters, TActions>): {
    store: Store<string, TState, TGetters, TActions>;
    batch: BatchOperationManager;
    transaction: TransactionManager<TState>;
    snapshot: SnapshotManager<TState>;
    timeTravel: TimeTravelDebugger<TState>;
    differ: StateDiffer<TState>;
    validator: StateValidator<TState>;
    runInBatch(operations: Array<() => void | Promise<void>>): Promise<void>;
    runInTransaction<T>(operation: () => T | Promise<T>): Promise<T>;
    createSnapshot(name: string): void;
    restoreSnapshot(name: string): void;
    undo(): void;
    redo(): void;
    getDiff(oldState: TState, newState: TState): {
        path: string;
        oldValue: any;
        newValue: any;
        type: "added" | "deleted" | "modified";
    }[];
    validateState(state?: TState): {
        valid: boolean;
        errors: Array<{
            path: string;
            message: string;
        }>;
    };
};
/**
 * 中间件系统
 * 提供灵活的中间件机制，支持 action 和 state 拦截
 */
export declare class MiddlewareSystem<S = any> {
    private middlewares;
    /**
     * 注册中间件
     */
    use(middleware: Middleware<S>): void;
    /**
     * 执行中间件链
     */
    execute(context: MiddlewareContext<S>): Promise<void>;
    /**
     * 创建 action 中间件
     */
    static createActionMiddleware<S>(handler: (action: ActionInfo, state: S) => void | Promise<void>): Middleware<S>;
    /**
     * 创建 state 中间件
     */
    static createStateMiddleware<S>(handler: (oldState: S, newState: S) => void | Promise<void>): Middleware<S>;
    /**
     * 创建日志中间件
     */
    static createLogger<S>(options?: LoggerOptions): Middleware<S>;
    /**
     * 创建性能监控中间件
     */
    static createPerformanceMonitor<S>(threshold?: number): Middleware<S>;
    private static computeDiff;
}
export interface ActionInfo {
    type: string;
    payload?: any;
    meta?: any;
}
export interface Middleware<S = any> {
    (context: MiddlewareContext<S>, next: () => Promise<void>): Promise<void>;
}
export interface MiddlewareContext<S = any> {
    type: 'action' | 'state';
    state: S;
    oldState?: S;
    action?: ActionInfo;
    [key: string]: any;
}
export interface LoggerOptions {
    collapsed?: boolean;
    duration?: boolean;
    diff?: boolean;
}
export declare function createMiddlewareSystem<S>(): MiddlewareSystem<S>;
