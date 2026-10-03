<script setup>
import { computed, onMounted } from 'vue'
import { useClientStats, fmtNum, fmtPct, asArray, barWidth } from '@/composables/useClientStats'
import LoadingEcole from '@/components/admin/LoadingEcole.vue'

// Vue globale : un seul appel au backend (au lieu de 7 listes recomptées).
const { stats, loading, error, load } = useClientStats('client/statistics/overview')

function today() {
  const d = new Date()
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const cards = computed(() => [
  { k: 'total_etablissements', label: 'Établissements', to: '/client/ecoles', cls: 'blue' },
  { k: 'total_classes', label: 'Classes', to: '/client/classes', cls: 'green' },
  { k: 'total_eleves', label: 'Élèves', to: '/client/eleves', cls: 'violet' },
  { k: 'total_enseignants', label: 'Enseignants', to: '/client/enseignants', cls: 'amber' },
  { k: 'total_matieres', label: 'Matières', to: '/client/matieres', cls: 'blue' },
  { k: 'total_cours', label: 'Cours', to: '/client/cours', cls: 'green' },
  { k: 'total_quiz', label: 'Quiz', to: '/client/quizzes', cls: 'violet' },
  { k: 'total_handicaps', label: 'Handicaps', to: '/client/handicaps', cls: 'amber' },
])

function countOf(k) {
  // fmtNum affiche « n/d » si le champ est absent — jamais undefined/NaN/null.
  return fmtNum(stats.value?.[k])
}

const parClasse = computed(() => asArray(stats.value?.repartition_par_classe))
const parHandicap = computed(() => asArray(stats.value?.repartition_par_handicap))
const parEcoles = computed(() => asArray(stats.value?.repartition_par_etablissement))
const coursStats = computed(() => stats.value?.cours ?? null)

function ecoleKey(e) {
  return e.ecole_id ?? e.id
}

onMounted(() => load())
</script>
<template>
  <div class="container">
    <div class="dash-head pro-card">
      <div><p class="dash-date">{{ today() }}</p><h1>Tableau de bord Client</h1><p class="dash-sub">Vue globale « Tous les établissements » — données réelles de GET /api/v1/client/statistics/overview.</p></div>
      <RouterLink to="/client/profil" class="pro-btn pro-btn-ghost pro-btn-sm">Mon profil</RouterLink>
    </div>
    <LoadingEcole :visible="loading" message="Chargement" />
    <div v-if="error && !loading" class="pro-card dash-err"><p>{{ error }}</p><button class="pro-btn pro-btn-primary pro-btn-sm" type="button" @click="load">Réessayer</button></div>
    <div v-if="!loading && !error" class="dash-grid">
      <RouterLink v-for="c in cards" :key="c.k" :to="c.to" class="pro-card pro-card-hover dash-card">
        <span class="pro-badge" :class="'pro-badge-' + c.cls">{{ c.label }}</span>
        <span class="dash-n">{{ countOf(c.k) }}</span>
      </RouterLink>
    </div>

    <template v-if="!loading && !error">
      <div class="pro-card dash-hand">
        <h2>Chiffres clés</h2>
        <p class="dash-sub">
          Cours publiés : {{ fmtNum(coursStats?.publies) }} / {{ fmtNum(coursStats?.total) }}
          ({{ fmtPct(coursStats?.publies_pourcentage) }}) ·
          Quiz autorisés : {{ fmtNum(coursStats?.quiz_authorise) }} ({{ fmtPct(coursStats?.quiz_authorise_pourcentage) }}) ·
          Avec médias : {{ fmtNum(coursStats?.avec_medias) }} ({{ fmtPct(coursStats?.avec_medias_pourcentage) }})
        </p>
      </div>

      <div class="pro-card dash-hand">
        <h2>Répartition des élèves par classe</h2>
        <p v-if="!parClasse.length" class="dash-sub">Aucune donnée disponible.</p>
        <div v-else class="bars">
          <div v-for="c in parClasse" :key="c.id ?? c.name" class="bar-row">
            <span class="bar-label" :title="c.ecole_name ? `${c.name} (${c.ecole_name})` : c.name">{{ c.name || ('#' + c.id) }}<span v-if="c.ecole_name" class="bar-sub"> · {{ c.ecole_name }}</span></span>
            <div class="bar-track"><div class="bar-fill" :style="{ width: barWidth(c.pourcentage) + '%' }"></div></div>
            <span class="bar-value">{{ fmtNum(c.total_eleves) }} · {{ fmtPct(c.pourcentage) }}</span>
          </div>
        </div>
      </div>

      <div class="pro-card dash-hand">
        <h2>Élèves par situation de handicap</h2>
        <p v-if="!parHandicap.length" class="dash-sub">Aucune donnée disponible.</p>
        <div v-else class="bars">
          <div v-for="h in parHandicap" :key="h.id ?? h.name" class="bar-row">
            <span class="bar-label">{{ h.name || ('#' + h.id) }}</span>
            <div class="bar-track"><div class="bar-fill" :style="{ width: barWidth(h.pourcentage) + '%' }"></div></div>
            <span class="bar-value">{{ fmtNum(h.total_eleves) }} · {{ fmtPct(h.pourcentage) }}</span>
          </div>
        </div>
      </div>

      <div class="pro-card dash-hand">
        <h2>Établissements — comparaison</h2>
        <p v-if="!parEcoles.length" class="dash-sub">Aucun établissement disponible.</p>
        <div v-else class="pro-table-wrap">
          <table class="pro-table">
            <thead>
              <tr><th>Établissement</th><th>Classes</th><th>Élèves</th><th>Enseignants</th><th>Cours</th><th>Matières</th><th>Quiz</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="e in parEcoles" :key="ecoleKey(e)">
                <td class="td-name">{{ e.nom || e.name || ('#' + ecoleKey(e)) }}</td>
                <td>{{ fmtNum(e.total_classes) }}</td>
                <td>{{ fmtNum(e.total_eleves) }}</td>
                <td>{{ fmtNum(e.total_enseignants) }}</td>
                <td>{{ fmtNum(e.total_cours) }}</td>
                <td>{{ fmtNum(e.total_matieres) }}</td>
                <td>{{ fmtNum(e.total_quiz) }}</td>
                <td><RouterLink class="dash-link" :to="'/client/etablissements/' + ecoleKey(e)">Détail →</RouterLink></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>
  </div>
</template>
<style scoped>
.container{max-width:1200px;margin:0 auto;padding:0 20px 40px}
.dash-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:22px;margin-bottom:18px;flex-wrap:wrap}
.dash-head h1{font-size:1.6rem;font-weight:900;color:#0f172a}
.dash-date{font-size:.75rem;font-weight:700;color:#94a3b8}.dash-sub{font-size:.83rem;color:#94a3b8}
.dash-err{padding:22px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.dash-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr));gap:14px;margin-bottom:18px}
.dash-card{padding:18px;display:flex;flex-direction:column;gap:10px;text-decoration:none}
.dash-n{font-size:2rem;font-weight:900;color:#0f172a;line-height:1}
.dash-hand{padding:20px;margin-bottom:14px}.dash-hand h2{font-size:1rem;font-weight:800;margin-bottom:10px;color:#0f172a}
.dash-link{color:#2563eb;font-weight:800;font-size:.8rem;text-decoration:none;white-space:nowrap}
.dash-link:hover{text-decoration:underline}
.td-name{font-weight:700}
.bars{display:flex;flex-direction:column;gap:8px}
.bar-row{display:grid;grid-template-columns:minmax(min(110px,100%),240px) 1fr auto;gap:10px;align-items:center}
.bar-label{font-size:.8rem;font-weight:700;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-sub{font-weight:500;color:#94a3b8}
.bar-track{height:10px;background:#eef2f7;border-radius:99px;overflow:hidden}
.bar-fill{height:100%;background:linear-gradient(90deg,#2563eb,#6d28d9);border-radius:99px}
.bar-value{font-size:.78rem;font-weight:700;color:#0f172a;white-space:nowrap}
</style>
