<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  value: string
}>()

const emit = defineEmits<{
  search: [query: string]
}>()

const localValue = ref(props.value)

watch(() => props.value, (newValue) => {
  localValue.value = newValue
})

const handleInput = () => {
  emit('search', localValue.value)
}

const handleClear = () => {
  localValue.value = ''
  emit('search', '')
}
</script>

<template>
  <div class="search-bar">
    <input
      v-model="localValue"
      type="text"
      placeholder="搜索标题、描述或作者..."
      @input="handleInput"
    />
    <button 
      v-if="localValue" 
      class="clear-button"
      @click="handleClear"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-bar input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem 0.5rem;
  border: none;
  background: transparent;
  color: #a0aec0;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.clear-button:hover {
  color: #4a5568;
  background: transparent;
}
</style>

