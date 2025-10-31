# @ldesign/store-sveltekit

🔥 SvelteKit adapter for @ldesign/store - 基于 Svelte 适配器，支持 SSR。

## 📦 安装

```bash
pnpm add @ldesign/store-sveltekit @sveltejs/kit svelte
```

## 🚀 快速开始

```typescript
// src/lib/stores/user.ts
import { createSvelteStore } from '@ldesign/store-sveltekit'

export const userStore = createSvelteStore({
  name: 'user',
  initialState: { name: '' },
  persist: true
})
```

在 SvelteKit 页面中使用：

```svelte
<script>
  import { userStore } from '$lib/stores/user'
</script>

<h1>{$userStore.name}</h1>
<button on:click={() => userStore.actions.setName('张三')}>
  Set Name
</button>
```

## 📄 许可证

MIT License © 2024




