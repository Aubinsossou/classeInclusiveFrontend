<script setup>
import ClientDataPage from '@/components/client/ClientDataPage.vue'
import ClientStatStrip from '@/components/client/ClientStatStrip.vue'
const cols = [
  { label: 'Titre', key: 'title', keys: ['title'], strong: true },
  { label: 'Matière', key: 'matiere', keys: ['matiere.name'], badge: true },
  { label: 'Classe', key: 'classe', keys: ['classe.name'], muted: true },
  { label: 'Enseignant', key: 'enseignant', keys: ['enseignant.name'], muted: true },
  { label: 'Publié', key: 'published', boolOf: 'is_published', boolTrue: 'Oui', boolFalse: 'Non', badge: true },
  { label: 'Médias', key: 'medias', countOf: 'medias', muted: true },
]
</script>
<template>
  <ClientDataPage title="Cours" subtitle="Consultation des cours exposés par GET /api/v1/client/cours." endpoint="client/cours" :columns="cols" :search-keys="['title', 'description', 'matiere.name', 'classe.name', 'enseignant.name']" search-placeholder="Rechercher un cours…">
    <template #stats>
      <ClientStatStrip
        title="Statistiques cours — GET /api/v1/client/statistics/cours"
        endpoint="client/statistics/cours"
        :metrics="[
          { label: 'Total', path: 'total_cours' },
          { label: 'Publiés', path: 'publies', pctPath: 'publies_pourcentage' },
          { label: 'Non publiés', path: 'non_publies' },
          { label: 'Quiz autorisés', path: 'quiz_authorise', pctPath: 'quiz_authorise_pourcentage' },
        ]"
      />
    </template>
  </ClientDataPage>
</template>
