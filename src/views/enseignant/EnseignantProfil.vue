<script setup>
import { ref, reactive, onMounted } from 'vue'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import LoadingView from '@/components/admin/Loading.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import { useFormToast } from '@/composables/useFormToast'

const enseignant = ref(null)
const loading = ref(true)
const loadError = ref('')

const submitting = ref(false)
const submitted = ref(false)
const serverError = ref('')
const fieldErrors = ref({})

const { show: showToast } = useFormToast()

const form = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const apiGetEnseignant = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await apiGet('enseignant/getEnseignant')
    enseignant.value = response.data?.data ?? null
  } catch (err) {
    if (err?.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('role')
      window.location.href = '/enseignant/login'
      return
    }
    loadError.value = err?.response?.data?.message || 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

onMounted(apiGetEnseignant)

function validate() {
  const errors = {}
  if (!form.current_password) errors.current_password = 'Veuillez saisir votre mot de passe actuel.'
  if (!form.password) {
    errors.password = 'Veuillez saisir un nouveau mot de passe.'
  } else if (form.password.length < 8) {
    errors.password = 'Le nouveau mot de passe doit contenir au moins 8 caractères.'
  }
  if (!form.password_confirmation) {
    errors.password_confirmation = 'Veuillez confirmer le nouveau mot de passe.'
  } else if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Les deux mots de passe ne correspondent pas.'
  }
  if (form.password && form.current_password && form.password === form.current_password) {
    errors.password = 'Le nouveau mot de passe doit être différent du mot de passe actuel.'
  }
  return errors
}

function firstError(errors, field) {
  const value = errors[field]
  if (Array.isArray(value)) return value[0]
  return value || ''
}

async function submit() {
  serverError.value = ''
  fieldErrors.value = {}
  submitted.value = false

  const localErrors = validate()
  if (Object.keys(localErrors).length) {
    fieldErrors.value = localErrors
    // Petit modal rouge non bloquant listant les champs manquants
    showToast(
      Object.keys(localErrors).map((key) => {
        const el = document.getElementById(key)
        const lbl = document.querySelector(`label[for="${key}"]`)
        return { el, label: (lbl?.textContent || key).trim() }
      }),
    )
    return
  }

  submitting.value = true
  try {
    const response = await apiPost('enseignant/change-password', {
      current_password: form.current_password,
      password: form.password,
      password_confirmation: form.password_confirmation,
    })

    if (response.data?.status === 'success') {
      submitted.value = true
      form.current_password = ''
      form.password = ''
      form.password_confirmation = ''
    } else {
      serverError.value = response.data?.message || 'Une erreur est survenue, veuillez réessayer.'
    }
  } catch (err) {
    const data = err?.response?.data
    if (err?.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('role')
      window.location.href = '/enseignant/login'
      return
    }
    serverError.value = data?.message || 'Une erreur est survenue, veuillez réessayer.'
    if (data?.errors) {
      fieldErrors.value = data.errors
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1 class="pro-page-title">Mon profil</h1>
    <p class="pro-page-sub">Gérez les informations de votre compte et changez votre mot de passe.</p>

    <LoadingView :visible="loading" :fullscreen="true" message="Chargement" offset-top="100px" />

    <template v-if="!loading">
      <div v-if="loadError" class="pro-card pf-err">
        <p>{{ loadError }}</p>
        <button class="pro-btn pro-btn-primary pro-btn-sm" @click="apiGetEnseignant">Réessayer</button>
      </div>

      <template v-else>
        <div class="pro-card pf-card">
          <div class="pf-ava">
            {{ String(enseignant?.name || enseignant?.email || 'E').slice(0, 1).toUpperCase() }}
          </div>
          <h2>{{ enseignant?.name || '' }} {{ enseignant?.prenom || '' }}</h2>
          <p class="pf-mail">{{ enseignant?.email || '' }}</p>
          <p v-if="enseignant?.numero" class="pf-mail">{{ enseignant.numero }}</p>
          <p v-if="enseignant?.matricule" class="pf-mail">Matricule : {{ enseignant.matricule }}</p>
        </div>

        <div class="pro-card pf-form">
          <h2 class="pf-form-title">Changer mon mot de passe</h2>

          <div v-if="submitted" class="pf-success" role="status">
            Votre mot de passe a été modifié avec succès.
          </div>
          <div v-if="serverError" class="pf-error" role="alert">{{ serverError }}</div>

          <form novalidate @submit.prevent="submit">
            <div class="pf-field">
              <label for="current_password">Mot de passe actuel</label>
              <PasswordInput
                id="current_password"
                v-model="form.current_password"
                autocomplete="current-password"

                :class="{ 'pf-invalid': fieldErrors.current_password }"
                required
              />
              <span v-if="fieldErrors.current_password" class="pf-field-err">
                {{ firstError(fieldErrors, 'current_password') }}
              </span>
            </div>

            <div class="pf-field">
              <label for="password">Nouveau mot de passe</label>
              <PasswordInput
                id="password"
                v-model="form.password"
                autocomplete="new-password"

                :class="{ 'pf-invalid': fieldErrors.password }"
                required
              />
              <span class="pf-hint">Au moins 8 caractères.</span>
              <span v-if="fieldErrors.password" class="pf-field-err">
                {{ firstError(fieldErrors, 'password') }}
              </span>
            </div>

            <div class="pf-field">
              <label for="password_confirmation">Confirmer le nouveau mot de passe</label>
              <PasswordInput
                id="password_confirmation"
                v-model="form.password_confirmation"
                autocomplete="new-password"

                :class="{ 'pf-invalid': fieldErrors.password_confirmation }"
                required
              />
              <span v-if="fieldErrors.password_confirmation" class="pf-field-err">
                {{ firstError(fieldErrors, 'password_confirmation') }}
              </span>
            </div>

            <button class="pro-btn pro-btn-primary" type="submit" :disabled="submitting">
              {{ submitting ? 'Modification...' : 'Modifier le mot de passe' }}
            </button>
          </form>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px 40px;
}
.pro-page-title {
  font-size: 1.55rem;
  font-weight: 900;
  color: #0f172a;
}
.pro-page-sub {
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 4px 0 18px;
}

.pro-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

.pf-err {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.pf-card {
  padding: 28px;
  text-align: center;
}
.pf-ava {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #0d5f3a;
  color: #fff;
  font-size: 1.6rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.pf-card h2 {
  font-size: 1.25rem;
  font-weight: 900;
  color: #0f172a;
}
.pf-mail {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.pf-form {
  margin-top: 20px;
  padding: 24px 28px 28px;
}
.pf-form-title {
  font-size: 1.05rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 16px;
}

.pf-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.pf-field label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
}
/* Les inputs sont rendus par <PasswordInput> (composant enfant) :
   :deep() est nécessaire pour percer le scope du composant enfant. */
.pf-field :deep(input) {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: inherit;
  color: #0f172a;
  background: #fff;
  transition: border-color 0.2s ease;
}
.pf-field :deep(input:focus) {
  outline: none;
  border-color: #1a8f5a;
}
/* Padding droit réservé à l'œil (le composant le fournit déjà, on le sécurise) */
.pf-field :deep(.pw-input) {
  padding-right: 40px;
}
.pf-invalid {
  border-color: #dc2626 !important;
}
.pf-hint {
  font-size: 0.75rem;
  color: #94a3b8;
}
.pf-field-err {
  font-size: 0.78rem;
  color: #dc2626;
  font-weight: 600;
}

.pf-success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
}
.pf-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.pro-btn {
  border: none;
  border-radius: 3rem;
  cursor: pointer;
  font-family: inherit;
  font-weight: 800;
  transition: all ease-out 0.3s;
}
.pro-btn-primary {
  padding: 10px 20px;
  background: #0d5f3a;
  color: #fff;
  font-size: 0.9rem;
}
.pro-btn-primary:hover {
  background: #1a8f5a;
}
.pro-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.pro-btn-sm {
  padding: 6px 12px;
  font-size: 0.78rem;
}

/* ══ Responsive ══ */
@media (max-width: 480px) {
  .container {
    padding: 0 14px 32px;
  }
  .pf-card {
    padding: 20px 16px;
  }
  .pf-form {
    padding: 18px 16px 22px;
  }
  .pf-err {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

