<script setup>
import { computed, onMounted } from 'vue'
import { useClientStats, fmtNum, fmtPct, asArray, barWidth } from '@/composables/useClientStats'
import LoadingEcole from '@/components/admin/LoadingEcole.vue'

const props = defineProps({ id: { type: [String, Number], required: true } })

const { stats, loading, error, load } = useClientStats(`client/statistics/etablissements/${props.id}`)

function today() {
  return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const etablissement = computed(() => stats.value?.etablissement ?? null)
const nom = computed(() => etablissement.value?.nom || 'Établissement')

const cards = computed(() => [
  { k: 'total_classes', label: 'Classes' },
  { k: 'total_eleves', label: 'Élèves' },
  { k: 'total_enseignants', label: 'Enseignants' },
  { k: 'total_matieres', label: 'Matières' },
  { k: 'total_cours', label: 'Cours' },
  { k: 'total_cours_publies', label: 'Cours publiés' },
  { k: 'total_quiz', label: 'Quiz' },
  { k: 'total_handicaps', label: 'Types de handicap' },
])
function countOf(k) { return fmtNum(stats.value?.[k]) }

const publiesPct = computed(() => fmtPct(stats.value?.total_cours_publies_pourcentage))
const parClasse = computed(() => asArray(stats.value?.repartition_par_classe))
const parHandicap = computed(() => asArray(stats.value?.repartition_par_handicap))
const enseignants = computed(() => stats.value?.enseignants ?? null)
const cours = computed(() => stats.value?.cours ?? null)
const quiz = computed(() => stats.value?.quiz ?? null)

onMounted(() => { load() })
</script>

<template>
  <div class="container">
    <div class="dash-head pro-card">
      <div>
        <p class="dash-crumb">
          <RouterLink to="/client/dashboard">Tableau de bord</RouterLink>
          <span> / </span>
          <RouterLink to="/client/ecoles">Établissements</RouterLink>
        </p>
        <p class="dash-date">{{ today() }}</p>
        <h1>{{ nom }}</h1>
        <p class="dash-sub">
          Statistiques propres à cet établissement — GET /api/v1/client/statistics/etablissements/{{ id }}.
          <template v-if="etablissement?.numero"> · Tél. {{ etablissement.numero }}</template>
          <template v-if="etablissement?.email"> · {{ etablissement.email }}</template>
        </p>
      </div>
      <div class="dash-actions">
        <RouterLink class="pro-btn pro-btn-ghost pro-btn-sm" :to="'/client/eleves?ecole_id=' + id">Élèves de l'établissement</RouterLink>
        <RouterLink to="/client/ecoles" class="pro-btn pro-btn-ghost pro-btn-sm">← Établissements</RouterLink>
      </div>
    </div>

    <LoadingEcole :visible="loading" message="Chargement" />

    <div v-if="error && !loading" class="pro-card dash-err">
      <p>{{ error }}</p>
      <button class="pro-btn pro-btn-primary pro-btn-sm" type="button" @click="load">Réessayer</button>
    </div>

    <template v-if="!loading && !error">
      <div class="dash-grid">
        <div v-for="c in cards" :key="c.k" class="pro-card dash-card">
          <span class="pro-badge pro-badge-blue">{{ c.label }}</span>
          <span class="dash-n">{{ countOf(c.k) }}</span>
        </div>
      </div>

      <div class="pro-card dash-hand">
        <h2>Cours publiés</h2>
        <p class="dash-big">{{ publiesPct }}</p>
        <p class="dash-sub">Publiés : {{ fmtNum(stats?.total_cours_publies) }} / {{ fmtNum(stats?.total_cours) }}</p>
      </div>
      <div class="pro-card dash-hand">
        <h2>Répartition des élèves par classe</h2>
        <p v-if="!parClasse.length" class="dash-sub">Aucune donnée disponible.</p>
        <div v-else class="bars">
          <div v-for="c in parClasse" :key="c.id ?? c.name" class="bar-row">
            <span class="bar-label">{{ c.name || ('#' + c.id) }}</span>
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

      <div class="dash-two">
        <div class="pro-card dash-hand">
          <h2>Enseignants</h2>
          <p v-if="enseignants" class="dash-sub">
            Avec classe : {{ fmtNum(enseignants.avec_classe) }} ({{ fmtPct(enseignants.avec_classe_pourcentage) }}) ·
            Sans classe : {{ fmtNum(enseignants.sans_classe) }} ({{ fmtPct(enseignants.sans_classe_pourcentage) }})
          </p>
        </div>
        <div class="pro-card dash-hand">
          <h2>Cours &amp; quiz</h2>
          <p v-if="cours" class="dash-sub">
            Quiz autorisés : {{ fmtNum(cours.quiz_authorise) }} ({{ fmtPct(cours.quiz_authorise_pourcentage) }}) ·
            Avec médias : {{ fmtNum(cours.avec_medias) }} ({{ fmtPct(cours.avec_medias_pourcentage) }})
          </p>
          <p v-if="quiz" class="dash-sub">
            Moyenne questions/quiz : {{ fmtNum(quiz.moyenne_questions_par_quiz) }} ·
            Notes enregistrées : {{ fmtNum(quiz.total_notes) }}
          </p>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.container{max-width:1200px;margin:0 auto;padding:0 20px 40px}
.dash-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:22px;margin-bottom:18px;flex-wrap:wrap}
.dash-head h1{font-size:1.6rem;font-weight:900;color:#0f172a}
.dash-crumb{font-size:.75rem;font-weight:700;color:#2563eb;margin-bottom:4px}
.dash-crumb a{color:#2563eb;text-decoration:none}
.dash-actions{display:flex;gap:8px;flex-wrap:wrap}
.dash-date{font-size:.75rem;font-weight:700;color:#94a3b8}
.dash-sub{font-size:.83rem;color:#94a3b8}
.dash-err{padding:22px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.dash-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:18px}
.dash-card{padding:18px;display:flex;flex-direction:column;gap:10px}
.dash-n{font-size:2rem;font-weight:900;color:#0f172a;line-height:1}
.dash-hand{padding:20px;margin-bottom:14px}
.dash-hand h2{font-size:1rem;font-weight:800;margin-bottom:10px;color:#0f172a}
.dash-big{font-size:1.8rem;font-weight:900;color:#0f172a}
.dash-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-bottom:14px}
.bars{display:flex;flex-direction:column;gap:8px}
.bar-row{display:grid;grid-template-columns:minmax(90px,180px) 1fr auto;gap:10px;align-items:center}
.bar-label{font-size:.8rem;font-weight:700;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-track{height:10px;background:#eef2f7;border-radius:99px;overflow:hidden}
.bar-fill{height:100%;background:linear-gradient(90deg,#2563eb,#6d28d9);border-radius:99px}
.bar-value{font-size:.78rem;font-weight:700;color:#0f172a;white-space:nowrap}
</style>
