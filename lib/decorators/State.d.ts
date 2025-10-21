import type { StateDecoratorOptions } from '../types';
import 'reflect-metadata';
/**
 * State 装饰器
 * 用于标记类属性为状态
 *
 * @example
 * ```typescript
 * class UserStore extends BaseStore {
 *   @State({ default: '' })
 *   name: string = ''
 *
 *   @State({ default: 0, persist: true })
 *   age: number = 0
 * }
 * ```
 */
export declare function State(options?: StateDecoratorOptions): PropertyDecorator;
/**
 * 响应式状态装饰器
 * 确保状态是深度响应式的
 */
export declare function ReactiveState(options?: StateDecoratorOptions): PropertyDecorator;
/**
 * 持久化状态装饰器
 * 自动持久化状态到本地存储
 */
export declare function PersistentState(options?: StateDecoratorOptions): PropertyDecorator;
/**
 * 只读状态装饰器
 * 创建只读的状态属性
 */
export declare function ReadonlyState(options: Omit<StateDecoratorOptions, 'default'> & {
    value: any;
}): PropertyDecorator;
