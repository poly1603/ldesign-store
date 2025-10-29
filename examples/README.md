# @ldesign/store 示例项目

演示各框架适配器的使用。

## 📁 示例列表

| 框架 | 目录 | 端口 | 状态 |
|---|---|---|---|
| Vue 3 | [vue-example](./vue-example) | 3000 | ✅ |
| React 18 | [react-example](./react-example) | 3001 | ✅ |
| Solid | solid-example | 3002 | 📅 待创建 |
| Svelte | svelte-example | 3003 | 📅 待创建 |

## 🚀 运行示例

### Vue 3 示例

```bash
cd vue-example
pnpm install
pnpm dev
```

访问 http://localhost:3000

### React 18 示例

```bash
cd react-example
pnpm install
pnpm dev
```

访问 http://localhost:3001

## 📚 功能演示

所有示例都演示了以下功能：

### 1. 基础状态管理
- 创建 Store
- 读取和更新状态
- Actions 调用

### 2. 自动持久化
- 状态自动保存到 localStorage
- 刷新页面后自动恢复
- 清除持久化数据

### 3. LRU 缓存
- 缓存 API 调用结果
- 自动过期管理
- 缓存统计信息（命中率等）

### 4. 性能监控
- 测量函数执行时间
- 查看性能指标
- 平均/最小/最大耗时统计

## 💡 学习路径

1. **先看 Vue 示例** - 最完整的功能演示
2. **再看 React 示例** - 对比不同框架的使用方式
3. **查看源码** - 了解如何集成 @ldesign/store

## 🔧 示例代码结构

每个示例都包含：

```
<framework>-example/
├── src/
│   ├── stores/          # Store 定义
│   │   └── user.ts      # 用户 Store + 数据 Store
│   ├── App.<ext>        # 主组件
│   └── main.<ext>       # 入口文件
├── index.html           # HTML 模板
├── package.json         # 依赖配置
├── vite.config.ts       # Vite 配置
└── README.md            # 说明文档
```

## 📝 示例对比

### 创建 Store

**Vue**:
```typescript
const useUserStore = createVueStore({
  id: 'user',
  state: () => ({ name: '', age: 0 }),
  actions: {
    setName(name: string) { this.name = name }
  },
  persist: true
})
```

**React**:
```typescript
const useUserStore = createReactStore({
  name: 'user',
  initialState: { name: '', age: 0 },
  actions: (set) => ({
    setName: (name: string) => set({ name })
  }),
  persist: true
})
```

### 使用 Store

**Vue**:
```vue
<template>
  <h1>{{ store.name }}</h1>
  <button @click="store.setName('张三')">Set Name</button>
</template>

<script setup>
const store = useUserStore()
</script>
```

**React**:
```tsx
function App() {
  const { name, setName } = useUserStore()
  
  return (
    <>
      <h1>{name}</h1>
      <button onClick={() => setName('张三')}>Set Name</button>
    </>
  )
}
```

## 🎯 关键功能展示

### 1. 持久化

所有示例都演示了自动持久化：
- 修改状态 → 自动保存到 localStorage
- 刷新页面 → 自动恢复状态
- 点击重置 → 清除持久化数据

### 2. 缓存

数据 Store 演示了智能缓存：
- 第一次请求 → 从 API 获取（慢）
- 第二次请求 → 从缓存读取（快）
- 查看统计 → 命中率、总请求数等

### 3. 性能监控

性能测试按钮演示了：
- 测量异步函数执行时间
- 查看平均/最小/最大耗时
- 统计执行次数

## 🤝 贡献示例

欢迎为其他框架贡献示例项目！

提交示例时请确保：
- ✅ 包含完整的功能演示
- ✅ 有详细的 README
- ✅ 代码注释清晰
- ✅ 可直接运行

---

**探索示例，了解 @ldesign/store 的强大功能！** 🚀
