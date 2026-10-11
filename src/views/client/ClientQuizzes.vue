<script setup>
import ClientDataPage from '@/components/client/ClientDataPage.vue'
import ClientStatStrip from '@/components/client/ClientStatStrip.vue'
const cols = [
  { label: 'Quiz', key: 'name', keys: ['name'], strong: true },
  { label: 'Cours', key: 'cours', keys: ['cours.title'], badge: true },
  { label: 'Questions', key: 'questions', countOf: 'questions', muted: true },
]
</script>
<template>
  <ClientDataPage title="Quiz" subtitle="Consultation en lecture seule via GET /api/v1/client/quizzes. Corrections jamais affichées." endpoint="client/quizzes" :columns="cols" :search-keys="['name', 'cours.title']" search-placeholder="Rechercher un quiz…">
    <template #stats>
      <ClientStatStrip
        title="Statistiques quiz — GET /api/v1/client/statistics/quiz"
        endpoint="client/statistics/quiz"
        :metrics="[
          { label: 'Total quiz', path: 'total_quiz' },
          { label: 'Questions', path: 'total_questions' },
          { label: 'Réponses', path: 'total_reponses' },
          { label: 'Questions / quiz', path: 'moyenne_questions_par_quiz' },
        ]"
      />
    </template>
  </ClientDataPage>
</template>
