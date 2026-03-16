<template>
  <span @click="toggle" style="cursor: pointer; color: blue; user-select: none;">
    {{ isHidden ? hiddenText : code }}
  </span>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  hiddenText: {
    type: String,
    default: '••••••'
  }
})

const isHidden = ref(true)

function toggle() {
  isHidden.value = !isHidden.value
}
</script>