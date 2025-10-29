/**
 * 存储适配器
 * 
 * @module persistence/storage-adapter
 */

import type { Serializer, StorageAdapter } from '../types'

/**
 * 内存存储适配器
 * 
 * 用于无法使用 localStorage 的环境
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>()

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }
}

/**
 * 默认序列化器（JSON）
 */
export class JSONSerializer implements Serializer {
  serialize(value: any): string {
    return JSON.stringify(value)
  }

  deserialize(str: string): any {
    try {
      return JSON.parse(str)
    }
    catch {
      return null
    }
  }
}

/**
 * 获取默认存储适配器
 * 
 * 浏览器环境使用 localStorage，Node.js 使用内存存储
 * 
 * @returns 存储适配器
 */
export function getDefaultStorage(): StorageAdapter {
  if (typeof localStorage !== 'undefined') {
    return localStorage
  }
  return new MemoryStorageAdapter()
}

/**
 * 获取默认序列化器
 * 
 * @returns 序列化器
 */
export function getDefaultSerializer(): Serializer {
  return new JSONSerializer()
}


