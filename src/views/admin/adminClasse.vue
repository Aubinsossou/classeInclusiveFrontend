<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiGet, apiPost, apiPut, apiDelete } from '@/helpers/axiosApi'
import LoadingEcole from '@/components/admin/LoadingEcole.vue'

const loading = ref(false)

const formData = ref({ name: '' })
const classeCreate = ref()
const userAuth = ref()
const listeClasse = ref()
const classeEdit = ref()
const classeUpdateId = ref()
const classeUpdate = ref()
const classeDelete = ref()

let visible = ref(false)
let visible_ajout = ref(false)

/* ─── ASSIGNATION MATIÈRE ─────────────────────────────────── */
const visible_matiere       = ref(false)
const classeSelectionnee    = ref(null)
const matieresSelectionnees = ref([])
const assignLoading         = ref(false)

// Matières réelles depuis userAuth (ecole/getEcole)
const listeMatieres = computed(() => userAuth.value?.data?.matieres ?? [])

function ouvrirAssignMatiere(classe) {
  classeSelectionnee.value    = classe
  matieresSelectionnees.value = []
  visible_matiere.value       = true
}

function toggleMatiere(id) {
  const idx = matieresSelectionnees.value.indexOf(id)
  if (idx === -1) matieresSelectionnees.value.push(id)
  else            matieresSelectionnees.value.splice(idx, 1)
}

const apiAssignMatiere = async () => {
  if (!matieresSelectionnees.value.length || !classeSelectionnee.value) return
  assignLoading.value = true
  try {
    // TODO: remplacer par le vrai appel quand l'API est prête
    await apiPost('/ecole/classe/assigneMatiere/store', {
      classe_id:   classeSelectionnee.value.id,
      matiere_id: matieresSelectionnees.value,
      ecole_id: userAuth.value?.data?.id,
    })

    console.log('[MOCK] Assigner matières', matieresSelectionnees.value, '→ classe', classeSelectionnee.value.id, '→ Ecole', userAuth.value?.data?.id)
    visible_matiere.value = false
    await apiGEtListeClasse(userAuth.value?.data.id)
  } finally {
    assignLoading.value = false
  }
}
/* ─────────────────────────────────────────────────────────── */

const apiGetUser = async () => {
  const response = await apiGet('ecole/getEcole')
  userAuth.value = response.data
  console.log(' userAuth.value: ', userAuth.value)
}

const apiPostClasse = () => {
  const response = apiPost('/ecole/classe/store', {
    name: formData.value.name,
    ecole_id: userAuth.value?.data?.id,
  })
  visible_ajout.value = false
  classeCreate.value = response
  apiGEtListeClasse(userAuth.value?.data.id)
}

const apiGEtListeClasse = async (ecole_id) => {
  loading.value = true
  const response = await apiGet('ecole/classe/index/' + ecole_id)
  listeClasse.value = response.data
  console.log(' listeClasse: ', listeClasse.value)
  loading.value = false
}

const affiche = async (id) => {
  visible.value = true
  const response = await apiGet('ecole/classe/edit/' + id)
  classeEdit.value = response.data
  classeUpdateId.value = id
}

const apiClasseUpdate = (classeUpdateId) => {
  const response = apiPut('ecole/classe/update/' + classeUpdateId, {
    name: classeEdit.value.data.name,
    ecole_id: userAuth.value?.data.id,
  })
  classeUpdate.value = response
  visible.value = false
  apiGEtListeClasse(userAuth.value?.data.id)
}

const apiClasseDelete = async (id) => {
  const response = await apiDelete('ecole/classe/destroy/' + id)
  classeDelete.value = response
  apiGEtListeClasse(userAuth.value?.data.id)
}

onMounted(async () => {
  loading.value = true
  await apiGetUser()
  await apiGEtListeClasse(userAuth.value?.data.id)
  loading.value = false
})
</script>

<template>
  <div class="container">
    <LoadingEcole :visible="loading" :fullscreen="true" offset-top="100px" message="Chargement" />

    <div class="top" v-if="loading == false">
      <div class="top_left">
        <h1>Listes des Classes</h1>
        <p>Année 2025-2026</p>
      </div>
      <div class="top_right">
        <button class="add_class" @click="visible_ajout = true">+ Ajouter une classe</button>
      </div>
    </div>

    <div class="middle" v-if="listeClasse?.data?.length > 0">
      <div class="card_class" v-for="Classe in listeClasse.data" :key="Classe.id">

        <!-- Header carte -->
        <div class="class_top">
          <div class="class_top_left">
            <span style="text-transform: uppercase;">{{ Classe?.name }}</span>
          </div>
          <div class="class_top_right">
            <button class="card_edit"   @click.prevent="affiche(Classe.id)">✏️</button>
            <button class="card_delete" @click.prevent="apiClasseDelete(Classe.id)">🗑️</button>
          </div>
        </div>

        <!-- Enseignant -->
        <div class="class_middle">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <p >{{ Classe?.enseignant ? Classe.enseignant.name + ' ' + Classe.enseignant.prenom : 'Aucun enseignant' }}</p>
        </div>

        <!-- ── MATIÈRES ── -->
        <div class="class_matieres">
          <div class="matieres_header">
            <div class="matieres_label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Matières
            </div>
            <button class="btn_assign" @click="ouvrirAssignMatiere(Classe)">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Assigner
            </button>
          </div>
          <div class="matieres_chips" v-if="Classe?.matieres?.length">
            <span class="matiere_chip" v-for="m in Classe.matieres" :key="m.id">{{ m.name }}</span>
          </div>
          <p class="no_matiere" v-else>Aucune matière assignée</p>
        </div>

        <!-- Bas de carte : stats -->
        <div class="class_low">
          <div class="stat_chip stat_chip_blue">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <strong>{{ Classe?.eleves?.length ?? 0 }}</strong> élève{{ (Classe?.eleves?.length ?? 0) > 1 ? 's' : '' }}
          </div>
          <div class="stat_chip stat_chip_teal">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <strong>{{ Classe?.matieres?.length ?? 0 }}</strong> matière{{ (Classe?.matieres?.length ?? 0) > 1 ? 's' : '' }}
          </div>
        </div>

      </div>
    </div>

    <div v-else-if="loading == false" style="font-family: inherit; text-align: center; padding-top: 100px">
      <i>Veillez ajouter une classe</i>
    </div>
  </div>

  <!-- ── MODAL MODIFIER CLASSE ── -->
  <div class="overlay" v-show="visible">
    <div class="contenu" v-if="classeEdit">
      <button class="fermer" @click="visible = false">✕</button>
      <div class="high_overlay">
        <h2>Modifier une classe</h2>
      </div>
      <div class="middle_overlay">
        <form class="form_grid">
          <div class="field">
            <label>Nom de la classe</label>
            <input type="text" v-model="classeEdit.data.name" />
          </div>
        </form>
      </div>
      <div class="trait"></div>
      <div class="low_overlay">
        <button class="btn_action btn_save" @click.prevent="apiClasseUpdate(classeUpdateId)">Enregistrer</button>
        <button class="btn_action btn_cancel" @click.prevent="visible = false">Annuler</button>
      </div>
    </div>
  </div>

  <!-- ── MODAL AJOUTER CLASSE ── -->
  <div class="overlay" v-show="visible_ajout">
    <div class="contenu">
      <button class="fermer" @click="visible_ajout = false">✕</button>
      <div class="high_overlay">
        <h2>Ajouter une classe</h2>
      </div>
      <div class="middle_overlay">
        <form class="form_grid">
          <div class="field">
            <label>Nom de la classe</label>
            <input type="text" v-model="formData.name" placeholder="Ex: CP-A, CE1-B…" />
          </div>
        </form>
      </div>
      <div class="trait"></div>
      <div class="low_overlay">
        <button class="btn_action btn_save" @click.prevent="apiPostClasse">Créer</button>
        <button class="btn_action btn_cancel" @click.prevent="visible_ajout = false">Annuler</button>
      </div>
    </div>
  </div>

  <!-- ── MODAL ASSIGNER MATIÈRE ── -->
  <div class="overlay" v-show="visible_matiere">
    <div class="contenu contenu_matiere">
      <button class="fermer" @click="visible_matiere = false">✕</button>

      <div class="high_overlay">
        <div class="modal_icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <h2>Assigner une matière</h2>
        <p class="modal_sub">Classe : <strong>{{ classeSelectionnee?.name }}</strong></p>
      </div>

      <div class="middle_overlay">
        <p class="select_hint">Cliquez sur les matières à assigner — plusieurs choix possibles</p>
        <div class="matieres_grid">
          <button
            v-for="m in listeMatieres"
            :key="m.id"
            class="matiere_option"
            :class="{ matiere_option_active: matieresSelectionnees.includes(m.id) }"
            @click="toggleMatiere(m.id)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            {{ m.name }}
            <svg v-if="matieresSelectionnees.includes(m.id)" class="check_icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
        
      </div>

      <div class="trait"></div>
      <div class="low_overlay">
        <button
          class="btn_action btn_save"
          :disabled="!matieresSelectionnees.length || assignLoading"
          @click.prevent="apiAssignMatiere"
        >
          {{ assignLoading ? 'Assignation…' : 'Assigner' }}
        </button>
        <button class="btn_action btn_cancel" @click.prevent="visible_matiere = false">Annuler</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  padding: 0;
  margin: 0;
  font-family: Nunito, sans-serif;
  color: #1a2b5e;
}

.container {
  padding: 28px 32px;
  width: 1200px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
}

/* ── TOP ── */
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.top_left h1 { font-size: 1.6rem; font-weight: 900; }
.top_left p  { color: #64748b; font-size: 0.88rem; margin-top: 4px; }

.add_class {
  background: linear-gradient(140deg, #4bbfed 0%, #2ea8dc 100%);
  color: white;
  border-radius: 15px;
  border: none;
  font-size: 1rem;
  padding: 14px 24px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(75, 191, 237, 0.35);
  cursor: pointer;
  transition: 0.3s;
}
.add_class:hover { transform: translateY(-2px); }

/* ── GRILLE ── */
.middle {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

/* ── CARTE CLASSE ── */
.card_class {
  width: 270px;
  display: flex;
  flex-direction: column;
  border: 2px solid #d4e2ff;
  box-shadow: 0 4px 20px rgba(75, 191, 237, 0.10);
  border-radius: 16px;
  padding: 20px;
  gap: 12px;
  background: white;
  transition: 0.3s;
}
.card_class:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(75, 191, 237, 0.2);
  border-color: #4bbfed;
}

.class_top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.class_top_left span {
  background: linear-gradient(135deg, #22d4a0, #4bbfed);
  color: white;
  border-radius: 20px;
  padding: 5px 14px;
  font-weight: 900;
  font-size: 0.85rem;
}
.class_top_right { display: flex; gap: 6px; }

.card_edit, .card_delete {
  padding: 5px 8px;
  border-radius: 10px;
  border: 1.5px solid #d4e2ff;
  background: white;
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.2s;
}
.card_edit:hover   { border-color: #4bbfed; background: #e0f4fd; }
.card_delete:hover { border-color: #ff5c5c; background: #ffe2e2; }

/* Enseignant */
.class_middle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #64748b;
}
.class_middle p { margin: 0; }

/* ── BLOC MATIÈRES ── */
.class_matieres {
  background: #f4f8ff;
  border: 1.5px solid #dbeafe;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.matieres_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.matieres_label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.matieres_chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.matiere_chip {
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 6px;
  padding: 3px 9px;
  font-size: 0.7rem;
  font-weight: 700;
}
.no_matiere {
  font-size: 0.76rem;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
}
.btn_assign {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 100px;
  border: 1.5px dashed #4bbfed;
  background: transparent;
  color: #2ea8dc;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  font-family: Nunito, sans-serif;
}
.btn_assign:hover {
  background: #e0f4fd;
  border-style: solid;
}

/* Bas de carte : stat chips */
.class_low {
  display: flex;
  gap: 8px;
  padding-top: 6px;
  border-top: 1.5px solid #f1f5f9;
  flex-wrap: wrap;
}
.stat_chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
}
.stat_chip_blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.stat_chip_teal {
  background: #d1fae5;
  color: #065f46;
}

/* ── OVERLAY ── */
.overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(26, 43, 94, 0.55);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.contenu {
  background: white;
  padding: 28px;
  border-radius: 20px;
  width: 460px;
  position: relative;
}
.contenu_matiere { width: 520px; }

.fermer {
  position: absolute;
  top: 14px; right: 14px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 900;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.fermer:hover { background: #fee2e2; color: #ef4444; }

.high_overlay {
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.high_overlay h2 { font-size: 1.15rem; font-weight: 900; }
.modal_sub { font-size: 0.83rem; color: #64748b; margin: 0; }
.modal_icon {
  width: 46px; height: 46px;
  border-radius: 13px;
  background: linear-gradient(135deg, #4bbfed, #2ea8dc);
  display: flex;
  align-items: center;
  justify-content: center;
}

.middle_overlay { margin-bottom: 20px; }

.form_grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.field { display: flex; flex-direction: column; gap: 6px; text-align: left; }
.field label { font-size: 0.78rem; font-weight: 700; color: #64748b; }

input {
  border-radius: 12px;
  border: 2px solid #d4e2ff;
  width: 100%;
  height: 44px;
  padding: 0 15px;
  font-size: 1rem;
  transition: 0.3s ease;
  box-sizing: border-box;
  font-family: Nunito, sans-serif;
}
input:focus { outline: none; border-color: #4bbfed; box-shadow: 0 0 0 3px rgba(75,191,237,0.2); }

/* ── GRILLE MATIÈRES MODAL ── */
.matieres_grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.matiere_option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  border-radius: 10px;
  border: 2px solid #e2eaff;
  background: white;
  font-size: 0.84rem;
  font-weight: 700;
  color: #1a2b5e;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-family: Nunito, sans-serif;
  text-transform:capitalize;
}
.matiere_option:hover { border-color: #4bbfed; background: #f0faff; }
.matiere_option_active {
  border-color: #2ea8dc;
  background: #e0f4fd;
  color: #1a6e96;
}
.select_hint {
  font-size: 0.76rem;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 12px;
  font-style: italic;
}
.selection_count {
  margin-top: 10px;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 800;
  color: #2ea8dc;
  background: #e0f4fd;
  padding: 5px 14px;
  border-radius: 100px;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
}

.check_icon { margin-left: auto; color: #2ea8dc; flex-shrink: 0; }

.trait {
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, transparent, #d4e2ff, transparent);
  border-radius: 20px;
  margin-bottom: 20px;
}
.low_overlay { display: flex; gap: 10px; justify-content: flex-end; }

.btn_action {
  padding: 10px 22px;
  border: none;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
  font-family: Nunito, sans-serif;
}
.btn_save {
  background: linear-gradient(135deg, #4bbfed, #2ea8dc);
  color: white;
}
.btn_save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(75,191,237,0.4); }
.btn_save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn_cancel { background: #f1f5f9; color: #64748b; }
.btn_cancel:hover { background: #e2e8f0; }
</style>