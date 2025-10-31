# @ldesign/store-core

🔧 Framework-agnostic core for @ldesign/store - 提供缓存、持久化、装饰器和性能监控等核心功能。

## ✨ 特性

- 🚀 **高性能缓存**: LRU 缓存，O(1) 时间复杂度
- 💾 **持久化支持**: 灵活的存储适配器
- 🎨 **装饰器系统**: 元数据注册，框架无关
- 📊 **性能监控**: 实时性能指标
- 🔔 **订阅系统**: 优先级桶优化
- 🛠️ **工具函数**: 完善的辅助工具

## 📦 安装

```bash
pnpm add @ldesign/store-core
```

## 🚀 快速开始

### LRU 缓存

```typescript
import { LRUCache } from '@ldesign/store-core'

const cache = new LRUCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000,
  enableStats: true
})

cache.set('user:1', { id: 1, name: '张三' })
const user = cache.get('user:1')

// 查看统计
console.log(cache.getStats())
```

### 订阅系统

```typescript
import { SubscriptionManager } from '@ldesign/store-core'

const manager = new SubscriptionManager()

const unsubscribe = manager.subscribe('update', (data) => {
  console.log('Updated:', data)
}, 10) // 优先级 10

manager.notify('update', { value: 42 })

unsubscribe()
```

### 装饰器

```typescript
import { State, Action, Getter } from '@ldesign/store-core'

class Store {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  @Getter({ cache: true })
  get doubleCount() {
    return this.count * 2
  }
}
```

### 性能监控

```typescript
import { PerformanceMonitor } from '@ldesign/store-core'

const monitor = new PerformanceMonitor()

const result = monitor.measure('fetchData', async () => {
  const data = await fetch('/api/data')
  return data.json()
})

console.log(monitor.getMetrics('fetchData'))
```

## 📚 API 文档

### LRUCache

LRU 缓存管理器，使用双向链表 + Map 实现 O(1) 时间复杂度。

**选项**:
- `maxSize`: 最大缓存数量（默认 100）
- `defaultTTL`: 默认过期时间（默认 5分钟）
- `cleanupInterval`: 清理间隔（默认 1分钟）
- `enableStats`: 是否启用统计（默认 false）

**方法**:
- `set(key, value, ttl?)`: 设置缓存
- `get(key)`: 获取缓存
- `has(key)`: 检查是否存在
- `delete(key)`: 删除缓存
- `clear()`: 清空所有缓存
- `getStats()`: 获取统计信息
- `dispose()`: 销毁缓存

### SubscriptionManager

订阅管理器，使用优先级桶优化性能。

**方法**:
- `subscribe(event, callback, priority?)`: 订阅事件
- `unsubscribe(event, callback)`: 取消订阅
- `notify(event, data)`: 通知订阅者
- `clear()`: 清空所有订阅

### PerformanceMonitor

性能监控器，记录操作执行时间。

**方法**:
- `measure(name, fn)`: 测量函数执行时间
- `getMetrics(name)`: 获取性能指标
- `getAllMetrics()`: 获取所有指标
- `reset(name?)`: 重置指标

## 📄 许可证

MIT License © 2024




