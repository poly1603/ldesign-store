# @ldesign/store

🚀 **多框架状态管理库** - 统一的 API，支持 Vue、React、Solid、Svelte 等 14+ 框架。

## ✨ 架构特点

- 🎯 **薄适配层设计**: 利用各框架生态的成熟状态管理库
- 🔧 **框架无关核心**: 缓存、持久化、装饰器、性能监控
- 📦 **统一 API**: 所有框架保持一致的使用体验
- ⚡ **高性能**: O(1) LRU缓存，优先级桶订阅系统
- 💾 **自动持久化**: 内置 localStorage 支持
- 📊 **性能监控**: 实时性能指标

## 📦 包结构

```
@ldesign/store                 # 主包（聚合导出）
├── @ldesign/store-core       # 核心包（框架无关）
├── @ldesign/store-vue        # Vue 适配器（基于 Pinia）
├── @ldesign/store-react      # React 适配器（基于 Zustand）
├── @ldesign/store-solid      # Solid 适配器（基于 @solidjs/store）
├── @ldesign/store-svelte     # Svelte 适配器（基于 svelte/store）
├── @ldesign/store-angular    # Angular 适配器（基于 @ngrx/signals）
└── ...                        # 更多框架适配器
```

## 🚀 快速开始

### Vue 3

```bash
pnpm add @ldesign/store-vue pinia vue
```

```typescript
import { createVueStore } from '@ldesign/store-vue'

const useUserStore = createVueStore({
  id: 'user',
  state: () => ({
    name: '',
    age: 0
  }),
  actions: {
    setName(name: string) {
      this.name = name
    }
  },
  persist: true, // 自动持久化
  cache: { maxSize: 100 } // 内置缓存
})

// 在组件中使用
const store = useUserStore()
store.setName('张三')
```

### React 18

```bash
pnpm add @ldesign/store-react zustand react
```

```typescript
import { createReactStore } from '@ldesign/store-react'

const useUserStore = createReactStore({
  name: 'user',
  initialState: {
    name: '',
    age: 0
  },
  actions: (set, get) => ({
    setName: (name: string) => set({ name }),
    incrementAge: () => set({ age: get().age + 1 })
  }),
  persist: true // 自动持久化
})

// 在组件中使用
function UserProfile() {
  const { name, age, setName } = useUserStore()
  
  return (
    <div>
      <h1>{name}</h1>
      <button onClick={() => setName('张三')}>Set Name</button>
    </div>
  )
}
```

### 仅使用核心功能（框架无关）

```bash
pnpm add @ldesign/store-core
```

```typescript
import { LRUCache, PerformanceMonitor, SubscriptionManager } from '@ldesign/store-core'

// LRU 缓存
const cache = new LRUCache({ maxSize: 100, defaultTTL: 5000 })
cache.set('key', 'value')
const value = cache.get('key')

// 性能监控
const monitor = new PerformanceMonitor()
const result = monitor.measure('fetchData', async () => {
  const data = await fetch('/api/data')
  return data.json()
})
console.log(monitor.getMetrics('fetchData'))

// 订阅系统
const manager = new SubscriptionManager()
const unsubscribe = manager.subscribe('update', (data) => {
  console.log('Updated:', data)
}, 10) // 优先级 10
```

## 📚 框架支持

| 框架 | 状态 | 底层库 | 包名 |
|---|---|---|---|
| Vue 3 | ✅ 完成 | Pinia | @ldesign/store-vue |
| React 18 | ✅ 完成 | Zustand | @ldesign/store-react |
| Solid | 🔨 开发中 | @solidjs/store | @ldesign/store-solid |
| Svelte | 🔨 开发中 | svelte/store | @ldesign/store-svelte |
| Angular | 📅 计划中 | @ngrx/signals | @ldesign/store-angular |
| Alpine.js | 📅 计划中 | Alpine.store | @ldesign/store-alpine |
| Astro | 📅 计划中 | nanostores | @ldesign/store-astro |
| Lit | 📅 计划中 | Reactive Controllers | @ldesign/store-lit |
| Preact | 📅 计划中 | Preact Signals | @ldesign/store-preact |
| Qwik | 📅 计划中 | Qwik Store | @ldesign/store-qwik |
| Next.js | 📅 计划中 | 基于 React | @ldesign/store-nextjs |
| Nuxt.js | 📅 计划中 | 基于 Vue | @ldesign/store-nuxtjs |
| Remix | 📅 计划中 | 基于 React | @ldesign/store-remix |
| SvelteKit | 📅 计划中 | 基于 Svelte | @ldesign/store-sveltekit |

## 🎯 核心功能

### LRU 缓存

```typescript
import { LRUCache } from '@ldesign/store-core'

const cache = new LRUCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000,
  enableStats: true
})

cache.set('user:1', { id: 1, name: '张三' })
const user = cache.get('user:1')

console.log(cache.getStats())
```

### 性能监控

```typescript
import { PerformanceMonitor } from '@ldesign/store-core'

const monitor = new PerformanceMonitor()

const result = monitor.measure('fetchData', async () => {
  const data = await fetch('/api/data')
  return data.json()
})

console.log(monitor.getMetrics('fetchData'))
// { name: 'fetchData', count: 1, avgTime: 123, minTime: 123, maxTime: 123 }
```

### 装饰器

```typescript
import { State, Action, Getter } from '@ldesign/store-core'

class Store {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  @Getter({ cache: true })
  get doubleCount() {
    return this.count * 2
  }
}
```

### 持久化

```typescript
import { getDefaultStorage, getDefaultSerializer } from '@ldesign/store-core'

const storage = getDefaultStorage() // localStorage (浏览器) 或 MemoryStorage (Node.js)
const serializer = getDefaultSerializer() // JSON

// 保存
storage.setItem('key', serializer.serialize({ data: 'value' }))

// 恢复
const data = serializer.deserialize(storage.getItem('key'))
```

## 🔧 高级特性

### 统一 API

所有框架适配器提供一致的 API：

```typescript
// Vue
const useStore = createVueStore({ id: 'store', state: () => ({}) })

// React
const useStore = createReactStore({ name: 'store', initialState: {} })

// Solid (未来)
const useStore = createSolidStore({ name: 'store', initialState: {} })

// Svelte (未来)
const store = createSvelteStore({ name: 'store', initialState: {} })
```

### 性能优化

- ⚡ **O(1) LRU 缓存**: 双向链表 + Map 实现
- 🎯 **优先级桶订阅**: 避免每次排序，O(k) 通知
- 🔄 **对象池**: 减少 GC 压力
- 📈 **快速哈希**: FNV-1a 算法，比 JSON.stringify 快 2-3 倍

### 内存管理

- 📏 **资源限制**: 缓存大小、订阅者数量限制
- 🧹 **自动清理**: 定时清理过期缓存
- ⏱️ **定时器优化**: 使用 unref() 防止阻止进程退出
- 📊 **统计监控**: 缓存命中率、性能指标

## 📄 许可证

MIT License © 2024

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

[📖 文档](./docs) • [🐛 问题反馈](https://github.com/ldesign/store/issues) • [💬 讨论](https://github.com/ldesign/store/discussions)

</div>



