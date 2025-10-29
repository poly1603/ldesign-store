# @ldesign/store-remix

💿 Remix adapter for @ldesign/store - 基于 React 适配器。

## 📦 安装

```bash
pnpm add @ldesign/store-remix @remix-run/react react zustand
```

## 🚀 快速开始

```typescript
import { createReactStore } from '@ldesign/store-remix'

const useUserStore = createReactStore({
  name: 'user',
  initialState: { name: '' },
  persist: true
})

// 在 Remix 路由中使用
export default function Index() {
  const { name, setName } = useUserStore()
  return <h1>{name}</h1>
}
```

## 📄 许可证

MIT License © 2024



