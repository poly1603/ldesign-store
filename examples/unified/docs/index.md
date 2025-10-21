---
layout: home

hero:
  name: "@ldesign/store"
  text: "现代化状态管理"
  tagline: "为 Vue 3 应用提供强大、灵活、类型安全的状态管理解决方案"
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started
    - theme: alt
      text: 查看示例
      link: /examples/

features:
  - icon: ⚡
    title: 高性能
    details: 内置防抖、节流、缓存等性能优化机制，确保应用流畅运行
  - icon: 🔒
    title: 类型安全
    details: 完整的 TypeScript 支持，提供强类型检查和智能代码提示
  - icon: 🎯
    title: 易于使用
    details: 简洁的 API 设计，支持多种编程风格，学习成本低
  - icon: 🏗️
    title: 企业级
    details: 支持权限管理、模块化、错误处理等企业级应用需求
  - icon: 💾
    title: 数据持久化
    details: 内置持久化支持，自动保存和恢复应用状态
  - icon: 🔄
    title: 实时同步
    details: 支持 WebSocket、SSE 等实时数据同步机制
---

## 🚀 特性亮点

### 多种编程风格支持

- **基础风格**: 简单直观的状态管理
- **函数式风格**: 纯函数和不可变状态
- **组合式风格**: 与 Vue 3 Composition API 完美集成
- **装饰器风格**: 优雅的面向对象编程体验

### 性能优化

- **智能缓存**: 自动缓存计算结果，避免重复计算
- **防抖节流**: 内置防抖和节流机制，优化用户交互
- **懒加载**: 按需加载状态模块，减少初始化时间
- **内存管理**: 智能垃圾回收，防止内存泄漏

### 企业级功能

- **权限管理**: 基于角色的访问控制 (RBAC)
- **模块化**: 动态加载和卸载功能模块
- **错误处理**: 完善的错误捕获和恢复机制
- **审计日志**: 详细的操作记录和追踪

### 开发体验

- **热重载**: 开发时状态保持，提高开发效率
- **调试工具**: 集成 Vue DevTools，可视化状态变化
- **类型提示**: 完整的 TypeScript 支持
- **测试友好**: 易于编写和维护单元测试

## 📖 快速预览

```typescript
// 基础用法
const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})

// 装饰器风格
@Store('user')
class UserStore {
  @State users: User[] = []
  
  @Action
  async fetchUsers() {
    this.users = await api.getUsers()
  }
  
  @Getter
  get activeUsers() {
    return this.users.filter(u => u.active)
  }
}

// 性能优化
const useProductStore = defineStore('product', {
  state: () => ({ products: [] }),
  
  actions: {
    @Debounced(300)
    searchProducts(keyword: string) {
      // 防抖搜索
    },
    
    @Cached
    expensiveCalculation(data: any[]) {
      // 缓存计算结果
    }
  }
})
```

## 🎯 适用场景

- **中小型应用**: 简单易用的状态管理
- **大型企业应用**: 完整的企业级功能支持
- **高性能应用**: 内置性能优化机制
- **实时应用**: WebSocket 和 SSE 支持
- **离线应用**: 数据持久化和同步

## 🤝 社区

- [GitHub 仓库](https://github.com/ldesign/store)
- [问题反馈](https://github.com/ldesign/store/issues)
- [讨论区](https://github.com/ldesign/store/discussions)

## 📄 许可证

[MIT License](https://github.com/ldesign/store/blob/main/LICENSE)
