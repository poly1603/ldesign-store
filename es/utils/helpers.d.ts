/**
 * 通用辅助工具函数
 * 只保留核心的、有特殊价值的工具函数
 */
/**
 * 深度克隆对象（优化版：优先使用原生 API）
 * 支持循环引用、Map、Set、Date、RegExp 等复杂类型
 */
export declare function deepClone<T>(obj: T, seen?: WeakMap<object, any>): T;
/**
 * 深度合并对象
 */
export declare function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
/**
 * 深度冻结对象
 */
export declare function deepFreeze<T>(obj: T): Readonly<T>;
/**
 * 获取对象深层属性值
 */
export declare function getDeepValue<T = any>(obj: any, path: string | string[], defaultValue?: T): T | undefined;
/**
 * 设置对象深层属性值
 */
export declare function setDeepValue(obj: any, path: string | string[], value: any): void;
/**
 * 删除对象深层属性
 */
export declare function deleteDeepValue(obj: any, path: string | string[]): boolean;
/**
 * 判断两个值是否深度相等
 */
export declare function deepEqual(a: any, b: any, seen?: WeakMap<object, any>): boolean;
/**
 * 扁平化对象（将嵌套对象转为平面结构）
 */
export declare function flattenObject(obj: any, prefix?: string, separator?: string): Record<string, any>;
/**
 * 反扁平化对象（将平面对象转为嵌套结构）
 */
export declare function unflattenObject(obj: Record<string, any>, separator?: string): any;
/**
 * 延迟执行
 */
export declare function delay(ms: number): Promise<void>;
/**
 * 重试函数
 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxAttempts?: number;
    delay?: number;
    onRetry?: (error: Error, attempt: number) => void;
}): Promise<T>;
/**
 * Memoize 函数（缓存函数结果）
 */
export declare function memoize<T extends (...args: any[]) => any>(fn: T, resolver?: (...args: Parameters<T>) => string): T;
/**
 * 批处理函数
 */
export declare function batch<T, R>(items: T[], batchSize: number, processor: (batch: T[]) => Promise<R[]>): Promise<R[]>;
/**
 * 并发控制
 */
export declare function pLimit<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]>;
/**
 * 生成唯一 ID
 */
export declare function generateId(prefix?: string): string;
/**
 * 格式化文件大小
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 格式化时间
 */
export declare function formatDuration(ms: number): string;
/**
 * 选择对象的部分属性
 */
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * 排除对象的部分属性
 */
export declare function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/**
 * 防抖函数
 * 注：推荐使用 lodash-es/debounce 以获得更好的性能和功能
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 * 注：推荐使用 lodash-es/throttle 以获得更好的性能和功能
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, interval: number): (...args: Parameters<T>) => void;
/**
 * 安全地获取对象的键
 */
export declare function safeKeys<T extends object>(obj: T): (keyof T)[];
/**
 * 安全地获取对象的值
 */
export declare function safeValues<T extends object>(obj: T): T[keyof T][];
/**
 * 安全地获取对象的键值对
 */
export declare function safeEntries<T extends object>(obj: T): [keyof T, T[keyof T]][];
/**
 * 数组去重
 */
export declare function unique<T>(arr: T[]): T[];
/**
 * 数组分组
 */
export declare function groupBy<T>(arr: T[], key: keyof T | ((item: T) => string | number)): Record<string, T[]>;
/**
 * 分块数组
 */
export declare function chunk<T>(arr: T[], size: number): T[][];
