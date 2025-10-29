# API 对比 - 所有框架统一接口

## 🎯 统一 API 设计

所有 14 个框架适配器都提供一致的功能和选项，只是API调用方式略有不同以适应各框架特色。

## 📦 创建 Store API 对比

### 主流框架

#### Vue 3
```typescript
import { createVueStore } from '@ldesign/store-vue'

const useUserStore = createVueStore({
  id: 'user',                          // Store ID
  state: () => ({                      // 状态函数
    name: '',
    age: 0
  }),
  actions: {                           // Actions 对象
    setName(name: string) {
      this.name = name
    }
  },
  getters: {                           // Getters 对象
    displayName: (state) => `User: ${state.name}`
  },
  persist: true,                       // 自动持久化
  cache: { maxSize: 100 },             // LRU 缓存
  enablePerformanceMonitor: true       // 性能监控
})

// 使用
const store = useUserStore()
store.setName('张三')
console.log(store.name)
console.log(store.displayName)
```

#### React 18
```typescript
import { createReactStore } from '@ldesign/store-react'

const useUserStore = createReactStore({
  name: 'user',                        // Store 名称
  initialState: {                      // 初始状态对象
    name: '',
    age: 0
  },
  actions: (set, get) => ({            // Actions 函数
    setName: (name: string) => set({ name }),
    getDisplayName: () => `User: ${get().name}`
  }),
  persist: true,                       // 自动持久化
  cache: { maxSize: 100 },             // LRU 缓存
  enablePerformanceMonitor: true       // 性能监控
})

// 使用
const { name, setName } = useUserStore()
setName('张三')
```

#### Solid
```typescript
import { createSolidStore } from '@ldesign/store-solid'

const store = createSolidStore({
  name: 'user',                        // Store 名称
  initialState: {                      // 初始状态对象
    name: '',
    age: 0
  },
  actions: (setState, getState) => ({  // Actions 函数
    setName: (name: string) => setState('name', name)
  }),
  persist: true,                       // 自动持久化
  cache: { maxSize: 100 },             // LRU 缓存
  enablePerformanceMonitor: true       // 性能监控
})

// 使用
console.log(store.state.name)
store.actions.setName('张三')
```

#### Svelte
```typescript
import { createSvelteStore } from '@ldesign/store-svelte'

const userStore = createSvelteStore({
  name: 'user',                        // Store 名称
  initialState: {                      // 初始状态对象
    name: '',
    age: 0
  },
  actions: (update, getState) => ({    // Actions 函数
    setName: (name: string) => update(s => ({ ...s, name }))
  }),
  persist: true,                       // 自动持久化
  cache: { maxSize: 100 },             // LRU 缓存
  enablePerformanceMonitor: true       // 性能监控
})

// 使用（Svelte 特色 $ 语法）
// <h1>{$userStore.name}</h1>
// <button on:click={() => userStore.actions.setName('张三')}>
```

#### Angular
```typescript
import { Injectable } from '@angular/core'
import { createAngularStore } from '@ldesign/store-angular'

@Injectable({ providedIn: 'root' })
export class UserStore {
  private store = createAngularStore({
    name: 'user',                      // Store 名称
    initialState: {                    // 初始状态对象
      name: '',
      age: 0
    },
    actions: (setState) => ({          // Actions 函数
      setName: (name: string) => setState({ name })
    }),
    persist: true,                     // 自动持久化
    cache: { maxSize: 100 }            // LRU 缓存
  })
  
  state = this.store.state
  actions = this.store.actions
}

// 使用（Angular 模板）
// <h1>{{ store.state().name }}</h1>
```

## 📊 选项对比

| 选项 | Vue | React | Solid | Svelte | Angular | 其他 | 说明 |
|---|---|---|---|---|---|---|---|
| **ID/Name** | id | name | name | name | name | name | Store 标识 |
| **State** | state: () => {} | initialState: {} | initialState: {} | initialState: {} | initialState: {} | 同左 | 状态定义 |
| **Actions** | actions: {} | actions: (set,get) => {} | actions: (set,get) => {} | actions: (update,get) => {} | actions: (set,get) => {} | 同左 | 动作定义 |
| **Getters** | getters: {} | 在 actions 中 | 在 actions 中 | derived stores | 在 actions 中 | - | 计算属性 |
| **Persist** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 持久化 |
| **Cache** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | LRU 缓存 |
| **Performance** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 性能监控 |

## 🔧 增强功能 API 对比

所有框架都提供相同的增强功能：

### 持久化

```typescript
// 所有框架统一选项
persist: true

// 或自定义配置
persist: {
  key: 'my-store',
  storage: sessionStorage,
  paths: ['user', 'settings'],
  serializer: customSerializer
}
```

### 缓存

```typescript
// 所有框架统一选项
cache: {
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000,
  enableStats: true,
  cleanupInterval: 60000
}

// 使用缓存
store.$cache.get(key)
store.$cache.set(key, value, ttl)
store.$cache.getStats()
```

### 性能监控

```typescript
// 所有框架统一选项
enablePerformanceMonitor: true

// 使用监控
store.$performanceMonitor.measure('task', () => {
  // 执行任务
})

const metrics = store.$performanceMonitor.getMetrics('task')
console.log(metrics.avgTime)
```

### 订阅管理

```typescript
// 所有框架统一 API
const unsubscribe = store.$subscriptionManager.subscribe('update', (data) => {
  console.log('Updated:', data)
}, 10) // 优先级 10

store.$subscriptionManager.notify('update', newData)
```

### 手动持久化

```typescript
// 所有框架统一 API
store.$persist()         // 保存到存储
store.$hydrate()         // 从存储恢复
store.$clearPersisted()  // 清除持久化数据
```

## 🎨 框架特色 API

虽然核心功能统一，但各框架保留了自己的特色：

### Vue - Pinia API

```typescript
const store = useUserStore()

store.$patch({ name: '张三' })       // Pinia $patch
store.$reset()                       // Pinia $reset
store.$subscribe((mutation, state) => {}) // Pinia $subscribe
```

### React - Zustand API

```typescript
// 选择器优化
const name = useUserStore((state) => state.name)

// 浅层比较
const { name, age } = useUserStore(
  state => ({ name: state.name, age: state.age }),
  shallow
)
```

### Solid - 细粒度更新

```typescript
// 细粒度状态访问
const name = () => store.state.name

// 嵌套更新
setState('profile', 'address', 'city', 'Beijing')

// 数组更新
setState('items', item => item.id === 1, 'done', true)
```

### Svelte - $ 自动订阅

```svelte
<script>
  import { userStore } from './stores'
</script>

<!-- $ 自动订阅 -->
<h1>{$userStore.name}</h1>

<!-- 派生 store -->
<script>
  import { derived } from 'svelte/store'
  const displayName = derived(userStore, $store => `User: ${$store.name}`)
</script>
<p>{$displayName}</p>
```

### Angular - Signals

```typescript
// Signal API
console.log(store.state().name)

// Computed signals
const displayName = computed(() => `User: ${store.state().name}`)

// Effect
effect(() => {
  console.log('Name changed:', store.state().name)
})
```

## 📚 完整 API 参考

### Store 选项（通用）

```typescript
interface StoreOptions {
  // 基础配置
  id/name: string                  // Store 标识
  state/initialState: State        // 状态定义
  actions?: Actions                // 动作定义
  getters?: Getters                // 计算属性（可选）
  
  // 增强功能
  persist?: boolean | PersistOptions  // 持久化
  cache?: CacheOptions                // 缓存
  enablePerformanceMonitor?: boolean  // 性能监控
}
```

### 增强 API（所有框架）

```typescript
interface EnhancedStore {
  // 核心功能（由适配器提供）
  state: State
  actions: Actions
  
  // 增强功能（所有框架统一）
  $cache: LRUCache
  $performanceMonitor?: PerformanceMonitor
  $subscriptionManager: SubscriptionManager
  $persist(): void
  $hydrate(): void
  $clearPersisted(): void
}
```

### 持久化选项

```typescript
interface PersistOptions {
  key?: string                     // 存储键名
  storage?: StorageAdapter         // 存储适配器
  paths?: string[]                 // 要持久化的路径
  serializer?: Serializer          // 序列化器
  beforeRestore?: (ctx) => void    // 恢复前钩子
  afterRestore?: (ctx) => void     // 恢复后钩子
  debounce?: number                // 防抖延迟
}
```

### 缓存选项

```typescript
interface CacheOptions {
  maxSize?: number                 // 最大缓存数（默认 100）
  defaultTTL?: number              // 默认 TTL（默认 5 分钟）
  strategy?: CacheStrategy         // 缓存策略（LRU/LFU/FIFO）
  enableStats?: boolean            // 启用统计（默认 false）
  cleanupInterval?: number         // 清理间隔（默认 1 分钟）
}
```

## 🎯 使用场景示例

### 场景 1: 用户认证

所有框架都使用相同的配置：

```typescript
const authStore = createStore({
  // 名称/ID
  [id/name]: 'auth',
  
  // 状态
  [state/initialState]: {
    user: null,
    token: null,
    isAuthenticated: false
  },
  
  // Actions
  actions: (...) => ({
    login: async (username, password) => {
      const { user, token } = await api.login(username, password)
      // 更新状态
    },
    logout: () => {
      // 清空状态
      // 清除持久化
    }
  }),
  
  // 增强功能
  persist: {
    paths: ['user', 'token', 'isAuthenticated']
  }
})
```

### 场景 2: API 缓存

```typescript
const apiStore = createStore({
  [id/name]: 'api',
  [state/initialState]: { data: null },
  
  actions: (...) => ({
    async fetchData(params) {
      const cacheKey = `data:${JSON.stringify(params)}`
      
      // 检查缓存
      const cached = store.$cache.get(cacheKey)
      if (cached) return cached
      
      // 获取数据
      const data = await api.getData(params)
      
      // 缓存结果
      store.$cache.set(cacheKey, data, 5 * 60 * 1000)
      
      return data
    }
  }),
  
  cache: {
    maxSize: 100,
    enableStats: true
  },
  enablePerformanceMonitor: true
})
```

## 📊 功能支持矩阵

| 功能 | Vue | React | Solid | Svelte | Angular | Alpine | Preact | Qwik | Astro | Lit | Next | Nuxt | Remix | SK |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **状态管理** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **自动持久化** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **LRU 缓存** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **性能监控** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **订阅系统** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **装饰器** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **TypeScript** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **DevTools** | ✅ | ✅ | - | - | - | - | - | - | - | - | ✅ | ✅ | ✅ | - |
| **SSR** | - | - | - | - | - | - | - | ✅ | ✅ | - | ✅ | ✅ | ✅ | ✅ |

*SK = SvelteKit*

## 🔧 高级功能对比

### 装饰器支持

所有框架都可以使用核心包的装饰器：

```typescript
import { State, Action, Getter } from '@ldesign/store-core'

class UserStore {
  @State({ default: '' })
  name: string = ''

  @State({ default: 0 })
  age: number = 0

  @Action({ cache: true, cacheTTL: 5000 })
  async fetchUser(id: string) {
    const data = await api.getUser(id)
    this.name = data.name
    this.age = data.age
  }

  @Getter({ cache: true })
  get displayName() {
    return `User: ${this.name}`
  }
}
```

### 批量操作

```typescript
// Vue
store.$patch({ name: '张三', age: 30 })

// React
setState(state => ({ ...state, name: '张三', age: 30 }))

// Solid
setState({ name: '张三', age: 30 })

// Svelte
userStore.update(s => ({ ...s, name: '张三', age: 30 }))

// Angular
setState({ name: '张三', age: 30 })
```

## 🎓 API 设计原则

### 1. 一致性优先
- 所有框架使用相同的选项名称
- 所有框架提供相同的增强功能
- 所有框架使用相同的类型定义

### 2. 框架特色保留
- Vue: 保留 Pinia API（$patch, $reset）
- React: 保留 Hooks + 选择器
- Solid: 保留细粒度更新
- Svelte: 保留 $ 语法
- Angular: 保留 Signals API

### 3. 渐进增强
- 基础功能：状态管理
- 增强功能：缓存、持久化（可选）
- 高级功能：性能监控、订阅系统（可选）

## 📝 迁移指南

### 从纯框架库迁移到 @ldesign/store

**Vue (Pinia → @ldesign/store-vue)**:
```typescript
// 之前
import { defineStore } from 'pinia'
const useUserStore = defineStore('user', {
  state: () => ({ name: '' })
})

// 之后
import { createVueStore } from '@ldesign/store-vue'
const useUserStore = createVueStore({
  id: 'user',
  state: () => ({ name: '' }),
  persist: true, // + 持久化
  cache: { maxSize: 100 } // + 缓存
})
```

**React (Zustand → @ldesign/store-react)**:
```typescript
// 之前
import { create } from 'zustand'
const useStore = create((set) => ({
  name: '',
  setName: (name) => set({ name })
}))

// 之后
import { createReactStore } from '@ldesign/store-react'
const useStore = createReactStore({
  name: 'user',
  initialState: { name: '' },
  actions: (set) => ({
    setName: (name) => set({ name })
  }),
  persist: true // + 持久化
})
```

## 🚀 推荐用法

### 选择框架适配器的建议

| 项目类型 | 推荐包 | 原因 |
|---|---|---|
| Vue 3 SPA | @ldesign/store-vue | Pinia 官方推荐 |
| React 18 SPA | @ldesign/store-react | Zustand 轻量高效 |
| Solid App | @ldesign/store-solid | 细粒度响应式 |
| Svelte App | @ldesign/store-svelte | $ 语法简洁 |
| Angular App | @ldesign/store-angular | Signals 原生支持 |
| Next.js | @ldesign/store-nextjs | SSR 支持 |
| Nuxt.js | @ldesign/store-nuxtjs | SSR 支持 |
| 轻量页面 | @ldesign/store-alpine | 极简 |
| Web Components | @ldesign/store-lit | 标准化 |
| 多框架项目 | @ldesign/store-astro | 兼容性好 |

---

**所有框架，统一体验！** 🎊



