<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
  pageNumbers: number[]
}>()

const emit = defineEmits<{
  goToPage: [page: number]
  prevPage: []
  nextPage: []
}>()
</script>

<template>
  <div class="pagination-controls">
    <button 
      class="nav-button"
      :disabled="!hasPrev"
      @click="emit('prevPage')"
    >
      上一页
    </button>

    <div class="page-numbers">
      <button
        v-if="pageNumbers[0] > 1"
        class="page-number"
        @click="emit('goToPage', 1)"
      >
        1
      </button>

      <span v-if="pageNumbers[0] > 2" class="ellipsis">...</span>

      <button
        v-for="page in pageNumbers"
        :key="page"
        class="page-number"
        :class="{ active: page === currentPage }"
        @click="emit('goToPage', page)"
      >
        {{ page }}
      </button>

      <span v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1" class="ellipsis">
        ...
      </span>

      <button
        v-if="pageNumbers[pageNumbers.length - 1] < totalPages"
        class="page-number"
        @click="emit('goToPage', totalPages)"
      >
        {{ totalPages }}
      </button>
    </div>

    <button 
      class="nav-button"
      :disabled="!hasNext"
      @click="emit('nextPage')"
    >
      下一页
    </button>
  </div>
</template>

<style scoped>
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 0;
}

.nav-button,
.page-number {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-button:hover:not(:disabled),
.page-number:hover:not(.active) {
  background: #f7fafc;
  border-color: #667eea;
  color: #667eea;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.page-number {
  min-width: 2.5rem;
  padding: 0.5rem 0.75rem;
}

.page-number.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.ellipsis {
  padding: 0 0.5rem;
  color: #a0aec0;
}
</style>

