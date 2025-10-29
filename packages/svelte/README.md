# @ldesign/store-svelte

🔥 Svelte adapter for @ldesign/store - 基于 svelte/store 的增强状态管理。

## ✨ 特性

- 🚀 **基于 svelte/store**: 内置响应式系统
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- 🎯 **$ 自动订阅**: Svelte 特色语法
- 🔒 **类型安全**: 完整 TypeScript 支持

## 📦 安装

```bash
pnpm add @ldesign/store-svelte svelte
```

## 🚀 快速开始

### 基础用法

```typescript
import { createSvelteStore } from '@ldesign/store-svelte'

const userStore = createSvelteStore({
  name: 'user',
  initialState: {
    name: '',
    age: 0
  },
  actions: (update, getState) => ({
    setName: (name: string) => update(s => ({ ...s, name })),
    incrementAge: () => update(s => ({ ...s, age: s.age + 1 })),
    async fetchUser(id: string) {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      update(s => ({ ...s, name: data.name, age: data.age }))
    }
  })
})
```

在 Svelte 组件中使用：

```svelte
<script>
  import { userStore } from './stores'
</script>

<!-- 使用 $ 自动订阅语法 -->
<h1>{$userStore.name}</h1>
<p>Age: {$userStore.age}</p>

<button on:click={() => userStore.actions.setName('张三')}>
  Set Name
</button>

<button on:click={userStore.actions.incrementAge}>
  Increment Age
</button>
```

### 持久化

```typescript
const settingsStore = createSvelteStore({
  name: 'settings',
  initialState: {
    theme: 'light',
    language: 'zh-CN'
  },
  persist: true, // 启用持久化
  actions: (update, getState) => ({
    toggleTheme: () => {
      const current = getState().theme
      update(s => ({ 
        ...s, 
        theme: current === 'light' ? 'dark' : 'light' 
      }))
    }
  })
})

// 状态会自动保存到 localStorage
// 刷新页面后自动恢复
```

### 性能监控

```typescript
const apiStore = createSvelteStore({
  name: 'api',
  initialState: {
    data: null
  },
  enablePerformanceMonitor: true,
  actions: (update) => ({
    async fetchData() {
      return apiStore.$performanceMonitor.measure('fetchData', async () => {
        const data = await fetch('/api/data').then(r => r.json())
        update(s => ({ ...s, data }))
        return data
      })
    }
  })
})

// 查看性能指标
await apiStore.actions.fetchData()
console.log(apiStore.$performanceMonitor.getMetrics('fetchData'))
```

## 📚 API 文档

### createSvelteStore(options)

创建增强的 Svelte Store。

**选项**:
- `name`: Store 名称（必需）
- `initialState`: 初始状态（必需）
- `actions`: Actions 函数
- `cache`: 缓存选项
- `persist`: 持久化选项
- `enablePerformanceMonitor`: 是否启用性能监控

**返回**:
增强的 Svelte Store，兼容 svelte/store 的 Writable 接口，额外提供：
- `actions`: Actions 对象
- `$cache`: LRU 缓存实例
- `$performanceMonitor`: 性能监控器
- `$subscriptionManager`: 订阅管理器
- `$persist()`: 手动持久化
- `$hydrate()`: 手动恢复
- `$clearPersisted()`: 清除持久化数据

## 🎯 Svelte 特色

### 1. $ 自动订阅语法

```svelte
<script>
  import { userStore } from './stores'
  
  // 使用 $ 自动订阅，组件销毁时自动取消订阅
</script>

<h1>{$userStore.name}</h1>
<p>Age: {$userStore.age}</p>
```

### 2. 手动订阅

```svelte
<script>
  import { onMount } from 'svelte'
  import { userStore } from './stores'
  
  let name = ''
  
  onMount(() => {
    const unsubscribe = userStore.subscribe(state => {
      name = state.name
    })
    
    return unsubscribe
  })
</script>

<h1>{name}</h1>
```

### 3. Derived Stores

```typescript
import { derived } from 'svelte/store'
import { userStore } from './stores'

// 创建派生 store
const displayName = derived(
  userStore,
  $userStore => `User: ${$userStore.name}`
)
```

### 4. 可读 Store

```typescript
import { readable } from 'svelte/store'

const time = readable(new Date(), (set) => {
  const interval = setInterval(() => {
    set(new Date())
  }, 1000)
  
  return () => clearInterval(interval)
})
```

## 💡 使用示例

### 购物车 Store

```typescript
const cartStore = createSvelteStore({
  name: 'cart',
  initialState: {
    items: [] as Array<{ id: number; name: string; quantity: number; price: number }>
  },
  persist: true,
  actions: (update, getState) => ({
    addItem: (item: { id: number; name: string; price: number }) => {
      update(state => {
        const existing = state.items.find(i => i.id === item.id)
        if (existing) {
          return {
            ...state,
            items: state.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          }
        }
        return {
          ...state,
          items: [...state.items, { ...item, quantity: 1 }]
        }
      })
    },
    removeItem: (id: number) => {
      update(state => ({
        ...state,
        items: state.items.filter(i => i.id !== id)
      }))
    },
    clear: () => {
      update(state => ({ ...state, items: [] }))
    }
  })
})

// 派生总价
export const totalPrice = derived(
  cartStore,
  $cart => $cart.items.reduce((sum, item) => 
    sum + item.price * item.quantity, 0
  )
)
```

在组件中使用：

```svelte
<script>
  import { cartStore, totalPrice } from './stores'
</script>

<h2>购物车 ({$cartStore.items.length} 件商品)</h2>

{#each $cartStore.items as item}
  <div>
    <span>{item.name} x {item.quantity}</span>
    <button on:click={() => cartStore.actions.removeItem(item.id)}>
      删除
    </button>
  </div>
{/each}

<p>总价: ¥{$totalPrice}</p>

<button on:click={cartStore.actions.clear}>
  清空购物车
</button>
```

## 📄 许可证

MIT License © 2024



