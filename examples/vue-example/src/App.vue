<template>
  <div class="app">
    <h1>@ldesign/store-vue 示例</h1>
    
    <div class="card">
      <h2>用户信息</h2>
      <p>姓名: {{ userStore.name || '未设置' }}</p>
      <p>年龄: {{ userStore.age }}</p>
      <p>显示名称: {{ userStore.displayName }}</p>
      
      <div class="actions">
        <input 
          v-model="nameInput" 
          placeholder="输入姓名"
          @keyup.enter="setName"
        />
        <button @click="setName">设置姓名</button>
        <button @click="userStore.incrementAge">增加年龄</button>
        <button @click="userStore.$reset">重置</button>
      </div>
    </div>

    <div class="card">
      <h2>缓存示例</h2>
      <button @click="fetchData">获取数据（带缓存）</button>
      <div v-if="dataStore.loading">加载中...</div>
      <div v-else-if="dataStore.data">
        <pre>{{ JSON.stringify(dataStore.data, null, 2) }}</pre>
      </div>
      
      <div class="stats">
        <h3>缓存统计</h3>
        <p>命中率: {{ (cacheStats.hitRate * 100).toFixed(2) }}%</p>
        <p>总请求: {{ cacheStats.totalRequests }}</p>
        <p>命中: {{ cacheStats.hits }}</p>
        <p>未命中: {{ cacheStats.misses }}</p>
      </div>
    </div>

    <div class="card">
      <h2>性能监控</h2>
      <button @click="runPerformanceTest">运行性能测试</button>
      <div v-if="performanceMetrics">
        <p>平均耗时: {{ performanceMetrics.avgTime.toFixed(2) }}ms</p>
        <p>最小耗时: {{ performanceMetrics.minTime.toFixed(2) }}ms</p>
        <p>最大耗时: {{ performanceMetrics.maxTime.toFixed(2) }}ms</p>
        <p>执行次数: {{ performanceMetrics.count }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore, useDataStore } from './stores/user'

const userStore = useUserStore()
const dataStore = useDataStore()

const nameInput = ref('')
const performanceMetrics = ref<any>(null)

const cacheStats = computed(() => dataStore.$cache.getStats())

function setName() {
  if (nameInput.value) {
    userStore.setName(nameInput.value)
    nameInput.value = ''
  }
}

async function fetchData() {
  await dataStore.fetchData({ id: Math.random() })
}

async function runPerformanceTest() {
  await dataStore.performanceTest()
  performanceMetrics.value = dataStore.$performanceMonitor?.getMetrics('performanceTest')
}
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

.card {
  background: #f5f5f5;
  padding: 1.5rem;
  margin: 1rem 0;
  border-radius: 8px;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}

button {
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #359268;
}

.stats {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
}

pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>

