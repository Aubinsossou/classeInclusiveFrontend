<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import HeaderEcole from '@/components/admin/header.vue'
import HeaderEnseignant from '@/components/admin/HeaderEnseignant.vue'

const route = useRoute()

const currentHeader = computed(() => {
  switch (route.meta.role) {
    case 'enseignant':
      return HeaderEnseignant
    case 'ecole':
      return HeaderEcole
    case 'eleve':
      return null  // Les vues élève ont leur propre topbar intégrée
    default:
      return null
  }
})
</script>

<template>
  <header>
    <component :is="currentHeader" v-if="currentHeader" />
  </header>

  <main style="background-color: #eff5ff;">
    <RouterView />
  </main>
</template>