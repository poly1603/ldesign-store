# @ldesign/store 文档

这是 @ldesign/store 的官方文档站点，使用 VitePress 构建。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

文档站点将在 `http://localhost:5173` 启动。

### 构建文档

```bash
pnpm build
```

构建后的文件将输出到 `.vitepress/dist` 目录。

### 预览构建结果

```bash
pnpm preview
```

## 📁 文档结构

```
docs/
├── .vitepress/           # VitePress 配置
│   ├── components/       # 交互式组件
│   ├── theme/           # 自定义主题
│   └── config.ts        # 站点配置
├── guide/               # 使用指南
├── api/                 # API 文档
├── examples/            # 示例代码
└── index.md            # 首页
```

## 🎨 交互式组件

文档中包含了多个交互式组件来演示 @ldesign/store 的功能：

- **CounterDemo**: 基础计数器示例
- **TodoDemo**: 待办事项管理示例
- **ShoppingCartDemo**: 购物车功能示例

这些组件位于 `.vitepress/components/` 目录中。

## 📝 编写文档

### 添加新页面

1. 在相应目录下创建 `.md` 文件
2. 在 `.vitepress/config.ts` 中添加导航配置
3. 使用 Markdown 语法编写内容

### 使用交互式组件

在 Markdown 文件中直接使用组件：

```markdown
# 示例标题

这是一个计数器示例：

<CounterDemo />

这是一个待办事项示例：

<TodoDemo />
```

### 代码高亮

支持多种语言的代码高亮：

```typescript
// TypeScript 代码
import { Action, BaseStore, State } from '@ldesign/store'

class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }
}
```

```vue
<!-- Vue 组件 -->
<script setup lang="ts">
import { CounterStore } from '@/stores/counter'

const store = new CounterStore('counter')
</script>

<template>
  <div>{{ store.count }}</div>
</template>
```

## 🎯 文档特性

### 响应式设计

文档支持桌面端和移动端访问，自动适配不同屏幕尺寸。

### 深色模式

支持明暗主题切换，提供更好的阅读体验。

### 搜索功能

内置全文搜索功能，快速查找相关内容。

### 代码复制

代码块支持一键复制功能。

## 🔧 自定义配置

### 主题配置

在 `.vitepress/theme/custom.css` 中自定义样式：

```css
:root {
  --vp-c-brand-1: #3182ce;
  --vp-c-brand-2: #2c5aa0;
}
```

### 组件注册

在 `.vitepress/theme/index.ts` 中注册全局组件：

```typescript
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyComponent', MyComponent)
  },
}
```

## 📚 内容指南

### 指南文档 (guide/)

- **安装指南**: 如何安装和配置
- **基本概念**: 核心概念介绍
- **使用方式**: 不同的使用模式
- **最佳实践**: 开发建议和技巧

### API 文档 (api/)

- **核心 API**: 基础 API 参考
- **装饰器 API**: 装饰器详细说明
- **Hook API**: 函数式 API
- **Vue 集成**: Vue 特定功能
- **工具函数**: 辅助工具
- **类型定义**: TypeScript 类型

### 示例文档 (examples/)

- **基础示例**: 简单用法演示
- **中级示例**: 复杂场景应用
- **高级示例**: 高级技巧展示
- **实战项目**: 完整项目案例

## 🤝 贡献指南

### 报告问题

如果发现文档中的错误或不清楚的地方，请：

1. 在 GitHub 上创建 Issue
2. 描述具体问题和建议
3. 提供相关的页面链接

### 改进文档

欢迎提交 Pull Request 来改进文档：

1. Fork 项目
2. 创建功能分支
3. 修改文档内容
4. 提交 Pull Request

### 添加示例

如果你有好的使用示例，欢迎贡献：

1. 在 `examples/` 目录下添加示例
2. 确保代码可以正常运行
3. 添加详细的说明文档
4. 提交 Pull Request

## 📄 许可证

本文档遵循 MIT 许可证。

## 🔗 相关链接

- [GitHub 仓库](https://github.com/ldesign/store)
- [NPM 包](https://www.npmjs.com/package/@ldesign/store)
- [问题反馈](https://github.com/ldesign/store/issues)
- [讨论区](https://github.com/ldesign/store/discussions)
