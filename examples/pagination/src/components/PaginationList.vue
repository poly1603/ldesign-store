<script setup lang="ts">
import { PaginationItem } from '../stores/pagination'

defineProps<{
  items: PaginationItem[]
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="pagination-list">
    <div 
      v-for="item in items" 
      :key="item.id" 
      class="list-item"
    >
      <div class="item-header">
        <h3>{{ item.title }}</h3>
        <span class="author">{{ item.author }}</span>
      </div>
      <p class="description">{{ item.description }}</p>
      <div class="item-footer">
        <div class="tags">
          <span 
            v-for="tag in item.tags" 
            :key="tag" 
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
        <span class="date">{{ formatDate(item.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination-list {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.list-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.list-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.item-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.author {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.description {
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.date {
  color: #a0aec0;
  font-size: 0.85rem;
}
</style>

