# @ldesign/store-angular

🅰️ Angular adapter for @ldesign/store - 基于 @ngrx/signals 的增强状态管理。

## ✨ 特性

- 🚀 **基于 @ngrx/signals**: Angular 官方轻量级状态管理
- 💾 **自动持久化**: 状态自动保存
- 🗄️ **内置缓存**: LRU 缓存优化性能
- 📊 **性能监控**: 实时性能指标
- 💉 **依赖注入**: 兼容 Angular DI 系统

## 📦 安装

```bash
pnpm add @ldesign/store-angular @angular/core @ngrx/signals
```

## 🚀 快速开始

```typescript
import { Injectable } from '@angular/core'
import { createAngularStore } from '@ldesign/store-angular'

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  private store = createAngularStore({
    name: 'user',
    initialState: {
      name: '',
      age: 0
    },
    actions: (setState, getState) => ({
      setName: (name: string) => setState({ name }),
      incrementAge: () => setState({ age: getState().age + 1 })
    }),
    persist: true
  })
  
  state = this.store.state
  actions = this.store.actions
}

// 在组件中使用
@Component({
  selector: 'app-user-profile',
  template: `
    <h1>{{ store.state() .name }}</h1>
    <button (click)="store.actions.setName('张三')">Set Name</button>
  `
})
export class UserProfileComponent {
  constructor(public store: UserStoreService) {}
}
```

## 📄 许可证

MIT License © 2024



