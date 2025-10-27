# @ldesign/store 最佳实践指南

## 📖 概述

本文档提供 `@ldesign/store` 的最佳实践和使用建议，帮助开发者充分利用 Store 的强大功能，编写高性能、可维护的代码。

---

## 🎯 选择合适的 Store 类型

### 1. BaseStore（类式 Store）

**适用场景**:
- 需要使用装饰器语法
- 偏好面向对象编程风格
- 需要类继承和多态
- 团队熟悉类式写法

**示例**:
```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

class UserStore extends BaseStore {
  @State({ default: '' })
  name: string = ''

  @State({ default: 0 })
  age: number = 0

  @Action({ cache: true })
  async fetchUser(id: string) {
    const user = await api.getUser(id)
    this.name = user.name
    this.age = user.age
  }

  @Getter({ cache: true, deps: ['name'] })
  get displayName() {
    return `User: ${this.name}`
  }
}

const userStore = new UserStore('user', {
  persist: true,
  cache: { maxSize: 100 }
})
```

### 2. FunctionalStore（函数式 Store）

**适用场景**:
- 偏好函数式编程风格
- 不需要装饰器
- 代码更简洁直观
- 快速原型开发

**示例**:
```typescript
import { createFunctionalStore } from '@ldesign/store'

const useUserStore = createFunctionalStore({
  id: 'user',
  state: () => ({
    name: '',
    age: 0
  }),
  actions: {
    async fetchUser(id: string) {
      const user = await api.getUser(id)
      this.name = user.name
      this.age = user.age
    }
  },
  getters: {
    displayName: (state) => `User: ${state.name}`
  },
  persist: true
})
```

### 3. CompositionStore（组合式 Store）

**适用场景**:
- 使用 Vue 3 Composition API
- 需要细粒度的响应式控制
- 需要在 setup 函数中使用
- 与 Vue 3 项目无缝集成

**示例**:
```typescript
import { createCompositionStore } from '@ldesign/store'

const useUserStore = createCompositionStore({
  id: 'user',
  setup(context) {
    const name = context.state('')
    const age = context.state(0)

    const displayName = context.computed(() => `User: ${name.value}`)

    async function fetchUser(id: string) {
      const user = await api.getUser(id)
      name.value = user.name
      age.value = user.age
    }

    return {
      name,
      age,
      displayName,
      fetchUser
    }
  },
  persist: true
})
```

---

## ⚡ 性能优化技巧

### 1. 使用缓存

**Action 缓存**:
```typescript
class DataStore extends BaseStore {
  @Action({ cache: true, cacheTime: 10 * 60 * 1000 })
  async fetchData(id: string) {
    // 相同参数的调用会返回缓存结果
    return await api.fetchData(id)
  }
}
```

**Getter 缓存**:
```typescript
class UserStore extends BaseStore {
  @Getter({ cache: true, deps: ['users'] })
  get activeUsers() {
    // 只在 users 变化时重新计算
    return this.users.filter(u => u.active)
  }
}
```

### 2. 使用防抖和节流

**防抖**（避免频繁调用）:
```typescript
@Action({ debounce: 300 })
async searchUsers(keyword: string) {
  // 300ms 内的多次调用只执行最后一次
  return await api.search(keyword)
}
```

**节流**（限制调用频率）:
```typescript
@Action({ throttle: 1000 })
trackScroll(position: number) {
  // 最多每秒执行一次
  this.scrollPosition = position
}
```

### 3. 批量操作

**使用批量管理器**:
```typescript
import { BatchManager } from '@ldesign/store'

const batchManager = new BatchManager()

// 批量更新多个状态
batchManager.startBatch('updateUsers')
batchManager.addOperation('updateUsers', () => {
  store.user1 = newUser1
})
batchManager.addOperation('updateUsers', () => {
  store.user2 = newUser2
})
await batchManager.executeBatch('updateUsers')
```

**使用 $patch 批量更新**:
```typescript
// ❌ 避免：多次单独更新
store.name = 'John'
store.age = 30
store.email = 'john@example.com'

// ✅ 推荐：批量更新
store.$patch({
  name: 'John',
  age: 30,
  email: 'john@example.com'
})
```

### 4. 异步状态管理

**使用 createAsyncState**:
```typescript
import { createAsyncState } from '@ldesign/store'

const asyncUsers = createAsyncState(
  async () => await api.fetchUsers(),
  {
    retries: 3,
    timeout: 5000,
    cache: true,
    cacheTime: 5 * 60 * 1000,
    onSuccess: (users) => {
      console.log('用户加载成功:', users)
    },
    onError: (error) => {
      console.error('加载失败:', error)
    }
  }
)

// 执行请求
await asyncUsers.execute()

// 访问状态
console.log(asyncUsers.loading.value)  // false
console.log(asyncUsers.data.value)     // 用户数据
console.log(asyncUsers.error.value)    // null
```

---

## 🔌 使用插件系统

### 内置插件

**日志插件**:
```typescript
import { globalPluginManager, loggerPlugin } from '@ldesign/store'

// 注册插件
globalPluginManager.registerPlugin(loggerPlugin)

// 安装到 Store
globalPluginManager.installToStore(userStore, 'logger', {
  level: 'debug',
  logActions: true,
  logMutations: true
})
```

**性能监控插件**:
```typescript
import { performancePlugin } from '@ldesign/store'

globalPluginManager.registerPlugin(performancePlugin)
globalPluginManager.installToStore(userStore, 'performance')
```

### 自定义插件

```typescript
import { createPlugin } from '@ldesign/store'

const validationPlugin = createPlugin('validation', (context, options) => {
  context.onAction(({ name, args, onError }) => {
    // 在 Action 执行前验证参数
    if (!validateArgs(args)) {
      onError(new Error('Invalid arguments'))
    }
  })

  context.onStateChange((state) => {
    // 验证状态
    if (!validateState(state)) {
      console.warn('Invalid state detected')
    }
  })
})

globalPluginManager.registerPlugin(validationPlugin)
globalPluginManager.installToStore(userStore, 'validation')
```

---

## 🔍 调试技巧

### 1. 时间旅行调试

```typescript
import { createTimeTravelDebugger } from '@ldesign/store'

const debugger = createTimeTravelDebugger<UserState>()

// 监听状态变化
store.$subscribe((mutation, state) => {
  debugger.recordState(state, mutation.type, mutation.payload)
})

// 后退到上一个状态
const previousState = debugger.undo()
if (previousState) {
  store.$patch(previousState)
}

// 前进到下一个状态
const nextState = debugger.redo()

// 重放历史
await debugger.replay((state, entry) => {
  store.$patch(state)
  console.log(`执行: ${entry.action}`)
}, 500) // 每 500ms 重放一个状态
```

### 2. 性能监控

```typescript
import { globalPerformancePanel } from '@ldesign/store'

// 开始监控
const cleanup = globalPerformancePanel.monitorStore(userStore, {
  trackActions: true,
  trackMemory: true,
  trackCache: true
})

// 生成报告
const report = globalPerformancePanel.generateReport('user')
console.log(`性能评分: ${report.score}/100`)
console.log(`性能等级: ${report.grade}`)

// 检测瓶颈
const bottlenecks = globalPerformancePanel.detectBottlenecks()
bottlenecks.forEach(bottleneck => {
  console.log(`${bottleneck.severity}: ${bottleneck.description}`)
  bottleneck.suggestions.forEach(s => console.log(`  - ${s}`))
})

// 停止监控
cleanup()
```

### 3. 状态快照

```typescript
import { createSnapshotManager } from '@ldesign/store'

const snapshotManager = createSnapshotManager<UserState>()

// 创建快照
snapshotManager.createSnapshot('登录前', store.$state, {
  tags: ['auth', 'initial']
})

// 执行操作...
await store.login(credentials)

// 创建另一个快照
snapshotManager.createSnapshot('登录后', store.$state, {
  tags: ['auth', 'logged-in']
})

// 对比快照
const diff = snapshotManager.diffSnapshots('登录前', '登录后')
console.log('状态变化:', diff)

// 恢复快照
const savedState = snapshotManager.restoreSnapshot('登录前')
if (savedState) {
  store.$patch(savedState)
}
```

---

## 💬 Store 间通信

### 使用消息总线

```typescript
import { storeMessenger } from '@ldesign/store'

// 在 UserStore 中发布事件
class UserStore extends BaseStore {
  @Action()
  async login(credentials: Credentials) {
    const user = await api.login(credentials)
    this.currentUser = user

    // 发布登录成功事件
    storeMessenger.emit('user:logged-in', { user })
  }
}

// 在 NotificationStore 中订阅事件
class NotificationStore extends BaseStore {
  constructor() {
    super('notification', {})

    // 订阅用户登录事件
    storeMessenger.on('user:logged-in', ({ user }) => {
      this.showNotification(`欢迎回来, ${user.name}!`)
    })
  }
}

// 等待事件（异步）
const userData = await storeMessenger.waitFor('user:logged-in', 5000)

// 一次性订阅
storeMessenger.once('user:logged-out', () => {
  console.log('用户已登出')
})
```

---

## 🔒 类型安全

### 1. 使用类型推断

```typescript
import { InferStoreState, InferStoreActions } from '@ldesign/store'

const useUserStore = createFunctionalStore({
  id: 'user',
  state: () => ({ name: '', age: 0 }),
  actions: {
    setName(name: string) {
      this.name = name
    }
  }
})

// 推断状态类型
type UserState = InferStoreState<typeof useUserStore>
// { name: string; age: number }

// 推断 Actions 类型
type UserActions = InferStoreActions<typeof useUserStore>
// { setName: (name: string) => void }
```

### 2. 严格的类型定义

```typescript
import { StrictStateDefinition, StrictActionDefinition } from '@ldesign/store'

// 定义严格的状态类型
type UserState = StrictStateDefinition<{
  name: string
  age: number
  email: string
}>

// 定义严格的 Action 类型
type UserActions = StrictActionDefinition<{
  setName: (name: string) => void
  setAge: (age: number) => void
  updateProfile: (profile: Partial<UserState>) => void
}>
```

---

## 🎨 命名规范

### Store 命名

```typescript
// ✅ 推荐：使用 PascalCase，以 Store 结尾
class UserStore extends BaseStore {}
class ProductStore extends BaseStore {}
class ShoppingCartStore extends BaseStore {}

// ✅ 推荐：函数式 Store 使用 use 前缀
const useUserStore = createFunctionalStore({})
const useProductStore = createFunctionalStore({})
```

### 状态字段命名

```typescript
// ✅ 推荐：使用 camelCase
@State()
userName: string

@State()
isLoading: boolean

@State()
productList: Product[]

// ❌ 避免：使用下划线或 PascalCase
@State()
user_name: string  // ❌

@State()
UserName: string  // ❌
```

### Action 命名

```typescript
// ✅ 推荐：使用动词开头
@Action()
fetchUsers() {}

@Action()
createProduct() {}

@Action()
updateProfile() {}

@Action()
deleteItem() {}

// 异步 Action 可以使用 async 前缀
@Action()
asyncLoadData() {}
```

### Getter 命名

```typescript
// ✅ 推荐：使用描述性名称
@Getter()
get activeUsers() {}

@Getter()
get totalPrice() {}

@Getter()
get isAuthenticated() {}

// 布尔值使用 is/has/can 前缀
@Getter()
get hasItems() {}

@Getter()
get canCheckout() {}
```

---

## 🛡️ 错误处理

### Action 错误处理

```typescript
class UserStore extends BaseStore {
  @State({ default: null })
  error: Error | null = null

  @State({ default: false })
  isLoading: boolean = false

  @Action()
  async fetchUser(id: string) {
    this.isLoading = true
    this.error = null

    try {
      const user = await api.getUser(id)
      this.currentUser = user
    } catch (error) {
      this.error = error as Error
      console.error('Failed to fetch user:', error)
      throw error // 重新抛出，让调用者处理
    } finally {
      this.isLoading = false
    }
  }
}
```

### 使用异步状态助手

```typescript
const asyncUsers = createAsyncState(
  async () => await api.fetchUsers(),
  {
    onError: (error) => {
      // 统一错误处理
      notificationStore.showError(error.message)
    },
    retries: 3, // 自动重试 3 次
    retryDelay: 1000 // 重试延迟 1 秒
  }
)
```

---

## 🧪 测试建议

### 单元测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

describe('UserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should update user name', () => {
    const store = useUserStore()
    store.setName('John')
    expect(store.$state.name).toBe('John')
  })

  it('should fetch user data', async () => {
    const store = useUserStore()
    await store.fetchUser('123')
    expect(store.$state.name).toBeTruthy()
  })

  it('should handle errors', async () => {
    const store = useUserStore()
    await expect(store.fetchUser('invalid')).rejects.toThrow()
  })
})
```

---

## 📊 性能监控

### 定期检查性能

```typescript
// 开发环境启用性能监控
if (process.env.NODE_ENV === 'development') {
  const { globalPerformancePanel } = await import('@ldesign/store')

  globalPerformancePanel.monitorStore(userStore)
  globalPerformancePanel.monitorStore(productStore)

  // 每分钟检查一次性能
  setInterval(() => {
    const bottlenecks = globalPerformancePanel.detectBottlenecks()
    if (bottlenecks.length > 0) {
      console.warn('Performance bottlenecks detected:', bottlenecks)
    }
  }, 60000)
}
```

---

## ✅ 总结

1. **选择合适的 Store 类型**：根据项目需求选择类式、函数式或组合式 Store
2. **充分利用缓存**：使用 Action 和 Getter 缓存减少重复计算
3. **使用防抖节流**：优化高频操作的性能
4. **批量更新状态**：使用 $patch 减少响应式更新
5. **使用插件系统**：扩展 Store 功能，保持代码整洁
6. **善用调试工具**：时间旅行、性能监控、状态快照
7. **Store 间通信**：使用消息总线解耦 Store 依赖
8. **保持类型安全**：充分利用 TypeScript 类型系统
9. **遵循命名规范**：提高代码可读性和可维护性
10. **完善错误处理**：使用 try-catch 和异步状态助手

---

## 📚 延伸阅读

- [API 文档](./docs/api/index.md)
- [完整示例](./examples/README.md)
- [性能优化指南](./PERFORMANCE_IMPROVEMENTS.md)
- [迁移指南](./docs/guide/migration.md)

---

**Happy Coding! 🎉**

