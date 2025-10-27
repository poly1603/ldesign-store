# @ldesign/store 完整使用指南

## 📚 目录

1. [快速开始](#快速开始)
2. [核心功能](#核心功能)
3. [性能优化](#性能优化)
4. [高级功能](#高级功能)
5. [最佳实践](#最佳实践)
6. [API 参考](#api-参考)

---

## 快速开始

### 安装

```bash
pnpm add @ldesign/store pinia
```

### 基础配置

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

---

## 核心功能

### 1. 三种 Store 创建方式

#### 类式 Store（面向对象）

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

class UserStore extends BaseStore<
  { name: string; age: number },
  { setName: (name: string) => void },
  { displayName: string }
> {
  @State({ default: '' })
  name: string = ''
  
  @State({ default: 0 })
  age: number = 0
  
  @Action()
  setName(name: string) {
    this.name = name
  }
  
  @Getter()
  get displayName() {
    return `用户: ${this.name}`
  }
}

export const useUserStore = () => new UserStore('user', {})
```

**优点**: 强大的装饰器支持，适合复杂业务逻辑

---

#### 函数式 Store（简洁直观）

```typescript
import { createFunctionalStore } from '@ldesign/store'

export const useCounterStore = createFunctionalStore({
  id: 'counter',
  
  state: () => ({ 
    count: 0,
    lastUpdate: Date.now()
  }),
  
  actions: {
    increment() {
      this.count++
      this.lastUpdate = Date.now()
    },
    
    decrement() {
      this.count--
      this.lastUpdate = Date.now()
    }
  },
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  // 性能优化配置
  cache: { maxSize: 100, defaultTTL: 5000 },
  persist: { storage: localStorage }
})
```

**优点**: 简洁，适合简单场景

---

#### Composition API Store（现代化）

```typescript
import { createCompositionStore } from '@ldesign/store'

export const useTodoStore = createCompositionStore(
  { id: 'todo' },
  ({ state, computed, reactive }) => {
    const todos = state<Todo[]>([])
    const filter = state<'all' | 'active' | 'completed'>('all')
    
    const filteredTodos = computed(() => {
      if (filter.value === 'active') {
        return todos.value.filter(t => !t.completed)
      }
      if (filter.value === 'completed') {
        return todos.value.filter(t => t.completed)
      }
      return todos.value
    })
    
    const addTodo = (text: string) => {
      todos.value.push({
        id: Date.now(),
        text,
        completed: false
      })
    }
    
    return {
      todos,
      filter,
      filteredTodos,
      addTodo
    }
  }
)
```

**优点**: Vue 3 风格，灵活性高

---

## 性能优化

### 1. 使用缓存

#### 装饰器缓存

```typescript
class DataStore extends BaseStore {
  @State({ default: [] })
  items: Item[] = []
  
  // 缓存计算结果，避免重复计算
  @CachedGetter(['items'])
  get sortedItems() {
    console.log('执行排序...') // 只在 items 变化时执行
    return [...this.items].sort((a, b) => a.name.localeCompare(b.name))
  }
  
  // 缓存 API 调用结果
  @Action()
  @CachedAction(5000) // 缓存 5 秒
  async fetchData(params: any) {
    return await api.getData(params)
  }
}
```

#### 手动缓存

```typescript
const store = createFunctionalStore({
  id: 'data',
  state: () => ({ data: [] }),
  
  actions: {
    async fetchData(params: any) {
      const cacheKey = `fetchData:${JSON.stringify(params)}`
      
      // 检查缓存
      const cached = this.$getCache(cacheKey)
      if (cached) return cached
      
      // 获取数据并缓存
      const data = await api.getData(params)
      this.$setCache(cacheKey, data, 10000) // 缓存 10 秒
      
      return data
    }
  }
})
```

---

### 2. 防抖和节流

```typescript
class SearchStore extends BaseStore {
  @State({ default: '' })
  query: string = ''
  
  @State({ default: [] })
  results: any[] = []
  
  // 防抖：300ms 内多次调用只执行最后一次
  @Action()
  @DebouncedAction(300)
  async search(query: string) {
    this.query = query
    this.results = await api.search(query)
  }
  
  // 节流：最多每秒执行一次
  @Action()
  @ThrottledAction(1000)
  updatePosition(x: number, y: number) {
    this.position = { x, y }
  }
}
```

---

### 3. 状态持久化

```typescript
const useSettingsStore = createFunctionalStore({
  id: 'settings',
  
  state: () => ({
    theme: 'light',
    language: 'zh-CN',
    fontSize: 14
  }),
  
  persist: {
    storage: localStorage,
    paths: ['theme', 'language'], // 只持久化指定字段
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    }
  }
})
```

---

## 高级功能

### 1. Store 间通信（消息总线）

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
    
    // 订阅登录成功事件
    storeMessenger.on('user:logged-in', ({ user }) => {
      this.showNotification(`欢迎回来，${user.name}！`)
    })
  }
}

// 等待事件（异步）
const user = await storeMessenger.waitFor('user:logged-in', 5000)
```

---

### 2. 异步状态管理

```typescript
import { createAsyncState } from '@ldesign/store'

class UserStore extends BaseStore {
  // 创建异步状态
  fetchUserState = createAsyncState(
    async (userId: string) => {
      return await api.fetchUser(userId)
    },
    {
      retries: 3,           // 失败重试 3 次
      timeout: 5000,        // 5 秒超时
      retryDelay: 1000,     // 重试延迟 1 秒
      onSuccess: (user) => {
        console.log('加载成功:', user)
      },
      onError: (error) => {
        console.error('加载失败:', error)
      }
    }
  )
  
  async loadUser(userId: string) {
    await this.fetchUserState.execute(userId)
    
    if (this.fetchUserState.data.value) {
      this.currentUser = this.fetchUserState.data.value
    }
  }
}

// 在组件中使用
const { loading, error, data, execute, refresh, cancel } = store.fetchUserState

// 执行
await execute('user-123')

// 刷新
await refresh()

// 取消
cancel()
```

---

### 3. 状态快照和恢复

```typescript
import { SnapshotManager } from '@ldesign/store'

const snapshotManager = new SnapshotManager<UserState>()

// 创建快照
snapshotManager.createSnapshot(
  '登录前',
  userStore.$state,
  '用户登录前的初始状态',
  ['auth', 'initial']
)

// 执行操作...
userStore.login(credentials)

// 创建另一个快照
snapshotManager.createSnapshot('登录后', userStore.$state)

// 对比快照
const diff = snapshotManager.diffSnapshots('登录前', '登录后')
diff.forEach(({ path, type, oldValue, newValue }) => {
  console.log(`${path}: ${oldValue} -> ${newValue}`)
})

// 恢复快照
const state = snapshotManager.restoreSnapshot('登录前')
if (state) {
  userStore.$patch(state)
}

// 导出快照
const json = snapshotManager.exportSnapshot('重要状态')
localStorage.setItem('snapshot', json)
```

---

### 4. 时间旅行调试

```typescript
import { TimeTravelDebugger } from '@ldesign/store'

const debugger = new TimeTravelDebugger<UserState>({
  maxHistory: 100,
  recordDiff: true
})

// 记录每次状态变化
userStore.$onAction((context) => {
  context.after(() => {
    debugger.recordState(
      userStore.$state,
      context.name,
      context.args
    )
  })
})

// 后退到上一个状态
const previousState = debugger.undo()
if (previousState) {
  userStore.$patch(previousState)
}

// 前进到下一个状态
const nextState = debugger.redo()
if (nextState) {
  userStore.$patch(nextState)
}

// 跳转到特定动作
const state = debugger.jumpToAction('login', 1) // 第一次登录

// 重放历史
await debugger.replay((state, entry) => {
  userStore.$patch(state)
  console.log(`执行: ${entry.action}`, entry.args)
}, 500) // 每 500ms 执行一步
```

---

### 5. 批量操作优化

```typescript
import { BatchManager } from '@ldesign/store'

const batchManager = new BatchManager()

// 方式1：手动批处理
batchManager.startBatch('updateUsers', {
  autoExecute: true,
  autoExecuteDelay: 100
})

for (const user of users) {
  batchManager.addOperation('updateUsers', () => {
    store.users.push(user)
  })
}

await batchManager.executeBatch('updateUsers')

// 方式2：批量执行
await batchManager.batchExecute([
  () => store.user1 = newUser1,
  () => store.user2 = newUser2,
  () => store.user3 = newUser3,
])

// 方式3：自动批处理（空闲时执行）
await batchManager.autoBatch(() => {
  store.updateStatistics()
})
```

---

### 6. 插件系统

#### 使用内置插件

```typescript
import { globalPluginManager, loggerPlugin, performancePlugin } from '@ldesign/store'

// 注册插件
globalPluginManager.registerPlugin(loggerPlugin)
globalPluginManager.registerPlugin(performancePlugin)

// 安装插件到 Store
await globalPluginManager.installToStore(userStore, 'logger', {
  level: 'debug'
})

await globalPluginManager.installToStore(userStore, 'performance')
```

#### 创建自定义插件

```typescript
import { createPlugin } from '@ldesign/store'

const validationPlugin = createPlugin('validation', (context, options) => {
  // 监听 Action 执行
  context.onAction(({ name, args, onError }) => {
    // 执行前验证
    if (name === 'setAge' && args[0] < 0) {
      throw new Error('年龄不能为负数')
    }
  })
  
  // 监听状态变化
  context.onStateChange((state) => {
    // 验证状态
    if (state.email && !isValidEmail(state.email)) {
      console.warn('邮箱格式无效')
    }
  })
})

// 使用插件
globalPluginManager.registerPlugin(validationPlugin)
await globalPluginManager.installToStore(userStore, 'validation')
```

---

### 7. 性能监控面板

```typescript
import { PerformancePanel } from '@ldesign/store'

const panel = new PerformancePanel()

// 监控 Store
panel.monitorStore(userStore, {
  trackActions: true,
  trackMemory: true,
  trackCache: true
})

// 手动记录 Action
panel.recordAction('fetchUsers', 150)

// 生成性能报告
const report = panel.generateReport('user-store')
console.log(`性能评分: ${report.score}/100`)
console.log(`性能等级: ${report.grade}`)

// 检测性能瓶颈
const bottlenecks = panel.detectBottlenecks()
bottlenecks.forEach(bottleneck => {
  console.log(`${bottleneck.severity}: ${bottleneck.description}`)
  bottleneck.suggestions.forEach(s => console.log(`  - ${s}`))
})

// 获取最慢的 Action
const slowActions = panel.getSlowActions(5)
slowActions.forEach(action => {
  console.log(`${action.name}: 平均 ${action.averageTime.toFixed(2)}ms`)
})

// 导出性能数据
const data = panel.exportData()
localStorage.setItem('performance-data', data)
```

---

## 最佳实践

### 1. Store 设计原则

#### ✅ 好的设计

```typescript
// 单一职责：只管理用户相关状态
class UserStore extends BaseStore {
  @State() users: User[] = []
  @State() currentUser: User | null = null
  
  @Action() async fetchUsers() { /* ... */ }
  @Action() async updateUser(user: User) { /* ... */ }
}

// 单一职责：只管理设置相关状态
class SettingsStore extends BaseStore {
  @State() theme: 'light' | 'dark' = 'light'
  @State() language: string = 'zh-CN'
  
  @Action() toggleTheme() { /* ... */ }
}
```

#### ❌ 避免的设计

```typescript
// 职责过多：混合了用户、设置、通知等
class AppStore extends BaseStore {
  @State() users: User[] = []
  @State() settings: Settings = {}
  @State() notifications: Notification[] = []
  // ... 太多职责
}
```

---

### 2. 性能优化策略

#### 合理使用缓存

```typescript
class OptimizedStore extends BaseStore {
  // ✅ 好：缓存耗时计算
  @Getter({ cache: true, deps: ['items'] })
  get expensiveComputation() {
    return this.items.reduce((sum, item) => sum + item.value, 0)
  }
  
  // ❌ 避免：缓存简单计算（浪费内存）
  @Getter({ cache: true })
  get simpleValue() {
    return this.count + 1
  }
}
```

#### 防抖频繁操作

```typescript
class SearchStore extends BaseStore {
  // ✅ 好：搜索操作防抖
  @Action()
  @DebouncedAction(300)
  async search(query: string) {
    this.results = await api.search(query)
  }
  
  // ❌ 避免：所有操作都防抖
  @Action()
  @DebouncedAction(300)
  setTheme(theme: string) {
    this.theme = theme // 简单赋值不需要防抖
  }
}
```

#### 节流高频更新

```typescript
class PositionStore extends BaseStore {
  // ✅ 好：位置更新节流
  @Action()
  @ThrottledAction(100) // 最多每 100ms 更新一次
  updatePosition(x: number, y: number) {
    this.position = { x, y }
  }
}
```

---

### 3. 正确清理资源

```vue
<script setup lang="ts">
import { onUnmounted } from 'vue'

const userStore = new UserStore('user', {})

// 订阅状态变化
const unsubscribe = userStore.$subscribe((mutation, state) => {
  console.log('状态变化:', state)
})

// 组件卸载时清理
onUnmounted(() => {
  // 方式1：手动取消订阅
  unsubscribe()
  
  // 方式2：销毁整个 Store（推荐）
  userStore.$dispose()
})
</script>
```

---

### 4. 类型安全实践

```typescript
// 定义严格的接口
interface UserState {
  users: User[]
  loading: boolean
  error: string | null
}

interface UserActions {
  fetchUsers(): Promise<void>
  addUser(user: Omit<User, 'id'>): Promise<User>
  removeUser(id: string): Promise<void>
}

interface UserGetters {
  activeUsers: User[]
  userCount: number
  getUserById: (id: string) => User | undefined
}

// 使用严格类型约束
class UserStore extends BaseStore<UserState, UserActions, UserGetters> {
  // TypeScript 会确保实现符合接口定义
}
```

---

## API 参考

### Store 实例方法

| 方法 | 说明 |
|------|------|
| `$state` | 获取当前状态 |
| `$actions` | 获取所有动作 |
| `$getters` | 获取所有计算属性 |
| `$reset()` | 重置状态 |
| `$patch(state)` | 更新状态 |
| `$subscribe(callback)` | 订阅状态变化 |
| `$onAction(callback)` | 订阅 Action 执行 |
| `$dispose()` | 销毁 Store |
| `$persist()` | 持久化状态 |
| `$hydrate()` | 恢复持久化状态 |
| `$getCache(key)` | 获取缓存 |
| `$setCache(key, value, ttl)` | 设置缓存 |

### 装饰器

| 装饰器 | 说明 |
|--------|------|
| `@State(options)` | 定义状态 |
| `@Action(options)` | 定义动作 |
| `@Getter(options)` | 定义计算属性 |
| `@CachedGetter(deps)` | 缓存计算属性 |
| `@CachedAction(ttl)` | 缓存 Action 结果 |
| `@DebouncedAction(delay)` | 防抖 Action |
| `@ThrottledAction(interval)` | 节流 Action |
| `@Batch(id, options)` | 批处理 Action |

### 工具函数

| 函数 | 说明 |
|------|------|
| `createAsyncState(fn, options)` | 创建异步状态 |
| `createSnapshotManager(options)` | 创建快照管理器 |
| `createTimeTravelDebugger(options)` | 创建时间旅行调试器 |
| `createBatchManager()` | 创建批量操作管理器 |
| `createPluginManager()` | 创建插件管理器 |

---

## 常见问题

### Q: 如何选择 Store 创建方式？

**A**: 根据项目需求选择：
- **类式 Store**: 复杂业务逻辑，需要装饰器
- **函数式 Store**: 简单场景，快速开发
- **Composition Store**: Vue 3 风格，灵活性高

### Q: 缓存什么时候会失效？

**A**: 
- TTL 过期
- 依赖项变化（对于有 deps 的 Getter）
- 手动调用 `$clearCache()`
- LRU 策略淘汰

### Q: 如何避免内存泄漏？

**A**:
1. 组件卸载时调用 `store.$dispose()`
2. 使用非分离订阅（自动清理）
3. 定期清理不需要的缓存
4. 使用性能监控面板检测

### Q: 插件如何工作？

**A**: 插件通过监听 Store 的生命周期钩子来扩展功能。可以：
- 拦截 Action 执行
- 监听状态变化
- 添加自定义方法
- 修改 Store 行为

---

## 性能优化建议

### 1. 避免频繁的大对象序列化

```typescript
// ❌ 避免
@Getter()
get serializedData() {
  return JSON.stringify(this.largeObject) // 每次都序列化
}

// ✅ 推荐
@Getter({ cache: true, deps: ['largeObject'] })
get serializedData() {
  return JSON.stringify(this.largeObject) // 只在对象变化时序列化
}
```

### 2. 使用浅拷贝代替深拷贝

```typescript
// ❌ 避免（如果不需要深拷贝）
const newState = deepClone(oldState)

// ✅ 推荐
const newState = { ...oldState }
```

### 3. 批量更新

```typescript
// ❌ 避免：多次更新
store.$patch({ name: 'John' })
store.$patch({ age: 25 })
store.$patch({ email: 'john@example.com' })

// ✅ 推荐：批量更新
store.$patch({
  name: 'John',
  age: 25,
  email: 'john@example.com'
})
```

---

## 更多示例

查看 `examples` 目录获取更多实际示例：
- 基础用法
- 高级功能
- 性能优化
- TypeScript 集成
- 真实项目示例

---

**如有疑问，请查阅完整文档或提交 Issue。** 📖


