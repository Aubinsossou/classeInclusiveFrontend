<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🧒 Mes élèves</h1>
        <p class="page-sub">{{ connectedStudents.length }} connecté(s) en ce moment</p>
      </div>
    </div>

    <section aria-labelledby="live-title">
      <div class="section-header">
        <h2 id="live-title" class="section-title">
          🟢 Élèves connectés
          <span class="live-dot" aria-label="En direct"></span>
        </h2>
      </div>
      
      <div v-if="connectedStudents.length" class="live-grid" role="list" aria-label="Élèves actuellement connectés">
        <div v-for="s in connectedStudents" :key="s.id"
          class="live-card" role="listitem"
          :class="`lc-${s.profile}`"
          :aria-label="`${s.name}, ${s.currentCourse}, progression ${s.progress}%`">
          <div class="lc-top">
            <div class="lc-avatar" aria-hidden="true">{{ profileIcon(s.profile) }}</div>
            <div class="lc-info">
              <div class="lc-name">{{ s.name }}</div>
              <div class="lc-profile">{{ profileLabel(s.profile) }}</div>
            </div>
            <div class="lc-time" :aria-label="`Connecté à ${s.connectedAt}`">🕐 {{ s.connectedAt }}</div>
          </div>
          <div class="lc-course">
            <span aria-hidden="true">📖</span>
            <span>{{ s.currentCourse }}</span>
          </div>
          <div class="lc-progress-wrap">
            <div class="lc-bar" role="progressbar" :aria-valuenow="s.progress" aria-valuemin="0" aria-valuemax="100" :aria-label="`Progression : ${s.progress}%`">
              <div class="lc-fill" :style="{ width: s.progress + '%' }"></div>
            </div>
            <span class="lc-pct">{{ s.progress }}%</span>
          </div>
          <div class="lc-footer">
            <span class="lc-badge-online">● En ligne</span>
            <span class="lc-class">Classe {{ teacherClassIds.includes(s.classId) ? getClassName(s.classId) : '—' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <span aria-hidden="true">🟡</span>
        <p>Aucun élève connecté en ce moment.</p>
      </div>
    </section>

    <section aria-labelledby="all-students-title" style="margin-top: 28px;">
      <div class="section-header">
        <h2 id="all-students-title" class="section-title">📋 Tous mes élèves</h2>
        <div class="filters">
          <select v-model="filterClass" class="filter-select" aria-label="Filtrer par classe">
            <option value="">Toutes mes classes</option>
            <option v-for="cid in teacherClassIds" :key="cid" :value="cid">
              {{ getClassName(cid) }}
            </option>
          </select>
          <select v-model="filterProfile" class="filter-select" aria-label="Filtrer par profil">
            <option value="">Tous les profils</option>
            <option v-for="p in PROFILES" :key="p.value" :value="p.value">{{ p.icon }} {{ p.label }}</option>
          </select>
        </div>
      </div>

      <div class="data-table-wrap">
        <table class="data-table" aria-label="Liste des élèves">
          <thead>
            <tr>
              <th scope="col">Élève</th>
              <th scope="col">Profil</th>
              <th scope="col">Classe</th>
              <th scope="col">Statut</th>
              <th scope="col">Progression moyenne</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredStudents" :key="s.id" class="dt-row"
              :aria-label="`${s.name}, profil ${s.profile}, ${s.active ? 'actif' : 'inactif'}`">
              <td>
                <div class="td-name-cell">
                  <div class="td-avatar" :style="{ background: profileGradient(s.profile) }" aria-hidden="true">
                    {{ profileIcon(s.profile) }}
                  </div>
                  <div>
                    <div class="td-name">{{ s.name }}</div>
                    <div class="td-dob">{{ formatDate(s.dob) }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" :class="`badge-${s.profile}`">
                  {{ profileIcon(s.profile) }} {{ profileLabel(s.profile) }}
                </span>
              </td>
              <td><span class="badge badge-blue">{{ getClassName(s.classId) }}</span></td>
              <td>
                <span class="status-dot" :class="isConnected(s.id) ? 'sd-online' : (s.active ? 'sd-active' : 'sd-inactive')">
                  {{ isConnected(s.id) ? '● En ligne' : (s.active ? '○ Actif' : '✕ Inactif') }}
                </span>
              </td>
              <td>
                <div class="prog-cell">
                  <div class="prog-bar">
                    <div class="prog-fill" :style="{ width: mockProgress(s.id) + '%' }"></div>
                  </div>
                  <span class="prog-pct">{{ mockProgress(s.id) }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredStudents.length">
              <td colspan="5" class="empty-row">Aucun élève trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- DONNÉES SIMULÉES (Mocks) ---
const teacherClassIds = [1, 2]

const classes = [
  { id: 1, name: 'CP - A' },
  { id: 2, name: 'CE1 - B' }
]

const PROFILES = [
  { value: 'standard', icon: '👤', label: 'Standard' },
  { value: 'visual', icon: '👁️', label: 'Visuel' },
  { value: 'hearing', icon: '👂', label: 'Auditif' },
  { value: 'motor', icon: '🖐️', label: 'Moteur' }
]

const allStudents = [
  { id: 1, name: 'Léa Dubois', dob: '2015-04-12', profile: 'visual', classId: 1, active: true },
  { id: 2, name: 'Tom Martin', dob: '2016-02-24', profile: 'hearing', classId: 1, active: true },
  { id: 3, name: 'Emma Blanc', dob: '2015-11-03', profile: 'motor', classId: 2, active: false },
  { id: 4, name: 'Lucas Lorie', dob: '2016-08-14', profile: 'standard', classId: 2, active: true },
  { id: 5, name: 'Hugo Leroy', dob: '2015-01-22', profile: 'standard', classId: 1, active: true }
]

const connectedStudents = [
  { id: 1, name: 'Léa Dubois', profile: 'visual', currentCourse: 'Les additions', connectedAt: '10:05', progress: 80, classId: 1 },
  { id: 4, name: 'Lucas Lorie', profile: 'standard', currentCourse: 'La phrase', connectedAt: '09:30', progress: 45, classId: 2 }
]

// --- ÉTAT DU COMPOSANT ---
const filterClass = ref('')
const filterProfile = ref('')

// --- LOGIQUE CALCULÉE ---
const myStudents = computed(() => {
  return allStudents.filter(s => teacherClassIds.includes(s.classId))
})

const filteredStudents = computed(() => {
  return myStudents.value.filter(s => {
    const mc = !filterClass.value   || s.classId === Number(filterClass.value)
    const mp = !filterProfile.value || s.profile === filterProfile.value
    return mc && mp
  })
})

// --- FONCTIONS UTILITAIRES ---
function getClassName(classId) {
  return classes.find(c => c.id === classId)?.name ?? `Classe ${classId}`
}

function isConnected(studentId) {
  return connectedStudents.some(s => s.id === studentId)
}

function mockProgress(id) {
  const connected = connectedStudents.find(s => s.id === id)
  if (connected) return connected.progress
  return [0, 25, 50, 60, 75, 80, 90, 100][id % 8]
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('fr-FR') : '—'
}

// --- FONCTIONS D'AFFICHAGE (Profils) ---
const profileIcons  = { standard:'👤', visual:'👁️', hearing:'👂', motor:'🖐️' }
const profileLabels = { standard:'Standard', visual:'Visuel', hearing:'Auditif', motor:'Moteur' }
const profileGrads  = { 
  standard:'linear-gradient(135deg,#4BBFED,#2EA8DC)', 
  visual:'linear-gradient(135deg,#9B7BFF,#7B5BDF)', 
  hearing:'linear-gradient(135deg,#22D4A0,#17B484)', 
  motor:'linear-gradient(135deg,#FFC842,#FF8C42)' 
}

function profileIcon(p)     { return profileIcons[p]  || '👤' }
function profileLabel(p)    { return profileLabels[p] || p }
function profileGradient(p) { return profileGrads[p]  || profileGrads.standard }
</script>

<style scoped>
/* --- MISE EN PAGE PRINCIPALE --- */
.admin-page   { display: flex; flex-direction: column; gap: 20px; font-family: sans-serif; }
.page-header  { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.page-title   { font-size: 1.8rem; font-weight: 900; color: var(--ink, #1a2b5e); margin: 0; }
.page-sub     { color: var(--slate, #64748b); font-size: 0.9rem; margin-top: 4px; }

.section-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
.section-title  { font-size: 1.2rem; font-weight: 900; color: var(--ink, #1a2b5e); display: flex; align-items: center; gap: 8px; margin: 0; }
.live-dot { width: 10px; height: 10px; border-radius: 50%; background: #22D4A0; display: inline-block; animation: pulse 1.5s ease-in-out infinite; box-shadow: 0 0 0 4px rgba(34,212,160,0.2); }

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 212, 160, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 212, 160, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 212, 160, 0); }
}

/* --- GRILLE DES ÉLÈVES CONNECTÉS --- */
.live-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.live-card {
  background: var(--c-card, #ffffff); border-radius: var(--r-lg, 16px);
  padding: 18px; box-shadow: var(--s-card, 0 4px 6px rgba(0,0,0,0.05));
  border: 2.5px solid var(--c-border, #e2e8f0);
  display: flex; flex-direction: column; gap: 10px;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.live-card:hover { transform: translateY(-3px); box-shadow: var(--s-hover, 0 10px 15px rgba(0,0,0,0.1)); }
.lc-standard { border-left: 5px solid #4BBFED; }
.lc-visual   { border-left: 5px solid #9B7BFF; }
.lc-hearing  { border-left: 5px solid #22D4A0; }
.lc-motor    { border-left: 5px solid #FFC842; }

.lc-top    { display: flex; align-items: center; gap: 10px; }
.lc-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--cloud, #f1f5f9); font-size: 1.3rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lc-info   { flex: 1; min-width: 0; }
.lc-name   { font-weight: 800; font-size: 0.95rem; color: var(--ink, #1a2b5e); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lc-profile{ font-size: 0.75rem; color: var(--slate, #64748b); }
.lc-time   { font-size: 0.75rem; color: var(--mist, #a0aec0); white-space: nowrap; flex-shrink: 0; }

.lc-course { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--slate, #64748b); font-weight: 600; }

.lc-progress-wrap { display: flex; align-items: center; gap: 8px; }
.lc-bar  { flex: 1; height: 8px; background: var(--cloud, #f1f5f9); border-radius: 8px; overflow: hidden; }
.lc-fill { height: 100%; background: linear-gradient(90deg, #22D4A0, #4BBFED); border-radius: 8px; transition: width 1s ease; }
.lc-pct  { font-weight: 900; font-size: 0.9rem; color: #22D4A0; white-space: nowrap; }

.lc-footer { display: flex; align-items: center; justify-content: space-between; }
.lc-badge-online { background: rgba(34,212,160,0.15); color: #0A7A54; border-radius: 8px; padding: 3px 10px; font-size: 0.75rem; font-weight: 800; }
.lc-class { font-size: 0.75rem; color: var(--mist, #a0aec0); }

/* --- FILTRES --- */
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-select { padding: 8px 14px; border: 2px solid var(--c-border, #e2e8f0); border-radius: var(--r-md, 8px); font-weight: 600; font-size: 0.85rem; color: var(--ink, #1a2b5e); background: var(--c-card, #ffffff); cursor: pointer; outline: none; transition: border-color 0.2s; }
.filter-select:focus { border-color: #22D4A0; }

/* --- TABLEAU --- */
.data-table-wrap { background: var(--c-card, #ffffff); border-radius: var(--r-lg, 16px); box-shadow: var(--s-card, 0 4px 6px rgba(0,0,0,0.05)); border: 2px solid var(--c-border, #e2e8f0); overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 12px 16px; text-align: left; font-size: 0.78rem; font-weight: 800; color: var(--slate, #64748b); text-transform: uppercase; letter-spacing: 0.5px; background: #fafafa; border-bottom: 2px solid var(--c-border, #e2e8f0); white-space: nowrap; }
.data-table td { padding: 12px 16px; border-bottom: 1.5px solid var(--cloud, #f1f5f9); font-size: 0.88rem; color: var(--ink, #1a2b5e); vertical-align: middle; }
.dt-row:last-child td { border-bottom: none; }
.dt-row:hover td { background: rgba(34,212,160,0.04); }

.td-name-cell { display: flex; align-items: center; gap: 10px; }
.td-avatar { width: 34px; height: 34px; border-radius: 50%; color: white; font-size: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.td-name { font-weight: 800; }
.td-dob  { font-size: 0.75rem; color: var(--mist, #a0aec0); }

.badge { display: inline-block; border-radius: 8px; padding: 3px 10px; font-size: 0.78rem; font-weight: 800; }
.badge-blue     { background: #e0f2fe; color: #1A88B8; }
.badge-standard { background: #e0f2fe; color: #1A88B8; }
.badge-visual   { background: #f3e8ff; color: #6B3FBF; }
.badge-hearing  { background: #dcfce7; color: #0A7A54; }
.badge-motor    { background: #fef3c7; color: #A07000; }

.status-dot { border-radius: 8px; padding: 4px 10px; font-size: 0.78rem; font-weight: 800; display: inline-block; }
.sd-online   { background: rgba(34,212,160,0.15); color: #0A7A54; }
.sd-active   { background: var(--cloud, #f1f5f9); color: var(--slate, #64748b); }
.sd-inactive { background: #fee2e2; color: #B02020; }

.prog-cell { display: flex; align-items: center; gap: 8px; }
.prog-bar  { flex: 1; height: 6px; background: var(--cloud, #f1f5f9); border-radius: 6px; overflow: hidden; min-width: 60px; }
.prog-fill { height: 100%; background: linear-gradient(90deg, #22D4A0, #4BBFED); border-radius: 6px; }
.prog-pct  { font-size: 0.78rem; font-weight: 800; color: var(--ink, #1a2b5e); white-space: nowrap; }

.empty-state { text-align: center; padding: 40px; color: var(--mist, #a0aec0); }
.empty-state span { font-size: 3rem; display: block; margin-bottom: 12px; }
.empty-row { text-align: center; color: var(--mist, #a0aec0); padding: 32px !important; font-style: italic; }
</style>