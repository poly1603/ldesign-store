<script setup lang="ts">
import { onMounted } from 'vue'
import { usePaginationStore } from './stores/pagination'
import PaginationList from './components/PaginationList.vue'
import PaginationControls from './components/PaginationControls.vue'
import SearchBar from './components/SearchBar.vue'

const store = usePaginationStore()

onMounted(() => {
  store.fetchItems()
})
</script>

<template>
  <div class="app">
    <header>
      <h1>分页列表示例</h1>
      <p>演示 @ldesign/store 的分页功能</p>
    </header>

    <main class="container">
      <div class="toolbar">
        <SearchBar 
          :value="store.searchQuery" 
          @search="store.search" 
        />
        
        <div class="sort-controls">
          <label>排序：</label>
          <select 
            :value="store.sortBy" 
            @change="e => store.setSorting((e.target as HTMLSelectElement).value, store.sortOrder)"
          >
            <option value="createdAt">创建时间</option>
            <option value="title">标题</option>
            <option value="author">作者</option>
          </select>
          
          <button @click="store.toggleSortOrder">
            {{ store.sortOrder === 'asc' ? '↑' : '↓' }}
          </button>
        </div>

        <div class="page-size">
          <label>每页：</label>
          <select 
            :value="store.pageSize" 
            @change="e => store.setPageSize(Number((e.target as HTMLSelectElement).value))"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <button @click="store.refresh" :disabled="store.isLoading">
          刷新
        </button>
      </div>

      <div v-if="store.isLoading" class="loading">
        加载中...
      </div>

      <div v-else-if="store.error" class="error">
        {{ store.error }}
        <button @click="store.fetchItems">重试</button>
      </div>

      <div v-else-if="store.isEmpty" class="empty">
        没有找到数据
        <button v-if="store.hasFilters" @click="store.clearFilters">
          清除筛选
        </button>
      </div>

      <template v-else>
        <div class="stats">
          显示 {{ store.startIndex + 1 }} - {{ store.endIndex }} 条，
          共 {{ store.total }} 条
        </div>

        <PaginationList :items="store.items" />
        
        <PaginationControls
          :current-page="store.currentPage"
          :total-pages="store.totalPages"
          :has-prev="store.hasPrevPage"
          :has-next="store.hasNextPage"
          :page-numbers="store.pageNumbers"
          @go-to-page="store.goToPage"
          @prev-page="store.prevPage"
          @next-page="store.nextPage"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
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
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.sort-controls,
.page-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-controls label,
.page-size label {
  font-weight: 500;
  color: #555;
}

select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #667eea;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error {
  color: #e53e3e;
}

.empty {
  color: #718096;
}

.stats {
  margin-bottom: 1rem;
  color: #718096;
  font-size: 0.9rem;
}
</style>

