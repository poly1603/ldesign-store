# 表单验证示例

演示如何使用 @ldesign/store 实现复杂的表单管理和验证功能。

## 功能特性

- ✅ 字段级验证
- ✅ 表单级验证
- ✅ 异步验证（如检查用户名是否已存在）
- ✅ 实时验证和延迟验证
- ✅ 自定义验证规则
- ✅ 错误信息管理
- ✅ 表单状态管理（pristine/dirty/valid/invalid）
- ✅ 表单重置和恢复
- ✅ 持久化草稿

## 安装依赖

```bash
pnpm install
```

## 运行示例

```bash
pnpm dev
```

## 主要文件

- `src/stores/form.ts` - 表单管理 Store
- `src/components/RegisterForm.vue` - 注册表单组件
- `src/composables/useValidation.ts` - 验证工具函数

## 核心概念

### 表单状态

- **pristine** - 原始状态，未被修改
- **dirty** - 已修改状态
- **touched** - 已访问状态
- **valid** - 验证通过
- **invalid** - 验证失败
- **pending** - 异步验证中

### 验证规则

- **required** - 必填
- **minLength** / **maxLength** - 长度限制
- **pattern** - 正则匹配
- **email** - 邮箱格式
- **custom** - 自定义验证函数
- **async** - 异步验证

## 使用示例

查看源码了解完整实现。

