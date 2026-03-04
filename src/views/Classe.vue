<!-- <script setup>
import { ref } from 'vue'
let disp_form = ref(null)
let visible = ref(false)
let visible_ajout = ref(false)

function affiche() {
  disp_form.value.style.display = 'flex'
}

function alterne () {
  visible = !visible
}

</script>

<template>
  <div class="container">
    <div class="top">
      <div class="top_left">
        <h1>Hi welcome to the classe bord</h1>
        <p>Année 2025-2026</p>
      </div>
      <div class="top_right">
        <button class="add_class" @click="visible_ajout = true">Ajouter une classe</button>
      </div>
    </div>
    <div class="middle">
      <div class="card_class">
        <div class="class_top">
          <div class="class_top_left">
            <p><span>CP</span></p>
          </div>
          <div class="class_top_right">
            <button class="card_edit" @click="visible = true">✏️</button>
            <button class="card_delete">🗑️</button>
          </div>
        </div>
        <h3>CP-A</h3>
        <div class="class_middle">
          <p>Mr Thomas EDEA</p>
          <p>Salle 5</p>
          <p>2025-2026</p>
        </div>
        <div class="class_low">
          <div class="class_low_left">
            <h4>22</h4>
            <p>élèves</p>
          </div>
          <div class="class_low_right">
            <div class="progress_bar">
              <div class="progression"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card_class">
        <div class="class_top">
          <div class="class_top_left">
            <p><span>CP</span></p>
          </div>
          <div class="class_top_right">
            <button class="card_edit" @click="visible = true">✏️</button>
            <button class="card_delete">🗑️</button>
          </div>
        </div>
        <h3>CP-A</h3>
        <div class="class_middle">
          <p>Mr Thomas EDEA</p>
          <p>Salle 5</p>
          <p>2025-2026</p>
        </div>
        <div class="class_low">
          <div class="class_low_left">
            <h4>22</h4>
            <p>élèves</p>
          </div>
          <div class="class_low_right">
            <div class="progress_bar">
              <div class="progression"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card_class">
        <div class="class_top">
          <div class="class_top_left">
            <p><span>CP</span></p>
          </div>
          <div class="class_top_right">
            <button class="card_edit" @click="visible = true">✏️</button>
            <button class="card_delete">🗑️</button>
          </div>
        </div>
        <h3>CP-A</h3>
        <div class="class_middle">
          <p>Mr Thomas EDEA</p>
          <p>Salle 5</p>
          <p>2025-2026</p>
        </div>
        <div class="class_low">
          <div class="class_low_left">
            <h4>22</h4>
            <p>élèves</p>
          </div>
          <div class="class_low_right">
            <div class="progress_bar">
              <div class="progression"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card_class">
        <div class="class_top">
          <div class="class_top_left">
            <p><span>CP</span></p>
          </div>
          <div class="class_top_right">
            <button class="card_edit" @click="visible = true">✏️</button>
            <button class="card_delete">🗑️</button>
          </div>
        </div>
        <h3>CP-A</h3>
        <div class="class_middle">
          <p>Mr Thomas EDEA</p>
          <p>Salle 5</p>
          <p>2025-2026</p>
        </div>
        <div class="class_low">
          <div class="class_low_left">
            <h4>22</h4>
            <p>élèves</p>
          </div>
          <div class="class_low_right">
            <div class="progress_bar">
              <div class="progression"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="formulaire" class="overlay" ref="disp_form" v-show="visible">
    <div class="contenu">
      <button class="fermer" @click="visible = false">X</button>
      <div class="high_overlay">
        <h2>Modifier une classe</h2>
      </div>
      <div class="middle_overlay">
        <form action="" class="form_grid">
          <div class="field">
            <label for="class_name">Nom de la classe</label>
            <input type="text" id="class_name" />
          </div>
          <div class="field">
            <label for="class_level">Niveau</label>
            <select name="Niveau" id="class_level">
              Niveau
            </select>
          </div>
          <div class="field">
            <label for="the_class">Salle</label>
            <input type="text" id="the_class" />
          </div>
          <div class="field">
            <label for="year">Année scolaire</label>
            <input type="text" id="year" />
          </div>
          <div class="field">
            <label for="professor">Professeur principal</label>
            <input type="text" id="professor" />
            <p>Optionnel — peut être assigné plus tard</p>
          </div>
        </form>
      </div>
      <div class="trait"></div>
      <div class="low_overlay">
        <button>Créer</button>
        <button>Annuler</button>
      </div>
    </div>
  </div>

  <div id="formulaire" class="overlay" ref="disp_form" v-show="visible_ajout">
    <div class="contenu">
      <button class="fermer" @click="visible_ajout = false">X</button>
      <div class="high_overlay">
        <h2>Ajouter une classe</h2>
      </div>
      <div class="middle_overlay">
        <form action="" class="form_grid">
          <div class="field">
            <label for="class_name">Nom de la classe</label>
            <input type="text" id="class_name" />
          </div>
          <div class="field">
            <label for="class_level">Niveau</label>
            <select name="Niveau" id="class_level">
              Niveau
            </select>
          </div>
          <div class="field">
            <label for="the_class">Salle</label>
            <input type="text" id="the_class" />
          </div>
          <div class="field">
            <label for="year">Année scolaire</label>
            <input type="text" id="year" />
          </div>
          <div class="field">
            <label for="professor">Professeur principal</label>
            <input type="text" id="professor" />
            <p>Optionnel — peut être assigné plus tard</p>
          </div>
        </form>
      </div>
      <div class="trait"></div>
      <div class="low_overlay">
        <button>Créer</button>
        <button>Annuler</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

* {
  padding: 0;
  margin: 0;
  font-family: Nunito, sans-serif;
  color: #1a2b5e;
}

h1 {
}

span {
  background: linear-gradient(135deg, #22d4a0, #4bbfed);
  color: white;
  border-radius: 20px;
  padding: 6px 14px;
  font-weight: 900;
  font-size: 0.88rem;
}

.container {
  padding: 28px 32px;
  width: 1200px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
}

.middle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add_class {
  background: linear-gradient(140deg, #4bbfed 0%, #2ea8dc 100%);
  color: white;
  border-radius: 15px;
  border: none;
  font-size: 1.1rem;
  padding: 8px;
  box-shadow: 0 6px 20px rgba(75, 191, 237, 0.35);
  transition: 0.4s;
}

.add_class:hover {
  transform: translateY(-3px);
}

.card_class {
  width: 260px;
  display: flex;
  flex-direction: column;
  border: 3px solid #d4e2ff;
  box-shadow:
    0 4px 20px rgba(75, 191, 237, 0.12),
    0 1px 4px rgba(26, 43, 94, 0.06);
  border-radius: 15px;
  padding: 22px 22px 18px;
  margin-top: 8px;
  transition: 0.4s;
  gap: 10px;
}

.card_class:hover {
  transform: translateY(-3px);
  box-shadow:
    0 16px 48px rgba(75, 191, 237, 0.25),
    0 4px 14px rgba(26, 43, 94, 0.1);
  border-color: #4bbfed;
}

.card_edit {
  padding: 5px;
  border-radius: 11px;
  border: 1.5px solid #d4e2ff;
}

.card_edit:hover {
  border-color: #4bbfed;
  background-color: #c6edfc;
}

.card_delete {
  padding: 5px;
  border-radius: 11px;
  border: 1.5px solid #d4e2ff;
}

.card_delete:hover {
  border-color: #ff5c5c;
  background-color: #ffe2e2;
}

.class_top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.class_top_right {
  display: flex;
  gap: 5px;
}

.class_low {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress_bar {
  border: none;
  border-radius: 15px;
  height: 7px;
  width: 150px;
  overflow: hidden;
  background: #e2eaff;
}

.progression {
  width: 70%;
  background: linear-gradient(135deg, #22d4a0, #4bbfed);
  height: 100%;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #1a2b5e8c;
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay:target {
  display: flex;
}

.contenu {
  background: white;
  padding: 30px;
  border-radius: 18px;
  width: 500px;
  padding: 20px;
  text-align: center;
}

.fermer {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--cloud);
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 900;
  color: var(--slate);
  transition: all var(--t);
  float: right;
}

.form_grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
  margin-bottom: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  text-align: left;
}

input {
  border-radius: 12px;
  border: 2px solid #d4e2ff;
  width: 80%;
  height: 44px;
  padding: 0 15px;
  font-size: 1rem;
  transition: 0.3s ease;
  border-radius: 20px;
}

select {
  border-radius: 12px;
  border: 2px solid #d4e2ff;
  width: 95%;
  height: 44px;
  padding: 0 15px;
  font-size: 1rem;
  transition: 0.3s ease;
  border-radius: 20px;
}

input:focus,
select:focus {
  outline: none;
  border-color: #4bbfed;
  box-shadow: 0 0 0 3px rgba(75, 191, 237, 0.2);
}

.trait {
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, transparent, #ede5ff, transparent);
  border-radius: 20px;
  margin-bottom: 25px;
}
</style> -->

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-title">Test du Formulaire Centralisé</h1>
      <button class="btn btn-primary" @click="openAdd">Ajouter une classe</button>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false" role="dialog" aria-modal="true">
          <div class="modal-box modal-md">
            
            <div class="modal-header">
              <h2 class="modal-title">Ajouter une classe</h2>
              <button class="modal-close" @click="showForm = false" aria-label="Fermer">✕</button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="submitForm" id="class-form" class="modal-form">
                <div class="form-grid">
                  
                  <div class="field">
                    <label for="cf-name" class="field-label">Nom de la classe <span class="req" aria-hidden="true">*</span></label>
                    <input id="cf-name" type="text" v-model="form.name" required placeholder="Ex : CE2-A" class="field-input" />
                  </div>

                  <div class="field">
                    <label for="cf-level" class="field-label">Niveau <span class="req" aria-hidden="true">*</span></label>
                    <select id="cf-level" v-model="form.level" required class="field-input field-select">
                      <option value="" disabled>Choisir…</option>
                      <option v-for="opt in levelOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </div>

                  <div class="field">
                    <label for="cf-room" class="field-label">Salle</label>
                    <input id="cf-room" type="text" v-model="form.room" placeholder="Ex : Salle 101" class="field-input" />
                  </div>

                  <div class="field">
                    <label for="cf-year" class="field-label">Année scolaire</label>
                    <input id="cf-year" type="text" v-model="form.year" placeholder="2025-2026" class="field-input" />
                  </div>

                  <div class="field">
                    <label for="cf-teacher" class="field-label">Enseignant principal</label>
                    <select id="cf-teacher" v-model="form.teacherId" class="field-input field-select">
                      <option value="" disabled>Choisir…</option>
                      <option v-for="opt in teacherOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                    <p class="field-hint">Optionnel — peut être assigné plus tard</p>
                  </div>

                </div>
              </form>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" @click="showForm = false">Annuler</button>
              <button type="submit" class="btn btn-primary" form="class-form">Créer</button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// --- ÉTAT DU COMPOSANT ---
const showForm = ref(false)
const form = reactive({ name: '', level: '', room: '', year: '2025-2026', teacherId: '' })

// --- DONNÉES TEMPORAIRES (Mocks) ---
// Remplacez ces données par votre store une fois intégré dans votre vrai composant
const levelOptions = [
  { value: 'CP', label: 'CP' },
  { value: 'CE1', label: 'CE1' },
  { value: 'CE2', label: 'CE2' },
  { value: 'CM1', label: 'CM1' },
  { value: 'CM2', label: 'CM2' }
]

const teacherOptions = [
  { value: 1, label: 'Mme Dupont' },
  { value: 2, label: 'M. Martin' }
]

// --- ACTIONS ---
function openAdd() {
  // Réinitialise le formulaire avant de l'ouvrir
  Object.assign(form, { name: '', level: '', room: '', year: '2025-2026', teacherId: '' })
  showForm.value = true
}

function submitForm() {
  if (!form.name || !form.level) return
  
  // Simulation de sauvegarde
  console.log('Formulaire soumis avec succès :', form)
  alert('Classe ' + form.name + ' prête à être sauvegardée !')
  
  showForm.value = false
}
</script>

<style scoped>
/* --- MISE EN PAGE DE BASE --- */
.admin-page { padding: 20px; font-family: sans-serif; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 1.8rem; font-weight: 900; color: var(--ink, #1a2b5e); margin: 0; }

/* --- GRILLE DU FORMULAIRE --- */
.modal-form .form-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 16px; 
}
@media (max-width: 540px) { 
  .modal-form .form-grid { grid-template-columns: 1fr; } 
}

/* --- CHAMPS DE SAISIE (Ex-FormField) --- */
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-weight: 800; font-size: 0.88rem; color: var(--ink, #1a2b5e); }
.req { color: var(--coral, #ff6b6b); margin-left: 2px; }
.field-input {
  width: 100%; padding: 12px 16px; font-size: 0.95rem;
  color: var(--ink, #1a2b5e);
  border: 2px solid var(--c-border, #e2e8f0); border-radius: var(--r-md, 8px);
  background: #FAFCFF; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.field-input:focus { 
  border-color: var(--sky, #4BBFED); 
  box-shadow: 0 0 0 3px rgba(75,191,237,0.2); 
}
.field-input::placeholder { color: var(--mist, #a0aec0); }
.field-select { 
  appearance: none; 
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236278A8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); 
  background-repeat: no-repeat; 
  background-position: right 12px center; 
  padding-right: 40px; cursor: pointer; 
}
.field-hint { font-size: 0.78rem; color: var(--slate, #64748b); margin: 0; }

/* --- MODALE (Ex-AdminModal) --- */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(26,43,94,0.55);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.modal-box {
  background: white; border-radius: var(--r-xl, 16px);
  box-shadow: 0 32px 80px rgba(26,43,94,0.3);
  width: 100%; max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.modal-md { max-width: 560px; }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 28px 0; flex-shrink: 0;
}
.modal-title { font-size: 1.35rem; font-weight: 900; color: var(--ink, #1a2b5e); margin: 0; }
.modal-close {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--cloud, #f1f5f9); border: none; cursor: pointer;
  font-size: 0.9rem; font-weight: 900; color: var(--slate, #64748b);
  transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: var(--coral-light, #ffe5e5); color: var(--coral, #ff6b6b); }

.modal-body   { padding: 20px 28px; overflow-y: auto; flex: 1; }
.modal-footer { 
  padding: 16px 28px 24px; display: flex; gap: 12px; justify-content: flex-end; 
  flex-shrink: 0; border-top: 1.5px solid var(--cloud, #f1f5f9); 
}

/* --- BOUTONS (Bases génériques pour le test) --- */
.btn { 
  padding: 10px 18px; border-radius: 8px; font-weight: bold; 
  cursor: pointer; transition: 0.2s; border: none; font-size: 0.95rem;
}
.btn-primary { background: var(--sky, #4BBFED); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-ghost { background: transparent; color: var(--slate, #64748b); }
.btn-ghost:hover { background: var(--cloud, #f1f5f9); }

/* --- ANIMATIONS MODALE --- */
.modal-enter-active { animation: modalIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.modal-leave-active { animation: modalIn 0.2s ease reverse; }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.92) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
</style>