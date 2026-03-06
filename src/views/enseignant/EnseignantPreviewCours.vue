<template>
  <div style="display:flex;flex-direction:column;gap:22px" class="page-root">

    <div class="pro-page-header">
      <div>
        <h1 class="pro-page-title">Mes cours</h1>
        <p class="pro-page-sub">{{ store.myCourses.length }} cours créé(s)</p>
      </div>
      <button class="pro-btn pro-btn-green" @click="goNew">
        <AppIcon name="plus" :size="16" /> Créer un cours
      </button>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button v-for="f in filters" :key="f.value" class="filter-tab"
        :class="{ 'filter-tab-active': filter===f.value }" @click="filter=f.value">
        {{ f.label }}
      </button>
    </div>

    <div style="display:flex;flex-direction:column;gap:10px" role="list">
      <div v-for="c in filtered" :key="c.id"
        class="course-row pro-card" role="listitem"
        :class="{ 'cr-draft': c.status==='draft' }">

        <div class="cr-icon-wrap"
          :style="{ background: c.status==='published' ? 'var(--pro-green-soft, #d1fae5)' : '#f1f5f9',
                    color:      c.status==='published' ? 'var(--pro-green, #10b981)'      : 'var(--pro-muted, #94a3b8)' }">
          <AppIcon name="book" :size="22" />
        </div>

        <div style="flex:1;min-width:0">
          <div style="font-size:1rem;font-weight:800;color:var(--pro-ink, #0f172a)">{{ c.title }}</div>
          <div class="td-muted" style="margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--pro-muted, #94a3b8);font-size:0.85rem;">
            {{ c.desc }}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
            <span class="pro-badge" :class="c.status==='published' ? 'pro-badge-green' : 'pro-badge-gray'">
              {{ c.status==='published' ? 'Publié' : 'Brouillon' }}
            </span>
            <span v-if="c.level"    class="pro-badge pro-badge-blue">{{ c.level }}</span>
            <span v-if="c.duration" class="pro-badge"><AppIcon name="clock" :size="10" /> {{ c.duration }}</span>
          </div>
        </div>

        <div class="cr-progress">
          <div style="font-size:0.9rem;font-weight:900;color:var(--pro-ink, #0f172a)">
            {{ c.completions }}<span style="font-size:0.72rem;color:var(--pro-muted, #94a3b8);font-weight:500">/{{ c.studentsCount }}</span>
          </div>
          <div class="pro-progress" style="margin-top:4px">
            <div class="pro-progress-fill"
              :style="{ width: c.studentsCount ? (c.completions/c.studentsCount*100)+'%' : '0%', background:'var(--pro-green, #10b981)' }">
            </div>
          </div>
          <div style="font-size:0.68rem;color:var(--pro-muted, #94a3b8);margin-top:2px">terminé</div>
        </div>

        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="action-btn action-btn-preview" @click="goPreview(c)" title="Aperçu lecteur inclusif">
            <AppIcon name="eye" :size="14" />
            <span>Aperçu</span>
          </button>
          <button class="action-btn action-btn-edit" @click="goEdit(c)" title="Modifier">
            <AppIcon name="edit" :size="14" />
            <span>Modifier</span>
          </button>
          <button v-if="c.status==='draft'" class="action-btn action-btn-publish"
            @click="store.publishCourse(c.id)" title="Publier">
            <AppIcon name="publish" :size="14" />
            <span>Publier</span>
          </button>
          <button class="pro-icon-btn pro-icon-btn-danger" @click="confirmDelete(c)" title="Supprimer">
            <AppIcon name="trash" :size="14" />
          </button>
        </div>
      </div>

      <div v-if="!filtered.length" class="empty-state pro-card">
        <AppIcon name="book" :size="48" class="pro-empty-icon" />
        <p class="empty-title">Aucun cours</p>
        <p class="empty-sub">
          {{ filter === 'all' ? 'Créez votre premier cours inclusif !' : 'Aucun cours dans cette catégorie.' }}
        </p>
        <button v-if="filter==='all'" class="pro-btn pro-btn-green" style="margin-top:16px" @click="goNew">
          <AppIcon name="plus" :size="15" /> Créer un cours
        </button>
      </div>
    </div>

    <div v-if="showDelete" class="modal-overlay" @click.self="showDelete = false">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-icon-danger"><AppIcon name="warning" :size="24" /></div>
          <h3 class="modal-title">Supprimer ce cours ?</h3>
        </div>
        <p class="modal-body">
          Êtes-vous sûr de vouloir supprimer le cours <strong>« {{ deleteTarget?.title }} »</strong> ? Cette action est irréversible.
        </p>
        <div class="modal-actions">
          <button class="pro-btn pro-btn-ghost" @click="showDelete = false">Annuler</button>
          <button class="pro-btn pro-btn-danger" @click="doDelete">
            <AppIcon name="trash" :size="14" /> Supprimer
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, h } from 'vue'
import { useRouter } from 'vue-router'

// ============================================================================
// 1. COMPOSANT D'ICÔNE INTÉGRÉ
// ============================================================================
const svgPaths = {
  'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  'edit': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  'publish': '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
  'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  'warning': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  'default': '<circle cx="12" cy="12" r="4"/>'
}

const AppIcon = (props) => {
  return h('svg', {
    width: props.size || 20,
    height: props.size || 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: props.style,
    innerHTML: svgPaths[props.name] || svgPaths['default']
  })
}

// ============================================================================
// 2. STORE INTÉGRÉ
// ============================================================================
const store = reactive({
  myCourses: [
    { id: 1, title: 'Introduction aux additions', desc: 'Apprendre à compter de 1 à 10', status: 'published', level: 'CP', duration: '15 min', completions: 18, studentsCount: 25 },
    { id: 2, title: 'Découverte des fractions', desc: 'Comprendre les parts et les divisions simples', status: 'draft', level: 'CM1', duration: '20 min', completions: 0, studentsCount: 22 },
    { id: 3, title: 'Lecture fluide', desc: 'Exercices pour les élèves dyslexiques', status: 'published', level: 'CE2', duration: '10 min', completions: 25, studentsCount: 25 }
  ],
  publishCourse(id) {
    const course = this.myCourses.find(c => c.id === id)
    if (course) course.status = 'published'
  },
  deleteCourse(id) {
    this.myCourses = this.myCourses.filter(c => c.id !== id)
  }
})

// ============================================================================
// 3. LOGIQUE ORIGINALE DU COMPOSANT
// ============================================================================
const router = useRouter()

const filter  = ref('all')
const filters = [
  { value: 'all',       label: 'Tous' },
  { value: 'published', label: 'Publiés' },
  { value: 'draft',     label: 'Brouillons' },
]

const filtered = computed(() =>
  filter.value === 'all'
    ? store.myCourses
    : store.myCourses.filter(c => c.status === filter.value)
)

function goNew() { 
  // Redirection vers la page /Cours en utilisant son name défini dans le router
  router.push({ name: 'enseignantcours' }) 
}
function goEdit(c)    { 
  // router.push({ name: 'teacher-course-editor',  params: { id: c.id } }) 
  console.log("Naviguer vers : Éditer", c.id)
}
function goPreview(c) { 
  // router.push({ name: 'teacher-course-preview', params: { id: c.id } }) 
  console.log("Naviguer vers : Aperçu", c.id)
}

// Gestion de la modale de suppression
const showDelete   = ref(false)
const deleteTarget = ref(null)

function confirmDelete(c) { 
  deleteTarget.value = c 
  showDelete.value = true 
}

function doDelete() { 
  if (deleteTarget.value) {
    store.deleteCourse(deleteTarget.value.id)
    showDelete.value = false
    deleteTarget.value = null
  }
}
</script>

<style scoped>
/* ── Fallbacks et utilitaires globaux ─────────────────────────── */
.page-root { font-family: sans-serif; }

.pro-page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 16px;}
.pro-page-title { font-size: 1.8rem; font-weight: 900; color: var(--pro-ink, #0f172a); margin: 0; }
.pro-page-sub { font-size: 0.9rem; color: var(--pro-muted, #94a3b8); margin: 4px 0 0 0; }

.pro-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; white-space: nowrap; }
.pro-btn-green { background: var(--pro-green, #10b981); color: white; }
.pro-btn-green:hover { background: #059669; }
.pro-btn-ghost { background: transparent; border: 1.5px solid var(--pro-border, #e2e8f0); color: var(--pro-ink, #0f172a); }
.pro-btn-ghost:hover { background: #f8fafc; }
.pro-btn-danger { background: var(--pro-red, #ef4444); color: white; }
.pro-btn-danger:hover { background: #dc2626; }

.pro-card { background: white; border: 1.5px solid var(--pro-border, #e2e8f0); border-radius: var(--pro-r-lg, 12px); overflow: hidden; }

.pro-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 100px; font-size: 0.7rem; font-weight: 700; }
.pro-badge-green { background: var(--pro-green-soft, #d1fae5); color: var(--pro-green, #10b981); }
.pro-badge-gray { background: #f1f5f9; color: #64748b; }
.pro-badge-blue { background: var(--pro-blue-soft, #dbeafe); color: var(--pro-blue, #3b82f6); }

.pro-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid var(--pro-border, #e2e8f0); background: white; cursor: pointer; transition: all .15s; }
.pro-icon-btn-danger { color: var(--pro-red, #ef4444); border-color: transparent; }
.pro-icon-btn-danger:hover { background: #fef2f2; border-color: #fecaca; }

.pro-progress { height: 6px; background: var(--pro-border, #e2e8f0); border-radius: 3px; overflow: hidden; }
.pro-progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }

/* ── Styles spécifiques de la vue ─────────────────────────────── */
.filter-tab {
  padding: 7px 16px; border-radius: 100px;
  border: 1.5px solid var(--pro-border, #e2e8f0); background: white;
  font-size: 0.82rem; font-weight: 600;
  color: var(--pro-sub, #475569); cursor: pointer; transition: all 0.15s;
}
.filter-tab:hover  { border-color: var(--pro-green, #10b981); color: var(--pro-green, #10b981); }
.filter-tab-active { background: var(--pro-green, #10b981); border-color: var(--pro-green, #10b981); color: white; }

.course-row {
  padding: 16px 18px; display: flex; align-items: center; gap: 14px;
  transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow .15s;
}
.course-row:hover { transform: translateX(4px); box-shadow: var(--pro-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1)); }
.cr-draft { opacity: .82; border-style: dashed; }

.cr-icon-wrap {
  width: 46px; height: 46px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cr-progress { width: 84px; text-align: center; flex-shrink: 0; }

.action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 11px; border-radius: 8px; border: 1.5px solid var(--pro-border, #e2e8f0);
  background: white; font-size: 0.75rem; font-weight: 700;
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.action-btn span { display: none; }
@media (min-width: 720px) { .action-btn span { display: inline; } }

.action-btn-preview { color: var(--pro-blue, #3b82f6); }
.action-btn-preview:hover { background: var(--pro-blue-soft, #dbeafe); border-color: var(--pro-blue, #3b82f6); }

.action-btn-edit { color: var(--pro-sub, #475569); }
.action-btn-edit:hover { background: var(--pro-bg, #f8fafc); border-color: var(--pro-ink, #0f172a); color: var(--pro-ink, #0f172a); }

.action-btn-publish { color: var(--pro-green, #10b981); }
.action-btn-publish:hover { background: var(--pro-green-soft, #d1fae5); border-color: var(--pro-green, #10b981); }

.empty-state { padding: 52px 40px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.pro-empty-icon { color: var(--pro-muted, #94a3b8); opacity: 0.5; }
.empty-title { font-size: 1rem; font-weight: 800; color: var(--pro-ink, #0f172a); margin: 12px 0 4px; }
.empty-sub   { font-size: 0.85rem; color: var(--pro-muted, #94a3b8); margin: 0; }

/* ── Modale de suppression (Pop-up) ───────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  padding: 20px;
}
.modal-content {
  background: white; border-radius: 16px; padding: 24px;
  max-width: 400px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modal-pop { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }

.modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.modal-icon-danger { width: 40px; height: 40px; border-radius: 10px; background: #fef2f2; color: var(--pro-red, #ef4444); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.modal-title { font-size: 1.1rem; font-weight: 800; color: var(--pro-ink, #0f172a); margin: 0; }
.modal-body { font-size: 0.9rem; color: var(--pro-sub, #475569); line-height: 1.5; margin: 0 0 24px 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
</style>