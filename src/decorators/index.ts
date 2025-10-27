/**
 * 装饰器模块
 * 
 * 导出所有装饰器相关的功能。
 * 装饰器提供了优雅的方式来定义 Store 的状态、动作和计算属性。
 * 
 * **可用装饰器**:
 * - **状态装饰器**: `@State`, `@ReactiveState`, `@PersistentState`, `@ReadonlyState`
 * - **动作装饰器**: `@Action`, `@AsyncAction`, `@CachedAction`, `@DebouncedAction`, `@ThrottledAction`
 * - **计算属性装饰器**: `@Getter`, `@CachedGetter`, `@DependentGetter`, `@MemoizedGetter`
 * 
 * @module decorators
 * 
 * @example
 * ```typescript
 * import { BaseStore, State, Action, Getter } from '@ldesign/store'
 * 
 * class UserStore extends BaseStore {
 *   @State({ default: '' })
 *   name: string = ''
 *   
 *   @Action()
 *   setName(name: string) {
 *     this.name = name
 *   }
 *   
 *   @Getter()
 *   get displayName() {
 *     return `用户: ${this.name}`
 *   }
 * }
 * ```
 */

// 类型定义
export type {
  ActionDecoratorOptions,
  Constructor,
  DecoratorFactory,
  DecoratorType,
  GetterDecoratorOptions,
  StateDecoratorOptions,
} from '../types/decorators'

// 常量
export { DECORATOR_METADATA_KEY } from '../types/decorators'

// Action 装饰器
export {
  Action,
  AsyncAction,
  CachedAction,
  DebouncedAction,
  ThrottledAction,
} from './Action'

// Getter 装饰器
export { CachedGetter, DependentGetter, Getter, MemoizedGetter } from './Getter'

// State 装饰器
export { PersistentState, ReactiveState, ReadonlyState, State } from './State'
