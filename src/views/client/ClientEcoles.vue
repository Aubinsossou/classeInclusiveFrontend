<script setup>
import ClientDataPage from '@/components/client/ClientDataPage.vue'
const cols = [
  { label: 'Nom', key: 'name', keys: ['name'], strong: true },
  { label: 'Téléphone', key: 'numero', keys: ['numero'], muted: true },
  { label: 'E-mail', key: 'email', keys: ['email'], muted: true },
  { label: 'Statistiques', key: 'id', keys: ['id'], link: (row) => '/client/etablissements/' + row.id, linkLabel: 'Détail →' },
]
</script>
<template>
  <ClientDataPage title="Établissements" subtitle="Consultation des écoles exposées par GET /api/v1/client/ecoles." endpoint="client/ecoles" :columns="cols" :search-keys="['name', 'numero', 'email']" search-placeholder="Rechercher un établissement…" />
</template>
