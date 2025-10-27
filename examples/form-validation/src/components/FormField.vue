<script setup lang="ts">
import { FormStore } from '../stores/form'

const props = defineProps<{
  name: string
  label: string
  type: string
  placeholder?: string
  store: FormStore
}>()

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  props.store.setFieldValue(props.name, value)
}

const handleBlur = () => {
  props.store.setFieldTouched(props.name)
}
</script>

<template>
  <div class="form-group">
    <label :for="name">
      {{ label }}
      <span v-if="store.fields[name]?.validating" class="validating-indicator">
        验证中...
      </span>
    </label>
    
    <input
      :id="name"
      :type="type"
      :value="store.getFieldValue(name)"
      :placeholder="placeholder"
      :class="{ 
        'has-error': store.shouldShowError(name),
        'is-valid': store.fields[name]?.touched && !store.hasFieldError(name)
      }"
      @input="handleInput"
      @blur="handleBlur"
    />

    <div v-if="store.shouldShowError(name)" class="error-message">
      {{ store.getFieldErrors(name)[0] }}
    </div>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3748;
}

.validating-indicator {
  font-size: 0.85rem;
  color: #718096;
  font-weight: normal;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.has-error {
  border-color: #fc8181;
}

input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(252, 129, 129, 0.1);
}

input.is-valid {
  border-color: #68d391;
}

.error-message {
  margin-top: 0.5rem;
  color: #e53e3e;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-message::before {
  content: '⚠';
}
</style>

