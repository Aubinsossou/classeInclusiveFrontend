<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderEcole from '@/components/admin/header.vue'
import HeaderEnseignant from '@/components/admin/HeaderEnseignant.vue'

const route = useRoute()
const role = localStorage.getItem('role')

const currentHeader = computed(() => {
  switch (route.meta.role) {
    case 'enseignant':
      return HeaderEnseignant
    case 'ecole':
      return HeaderEcole
    case 'eleve':
      return null
    default:
      return null
  }
})

const isEleve = computed(() => route.meta.role === 'eleve')
</script>

<template>
  <div
    :style="
      isEleve
        ? { background: '#F5F2ED', Height: '100vh' }
        : { background: '#f1f5f9', minHeight: '100vh' }
    "
  >
    <header>
      <component :is="currentHeader" v-if="currentHeader" />
    </header>
    <main :style="isEleve ? {} : { background: '#f1f5f9', minHeight: '100vh' }">
      <RouterView />
    </main>
  </div>
</template>
