<script setup>
import ClientDataPage from '@/components/client/ClientDataPage.vue'
import ClientStatStrip from '@/components/client/ClientStatStrip.vue'
const cols = [
  { label: 'Nom', key: 'name', keys: ['name'], strong: true },
  { label: 'Prénom', key: 'prenom', keys: ['prenom'], muted: true },
  { label: 'Matricule', key: 'matricule', keys: ['matricule'], badge: true },
  { label: 'E-mail', key: 'email', keys: ['email'], muted: true },
  { label: 'Classe', key: 'classe', keys: ['classe.name'], muted: true },
]
</script>
<template>
  <ClientDataPage title="Enseignants" subtitle="Consultation des enseignants exposés par GET /api/v1/client/enseignants." endpoint="client/enseignants" :columns="cols" :search-keys="['name', 'prenom', 'matricule', 'email', 'classe.name']" search-placeholder="Rechercher un enseignant…">
    <template #stats>
      <ClientStatStrip
        title="Statistiques enseignants — GET /api/v1/client/statistics/enseignants"
        endpoint="client/statistics/enseignants"
        :metrics="[
          { label: 'Total', path: 'total_enseignants' },
          { label: 'Avec classe', path: 'avec_classe', pctPath: 'avec_classe_pourcentage' },
          { label: 'Sans classe', path: 'sans_classe', pctPath: 'sans_classe_pourcentage' },
          { label: 'Cours / enseignant', path: 'cours_moyen_par_enseignant' },
          { label: 'Quiz / enseignant', path: 'quiz_moyen_par_enseignant' },
        ]"
      />
    </template>
  </ClientDataPage>
</template>
