<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ClientDataPage from '@/components/client/ClientDataPage.vue'

const route = useRoute()
const ecoleId = computed(() => route.query.ecole_id ?? '')

const endpoint = computed(() => {
  const qs = new URLSearchParams()
  if (ecoleId.value) qs.set('ecole_id', String(ecoleId.value))
  qs.set('per_page', '200')
  return `client/eleves?${qs.toString()}`
})

const subtitle = computed(() => {
  const base = 'Consultation des élèves exposés par GET /api/v1/client/eleves'
  return ecoleId.value ? `${base} (filtré par établissement #${ecoleId.value}).` : `${base}.`
})

const cols = [
  { label: 'Nom', key: 'name', keys: ['name'], strong: true },
  { label: 'Prénom', key: 'prenom', keys: ['prenom'], muted: true },
  { label: 'Classe', key: 'classe', keys: ['classe.name'], badge: true },
  { label: 'École', key: 'ecole', keys: ['classe.ecole.name'], muted: true },
  { label: 'Handicap', key: 'handicap', keys: ['handicap.name'], muted: true },
]
const searchKeys = ['name', 'prenom', 'classe.name', 'classe.ecole.name', 'handicap.name']
</script>

<template>
  <ClientDataPage
    :key="route.fullPath"
    title="Élèves"
    :subtitle="subtitle"
    :endpoint="endpoint"
    :columns="cols"
    :search-keys="searchKeys"
    search-placeholder="Rechercher un élève…"
  />
</template>
