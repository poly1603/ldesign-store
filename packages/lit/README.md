# @ldesign/store-lit

💡 Lit adapter for @ldesign/store - 基于 Reactive Controllers 的增强状态管理。

## ✨ 特性

- 🚀 **基于 Reactive Controllers**: Lit 官方模式
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- 🎯 **Web Components**: 标准 Web 组件支持

## 📦 安装

```bash
pnpm add @ldesign/store-lit lit
```

## 🚀 快速开始

```typescript
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createLitStore } from '@ldesign/store-lit'

@customElement('user-profile')
export class UserProfile extends LitElement {
  private store = createLitStore(this, {
    name: 'user',
    initialState: {
      name: '',
      age: 0
    },
    actions: (setState) => ({
      setName: (name: string) => setState({ name }),
      incrementAge: () => setState({ age: this.store.state.age + 1 })
    }),
    persist: true
  })

  render() {
    return html`
      <h1>${this.store.state.name}</h1>
      <button @click=${() => this.store.actions.setName('张三')}>
        Set Name
      </button>
    `
  }
}
```

## 📄 许可证

MIT License © 2024




