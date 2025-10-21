/**
 * 验证和错误处理工具
 * 提供输入验证、类型检查、错误处理等功能
 */
/**
 * 验证规则类型
 */
export interface ValidationRule<T = any> {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: T) => boolean | string;
    message?: string;
}
/**
 * 验证结果
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * 验证器类
 */
export declare class Validator {
    /**
     * 验证单个值
     */
    static validate<T>(value: T, rules: ValidationRule<T>): ValidationResult;
    /**
     * 验证对象
     */
    static validateObject<T extends Record<string, any>>(obj: T, schema: Record<keyof T, ValidationRule>): ValidationResult;
    /**
     * 断言验证（验证失败抛出异常）
     */
    static assert<T>(value: T, rules: ValidationRule<T>, errorPrefix?: string): void;
    /**
     * 断言对象验证
     */
    static assertObject<T extends Record<string, any>>(obj: T, schema: Record<keyof T, ValidationRule>, errorPrefix?: string): void;
}
/**
 * 验证错误类
 */
export declare class ValidationError extends Error {
    constructor(message: string);
}
/**
 * Store 配置验证器
 */
export declare class StoreConfigValidator {
    /**
     * 验证 Store ID
     */
    static validateStoreId(id: string): void;
    /**
     * 验证缓存配置
     */
    static validateCacheOptions(options: any): void;
    /**
     * 验证持久化配置
     */
    static validatePersistOptions(options: any): void;
}
/**
 * 类型守卫工具
 */
export declare class TypeGuards {
    /**
     * 检查是否为对象
     */
    static isObject(value: any): value is Record<string, any>;
    /**
     * 检查是否为普通对象
     */
    static isPlainObject(value: any): value is Record<string, any>;
    /**
     * 检查是否为空对象
     */
    static isEmptyObject(value: any): boolean;
    /**
     * 检查是否为 Promise
     */
    static isPromise(value: any): value is Promise<any>;
    /**
     * 检查是否为函数
     */
    static isFunction(value: any): value is (...args: any[]) => any;
    /**
     * 检查是否为异步函数
     */
    static isAsyncFunction(value: any): boolean;
    /**
     * 检查是否为字符串
     */
    static isString(value: any): value is string;
    /**
     * 检查是否为非空字符串
     */
    static isNonEmptyString(value: any): value is string;
    /**
     * 检查是否为数字
     */
    static isNumber(value: any): value is number;
    /**
     * 检查是否为正整数
     */
    static isPositiveInteger(value: any): value is number;
    /**
     * 检查是否为布尔值
     */
    static isBoolean(value: any): value is boolean;
    /**
     * 检查是否为数组
     */
    static isArray<T = any>(value: any): value is T[];
    /**
     * 检查是否为非空数组
     */
    static isNonEmptyArray<T = any>(value: any): value is T[];
    /**
     * 检查是否为 null 或 undefined
     */
    static isNullOrUndefined(value: any): value is null | undefined;
    /**
     * 检查是否为有效值（非 null/undefined）
     */
    static isValidValue<T>(value: T | null | undefined): value is T;
}
/**
 * 断言工具
 */
export declare class Assert {
    /**
     * 断言条件为真
     */
    static isTrue(condition: boolean, message: string): asserts condition;
    /**
     * 断言条件为假
     */
    static isFalse(condition: boolean, message: string): asserts condition is false;
    /**
     * 断言值已定义
     */
    static isDefined<T>(value: T | null | undefined, message?: string): asserts value is T;
    /**
     * 断言值为对象
     */
    static isObject(value: any, message?: string): asserts value is Record<string, any>;
    /**
     * 断言值为数组
     */
    static isArray<T = any>(value: any, message?: string): asserts value is T[];
    /**
     * 断言值为函数
     */
    static isFunction(value: any, message?: string): asserts value is (...args: any[]) => any;
    /**
     * 断言值为字符串
     */
    static isString(value: any, message?: string): asserts value is string;
    /**
     * 断言值为数字
     */
    static isNumber(value: any, message?: string): asserts value is number;
    /**
     * 断言值在范围内
     */
    static inRange(value: number, min: number, max: number, message?: string): void;
    /**
     * 断言数组非空
     */
    static notEmpty<T>(array: T[], message?: string): asserts array is [T, ...T[]];
}
/**
 * 断言错误类
 */
export declare class AssertionError extends Error {
    constructor(message: string);
}
/**
 * 错误处理器
 */
export declare class ErrorHandler {
    private static handlers;
    /**
     * 注册错误处理器
     */
    static register(type: string, handler: (error: Error) => void): void;
    /**
     * 处理错误
     */
    static handle(error: Error, type?: string): void;
    /**
     * 包装异步函数，自动处理错误
     */
    static wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T, errorType?: string): T;
    /**
     * 安全执行（捕获并处理错误）
     */
    static safeExecute<T>(fn: () => Promise<T> | T, errorType?: string): Promise<T | null>;
    /**
     * 清除所有处理器
     */
    static clear(): void;
}
/**
 * 安全地解析 JSON
 */
export declare function safeJsonParse<T = any>(json: string, defaultValue?: T): T | null;
/**
 * 安全地序列化为 JSON
 */
export declare function safeJsonStringify(value: any, space?: number): string | null;
