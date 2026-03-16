<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { apiGet, apiPost, apiDelete } from '@/helpers/axiosApi'
import LoadingEcole from '@/components/admin/LoadingEcole.vue'
import codeToggle from '@/components/admin/codeToggle.vue'


// ── Utilisateur connecté ───────────────────────────────────────
const userAuth = ref(null)

const apiGetUser = async () => {
  const response = await apiGet('ecole/getEcole')
  userAuth.value = response.data.data // réponse enveloppée { status, message, data: {...} }
  console.log('userAuth.value:', userAuth.value)
}

// ── Listes de référence ────────────────────────────────────────
const classes = ref([])
const handicaps = ref([])

const apiGetClasses = async (ecole_id) => {
  try {
    const response = await apiGet('ecole/classe/index/' + ecole_id)
    classes.value = response.data.data ?? [] // .data.data car réponse enveloppée
    console.log('classes.value:', classes.value)
  } catch {
    classes.value = [] // route 404 → pas de crash
    console.log('classes: route indisponible, tableau vide')
  }
}

const apiGetHandicaps = async () => {
  const response = await apiGet('ecole/handicap/index')
  handicaps.value = response.data.data ?? [] // .data.data
  console.log('handicaps.value:', handicaps.value)
}

// ── Liste des élèves ───────────────────────────────────────────
const eleves = ref([])
const loading = ref(false)

const apiGetEleves = async () => {
  loading.value = true
  const response = await apiGet('ecole/eleve/index')
  eleves.value = response.data.data ?? [] // .data.data
  console.log('eleves.value:', eleves.value)
  loading.value = false
}

// ── Filtres ────────────────────────────────────────────────────
const search = ref('')
const filterClasse = ref('')
const filterHandicap = ref('')

const filtered = computed(() =>
  eleves.value.filter((e) => {
    const s = search.value.toLowerCase()
    const ms = !s || e.name?.toLowerCase().includes(s) || e.prenom?.toLowerCase().includes(s)
    const mc = !filterClasse.value || e.classe_id == filterClasse.value
    const mh = !filterHandicap.value || e?.handicap?.id == filterHandicap.value
    return ms && mc && mh
  }),
)

// ── Formulaire créer / modifier ────────────────────────────────
const showForm = ref(false)
const editTarget = ref(null)

const form = reactive({
  name: '',
  prenom: '',
  dateNaissance: '',
  numeroParent: '',
  classe_id: '',
  handicap_id: '',
})

function resetForm() {
  form.name = ''
  form.prenom = ''
  form.dateNaissance = ''
  form.numeroParent = ''
  form.classe_id = ''
  form.handicap_id = ''
}

function openAdd() {
  editTarget.value = null
  resetForm()
  showForm.value = true
}

function openEdit(e) {
  editTarget.value = e
  Object.assign(form, {
    name: e.name ?? '',
    prenom: e.prenom ?? '',
    dateNaissance: e.dateOfNaissance ?? '',
    numeroParent: e.numeroParent ?? '',
    classe_id: e.classe_id ?? '',
    handicap_id: e.handicap_id ?? '',
  })
  showForm.value = true
}

// ── CRÉER ──────────────────────────────────────────────────────
const apiRegisterEleve = async () => {
  const response = await apiPost('ecole/eleve/registerEleve', {
    name: form.name.trim(),
    prenom: form.prenom.trim(),
    dateOfNaissance: form.dateNaissance,
    numeroParent: form.numeroParent,
    classe_id: form.classe_id,
    handicap_id: form.handicap_id,
    ecole_id: userAuth.value.id,
  })
  console.log('élève créé:', response.data)
  showForm.value = false
  await apiGetEleves()
}

// ── MODIFIER ───────────────────────────────────────────────────
const apiUpdateEleve = async () => {
  const response = await apiPost(`ecole/eleve/update/${editTarget.value.id}`, {
    name: form.name.trim(),
    prenom: form.prenom.trim(),
    dateOfNaissance: form.dateNaissance,
    numeroParent: form.numeroParent,
    classe_id: form.classe_id,
    handicap_id: form.handicap_id,
    ecole_id: userAuth.value.id,
  })
  console.log('élève modifié:', response.data)
  showForm.value = false
  await apiGetEleves()
}

const submitForm = async () => {
  if (!form.name.trim() || !form.prenom.trim() || !form.classe_id || !userAuth.value) return
  if (editTarget.value) {
    await apiUpdateEleve()
  } else {
    await apiRegisterEleve()
  }
}

// ── SUPPRIMER ──────────────────────────────────────────────────
const showDelete = ref(false)
const deleteTarget = ref(null)

function confirmDelete(e) {
  deleteTarget.value = e
  showDelete.value = true
}

const apiDeleteEleve = async () => {
  const response = await apiDelete(`ecole/eleve/destroy/${deleteTarget.value.id}`)
  console.log('élève supprimé:', response.data)
  showDelete.value = false
  deleteTarget.value = null
  await apiGetEleves()
}

const doDelete = async () => {
  if (!deleteTarget.value) return
  await apiDeleteEleve()
}

// ── Init ───────────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true
  await apiGetUser()
  await apiGetEleves()
  await apiGetClasses(userAuth.value?.id)
  await apiGetHandicaps()
  loading.value = false

})
</script>

<template>

  <LoadingEcole :visible="loading" :fullscreen="true" offset-top="100px" message="Chargement" />

  <div v-if="loading == false">
    <section class="page container">
    <!-- ══ HEADER ══ -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Élèves</h1>
        <p class="page-sub">{{ eleves.length }} élève(s) enregistré(s)</p>
      </div>
      <button class="btn btn-primary" @click.prevent="openAdd">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Inscrire un élève
      </button>
    </div>

    <!-- ══ FILTRES ══ -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg
          class="search-icon"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="search"
          type="search"
          class="search-input"
          placeholder="Rechercher par nom, prénom…"
        />
      </div>
      <select v-model="filterClasse" class="sel">
        <option value="">Toutes les classes</option>
        <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-model="filterHandicap" class="sel">
        <option value="">Tous les profils</option>
        <option v-for="h in handicaps" :key="h.id" :value="h.id">{{ h.name }}</option>
      </select>
    </div>

    <!-- ══ TABLEAU ══ -->
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Élève</th>
            <th>Classe</th>
            <th>Profil</th>
            <th>Code</th>
            <th>Date de naissance</th>
            <th>N° parents</th>
            <th style="text-align: right">Actions</th>
          </tr>
        </thead>
        <tbody>
         

         
            <tr v-for="e in filtered" :key="e.id">
              <td>
                <div style="display: flex; align-items: center; gap: 10px">
                  <div class="avatar">{{ e.prenom?.charAt(0).toUpperCase() }}</div>
                  <div class="row-name" style="text-transform: uppercase;">{{ e.name }} {{ e.prenom }}</div>
                </div>
              </td>
              <td>
                <span class="badge badge-green" style="text-transform: uppercase;">{{ e.classe?.name ?? '—' }}</span>
              </td>
              <td>
                <span class="badge badge-blue" style="text-transform: uppercase;">{{ e.handicap?.name ?? 'Standard' }}</span>
              </td>
               <td>
                <span class="badge badge-blue"><codeToggle :code="String(e?.code ?? '')"  /></span>
              </td>
              <td class="td-muted">{{ e.dateOfNaissance ?? '—' }}</td>
              <td class="td-muted">{{ e.numeroParent ?? '—' }}</td>
              <td>
                <div style="display: flex; gap: 4px; justify-content: flex-end">
                  <button class="icon-btn" @click="openEdit(e)" title="Modifier">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    class="icon-btn icon-btn-danger"
                    @click="confirmDelete(e)"
                    title="Supprimer"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filtered.length && !loading">
              <td
                colspan="6"
                style="text-align: center; padding: 40px; color: #94a3b8; font-style: italic"
              >
                Aucun élève trouvé.
              </td>
            </tr>
        
        </tbody>
      </table>
    </div>

    <!-- ══ MODALE CRÉER / MODIFIER ══ -->
    <Teleport v-if="showForm" to="body">
      <div class="h-overlay" @click.self="showForm = false">
        <div class="h-modal h-modal-lg">
          <div class="h-modal-head">
            <h2 class="h-modal-title">
              {{ editTarget ? "Modifier l'élève" : 'Inscrire un élève' }}
            </h2>
            <button class="h-close-btn" @click="showForm = false">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="h-modal-body">
            <div class="h-form-grid">
              <div class="h-field">
                <label class="h-lbl">Nom <span class="h-req">*</span></label>
                <input v-model="form.name" class="h-inp" placeholder="Ex : DUPONT" />
              </div>

              <div class="h-field">
                <label class="h-lbl">Prénom <span class="h-req">*</span></label>
                <input v-model="form.prenom" class="h-inp" placeholder="Ex : Lucas" />
              </div>

              <div class="h-field">
                <label class="h-lbl">Date de naissance</label>
                <input v-model="form.dateNaissance" type="date" class="h-inp" />
              </div>

              <div class="h-field">
                <label class="h-lbl">N° des parents</label>
                <input
                  v-model="form.numeroParent"
                  class="h-inp"
                  placeholder="Ex : 0195959595"
                  type="text"
                />
              </div>

              <div class="h-field">
                <label class="h-lbl">Classe <span class="h-req">*</span></label>
                <select v-model="form.classe_id" class="h-inp">
                  <option value="">— Choisir —</option>
                  <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>

              <div class="h-field">
                <label class="h-lbl">Profil d'accessibilité</label>
                <select v-model="form.handicap_id" class="h-inp">
                 <option value="">— Choisir —</option>
                  <option v-for="h in handicaps" :key="h.id" :value="h.id">{{ h.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="h-modal-foot">
            <button class="h-btn h-btn-ghost" @click="showForm = false">Annuler</button>
            <button
              class="h-btn h-btn-primary"
              @click="submitForm"
              :disabled="!form.name.trim() || !form.prenom.trim() || !form.classe_id"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ editTarget ? 'Enregistrer' : 'Inscrire' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ MODALE SUPPRESSION ══ -->
    <Teleport v-if="showDelete" to="body">
      <div class="h-overlay" @click.self="showDelete = false">
        <div class="h-modal">
          <div class="h-modal-head">
            <h2 class="h-modal-title">Supprimer cet élève ?</h2>
            <button class="h-close-btn" @click="showDelete = false">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="h-modal-body" style="text-align: center">
            <div style="margin-bottom: 14px">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                stroke-width="1.8"
                stroke-linecap="round"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p style="color: #64748b; margin: 0; line-height: 1.6">
              Supprimer <strong>{{ deleteTarget?.name }} {{ deleteTarget?.prenom }}</strong> ?<br />
              Cette action est irréversible.
            </p>
          </div>

          <div class="h-modal-foot">
            <button class="h-btn h-btn-ghost" @click="showDelete = false">Annuler</button>
            <button class="h-btn h-btn-danger" @click="doDelete">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
  </div>
</template>

<style scoped>
.page {
  --blue: #2563eb;
  --green: #059669;
  --red: #dc2626;
  --ink: #0f172a;
  --sub: #475569;
  --muted: #94a3b8;
  --border: #e2e8f0;
  --bg: #f8fafc;
  --r: 10px;
  --r-lg: 14px;
  --sh: 0 1px 3px rgba(15, 23, 42, 0.07);
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0;
}
.page-sub {
  font-size: 0.82rem;
  color: var(--muted);
  margin: 3px 0 0;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--r);
  border: 1.5px solid transparent;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-primary {
  background: var(--blue);
  color: white;
  border-color: var(--blue);
}
.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}
.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}
.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  box-sizing: border-box;
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  font-family: inherit;
  font-size: 0.84rem;
  color: var(--ink);
  background: white;
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus {
  border-color: var(--blue);
}
.sel {
  padding: 8px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  font-family: inherit;
  font-size: 0.84rem;
  color: var(--sub);
  background: white;
  outline: none;
  cursor: pointer;
}
.sel:focus {
  border-color: var(--blue);
}
.table-wrap {
  background: white;
  border: 1.5px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--sh);
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th {
  padding: 10px 16px;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--bg);
  border-bottom: 1.5px solid var(--border);
  text-align: left;
}
.table td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.table tr:last-child td {
  border-bottom: none;
}
.table tbody tr:hover {
  background: var(--bg);
}
.row-name {
  font-size: 0.9rem;
  font-weight: 700;
}
.td-muted {
  font-size: 0.85rem;
  color: var(--sub);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb, #6d28d9);
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 700;
}
.badge-green {
  background: rgba(5, 150, 105, 0.12);
  color: #059669;
}
.badge-blue {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}
.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1.5px solid var(--border);
  background: white;
  color: var(--sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.13s;
}
.icon-btn:hover {
  border-color: var(--blue);
  color: var(--blue);
  background: rgba(37, 99, 235, 0.06);
}
.icon-btn-danger:hover {
  border-color: var(--red);
  color: var(--red);
  background: rgba(220, 38, 38, 0.06);
}

/* ── Modales ── */
.h-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}
.h-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.h-modal-lg {
  max-width: 640px;
}
.h-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}
.h-modal-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}
.h-close-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.13s;
}
.h-close-btn:hover {
  border-color: #dc2626;
  color: #dc2626;
}
.h-modal-body {
  padding: 20px 24px;
  overflow-y: auto;
}
.h-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px 20px;
  border-top: 1px solid #e2e8f0;
}
.h-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 520px) {
  .h-form-grid {
    grid-template-columns: 1fr;
  }
}
.h-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.h-lbl {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
}
.h-req {
  color: #dc2626;
}
.h-inp {
  padding: 9px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.88rem;
  color: #0f172a;
  background: white;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.h-inp:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.h-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.15s;
}
.h-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.h-btn-primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}
.h-btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}
.h-btn-ghost {
  background: transparent;
  border-color: #e2e8f0;
  color: #475569;
}
.h-btn-ghost:hover {
  border-color: #94a3b8;
}
.h-btn-danger {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}
.h-btn-danger:hover {
  background: #b91c1c;
}
</style>
