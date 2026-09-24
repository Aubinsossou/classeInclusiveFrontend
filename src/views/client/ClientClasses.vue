<script setup>
import ClientDataPage from '@/components/client/ClientDataPage.vue'
const cols = [
  { label: 'Classe', key: 'name', keys: ['name'], strong: true },
  { label: 'École', key: 'ecole', keys: ['ecole.name'], badge: true },
  { label: 'Élèves', key: 'eleves', countOf: 'eleves', muted: true },
  { label: 'Enseignant', key: 'enseignant', keys: ['enseignant.name'], muted: true },
  { label: 'Matières', key: 'matieres', countOf: 'matieres', muted: true },
]
</script>
<template>
  <ClientDataPage title="Classes" subtitle="Consultation des classes exposées par GET /api/v1/client/classes." endpoint="client/classes" :columns="cols" :search-keys="['name', 'ecole.name', 'enseignant.name']" search-placeholder="Rechercher une classe…" />
</template>
