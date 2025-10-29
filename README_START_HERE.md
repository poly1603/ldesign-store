# 🎊 从这里开始 - @ldesign/store

## 欢迎！

你好！这是 **@ldesign/store** - 一个支持 14+ 框架的统一状态管理解决方案。

## ⚡ 3 步开始使用

### 1️⃣ 选择你的框架

我使用的是: ________________

→ 查看 [USER_GUIDE.md](./USER_GUIDE.md) 第一部分找到对应的包名

### 2️⃣ 安装

```bash
pnpm add @ldesign/store-<你的框架>
```

### 3️⃣ 创建 Store

复制对应框架的示例代码开始使用！

## 📚 重要文档

### 新用户必读 ⭐

1. **[USER_GUIDE.md](./USER_GUIDE.md)**
   - 5 分钟快速上手
   - 常见场景示例
   - FAQ

### 了解项目 ⭐⭐

2. **[PROJECT_COMPLETE_SUMMARY.md](./PROJECT_COMPLETE_SUMMARY.md)**
   - 项目完整介绍
   - 所有包列表
   - 技术亮点

3. **[API_COMPARISON.md](./API_COMPARISON.md)**
   - 所有框架 API 对比
   - 帮助选择合适的包

### 开发者文档

4. **[BUILD_GUIDE.md](./BUILD_GUIDE.md)** - 如何构建
5. **[FILE_INDEX.md](./FILE_INDEX.md)** - 文件清单
6. **[INDEX.md](./INDEX.md)** - 文档索引

## 🎯 快速查找

**我想...**

- ✨ **快速开始** → [USER_GUIDE.md](./USER_GUIDE.md)
- 📖 **了解项目** → [PROJECT_COMPLETE_SUMMARY.md](./PROJECT_COMPLETE_SUMMARY.md)
- 🔍 **对比 API** → [API_COMPARISON.md](./API_COMPARISON.md)
- 🔨 **构建项目** → [BUILD_GUIDE.md](./BUILD_GUIDE.md)
- 📊 **查看统计** → [ACHIEVEMENT_REPORT.md](./ACHIEVEMENT_REPORT.md)

## 🎁 特色功能

所有框架都提供：

- ✅ **自动持久化** - 刷新页面数据不丢失
- ✅ **智能缓存** - LRU 缓存优化性能
- ✅ **性能监控** - 实时性能指标
- ✅ **完整类型** - TypeScript 全支持

## 🚀 支持的框架

✅ Vue 3 | ✅ React 18 | ✅ Solid | ✅ Svelte
✅ Angular | ✅ Alpine.js | ✅ Preact | ✅ Qwik
✅ Astro | ✅ Lit | ✅ Next.js | ✅ Nuxt.js
✅ Remix | ✅ SvelteKit

**共 14+ 框架！**

## 💡 快速示例

```typescript
// 创建 Store（所有框架类似）
const store = createStore({
  name: 'user',
  initialState: { name: '', age: 0 },
  persist: true, // 自动持久化
  cache: { maxSize: 100 } // 内置缓存
})

// 使用
store.setName('张三')
console.log(store.name) // '张三'

// 刷新页面，数据自动恢复！
```

---

## 🎊 开始你的旅程！

1. 阅读 [USER_GUIDE.md](./USER_GUIDE.md)
2. 选择框架包
3. 开始coding！

**祝你使用愉快！** 🚀

---

<div align="center">

**@ldesign/store**

一个库，所有框架！

**Made with ❤️**

</div>



