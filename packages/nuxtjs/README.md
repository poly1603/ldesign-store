# @ldesign/store-nuxtjs

🟢 Nuxt.js adapter for @ldesign/store - 基于 Vue 适配器，支持 SSR。

## ✨ 特性

- 🚀 **基于 Vue 适配器**: 完全继承 Pinia 功能
- 🌐 **SSR 支持**: 兼容 Nuxt.js 服务端渲染
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能

## 📦 安装

```bash
pnpm add @ldesign/store-nuxtjs nuxt vue pinia
```

## 🚀 快速开始

```typescript
// stores/user.ts
import { createVueStore } from '@ldesign/store-nuxtjs'

export const useUserStore = createVueStore({
  id: 'user',
  state: () => ({
    name: '',
    age: 0
  }),
  actions: {
    setName(name: string) {
      this.name = name
    }
  },
  persist: true
})
```

在 Nuxt 页面中使用：

```vue
<template>
  <div>
    <h1>{{ store.name }}</h1>
    <button @click="store.setName('张三')">Set Name</button>
  </div>
</template>

<script setup>
const store = useUserStore()
</script>
```

## 📄 许可证

MIT License © 2024




