<script setup>
import ClientDataPage from '@/components/client/ClientDataPage.vue'
import ClientStatStrip from '@/components/client/ClientStatStrip.vue'
const cols = [
  { label: '#', key: 'id', keys: ['id'], muted: true },
  { label: 'Handicap', key: 'name', keys: ['name'], strong: true },
]
</script>
<template>
  <ClientDataPage title="Handicaps" subtitle="Référentiel via GET /api/v1/client/handicaps." endpoint="client/handicaps" :columns="cols" :search-keys="['name']" search-placeholder="Rechercher un handicap…">
    <template #stats>
      <ClientStatStrip
        title="Statistiques handicap — GET /api/v1/client/statistics/handicaps"
        endpoint="client/statistics/handicaps"
        :metrics="[
          { label: 'Types de handicap', path: 'total_types_handicap' },
          { label: 'Élèves suivis', path: 'total_eleves' },
        ]"
      />
    </template>
  </ClientDataPage>
</template>
