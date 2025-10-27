<script setup lang="ts">
import RegisterForm from './components/RegisterForm.vue'
</script>

<template>
  <div class="app">
    <header>
      <h1>表单验证示例</h1>
      <p>演示 @ldesign/store 的表单管理功能</p>
    </header>

    <main class="container">
      <RegisterForm />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}

.app {
  min-height: 100vh;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

header h1 {
  margin: 0 0 0.5rem 0;
}

header p {
  margin: 0;
  opacity: 0.9;
}

.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>

