<script setup>
import { ref, computed, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet, apiDelete } from '@/helpers/axiosApi'
import LoadingView from '@/components/admin/Loading.vue'


const svgPaths = {
  plus:    '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  book:    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  edit:    '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash:   '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  quiz:    '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  video:   '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
  image:   '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  audio:   '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  check:   '<polyline points="20 6 9 17 4 12"/>',
  eye:     '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
}
const AppIcon = (props) => h('svg', {
  width: props.size || 18, height: props.size || 18,
  viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8,
  strokeLinecap: 'round', strokeLinejoin: 'round',
  innerHTML: svgPaths[props.name] || '<circle cx="12" cy="12" r="4"/>',
})

const router   = useRouter()
const userAuth = ref(null)
const cours    = ref([])
const loading  = ref(true)
const error    = ref(null)

const apiGetUser = async () => {
  const response = await apiGet('enseignant/getEnseignant')
  userAuth.value = response.data.data
}

const apiGetCours = async () => {
  const response = await apiGet('enseignant/cours/index')
  cours.value = Array.isArray(response.data?.data)
    ? response.data.data
    : Array.isArray(response.data) ? response.data : []
}

onMounted(async () => {
  try {
    await apiGetUser()
    await apiGetCours()
  } catch (e) {
    error.value = 'Erreur lors du chargement des cours.'
    console.error(e)
  } finally {
    loading.value = false
  }
})

const mySubjects = computed(() => userAuth.value?.classe?.matieres ?? [])

const filterStatus  = ref('all')
const filterMatiere = ref(null)

const statusFilters = [
  { value: 'all',       label: 'Tous' },
  { value: 'published', label: 'Publiés' },
  { value: 'draft',     label: 'Brouillons' },
]

const filtered = computed(() => {
  let list = cours.value
  if (filterStatus.value !== 'all') {
    list = list.filter(c => filterStatus.value === 'published' ? c.is_published : !c.is_published)
  }
  if (filterMatiere.value) {
    list = list.filter(c => c.matiere_id === filterMatiere.value)
  }
  return list
})

const showDelete   = ref(false)
const deleteTarget = ref(null)
const deleting     = ref(false)

function confirmDelete(c) { deleteTarget.value = c; showDelete.value = true }

const doDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await apiDelete(`enseignant/cours/destroy/${deleteTarget.value.id}`)
    cours.value = cours.value.filter(c => c.id !== deleteTarget.value.id)
    showDelete.value = false
    deleteTarget.value = null
  } catch (e) {
    console.error('Erreur suppression:', e)
  } finally {
    deleting.value = false
  }
}

function goCreate() { router.push({ name: 'enseignantcoursform' }) }
function goEdit(c)  { router.push({ name: 'enseignantcoursformedit', params: { id: c.id } }) }

function getMatiereName(matiere_id) {
  return mySubjects.value.find(m => m.id === matiere_id)?.name ?? '—'
}

// Retourne uniquement une image comme thumbnail, jamais une vidéo
function getThumbnail(c) {
  if (!c.medias?.length) return null
  return c.medias.find(m => m.type === 'image')?.url ?? null
}

function hasVideo(c) {
  return c.medias?.some(m => m.type === 'video') ?? false
}

function getMediaIcon(c) {
  if (!c.medias?.length) return 'book'
  if (c.medias.some(m => m.type === 'video')) return 'video'
  if (c.medias.some(m => m.type === 'image')) return 'image'
  return 'audio'
}
function mediaCount(c, type) { return c.medias?.filter(m => m.type === type).length ?? 0 }
</script>

<template>
  <LoadingView v-if="loading" :visible="loading" :fullscreen="true" message="Chargement" offset-top="100px" />

  <div class="clv-root container">

    <div v-if="error" class="clv-error pro-card">
      <AppIcon name="warning" :size="32" />
      <p>{{ error }}</p>
    </div>

    <template v-else-if="!loading">

      <!-- EN-TÊTE -->
      <div class="clv-header">
        <div>
          <h1 class="clv-title">Mes cours</h1>
          <p class="clv-sub">{{ cours.length }} cours créé{{ cours.length > 1 ? 's' : '' }}</p>
        </div>
        <button class="pro-btn pro-btn-green" @click="goCreate">
          <AppIcon name="plus" :size="15" /> Créer un cours
        </button>
      </div>

      <!-- FILTRES -->
      <div class="clv-filters-bar">
        <div class="filter-group">
          <span class="filter-sep-label">Statut</span>
          <button
            v-for="f in statusFilters" :key="f.value"
            class="filter-tab"
            :class="{ 'filter-tab-active': filterStatus === f.value }"
            @click="filterStatus = f.value"
          >{{ f.label }}</button>
        </div>

        <div class="filter-divider" v-if="mySubjects.length"></div>

        <div class="filter-group" v-if="mySubjects.length">
          <span class="filter-sep-label">Matière</span>
          <button
            class="filter-tab"
            :class="{ 'filter-tab-active': filterMatiere === null }"
            @click="filterMatiere = null"
          >Toutes</button>
          <button
            v-for="m in mySubjects" :key="m.id"
            class="filter-tab"
            :class="{ 'filter-tab-active': filterMatiere === m.id }"
            @click="filterMatiere = filterMatiere === m.id ? null : m.id"
          >{{ m.name }}</button>
        </div>
      </div>

      <!-- LISTE -->
      <div v-if="filtered.length" class="clv-list">
        <div
          v-for="c in filtered" :key="c.id"
          class="cours-card pro-card"
          :class="{ 'cc-draft': !c.is_published }"
        >
          <!-- THUMBNAIL -->
          <div class="cc-thumb">
            <!-- Image disponible -->
            <img v-if="getThumbnail(c)" :src="getThumbnail(c)" :alt="c.title" class="cc-img" />
            <!-- Vidéo sans image → icône bleue -->
            <div v-else-if="hasVideo(c)" class="cc-icon-wrap cc-icon-video">
              <AppIcon name="video" :size="26" />
            </div>
            <!-- Aucun média ou audio seul → icône neutre -->
            <div v-else class="cc-icon-wrap">
              <AppIcon :name="getMediaIcon(c)" :size="26" />
            </div>
            <span class="cc-status-dot" :class="c.is_published ? 'dot-green' : 'dot-gray'"></span>
          </div>

          <div class="cc-body">
            <div class="cc-top">
              <div class="cc-title">{{ c.title }}</div>
              <span class="cc-badge" :class="c.is_published ? 'badge-green' : 'badge-gray'">
                <AppIcon :name="c.is_published ? 'check' : 'eye'" :size="10" />
                {{ c.is_published ? 'Publié' : 'Brouillon' }}
              </span>
            </div>
            <p v-if="c.description" class="cc-desc">{{ c.description }}</p>
            <div class="cc-meta">
              <span class="cc-chip cc-chip-blue">{{ getMatiereName(c.matiere_id) }}</span>
              <span v-if="mediaCount(c, 'video')" class="cc-chip">
                <AppIcon name="video" :size="11" /> {{ mediaCount(c, 'video') }} vidéo{{ mediaCount(c, 'video') > 1 ? 's' : '' }}
              </span>
              <span v-if="mediaCount(c, 'image')" class="cc-chip">
                <AppIcon name="image" :size="11" /> {{ mediaCount(c, 'image') }} image{{ mediaCount(c, 'image') > 1 ? 's' : '' }}
              </span>
              <span v-if="mediaCount(c, 'audio')" class="cc-chip">
                <AppIcon name="audio" :size="11" /> {{ mediaCount(c, 'audio') }} audio{{ mediaCount(c, 'audio') > 1 ? 's' : '' }}
              </span>
              <span v-if="c.quizzes?.length" class="cc-chip cc-chip-violet">
                <AppIcon name="quiz" :size="11" /> {{ c.quizzes.length }} quiz
              </span>
            </div>
          </div>

          <div class="cc-actions">
            <button class="act-btn act-edit" @click="goEdit(c)" title="Modifier">
              <AppIcon name="edit" :size="14" /><span>Modifier</span>
            </button>
            <button class="pro-icon-btn pro-icon-btn-danger" @click="confirmDelete(c)" title="Supprimer">
              <AppIcon name="trash" :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div v-else class="clv-empty pro-card">
        <AppIcon name="book" :size="48" class="empty-icon" />
        <p class="empty-title">Aucun cours</p>
        <p class="empty-sub">
          {{ filterStatus !== 'all' || filterMatiere ? 'Aucun cours dans cette catégorie.' : 'Créez votre premier cours inclusif !' }}
        </p>
        <button v-if="filterStatus === 'all' && !filterMatiere" class="pro-btn pro-btn-green" style="margin-top:16px" @click="goCreate">
          <AppIcon name="plus" :size="15" /> Créer un cours
        </button>
      </div>

    </template>

    <!-- MODALE SUPPRESSION -->
    <Transition name="modal">
      <div v-if="showDelete" class="modal-overlay" @click.self="showDelete = false">
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-icon-danger"><AppIcon name="warning" :size="22" /></div>
            <h3 class="modal-title">Supprimer ce cours ?</h3>
          </div>
          <p class="modal-body">
            Voulez-vous vraiment supprimer <strong>« {{ deleteTarget?.title }} »</strong> ?
            Les médias associés seront également supprimés. Cette action est irréversible.
          </p>
          <div class="modal-actions">
            <button class="pro-btn pro-btn-ghost" @click="showDelete = false">Annuler</button>
            <button class="pro-btn pro-btn-danger" @click="doDelete" :disabled="deleting">
              <AppIcon name="trash" :size="14" />
              {{ deleting ? 'Suppression…' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.clv-root {
  --pro-green:#10b981; --pro-green-soft:#d1fae5;
  --pro-blue:#3b82f6;  --pro-blue-soft:#dbeafe;
  --pro-violet:#8b5cf6; --pro-violet-soft:#ede9fe;
  --pro-red:#ef4444;   --pro-red-soft:#fee2e2;
  --pro-border:#e2e8f0; --pro-muted:#94a3b8; --pro-sub:#475569;
  --pro-ink:#0f172a;   --pro-bg:#f8fafc;
  --pro-font:'Plus Jakarta Sans','Nunito',system-ui,sans-serif;
  --pro-r-md:8px; --pro-r-lg:12px;
  --pro-shadow-lg:0 10px 15px -3px rgba(0,0,0,.1);
  display:flex; flex-direction:column; gap:20px;
  font-family:var(--pro-font);
}

.clv-error { display:flex; flex-direction:column; align-items:center; gap:10px; padding:40px; color:var(--pro-red); text-align:center; }

.clv-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
.clv-title  { font-size:1.8rem; font-weight:900; color:var(--pro-ink); margin:0; }
.clv-sub    { font-size:.9rem; color:var(--pro-muted); margin:4px 0 0; }

.clv-filters-bar { display:flex; align-items:center; gap:6px; flex-wrap:wrap; padding:10px 14px; background:white; border:1.5px solid var(--pro-border); border-radius:var(--pro-r-lg); }
.filter-group { display:flex; align-items:center; gap:5px; flex-wrap:wrap; }
.filter-sep-label { font-size:.7rem; font-weight:800; color:var(--pro-muted); text-transform:uppercase; letter-spacing:.07em; margin-right:2px; white-space:nowrap; }
.filter-divider { width:1px; height:22px; background:var(--pro-border); margin:0 8px; flex-shrink:0; }
.filter-tab { padding:4px 12px; border-radius:100px; border:1.5px solid var(--pro-border); background:var(--pro-bg); font-size:.78rem; font-weight:700; color:var(--pro-sub); cursor:pointer; transition:all .15s; font-family:var(--pro-font); white-space:nowrap; }
.filter-tab:hover { border-color:var(--pro-green); color:var(--pro-green); background:var(--pro-green-soft); }
.filter-tab-active { background:var(--pro-green); border-color:var(--pro-green); color:white; }

.pro-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 16px; border-radius:var(--pro-r-md); font-size:.85rem; font-weight:700; cursor:pointer; border:none; transition:all .2s; white-space:nowrap; font-family:var(--pro-font); }
.pro-btn-green { background:var(--pro-green); color:white; }
.pro-btn-green:hover { background:#059669; }
.pro-btn-ghost { background:transparent; border:1.5px solid var(--pro-border); color:var(--pro-ink); }
.pro-btn-ghost:hover { background:var(--pro-bg); }
.pro-btn-danger { background:var(--pro-red); color:white; }
.pro-btn-danger:hover:not(:disabled) { background:#dc2626; }
.pro-btn-danger:disabled { opacity:.6; cursor:not-allowed; }
.pro-icon-btn { display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:var(--pro-r-md); border:1.5px solid transparent; background:transparent; cursor:pointer; transition:all .15s; }
.pro-icon-btn-danger { color:var(--pro-muted); }
.pro-icon-btn-danger:hover { background:var(--pro-red-soft); color:var(--pro-red); border-color:#fecaca; }
.pro-card { background:white; border:1.5px solid var(--pro-border); border-radius:var(--pro-r-lg); }

.clv-list { display:flex; flex-direction:column; gap:10px; }
.cours-card { display:flex; align-items:center; gap:16px; padding:16px 18px; transition:transform .18s ease, box-shadow .18s ease; }
.cours-card:hover { transform:translateX(4px); box-shadow:var(--pro-shadow-lg); }
.cc-draft { opacity:.82; }

.cc-thumb { position:relative; width:64px; height:64px; flex-shrink:0; }
.cc-img { width:64px; height:64px; object-fit:cover; border-radius:10px; border:1.5px solid var(--pro-border); }
.cc-icon-wrap { width:64px; height:64px; border-radius:10px; background:var(--pro-bg); border:1.5px solid var(--pro-border); display:flex; align-items:center; justify-content:center; color:var(--pro-muted); }
.cc-icon-video { background:var(--pro-blue-soft); color:var(--pro-blue); border-color:rgba(59,130,246,.2); }
.cc-status-dot { position:absolute; bottom:3px; right:3px; width:10px; height:10px; border-radius:50%; border:2px solid white; }
.dot-green { background:var(--pro-green); }
.dot-gray  { background:var(--pro-muted); }

.cc-body  { flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.cc-top   { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.cc-title { font-size:.98rem; font-weight:800; color:var(--pro-ink); line-height:1.3; }
.cc-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:100px; font-size:.68rem; font-weight:700; flex-shrink:0; }
.badge-green { background:var(--pro-green-soft); color:var(--pro-green); }
.badge-gray  { background:#f1f5f9; color:var(--pro-muted); }
.cc-desc  { font-size:.82rem; color:var(--pro-muted); margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cc-meta  { display:flex; gap:5px; flex-wrap:wrap; }
.cc-chip  { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:6px; font-size:.7rem; font-weight:700; background:#f1f5f9; color:var(--pro-sub); }
.cc-chip-blue   { background:var(--pro-blue-soft); color:var(--pro-blue); }
.cc-chip-violet { background:var(--pro-violet-soft); color:var(--pro-violet); }

.cc-actions { display:flex; align-items:center; gap:6px; flex-shrink:0; }
.act-btn { display:inline-flex; align-items:center; gap:5px; padding:7px 12px; border-radius:var(--pro-r-md); border:1.5px solid var(--pro-border); background:white; font-size:.78rem; font-weight:700; cursor:pointer; transition:all .15s; white-space:nowrap; font-family:var(--pro-font); color:var(--pro-sub); }
.act-btn span { display:none; }
@media(min-width:640px) { .act-btn span { display:inline; } }
.act-edit:hover { background:var(--pro-bg); border-color:var(--pro-ink); color:var(--pro-ink); }

.clv-empty { display:flex; flex-direction:column; align-items:center; text-align:center; padding:52px 40px; }
.empty-icon  { opacity:.35; color:var(--pro-muted); }
.empty-title { font-size:1rem; font-weight:800; color:var(--pro-ink); margin:12px 0 4px; }
.empty-sub   { font-size:.85rem; color:var(--pro-muted); margin:0; }

.modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.55); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; backdrop-filter:blur(3px); }
.modal-box { background:white; border-radius:16px; padding:24px; max-width:420px; width:100%; box-shadow:0 20px 40px rgba(0,0,0,.15); }
.modal-header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.modal-icon-danger { width:40px; height:40px; border-radius:10px; background:var(--pro-red-soft); color:var(--pro-red); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.modal-title { font-size:1.1rem; font-weight:800; color:var(--pro-ink); margin:0; }
.modal-body  { font-size:.88rem; color:var(--pro-sub); line-height:1.6; margin:0 0 22px; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; }

.modal-enter-active { animation:modalIn .25s cubic-bezier(.34,1.56,.64,1); }
.modal-leave-active { animation:modalIn .15s ease reverse; }
@keyframes modalIn { from { opacity:0; transform:scale(.95) } to { opacity:1; transform:scale(1) } }

@media(max-width:560px) {
  .cours-card { flex-wrap:wrap; }
  .cc-actions { width:100%; justify-content:flex-end; }
  .clv-filters-bar { gap:4px; }
  .filter-divider { display:none; }
}
</style>