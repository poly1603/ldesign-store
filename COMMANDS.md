# 常用命令参考

## 🔨 构建命令

### 构建所有包（推荐）

```bash
cd packages/store

# 方法 1: 使用 PowerShell 脚本（最简单）
.\build-all.ps1

# 方法 2: 使用 pnpm workspace
pnpm -r install
pnpm -r build

# 方法 3: 逐个构建
cd packages/core && pnpm install && pnpm build && cd ../..
cd packages/vue && pnpm install && pnpm build && cd../..
# ... 重复所有包
```

### 构建单个包

```bash
cd packages/store/packages/<package-name>
pnpm install
pnpm build
```

例如：
```bash
# 构建核心包
cd packages/store/packages/core
pnpm install && pnpm build

# 构建 Vue 适配器
cd packages/store/packages/vue
pnpm install && pnpm build
```

## 🧪 测试命令

```bash
# 运行所有包的测试
pnpm -r test

# 运行单个包的测试
cd packages/<package-name>
pnpm test

# 运行测试并查看覆盖率
pnpm test:coverage
```

## 🎨 Lint 命令

```bash
# 检查所有包
pnpm -r lint:check

# 自动修复
pnpm -r lint

# 单个包
cd packages/<package-name>
pnpm lint
```

## 🔍 类型检查

```bash
# 检查所有包
pnpm -r type-check

# 单个包
cd packages/<package-name>
pnpm type-check
```

## 🧹 清理命令

```bash
# 清理所有构建产物
pnpm -r clean

# 清理 node_modules
pnpm -r exec rm -rf node_modules

# 重新安装
pnpm install -r
```

## 📦 包管理

```bash
# 安装所有依赖
pnpm install -r

# 更新依赖
pnpm update -r

# 添加依赖到特定包
cd packages/<package-name>
pnpm add <dependency>
```

## 🚀 开发命令

```bash
# 开发模式（watch）
cd packages/<package-name>
pnpm dev

# 同时开发多个包
# 在不同终端窗口运行
pnpm dev
```

## 📊 信息命令

```bash
# 查看所有包
pnpm list -r

# 查看包依赖
cd packages/<package-name>
pnpm list

# 查看构建产物
ls dist/
```

## 🎯 常用工作流

### 开发新功能

```bash
# 1. 进入对应包
cd packages/<package-name>

# 2. 开启 watch 模式
pnpm dev

# 3. 修改代码...

# 4. 测试
pnpm test

# 5. Lint 检查
pnpm lint

# 6. 构建
pnpm build
```

### 发布前检查

```bash
# 1. 构建所有包
pnpm -r build

# 2. 运行所有测试
pnpm -r test:run

# 3. Lint 检查
pnpm -r lint:check

# 4. 类型检查
pnpm -r type-check
```

## 📚 快速链接

| 命令 | 说明 |
|---|---|
| `pnpm -r build` | 构建所有包 |
| `pnpm -r test` | 运行所有测试 |
| `pnpm -r lint` | Lint 所有包 |
| `pnpm -r clean` | 清理所有产物 |
| `.\build-all.ps1` | PowerShell 构建脚本 |

---

**提示**: 使用 `pnpm -r` 在所有包中运行命令。



