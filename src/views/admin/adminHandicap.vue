<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { apiGet, apiPost, apiDelete } from '@/helpers/axiosApi' // adapte le chemin à ton projet

/* User connecter */

const userAuth = ref(null)

const apiGetUser = async () => {
  const response = await apiGet('ecole/getEcole')
  userAuth.value = response.data
  console.log('userAuth.value:', userAuth.value)
}

//  Liste des handicaps 
const handicaps = ref([])
const loading   = ref(false)

const apiGetHandicaps = async () => {
  loading.value = true
  const response = await apiGet('ecole/handicap/index')
  handicaps.value = response.data
  console.log('handicaps.value:', handicaps.value)
  loading.value = false
}

//  Filtre recherche
const search = ref('')
const filtered = computed(() => {
  const s = search.value.toLowerCase()
  return !s ? handicaps.value : handicaps.value.filter(h => h.name.toLowerCase().includes(s))
})
const maxStudents = computed(() => Math.max(1, ...handicaps.value.map(h => h.studentsCount ?? 0)))

//  Couleurs avatar 
const CAT_GRADIENTS = {
  sensory:       'linear-gradient(135deg,#6D28D9,#D97706)',
  motor:         'linear-gradient(135deg,#D97706,#DC2626)',
  cognitive:     'linear-gradient(135deg,#2563EB,#6D28D9)',
  psychological: 'linear-gradient(135deg,#059669,#0D9488)',
}
function catGradient(cat) { return CAT_GRADIENTS[cat] ?? 'linear-gradient(135deg,#64748b,#334155)' }

//  Formulaire créer / modifier 
const showForm   = ref(false)
const editTarget = ref(null)
const form = reactive({ name: '' })

function openAdd() {
  editTarget.value = null
  form.name        = ''
  showForm.value   = true
}

function openEdit(h) {
  editTarget.value = h
  form.name        = h.name
  showForm.value   = true
}

//  CRÉER 
const apiPostHandicap = async () => {
  const response = await apiPost('ecole/handicap/store', {
    name:     form.name.trim(),
    ecole_id: userAuth.value.id,
  })
  console.log('handicap créé:', response.data)
  showForm.value = false
  await apiGetHandicaps()
}

//  MODIFIER ─
const apiUpdateHandicap = async () => {
  const response = await apiPost(`ecole/handicap/update/${editTarget.value.id}`, {
    name:     form.name.trim(),
    ecole_id: userAuth.value.id,
  })
  console.log('handicap modifié:', response.data)
  showForm.value = false
  await apiGetHandicaps()
}

// Bouton unique → branche sur la bonne fonction selon editTarget
const submitForm = async () => {
  if (!form.name.trim() || !userAuth.value) return
  if (editTarget.value) {
    await apiUpdateHandicap()
  } else {
    await apiPostHandicap()
  }
}

//  SUPPRIMER 
const showDelete   = ref(false)
const deleteTarget = ref(null)

function confirmDelete(h) {
  deleteTarget.value = h
  showDelete.value   = true
}

const apiDeleteHandicap = async () => {
  const response = await apiDelete(`ecole/handicap/destroy/${deleteTarget.value.id}`)
  console.log('handicap supprimé:', response.data)
  showDelete.value   = false
  deleteTarget.value = null
  await apiGetHandicaps()
}

const doDelete = async () => {
  if (!deleteTarget.value) return
  await apiDeleteHandicap()
}

//  Init au montage 
onMounted(async () => {
  await apiGetUser()
  await apiGetHandicaps()
})
</script>


<template>
  <div class="page container">

    <div class="page-header">
      <div>
        <h1 class="page-title">Profils de handicap</h1>
        <p class="page-sub">{{ handicaps.length }} profil(s) configuré(s)</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nouveau handicap
      </button>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" type="search" class="search-input" placeholder="Rechercher un profil…" />
      </div>
    </div>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Profil</th>
            <th>Élèves</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- État chargement -->
          <tr v-if="loading">
            <td colspan="3" style="text-align:center;padding:40px;color:#94a3b8">
              Chargement…
            </td>
          </tr>

          <template v-else>
            <tr v-for="h in filtered" :key="h.id">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="avatar" :style="{ background: catGradient(h.category) }">
                    <svg v-if="h.iconKey==='eye'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else-if="h.iconKey==='ear'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 0 1 0 4"/></svg>
                    <svg v-else-if="h.iconKey==='hand'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10.5V4a2 2 0 0 0-4 0v3"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8H7a8 8 0 0 1-5.32-2"/></svg>
                    <svg v-else-if="h.iconKey==='bolt'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    <svg v-else-if="h.iconKey==='edit'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div class="row-name">{{ h.name }}</div>
                </div>
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <strong style="font-size:.92rem">{{ h.studentsCount ?? 0 }}</strong>
                  <div class="bar-track"><div class="bar-fill" :style="{ width: maxStudents ? ((h.studentsCount ?? 0)/maxStudents*100)+'%' : '0%' }"></div></div>
                </div>
              </td>
              <td>
                <div style="display:flex;gap:4px;justify-content:flex-end">
                  <button class="icon-btn" @click="openEdit(h)" title="Modifier">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="icon-btn icon-btn-danger" @click="confirmDelete(h)" title="Supprimer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filtered.length">
              <td colspan="3" style="text-align:center;padding:40px;color:#94a3b8;font-style:italic">Aucun handicap trouvé.</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>


    <!-- ══ MODALE CRÉER / MODIFIER ══ -->
    <Teleport v-if="showForm" to="body">
      <div class="h-overlay" @click.self="showForm=false">
        <div class="h-modal">
          <div class="h-modal-head">
            <h2 class="h-modal-title">{{ editTarget ? 'Modifier le handicap' : 'Nouveau handicap' }}</h2>
            <button class="h-close-btn" @click="showForm=false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="h-modal-body">
            <label class="h-lbl">Nom du handicap <span class="h-req">*</span></label>
            <input v-model="form.name" class="h-inp" placeholder="Ex : Déficience visuelle"
              autofocus @keydown.enter.prevent="submitForm" @keydown.escape="showForm=false" />
          </div>
          <div class="h-modal-foot">
            <button class="h-btn h-btn-ghost" @click="showForm=false">Annuler</button>
            <button class="h-btn h-btn-primary" @click="submitForm" :disabled="!form.name.trim()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ editTarget ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ MODALE SUPPRESSION ══ -->
    <Teleport v-if="showDelete" to="body">
      <div class="h-overlay" @click.self="showDelete=false">
        <div class="h-modal">
          <div class="h-modal-head">
            <h2 class="h-modal-title">Supprimer ce profil ?</h2>
            <button class="h-close-btn" @click="showDelete=false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="h-modal-body" style="text-align:center">
            <div style="margin-bottom:14px">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="1.8" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <p style="color:#64748b;margin:0;line-height:1.6">
              Supprimer <strong>« {{ deleteTarget?.name }} »</strong> ?<br>Cette action est irréversible.
            </p>
          </div>
          <div class="h-modal-foot">
            <button class="h-btn h-btn-ghost" @click="showDelete=false">Annuler</button>
            <button class="h-btn h-btn-danger" @click="doDelete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>




<style scoped>
.page {
  --blue:#2563EB; --green:#059669; --red:#DC2626;
  --ink:#0f172a; --sub:#475569; --muted:#94a3b8;
  --border:#e2e8f0; --bg:#f8fafc;
  --r:10px; --r-lg:14px;
  --sh:0 1px 3px rgba(15,23,42,.07);
  font-family:'Inter',system-ui,sans-serif; color:var(--ink);
  display:flex; flex-direction:column; gap:20px;
}
.page-header { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.page-title  { font-size:1.5rem; font-weight:900; margin:0; }
.page-sub    { font-size:.82rem; color:var(--muted); margin:3px 0 0; }

.btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:var(--r); border:1.5px solid transparent; font-family:inherit; font-size:.84rem; font-weight:700; cursor:pointer; transition:all .15s; white-space:nowrap; }
.btn:disabled { opacity:.45; cursor:not-allowed; }
.btn-primary { background:var(--blue); color:white; border-color:var(--blue); }
.btn-primary:hover:not(:disabled) { background:#1d4ed8; }

.toolbar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.search-wrap { position:relative; flex:1; min-width:200px; }
.search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; }
.search-input { width:100%; padding:8px 12px 8px 34px; box-sizing:border-box; border:1.5px solid var(--border); border-radius:var(--r); font-family:inherit; font-size:.84rem; color:var(--ink); background:white; outline:none; transition:border-color .15s; }
.search-input:focus { border-color:var(--blue); }

.table-wrap { background:white; border:1.5px solid var(--border); border-radius:var(--r-lg); overflow:hidden; box-shadow:var(--sh); }
.table { width:100%; border-collapse:collapse; }
.table th { padding:10px 16px; font-size:.7rem; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; background:var(--bg); border-bottom:1.5px solid var(--border); text-align:left; }
.table td { padding:13px 16px; border-bottom:1px solid var(--border); vertical-align:middle; }
.table tr:last-child td { border-bottom:none; }
.table tbody tr:hover { background:var(--bg); }
.row-name { font-size:.9rem; font-weight:700; }

.avatar { width:38px; height:38px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.bar-track { width:50px; height:5px; border-radius:3px; background:var(--border); overflow:hidden; }
.bar-fill  { height:100%; border-radius:3px; background:var(--blue); transition:width .4s; }
.icon-btn { width:30px; height:30px; border-radius:7px; border:1.5px solid var(--border); background:white; color:var(--sub); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .13s; }
.icon-btn:hover { border-color:var(--blue); color:var(--blue); background:rgba(37,99,235,.06); }
.icon-btn-danger:hover { border-color:var(--red); color:var(--red); background:rgba(220,38,38,.06); }
</style>


<style>
.h-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 9999;
  background: rgba(15,23,42,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}
.h-modal {
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(15,23,42,.18);
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.h-modal-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #e2e8f0; }
.h-modal-title { font-size:.95rem; font-weight:800; margin:0; color:#0f172a; font-family:'Inter',system-ui,sans-serif; }
.h-close-btn { width:28px; height:28px; border-radius:7px; border:1.5px solid #e2e8f0; background:white; color:#94a3b8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .13s; }
.h-close-btn:hover { border-color:#DC2626; color:#DC2626; }
.h-modal-body { padding:20px; }
.h-modal-foot { display:flex; gap:10px; justify-content:flex-end; padding:14px 20px; border-top:1px solid #e2e8f0; }
.h-lbl { display:block; font-size:.78rem; font-weight:700; color:#475569; margin-bottom:5px; font-family:'Inter',system-ui,sans-serif; }
.h-req { color:#DC2626; }
.h-inp { width:100%; padding:9px 13px; box-sizing:border-box; border:1.5px solid #e2e8f0; border-radius:10px; font-family:'Inter',system-ui,sans-serif; font-size:.88rem; color:#0f172a; background:white; outline:none; transition:border-color .15s,box-shadow .15s; }
.h-inp:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
.h-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; border:1.5px solid transparent; font-family:'Inter',system-ui,sans-serif; font-size:.84rem; font-weight:700; cursor:pointer; transition:all .15s; }
.h-btn:disabled { opacity:.45; cursor:not-allowed; }
.h-btn-primary { background:#2563EB; color:white; border-color:#2563EB; }
.h-btn-primary:hover:not(:disabled) { background:#1d4ed8; }
.h-btn-ghost { background:white; color:#475569; border-color:#e2e8f0; }
.h-btn-ghost:hover { border-color:#0f172a; color:#0f172a; }
.h-btn-danger { background:#DC2626; color:white; border-color:#DC2626; }
.h-btn-danger:hover:not(:disabled) { background:#b91c1c; }

/* spinner sur les boutons en cours de chargement */
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin .7s linear infinite; }
</style>