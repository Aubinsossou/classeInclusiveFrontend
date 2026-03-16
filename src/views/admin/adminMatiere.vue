<script setup>
import { ref, onMounted } from 'vue'
import { apiGet, apiPost, apiDelete } from '@/helpers/axiosApi'
import LoadingEcole from '@/components/admin/LoadingEcole.vue'
const loading = ref(false)

// ── Utilisateur connecté ───────────────────────────────────────
const userAuth = ref(null)

const apiGetUser = async () => {
  const response = await apiGet('ecole/getEcole')
  userAuth.value = response.data
  console.log('userAuth.value:', userAuth.value?.data)
}

// ── Liste des matières ─────────────────────────────────────────
const matieres = ref([])

const apiGetMatieres = async (ecole_id) => {
  loading.value = true

  const response = await apiGet('ecole/matiere/index/' + ecole_id)
  matieres.value = response.data
  console.log('matieres.value:', matieres.value)
  loading.value = false

}

// ── Formulaire ─────────────────────────────────────────────────
const showModalAjout = ref(false)
const showModalupdate = ref(false)
const showModalDelete = ref(false)
const editTarget = ref(null)
const deleteTarget = ref(null)
const formName = ref('')

const toggleForm_ajout = () => {
  editTarget.value = null
  formName.value = ''
  showModalAjout.value = !showModalAjout.value
}

const openEdit = (matiere) => {
  editTarget.value = matiere
  formName.value = matiere.name
  showModalupdate.value = true
}

const toggleForm_update = () => {
  showModalupdate.value = !showModalupdate.value
}

const openDelete = (matiere) => {
  deleteTarget.value = matiere
  showModalDelete.value = true
}

const toggleForm_delete = () => {
  showModalDelete.value = !showModalDelete.value
}

//  CRÉER 
const apiPostMatiere = async () => {
  const response = await apiPost('ecole/matiere/store', {
    name: formName.value.trim(),
    ecole_id: userAuth.value?.data?.id,
  })
  console.log('matière créée:', response.data)
  showModalAjout.value = false
  apiGetMatieres(userAuth.value?.data.id)
}

//  MODIFIER 
const apiUpdateMatiere = async () => {
  const response = await apiPost(`ecole/matiere/update/${editTarget.value.id}`, {
    name: formName.value.trim(),
    ecole_id: userAuth.value.id,
  })
  console.log('matière modifiée:', response.data)
  showModalupdate.value = false
  await apiGetMatieres(userAuth.value?.data)
}

//  SUPPRIMER 
const apiDeleteMatiere = async () => {
  const response = await apiDelete(`ecole/matiere/destroy/${deleteTarget.value.id}`)
  console.log('matière supprimée:', response.data)
  showModalDelete.value = false
  deleteTarget.value = null
  apiGetMatieres(userAuth.value?.data.id)
}

//  Init au montage
onMounted(async () => {
  loading.value = true
  await apiGetUser()
  await apiGetMatieres(userAuth.value?.data.id)
  loading.value = false

})
</script>

<template>
  <LoadingEcole :visible="loading" :fullscreen="true" offset-top="100px" message="Chargement" />
  <div class="container" v-if="loading == false">
    <div style="display: flex; flex-direction: column; gap: 24px">
      <!-- Header -->
      <div class="pro-page-header">
        <div>
          <h1 class="pro-page-title">Matières</h1>
          <p class="pro-page-sub">{{ matieres?.data?.length }} matière(s) au programme</p>
        </div>
        <button class="pro-btn pro-btn-primary button_special" @click="toggleForm_ajout">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Ajouter une matière
        </button>
      </div>

      <!-- Grille de cartes -->
      <div class="subjects-grid" role="list" aria-label="Liste des matières">
        <div
          v-for="m in matieres.data"
          :key="m.id"
          class="subject-card"
          role="listitem"
          :aria-label="m.name"
          style="--sc: #4bbfed"
        >
          <div class="sc-bg-circle" aria-hidden="true"></div>

          <!-- Actions flottantes -->
          <div class="sc-actions">
            <button
              class="pro-icon-btn"
              :aria-label="'Modifier ' + m.name"
              title="Modifier"
              @click.prevent="openEdit(m)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              class="pro-icon-btn pro-icon-btn-danger"
              :aria-label="'Supprimer ' + m.name"
              title="Supprimer"
              @click.prevent="openDelete(m)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6M14 11v6"></path>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
              </svg>
            </button>
          </div>

          <!-- Icône -->
          <div class="sc-icon-wrap">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>

          <!-- Nom -->
          <h3 class="sc-name" style="text-transform: uppercase;">{{ m.name }}</h3>

          <!-- Footer -->
          <div class="sc-footer">
            <div class="sc-footer-icon">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span class="sc-footer-txt">{{ m?.cours?.length }} cours creer</span>
          </div>
        </div>

        <!-- Carte "Ajouter" -->
        <button
          class="subject-card sc-add"
          aria-label="Ajouter une matière"
          @click.prevent="toggleForm_ajout"
        >
          <div class="sc-add-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span class="sc-add-label">Nouvelle matière</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ══ MODALE AJOUT ══ -->
  <Teleport v-if="showModalAjout" to="body">
    <div class="modal-overlay" @click.self="toggleForm_ajout">
      <div class="form_container">
        <div class="form_banner">
          <h2>Ajouter une matière</h2>
          <button @click.prevent="toggleForm_ajout" class="form_reduct_button">x</button>
        </div>
        <div class="form_ajout">
          <div class="form_grid">
            <div class="form_grid_input">
              <label>Nom de la matière</label>
              <input
                v-model="formName"
                type="text"
                placeholder="Ex : Mathématiques"
                @keydown.enter.prevent="apiPostMatiere"
                @keydown.escape="toggleForm_ajout"
              />
            </div>
          </div>
        </div>
        <div class="form_button">
          <button @click.prevent="toggleForm_ajout" class="button_annuler button_special">
            Annuler
          </button>
          <button
            class="button_ajouter button_special"
            :disabled="!formName.trim()"
            @click.prevent="apiPostMatiere"
          >
            + Ajouter
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ══ MODALE MODIFIER ══ -->
  <Teleport v-if="showModalupdate" to="body">
    <div class="modal-delete-overlay" @click.self="toggleForm_update">
      <div class="form_container">
        <div class="form_banner">
          <h2>Modifier une matière</h2>
          <button @click.prevent="toggleForm_update" class="form_reduct_button">x</button>
        </div>
        <div class="form_ajout">
          <div class="form_grid">
            <div class="form_grid_input">
              <label>Nom de la matière</label>
              <input
                v-model="formName"
                type="text"
                placeholder="Ex : Mathématiques"
                @keydown.enter.prevent="apiUpdateMatiere"
                @keydown.escape="toggleForm_update"
              />
            </div>
          </div>
        </div>
        <div class="form_button">
          <button @click="toggleForm_update" class="button_annuler button_special">Annuler</button>
          <button
            class="button_ajouter button_special"
            :disabled="!formName.trim()"
            @click.prevent="apiUpdateMatiere"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ══ MODALE SUPPRESSION ══ -->
  <Teleport v-if="showModalDelete" to="body">
    <div class="modal-third-overlay" @click.self="toggleForm_delete">
      <div class="classes_container">
        <div class="classes_banner">
          <h2>Supprimer cette matière ?</h2>
          <button @click.prevent="toggleForm_delete" class="classes_reduct_button">x</button>
        </div>
        <div class="delete_body">
          <div class="delete_body_svg">
            <svg
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              fill="#000000"
            >
              <g id="SVGRepo_iconCarrier">
                <path d="M724.3 198H296.1l54.1-146.6h320z" fill="#FAFCFB"></path>
                <path
                  d="M724.3 216.5H296.1c-6.1 0-11.7-3-15.2-7.9-3.5-5-4.3-11.3-2.2-17L332.8 45c2.7-7.3 9.6-12.1 17.4-12.1h320c7.7 0 14.7 4.8 17.4 12.1l54.1 146.6c2.1 5.7 1.3 12-2.2 17-3.5 4.9-9.2 7.9-15.2 7.9z m-401.6-37h375.1L657.3 69.9H363.1l-40.4 109.6z"
                  fill="#0F0F0F"
                ></path>
                <path
                  d="M664.3 981.6H339.7c-54.2 0-98.5-43.3-99.6-97.5L223.7 235h572.9l-32.8 651.4c-2.3 53.2-46.1 95.2-99.5 95.2z"
                  fill="#9DC6AF"
                ></path>
                <path
                  d="M827.1 239.5H193.3c-22.2 0-40.4-18.2-40.4-40.4v-2.2c0-22.2 18.2-40.4 40.4-40.4h633.8c22.2 0 40.4 18.2 40.4 40.4v2.2c0 22.2-18.2 40.4-40.4 40.4z"
                  fill="#d38731"
                ></path>
              </g>
            </svg>
          </div>
          <p>
            Voulez-vous vraiment supprimer <strong>« {{ deleteTarget?.name }} »</strong> ?
          </p>
          <p>Cette action est irréversible.</p>
        </div>
        <div class="classes_footer">
          <button
            class="button_special"
            style="background: #dc2626; box-shadow: 0 6px 20px #dc262659"
            @click.prevent="apiDeleteMatiere"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Grille ─────────────────────────────────────── */
.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}

.subject-card {
  position: relative;
  overflow: hidden;
  background: white;
  border-radius: 18px;
  border: 1px solid var(--pro-border);
  box-shadow: var(--pro-shadow-md);
  padding: 22px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: default;
  transition:
    transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease;
}
.subject-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.06);
}

.sc-bg-circle {
  position: absolute;
  top: -28px;
  right: -28px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--sc) 10%, transparent);
  transition: transform 0.3s ease;
  pointer-events: none;
}
.subject-card:hover .sc-bg-circle {
  transform: scale(1.3);
}

.sc-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  z-index: 2;
}
.subject-card:hover .sc-actions {
  opacity: 1;
  transform: translateY(0);
}

.sc-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 13px;
  background: color-mix(in srgb, var(--sc) 12%, white);
  border: 1.5px solid color-mix(in srgb, var(--sc) 22%, transparent);
  color: var(--sc);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.subject-card:hover .sc-icon-wrap {
  transform: scale(1.1) rotate(-4deg);
}

.sc-name {
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--pro-ink);
  letter-spacing: -0.015em;
  line-height: 1.25;
  padding-right: 32px;
}

.sc-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--pro-border);
}
.sc-footer-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--sc) 10%, white);
  color: var(--sc);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sc-footer-txt {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--pro-muted);
}

.sc-add {
  border: 2px dashed var(--pro-border);
  background: #fafcff;
  box-shadow: none;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  cursor: pointer;
  font-family: var(--pro-font);
  transition: all 0.2s ease;
}
.sc-add:hover {
  border-color: var(--pro-blue);
  background: var(--pro-blue-soft);
  transform: translateY(-3px);
  box-shadow: var(--pro-shadow-md);
}
.sc-add-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--pro-border);
  color: var(--pro-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}
.sc-add:hover .sc-add-icon {
  background: var(--pro-blue);
  color: white;
}
.sc-add-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--pro-muted);
}
.sc-add:hover .sc-add-label {
  color: var(--pro-blue);
}

.form_container {
  width: 550px;
  margin: 0 auto;
  border-radius: 40px;
  color: #1a2b5e;
  font-family: 'Nunito', sans-serif;
  padding: 10px;
  background-color: #fff;
}
.form_banner {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
.form_reduct_button {
  all: unset;
  height: 36px;
  width: 36px;
  background-color: #e2eaff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}
.form_reduct_button:hover {
  transform: none;
  color: #ff5c5c;
  background-color: #ffe2e2;
}
.form_ajout {
  padding: 10px 0;
}
.form_grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 10px;
}
.form_grid_input {
  font-size: 0.88rem;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form_grid_input input {
  padding: 12px 16px;
  background-color: #fafcff;
  border: 2px solid #d4e2ff;
  border-radius: 18px;
}
.form_grid_input input::placeholder {
  color: #6278a8;
}
.form_grid_input input:focus {
  outline: none;
  transition: 0.2s;
  border-color: #4bbfed;
}
.form_button {
  display: flex;
  justify-content: end;
  gap: 12px;
  padding: 14px 10px;
  border-top: 1.5px solid #e2eaff;
}
.button_annuler {
  background-color: #fff;
  color: #1a2b5e;
  border: 2px solid #d4e2ff;
  box-shadow: none;
}
.button_annuler:hover {
  border-color: #4bbfed;
  background-color: #bfe8f8;
  box-shadow: none;
}
.button_special {
  font-family: 'Baloo 2', sans-serif;
  color: white;
  background-color: #4bbfed;
  border-radius: 18px;
  border-style: none;
  font-size: 18px;
  font-weight: bold;
  padding: 14px 30px;
  box-shadow: 0 6px 20px #4bbfed59;
  transition: 0.3s ease-out;
  cursor: pointer;
}
.button_special:hover {
  background: #4bbfedde;
  transition: 0.3s ease-out;
  transform: translateY(-4px);
}
.button_special:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.classes_reduct_button {
  all: unset;
  height: 36px;
  width: 36px;
  background-color: #e2eaff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}
.classes_reduct_button:hover {
  transform: none;
  background-color: #ffe2e2;
  color: #ff5c5c;
}

.modal-overlay {
  position: fixed;
  z-index: 1000;
  background-color: #1a2b5e8c;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}
.modal-delete-overlay {
  position: fixed;
  z-index: 1000;
  background-color: #1a2b5e8c;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}
.modal-third-overlay {
  position: fixed;
  z-index: 1000;
  background-color: #1a2b5e8c;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.classes_container {
  width: 430px;
  margin: 0 auto;
  border-radius: 40px;
  color: #1a2b5e;
  font-family: 'Nunito', sans-serif;
  padding: 20px;
  background-color: #fff;
}
.classes_banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}
.classes_footer {
  padding: 16px 12px 10px 12px;
  border-top: 1px solid #e2eaff;
  display: flex;
  justify-content: center;
}
.classes_footer button {
  width: 100%;
}
.delete_body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
}
.delete_body_svg {
  height: 100px;
  width: 100px;
}
</style>
