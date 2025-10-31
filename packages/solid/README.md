# @ldesign/store-solid

⚡ Solid adapter for @ldesign/store - 基于 @solidjs/store 的增强状态管理。

## ✨ 特性

- 🚀 **基于 @solidjs/store**: 细粒度响应式系统
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- 🎯 **细粒度更新**: Solid 的优势
- 🔒 **类型安全**: 完整 TypeScript 支持

## 📦 安装

```bash
pnpm add @ldesign/store-solid solid-js
```

## 🚀 快速开始

### 基础用法

```typescript
import { createSolidStore } from '@ldesign/store-solid'

const store = createSolidStore({
  name: 'user',
  initialState: {
    name: '',
    age: 0
  },
  actions: (setState, getState) => ({
    setName: (name: string) => setState('name', name),
    incrementAge: () => setState('age', getState().age + 1),
    async fetchUser(id: string) {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      setState({ name: data.name, age: data.age })
    }
  })
})

// 在组件中使用
function UserProfile() {
  return (
    <div>
      <h1>{store.state.name}</h1>
      <p>Age: {store.state.age}</p>
      <button onClick={() => store.actions.setName('张三')}>
        Set Name
      </button>
      <button onClick={store.actions.incrementAge}>
        Increment Age
      </button>
    </div>
  )
}
```

### 持久化

```typescript
const store = createSolidStore({
  name: 'settings',
  initialState: {
    theme: 'light' as 'light' | 'dark',
    language: 'zh-CN'
  },
  persist: true, // 启用持久化
  actions: (setState, getState) => ({
    toggleTheme: () => {
      const current = getState().theme
      setState('theme', current === 'light' ? 'dark' : 'light')
    }
  })
})

// 状态会自动保存到 localStorage
// 刷新页面后自动恢复
```

### 细粒度响应式

```typescript
// Solid 的优势：只有使用到的属性变化时才会重新渲染
function UserName() {
  // 只订阅 name，age 变化时不会重新渲染
  return <h1>{store.state.name}</h1>
}

function UserAge() {
  // 只订阅 age，name 变化时不会重新渲染
  return <p>Age: {store.state.age}</p>
}
```

### 性能监控

```typescript
const store = createSolidStore({
  name: 'api',
  initialState: {
    data: null as any
  },
  enablePerformanceMonitor: true,
  actions: (setState) => ({
    async fetchData() {
      return store.$performanceMonitor!.measure('fetchData', async () => {
        const data = await fetch('/api/data').then(r => r.json())
        setState('data', data)
        return data
      })
    }
  })
})

// 查看性能指标
await store.actions.fetchData()
console.log(store.$performanceMonitor!.getMetrics('fetchData'))
```

## 📚 API 文档

### createSolidStore(options)

创建增强的 Solid Store。

**选项**:
- `name`: Store 名称（必需）
- `initialState`: 初始状态（必需）
- `actions`: Actions 函数
- `cache`: 缓存选项
- `persist`: 持久化选项
- `enablePerformanceMonitor`: 是否启用性能监控

**返回**:
增强的 Solid Store 对象，包含：
- `state`: 响应式状态
- `setState`: 状态更新函数
- `actions`: Actions 对象
- `$cache`: LRU 缓存实例
- `$performanceMonitor`: 性能监控器
- `$subscriptionManager`: 订阅管理器
- `$persist()`: 手动持久化
- `$hydrate()`: 手动恢复
- `$clearPersisted()`: 清除持久化数据

## 🎯 Solid 特色

### 1. 细粒度响应式

Solid 只会更新实际使用的响应式值，性能极佳：

```typescript
const store = createSolidStore({
  name: 'counter',
  initialState: {
    count: 0,
    other: 'value'
  },
  actions: (setState) => ({
    increment: () => setState('count', c => c + 1)
  })
})

// 只订阅 count
function Counter() {
  return <div>{store.state.count}</div>
  // other 变化时不会重新渲染
}
```

### 2. 嵌套状态更新

```typescript
const store = createSolidStore({
  name: 'user',
  initialState: {
    profile: {
      name: '',
      address: {
        city: '',
        street: ''
      }
    }
  },
  actions: (setState) => ({
    setCity: (city: string) => {
      // 细粒度更新，只更新 city
      setState('profile', 'address', 'city', city)
    }
  })
})
```

### 3. 数组更新

```typescript
const store = createSolidStore({
  name: 'todos',
  initialState: {
    items: [] as Array<{ id: number; text: string; done: boolean }>
  },
  actions: (setState) => ({
    addTodo: (text: string) => {
      setState('items', items => [...items, {
        id: Date.now(),
        text,
        done: false
      }])
    },
    toggleTodo: (id: number) => {
      setState('items', item => item.id === id, 'done', done => !done)
    }
  })
})
```

## 📄 许可证

MIT License © 2024




