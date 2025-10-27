# 用户管理

演示如何管理用户状态，包括用户信息、认证状态和用户操作。

## Store 定义

```typescript
import { BaseStore, State, Action, Getter, Cache } from '@ldesign/store'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  permissions: string[]
}

interface UserState {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

class UserStore extends BaseStore<UserState> {
  constructor() {
    super('user', {
      persist: {
        enabled: true,
        key: 'user-store',
        storage: localStorage,
        paths: ['currentUser', 'isAuthenticated'],
      }
    })
  }

  @State({ default: null })
  currentUser: User | null = null

  @State({ default: false })
  isAuthenticated: boolean = false

  @State({ default: false })
  isLoading: boolean = false

  @State({ default: null })
  error: string | null = null

  // Actions
  @Action()
  async login(username: string, password: string) {
    this.isLoading = true
    this.error = null

    try {
      // 模拟 API 调用
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('登录失败')
      }

      const data = await response.json()
      this.currentUser = data.user
      this.isAuthenticated = true
      
      return { success: true }
    } catch (err) {
      this.error = err instanceof Error ? err.message : '未知错误'
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  @Action()
  logout() {
    this.currentUser = null
    this.isAuthenticated = false
    this.error = null
  }

  @Action()
  async updateProfile(updates: Partial<User>) {
    if (!this.currentUser) {
      throw new Error('未登录')
    }

    this.isLoading = true
    
    try {
      const response = await fetch(`/api/users/${this.currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      this.currentUser = { ...this.currentUser, ...data }
      
      return { success: true }
    } catch (err) {
      this.error = err instanceof Error ? err.message : '更新失败'
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  @Action()
  async changeAvatar(file: File) {
    if (!this.currentUser) {
      throw new Error('未登录')
    }

    this.isLoading = true

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch(`/api/users/${this.currentUser.id}/avatar`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      this.currentUser.avatar = data.avatarUrl
      
      return { success: true, url: data.avatarUrl }
    } catch (err) {
      this.error = err instanceof Error ? err.message : '上传失败'
      return { success: false, error: this.error }
    } finally {
      this.isLoading = false
    }
  }

  // Getters
  @Getter()
  get userDisplayName(): string {
    return this.currentUser?.username || '游客'
  }

  @Getter()
  get userEmail(): string {
    return this.currentUser?.email || ''
  }

  @Getter()
  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin'
  }

  @Getter()
  get isGuest(): boolean {
    return !this.isAuthenticated || this.currentUser?.role === 'guest'
  }

  @Cache({ ttl: 60000 }) // 缓存1分钟
  @Getter()
  get userPermissions(): string[] {
    return this.currentUser?.permissions || []
  }

  @Getter()
  hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission)
  }

  @Getter()
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(p))
  }

  @Getter()
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(p))
  }
}

export const useUserStore = () => new UserStore()
```

## 在组件中使用

### 登录表单

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  const result = await userStore.login(username.value, password.value)
  
  if (result.success) {
    // 登录成功，跳转到首页
    router.push('/')
  } else {
    errorMessage.value = result.error || '登录失败'
  }
}
</script>

<template>
  <div class="login-form">
    <h2>用户登录</h2>
    
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>用户名</label>
        <input 
          v-model="username" 
          type="text" 
          placeholder="请输入用户名"
          required
        />
      </div>

      <div class="form-group">
        <label>密码</label>
        <input 
          v-model="password" 
          type="password" 
          placeholder="请输入密码"
          required
        />
      </div>

      <button 
        type="submit" 
        :disabled="userStore.isLoading"
      >
        {{ userStore.isLoading ? '登录中...' : '登录' }}
      </button>
    </form>
  </div>
</template>
```

### 用户信息显示

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const handleLogout = () => {
  if (confirm('确定要退出吗？')) {
    userStore.logout()
  }
}
</script>

<template>
  <div class="user-profile">
    <div v-if="userStore.isAuthenticated" class="user-info">
      <img 
        v-if="userStore.currentUser?.avatar" 
        :src="userStore.currentUser.avatar" 
        :alt="userStore.userDisplayName"
        class="avatar"
      />
      <div class="details">
        <h3>{{ userStore.userDisplayName }}</h3>
        <p>{{ userStore.userEmail }}</p>
        <span class="role">{{ userStore.currentUser?.role }}</span>
        <span v-if="userStore.isAdmin" class="badge">管理员</span>
      </div>
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </div>

    <div v-else class="guest-info">
      <p>您还未登录</p>
      <router-link to="/login">立即登录</router-link>
    </div>
  </div>
</template>
```

### 权限控制

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <div class="admin-panel">
    <h2>管理面板</h2>

    <!-- 只有管理员可见 -->
    <div v-if="userStore.isAdmin">
      <button>用户管理</button>
      <button>系统设置</button>
    </div>

    <!-- 有特定权限才可见 -->
    <div v-if="userStore.hasPermission('write:articles')">
      <button>发布文章</button>
    </div>

    <!-- 有任意一个权限就可见 -->
    <div v-if="userStore.hasAnyPermission(['read:articles', 'write:articles'])">
      <button>文章管理</button>
    </div>

    <!-- 需要所有权限才可见 -->
    <div v-if="userStore.hasAllPermissions(['admin', 'super_admin'])">
      <button>超级管理</button>
    </div>

    <!-- 游客提示 -->
    <div v-if="userStore.isGuest" class="guest-notice">
      <p>您的权限有限，请登录以获取更多功能</p>
    </div>
  </div>
</template>
```

## 自定义指令

创建权限控制指令：

```typescript
import { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

export const vPermission: Directive = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const { value } = binding

    if (Array.isArray(value)) {
      // 需要所有权限
      if (!userStore.hasAllPermissions(value)) {
        el.style.display = 'none'
      }
    } else {
      // 需要单个权限
      if (!userStore.hasPermission(value)) {
        el.style.display = 'none'
      }
    }
  }
}
```

在组件中使用：

```vue
<template>
  <div>
    <!-- 有权限才显示 -->
    <button v-permission="'delete:user'">删除用户</button>
    
    <!-- 需要多个权限 -->
    <button v-permission="['admin', 'delete:user']">批量删除</button>
  </div>
</template>
```

## 路由守卫

添加认证路由守卫：

```typescript
import { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'

export function setupAuthGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    // 需要认证的路由
    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
      next('/login')
      return
    }

    // 需要管理员权限的路由
    if (to.meta.requiresAdmin && !userStore.isAdmin) {
      next('/403')
      return
    }

    // 需要特定权限的路由
    if (to.meta.permissions) {
      const permissions = Array.isArray(to.meta.permissions) 
        ? to.meta.permissions 
        : [to.meta.permissions]
      
      if (!userStore.hasAllPermissions(permissions)) {
        next('/403')
        return
      }
    }

    next()
  })
}
```

## 函数式用法

```typescript
import { createStore } from '@ldesign/store'
import { ref, computed } from 'vue'

export const useUserStore = createStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const login = async (username: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      currentUser.value = data.user
      isAuthenticated.value = true
      
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    currentUser.value = null
    isAuthenticated.value = false
    error.value = null
  }

  const userDisplayName = computed(() => 
    currentUser.value?.username || '游客'
  )

  const isAdmin = computed(() => 
    currentUser.value?.role === 'admin'
  )

  return {
    // State
    currentUser,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    logout,

    // Getters
    userDisplayName,
    isAdmin,
  }
})
```

## 下一步

- 查看[中级示例](../intermediate)
- 了解[权限管理](../../guide/permissions)
- 学习[实战示例](../real-world/)

