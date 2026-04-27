<template>
  <nav class="pagination" v-if="totalPages > 1" aria-label="Pagination Navigation">
    <button 
      :disabled="currentPage === 1" 
      @click="$emit('update:page', currentPage - 1)"
      aria-label="Page précédente"
    >
      ‹
    </button>

    <button 
      v-for="page in pages" 
      :key="page" 
      :class="{ active: page === currentPage }"
      @click="$emit('update:page', page)"
      :aria-current="page === currentPage ? 'page' : null"
    >
      {{ page }}
    </button>

    <button 
      :disabled="currentPage === totalPages" 
      @click="$emit('update:page', currentPage + 1)"
      aria-label="Page suivante"
    >
      ›
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

defineProps({
  totalItems: { type: Number, required: true },
  itemsPerPage: { type: Number, default: 10 },
  modelValue: { type: Number, default: 1 }, // currentPage (v-model)
});

const emit = defineEmits(['update:modelValue']);

const totalPages = computed(() => Math.ceil(totalItems / itemsPerPage));
const currentPage = computed({
  get: () => modelValue,
  set: (val) => emit('update:modelValue', val),
});

const pages = computed(() => {
  const pagesArray = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pagesArray.push(i);
  }
  return pagesArray;
});
</script>

<style scoped>
.pagination {
  display: flex;
  gap: 8px;
}

button {
  padding: 6px 12px;
  border: 1px solid #aaa;
  background: white;
  cursor: pointer;
}

button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>