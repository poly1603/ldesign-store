/**
 * 装饰器相关类型定义
 * @module types/decorators
 */

/**
 * 装饰器元数据类型
 */
export enum DecoratorType {
  STATE = 'state',
  ACTION = 'action',
  GETTER = 'getter'
}

/**
 * 装饰器元数据
 */
export interface DecoratorMetadata {
  /** 装饰器类型 */
  type: DecoratorType
  /** 属性键名 */
  propertyKey: string
  /** 装饰器选项 */
  options?: Record<string, any>
}

/**
 * State 装饰器选项
 */
export interface StateDecoratorOptions {
  /** 默认值 */
  default?: any
  /** 是否响应式 */
  reactive?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 验证函数 */
  validator?: (value: any) => boolean
}

/**
 * Action 装饰器选项
 */
export interface ActionDecoratorOptions {
  /** 是否启用缓存 */
  cache?: boolean
  /** 缓存TTL（毫秒） */
  cacheTTL?: number
  /** 是否防抖 */
  debounce?: number
  /** 是否节流 */
  throttle?: number
  /** 错误处理 */
  onError?: (error: Error) => void
}

/**
 * Getter 装饰器选项
 */
export interface GetterDecoratorOptions {
  /** 是否启用缓存 */
  cache?: boolean
  /** 依赖的状态键 */
  deps?: string[]
}

/**
 * 元数据注册表键
 */
export const DECORATOR_METADATA_KEY = Symbol('decorator:metadata')


