import type { ActionDecoratorOptions } from '../types';
import 'reflect-metadata';
/**
 * Action 装饰器
 * 用于标记类方法为 Action
 *
 * @example
 * ```typescript
 * class UserStore extends BaseStore {
 *   @Action()
 *   updateName(name: string) {
 *     this.name = name
 *   }
 *
 *   @Action({ async: true, cache: true })
 *   async fetchUser(id: string) {
 *     const user = await api.getUser(id)
 *     this.user = user
 *     return user
 *   }
 * }
 * ```
 */
export declare function Action(options?: ActionDecoratorOptions): MethodDecorator;
/**
 * 异步 Action 装饰器
 * 专门用于异步操作的 Action
 */
export declare function AsyncAction(options?: Omit<ActionDecoratorOptions, 'async'>): MethodDecorator;
/**
 * 缓存 Action 装饰器
 * 自动缓存 Action 的执行结果
 */
export declare function CachedAction(cacheTime?: number): MethodDecorator;
/**
 * 防抖 Action 装饰器
 * 防止 Action 被频繁调用
 */
export declare function DebouncedAction(delay: number): MethodDecorator;
/**
 * 节流 Action 装饰器
 * 限制 Action 的调用频率
 */
export declare function ThrottledAction(interval: number): MethodDecorator;
