# @ldesign/store-vue

🎯 Vue adapter for @ldesign/store - 基于 Pinia 的增强状态管理。

## ✨ 特性

- 🚀 **基于 Pinia**: 充分利用 Pinia 的强大功能
- 💾 **自动持久化**: 状态自动保存到 localStorage
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- 🔔 **订阅系统**: 优先级订阅
- 🎨 **装饰器支持**: 优雅的装饰器语法

## 📦 安装

```bash
pnpm add @ldesign/store-vue pinia vue
```

## 🚀 快速开始

### 基础用法

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
    },
    async fetchUser(id: string) {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      this.name = data.name
      this.age = data.age
    }
  },
  getters: {
    displayName: (state) => `User: ${state.name}`
  }
})

// 在组件中使用
const store = useUserStore()
store.setName('张三')
console.log(store.displayName)
```

### 持久化

```typescript
const useSettingsStore = createVueStore({
  id: 'settings',
  state: () => ({
    theme: 'light',
    language: 'zh-CN'
  }),
  persist: true, // 启用持久化
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    }
  }
})

// 状态会自动保存到 localStorage
// 刷新页面后自动恢复
```

### 缓存

```typescript
const useDataStore = createVueStore({
  id: 'data',
  state: () => ({
    items: []
  }),
  cache: {
    maxSize: 100,
    defaultTTL: 5 * 60 * 1000 // 5 分钟
  },
  actions: {
    async fetchData(params: any) {
      const cacheKey = `data:${JSON.stringify(params)}`
      
      // 检查缓存
      const cached = this.$cache.get(cacheKey)
      if (cached) return cached
      
      // 获取数据
      const data = await api.getData(params)
      
      // 缓存结果
      this.$cache.set(cacheKey, data)
      
      return data
    }
  }
})
```

### 性能监控

```typescript
const useApiStore = createVueStore({
  id: 'api',
  state: () => ({
    data: null
  }),
  enablePerformanceMonitor: true,
  actions: {
    async fetchData() {
      return this.$performanceMonitor!.measure('fetchData', async () => {
        const data = await fetch('/api/data').then(r => r.json())
        this.data = data
        return data
      })
    }
  }
})

// 查看性能指标
const store = useApiStore()
await store.fetchData()
console.log(store.$performanceMonitor!.getMetrics('fetchData'))
```

## 📚 API 文档

### createVueStore(options)

创建增强的 Vue Store。

**选项**:
- `id`: Store ID（必需）
- `state`: 状态函数（必需）
- `actions`: Actions 对象
- `getters`: Getters 对象
- `cache`: 缓存选项
- `persist`: 持久化选项（boolean 或配置对象）
- `enablePerformanceMonitor`: 是否启用性能监控

**返回**:
增强的 Store 创建器函数。

### 增强的 Store 实例

除了 Pinia 的所有功能外，还提供：

- `$cache`: LRU 缓存实例
- `$performanceMonitor`: 性能监控器（如果启用）
- `$subscriptionManager`: 订阅管理器
- `$persist()`: 手动持久化
- `$hydrate()`: 手动恢复持久化数据
- `$clearPersisted()`: 清除持久化数据

## 🔄 迁移指南

从纯 Pinia 迁移：

```typescript
// 之前
import { defineStore } from 'pinia'

const useUserStore = defineStore('user', {
  state: () => ({ name: '' }),
  actions: {
    setName(name: string) {
      this.name = name
    }
  }
})

// 之后
import { createVueStore } from '@ldesign/store-vue'

const useUserStore = createVueStore({
  id: 'user',
  state: () => ({ name: '' }),
  actions: {
    setName(name: string) {
      this.name = name
    }
  },
  // 添加增强功能
  persist: true,
  cache: { maxSize: 100 }
})
```

## 📄 许可证

MIT License © 2024



