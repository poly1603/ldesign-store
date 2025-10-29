# @ldesign/store-preact

⚡ Preact adapter for @ldesign/store - 基于 Preact Signals 的增强状态管理。

## ✨ 特性

- 🚀 **基于 Preact Signals**: 官方推荐的状态管理方案
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- 🎯 **细粒度更新**: Signals 的优势
- 🔒 **类型安全**: 完整 TypeScript 支持

## 📦 安装

```bash
pnpm add @ldesign/store-preact preact @preact/signals
```

## 🚀 快速开始

```typescript
import { createPreactStore } from '@ldesign/store-preact'

const store = createPreactStore({
  name: 'user',
  initialState: {
    name: '',
    age: 0
  },
  actions: (setState, getState) => ({
    setName: (name: string) => setState({ name }),
    incrementAge: () => setState({ age: getState().age + 1 })
  }),
  persist: true
})

// 在组件中使用
function UserProfile() {
  return (
    <div>
      <h1>{store.state.value.name}</h1>
      <button onClick={() => store.actions.setName('张三')}>
        Set Name
      </button>
    </div>
  )
}
```

## 📄 许可证

MIT License © 2024



