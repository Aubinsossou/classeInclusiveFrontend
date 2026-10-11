<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiPost } from '@/helpers/axiosApi'
const router = useRouter()
const form = ref({ name: '', email: '', numero: '', password: '', conf: '' })
const error = ref('')
const fieldErrors = ref({})
const ok = ref('')
const busy = ref(false)
async function submit() {
  error.value = ''; ok.value = ''; fieldErrors.value = {}
  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.password || !form.value.conf) { error.value = 'Veuillez remplir tous les champs.'; return }
  if (form.value.password !== form.value.conf) { error.value = 'Les mots de passe ne correspondent pas.'; return }
  if (form.value.password.length < 4) { error.value = 'Le mot de passe doit contenir au moins 4 caractères.'; return }
  busy.value = true
  try {
    await apiPost('client/register', { name: form.value.name.trim(), email: form.value.email.trim(), numero: form.value.numero.trim() || null, password: form.value.password })
    ok.value = 'Compte créé. Redirection…'
    setTimeout(() => router.push({ name: 'ClientLogin' }), 900)
  } catch (e) {
    const d = e?.response?.data
    if (d?.errors) { fieldErrors.value = d.errors; const f = Object.values(d.errors)[0]; error.value = Array.isArray(f) ? f[0] : String(f) }
    else error.value = d?.message || 'Une erreur est survenue. Veuillez réessayer.'
  } finally { busy.value = false }
}
</script>
<template>
  <div class="cl-page">
    <div class="cl-left"><div>
      <div class="cl-brand"><span class="cl-mark">CI</span><div><div class="cl-name">Classe Inclusive</div><div class="cl-sub">Espace Client</div></div></div>
      <p class="cl-quote">Créez votre accès consultatif et explorez les données pédagogiques.</p>
    </div></div>
    <div class="cl-right"><div class="cl-card">
      <span class="cl-tag">Espace Client</span>
      <h1>Créer un compte</h1>
      <p class="cl-desc">Inscrivez-vous pour consulter la plateforme.</p>
      <p v-if="error" class="cl-err" role="alert">{{ error }}</p>
      <p v-if="ok" class="cl-ok" role="status">{{ ok }}</p>
      <form @submit.prevent="submit" novalidate>
        <label class="pro-label" for="r-name">Nom complet</label>
        <input id="r-name" v-model="form.name" class="pro-input" placeholder="Ex : Jean Dupont" required />
        <label class="pro-label" for="r-email">Adresse e-mail</label>
        <input id="r-email" v-model="form.email" type="email" class="pro-input" placeholder="client@exemple.com" required />
        <p v-if="fieldErrors.email" class="cl-field-err">{{ Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email }}</p>
        <label class="pro-label" for="r-numero">Numéro de téléphone (optionnel)</label>
        <input id="r-numero" v-model="form.numero" class="pro-input" placeholder="Ex : 0700000000" />
        <p v-if="fieldErrors.numero" class="cl-field-err">{{ Array.isArray(fieldErrors.numero) ? fieldErrors.numero[0] : fieldErrors.numero }}</p>
        <label class="pro-label" for="r-p1">Mot de passe (min. 4 caractères)</label>
        <input id="r-p1" v-model="form.password" type="password" class="pro-input" placeholder="••••••••" required />
        <p v-if="fieldErrors.password" class="cl-field-err">{{ Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password }}</p>
        <label class="pro-label" for="r-p2">Confirmation</label>
        <input id="r-p2" v-model="form.conf" type="password" class="pro-input" placeholder="••••••••" required />
        <button class="pro-btn pro-btn-primary pro-btn-lg cl-submit" :disabled="busy">{{ busy ? 'Création…' : 'Créer mon compte' }}</button>
      </form>
      <p class="cl-foot">Déjà inscrit ? <RouterLink :to="{ name: 'ClientLogin' }">Se connecter</RouterLink></p>
    </div></div>
  </div>
</template>
<style scoped>
.cl-page{min-height:100vh;display:flex;background:#f1f5f9;font-family:'Plus Jakarta Sans','Nunito',sans-serif}
.cl-left{flex:1;display:none;align-items:center;padding:48px;background:linear-gradient(160deg,#0f1b3e 0%,#1d2f6e 60%,#6d28d9 130%);color:#fff}
@media(min-width:900px){.cl-left{display:flex}}
.cl-brand{display:flex;gap:12px;align-items:center;margin-bottom:24px}
.cl-mark{width:50px;height:50px;border-radius:13px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-weight:900}
.cl-name{font-size:1.3rem;font-weight:900}.cl-sub{font-size:.75rem;opacity:.55}
.cl-quote{font-style:italic;opacity:.8;border-left:3px solid rgba(255,255,255,.25);padding-left:16px;line-height:1.7}
.cl-right{width:100%;display:flex;align-items:center;justify-content:center;padding:24px;overflow-y:auto}
@media(min-width:900px){.cl-right{width:500px;flex-shrink:0}}
.cl-card{width:100%;max-width:420px;padding:16px 0}
.cl-card h1{font-size:1.8rem;font-weight:900;color:#0f172a}
.cl-tag{display:inline-block;background:rgba(109,40,217,.1);color:#6d28d9;border-radius:100px;padding:5px 12px;font-size:.72rem;font-weight:700;margin-bottom:12px}
.cl-desc{font-size:.85rem;color:#94a3b8;margin-bottom:16px}
.cl-err{background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.2);color:#dc2626;border-radius:12px;padding:10px 14px;font-size:.83rem;font-weight:600;margin-bottom:14px}
.cl-ok{background:rgba(5,150,105,.09);border:1px solid rgba(5,150,105,.25);color:#059669;border-radius:12px;padding:10px 14px;font-size:.83rem;font-weight:600;margin-bottom:14px}
.cl-card form{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
.cl-field-err{font-size:.76rem;color:#dc2626;font-weight:600;margin:-4px 0 2px}
.cl-submit{width:100%;justify-content:center;margin-top:6px}
.cl-foot{text-align:center;font-size:.85rem;color:#94a3b8}.cl-foot a{color:#6d28d9;font-weight:700;text-decoration:none}
</style>
