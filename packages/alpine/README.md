# @ldesign/store-alpine

⛰️ Alpine.js adapter for @ldesign/store - 基于 Alpine.store() 的增强状态管理。

## ✨ 特性

- 🚀 **基于 Alpine.store()**: 使用 Alpine.js 内置状态管理
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- 🎯 **轻量简洁**: 适合轻量级项目

## 📦 安装

```bash
pnpm add @ldesign/store-alpine alpinejs
```

## 🚀 快速开始

```typescript
import Alpine from 'alpinejs'
import { createAlpineStore } from '@ldesign/store-alpine'

const userStore = createAlpineStore({
  name: 'user',
  initialState: {
    name: '',
    age: 0
  },
  actions: {
    setName(name: string) {
      this.name = name
    },
    incrementAge() {
      this.age++
    }
  },
  persist: true
})

// 注册到 Alpine
Alpine.store('user', userStore.store)

// 在 HTML 中使用
```

```html
<div x-data>
  <h1 x-text="$store.user.name"></h1>
  <button @click="$store.user.setName('张三')">Set Name</button>
  <button @click="$store.user.incrementAge()">Increment Age</button>
</div>
```

## 📄 许可证

MIT License © 2024



