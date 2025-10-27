/**
 * 类型推断增强
 * 
 * 提供更强大的类型推断和类型守卫工具。
 * 帮助 TypeScript 更好地理解 Store 的类型结构。
 */

import type { Store, StoreDefinition } from 'pinia'
import type { BaseStore as IBaseStore } from './index'

/**
 * 从 Store 推断状态类型
 * 
 * @example
 * ```typescript
 * const useUserStore = createFunctionalStore({
 *   id: 'user',
 *   state: () => ({ name: '', age: 0 })
 * })
 * 
 * type UserState = InferStoreState<typeof useUserStore>
 * // { name: string; age: number }
 * ```
 */
export type InferStoreState<T> =
  T extends () => infer R
  ? R extends { $state: infer S }
  ? S
  : never
  : T extends { $state: infer S }
  ? S
  : T extends StoreDefinition<any, infer State, any, any>
  ? State
  : never

/**
 * 从 Store 推断 Actions 类型
 * 
 * @example
 * ```typescript
 * type UserActions = InferStoreActions<typeof useUserStore>
 * ```
 */
export type InferStoreActions<T> =
  T extends () => infer R
  ? R extends { $actions: infer A }
  ? A
  : never
  : T extends { $actions: infer A }
  ? A
  : T extends StoreDefinition<any, any, any, infer Actions>
  ? Actions
  : never

/**
 * 从 Store 推断 Getters 类型
 * 
 * @example
 * ```typescript
 * type UserGetters = InferStoreGetters<typeof useUserStore>
 * ```
 */
export type InferStoreGetters<T> =
  T extends () => infer R
  ? R extends { $getters: infer G }
  ? G
  : never
  : T extends { $getters: infer G }
  ? G
  : T extends StoreDefinition<any, any, infer Getters, any>
  ? Getters
  : never

/**
 * 从状态对象推断字段类型
 * 
 * @example
 * ```typescript
 * interface UserState {
 *   name: string
 *   age: number
 *   profile: { bio: string }
 * }
 * 
 * type NameType = InferStateField<UserState, 'name'> // string
 * type AgeType = InferStateField<UserState, 'age'> // number
 * ```
 */
export type InferStateField<State, Key extends keyof State> = State[Key]

/**
 * 从 Actions 推断方法签名
 * 
 * @example
 * ```typescript
 * type SetNameAction = InferActionSignature<UserActions, 'setName'>
 * // (name: string) => void
 * ```
 */
export type InferActionSignature<Actions, Key extends keyof Actions> = Actions[Key]

/**
 * 检查类型是否为 Store
 * 
 * @example
 * ```typescript
 * function processStore<T>(store: T) {
 *   if (isStoreType(store)) {
 *     // TypeScript 知道 store 有 $state, $actions 等
 *     console.log(store.$state)
 *   }
 * }
 * ```
 */
export function isStoreType(value: any): value is IBaseStore {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.$id === 'string' &&
    typeof value.$state === 'object' &&
    typeof value.$reset === 'function' &&
    typeof value.$patch === 'function'
  )
}

/**
 * 检查是否为 Pinia Store
 */
export function isPiniaStore(value: any): value is Store {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.$id === 'string' &&
    typeof value.$state === 'object' &&
    typeof value.$subscribe === 'function' &&
    typeof value.$onAction === 'function'
  )
}

/**
 * 提取状态中的函数字段
 * 
 * @example
 * ```typescript
 * interface State {
 *   name: string
 *   age: number
 *   getName: () => string
 *   setName: (name: string) => void
 * }
 * 
 * type Functions = ExtractFunctions<State>
 * // { getName: () => string; setName: (name: string) => void }
 * ```
 */
export type ExtractFunctions<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K]
}

/**
 * 提取状态中的非函数字段
 * 
 * @example
 * ```typescript
 * type NonFunctions = ExtractNonFunctions<State>
 * // { name: string; age: number }
 * ```
 */
export type ExtractNonFunctions<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K]
}

/**
 * 使状态字段可选
 * 
 * @example
 * ```typescript
 * interface UserState {
 *   name: string
 *   age: number
 *   email: string
 * }
 * 
 * type PartialUser = MakeOptional<UserState, 'email'>
 * // { name: string; age: number; email?: string }
 * ```
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 使状态字段必需
 * 
 * @example
 * ```typescript
 * type RequiredUser = MakeRequired<Partial<UserState>, 'name'>
 * // { name: string; age?: number; email?: string }
 * ```
 */
export type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 深度只读类型
 * 
 * @example
 * ```typescript
 * type ReadonlyState = DeepReadonly<UserState>
 * ```
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (...args: any[]) => any
  ? T[P]
  : T[P] extends object
  ? DeepReadonly<T[P]>
  : T[P]
}

/**
 * 深度可写类型
 * 
 * @example
 * ```typescript
 * type WritableState = DeepWritable<Readonly<UserState>>
 * ```
 */
export type DeepWritable<T> = {
  -readonly [P in keyof T]: T[P] extends (...args: any[]) => any
  ? T[P]
  : T[P] extends object
  ? DeepWritable<T[P]>
  : T[P]
}

/**
 * 从对象类型提取键值对类型
 * 
 * @example
 * ```typescript
 * type UserEntry = ObjectEntry<UserState>
 * // ['name', string] | ['age', number] | ['email', string]
 * ```
 */
export type ObjectEntry<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T]

/**
 * 可序列化类型约束
 * 
 * 确保类型可以被 JSON 序列化。
 */
export type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Serializable[]
  | { [key: string]: Serializable }

/**
 * 检查类型是否可序列化
 */
export function isSerializable(value: any): value is Serializable {
  if (value === null || value === undefined) return true

  const type = typeof value
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return true
  }

  if (Array.isArray(value)) {
    return value.every(isSerializable)
  }

  if (type === 'object') {
    return Object.values(value).every(isSerializable)
  }

  return false
}

/**
 * Promise 返回值类型
 * 
 * @example
 * ```typescript
 * type User = Awaited<Promise<User>> // User
 * ```
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/**
 * 函数参数类型
 * 
 * @example
 * ```typescript
 * type SetNameParams = FunctionParams<(name: string, age: number) => void>
 * // [string, number]
 * ```
 */
export type FunctionParams<T extends (...args: any[]) => any> = Parameters<T>

/**
 * 函数返回值类型
 * 
 * @example
 * ```typescript
 * type Result = FunctionReturn<() => User>
 * // User
 * ```
 */
export type FunctionReturn<T extends (...args: any[]) => any> = ReturnType<T>

/**
 * 异步函数返回值类型
 * 
 * @example
 * ```typescript
 * type User = AsyncFunctionReturn<() => Promise<User>>
 * // User (不是 Promise<User>)
 * ```
 */
export type AsyncFunctionReturn<T extends (...args: any[]) => Promise<any>> =
  Awaited<ReturnType<T>>

/**
 * 提取对象中的 Promise 字段
 */
export type ExtractPromiseFields<T> = {
  [K in keyof T]: T[K] extends Promise<any> ? K : never
}[keyof T]

/**
 * 提取对象中的非 Promise 字段
 */
export type ExtractNonPromiseFields<T> = {
  [K in keyof T]: T[K] extends Promise<any> ? never : K
}[keyof T]

/**
 * 将对象中的所有 Promise 字段解包
 * 
 * @example
 * ```typescript
 * interface State {
 *   user: Promise<User>
 *   posts: Promise<Post[]>
 *   count: number
 * }
 * 
 * type Unwrapped = UnwrapPromises<State>
 * // { user: User; posts: Post[]; count: number }
 * ```
 */
export type UnwrapPromises<T> = {
  [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K]
}


