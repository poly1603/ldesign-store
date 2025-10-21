/**
 * Bug修复和错误处理增强
 * 解决内存泄漏、循环依赖、异步竞态等问题
 */
import type { EffectScope, WatchStopHandle } from 'vue';
/**
 * 循环依赖检测器
 */
export declare class CircularDependencyDetector {
    private static dependencies;
    private static currentPath;
    /**
     * 开始依赖追踪
     */
    static startTracking(id: string): void;
    /**
     * 结束依赖追踪
     */
    static endTracking(id: string): void;
    /**
     * 添加依赖关系
     */
    static addDependency(from: string, to: string): void;
    /**
     * 检查循环依赖
     */
    private static checkCycle;
    /**
     * 清理依赖记录
     */
    static clear(): void;
    /**
     * 获取依赖图
     */
    static getDependencyGraph(): Map<string, Set<string>>;
}
/**
 * 内存泄漏防护器
 */
export declare class MemoryLeakGuard {
    private static scopes;
    private static watchers;
    private static timers;
    private static listeners;
    /**
     * 创建受保护的作用域
     */
    static createScope(owner: object): EffectScope;
    /**
     * 在作用域内运行
     */
    static runInScope<T>(owner: object, fn: () => T): T;
    /**
     * 添加监听器
     */
    static addWatcher(owner: object, watcher: WatchStopHandle): void;
    /**
     * 添加定时器
     */
    static addTimer(owner: object, timer: NodeJS.Timeout): void;
    /**
     * 添加事件监听器
     */
    static addEventListener(owner: object, target: EventTarget, type: string, listener: EventListener, options?: AddEventListenerOptions): void;
    /**
     * 清理资源
     */
    static cleanup(owner: object): void;
    /**
     * 检查是否有泄漏
     */
    static hasLeaks(owner: object): boolean;
}
/**
 * 异步竞态条件处理器
 */
export declare class AsyncRaceConditionHandler {
    private static requestMap;
    private static versionMap;
    /**
     * 执行异步操作（自动取消旧的）
     */
    static execute<T>(owner: object, key: string, executor: (signal: AbortSignal) => Promise<T>): Promise<T>;
    /**
     * 取消请求
     */
    static cancel(owner: object, key: string): void;
    /**
     * 取消所有请求
     */
    static cancelAll(owner: object): void;
    /**
     * 防抖执行
     */
    static debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
    /**
     * 节流执行
     */
    static throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void;
    /**
     * 并发控制
     */
    static createConcurrencyLimiter(maxConcurrent: number): {
        run: <T>(fn: () => Promise<T>) => Promise<T>;
    };
}
/**
 * 错误处理增强
 */
export declare class EnhancedErrorHandler {
    private static errorHandlers;
    private static globalHandler;
    /**
     * 注册错误处理器
     */
    static register(type: string, handler: ErrorHandler): void;
    /**
     * 设置全局错误处理器
     */
    static setGlobalHandler(handler: GlobalErrorHandler): void;
    /**
     * 处理错误
     */
    static handle(error: Error, context?: ErrorContext): void;
    /**
     * 包装函数以捕获错误
     */
    static wrap<T extends (...args: any[]) => any>(fn: T, context?: ErrorContext): T;
    /**
     * 创建安全的异步函数
     */
    static safeAsync<T extends (...args: any[]) => Promise<any>>(fn: T, fallback?: any): T;
}
/**
 * 类型安全增强
 */
export declare class TypeSafetyEnhancer {
    /**
     * 运行时类型检查
     */
    static validateType<T>(value: unknown, validator: TypeValidator<T>): value is T;
    /**
     * 创建类型守卫
     */
    static createGuard<T>(validator: (value: unknown) => boolean): (value: unknown) => value is T;
    /**
     * 安全的类型转换
     */
    static safeCast<T>(value: unknown, type: Constructor<T>, fallback?: T): T;
    /**
     * 深度冻结对象
     */
    static deepFreeze<T extends object>(obj: T): Readonly<T>;
    /**
     * 创建不可变对象
     */
    static createImmutable<T extends object>(obj: T): Immutable<T>;
}
/**
 * 资源清理器
 */
export declare class ResourceCleaner {
    private cleanupTasks;
    /**
     * 注册清理任务
     */
    register(task: CleanupTask): void;
    /**
     * 执行清理
     */
    cleanup(): Promise<void>;
    /**
     * 创建可清理的资源
     */
    createDisposable<T>(resource: T, cleanup: (resource: T) => void | Promise<void>): Disposable<T>;
}
interface ErrorHandler {
    (error: Error, context?: ErrorContext): void;
}
interface GlobalErrorHandler {
    (error: Error, context?: ErrorContext): void;
}
interface ErrorContext {
    store?: string;
    action?: string;
    state?: any;
    [key: string]: any;
}
interface TypeValidator<T> {
    validate: (value: unknown) => value is T;
}
interface Constructor<T> {
    new (...args: any[]): T;
}
type Immutable<T> = {
    readonly [K in keyof T]: T[K] extends object ? Immutable<T[K]> : T[K];
};
type CleanupTask = () => void | Promise<void>;
interface Disposable<T> {
    resource: T;
    dispose: () => Promise<void>;
}
export declare const detectCircularDependency: typeof CircularDependencyDetector.startTracking;
export declare const endCircularDependencyDetection: typeof CircularDependencyDetector.endTracking;
export declare const guardMemoryLeak: typeof MemoryLeakGuard.createScope;
export declare const cleanupResources: typeof MemoryLeakGuard.cleanup;
export declare const handleAsyncRace: typeof AsyncRaceConditionHandler.execute;
export declare const handleError: typeof EnhancedErrorHandler.handle;
export declare const validateType: typeof TypeSafetyEnhancer.validateType;
export {};
