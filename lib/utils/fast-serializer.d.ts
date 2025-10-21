/**
 * 高性能序列化工具
 * 针对常见场景优化的序列化/反序列化，比 JSON 更快
 */
/**
 * 快速序列化（优化版）
 * 针对简单对象提供更快的序列化
 */
export declare function fastStringify(value: any): string;
/**
 * 快速反序列化（优化版）
 */
export declare function fastParse<T = any>(value: string): T | null;
/**
 * 安全的深拷贝（使用原生 API 优先）
 */
export declare function safeCopy<T>(value: T): T;
/**
 * 对象相等性比较（优化版：快速路径）
 */
export declare function fastEqual(a: any, b: any): boolean;
/**
 * 对象浅拷贝（性能优化版）
 */
export declare function shallowCopy<T>(obj: T): T;
