# 构建指南

## 📦 包列表

共 **15 个包**：

1. `@ldesign/store-core` - 核心包
2. `@ldesign/store-vue` - Vue 3
3. `@ldesign/store-react` - React 18
4. `@ldesign/store-solid` - Solid
5. `@ldesign/store-svelte` - Svelte
6. `@ldesign/store-angular` - Angular
7. `@ldesign/store-alpine` - Alpine.js
8. `@ldesign/store-preact` - Preact
9. `@ldesign/store-qwik` - Qwik
10. `@ldesign/store-astro` - Astro
11. `@ldesign/store-lit` - Lit
12. `@ldesign/store-nextjs` - Next.js
13. `@ldesign/store-nuxtjs` - Nuxt.js
14. `@ldesign/store-remix` - Remix
15. `@ldesign/store-sveltekit` - SvelteKit

## 🔨 快速构建

### 方法 1: 使用 PowerShell 脚本

创建 `build-all.ps1`:

```powershell
# 进入 store 目录
cd packages/store

# 包列表
$packages = @(
  "core",
  "vue",
  "react",
  "solid",
  "svelte",
  "angular",
  "alpine",
  "preact",
  "qwik",
  "astro",
  "lit",
  "nextjs",
  "nuxtjs",
  "remix",
  "sveltekit"
)

# 安装和构建每个包
foreach ($pkg in $packages) {
  Write-Host "Building $pkg..." -ForegroundColor Green
  cd "packages/$pkg"
  pnpm install
  pnpm build
  cd ../..
}

Write-Host "All packages built successfully!" -ForegroundColor Cyan
```

运行：
```bash
pwsh build-all.ps1
```

### 方法 2: 使用 pnpm workspace

```bash
cd packages/store

# 安装所有依赖
pnpm install -r

# 构建所有包
pnpm -r --filter "./packages/*" build
```

### 方法 3: 逐个构建

```bash
cd packages/store

# 核心包
cd packages/core && pnpm install && pnpm build && cd ../..

# Vue
cd packages/vue && pnpm install && pnpm build && cd ../..

# React
cd packages/react && pnpm install && pnpm build && cd ../..

# Solid
cd packages/solid && pnpm install && pnpm build && cd ../..

# Svelte
cd packages/svelte && pnpm install && pnpm build && cd ../..

# Angular
cd packages/angular && pnpm install && pnpm build && cd ../..

# Alpine
cd packages/alpine && pnpm install && pnpm build && cd ../..

# Preact
cd packages/preact && pnpm install && pnpm build && cd ../..

# Qwik
cd packages/qwik && pnpm install && pnpm build && cd ../..

# Astro
cd packages/astro && pnpm install && pnpm build && cd ../..

# Lit
cd packages/lit && pnpm install && pnpm build && cd ../..

# Next.js
cd packages/nextjs && pnpm install && pnpm build && cd ../..

# Nuxt.js
cd packages/nuxtjs && pnpm install && pnpm build && cd ../..

# Remix
cd packages/remix && pnpm install && pnpm build && cd ../..

# SvelteKit
cd packages/sveltekit && pnpm install && pnpm build && cd ../..
```

## 🧪 运行测试

```bash
cd packages/store

# 运行所有包的测试
pnpm -r test

# 运行特定包的测试
cd packages/core && pnpm test
cd packages/vue && pnpm test
# ...
```

## 🔍 类型检查

```bash
# 检查所有包的类型
pnpm -r type-check

# 检查特定包
cd packages/core && pnpm type-check
```

## 🎨 Lint

```bash
# Lint 所有包
pnpm -r lint:check

# 自动修复
pnpm -r lint
```

## 📦 构建产物

每个包构建后会生成：

```
dist/
├── index.js       # ESM 格式
├── index.cjs      # CommonJS 格式
├── index.d.ts     # TypeScript 声明
└── *.map          # Source Maps
```

## 🚀 发布准备

```bash
# 1. 构建所有包
pnpm -r build

# 2. 运行所有测试
pnpm -r test:run

# 3. Lint 检查
pnpm -r lint:check

# 4. 类型检查
pnpm -r type-check

# 5. 验证构建产物
pnpm -r build:validate
```

## 📊 构建统计

预计构建时间（单核）：
- 核心包: ~10-15 秒
- 每个适配器: ~5-8 秒
- **总计**: ~2-3 分钟（串行）

使用 pnpm -r 并行构建：
- **总计**: ~30-45 秒

## ⚠️ 常见问题

### 1. 依赖安装失败

```bash
# 清理 node_modules
pnpm -r exec rm -rf node_modules

# 重新安装
pnpm install -r
```

### 2. 构建失败

```bash
# 清理构建产物
pnpm -r clean

# 重新构建
pnpm -r build
```

### 3. 类型错误

```bash
# 确保 TypeScript 版本一致
pnpm -r add -D typescript@^5.7.3
```

## 📝 构建清单

- [ ] 核心包构建成功
- [ ] Vue 适配器构建成功
- [ ] React 适配器构建成功
- [ ] Solid 适配器构建成功
- [ ] Svelte 适配器构建成功
- [ ] Angular 适配器构建成功
- [ ] Alpine 适配器构建成功
- [ ] Preact 适配器构建成功
- [ ] Qwik 适配器构建成功
- [ ] Astro 适配器构建成功
- [ ] Lit 适配器构建成功
- [ ] Next.js 适配器构建成功
- [ ] Nuxt.js 适配器构建成功
- [ ] Remix 适配器构建成功
- [ ] SvelteKit 适配器构建成功
- [ ] 所有测试通过
- [ ] 类型检查通过
- [ ] Lint 检查通过

---

**准备发布！** 🚀




