/**
 * 核心工具函数
 */
/**
 * 深度克隆对象
 *
 * 递归地克隆对象的所有属性，支持基本类型、数组、对象、日期等类型。
 * 注意：不支持函数、Symbol、循环引用等复杂情况。
 */
export declare function deepClone<T>(obj: T): T;
/**
 * 检查两个值是否深度相等
 */
export declare function deepEqual(a: any, b: any): boolean;
/**
 * 防抖函数
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 获取对象的嵌套属性值
 */
export declare function getNestedValue(obj: any, path: string): any;
/**
 * 设置对象的嵌套属性值
 */
export declare function setNestedValue(obj: any, path: string, value: any): void;
/**
 * 生成唯一 ID
 */
export declare function generateId(): string;
/**
 * 类型守卫：检查是否为函数
 */
export declare function isFunction(value: any): value is (...args: any[]) => any;
/**
 * 类型守卫：检查是否为对象
 */
export declare function isObject(value: any): value is object;
/**
 * 类型守卫：检查是否为 Promise
 */
export declare function isPromise(value: any): value is Promise<any>;
