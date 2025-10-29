# 快速上手指南

## 🎯 项目状态

当前已完成 **5 个包**，可立即使用：

1. ✅ **@ldesign/store-core** - 框架无关核心包
2. ✅ **@ldesign/store-vue** - Vue 3 适配器 (基于 Pinia)
3. ✅ **@ldesign/store-react** - React 18 适配器 (基于 Zustand)
4. ✅ **@ldesign/store-solid** - Solid 适配器 (基于 @solidjs/store) ✨ 新增
5. ✅ **@ldesign/store-svelte** - Svelte 适配器 (基于 svelte/store) ✨ 新增

## 📦 安装和使用

### 选项 1: Vue 3 项目

```bash
cd packages/store/packages/vue
pnpm install
pnpm build
```

使用示例：

```typescript
import { createVueStore } from '@ldesign/store-vue'

const useUserStore = createVueStore({
  id: 'user',
  state: () => ({
    name: 'Guest',
    age: 0
  }),
  actions: {
    setName(name: string) {
      this.name = name
    }
  },
  persist: true, // 自动持久化到 localStorage
  cache: {
    maxSize: 100,
    defaultTTL: 5000
  }
})

// 在组件中
const store = useUserStore()
store.setName('张三')
console.log(store.name) // '张三'
```

### 选项 2: React 18 项目

```bash
cd packages/store/packages/react
pnpm install
pnpm build
```

使用示例：

```typescript
import { createReactStore } from '@ldesign/store-react'

const useUserStore = createReactStore({
  name: 'user',
  initialState: {
    name: 'Guest',
    age: 0
  },
  actions: (set, get) => ({
    setName: (name: string) => set({ name }),
    incrementAge: () => set({ age: get().age + 1 })
  }),
  persist: true // 自动持久化
})

// 在组件中
function UserProfile() {
  const { name, age, setName } = useUserStore()
  
  return (
    <div>
      <h1>{name}</h1>
      <button onClick={() => setName('张三')}>
        Change Name
      </button>
    </div>
  )
}
```

### 选项 3: Solid 项目 ✨ 新增

```bash
cd packages/store/packages/solid
pnpm install
pnpm build
```

使用示例：

```typescript
import { createSolidStore } from '@ldesign/store-solid'

const store = createSolidStore({
  name: 'user',
  initialState: {
    name: 'Guest',
    age: 0
  },
  actions: (setState, getState) => ({
    setName: (name: string) => setState('name', name),
    incrementAge: () => setState('age', getState().age + 1)
  }),
  persist: true // 自动持久化
})

// 在组件中
function UserProfile() {
  return (
    <div>
      <h1>{store.state.name}</h1>
      <button onClick={() => store.actions.setName('张三')}>
        Change Name
      </button>
    </div>
  )
}
```

### 选项 4: Svelte 项目 ✨ 新增

```bash
cd packages/store/packages/svelte
pnpm install
pnpm build
```

使用示例：

```typescript
import { createSvelteStore } from '@ldesign/store-svelte'

const userStore = createSvelteStore({
  name: 'user',
  initialState: {
    name: 'Guest',
    age: 0
  },
  actions: (update, getState) => ({
    setName: (name: string) => update(s => ({ ...s, name })),
    incrementAge: () => update(s => ({ ...s, age: s.age + 1 }))
  }),
  persist: true // 自动持久化
})
```

在 Svelte 组件中：
```svelte
<script>
  import { userStore } from './stores'
</script>

<!-- 使用 $ 自动订阅语法 -->
<h1>{$userStore.name}</h1>
<button on:click={() => userStore.actions.setName('张三')}>
  Change Name
</button>
```

### 选项 5: 仅使用核心功能

```bash
cd packages/store/packages/core
pnpm install
pnpm build
```

使用示例：

```typescript
import { 
  LRUCache, 
  PerformanceMonitor,
  SubscriptionManager,
  debounce,
  throttle
} from '@ldesign/store-core'

// LRU 缓存
const cache = new LRUCache({ maxSize: 100 })
cache.set('key', 'value')
const value = cache.get('key')

// 性能监控
const monitor = new PerformanceMonitor()
monitor.measure('task', () => {
  // 执行任务
})
console.log(monitor.getMetrics('task'))

// 防抖/节流
const debouncedFn = debounce(() => console.log('Called'), 300)
const throttledFn = throttle(() => console.log('Called'), 1000)
```

## 🔧 开发指南

### 构建所有包

```bash
cd packages/store

# 安装核心包依赖
cd packages/core && pnpm install && cd ../..

# 安装 Vue 适配器依赖
cd packages/vue && pnpm install && cd ../..

# 安装 React 适配器依赖
cd packages/react && pnpm install && cd ../..

# 安装 Solid 适配器依赖
cd packages/solid && pnpm install && cd ../..

# 安装 Svelte 适配器依赖
cd packages/svelte && pnpm install && cd ../..

# 构建所有包
cd packages/core && pnpm build && cd ../..
cd packages/vue && pnpm build && cd ../..
cd packages/react && pnpm build && cd ../..
cd packages/solid && pnpm build && cd ../..
cd packages/svelte && pnpm build && cd ../..
```

### 运行测试

```bash
# 核心包测试
cd packages/core
pnpm test

# Vue 适配器测试
cd packages/vue
pnpm test

# React 适配器测试
cd packages/react
pnpm test

# Solid 适配器测试
cd packages/solid
pnpm test

# Svelte 适配器测试
cd packages/svelte
pnpm test
```

## 📚 主要特性

### 1. LRU 缓存（O(1) 性能）

```typescript
const cache = new LRUCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 分钟
  enableStats: true
})

cache.set('user:1', { id: 1, name: '张三' })
const user = cache.get('user:1')

// 查看统计
const stats = cache.getStats()
console.log(`命中率: ${(stats.hitRate * 100).toFixed(2)}%`)
```

### 2. 自动持久化

```typescript
// Vue
const useStore = createVueStore({
  id: 'settings',
  state: () => ({ theme: 'light' }),
  persist: true // 自动保存到 localStorage
})

// React
const useStore = createReactStore({
  name: 'settings',
  initialState: { theme: 'light' },
  persist: true
})
```

### 3. 性能监控

```typescript
const monitor = new PerformanceMonitor()

const result = monitor.measure('fetchData', async () => {
  const response = await fetch('/api/data')
  return response.json()
})

const metrics = monitor.getMetrics('fetchData')
console.log(`平均耗时: ${metrics.avgTime.toFixed(2)}ms`)
```

### 4. 装饰器支持

```typescript
import { State, Action, Getter } from '@ldesign/store-core'

class UserStore {
  @State({ default: '' })
  name: string = ''

  @Action()
  setName(name: string) {
    this.name = name
  }

  @Getter({ cache: true })
  get displayName() {
    return `User: ${this.name}`
  }
}
```

## 🚀 下一步

1. **查看文档**
   - [核心包 README](./packages/core/README.md)
   - [Vue 适配器 README](./packages/vue/README.md)
   - [React 适配器 README](./packages/react/README.md)
   - [Solid 适配器 README](./packages/solid/README.md) ✨ 新增
   - [Svelte 适配器 README](./packages/svelte/README.md) ✨ 新增
   - [最终进度报告](./FINAL_PROGRESS_REPORT.md)
   - [进度报告](./REFACTORING_PROGRESS.md)
   - [实施总结](./IMPLEMENTATION_SUMMARY.md)

2. **探索代码**
   - 核心包源码: `packages/core/src/`
   - Vue 适配器源码: `packages/vue/src/`
   - React 适配器源码: `packages/react/src/`
   - Solid 适配器源码: `packages/solid/src/` ✨
   - Svelte 适配器源码: `packages/svelte/src/` ✨

3. **贡献代码**
   - Angular 适配器（待实现）
   - Alpine.js 适配器（待实现）
   - 其他框架适配器
   - 单元测试编写
   - 文档完善

## 💡 示例场景

### 场景 1: 用户认证 Store (Vue)

```typescript
const useAuthStore = createVueStore({
  id: 'auth',
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),
  actions: {
    async login(username: string, password: string) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      this.user = data.user
      this.token = data.token
      this.isAuthenticated = true
    },
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.$clearPersisted()
    }
  },
  persist: {
    paths: ['user', 'token', 'isAuthenticated']
  }
})
```

### 场景 2: API 缓存 Store (React)

```typescript
const useApiStore = createReactStore({
  name: 'api',
  initialState: {
    data: null as any
  },
  actions: (set, get) => ({
    async fetchData(params: any) {
      const cacheKey = `data:${JSON.stringify(params)}`
      const store = get()
      
      // 检查缓存
      const cached = store.$cache.get(cacheKey)
      if (cached) return cached
      
      // 获取数据
      const response = await fetch('/api/data', {
        method: 'POST',
        body: JSON.stringify(params)
      })
      const data = await response.json()
      
      // 缓存结果
      store.$cache.set(cacheKey, data, 5 * 60 * 1000)
      set({ data })
      
      return data
    }
  }),
  cache: { maxSize: 100 },
  enablePerformanceMonitor: true
})
```

## 🤝 获取帮助

- 查看 [FINAL_PROGRESS_REPORT.md](./FINAL_PROGRESS_REPORT.md) 了解最新进度 ⭐
- 查看 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) 了解技术细节
- 查看 [WORK_COMPLETED.md](./WORK_COMPLETED.md) 了解完成情况
- 提交 Issue 报告问题或建议

---

**祝你使用愉快！** 🎉

