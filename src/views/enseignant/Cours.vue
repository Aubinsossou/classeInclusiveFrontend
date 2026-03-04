<template>
  <div class="page-wrapper">
    <div class="container courses-view">
      
      <nav class="breadcrumb" aria-label="Fil d'Ariane">
        <RouterLink to="/dashboard" class="bc-link">Accueil</RouterLink>
        <span class="bc-sep" aria-hidden="true">›</span>
        <span class="bc-current">Mes cours</span>
      </nav>

      <h1 class="section-title">Mes cours</h1>

      <div class="filters" role="group" aria-label="Filtrer par matière">
        <button class="filter-btn" :class="{ active: !activeFilter }" @click="activeFilter = null" aria-pressed="!activeFilter">
          Tous
        </button>
        <button v-for="s in subjects" :key="s.id"
          class="filter-btn" :class="{ active: activeFilter === s.id }"
          @click="activeFilter = activeFilter === s.id ? null : s.id"
          :aria-pressed="activeFilter === s.id"
          :style="activeFilter === s.id ? { background: s.color, color: 'white', borderColor: s.color } : {}">
          {{ s.name }}
        </button>
      </div>

      <div class="courses-list" role="list">
        <TransitionGroup name="list">
          
          <div v-for="c in filtered" :key="c.id"
            class="course-item"
            role="listitem"
            tabindex="0"
            :aria-label="`${c.title}, Durée ${c.duration}, niveau ${c.level}`"
          >
            <div class="course-info">
              <div class="course-title">{{ c.title }}</div>
              <div class="course-desc">{{ c.desc }}</div>
              <div class="course-meta">
                <span class="tag">Durée : {{ c.duration }}</span>
                <span class="tag tag-green">{{ c.level }}</span>
              </div>
            </div>

            <div class="course-actions">
              <button
                class="btn btn-primary start-btn"
                @click="goToCourse(c.id)"
                :aria-label="`Commencer le cours : ${c.title}`"
              >
                Commencer
              </button>
              <div class="secondary-actions">
                <button class="action-btn" @click="viewCourse(c.id)">Voir</button>
                <button class="action-btn" @click="openEditModal(c)">Modifier</button>
                <button class="action-btn danger" @click="openDeleteModal(c)">Supprimer</button>
              </div>
            </div>
          </div>
          
        </TransitionGroup>
      </div>

      <div v-if="!filtered.length" class="empty-state" role="status">
        <p>Aucun cours dans cette matière !</p>
      </div>

    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showFormModal" class="modal-backdrop" @click.self="closeFormModal" role="dialog" aria-modal="true">
          <div class="modal-box modal-md">
            
            <div class="modal-header">
              <h2 class="modal-title">Modifier le cours</h2>
              <button class="modal-close" @click="closeFormModal" aria-label="Fermer">✕</button>
            </div>
            
            <div class="modal-body">
              <form @submit.prevent="submitForm" id="course-form" class="modal-form">
                
                <div class="field">
                  <label for="fc-title" class="field-label">Titre du cours <span class="req" aria-hidden="true">*</span></label>
                  <input id="fc-title" type="text" v-model="form.title" required class="field-input" placeholder="Ex: Les fractions" />
                </div>

                <div class="field">
                  <label for="fc-desc" class="field-label">Description <span class="req" aria-hidden="true">*</span></label>
                  <textarea id="fc-desc" v-model="form.desc" required class="field-input field-textarea" rows="2" placeholder="Un bref résumé du cours..."></textarea>
                </div>

                <div class="field">
                  <label for="fc-subject" class="field-label">Matière <span class="req" aria-hidden="true">*</span></label>
                  <select id="fc-subject" v-model="form.subjectId" required class="field-input field-select">
                    <option value="" disabled>Choisir une matière</option>
                    <option v-for="s in subjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>

                <div class="form-grid">
                  <div class="field">
                    <label for="fc-duration" class="field-label">Durée</label>
                    <input id="fc-duration" type="text" v-model="form.duration" class="field-input" placeholder="Ex: 15 min" />
                  </div>

                  <div class="field">
                    <label for="fc-level" class="field-label">Niveau <span class="req" aria-hidden="true">*</span></label>
                    <select id="fc-level" v-model="form.level" required class="field-input field-select">
                      <option value="" disabled>Choisir</option>
                      <option v-for="lvl in levelOptions" :key="lvl" :value="lvl">{{ lvl }}</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="closeFormModal">Annuler</button>
              <button type="submit" class="btn btn-primary" form="course-form">Enregistrer</button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal" role="dialog" aria-modal="true">
          <div class="modal-box modal-sm">
            <div class="modal-header">
              <h2 class="modal-title">Confirmer la suppression</h2>
              <button class="modal-close" @click="closeDeleteModal" aria-label="Fermer">✕</button>
            </div>
            <div class="modal-body confirm-body">
              <p class="confirm-msg">
                Êtes-vous sûr de vouloir supprimer le cours <br>
                <strong>"{{ courseToDelete?.title }}"</strong> ?<br><br>
                Cette action est irréversible.
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="closeDeleteModal">Annuler</button>
              <button type="button" class="btn btn-danger" @click="doDelete">Supprimer</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeFilter = ref(null)

// --- DONNÉES SIMULÉES ---
const subjects = [
  { id: 1, name: 'Maths', color: '#22c55e' },
  { id: 2, name: 'Français', color: '#FFCB47' },
  { id: 3, name: 'Sciences', color: '#2DD4A0' },
  { id: 4, name: 'Histoire', color: '#FF6B6B' },
  { id: 5, name: 'Arts', color: '#A78BFA' },
  { id: 6, name: 'Sport', color: '#FB923C' },
]

const coursesData = ref([
  { id: 1, subjectId: 1, title: 'Les additions et soustractions', desc: "Additionner et soustraire jusqu'à 100 !", duration: '15 min', level: 'CP' },
  { id: 2, subjectId: 2, title: 'La phrase et ses composants', desc: 'Découvre comment une phrase est construite.', duration: '20 min', level: 'CE1' },
  { id: 3, subjectId: 3, title: 'Les plantes et leur croissance', desc: "De la graine à l'arbre : le mystère du vivant !", duration: '18 min', level: 'CE2' },
  { id: 4, subjectId: 4, title: 'Les Gaulois et les Romains', desc: 'Voyage dans la Gaule il y a 2000 ans !', duration: '25 min', level: 'CM1' },
  { id: 5, subjectId: 1, title: 'Les tables de multiplication', desc: "Maîtrise les tables jusqu'à 10 !", duration: '20 min', level: 'CE2' },
  { id: 6, subjectId: 5, title: 'Les couleurs primaires et secondaires', desc: 'Mélange des couleurs pour en créer de nouvelles !', duration: '15 min', level: 'CP' },
])

const levelOptions = ['CP', 'CE1', 'CE2', 'CM1', 'CM2']

// --- LOGIQUE DE FILTRAGE ---
const filtered = computed(() => {
  return activeFilter.value 
    ? coursesData.value.filter(c => c.subjectId === activeFilter.value) 
    : coursesData.value
})

// --- ACTIONS SIMPLES ---
function goToCourse(id) {
  router.push(`/cours/${id}`)
}

function viewCourse(id) {
  alert("Aperçu du cours " + id)
}

// --- LOGIQUE DE MODIFICATION ---
const showFormModal = ref(false)
const form = reactive({ id: null, subjectId: '', title: '', desc: '', duration: '', level: '' })

function openEditModal(course) {
  Object.assign(form, {
    id: course.id,
    subjectId: course.subjectId,
    title: course.title,
    desc: course.desc,
    duration: course.duration,
    level: course.level
  })
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
}

function submitForm() {
  const index = coursesData.value.findIndex(c => c.id === form.id)
  if (index !== -1) {
    coursesData.value[index] = { ...coursesData.value[index], ...form }
  }
  closeFormModal()
}

// --- LOGIQUE DE SUPPRESSION ---
const showDeleteModal = ref(false)
const courseToDelete = ref(null)

function openDeleteModal(course) {
  courseToDelete.value = course
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  courseToDelete.value = null
}

function doDelete() {
  if (courseToDelete.value) {
    coursesData.value = coursesData.value.filter(c => c.id !== courseToDelete.value.id)
  }
  closeDeleteModal()
}
</script>

<style scoped>
/* --- VARIABLES GLOBALES --- */
.page-wrapper {
  --c-card: #ffffff;
  --c-border: #e2e8f0;
  --c-primary: #22c55e;
  --primary-light: #dcfce7;
  --primary-glow: rgba(34, 197, 94, 0.4);
  --c-mint: #2DD4A0;
  --c-text: #1e293b;
  --c-sub: #64748b;
  --slate: #64748b;
  --cloud: #f1f5f9;
  --c-danger: #ef4444;
  --danger-light: #fee2e2;
  --r-md: 8px;
  --r-lg: 16px;
  --t: 0.2s;
  --s-card: 0 4px 6px rgba(0,0,0,0.05);
  --s-hover: 0 10px 15px rgba(0,0,0,0.1);
  font-family: sans-serif;
  
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  padding: 30px 20px;
}

/* --- MISE EN PAGE PRINCIPALE --- */
.container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  display: flex; 
  flex-direction: column; 
  gap: 20px;
}

.section-title { font-size: 2.2rem; font-weight: 900; color: var(--c-text); margin: 0; }

/* --- BREADCRUMB --- */
.breadcrumb { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; font-size: 0.9rem; font-weight: 600; color: var(--c-sub); flex-wrap: wrap; }
.bc-link { color: var(--c-primary); font-weight: 700; text-decoration: none; transition: color var(--t); }
.bc-link:hover { color: #16a34a; text-decoration: underline; }
.bc-sep { color: var(--c-border); }
.bc-current { color: var(--c-text); font-weight: 700; }

/* --- FILTRES --- */
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-btn {
  background: var(--c-card); border: 2px solid var(--c-border);
  border-radius: 100px; padding: 8px 18px;
  font-weight: 800; font-size: 0.9rem; color: var(--slate);
  cursor: pointer; transition: all var(--t); min-height: 40px;
}
.filter-btn:hover { border-color: var(--c-primary); color: var(--c-primary); background: var(--primary-light); }
.filter-btn.active { background: var(--c-primary); border-color: var(--c-primary); color: white; box-shadow: 0 4px 14px var(--primary-glow); }

/* --- LISTE ET COURSES ITEMS --- */
.courses-list { display: flex; flex-direction: column; gap: 16px; }

.course-item {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  background: var(--c-card); border-radius: var(--r-lg);
  padding: 22px 26px; box-shadow: var(--s-card);
  border: 3px solid transparent; transition: all var(--t);
}
.course-item:hover, .course-item:focus-within {
  border-color: var(--c-primary); box-shadow: var(--s-hover); transform: translateY(-2px);
}

.course-info { flex: 1; min-width: 0; }
.course-title { font-size: 1.25rem; font-weight: 800; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.course-desc { font-size: 0.95rem; color: var(--slate); margin-top: 6px; }

.course-meta { display: flex; align-items: center; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.tag { font-size: 0.8rem; font-weight: bold; background: var(--cloud); color: var(--slate); padding: 4px 10px; border-radius: 6px; }
.tag-green { background: var(--primary-light); color: var(--c-primary); }

/* --- ACTIONS (Boutons de droite) --- */
.course-actions { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; flex-shrink: 0; }
.secondary-actions { display: flex; gap: 8px; }

.action-btn { 
  background: none; border: none; font-size: 0.85rem; font-weight: 700; 
  color: var(--slate); cursor: pointer; padding: 6px 10px; border-radius: 6px;
  transition: all var(--t);
}
.action-btn:hover { background: var(--cloud); color: var(--c-text); }
.action-btn.danger:hover { background: var(--danger-light); color: var(--c-danger); }

/* BOUTONS GLOBAUX */
.btn { padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; font-size: 0.95rem; transition: opacity var(--t), background var(--t); }
.start-btn { width: 100%; }
.btn-primary { background: var(--c-primary); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-ghost { background: transparent; color: var(--slate); }
.btn-ghost:hover { background: var(--cloud); color: var(--c-text); }
.btn-danger { background: var(--c-danger); color: white; }
.btn-danger:hover { opacity: 0.9; }

/* --- FORMULAIRE --- */
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-weight: 800; font-size: 0.9rem; color: var(--c-text); }
.req { color: var(--c-danger); margin-left: 2px; }

.field-input {
  width: 100%; padding: 12px 16px; font-size: 0.95rem;
  color: var(--c-text);
  border: 2px solid var(--c-border); border-radius: var(--r-md);
  background: #FAFCFF; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box; font-family: inherit;
}
.field-input:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--primary-glow); }
.field-textarea { resize: vertical; min-height: 80px; }
.field-select { 
  appearance: none; 
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); 
  background-repeat: no-repeat; background-position: right 12px center; 
  padding-right: 40px; cursor: pointer; 
}

/* --- MODALES --- */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal-box {
  background: white; border-radius: var(--r-lg);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  width: 100%; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.modal-sm { max-width: 420px; }
.modal-md { max-width: 560px; }

.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px 0; flex-shrink: 0; }
.modal-title { font-size: 1.35rem; font-weight: 900; color: var(--c-text); margin: 0; }
.modal-close {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--cloud); border: none; cursor: pointer;
  font-size: 0.9rem; font-weight: 900; color: var(--slate);
  transition: all var(--t); display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: var(--danger-light); color: var(--c-danger); }

.modal-body { padding: 20px 28px; overflow-y: auto; flex: 1; }
.confirm-msg { color: var(--slate); font-size: 1rem; line-height: 1.6; margin: 0; text-align: center; }

.modal-footer {
  padding: 16px 28px 24px; display: flex; gap: 12px; justify-content: flex-end;
  border-top: 1.5px solid var(--cloud); flex-shrink: 0;
}

/* --- ANIMATIONS ET RESPONSIVE --- */
.list-enter-active { animation: slideUp 0.35s ease-out both; }
.list-leave-active { animation: slideUp 0.2s ease-in reverse both; position: absolute; }
.list-move { transition: transform 0.3s; }

.modal-enter-active { animation: modalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.modal-leave-active { animation: modalIn 0.2s ease reverse; }

@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.empty-state { text-align: center; padding: 48px; color: var(--slate); font-weight: 600; font-size: 1.1rem; }

@media (max-width: 650px) {
  .course-item { flex-direction: column; align-items: flex-start; }
  .course-actions { width: 100%; align-items: flex-start; }
  .secondary-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
  .course-title { white-space: normal; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>