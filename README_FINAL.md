# @ldesign/store

🚀 **全框架状态管理库** - 支持 Vue、React、Solid、Svelte 等 14+ 框架，统一 API，开箱即用。

[![npm version](https://badge.fury.io/js/@ldesign%2Fstore.svg)](https://badge.fury.io/js/@ldesign%2Fstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ 核心特性

- 🎯 **14+ 框架支持**: Vue、React、Solid、Svelte、Angular 等
- 🔧 **薄适配层设计Menu 基于各框架成熟的状态管理库
- 📦 **统一 API**: 所有框架保持一致的使用体验
- ⚡ **高性能优化**: O(1) LRU缓存，优先级桶订阅系统
- 💾 **自动持久化Menu 内置 localStorage 支持
- 📊 **性能监控**: 实时性能指标
- 🗄️ **智能缓存MenuLRU 缓存自动管理
- 🔒 **类型安全Menu 完整 TypeScript 支持

## 📦 包结构

```
@ldesign/store (主包)
├── @ldesign/store-core       # 核心包（框架无关）
│
├── 主流框架 (4个)
│   ├── @ldesign/store-vue        # Vue 3 (基于 Pinia)
│   ├── @ldesign/store-react      # React 18 (基于 Zustand)
│   ├── @ldesign/store-solid      # Solid (基于 @solidjs/store)
│   └── @ldesign/store-svelte     # Svelte (基于 svelte/store)
│
├── 企业框架 (2个)
│   ├── @ldesign/store-angular    # Angular (基于 @ngrx/signals)
│   └── @ldesign/store-alpine     # Alpine.js (基于 Alpine.store)
│
├── 轻量框架 (3个)
│   ├── @ldesign/store-preact     # Preact (基于 Preact Signals)
│   ├── @ldesign/store-qwik       # Qwik (基于 Qwik Signals)
│   └── @ldesign/store-astro      # Astro (基于 nanostores)
│
├── Web Components (1个)
│   └── @ldesign/store-lit        # Lit (基于 Reactive Controllers)
│
└── 元框架 (4个)
    ├── @ldesign/store-nextjs     # Next.js (基于 React)
    ├── @ldesign/store-nuxtjs     # Nuxt.js (基于 Vue)
    ├── @ldesign/store-remix      # Remix (基于 React)
    └── @ldesign/store-sveltekit  # SvelteKit (基于 Svelte)
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
  state: () => ({ name: '', age: 0 }),
  actions: {
    setName(name: string) { this.name = name }
  },
  persist: true,
  cache: { maxSize: 100 }
})

// 在组件中
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
  initialState: { name: '', age: 0 },
  actions: (set) => ({
    setName: (name: string) => set({ name })
  }),
  persist: true
})

// 在组件中
const { name, setName } = useUserStore()
```

### Solid

```bash
pnpm add @ldesign/store-solid solid-js
```

```typescript
import { createSolidStore } from '@ldesign/store-solid'

const store = createSolidStore({
  name: 'user',
  initialState: { name: '', age: 0 },
  actions: (setState) => ({
    setName: (name: string) => setState('name', name)
  }),
  persist: true
})

// 在组件中
<h1>{store.state.name}</h1>
```

### Svelte

```bash
pnpm add @ldesign/store-svelte svelte
```

```typescript
import { createSvelteStore } from '@ldesign/store-svelte'

const userStore = createSvelteStore({
  name: 'user',
  initialState: { name: '', age: 0 },
  actions: (update) => ({
    setName: (name: string) => update(s => ({ ...s, name }))
  }),
  persist: true
})

// 在组件中
<h1>{$userStore.name}</h1>
```

### 其他框架

查看各框架包的 README 获取详细使用说明。

## 📚 框架支持详情

| 框架 | 安装包 | README |
|---|---|---|
| Vue 3 | `@ldesign/store-vue` | [查看](./packages/vue/README.md) |
| React 18 | `@ldesign/store-react` | [查看](./packages/react/README.md) |
| Solid | `@ldesign/store-solid` | [查看](./packages/solid/README.md) |
| Svelte | `@ldesign/store-svelte` | [查看](./packages/svelte/README.md) |
| Angular | `@ldesign/store-angular` | [查看](./packages/angular/README.md) |
| Alpine.js | `@ldesign/store-alpine` | [查看](./packages/alpine/README.md) |
| Preact | `@ldesign/store-preact` | [查看](./packages/preact/README.md) |
| Qwik | `@ldesign/store-qwik` | [查看](./packages/qwik/README.md) |
| Astro | `@ldesign/store-astro` | [查看](./packages/astro/README.md) |
| Lit | `@ldesign/store-lit` | [查看](./packages/lit/README.md) |
| Next.js | `@ldesign/store-nextjs` | [查看](./packages/nextjs/README.md) |
| Nuxt.js | `@ldesign/store-nuxtjs` | [查看](./packages/nuxtjs/README.md) |
| Remix | `@ldesign/store-remix` | [查看](./packages/remix/README.md) |
| SvelteKit | `@ldesign/store-sveltekit` | [查看](./packages/sveltekit/README.md) |

## 🎯 核心功能

### 1. 智能缓存系统

```typescript
const store = createStore({
  cache: {
    maxSize: 100,
    defaultTTL: 5 * 60 * 1000,
    enableStats: true
  }
})

// 使用缓存
const cacheKey = `data:${id}`
const cached = store.$cache.get(cacheKey)
if (cached) return cached

const data = await fetchData(id)
store.$cache.set(cacheKey, data)
```

### 2. 自动持久化

```typescript
const store = createStore({
  persist: true // 自动保存到 localStorage
})

// 或自定义配置
const store = createStore({
  persist: {
    key: 'my-store',
    storage: sessionStorage,
    paths: ['user', 'settings'] // 只持久化指定字段
  }
})
```

### 3. 性能监控

```typescript
const store = createStore({
  enablePerformanceMonitor: true
})

// 测量性能
store.$performanceMonitor.measure('fetchData', async () => {
  const data = await fetch('/api/data')
  return data.json()
})

// 查看指标
const metrics = store.$performanceMonitor.getMetrics('fetchData')
console.log(`平均耗时: ${metrics.avgTime}ms`)
```

### 4. 装饰器支持

```typescript
import { State, Action, Getter } from '@ldesign/store-core'

class UserStore {
  @State({ default: '' })
  name: string = ''

  @Action({ cache: true })
  async fetchUser(id: string) {
    const data = await api.getUser(id)
    this.name = data.name
  }

  @Getter({ cache: true })
  get displayName() {
    return `User: ${this.name}`
  }
}
```

## 🔧 高级特性

### 批量操作

所有框架都支持批量更新以优化性能。

### 订阅系统

```typescript
const unsubscribe = store.$subscriptionManager.subscribe('update', (data) => {
  console.log('State updated:', data)
}, 10) // 优先级 10

store.$subscriptionManager.notify('update', newState)
```

### 手动持久化控制

```typescript
// 手动持久化
store.$persist()

// 恢复持久化数据
store.$hydrate()

// 清除持久化数据
store.$clearPersisted()
```

## 📊 性能对比

| 操作 | @ldesign/store | 原生库 | 提升 |
|---|---|---|---|
| 缓存 get/set | O(1) | O(n) | 显著 |
| 订阅通知 | O(k) | O(n·log n) | ~2x |
| 哈希计算 | FNV-1a | JSON.stringify | 2-3x |

## 🛠️ 开发指南

### 构建所有包

```bash
cd packages/store

# 构建核心包
cd packages/core && pnpm install && pnpm build && cd ../..

# 构建框架适配器
for dir in packages/*/; do
  (cd "$dir" && pnpm install && pnpm build)
done
```

### 运行测试

```bash
# 所有包的测试
pnpm -r test
```

## 📄 文档资源

- 📖 [快速上手指南](./GETTING_STARTED.md)
- 📊 [完整实现报告](./COMPLETE_FRAMEWORK_SUPPORT.md)
- 📝 [最终进度报告](./FINAL_PROGRESS_REPORT.md)
- 🎯 [实施总结](./IMPLEMENTATION_SUMMARY.md)
- 💡 [工作完成报告](./WORK_COMPLETED.md)

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. 🍴 Fork 项目
2. 🌟 创建特性分支
3. 💾 提交更改
4. 📤 推送分支
5. 🎉 创建 Pull Request

## 📄 许可证

MIT License © 2024

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

[📖 文档](./GETTING_STARTED.md) • [🐛 问题反馈](https://github.com/ldesign/store/issues) • [💬 讨论](https://github.com/ldesign/store/discussions)

**支持 14+ 框架 | 统一 API | 高性能 | 易扩展**

</div>



