import type { DecoratorMetadata, GetterDecoratorOptions } from '../types'
import { DECORATOR_METADATA_KEY } from '../types/decorators'
import { fastHash } from '../utils/cache'
import 'reflect-metadata'

/**
 * Getter 装饰器
 * 
 * 用于标记类方法为计算属性（Getter）。
 * 计算属性会根据依赖的状态自动重新计算，支持缓存以提升性能。
 * 
 * **核心特性**:
 * - 自动依赖追踪：指定依赖项，只在依赖变化时重新计算
 * - 结果缓存：缓存计算结果，避免重复计算
 * - 性能优化：使用快速哈希算法检测依赖变化
 * - 类型安全：完整的 TypeScript 类型支持
 * 
 * @param options - 装饰器配置选项
 * @param options.cache - 是否缓存计算结果
 * @param options.deps - 依赖的状态键数组
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
 *   // 基本用法：计算属性
 *   @Getter()
 *   get displayName() {
 *     return `${this.firstName} ${this.lastName}`
 *   }
 *
 *   // 带依赖追踪：只在 firstName 或 lastName 变化时重新计算
 *   @Getter({ deps: ['firstName', 'lastName'] })
 *   get fullName() {
 *     return `${this.firstName} ${this.lastName}`
 *   }
 *
 *   // 带缓存：缓存计算结果，提升性能
 *   @Getter({ cache: true })
 *   get expensiveComputation() {
 *     // 复杂计算逻辑
 *     return this.users.reduce((sum, user) => sum + user.score, 0)
 *   }
 *   
 *   // 结合缓存和依赖：最佳性能
 *   @Getter({ cache: true, deps: ['users'] })
 *   get activeUsers() {
 *     return this.users.filter(user => user.active)
 *   }
 * }
 * ```
 */
export function Getter(options: GetterDecoratorOptions = {}): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    if (typeof propertyKey === 'symbol') {
      throw new TypeError('Getter decorator does not support symbol properties')
    }

    // 获取现有的元数据
    const existingMetadata: DecoratorMetadata[]
      = Reflect.getMetadata(DECORATOR_METADATA_KEY, target.constructor) || []

    // 添加新的元数据
    const newMetadata: DecoratorMetadata = {
      type: 'getter',
      key: propertyKey,
      options,
    }

    existingMetadata.push(newMetadata)
    Reflect.defineMetadata(
      DECORATOR_METADATA_KEY,
      existingMetadata,
      target.constructor,
    )

    // 保存原始 getter
    const originalGetter = descriptor.get

    if (typeof originalGetter !== 'function') {
      throw new TypeError(
        `Getter decorator can only be applied to getter methods`,
      )
    }

    // 创建缓存（如果需要）
    let cachedValue: any
    let isCached = false
    let lastDepsHash: string | undefined

    // 包装 getter
    descriptor.get = function (this: any) {
      // 检查依赖是否变化（优化版本 - 使用快速哈希）
      if (options.deps && options.deps.length > 0) {
        const currentDepsValues = options.deps.map((dep) => {
          if (this._store) {
            return this._store.$state[dep]
          }
          return (this as any)[dep]
        })

        // 使用快速哈希替代 JSON.stringify，性能提升显著
        const currentDepsHash = fastHash(currentDepsValues)
        if (isCached && lastDepsHash !== currentDepsHash) {
          isCached = false
        }

        lastDepsHash = currentDepsHash
      }

      // 如果启用缓存且有缓存值，返回缓存值
      if (options.cache && isCached) {
        return cachedValue
      }

      // 计算新值
      const result = originalGetter.call(this)

      // 缓存结果
      if (options.cache) {
        cachedValue = result
        isCached = true
      }

      return result
    }

    // 添加清除缓存的方法
    if (options.cache) {
      const clearCacheMethodName = `clear${propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1)
        }Cache`

      Object.defineProperty(target, clearCacheMethodName, {
        value(this: any) {
          isCached = false
          cachedValue = undefined
        },
        writable: false,
        enumerable: false,
        configurable: true,
      })
    }

    return descriptor
  }
}

/**
 * 缓存 Getter 装饰器
 * 
 * 自动缓存计算结果，提升性能。
 * 这是 `@Getter({ cache: true })` 的简化版本。
 * 
 * @param deps - 依赖的状态键数组（可选）
 * @returns 方法装饰器
 * 
 * @example
 * ```typescript
 * class ProductStore extends BaseStore {
 *   @State({ default: [] })
 *   products: Product[] = []
 *   
 *   // 缓存计算结果
 *   @CachedGetter(['products'])
 *   get totalPrice() {
 *     return this.products.reduce((sum, p) => sum + p.price, 0)
 *   }
 * }
 * ```
 */
export function CachedGetter(deps?: string[]): MethodDecorator {
  return Getter({
    cache: true,
    deps,
  })
}

/**
 * 依赖 Getter 装饰器
 * 
 * 指定计算属性的依赖项。
 * 只在依赖项变化时重新计算，性能更优。
 * 
 * @param deps - 依赖的状态键数组
 * @returns 方法装饰器
 * 
 * @example
 * ```typescript
 * class CartStore extends BaseStore {
 *   @State({ default: [] })
 *   items: CartItem[] = []
 *   
 *   @State({ default: 0 })
 *   discount: number = 0
 *   
 *   // 只在 items 或 discount 变化时重新计算
 *   @DependentGetter(['items', 'discount'])
 *   get finalPrice() {
 *     const subtotal = this.items.reduce((sum, item) => sum + item.price, 0)
 *     return subtotal * (1 - this.discount)
 *   }
 * }
 * ```
 */
export function DependentGetter(deps: string[]): MethodDecorator {
  return Getter({
    deps,
  })
}

/**
 * 记忆化 Getter 装饰器
 * 
 * 结合缓存和依赖检查，提供最佳性能。
 * 这是 `@Getter({ cache: true, deps })` 的简化版本。
 * 
 * @param deps - 依赖的状态键数组
 * @returns 方法装饰器
 * 
 * @example
 * ```typescript
 * class DataStore extends BaseStore {
 *   @State({ default: [] })
 *   items: Item[] = []
 *   
 *   // 记忆化：只在 items 变化时重新计算，并缓存结果
 *   @MemoizedGetter(['items'])
 *   get sortedItems() {
 *     // 排序是耗时操作，使用记忆化避免重复计算
 *     return [...this.items].sort((a, b) => a.name.localeCompare(b.name))
 *   }
 * }
 * ```
 */
export function MemoizedGetter(deps: string[]): MethodDecorator {
  return Getter({
    cache: true,
    deps,
  })
}
