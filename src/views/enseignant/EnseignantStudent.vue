<template>
  <div class="students-root">

    <div class="pro-page-header">
      <div>
        <h1 class="pro-page-title">Mes élèves</h1>
        <p class="pro-page-sub">{{ store.myConnectedStudents.length }} connecté(s) en ce moment</p>
      </div>
    </div>

    <section aria-labelledby="live-title">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <h2 id="live-title" style="font-size:1rem;font-weight:800;color:var(--pro-ink);margin:0">Élèves connectés</h2>
        <span class="live-pill">
          <span class="live-dot"></span> En direct
        </span>
      </div>

      <div v-if="store.myConnectedStudents.length" class="live-grid" role="list">
        <div v-for="s in store.myConnectedStudents" :key="s.id"
          class="live-card pro-card" role="listitem"
          :style="{ '--lc': profileColor(s.profile), '--ls': profileSoft(s.profile) }"
          :aria-label="`${s.name}, ${s.currentCourse}, ${s.progress}%`">
          <div class="lc-top">
            <div class="pro-avatar pro-avatar-md" :style="{ background: profileGrad(s.profile) }">
              <AppIcon :name="profileIcon(s.profile)" :size="15" />
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:800;font-size:0.9rem;color:var(--pro-ink)">{{ s.name }}</div>
              <div>
                <span class="pro-badge" :class="profileBadge(s.profile)">{{ profileLabel(s.profile) }}</span>
              </div>
            </div>
            <div class="pro-status pro-status-online">
              <span class="pro-status-dot"></span>
              {{ s.connectedAt }}
            </div>
          </div>
          <div class="lc-course">
            <AppIcon name="book" :size="13" style="color:var(--pro-muted);flex-shrink:0" />
            <span class="td-muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ s.currentCourse }}</span>
          </div>
          <div class="lc-progress-wrap">
            <div class="pro-progress" style="flex:1">
              <div class="pro-progress-fill" :style="{ width:s.progress+'%', background:'var(--lc)' }"></div>
            </div>
            <span style="font-size:0.82rem;font-weight:900;color:var(--lc)">{{ s.progress }}%</span>
          </div>
        </div>
      </div>
      <div v-else class="pro-empty pro-card" style="padding:36px">
        <AppIcon name="user" :size="36" class="pro-empty-icon" />
        <p>Aucun élève connecté en ce moment.</p>
      </div>
    </section>

    <section aria-labelledby="all-title">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px">
        <h2 id="all-title" style="font-size:1rem;font-weight:800;color:var(--pro-ink);margin:0">Tous mes élèves</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <select v-model="filterClass"   class="pro-select" aria-label="Filtrer par classe">
            <option value="">Toutes mes classes</option>
            <option v-for="cid in store.teacher?.classIds" :key="cid" :value="cid">{{ getClassName(cid) }}</option>
          </select>
          <select v-model="filterProfile" class="pro-select" aria-label="Filtrer par profil">
            <option value="">Tous les profils</option>
            <option v-for="p in PROFILES" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
      </div>

      <div class="pro-table-wrap">
        <table class="pro-table" aria-label="Liste des élèves">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Profil</th>
              <th>Classe</th>
              <th>Statut</th>
              <th>Progression</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredStudents" :key="s.id">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="pro-avatar pro-avatar-md" :style="{ background: profileGrad(s.profile) }">
                    <AppIcon :name="profileIcon(s.profile)" :size="15" />
                  </div>
                  <div>
                    <div class="td-name">{{ s.name }}</div>
                    <div class="td-muted">{{ formatDate(s.dob) }}</div>
                  </div>
                </div>
              </td>
              <td><span class="pro-badge" :class="profileBadge(s.profile)">{{ profileLabel(s.profile) }}</span></td>
              <td><span class="pro-badge pro-badge-gray">{{ getClassName(s.classId) }}</span></td>
              <td>
                <div class="pro-status" :class="isConnected(s.id) ? 'pro-status-online' : (s.active ? 'pro-status-active' : 'pro-status-inactive')">
                  <span class="pro-status-dot"></span>
                  {{ isConnected(s.id) ? 'En ligne' : (s.active ? 'Actif' : 'Inactif') }}
                </div>
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="pro-progress" style="width:80px">
                    <div class="pro-progress-fill" :style="{ width: getProgress(s.id)+'%', background: 'var(--pro-green)' }"></div>
                  </div>
                  <span style="font-size:0.78rem;font-weight:700;color:var(--pro-ink)">{{ getProgress(s.id) }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredStudents.length">
              <td colspan="5" style="text-align:center;padding:36px;color:var(--pro-muted);font-style:italic">
                Aucun élève trouvé.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, h, reactive } from 'vue'

// ============================================================================
// 1. COMPOSANT ICONE (Autonome)
// ============================================================================
function getIconInner(name) {
  switch (name) {
    case 'user': return '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
    case 'book': return '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>';
    case 'eye': return '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    case 'ear': return '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 0 1 0 4"/>';
    case 'hand': return '<path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10.5V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8H7a8 8 0 0 1-5.32-2"/><path d="M2 15H6"/>';
    default: return '<circle cx="12" cy="12" r="4"/>';
  }
}

const AppIcon = (props, { attrs }) => {
  return h('svg', {
    width: props.size || 20, height: props.size || 20, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': props.weight || 1.8,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    innerHTML: getIconInner(props.name),
    ...attrs
  })
}

// ============================================================================
// 2. DONNÉES ÉMULÉES (Mock Stores)
// ============================================================================
const PROFILES = [
  { value: 'standard', label: 'Standard' },
  { value: 'visual', label: 'Déficience visuelle' },
  { value: 'hearing', label: 'Déficience auditive' },
  { value: 'motor', label: 'Déficience motrice' }
]

const adminStore = reactive({
  classes: { 1: 'CP Rouge', 2: 'CE1 Bleu' },
  students: [
    { id: 1, name: 'Léo Martin', profile: 'standard', classId: 1, dob: '2016-05-12', active: true },
    { id: 2, name: 'Mia Dubois', profile: 'visual', classId: 1, dob: '2016-08-22', active: true },
    { id: 3, name: 'Tom Leroy', profile: 'hearing', classId: 2, dob: '2015-11-04', active: true },
    { id: 4, name: 'Léa Roux', profile: 'motor', classId: 2, dob: '2015-02-18', active: false },
    { id: 5, name: 'Hugo Blanc', profile: 'standard', classId: 1, dob: '2016-01-10', active: true }
  ],
  getClassName: (id) => adminStore.classes[id] || 'Inconnu'
})

const store = reactive({
  teacher: { classIds: [1, 2] },
  myConnectedStudents: [
    { id: 1, name: 'Léo Martin', profile: 'standard', currentCourse: 'Mathématiques - Additions', progress: 45, connectedAt: '09:15' },
    { id: 2, name: 'Mia Dubois', profile: 'visual', currentCourse: 'Français - Lecture fluide', progress: 72, connectedAt: '09:20' }
  ]
})

// ============================================================================
// 3. LOGIQUE DU COMPOSANT
// ============================================================================
const filterClass   = ref('')
const filterProfile = ref('')

const myStudents = computed(() =>
  adminStore.students.filter(s => store.teacher?.classIds?.includes(s.classId))
)

const filteredStudents = computed(() => myStudents.value.filter(s =>
  (!filterClass.value   || s.classId === Number(filterClass.value)) &&
  (!filterProfile.value || s.profile === filterProfile.value)
))

const profileColors  = { standard:'#2563EB', visual:'#6D28D9', hearing:'#059669', motor:'#D97706' }
const profileSofts   = { standard:'rgba(37,99,235,0.08)', visual:'rgba(109,40,217,0.08)', hearing:'rgba(5,150,105,0.08)', motor:'rgba(217,119,6,0.08)' }
const profileGrads   = { standard:'linear-gradient(135deg,#2563EB,#6D28D9)', visual:'linear-gradient(135deg,#6D28D9,#D97706)', hearing:'linear-gradient(135deg,#059669,#2563EB)', motor:'linear-gradient(135deg,#D97706,#DC2626)' }
const profileIcons   = { standard:'user', visual:'eye', hearing:'ear', motor:'hand' }
const profileLabels  = { standard:'Standard', visual:'Déficience visuelle', hearing:'Déficience auditive', motor:'Déficience motrice' }
const profileBadges  = { standard:'pro-badge-blue', visual:'pro-badge-violet', hearing:'pro-badge-green', motor:'pro-badge-amber' }

function profileColor(p) { return profileColors[p]  || '#2563EB' }
function profileSoft(p)  { return profileSofts[p]   || 'rgba(37,99,235,0.08)' }
function profileGrad(p)  { return profileGrads[p]   || profileGrads.standard }
function profileIcon(p)  { return profileIcons[p]   || 'user' }
function profileLabel(p) { return profileLabels[p]  || p }
function profileBadge(p) { return profileBadges[p]  || 'pro-badge-gray' }

function getClassName(id) { return adminStore.getClassName(id) }
function formatDate(d)    { return d ? new Date(d).toLocaleDateString('fr-FR') : '—' }
function isConnected(id)  { return store.myConnectedStudents.some(s => s.id === id) }
function getProgress(id)  { return store.myConnectedStudents.find(s => s.id === id)?.progress ?? 0 }
</script>

<style scoped>
/* ── IMPORT DES POLICES ─────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* ── VARIABLES ET THEME DE BASE ─────────────────── */
.students-root {
  --pro-navy:       #0F1B3E;
  --pro-blue:       #2563EB;
  --pro-blue-soft:  rgba(37,99,235,0.09);
  --pro-green:      #059669;
  --pro-green-soft: rgba(5,150,105,0.09);
  --pro-violet:     #6D28D9;
  --pro-violet-soft:rgba(109,40,217,0.09);
  --pro-amber:      #D97706;
  --pro-amber-soft: rgba(217,119,6,0.09);
  --pro-red:        #DC2626;
  --pro-red-soft:   rgba(220,38,38,0.09);

  --pro-ink:    #0f172a;
  --pro-sub:    #475569;
  --pro-muted:  #94a3b8;
  --pro-border: rgba(15,23,42,0.08);
  --pro-bg:     #f1f5f9;
  --pro-card:   #ffffff;

  --pro-r-sm: 8px;
  --pro-r-md: 12px;
  --pro-r-lg: 16px;

  --pro-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --pro-shadow-md: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05);

  --pro-font: 'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif;

  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: var(--pro-font);
}

/* ── CLASSES GÉNÉRIQUES (Extraites de main.css) ─── */
.pro-page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
.pro-page-title { font-size: 1.55rem; font-weight: 900; color: var(--pro-ink); letter-spacing: -0.025em; line-height: 1.2; margin:0; }
.pro-page-sub { font-size: 0.82rem; color: var(--pro-muted); margin-top: 4px; margin-bottom: 0; font-weight: 500; }

.pro-card { background: var(--pro-card); border-radius: var(--pro-r-lg); border: 1px solid var(--pro-border); box-shadow: var(--pro-shadow-md); }

.pro-avatar { border-radius: 50%; color: white; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.85rem; }
.pro-avatar-md  { width: 38px; height: 38px; }

.pro-badge { display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; padding: 3px 9px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
.pro-badge-blue   { background: var(--pro-blue-soft);   color: var(--pro-blue);   }
.pro-badge-green  { background: var(--pro-green-soft);  color: var(--pro-green);  }
.pro-badge-violet { background: var(--pro-violet-soft); color: var(--pro-violet); }
.pro-badge-amber  { background: var(--pro-amber-soft);  color: var(--pro-amber);  }
.pro-badge-gray   { background: #f1f5f9; color: var(--pro-sub); }

.pro-status { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 600; }
.pro-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.pro-status-online  { color: var(--pro-green); }
.pro-status-online  .pro-status-dot { background: var(--pro-green); animation: pro-pulse 2s ease infinite; }
.pro-status-active  { color: var(--pro-blue); }
.pro-status-active  .pro-status-dot { background: var(--pro-blue); }
.pro-status-inactive{ color: var(--pro-muted); }
.pro-status-inactive .pro-status-dot { background: var(--pro-muted); }
@keyframes pro-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(5,150,105,0.4); } 50% { box-shadow: 0 0 0 4px rgba(5,150,105,0); } }

.pro-progress { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.pro-progress-fill { height: 100%; border-radius: 10px; transition: width 0.8s ease; }

.pro-select {
  padding: 9px 13px; border: 1.5px solid var(--pro-border); border-radius: var(--pro-r-md);
  font-family: var(--pro-font); font-size: 0.83rem; color: var(--pro-ink);
  background: var(--pro-card); cursor: pointer; outline: none;
  box-shadow: var(--pro-shadow-sm); transition: border-color 0.15s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center; padding-right: 32px;
}
.pro-select:focus { border-color: var(--pro-blue); }

.pro-table-wrap { background: var(--pro-card); border-radius: var(--pro-r-lg); border: 1px solid var(--pro-border); box-shadow: var(--pro-shadow-md); overflow: hidden; }
.pro-table { width: 100%; border-collapse: collapse; }
.pro-table th { padding: 11px 16px; text-align: left; font-size: 0.68rem; font-weight: 700; color: var(--pro-muted); text-transform: uppercase; letter-spacing: 0.08em; background: #f8fafc; border-bottom: 1px solid var(--pro-border); white-space: nowrap; }
.pro-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: var(--pro-ink); vertical-align: middle; }
.pro-table tr:last-child td { border-bottom: none; }
.pro-table tr:hover td { background: #fafcff; }
.pro-table .td-name { font-weight: 700; }
.pro-table .td-muted { color: var(--pro-muted); font-size: 0.78rem; }

.pro-empty { text-align: center; padding: 48px 24px; color: var(--pro-muted); }
.pro-empty-icon { width: 48px; height: 48px; margin: 0 auto 14px; opacity: 0.3; }

/* ── STYLES SPÉCIFIQUES AU COMPOSANT ────────────── */
.live-pill {
  display:inline-flex; align-items:center; gap:6px;
  background:var(--pro-green-soft); color:var(--pro-green);
  border-radius:100px; padding:3px 10px;
  font-size:0.72rem; font-weight:700;
}
.live-dot { width:7px; height:7px; border-radius:50%; background:var(--pro-green); animation:pro-pulse 2s ease infinite; }

.live-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px; }
.live-card { padding:16px; display:flex; flex-direction:column; gap:12px; border-left:3px solid var(--lc); transition:transform 0.2s, box-shadow 0.2s; }
.live-card:hover { transform: translateY(-2px); box-shadow: var(--pro-shadow-lg); }

.lc-top   { display:flex; align-items:center; gap:10px; }
.lc-course { display:flex; align-items:center; gap:7px; background:#f8fafc; padding:6px 10px; border-radius:6px; font-size:0.8rem; }
.lc-progress-wrap { display:flex; align-items:center; gap:8px; }

@media(max-width:640px){ .live-grid{ grid-template-columns:1fr; } }
</style>