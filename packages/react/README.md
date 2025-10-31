# @ldesign/store-react

⚛️ React adapter for @ldesign/store - 基于 Zustand 的增强状态管理。

## ✨ 特性

- 🚀 **基于 Zustand**: 轻量高效的状态管理
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- 🪝 **React Hooks**: 原生 Hooks API
- 🎯 **TypeScript**: 完整类型支持

## 📦 安装

```bash
pnpm add @ldesign/store-react zustand react
```

## 🚀 快速开始

### 基础用法

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
    incrementAge: () => set({ age: get().age + 1 }),
    async fetchUser(id: string) {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      set({ name: data.name, age: data.age })
    }
  })
})

// 在组件中使用
function UserProfile() {
  const { name, age, setName, incrementAge } = useUserStore()
  
  return (
    <div>
      <h1>{name}</h1>
      <p>Age: {age}</p>
      <button onClick={() => setName('张三')}>Set Name</button>
      <button onClick={incrementAge}>Increment Age</button>
    </div>
  )
}
```

### 持久化

```typescript
const useSettingsStore = createReactStore({
  name: 'settings',
  initialState: {
    theme: 'light' as 'light' | 'dark',
    language: 'zh-CN'
  },
  persist: true, // 启用持久化
  actions: (set, get) => ({
    toggleTheme: () => {
      const current = get().theme
      set({ theme: current === 'light' ? 'dark' : 'light' })
    }
  })
})

// 状态会自动保存到 localStorage
// 刷新页面后自动恢复
```

### 选择器优化

```typescript
function UserProfile() {
  // 只订阅 name，age 变化时不会重新渲染
  const name = useUserStore((state) => state.name)
  
  return <h1>{name}</h1>
}
```

## 📚 API 文档

### createReactStore(options)

创建增强的 React Store。

**选项**:
- `name`: Store 名称（必需）
- `initialState`: 初始状态（必需）
- `actions`: Actions 函数
- `cache`: 缓存选项
- `persist`: 持久化选项
- `enablePerformanceMonitor`: 是否启用性能监控

**返回**:
Zustand store hook。

## 📄 许可证

MIT License © 2024




