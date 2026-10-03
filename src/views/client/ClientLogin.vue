<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiPost } from '@/helpers/axiosApi'
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)
function tokenOf(d) { return d?.access_token || d?.token || d?.data?.access_token || d?.data?.data?.access_token || '' }
function isSuccessStatus(s) { return String(s || '').toLowerCase() === 'success' }
async function submit() {
  error.value = ''
  if (!email.value.trim() || !password.value) { error.value = 'Veuillez remplir tous les champs.'; return }
  busy.value = true
  try {
    const r = await apiPost('client/login', { email: email.value.trim(), password: password.value })
    const t = tokenOf(r.data)
    if (!t) { error.value = 'Réponse de connexion invalide.'; return }
    localStorage.setItem('access_token', t)
    localStorage.setItem('role', 'client')
    router.push('/client/dashboard')
  } catch (e) {
    const status = e?.response?.status
    const m = e?.response?.data?.message || ''
    // Contrat backend : erreurs métier login en 400 avec messages exacts
    if (status === 400 && m) error.value = m
    else if (status === 401) error.value = 'E-mail ou mot de passe incorrect.'
    else if (e?.response?.data?.errors) { const f = Object.values(e.response.data.errors)[0]; error.value = Array.isArray(f) ? f[0] : String(f) }
    else error.value = m || 'Une erreur est survenue. Veuillez réessayer.'
    password.value = ''
  } finally { busy.value = false }
}
</script>
<template>
  <div class="cl-page">
    <div class="cl-left"><div>
      <div class="cl-brand"><span class="cl-mark">CI</span><div><div class="cl-name">Classe Inclusive</div><div class="cl-sub">Espace Client</div></div></div>
      <p class="cl-quote">Suivez établissements, classes, cours et quiz en un seul endroit.</p>
    </div></div>
    <div class="cl-right"><div class="cl-card">
      <span class="cl-tag">Espace Client</span>
      <h1>Connexion</h1>
      <p class="cl-desc">Accédez à votre tableau de bord consultatif.</p>
      <p v-if="error" class="cl-err" role="alert">{{ error }}</p>
      <form @submit.prevent="submit" novalidate>
        <label class="pro-label" for="c-email">Adresse e-mail</label>
        <input id="c-email" v-model="email" type="email" class="pro-input" placeholder="client@exemple.com" autocomplete="email" required />
        <label class="pro-label" for="c-pass">Mot de passe</label>
        <input id="c-pass" v-model="password" type="password" class="pro-input" placeholder="••••••••" autocomplete="current-password" required />
        <button class="pro-btn pro-btn-primary pro-btn-lg cl-submit" :disabled="busy">{{ busy ? 'Connexion…' : 'Se connecter' }}</button>
      </form>
      <p class="cl-foot">Compte attribué par l’administrateur — aucune inscription publique.</p>
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
.cl-right{width:100%;display:flex;align-items:center;justify-content:center;padding:24px}
@media(min-width:900px){.cl-right{width:500px;flex-shrink:0}}
.cl-card{width:100%;max-width:420px}
.cl-card h1{font-size:1.8rem;font-weight:900;color:#0f172a}
.cl-tag{display:inline-block;background:rgba(109,40,217,.1);color:#6d28d9;border-radius:100px;padding:5px 12px;font-size:.72rem;font-weight:700;margin-bottom:12px}
.cl-desc{font-size:.85rem;color:#94a3b8;margin-bottom:16px}
.cl-err{background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.2);color:#dc2626;border-radius:12px;padding:10px 14px;font-size:.83rem;font-weight:600;margin-bottom:14px}
.cl-card form{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
.cl-submit{width:100%;justify-content:center;margin-top:6px}
.cl-foot{text-align:center;font-size:.85rem;color:#94a3b8}.cl-foot a{color:#6d28d9;font-weight:700;text-decoration:none}
</style>
