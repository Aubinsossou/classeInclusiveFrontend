<script setup>
import { ref, onMounted, computed, h, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiGet } from '@/helpers/axiosApi'
import LoadingView from '@/components/admin/Loading.vue'

// ── Auth ──────────────────────────────────────────────────
const userAuth = ref(null)
const loading = ref(true)

const apiGetUser = async () => {
  try {
    const response = await apiGet('/enseignant/getEnseignant')
    userAuth.value = response.data?.data ?? response.data
  } catch (e) {
    console.error('Erreur chargement enseignant :', e)
  }
}

// ── Icônes SVG ────────────────────────────────────────────
const svgData = {
  arrowLeft:  `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`,
  user:       `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  message:    `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  search:     `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  book:       `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
  layers:     `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
  difficulte: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
  action:     `<path d="M22 12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
  tag:        `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`,
}

const AppIcon = defineComponent({
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 18 },
  },
  setup(props) {
    return () =>
      h('svg', {
        width: props.size,
        height: props.size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        innerHTML: svgData[props.name] ?? '',
      })
  },
})

// ── Router ────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()
const goBack = () => router.back()

// ── Données cours ─────────────────────────────────────────
const cousOfBilan = ref([])

const apiGetCours = async () => {
  const id = userAuth.value?.id
  if (!id) return
  try {
    const response = await apiGet("retour-projection/index/" + id)
    const raw = response.data?.data ?? response.data
    cousOfBilan.value = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.cours)
        ? raw.cours
        : Object.values(raw)
  } catch (e) {
    console.error('Erreur chargement cours :', e)
  }
}

const cours = computed(() => cousOfBilan.value ?? [])

// ── Matières déduites des cours ───────────────────────────
// Supporte : c.matiere_id seul, ou c.matiere (objet avec id + nom/name/titre)
const matieres = computed(() => {
  const map = new Map()
  for (const c of cours.value) {
    const id    = c.matiere?.id ?? c.matiere_id ?? null
    const label = c.matiere?.nom ?? c.matiere?.name ?? c.matiere?.titre ?? (id ? `Matière #${id}` : null)
    if (id && !map.has(id)) map.set(id, { id, label })
  }
  return [...map.values()]
})

// ── Filtres ───────────────────────────────────────────────
const selectedMatiereId = ref(null)
const selectedCoursId   = ref(route.params.id ? Number(route.params.id) : null)

// Sélection matière → reset cours
const selectMatiere = (id) => {
  selectedMatiereId.value = id
  selectedCoursId.value   = null
}

// Cours disponibles selon la matière active
const coursFiltered = computed(() =>
  selectedMatiereId.value
    ? cours.value.filter((c) => (c.matiere?.id ?? c.matiere_id) === selectedMatiereId.value)
    : cours.value,
)

const selectedCours = computed(() =>
  selectedCoursId.value
    ? cours.value.find((c) => c.id === selectedCoursId.value) ?? null
    : null,
)

// ── Aplatir tous les retours_projections ──────────────────
const allFeedbacks = computed(() => {
  if (!Array.isArray(cours.value)) return []
  const liste = []
  for (const c of cours.value) {
    for (const r of (c.retours_projections ?? [])) {
      liste.push({
        ...r,
        cours_title:  c.title || c.titre || 'Cours sans titre',
        cours_id:     c.id,
        matiere_id:   c.matiere?.id ?? c.matiere_id ?? null,
        student_name: r.eleve
          ? `${r.eleve.prenom ?? ''} ${r.eleve.name ?? ''}`.trim()
          : `Élève #${r.eleve_id ?? '?'}`,
      })
    }
  }
  return liste
})

// ── Recherche + filtres combinés ──────────────────────────
const searchQuery = ref('')

const filteredFeedbacks = computed(() => {
  let liste = allFeedbacks.value
  if (selectedMatiereId.value) {
    liste = liste.filter((f) => f.matiere_id === selectedMatiereId.value)
  }
  if (selectedCoursId.value) {
    liste = liste.filter((f) => f.cours_id === selectedCoursId.value)
  }
  const q = searchQuery.value.toLowerCase().trim()
  if (q) liste = liste.filter((f) => f.student_name.toLowerCase().includes(q))
  return liste
})

// ── Stats globales ────────────────────────────────────────
const totalBilans  = computed(() => allFeedbacks.value.length)
const elevesActifs = computed(() => new Set(allFeedbacks.value.map((f) => f.eleve_id)).size)

// ── Lifecycle ─────────────────────────────────────────────
onMounted(async () => {
  await apiGetUser()
  await apiGetCours()
  loading.value = false
})
</script>

<template>
  <LoadingView v-if="loading" :visible="loading" />

  <div v-else class="clv-bilan container">
    <!-- ── En-tête ── -->
    <div class="bilan-header">
      <button class="btn-back" @click="goBack" type="button">
        <AppIcon name="arrowLeft" :size="18" />
        Retour
      </button>
      <div class="header-content">
        <h1 class="title">Bilans d'apprentissage</h1>
        <p class="subtitle">
          {{ totalBilans }} retour(s) d'élèves · {{ elevesActifs }} élève(s) actif(s)
        </p>
      </div>
    </div>

    <!-- ── Stats rapides ── -->
    <div class="stats-row">
      <div class="stat-card pro-card">
        <AppIcon name="layers" :size="22" class="stat-icon" />
        <div>
          <p class="stat-value">{{ totalBilans }}</p>
          <p class="stat-label">Bilans reçus</p>
        </div>
      </div>
      <div class="stat-card pro-card">
        <AppIcon name="user" :size="22" class="stat-icon" />
        <div>
          <p class="stat-value">{{ elevesActifs }}</p>
          <p class="stat-label">Élèves actifs</p>
        </div>
      </div>
    </div>

    <!-- ── Filtres ── -->
    <div class="filter-section pro-card">

      <!-- Filtre matière — masqué si une seule matière -->
      <div class="filter-group" v-if="matieres.length > 1">
        <label class="filter-label">
          <AppIcon name="tag" :size="12" />
          Matière 
        </label>
        <div class="cours-pills">
          <button
            class="pill"
            :class="{ 'pill--active': selectedMatiereId === null }"
            @click="selectMatiere(null)"
            type="button"
          >
            Toutes
          </button>
          <button
            v-for="m in matieres"
            :key="m.id"
            class="pill"
            :class="{ 'pill--active': selectedMatiereId === m.id }"
            @click="selectMatiere(m.id)"
            type="button"
          >
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- Filtre cours — liste restreinte selon matière -->
      <div class="filter-group">
        <label class="filter-label">
          <AppIcon name="book" :size="12" />
          Cours
        </label>
        <div class="cours-pills">
          <button
            class="pill"
            :class="{ 'pill--active': selectedCoursId === null }"
            @click="selectedCoursId = null"
            type="button"
          >
            Tous
          </button>
          <button
            v-for="c in coursFiltered"
            :key="c.id"
            class="pill"
            :class="{ 'pill--active': selectedCoursId === c.id }"
            @click="selectedCoursId = c.id"
            type="button"
          >
            {{ c.title || c.titre || `Cours #${c.id}` }}
            <span class="pill-count">{{ (c.retours_projections ?? []).length }}</span>
          </button>
        </div>
      </div>

      <!-- Recherche élève -->
      <div class="search-box">
        <AppIcon name="search" :size="16" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Rechercher un élève..." />
      </div>
    </div>

    <!-- ── Grille des bilans ── -->
    <div v-if="filteredFeedbacks.length" class="feedback-grid">
      <div v-for="f in filteredFeedbacks" :key="f.id" class="feedback-card pro-card">
        <div class="student-info">
          <div class="avatar">{{ f.student_name.charAt(0).toUpperCase() }}</div>
          <div class="student-meta">
            <span class="student-name">{{ f.student_name }}</span>
            <span class="cours-badge">{{ f.cours_title }}</span>
          </div>
        </div>

        <div class="content-sections">
          <div class="feedback-item">
            <div class="label">
              <AppIcon name="message" :size="13" />
              Ce qu'il a appris
            </div>
            <p class="text">{{ f.apprentissage || '—' }}</p>
          </div>

          <div class="feedback-item" v-if="f.methode_apprentissage">
            <div class="label">
              <AppIcon name="layers" :size="13" />
              Comment il l'a appris
            </div>
            <p class="text">{{ f.methode_apprentissage }}</p>
          </div>

          <div class="feedback-item feedback-item--warn" v-if="f.difficultes">
            <div class="label label--warn">
              <AppIcon name="difficulte" :size="13" />
              Difficultés rencontrées
            </div>
            <p class="text">{{ f.difficultes }}</p>
          </div>

          <div class="feedback-item feedback-item--projection" v-if="f.application_future">
            <div class="label label--projection">
              <AppIcon name="action" :size="13" />
              Application future
            </div>
            <p class="text italic">" {{ f.application_future }} "</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── État vide ── -->
    <div v-else class="empty-state pro-card">
      <AppIcon name="user" :size="48" />
      <p>
        Aucun bilan trouvé
        <span v-if="selectedCours"> pour « {{ selectedCours.title || selectedCours.titre }} »</span>.
      </p>
      <span class="empty-hint" v-if="searchQuery">Essayez de modifier votre recherche.</span>
    </div>
  </div>
</template>

<style scoped>
.clv-bilan {
  --midnight: green;
  --midnight-light: rgba(25, 25, 112, 0.08);
  --soft-blue: #f0f4ff;
  --danger: #ef4444;
  --danger-light: rgba(239, 68, 68, 0.08);
  --border: #e2e8f0;
  --text-main: #0f172a;
  --text-sub: #64748b;
  font-family: 'Plus Jakarta Sans', 'Verdana', sans-serif;
  padding: 20px 0 60px;
  color: var(--text-main);
}
.bilan-header { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
.btn-back {
  display: inline-flex; align-items: center; gap: 8px;
  background: none; border: none; color: var(--midnight);
  font-weight: 700; cursor: pointer; padding: 0; font-size: 0.9rem; width: fit-content;
}
.title { font-size: 1.6rem; font-weight: 900; color: var(--text-main); margin: 0; }
.subtitle { color: var(--text-sub); margin-top: 4px; font-size: 0.9rem; }
.stats-row { display: flex; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
.stat-card { flex: 1; min-width: 140px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; }
.stat-icon { color: var(--midnight); flex-shrink: 0; }
.stat-value { font-size: 1.4rem; font-weight: 900; color: var(--text-main); margin: 0; }
.stat-label { font-size: 0.75rem; color: var(--text-sub); margin: 0; }
.pro-card { background: white; border: 1.5px solid var(--border); border-radius: 12px; }
.filter-section { padding: 16px 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 18px; }
.filter-group { display: flex; flex-direction: column; }
.filter-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--text-sub); margin-bottom: 8px;
}
.cours-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.pill {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
  border-radius: 999px; border: 1.5px solid var(--border); background: #f8fafc;
  color: var(--text-sub); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.pill:hover { border-color: var(--midnight); color: var(--midnight); }
.pill--active { background: var(--midnight); color: white; border-color: var(--midnight); }
.pill-count {
  background: var(--midnight-light); color: var(--midnight);
  border-radius: 999px; padding: 1px 7px; font-size: 0.72rem; font-weight: 700;
}
.pill--active .pill-count { background: rgba(255,255,255,0.2); color: white; }
.search-box {
  display: flex; align-items: center; gap: 10px;
  background: #f8fafc; padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border);
}
.search-box input { background: none; border: none; outline: none; width: 100%; font-size: 0.9rem; font-family: inherit; }
.search-icon { color: var(--text-sub); flex-shrink: 0; }
.feedback-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }
.feedback-card {
  padding: 20px; display: flex; flex-direction: column; gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.feedback-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(25,25,112,0.08); }
.student-info {
  display: flex; align-items: center; gap: 12px;
  padding-bottom: 14px; border-bottom: 1px solid var(--soft-blue);
}
.avatar {
  width: 40px; height: 40px; background: var(--midnight); color: white;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1rem; flex-shrink: 0;
}
.student-meta { display: flex; flex-direction: column; gap: 3px; }
.student-name { font-weight: 700; color: var(--text-main); font-size: 0.95rem; }
.cours-badge {
  display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem;
  color: var(--midnight); background: var(--midnight-light); padding: 2px 8px;
  border-radius: 4px; font-weight: 600;
}
.content-sections { display: flex; flex-direction: column; gap: 12px; }
.feedback-item { padding: 10px 12px; border-radius: 8px; background: #f8fafc; border: 1px solid var(--border); }
.feedback-item--warn { background: var(--danger-light); border-color: rgba(239,68,68,0.2); }
.feedback-item--projection {
  background: var(--soft-blue); border-left: 3px solid var(--midnight);
  border-top-left-radius: 0; border-bottom-left-radius: 0;
}
.label {
  display: flex; align-items: center; gap: 5px; font-size: 0.7rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-sub); margin-bottom: 6px;
}
.label--warn { color: var(--danger); }
.label--projection { color: var(--midnight); }
.text { font-size: 0.88rem; line-height: 1.6; color: var(--text-main); margin: 0; }
.italic { font-style: italic; color: var(--midnight); }
.empty-state {
  padding: 60px 20px; text-align: center; color: var(--text-sub);
  display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 0.95rem;
}
.empty-hint { font-size: 0.8rem; opacity: 0.7; }
@media (max-width: 640px) {
  .feedback-grid { grid-template-columns: 1fr; }
  .stats-row { flex-direction: column; }
}
</style>