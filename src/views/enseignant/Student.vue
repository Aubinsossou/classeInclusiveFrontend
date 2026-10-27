<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { apiGet, apiPost, apiDelete } from '@/helpers/axiosApi'
import LoadingView from '@/components/admin/Loading.vue'
import codeToggle from '@/components/admin/codeToggle.vue'
import ResponsiveTable from '@/components/ResponsiveTable.vue'
import { useFormValidation } from '@/composables/useFormValidation'

const getEnseignantAuth = ref(null)
const handicaps = ref([])
const loading = ref(true)

const apiGetEnseignantConnect = async () => {
  loading.value = true
  const response = await apiGet('/enseignant/getEnseignant')
  getEnseignantAuth.value = response.data
  console.log('[getEnseignant]', getEnseignantAuth.value)
  loading.value = false
}

const apiGetHandicaps = async () => {
  const response = await apiGet('ecole/handicap/index')
  handicaps.value = response.data.data ?? []
  console.log('[handicaps]', handicaps.value)
}

onMounted(async () => {
  await apiGetEnseignantConnect()
  await apiGetHandicaps()
  loading.value = false
})

// ── Données dérivées ───────────────────────────────────────────────────────
const userAuth = computed(() => getEnseignantAuth.value?.data ?? null)
const eleves = computed(() => userAuth.value?.classe?.eleves ?? [])
// L'enseignant ne peut gérer ses élèves que s'il a une classe assignée.
const canManage = computed(() => Boolean(userAuth.value?.classe_id))

// ── Filtres ────────────────────────────────────────────────────────────────
const search = ref('')
const filterHandicap = ref('')

const filteredEleves = computed(() =>
  eleves.value.filter((e) => {
    const fullName = `${e.prenom ?? ''} ${e.name ?? ''}`.toLowerCase()
    const matchSearch =
      !search.value ||
      fullName.includes(search.value.toLowerCase()) ||
      String(e.code).includes(search.value)
    const matchHandicap = !filterHandicap.value || e.handicap?.name === filterHandicap.value
    return matchSearch && matchHandicap
  }),
)

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR')
}

// Eleve connecter
function isOnline(eleve) {
  return eleve.is_connect === true || eleve.is_connect === 'true'
}

// ── Toast ──────────────────────────────────────────────────────────────────
const toast = ref(null)
const toastVisible = ref(false)
let toastTimer = null
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.value = { msg, type }
  toastVisible.value = true
  toastTimer = setTimeout(() => (toastVisible.value = false), 3500)
}

// ── Modale d'ajout / édition (inline école : comportement école) ──────────────
// Même interaction que adminEnseignant.vue : overlay v-if, fermeture Échap /
// clic extérieur, focus sur le 1er champ, piège de focus Tab, labels,
// état de chargement, erreurs inline, toast de succès + rafraîchissement. ────
const showForm = ref(false)
const editTarget = ref(null)
const isEdit = computed(() => !!editTarget.value)

const formEl = ref(null)
const modalEl = ref(null)
const firstField = ref(null)
const submitting = ref(false)
const formError = ref('')
const fieldErrors = ref({})
let previousFocus = null

const { validate, attach } = useFormValidation()

const emptyForm = () => ({
  name: '',
  prenom: '',
  dateOfNaissance: '',
  numeroParent: '',
  handicap_id: '',
  code: '',
})
const form = reactive(emptyForm())

function firstError(field) {
  const value = fieldErrors.value[field]
  if (Array.isArray(value)) return value[0]
  return value || ''
}

function resetForm() {
  Object.assign(form, emptyForm())
  formError.value = ''
  fieldErrors.value = {}
  // En mode édition, pré-remplir avec les données existantes.
  if (isEdit.value && editTarget.value) {
    form.name = editTarget.value.name ?? ''
    form.prenom = editTarget.value.prenom ?? ''
    form.dateOfNaissance = editTarget.value.dateOfNaissance ?? ''
    form.numeroParent = editTarget.value.numeroParent ?? ''
    form.handicap_id = editTarget.value.handicap_id ?? editTarget.value.handicap?.id ?? ''
    form.code = editTarget.value.code != null ? String(editTarget.value.code) : ''
  }
}

// ── Piège de focus (accessibilité) : Tab / Shift+Tab restent dans la modale.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function trapFocus(e) {
  const modal = modalEl.value
  if (!modal) return
  const focusables = Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR))
  if (!focusables.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  const active = document.activeElement
  if (e.shiftKey) {
    if (active === first || !modal.contains(active)) {
      e.preventDefault()
      last.focus()
    }
  } else if (active === last) {
    e.preventDefault()
    first.focus()
  }
}

function onFormKeydown(e) {
  if (e.key === 'Escape' && !submitting.value) {
    closeForm()
    return
  }
  if (e.key === 'Tab') trapFocus(e)
}

function closeForm() {
  showForm.value = false
  editTarget.value = null
}

function openAdd() {
  editTarget.value = null
  showForm.value = true
}

function openEdit(eleve) {
  editTarget.value = eleve
  showForm.value = true
}

// À l'ouverture : reset, focus 1er champ, validation live, verrou scroll + Échap.
// Le padding-right compense la disparition de la scrollbar (anti-décalage).
// À la fermeture : restaure scroll, rend le focus à l'élément précédent.
watch(showForm, (isOpen) => {
  if (isOpen) {
    resetForm()
    previousFocus = document.activeElement
    // Largeur de la scrollbar avant de la masquer (0 si overlay scroll / mobile).
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onFormKeydown)
    nextTick(() => {
      attach(formEl.value)
      firstField.value?.focus?.({ preventScroll: true })
    })
  } else {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    window.removeEventListener('keydown', onFormKeydown)
    if (previousFocus && document.contains(previousFocus)) previousFocus.focus?.()
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  window.removeEventListener('keydown', onFormKeydown)
})

async function submitForm() {
  formError.value = ''
  if (!validate(formEl.value)) {
    formError.value = 'Veuillez remplir tous les champs obligatoires.'
    return
  }
  submitting.value = true
  fieldErrors.value = {}
  try {
    // NOTE : aucun classe_id n'est envoyé — le serveur rattache
    // toujours l'élève à la classe de l'enseignant connecté.
    const payload = {
      name: form.name.trim(),
      prenom: form.prenom.trim(),
      numeroParent: form.numeroParent.trim(),
      handicap_id: form.handicap_id === '' ? '' : Number(form.handicap_id),
      dateOfNaissance: form.dateOfNaissance,
    }

    if (isEdit.value) {
      // En mode édition, le code est envoyé s'il est renseigné (sinon inchangé).
      if (form.code.trim()) payload.code = form.code.trim()
      const response = await apiPost(`enseignant/classe/eleve/update/${editTarget.value.id}`, payload)
      await onEleveCreated({ message: response.data?.message || 'Élève modifié avec succès.' })
    } else {
      payload.code = form.code.trim()
      const response = await apiPost('enseignant/classe/eleve/store', payload)
      await onEleveCreated({ message: response.data?.message || 'Élève ajouté à votre classe.' })
    }
  } catch (err) {
    const status = err?.response?.status
    const data = err?.response?.data
    if (status === 409) {
      formError.value = data?.message || 'Ce code est déjà utilisé par un autre élève.'
      fieldErrors.value = { code: [formError.value] }
    } else if (status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('role')
      window.location.href = '/enseignant/login'
    } else {
      formError.value = data?.message || (isEdit.value ? "La modification de l'élève a échoué." : "L'ajout de l'élève a échoué.")
      fieldErrors.value = data?.errors ?? {}
    }
  } finally {
    submitting.value = false
  }
}

async function onEleveCreated({ message }) {
  const wasEdit = !!editTarget.value
  showForm.value = false
  editTarget.value = null
  showToast(message || (wasEdit ? 'Élève modifié avec succès.' : 'Élève ajouté à votre classe.'), 'success')
  await apiGetEnseignantConnect()
}

// ── Suppression d'un élève ─────────────────────────────────────────────────
const showDelete = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const deleteError = ref('')

function confirmDelete(e) {
  deleteTarget.value = e
  deleteError.value = ''
  showDelete.value = true
}

const doDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    const response = await apiDelete(`enseignant/classe/eleve/destroy/${deleteTarget.value.id}`)
    console.log('élève supprimé:', response.data)
    showDelete.value = false
    deleteTarget.value = null
    showToast(response.data?.message || 'Élève supprimé avec succès.', 'success')
    await apiGetEnseignantConnect()
  } catch (err) {
    const status = err?.response?.status
    const data = err?.response?.data
    if (status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('role')
      window.location.href = '/enseignant/login'
    } else {
      deleteError.value = data?.message || 'La suppression a échoué.'
    }
  } finally {
    deleting.value = false
  }
}

// ── Mapping handicap → style ───────────────────────────────────────────────
const HANDICAP_MAP = {
  Visuel: { grad: 'linear-gradient(135deg,#6D28D9,#D97706)', badge: 'pro-badge-violet' },
  Auditif: { grad: 'linear-gradient(135deg,#059669,#2563EB)', badge: 'pro-badge-green' },
  Moteur: { grad: 'linear-gradient(135deg,#D97706,#DC2626)', badge: 'pro-badge-amber' },
}
const DEFAULT_MAP = { grad: 'linear-gradient(135deg,#2563EB,#6D28D9)', badge: 'pro-badge-blue' }

function handicapGrad(name) {
  return (HANDICAP_MAP[name] ?? DEFAULT_MAP).grad
}
function handicapBadge(name) {
  return (HANDICAP_MAP[name] ?? DEFAULT_MAP).badge
}
</script>

<template>
  <div class="students-root container">

   <LoadingView :visible="loading" :fullscreen="true" message="Chargement des élèves" offset-top="100px" />
    <div class="pro-page-header">
      <div>
        <h1 class="pro-page-title">Mes élèves</h1>
        <p class="pro-page-sub">
          {{ eleves.length }} élève(s) · classe {{ userAuth?.classe?.name ?? '…' }}
        </p>
      </div>
      <div v-if="!canManage" class="pro-warn-inline" role="note">
        Aucune classe assignée : l'ajout et la suppression d'élèves sont désactivés.
      </div>
      <button v-else class="pro-btn pro-btn-primary" @click.prevent="openAdd">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Ajouter un élève
      </button>
    </div>

    <!-- FILTRES -->
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
      <div class="search-wrap">
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
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="search" class="search-input" placeholder="Rechercher par nom ou code…" />
      </div>
      <select v-model="filterHandicap" class="pro-select">
        <option value="">Tous les profils</option>
        <option v-for="h in handicaps" :key="h.id" :value="h.name">{{ h.name }}</option>
      </select>
    </div>

    <!-- TABLEAU -->
    <ResponsiveTable mode="scroll" :min-width="760">
      <table class="pro-table" aria-label="Liste des élèves">
        <thead>
          <tr>
            <th>Élève</th>
            <th>Code</th>
            <th>Profil</th>
            <th>Date de naissance</th>
            <th>Tél. parent</th>
            <th>Statut</th>
            <th style="text-align: right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="eleve in filteredEleves" :key="eleve.id">
            <!-- Nom + avatar -->
            <td>
              <div style="display: flex; align-items: center; gap: 10px">
                <div class="pro-avatar" :style="{ background: handicapGrad(eleve.handicap?.name) }">
                  <svg
                    v-if="eleve.handicap?.name === 'Visuel'"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg
                    v-else-if="eleve.handicap?.name === 'Auditif'"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0" />
                    <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 0 1 0 4" />
                  </svg>
                  <svg
                    v-else-if="eleve.handicap?.name === 'Moteur'"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v5l3 3" />
                    <path d="M9 12H6" />
                    <path d="M9 17l-2 4" />
                    <path d="M15 17l2 4" />
                  </svg>
                  <svg
                    v-else
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div class="td-name">{{ eleve.prenom +' ' + eleve.name }}</div>
                  <div class="td-muted">ID #{{ eleve.id }}</div>
                </div>
              </div>
            </td>

            <!-- Code -->
            <td>
              <span class="code-pill">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <codeToggle :code="String(eleve?.code ?? '')" />
              </span>
            </td>

            <!-- Profil handicap -->
            <td>
              <span class="pro-badge" :class="handicapBadge(eleve.handicap?.name)">
                {{ eleve.handicap?.name ?? 'Standard' }}
              </span>
            </td>

            <!-- Date naissance -->
            <td class="td-muted">{{ formatDate(eleve.dateOfNaissance) }}</td>

            <!-- Téléphone parent -->
            <td class="td-muted">
              <div style="display: flex; align-items: center; gap: 6px">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"
                  />
                </svg>
                {{ eleve.numeroParent }}
              </div>
            </td>

            <!-- Statut connexion -->
            <td>
              <div
                class="pro-status"
                :class="isOnline(eleve) ? 'pro-status-online' : 'pro-status-inactive'"
              >
                <span class="pro-status-dot"></span>
                {{ isOnline(eleve) ? 'En ligne' : 'Hors ligne' }}
              </div>
            </td>

            <!-- Actions -->
            <td>
              <div class="pro-actions">
                <button
                  class="pro-icon-btn pro-icon-btn-primary"
                  type="button"
                  title="Modifier l'élève"
                  :aria-label="`Modifier ${eleve.prenom ?? ''} ${eleve.name ?? ''}`.trim()"
                  :disabled="!canManage"
                  @click="openEdit(eleve)"
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
                    aria-hidden="true"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                <button
                  class="pro-icon-btn pro-icon-btn-danger"
                  type="button"
                  title="Supprimer l'élève"
                  aria-label="Supprimer {{ eleve.prenom }} {{ eleve.name }}"
                  :disabled="!canManage"
                  @click="confirmDelete(eleve)"
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
                    aria-hidden="true"
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

          <!-- Empty -->
          <tr v-if="filteredEleves.length === 0">
            <td
              colspan="7"
              style="text-align: center; padding: 40px; color: var(--pro-muted); font-style: italic"
            >
              Aucun élève trouvé.
            </td>
          </tr>
        </tbody>
      </table>
    </ResponsiveTable>

    <!-- Empty state global -->
    <div v-if="eleves.length === 0 && !loading" class="pro-empty pro-card" style="padding: 48px">
      <svg
        class="pro-empty-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <p>Aucun élève dans votre classe pour le moment.</p>
    </div>

    <!-- ══ MODALE AJOUT / MODIFICATION D'UN ÉLÈVE (inline comportement école) ══ -->
    <Teleport v-if="showForm" to="body">
      <div class="h-overlay" @click.self="closeForm">
        <div
          ref="modalEl"
          class="h-modal h-modal-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-eleve-title"
        >
          <div class="h-modal-head">
            <h2 id="add-eleve-title" class="h-modal-title">
              {{ isEdit ? 'Modifier l\'élève' : 'Ajouter un élève à ma classe' }}
            </h2>
            <button class="h-close-btn" type="button" aria-label="Fermer" @click="closeForm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="h-modal-body">
            <p class="h-modal-sub">
              Classe de rattachement : <strong>{{ userAuth?.classe?.name ?? '—' }}</strong>
            </p>

            <div v-if="formError" class="h-error" role="alert">{{ formError }}</div>

            <form class="h-form-grid" ref="formEl" novalidate @submit.prevent="submitForm">
              <div class="h-field">
                <label class="h-lbl" for="st-nom">Nom <span class="h-req">*</span></label>
                <input
                  id="st-nom"
                  ref="firstField"
                  v-model="form.name"
                  class="h-inp"
                  :class="{ 'h-inp-err': firstError('name') }"
                  placeholder="Ex : DUPONT"
                  autocomplete="family-name"
                  aria-describedby="st-nom-err"
                  required
                />
                <span v-if="firstError('name')" id="st-nom-err" class="h-field-err">
                  {{ firstError('name') }}
                </span>
              </div>

              <div class="h-field">
                <label class="h-lbl" for="st-prenom">Prénom <span class="h-req">*</span></label>
                <input
                  id="st-prenom"
                  v-model="form.prenom"
                  class="h-inp"
                  :class="{ 'h-inp-err': firstError('prenom') }"
                  placeholder="Ex : Lucas"
                  autocomplete="given-name"
                  aria-describedby="st-prenom-err"
                  required
                />
                <span v-if="firstError('prenom')" id="st-prenom-err" class="h-field-err">
                  {{ firstError('prenom') }}
                </span>
              </div>

              <div class="h-field">
                <label class="h-lbl" for="st-dob">Date de naissance <span class="h-req">*</span></label>
                <input
                  id="st-dob"
                  v-model="form.dateOfNaissance"
                  type="date"
                  class="h-inp"
                  autocomplete="bday"
                  required
                />
              </div>

              <div class="h-field">
                <label class="h-lbl" for="st-parent">N° des parents <span class="h-req">*</span></label>
                <input
                  id="st-parent"
                  v-model="form.numeroParent"
                  class="h-inp"
                  placeholder="Ex : 0195959595"
                  type="tel"
                  autocomplete="tel"
                  required
                />
              </div>

              <div class="h-field">
                <label class="h-lbl" for="st-code">
                  Code (matricule) <span v-if="!isEdit" class="h-req">*</span>
                </label>
                <input
                  id="st-code"
                  v-model="form.code"
                  class="h-inp"
                  :class="{ 'h-inp-err': firstError('code') }"
                  placeholder="Ex : 123456"
                  type="text"
                  inputmode="numeric"
                  :required="!isEdit"
                  aria-describedby="st-code-err"
                />
                <span v-if="firstError('code')" id="st-code-err" class="h-field-err">
                  {{ firstError('code') }}
                </span>
              </div>

              <div class="h-field">
                <label class="h-lbl" for="st-handicap">
                  Profil d'accessibilité <span class="h-req">*</span>
                </label>
                <select
                  id="st-handicap"
                  v-model="form.handicap_id"
                  class="h-inp"
                  :class="{ 'h-inp-err': firstError('handicap_id') }"
                  aria-describedby="st-handicap-err"
                  required
                >
                  <option value="">— Choisir —</option>
                  <option v-for="h in handicaps" :key="h.id" :value="h.id">
                    {{ h.name }}
                  </option>
                </select>
                <span v-if="firstError('handicap_id')" id="st-handicap-err" class="h-field-err">
                  {{ firstError('handicap_id') }}
                </span>
              </div>
            </form>
          </div>

          <div class="h-modal-foot">
            <button class="h-btn h-btn-ghost" type="button" @click="closeForm">Annuler</button>
            <button
              class="h-btn h-btn-primary"
              type="button"
              :disabled="submitting"
              @click="submitForm"
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
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ submitting ? (isEdit ? 'Enregistrement…' : 'Ajout…') : (isEdit ? 'Enregistrer' : 'Inscrire') }}
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
            <h2 class="h-modal-title">Retirer cet élève ?</h2>
            <button
              class="h-close-btn"
              type="button"
              aria-label="Fermer"
              @click="showDelete = false"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="h-modal-body" style="text-align: center">
            <div class="h-del-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                stroke-width="1.8"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div v-if="deleteError" class="h-error" role="alert">{{ deleteError }}</div>
            <p class="h-del-text">
              Retirer <strong>{{ deleteTarget?.prenom }} {{ deleteTarget?.name }}</strong>
              de votre classe ?<br />
              Cette action est irréversible : ses notes et retours de projection seront supprimés.
            </p>
          </div>

          <div class="h-modal-foot">
            <button class="h-btn h-btn-ghost" type="button" @click="showDelete = false">
              Annuler
            </button>
            <button class="h-btn h-btn-danger" type="button" :disabled="deleting" @click="doDelete">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              {{ deleting ? 'Suppression…' : 'Supprimer définitivement' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ TOAST ══ -->
    <transition name="toast-slide">
      <div
        v-if="toastVisible && toast"
        class="h-toast"
        :class="toast.type === 'error' ? 'h-toast-error' : 'h-toast-success'"
        role="status"
        aria-live="polite"
      >
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.students-root {
  --pro-blue: #2563eb;
  --pro-blue-soft: rgba(37, 99, 235, 0.09);
  --pro-green: #059669;
  --pro-green-soft: rgba(5, 150, 105, 0.09);
  --pro-violet: #6d28d9;
  --pro-violet-soft: rgba(109, 40, 217, 0.09);
  --pro-amber: #d97706;
  --pro-amber-soft: rgba(217, 119, 6, 0.09);
  --pro-ink: #0f172a;
  --pro-muted: #94a3b8;
  --pro-border: rgba(15, 23, 42, 0.08);
  --pro-card: #ffffff;
  --pro-r-lg: 16px;
  --pro-r-md: 12px;
  --pro-shadow-md: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.05);
  --pro-font: 'Plus Jakarta Sans', system-ui, sans-serif;

  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: var(--pro-font);
}

/* Header */
.pro-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.pro-page-title {
  font-size: 1.55rem;
  font-weight: 900;
  color: var(--pro-ink);
  letter-spacing: -0.025em;
  margin: 0;
}
.pro-page-sub {
  font-size: 0.82rem;
  color: var(--pro-muted);
  margin-top: 4px;
  margin-bottom: 0;
  font-weight: 500;
}

/* Search */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 200px;
  min-width: 0;
  max-width: 340px;
  padding: 9px 13px;
  border: 1.5px solid var(--pro-border);
  border-radius: var(--pro-r-md);
  background: var(--pro-card);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  color: var(--pro-muted);
}
.search-wrap:focus-within {
  border-color: var(--pro-blue);
}
.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--pro-font);
  font-size: 0.83rem;
  color: var(--pro-ink);
  flex: 1;
  min-width: 0;
  width: 100%;
}

/* Select */
.pro-select {
  max-width: 100%;
  padding: 9px 32px 9px 13px;
  border: 1.5px solid var(--pro-border);
  border-radius: var(--pro-r-md);
  font-family: var(--pro-font);
  font-size: 0.83rem;
  color: var(--pro-ink);
  background: var(--pro-card);
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.pro-select:focus {
  border-color: var(--pro-blue);
}

/* Avatar */
.pro-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Badge */
.pro-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  padding: 3px 9px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}
.pro-badge-blue {
  background: var(--pro-blue-soft);
  color: var(--pro-blue);
}
.pro-badge-green {
  background: var(--pro-green-soft);
  color: var(--pro-green);
}
.pro-badge-violet {
  background: var(--pro-violet-soft);
  color: var(--pro-violet);
}
.pro-badge-amber {
  background: var(--pro-amber-soft);
  color: var(--pro-amber);
}

/* Code pill */
.code-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  padding: 3px 9px;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
}

/* Status */
.pro-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-weight: 600;
}
.pro-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pro-status-online {
  color: var(--pro-green);
}
.pro-status-online .pro-status-dot {
  background: var(--pro-green);
  animation: pro-pulse 2s ease infinite;
}
.pro-status-inactive {
  color: var(--pro-muted);
}
.pro-status-inactive .pro-status-dot {
  background: var(--pro-muted);
}
@keyframes pro-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(5, 150, 105, 0);
  }
}

/* Table */
.pro-table-wrap {
  background: var(--pro-card);
  border-radius: var(--pro-r-lg);
  border: 1px solid var(--pro-border);
  box-shadow: var(--pro-shadow-md);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.pro-table {
  width: 100%;
  border-collapse: collapse;
}
.pro-table th {
  padding: 11px 16px;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--pro-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: #f8fafc;
  border-bottom: 1px solid var(--pro-border);
  white-space: nowrap;
}
.pro-table td {
  padding: 13px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
  color: var(--pro-ink);
  vertical-align: middle;
}
.pro-table tr:last-child td {
  border-bottom: none;
}
.pro-table tr:hover td {
  background: #fafcff;
}
.td-name {
  font-weight: 700;
  text-transform: uppercase;
}
.td-muted {
  color: var(--pro-muted);
  font-size: 0.78rem;
}

/* Empty */
.pro-card {
  background: var(--pro-card);
  border-radius: var(--pro-r-lg);
  border: 1px solid var(--pro-border);
  box-shadow: var(--pro-shadow-md);
}
.pro-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--pro-muted);
}
.pro-empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  opacity: 0.25;
  display: block;
}
/* Lisibilité mobile : plancher 12px + cible tactile ≥44px */
@media (max-width: 640px) {
  .pro-table th,
  .td-muted {
    font-size: 0.8rem;
  }
  .search-input {
    min-height: 44px;
  }
}

/* ══ Bouton / message d'ajout dans l'en-tête ══ */
.pro-warn-inline {
  padding: 8px 14px;
  border-radius: 10px;
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  color: #92400e;
  font-size: 0.78rem;
  font-weight: 600;
}

/* ══ Colonne actions ══ */
.pro-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}
.pro-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid var(--pro-border);
  background: var(--pro-card);
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.13s;
}
.pro-icon-btn:hover {
  border-color: var(--pro-blue);
  color: var(--pro-blue);
  background: var(--pro-blue-soft);
}
.pro-icon-btn-danger:hover {
  border-color: #dc2626;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.06);
}
.pro-icon-btn-primary:hover {
  border-color: var(--pro-blue);
  color: var(--pro-blue);
  background: var(--pro-blue-soft);
}
.pro-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ══ Modales (contenu Teleport : scorées au composant, appliquées aux éléments téléportés) ══ */
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
  background: #fff;
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
  background: #fff;
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
.h-modal-sub {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 14px;
}
.h-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
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
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.h-inp:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.h-inp-err {
  border-color: #dc2626 !important;
}
.h-field-err {
  font-size: 0.74rem;
  font-weight: 600;
  color: #dc2626;
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
  color: #fff;
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
  color: #fff;
  border-color: #dc2626;
}
.h-btn-danger:hover {
  background: #b91c1c;
}
.h-del-icon {
  margin-bottom: 14px;
}
.h-del-text {
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}
.h-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.83rem;
  font-weight: 600;
  margin-bottom: 14px;
}
@media (max-width: 520px) {
  .h-form-grid {
    grid-template-columns: 1fr;
  }
}

/* ══ Toast ══ */
.h-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  padding: 12px 20px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.25);
  max-width: calc(100vw - 32px);
}
.h-toast-success {
  background: #059669;
}
.h-toast-error {
  background: #dc2626;
}
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.28s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
