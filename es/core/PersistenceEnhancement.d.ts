/**
 * 状态持久化增强模块
 * 提供更强大的持久化功能，包括版本管理、迁移、压缩、加密等
 *
 * @module PersistenceEnhancement
 */
import type { StateDefinition } from '../types';
/**
 * 持久化策略
 */
export declare enum PersistenceStrategy {
    /** 立即持久化 */
    IMMEDIATE = "immediate",
    /** 防抖持久化 */
    DEBOUNCED = "debounced",
    /** 节流持久化 */
    THROTTLED = "throttled",
    /** 手动持久化 */
    MANUAL = "manual"
}
/**
 * 存储引擎接口
 */
export interface StorageEngine {
    getItem: (key: string) => Promise<string | null> | string | null;
    setItem: (key: string, value: string) => Promise<void> | void;
    removeItem: (key: string) => Promise<void> | void;
    clear?: () => Promise<void> | void;
}
/**
 * 状态迁移函数
 */
export type StateMigration<T = any> = (oldState: any) => T;
/**
 * 持久化配置
 */
export interface EnhancedPersistOptions<T extends StateDefinition = StateDefinition> {
    /** 存储键名 */
    key: string;
    /** 存储引擎 */
    storage?: StorageEngine;
    /** 持久化策略 */
    strategy?: PersistenceStrategy;
    /** 防抖/节流延迟（毫秒） */
    delay?: number;
    /** 需要持久化的路径 */
    paths?: Array<keyof T | string>;
    /** 版本号 */
    version?: number;
    /** 状态迁移映射 */
    migrations?: Record<number, StateMigration<T>>;
    /** 是否压缩 */
    compress?: boolean;
    /** 是否加密 */
    encrypt?: boolean;
    /** 加密密钥 */
    encryptionKey?: string;
    /** 序列化函数 */
    serializer?: (state: T) => string;
    /** 反序列化函数 */
    deserializer?: (data: string) => T;
    /** 错误处理 */
    onError?: (error: Error) => void;
}
/**
 * 增强的持久化管理器
 */
export declare class EnhancedPersistenceManager<T extends StateDefinition = StateDefinition> {
    private options;
    private saveTimer;
    private lastSaveTime;
    constructor(options: EnhancedPersistOptions<T>);
    /**
     * 保存状态
     */
    save(state: T): Promise<void>;
    /**
     * 执行保存
     */
    private doSave;
    /**
     * 加载状态
     */
    load(): Promise<T | null>;
    /**
     * 清除持久化数据
     */
    clear(): Promise<void>;
    /**
     * 手动触发保存（用于 MANUAL 策略）
     */
    flush(state: T): Promise<void>;
    /**
     * 压缩数据
     */
    private compress;
    /**
     * 解压数据
     */
    private decompress;
    /**
     * 加密数据
     */
    private encrypt;
    /**
     * 解密数据
     */
    private decrypt;
    /**
     * 设置嵌套值
     */
    private setNestedValue;
    /**
     * 创建内存存储引擎
     */
    private createMemoryStorage;
}
/**
 * 创建增强的持久化管理器
 */
export declare function createEnhancedPersistence<T extends StateDefinition = StateDefinition>(options: EnhancedPersistOptions<T>): EnhancedPersistenceManager<T>;
/**
 * IndexedDB 存储引擎
 */
export declare class IndexedDBStorage implements StorageEngine {
    private dbName;
    private storeName;
    private db;
    constructor(dbName?: string, storeName?: string);
    private getDB;
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
}
