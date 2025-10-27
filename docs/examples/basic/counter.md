# 简单计数器

一个最基础的计数器示例，演示如何创建和使用一个简单的 Store。

## 类式用法

使用装饰器创建一个计数器 Store：

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  @Action()
  decrement() {
    this.count--
  }

  @Action()
  incrementBy(amount: number) {
    this.count += amount
  }

  @Getter()
  get doubleCount() {
    return this.count * 2
  }

  @Getter()
  get isPositive() {
    return this.count > 0
  }
}

export const useCounterStore = () => new CounterStore('counter')
```

## 在组件中使用

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div class="counter">
    <h2>计数器</h2>
    <div class="display">
      <p>当前值: {{ counter.count }}</p>
      <p>双倍值: {{ counter.doubleCount }}</p>
      <p>状态: {{ counter.isPositive ? '正数' : '非正数' }}</p>
    </div>
    <div class="controls">
      <button @click="counter.decrement">-1</button>
      <button @click="counter.increment">+1</button>
      <button @click="counter.incrementBy(5)">+5</button>
      <button @click="counter.incrementBy(10)">+10</button>
    </div>
  </div>
</template>

<style scoped>
.counter {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.display {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.controls {
  display: flex;
  gap: 10px;
}

.controls button {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  background-color: #42b883;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.controls button:hover {
  background-color: #3aa876;
}

.controls button:active {
  transform: translateY(1px);
}
</style>
```

## 函数式用法

使用 `createStore` 创建计数器：

```typescript
import { createStore } from '@ldesign/store'
import { ref, computed } from 'vue'

export const useCounter = createStore('counter', () => {
  // State
  const count = ref(0)

  // Actions
  const increment = () => {
    count.value++
  }

  const decrement = () => {
    count.value--
  }

  const incrementBy = (amount: number) => {
    count.value += amount
  }

  const reset = () => {
    count.value = 0
  }

  // Getters
  const doubleCount = computed(() => count.value * 2)
  const isPositive = computed(() => count.value > 0)
  const displayText = computed(() => `Count: ${count.value}`)

  return {
    // State
    count,
    
    // Actions
    increment,
    decrement,
    incrementBy,
    reset,
    
    // Getters
    doubleCount,
    isPositive,
    displayText,
  }
})
```

## 组合式用法

直接使用 Composition API：

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  const increment = () => count.value++
  const decrement = () => count.value--
  const incrementBy = (amount: number) => count.value += amount

  const doubleCount = computed(() => count.value * 2)
  const isPositive = computed(() => count.value > 0)

  return {
    count,
    increment,
    decrement,
    incrementBy,
    doubleCount,
    isPositive,
  }
})
```

## 添加持久化

为计数器添加持久化功能：

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'

class CounterStore extends BaseStore {
  constructor(storeId: string) {
    super(storeId, {
      // 启用持久化
      persist: {
        enabled: true,
        key: 'counter-store',
        storage: localStorage,
        paths: ['count'], // 只持久化 count
      }
    })
  }

  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  @Action()
  decrement() {
    this.count--
  }

  @Getter()
  get doubleCount() {
    return this.count * 2
  }
}
```

## 添加性能优化

使用缓存装饰器优化计算：

```typescript
import { BaseStore, State, Action, Getter, Cache } from '@ldesign/store'

class CounterStore extends BaseStore {
  @State({ default: 0 })
  count: number = 0

  @Action()
  increment() {
    this.count++
  }

  // 缓存计算结果，5秒内重复调用直接返回缓存
  @Cache({ ttl: 5000 })
  @Getter()
  get expensiveComputation() {
    console.log('执行复杂计算...')
    // 模拟耗时操作
    let result = 0
    for (let i = 0; i < this.count * 1000000; i++) {
      result += i
    }
    return result
  }
}
```

## 完整示例

查看[完整的可运行示例](https://github.com/ldesign/store/tree/main/examples/basic)，包含：

- 基础计数器
- 带持久化的计数器
- 带性能优化的计数器
- 多实例计数器
- 测试用例

## 下一步

- 学习[待办列表示例](./todo)
- 了解[用户管理示例](./user)
- 查看[中级示例](../intermediate)

