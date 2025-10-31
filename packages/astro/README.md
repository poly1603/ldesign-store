# @ldesign/store-astro

🚀 Astro adapter for @ldesign/store - 基于 nanostores 的增强状态管理。

## ✨ 特性

- 🚀 **基于 nanostores**: Astro 推荐的状态管理
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- 🌐 **多框架支持**: 可在 React/Vue/Svelte 组件中使用

## 📦 安装

```bash
pnpm add @ldesign/store-astro astro nanostores
```

## 🚀 快速开始

```typescript
// src/stores/user.ts
import { createAstroStore } from '@ldesign/store-astro'

export const userStore = createAstroStore({
  name: 'user',
  initialState: {
    name: '',
    age: 0
  },
  actions: (setState) => ({
    setName: (name: string) => setState({ name }),
    incrementAge: (store) => setState({ age: store.get().age + 1 })
  }),
  persist: true
})
```

在 React 组件中使用：

```tsx
import { useStore } from '@nanostores/react'
import { userStore } from '../stores/user'

export default function UserProfile() {
  const user = useStore(userStore.store)
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => userStore.actions.setName('张三')}>
        Set Name
      </button>
    </div>
  )
}
```

## 📄 许可证

MIT License © 2024




