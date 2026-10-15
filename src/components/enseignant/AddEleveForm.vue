<script setup>
import { ref, reactive, watch, nextTick, onUnmounted } from 'vue'
import { apiPost } from '@/helpers/axiosApi'
import { useFormValidation } from '@/composables/useFormValidation'

const props = defineProps({
  /** Contrôle l'ouverture de la modale. */
  open: { type: Boolean, default: false },
  /** Nom de la classe de rattachement (affichage uniquement : la classe est forcée côté serveur). */
  classeName: { type: String, default: '' },
  /** Options du select « Profil d'accessibilité » : [{ id, name }]. */
  handicapOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'created'])

const formEl = ref(null)
const firstField = ref(null)
const submitting = ref(false)
const formError = ref('')
const fieldErrors = ref({})

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

function resetForm() {
  Object.assign(form, emptyForm())
  formError.value = ''
  fieldErrors.value = {}
}

function firstError(field) {
  const value = fieldErrors.value[field]
  if (Array.isArray(value)) return value[0]
  return value || ''
}

let previousFocus = null

function onKeydown(e) {
  if (e.key === 'Escape' && !submitting.value) emit('close')
}

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
    const response = await apiPost('enseignant/classe/eleve/store', {
      name: form.name.trim(),
      prenom: form.prenom.trim(),
      numeroParent: form.numeroParent.trim(),
      handicap_id: form.handicap_id === '' ? '' : Number(form.handicap_id),
      dateOfNaissance: form.dateOfNaissance,
      code: form.code.trim(),
    })
    emit('created', {
      message: response.data?.message || 'Élève ajouté à votre classe.',
      eleve: response.data?.data ?? null,
    })
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
      formError.value = data?.message || "L'ajout de l'élève a échoué."
      fieldErrors.value = data?.errors ?? {}
    }
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm()
      previousFocus = document.activeElement
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKeydown)
      // La modale n'existe qu'après rendu du v-if → on branche la validation live
      // et on place le focus sur le premier champ.
      nextTick(() => {
        attach(formEl.value)
        firstField.value?.focus?.({ preventScroll: true })
      })
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeydown)
      if (previousFocus && document.contains(previousFocus)) previousFocus.focus?.()
    }
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<!--TEMPLATE-->
<template>
  <Teleport v-if="open" to="body">
    <div class="h-overlay" @click.self="$emit('close')">
      <div
        class="h-modal h-modal-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-eleve-title"
      >
        <div class="h-modal-head">
          <h2 id="add-eleve-title" class="h-modal-title">Ajouter un élève à ma classe</h2>
          <button class="h-close-btn" type="button" aria-label="Fermer" @click="$emit('close')">
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
            Classe de rattachement : <strong>{{ classeName || '—' }}</strong>
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
              <label class="h-lbl" for="st-dob">Date de naissance</label>
              <input
                id="st-dob"
                v-model="form.dateOfNaissance"
                type="date"
                class="h-inp"
                autocomplete="bday"
              />
            </div>

            <div class="h-field">
              <label class="h-lbl" for="st-parent">N° des parents</label>
              <input
                id="st-parent"
                v-model="form.numeroParent"
                class="h-inp"
                placeholder="Ex : 0195959595"
                type="tel"
                autocomplete="tel"
              />
            </div>

            <div class="h-field">
              <label class="h-lbl" for="st-code">Code (matricule) <span class="h-req">*</span></label>
              <input
                id="st-code"
                v-model="form.code"
                class="h-inp"
                :class="{ 'h-inp-err': firstError('code') }"
                placeholder="Ex : 123456"
                type="text"
                inputmode="numeric"
                aria-describedby="st-code-err"
                required
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
                <option v-for="h in handicapOptions" :key="h.id" :value="h.id">
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
          <button class="h-btn h-btn-ghost" type="button" @click="$emit('close')">Annuler</button>
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
            {{ submitting ? 'Ajout…' : 'Inscrire' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!--STYLES-->
<style scoped>
/* Styles localisés au composant (Teleport vers body → :deep requis). */
:deep(.h-overlay) {
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
:deep(.h-modal) {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
:deep(.h-modal-lg) {
  max-width: 640px;
}
:deep(.h-modal-head) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}
:deep(.h-modal-title) {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}
:deep(.h-close-btn) {
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
:deep(.h-close-btn:hover) {
  border-color: #dc2626;
  color: #dc2626;
}
:deep(.h-modal-body) {
  padding: 20px 24px;
  overflow-y: auto;
}
:deep(.h-modal-foot) {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px 20px;
  border-top: 1px solid #e2e8f0;
}
:deep(.h-modal-sub) {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0 0 14px;
}
:deep(.h-form-grid) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 0;
}
:deep(.h-field) {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
:deep(.h-lbl) {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
}
:deep(.h-req) {
  color: #dc2626;
}
:deep(.h-inp) {
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
:deep(.h-inp:focus) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
:deep(.h-inp-err) {
  border-color: #dc2626 !important;
}
:deep(.h-field-err) {
  font-size: 0.74rem;
  font-weight: 600;
  color: #dc2626;
}
:deep(.h-btn) {
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
:deep(.h-btn:disabled) {
  opacity: 0.45;
  cursor: not-allowed;
}
:deep(.h-btn-primary) {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
:deep(.h-btn-primary:hover:not(:disabled)) {
  background: #1d4ed8;
}
:deep(.h-btn-ghost) {
  background: transparent;
  border-color: #e2e8f0;
  color: #475569;
}
:deep(.h-btn-ghost:hover) {
  border-color: #94a3b8;
}
:deep(.h-error) {
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
  :deep(.h-form-grid) {
    grid-template-columns: 1fr;
  }
}
</style>

