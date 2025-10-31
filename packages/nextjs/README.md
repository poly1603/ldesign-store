# @ldesign/store-nextjs

▲ Next.js adapter for @ldesign/store - 基于 React 适配器，支持 SSR。

## ✨ 特性

- 🚀 **基于 React 适配器**: 完全继承 Zustand 功能
- 🌐 **SSR 支持**: 兼容 Next.js 服务端渲染
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能

## 📦 安装

```bash
pnpm add @ldesign/store-nextjs next react zustand
```

## 🚀 快速开始

```typescript
import { createReactStore } from '@ldesign/store-nextjs'

const useUserStore = createReactStore({
  name: 'user',
  initialState: {
    name: '',
    age: 0
  },
  actions: (set) => ({
    setName: (name: string) => set({ name })
  }),
  persist: true
})

// 在 Next.js 组件中使用
export default function Page() {
  const { name, setName } = useUserStore()
  
  return (
    <div>
      <h1>{name}</h1>
      <button onClick={() => setName('张三')}>Set Name</button>
    </div>
  )
}
```

## 📄 许可证

MIT License © 2024




