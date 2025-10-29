# @ldesign/store 用户指南

## 🎯 欢迎使用 @ldesign/store

这是一个支持 **14+ 框架**的统一状态管理解决方案，提供高性能、自动持久化、智能缓存等强大功能。

## 🚀 5 分钟快速上手

### 步骤 1: 选择你的框架

找到你项目使用的框架：

| 我使用的是... | 安装包 |
|---|---|
| Vue 3 | `@ldesign/store-vue` |
| React 18 | `@ldesign/store-react` |
| Solid | `@ldesign/store-solid` |
| Svelte | `@ldesign/store-svelte` |
| Angular | `@ldesign/store-angular` |
| Alpine.js | `@ldesign/store-alpine` |
| Preact | `@ldesign/store-preact` |
| Qwik | `@ldesign/store-qwik` |
| Astro | `@ldesign/store-astro` |
| Lit | `@ldesign/store-lit` |
| Next.js | `@ldesign/store-nextjs` |
| Nuxt.js | `@ldesign/store-nuxtjs` |
| Remix | `@ldesign/store-remix` |
| SvelteKit | `@ldesign/store-sveltekit` |
| 无框架/其他 | `@ldesign/store-core` |

### 步骤 2: 安装依赖

```bash
# 以 Vue 为例
pnpm add @ldesign/store-vue pinia vue

# 以 React 为例
pnpm add @ldesign/store-react zustand react
```

### 步骤 3: 创建 Store

```typescript
// Vue
import { createVueStore } from '@ldesign/store-vue'

const useUserStore = createVueStore({
  id: 'user',
  state: () => ({ name: '', age: 0 }),
  actions: {
    setName(name: string) { this.name = name }
  },
  persist: true // 开启自动持久化
})

// React
import { createReactStore } from '@ldesign/store-react'

const useUserStore = createReactStore({
  name: 'user',
  initialState: { name: '', age: 0 },
  actions: (set) => ({
    setName: (name: string) => set({ name })
  }),
  persist: true // 开启自动持久化
})
```

### 步骤 4: 在组件中使用

```typescript
// Vue
const store = useUserStore()
store.setName('张三')

// React
const { name, setName } = useUserStore()
setName('张三')
```

🎉 **完成！** 你的状态已经自动持久化到 localStorage，刷新页面后会自动恢复。

## 💡 常见场景

### 场景 1: 用户认证 Store

```typescript
const useAuthStore = createStore({
  // 状态
  [state/initialState]: {
    user: null,
    token: null,
    isAuthenticated: false
  },
  
  // Actions
  actions: {
    async login(username, password) {
      const { user, token } = await api.login(username, password)
      // 更新状态...
    },
    logout() {
      // 清空状态...
      this.$clearPersisted() // 清除持久化数据
    }
  },
  
  // 只持久化用户信息和 token
  persist: {
    paths: ['user', 'token', 'isAuthenticated']
  }
})
```

### 场景 2: 带缓存的 API Store

```typescript
const useApiStore = createStore({
  [state/initialState]: {
    data: null,
    loading: false
  },
  
  actions: {
    async fetchData(params) {
      // 检查缓存
      const cacheKey = `data:${JSON.stringify(params)}`
      const cached = this.$cache.get(cacheKey)
      if (cached) return cached
      
      // 获取数据
      this.loading = true
      const data = await api.getData(params)
      this.loading = false
      
      // 缓存 5 分钟
      this.$cache.set(cacheKey, data, 5 * 60 * 1000)
      this.data = data
      
      return data
    }
  },
  
  // 配置缓存
  cache: {
    maxSize: 100,
    defaultTTL: 5 * 60 * 1000
  }
})
```

### 场景 3: 带性能监控的 Store

```typescript
const useDataStore = createStore({
  [state/initialState]: { items: [] },
  
  actions: {
    async loadItems() {
      return this.$performanceMonitor.measure('loadItems', async () => {
        const items = await api.getItems()
        this.items = items
        return items
      })
    }
  },
  
  enablePerformanceMonitor: true
})

// 查看性能
await store.loadItems()
const metrics = store.$performanceMonitor.getMetrics('loadItems')
console.log(`加载耗时: ${metrics.avgTime.toFixed(2)}ms`)
```

## 🔧 高级功能

### 1. 自定义持久化

```typescript
// 使用 sessionStorage
createStore({
  persist: {
    storage: sessionStorage
  }
})

// 使用自定义存储
createStore({
  persist: {
    storage: {
      getItem: (key) => myStorage.get(key),
      setItem: (key, value) => myStorage.set(key, value),
      removeItem: (key) => myStorage.delete(key),
      clear: () => myStorage.clear()
    }
  }
})

// 自定义序列化
createStore({
  persist: {
    serializer: {
      serialize: (value) => msgpack.encode(value),
      deserialize: (str) => msgpack.decode(str)
    }
  }
})
```

### 2. 缓存策略

```typescript
import { CacheStrategy } from '@ldesign/store-core'

createStore({
  cache: {
    maxSize: 200,
    defaultTTL: 10 * 60 * 1000,
    strategy: CacheStrategy.LRU, // LRU | LFU | FIFO
    enableStats: true,
    cleanupInterval: 30000
  }
})

// 手动缓存操作
store.$cache.set('key', 'value', 60000) // 缓存 1 分钟
const value = store.$cache.get('key')
store.$cache.delete('key')
store.$cache.clear()

// 查看缓存统计
const stats = store.$cache.getStats()
console.log(`命中率: ${(stats.hitRate * 100).toFixed(2)}%`)
```

### 3. 订阅系统

```typescript
// 订阅状态变化（优先级 10）
const unsubscribe = store.$subscriptionManager.subscribe(
  'userUpdate',
  (data) => {
    console.log('User updated:', data)
  },
  10 // 优先级，数字越大越先执行
)

// 触发订阅
store.$subscriptionManager.notify('userUpdate', { name: '张三' })

// 取消订阅
unsubscribe()
```

### 4. 性能监控

```typescript
// 启用性能监控
const store = createStore({
  enablePerformanceMonitor: true,
  actions: {
    async fetchData() {
      return this.$performanceMonitor.measure('fetchData', async () => {
        // 执行任务...
      })
    }
  }
})

// 查看性能指标
const metrics = store.$performanceMonitor.getMetrics('fetchData')
console.log(`
  执行次数: ${metrics.count}
  平均耗时: ${metrics.avgTime.toFixed(2)}ms
  最快: ${metrics.minTime.toFixed(2)}ms
  最慢: ${metrics.maxTime.toFixed(2)}ms
`)

// 获取所有指标
const allMetrics = store.$performanceMonitor.getAllMetrics()

// 重置指标
store.$performanceMonitor.reset('fetchData')
```

## ❓ 常见问题

### Q1: 如何选择框架适配器？

A: 根据你的项目框架选择对应的包：
- Vue 项目 → @ldesign/store-vue
- React 项目 → @ldesign/store-react
- 等等

### Q2: 可以在同一项目中使用多个适配器吗？

A: 可以！例如在 Astro 项目中：
```typescript
// 在 React 组件中
import { createReactStore } from '@ldesign/store-react'

// 在 Vue 组件中
import { createVueStore } from '@ldesign/store-vue'

// 或使用 Astro 适配器（支持所有框架）
import { createAstroStore } from '@ldesign/store-astro'
```

### Q3: 持久化的数据存储在哪里？

A: 默认存储在 localStorage，可以自定义：
```typescript
persist: {
  key: 'my-app-store',
  storage: sessionStorage // 或自定义存储
}
```

### Q4: 如何清空缓存？

A:
```typescript
// 清空所有缓存
store.$cache.clear()

// 删除特定缓存
store.$cache.delete('key')

// 查看缓存状态
console.log(store.$cache.size())
```

### Q5: 性能监控会影响性能吗？

A: 影响极小（< 1%），且仅在开发模式启用时建议使用：
```typescript
createStore({
  enablePerformanceMonitor: process.env.NODE_ENV === 'development'
})
```

## 📚 进阶阅读

- 📖 [API 对比文档](./API_COMPARISON.md) - 所有框架 API 详细对比
- 🔨 [构建指南](./BUILD_GUIDE.md) - 如何构建所有包
- 📁 [文件索引](./FILE_INDEX.md) - 所有文件清单
- 💡 [完成报告](./PROJECT_COMPLETE_SUMMARY.md) - 项目完成情况

## 🤝 获取帮助

- 📖 查看对应框架包的 README
- 💬 提交 Issue 报告问题
- 🌟 Star 项目支持我们

---

**祝你使用愉快！** 🚀

**@ldesign/store - 一个库，所有框架！**



