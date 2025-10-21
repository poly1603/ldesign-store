import type { GetterDecoratorOptions } from '../types';
import 'reflect-metadata';
/**
 * Getter 装饰器
 * 用于标记类方法为计算属性
 *
 * @example
 * ```typescript
 * class UserStore extends BaseStore {
 *   @State({ default: '' })
 *   firstName: string = ''
 *
 *   @State({ default: '' })
 *   lastName: string = ''
 *
 *   @Getter({ deps: ['firstName', 'lastName'] })
 *   get fullName() {
 *     return `${this.firstName} ${this.lastName}`
 *   }
 *
 *   @Getter({ cache: true })
 *   get expensiveComputation() {
 *     return this.someExpensiveCalculation()
 *   }
 * }
 * ```
 */
export declare function Getter(options?: GetterDecoratorOptions): MethodDecorator;
/**
 * 缓存 Getter 装饰器
 * 自动缓存计算结果
 */
export declare function CachedGetter(deps?: string[]): MethodDecorator;
/**
 * 依赖 Getter 装饰器
 * 指定计算属性的依赖项
 */
export declare function DependentGetter(deps: string[]): MethodDecorator;
/**
 * 记忆化 Getter 装饰器
 * 结合缓存和依赖检查
 */
export declare function MemoizedGetter(deps: string[]): MethodDecorator;
