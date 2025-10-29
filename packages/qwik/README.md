# @ldesign/store-qwik

⚡ Qwik adapter for @ldesign/store - 基于 Qwik signals 的增强状态管理。

## ✨ 特性

- 🚀 **基于 Qwik useStore**: Qwik 内置状态管理
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- ⚡ **可恢复性**: Qwik 的优势

## 📦 安装

```bash
pnpm add @ldesign/store-qwik @builder.io/qwik
```

## 🚀 快速开始

```typescript
import { component$ } from '@builder.io/qwik'
import { createQwikStore } from '@ldesign/store-qwik'

const useUserStore = createQwikStore({
  name: 'user',
  initialState: {
    name: '',
    age: 0
  },
  actions: {
    setName(name: string) {
      this.name = name
    }
  },
  persist: true
})

export default component$(() => {
  const store = useUserStore()
  
  return (
    <div>
      <h1>{store.name}</h1>
      <button onClick$={() => store.setName('张三')}>
        Set Name
      </button>
    </div>
  )
})
```

## 📄 许可证

MIT License © 2024



