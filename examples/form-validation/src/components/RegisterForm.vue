<script setup lang="ts">
import { onMounted } from 'vue'
import { createFormStore } from '../stores/form'
import FormField from './FormField.vue'

// 模拟异步检查用户名是否存在
const checkUsernameExists = async (username: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const existingUsernames = ['admin', 'user', 'test']
  return !existingUsernames.includes(username.toLowerCase())
}

const formStore = createFormStore('register', {
  fields: {
    username: {
      defaultValue: '',
      rules: [
        { type: 'required', message: '用户名不能为空' },
        { type: 'minLength', value: 3, message: '用户名至少3个字符' },
        { type: 'maxLength', value: 20, message: '用户名最多20个字符' },
        { type: 'pattern', value: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
        { 
          type: 'async', 
          message: '用户名已存在',
          validator: checkUsernameExists
        },
      ],
    },
    email: {
      defaultValue: '',
      rules: [
        { type: 'required', message: '邮箱不能为空' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
    },
    password: {
      defaultValue: '',
      rules: [
        { type: 'required', message: '密码不能为空' },
        { type: 'minLength', value: 8, message: '密码至少8个字符' },
        { 
          type: 'pattern', 
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
          message: '密码必须包含大小写字母和数字' 
        },
      ],
    },
    confirmPassword: {
      defaultValue: '',
      rules: [
        { type: 'required', message: '请确认密码' },
        {
          type: 'custom',
          message: '两次密码输入不一致',
          validator: (value) => value === formStore.getFieldValue('password'),
        },
      ],
    },
    phone: {
      defaultValue: '',
      rules: [
        { type: 'pattern', value: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
      ],
    },
    agree: {
      defaultValue: false,
      rules: [
        { 
          type: 'custom', 
          message: '请阅读并同意用户协议',
          validator: (value) => value === true
        },
      ],
    },
  },
  persistDraft: true, // 启用草稿持久化
})

const handleSubmit = async () => {
  const result = await formStore.submit(async (values) => {
    console.log('提交表单数据:', values)
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟成功
    alert('注册成功！')
  })

  if (result.success) {
    formStore.reset()
  }
}

const handleReset = () => {
  if (confirm('确定要重置表单吗？')) {
    formStore.reset()
  }
}

onMounted(() => {
  // 表单已自动从草稿恢复
})
</script>

<template>
  <div class="register-form">
    <div class="form-card">
      <h2>用户注册</h2>
      <p class="subtitle">请填写以下信息创建账户</p>

      <form @submit.prevent="handleSubmit">
        <FormField
          name="username"
          label="用户名"
          type="text"
          placeholder="请输入用户名"
          :store="formStore"
        />

        <FormField
          name="email"
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          :store="formStore"
        />

        <FormField
          name="password"
          label="密码"
          type="password"
          placeholder="请输入密码"
          :store="formStore"
        />

        <FormField
          name="confirmPassword"
          label="确认密码"
          type="password"
          placeholder="请再次输入密码"
          :store="formStore"
        />

        <FormField
          name="phone"
          label="手机号（可选）"
          type="tel"
          placeholder="请输入手机号"
          :store="formStore"
        />

        <div class="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              :checked="formStore.getFieldValue('agree')"
              @change="e => formStore.setFieldValue('agree', (e.target as HTMLInputElement).checked)"
              @blur="() => formStore.setFieldTouched('agree')"
            />
            <span>我已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私政策</a></span>
          </label>
          <div v-if="formStore.shouldShowError('agree')" class="error-message">
            {{ formStore.getFieldErrors('agree')[0] }}
          </div>
        </div>

        <div v-if="formStore.submitError" class="submit-error">
          {{ formStore.submitError }}
        </div>

        <div v-if="formStore.submitSuccess" class="submit-success">
          注册成功！
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-button"
            :disabled="!formStore.canSubmit"
          >
            <span v-if="formStore.isSubmitting">提交中...</span>
            <span v-else>注册</span>
          </button>

          <button 
            type="button" 
            class="reset-button"
            :disabled="formStore.isPristine"
            @click="handleReset"
          >
            重置
          </button>
        </div>

        <div class="form-status">
          <div class="status-item">
            <span class="status-label">表单状态：</span>
            <span :class="['status-badge', formStore.isValid ? 'valid' : 'invalid']">
              {{ formStore.isValid ? '✓ 有效' : '✗ 无效' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">修改状态：</span>
            <span class="status-badge">
              {{ formStore.isDirty ? '已修改' : '未修改' }}
            </span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-form {
  padding: 2rem 0;
}

.form-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-card h2 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.subtitle {
  margin: 0 0 2rem 0;
  color: #718096;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  margin-top: 0.25rem;
  cursor: pointer;
}

.checkbox-group a {
  color: #667eea;
  text-decoration: none;
}

.checkbox-group a:hover {
  text-decoration: underline;
}

.submit-error,
.submit-success {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.submit-error {
  background-color: #fed7d7;
  color: #c53030;
}

.submit-success {
  background-color: #c6f6d5;
  color: #2f855a;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.submit-button,
.reset-button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-button {
  background: #667eea;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.reset-button {
  background: #e2e8f0;
  color: #4a5568;
}

.reset-button:hover:not(:disabled) {
  background: #cbd5e0;
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-status {
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  color: #718096;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #edf2f7;
  color: #4a5568;
}

.status-badge.valid {
  background: #c6f6d5;
  color: #2f855a;
}

.status-badge.invalid {
  background: #fed7d7;
  color: #c53030;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>

