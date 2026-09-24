<script setup>
import ClientDataPage from '@/components/client/ClientDataPage.vue'
import ClientStatStrip from '@/components/client/ClientStatStrip.vue'
const cols = [
  { label: 'Matière', key: 'name', keys: ['name'], strong: true },
  { label: 'École', key: 'ecole', keys: ['ecole.name'], badge: true },
  { label: 'Cours', key: 'cours', countOf: 'cours', muted: true },
]
</script>
<template>
  <ClientDataPage title="Matières" subtitle="Consultation des matières exposées par GET /api/v1/client/matieres." endpoint="client/matieres" :columns="cols" :search-keys="['name', 'ecole.name']" search-placeholder="Rechercher une matière…">
    <template #stats>
      <ClientStatStrip
        title="Statistiques matières — GET /api/v1/client/statistics/matieres"
        endpoint="client/statistics/matieres"
        :metrics="[
          { label: 'Total matières', path: 'total_matieres' },
          { label: 'Total cours', path: 'total_cours' },
        ]"
      />
    </template>
  </ClientDataPage>
</template>
