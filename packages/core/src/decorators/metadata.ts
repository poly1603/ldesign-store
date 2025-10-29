/**
 * 装饰器元数据注册
 * 
 * 框架无关的装饰器实现，仅注册元数据
 * 
 * @module decorators/metadata
 */

import 'reflect-metadata'
import type {
  ActionDecoratorOptions,
  DecoratorMetadata,
  DecoratorType,
  GetterDecoratorOptions,
  StateDecoratorOptions,
} from '../types'
import { DECORATOR_METADATA_KEY } from '../types'

/**
 * 注册装饰器元数据
 * 
 * @param target - 目标对象
 * @param metadata - 元数据
 * @internal
 */
export function registerMetadata(target: any, metadata: DecoratorMetadata): void {
  const existingMetadata: DecoratorMetadata[] = Reflect.getMetadata(
    DECORATOR_METADATA_KEY,
    target.constructor
  ) || []

  existingMetadata.push(metadata)

  Reflect.defineMetadata(
    DECORATOR_METADATA_KEY,
    existingMetadata,
    target.constructor
  )
}

/**
 * 获取装饰器元数据
 * 
 * @param target - 目标对象或类
 * @returns 元数据数组
 */
export function getMetadata(target: any): DecoratorMetadata[] {
  const constructor = typeof target === 'function' ? target : target.constructor
  return Reflect.getMetadata(DECORATOR_METADATA_KEY, constructor) || []
}

/**
 * State 装饰器
 * 
 * 标记属性为状态
 * 
 * @param options - 状态选项
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * class Store {
 *   @State({ default: 0 })
 *   count: number = 0
 * }
 * ```
 */
export function State(options?: StateDecoratorOptions) {
  return function (target: any, propertyKey: string) {
    registerMetadata(target, {
      type: 'state' as DecoratorType,
      propertyKey,
      options
    })
  }
}

/**
 * Action 装饰器
 * 
 * 标记方法为 Action
 * 
 * @param options - Action 选项
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * class Store {
 *   @Action({ cache: true })
 *   async fetchData() {
 *     // ...
 *   }
 * }
 * ```
 */
export function Action(options?: ActionDecoratorOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    registerMetadata(target, {
      type: 'action' as DecoratorType,
      propertyKey,
      options
    })
    return descriptor
  }
}

/**
 * Getter 装饰器
 * 
 * 标记 getter 为计算属性
 * 
 * @param options - Getter 选项
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * class Store {
 *   @Getter({ cache: true })
 *   get doubleCount() {
 *     return this.count * 2
 *   }
 * }
 * ```
 */
export function Getter(options?: GetterDecoratorOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    registerMetadata(target, {
      type: 'getter' as DecoratorType,
      propertyKey,
      options
    })
    return descriptor
  }
}


