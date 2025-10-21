# 性能测试文档

本目录包含了完整的性能测试套件，用于监控和验证 Vue 3 + TypeScript + Pinia 项目的性能表现。

## 📁 文件结构

```
tests/performance/
├── setup.ts                           # 性能测试基础工具和配置
├── store-performance.test.ts           # Store 状态更新性能测试
├── rendering-performance.test.ts       # 大数据量渲染性能测试
├── debounce-throttle-performance.test.ts # 防抖和节流功能性能测试
├── cache-performance.test.ts           # 缓存机制性能测试
├── benchmark.test.ts                   # 性能基准测试和回归检测
├── performance-baseline.json           # 性能基准数据（自动生成）
├── results.json                        # 测试结果（自动生成）
└── README.md                          # 本文档
```

## 🚀 快速开始

### 运行所有性能测试

```bash
# 运行所有性能测试
pnpm test:performance

# 使用 UI 界面运行性能测试
pnpm test:performance:ui

# 运行基准测试
pnpm test:benchmark

# 建立性能基准线
pnpm test:benchmark:baseline
```

### 运行特定测试

```bash
# Store 性能测试
vitest tests/performance/store-performance.test.ts

# 渲染性能测试
vitest tests/performance/rendering-performance.test.ts

# 防抖节流性能测试
vitest tests/performance/debounce-throttle-performance.test.ts

# 缓存性能测试
vitest tests/performance/cache-performance.test.ts
```

## 📊 测试类型详解

### 1. Store 状态更新性能测试 (`store-performance.test.ts`)

测试 Pinia Store 的各种操作性能：

- **单个状态更新性能**: 测试单个产品的增删改查操作
- **批量状态更新性能**: 测试大量数据的批量操作
- **深层对象更新性能**: 测试嵌套对象的更新性能
- **跨 Store 操作性能**: 测试多个 Store 同时操作的性能

**性能指标**:
- 操作频率 (ops/sec): 每秒可执行的操作次数
- 平均执行时间 (ms): 单次操作的平均耗时
- 内存使用量 (MB): 操作过程中的内存消耗

### 2. 大数据量渲染性能测试 (`rendering-performance.test.ts`)

测试 Vue 组件在处理大量数据时的渲染性能：

- **大列表渲染性能**: 测试渲染 1000+ 列表项的性能
- **虚拟滚动性能**: 测试虚拟滚动组件的性能优化效果
- **动态更新性能**: 测试数据变化时的重渲染性能
- **组件生命周期性能**: 测试组件挂载和卸载的性能

**性能指标**:
- 首次渲染时间 (ms): 组件首次挂载的耗时
- 更新渲染时间 (ms): 数据更新后的重渲染耗时
- 内存占用 (MB): 渲染过程中的内存使用

### 3. 防抖和节流功能性能测试 (`debounce-throttle-performance.test.ts`)

测试防抖和节流函数的性能和正确性：

- **防抖函数性能**: 测试不同延迟时间的防抖性能
- **节流函数性能**: 测试不同间隔时间的节流性能
- **高频调用场景**: 测试极高频调用下的性能表现
- **内存泄漏检测**: 检测定时器清理是否正确

**性能指标**:
- 函数创建性能 (ops/sec): 创建防抖/节流函数的速度
- 调用执行性能 (ops/sec): 函数调用的执行速度
- 内存使用稳定性: 长时间运行后的内存变化

### 4. 缓存机制性能测试 (`cache-performance.test.ts`)

测试缓存系统的性能和命中率：

- **缓存读写性能**: 测试缓存的基本读写操作性能
- **缓存命中率测试**: 验证缓存的命中率和性能提升
- **LRU 缓存性能**: 测试 LRU 淘汰策略的性能
- **内存使用优化**: 测试缓存的内存使用效率

**性能指标**:
- 缓存命中率 (%): 缓存命中的百分比
- 读写速度 (ops/sec): 缓存读写操作的速度
- 内存效率: 缓存数据的内存使用效率

### 5. 性能基准测试和回归检测 (`benchmark.test.ts`)

建立性能基准线并检测性能回归：

- **建立性能基准**: 为关键功能建立性能基准数据
- **性能回归检测**: 对比当前性能与基准性能
- **性能报告生成**: 生成详细的性能分析报告
- **持续性能监控**: 监控关键性能指标的变化

**功能特性**:
- 自动保存和加载基准数据
- 智能检测性能回归（默认阈值 20%）
- 生成 Markdown 格式的性能报告
- 支持多环境性能对比

## 🛠️ 性能测试工具

### PerformanceBenchmark 类

基于 Benchmark.js 的性能测试工具：

```typescript
import { PerformanceBenchmark } from './setup'

const benchmark = new PerformanceBenchmark('测试名称')

benchmark
  .add('测试用例1', () => {
    // 测试代码
  })
  .add('测试用例2', () => {
    // 测试代码
  })

const results = await benchmark.run()
```

### 性能测量工具

```typescript
import { measureTime, measureTimeAsync, getMemoryUsage } from './setup'

// 同步函数性能测量
const { result, time } = measureTime(() => {
  return expensiveFunction()
})

// 异步函数性能测量
const { result, time } = await measureTimeAsync(async () => {
  return await expensiveAsyncFunction()
})

// 内存使用监控
const memory = getMemoryUsage()
console.log(`内存使用: ${memory.used / 1024 / 1024} MB`)
```

### 性能监控器

```typescript
import { performanceMonitor } from './setup'

// 标记时间点
performanceMonitor.mark('operation-start')

// 执行操作
doSomething()

// 标记结束时间
performanceMonitor.mark('operation-end')

// 测量时间差
const duration = performanceMonitor.measure('operation', 'operation-start', 'operation-end')
```

## 📈 性能基准和阈值

### 推荐性能基准

| 操作类型 | 最低要求 | 推荐值 | 优秀值 |
|---------|---------|--------|--------|
| Store 单项操作 | 1,000 ops/sec | 5,000 ops/sec | 10,000+ ops/sec |
| 大列表渲染 (1000项) | 5 ops/sec | 10 ops/sec | 20+ ops/sec |
| 防抖/节流调用 | 10,000 ops/sec | 50,000 ops/sec | 100,000+ ops/sec |
| 缓存读取 | 10,000 ops/sec | 50,000 ops/sec | 100,000+ ops/sec |
| 缓存写入 | 1,000 ops/sec | 5,000 ops/sec | 10,000+ ops/sec |

### 内存使用阈值

| 操作类型 | 内存增长限制 |
|---------|-------------|
| 1000项数据处理 | < 10 MB |
| 大列表渲染 | < 50 MB |
| 缓存操作 | < 20 MB |
| 长时间运行 | 无明显内存泄漏 |

## 🔧 配置和自定义

### 修改性能阈值

在 `benchmark.test.ts` 中修改回归检测阈值：

```typescript
const benchmarkManager = new PerformanceBenchmarkManager(
  'performance-baseline.json', 
  0.2 // 20% 性能下降阈值
)
```

### 添加自定义测试

1. 在相应的测试文件中添加新的测试用例
2. 使用 `PerformanceBenchmark` 类创建基准测试
3. 设置合适的性能断言
4. 更新基准数据

### 环境配置

性能测试支持以下环境变量：

```bash
# 设置测试超时时间（毫秒）
VITEST_TIMEOUT=60000

# 启用详细输出
VITEST_REPORTER=verbose

# 设置并发数
VITEST_THREADS=1
```

## 📋 最佳实践

### 1. 测试隔离

- 每个测试用例都应该独立运行
- 使用 `beforeEach` 清理状态
- 避免测试之间的相互影响

### 2. 性能断言

- 设置合理的性能期望值
- 考虑不同环境的性能差异
- 使用相对比较而非绝对值

### 3. 内存监控

- 定期检查内存使用情况
- 及时发现内存泄漏
- 验证资源清理的正确性

### 4. 持续监控

- 定期运行性能测试
- 建立性能趋势监控
- 及时发现性能回归

## 🐛 故障排除

### 常见问题

1. **测试超时**: 增加 `testTimeout` 配置
2. **内存不足**: 减少测试数据量或增加系统内存
3. **性能波动**: 多次运行取平均值，排除环境干扰
4. **基准数据缺失**: 运行 `pnpm test:benchmark:baseline` 建立基准

### 调试技巧

1. 使用 `console.log` 输出中间结果
2. 利用 `performanceMonitor` 定位性能瓶颈
3. 检查内存使用趋势图
4. 对比不同版本的性能数据

## 📚 相关资源

- [Benchmark.js 文档](https://benchmarkjs.com/)
- [Vitest 性能测试指南](https://vitest.dev/guide/performance.html)
- [Vue 3 性能优化最佳实践](https://vuejs.org/guide/best-practices/performance.html)
- [Pinia 性能优化](https://pinia.vuejs.org/core-concepts/state.html#performance)
