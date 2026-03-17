<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiPost, apiGet } from '@/helpers/axiosApi'

const router = useRouter()

const code         = ref('')
const isLoading    = ref(false)
const errorMessage = ref('')
const forceHighContrast = ref(false)

const numpadKeys = [
  { value:'1', type:'digit' }, { value:'2', type:'digit' }, { value:'3', type:'digit' },
  { value:'4', type:'digit' }, { value:'5', type:'digit' }, { value:'6', type:'digit' },
  { value:'7', type:'digit' }, { value:'8', type:'digit' }, { value:'9', type:'digit' },
  { value:'clear',  type:'action-clear' },
  { value:'0',      type:'digit' },
  { value:'delete', type:'action-delete' },
]

function handleKey(value) {
  errorMessage.value = ''
  if (value === 'delete')         code.value = code.value.slice(0, -1)
  else if (value === 'clear')     code.value = ''
  else if (code.value.length < 6) code.value += value
}

async function handleSubmit() {
  if (code.value.length < 4) return
  isLoading.value    = true
  errorMessage.value = ''
  try {
    // 1. Login
    const loginRes = await apiPost('eleve/login', { code: code.value })
    const token    = loginRes.data?.token || loginRes.data?.access_token
    localStorage.setItem('access_token', token)
    localStorage.setItem('role', 'eleve')

    // 2. Charger le profil
    const profileRes = await apiGet('eleve/getEleve')
    const eleve      = profileRes.data?.data || profileRes.data
    const handicapId = eleve?.handicap?.id ?? 1

    // 3. Stocker les infos élève
    localStorage.setItem('eleve', JSON.stringify(eleve))

    // 4. Redirection selon handicap
    if (handicapId === 2) {
      router.push({ name: 'BlindDashboard' })
    } else {
      router.push({ name: 'Dashboard' })
    }
  } catch (err) {
    errorMessage.value = err?.response?.status === 400 || err?.response?.status === 401
      ? 'Code incorrect. Réessayez.'
      : err?.response?.data?.message || 'Erreur réseau.'
    code.value = ''
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div :class="['page', { 'high-contrast': forceHighContrast }]" role="main">
    <a href="#main-form" class="skip-link">Aller au formulaire</a>

    <div class="card" id="main-form">
      <div class="card-top">
        <div class="logo" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#5C4FE0"/>
            <path d="M20 8L30 14V26L20 32L10 26V14L20 8Z" stroke="white" stroke-width="1.5" fill="none" opacity=".5"/>
            <circle cx="20" cy="20" r="6" fill="white" opacity=".95"/>
            <path d="M17 20L19 22L23 18" stroke="#5C4FE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 class="brand">Classe Inclusive</h1>
          <p class="brand-sub">Espace élève</p>
        </div>
      </div>

      <div class="form-head">
        <h2 class="form-title">Entrez votre code</h2>
        <p class="form-sub">Votre code personnel à 4–6 chiffres</p>
      </div>

      <div class="dots" role="status" aria-live="polite" :aria-label="`${code.length} chiffres saisis`">
        <span v-for="(_, i) in 6" :key="i"
          :class="['dot', { filled: i < code.length, active: i === code.length && code.length < 6 }]"/>
      </div>

      <div v-if="errorMessage" class="error" role="alert">
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
          <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 6v4M10 13h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        {{ errorMessage }}
      </div>

      <div class="numpad" role="group" aria-label="Clavier numérique">
        <button v-for="key in numpadKeys" :key="key.value"
          :class="['key', `key--${key.type}`]"
          :disabled="isLoading || (key.value !== 'delete' && key.value !== 'clear' && code.length >= 6)"
          @click="handleKey(key.value)" type="button">
          <svg v-if="key.value === 'delete'" viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M21 4H8L1 12L8 20H21V4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M17 9L13 13M13 9L17 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="key.value === 'clear'" viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span v-else>{{ key.value }}</span>
        </button>
      </div>

      <button class="submit" :disabled="code.length < 4 || isLoading" @click="handleSubmit" type="button">
        <span v-if="isLoading" class="spinner" aria-hidden="true"/>
        <span>{{ isLoading ? 'Connexion…' : 'Se connecter' }}</span>
        <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" width="18" height="18">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button class="contrast-btn" @click="forceHighContrast = !forceHighContrast"
        :aria-pressed="forceHighContrast" type="button">
        {{ forceHighContrast ? 'Contraste normal' : 'Contraste élevé' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.page { min-height:100vh;background:var(--bg,#F5F2ED);display:flex;align-items:center;justify-content:center;padding:24px 16px;font-family:'Verdana','Geneva',sans-serif; }
.page.high-contrast { background:#0A0A0A; }
.page.high-contrast .card { background:#111;border-color:#444; }
.page.high-contrast .key--digit { background:#1A1A1A;color:#FFF;border-color:#444; }
.page.high-contrast .form-title,.page.high-contrast .brand { color:#FFF; }
.card { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:20px;padding:36px 32px 28px;width:100%;max-width:400px;box-shadow:0 4px 24px rgba(44,36,22,0.08); }
.card-top { display:flex;align-items:center;gap:14px;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(120,100,80,0.1); }
.brand { font-size:1.1rem;font-weight:bold;color:#2C2416;margin:0 0 2px;font-family:'Georgia',serif; }
.brand-sub { font-size:.72rem;color:#9C8E80;margin:0;text-transform:uppercase;letter-spacing:.08em; }
.form-head { margin-bottom:22px; }
.form-title { font-size:1.3rem;font-weight:bold;color:#2C2416;margin:0 0 4px;font-family:'Georgia',serif; }
.form-sub { font-size:.8rem;color:#9C8E80;margin:0; }
.dots { display:flex;gap:10px;margin-bottom:20px; }
.dot { width:13px;height:13px;border-radius:50%;background:rgba(120,100,80,0.1);border:1.5px solid rgba(120,100,80,0.18);transition:all .15s; }
.dot.filled { background:#5C4FE0;border-color:#5C4FE0;transform:scale(1.15); }
.dot.active { border-color:#5C4FE0;animation:blink 1.1s ease-in-out infinite; }
@keyframes blink { 0%,100%{box-shadow:0 0 0 0 rgba(92,79,224,.3);}50%{box-shadow:0 0 0 5px rgba(92,79,224,0);} }
.error { display:flex;align-items:center;gap:8px;background:rgba(184,50,50,.06);border:1px solid rgba(184,50,50,.18);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:.82rem;font-weight:bold;color:#B83232; }
.numpad { display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px; }
.key { aspect-ratio:1;border-radius:12px;font-family:'Verdana',sans-serif;font-size:1.45rem;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .1s;border:1.5px solid rgba(120,100,80,0.12); }
.key:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,.3); }
.key:active:not(:disabled) { transform:scale(.94); }
.key:disabled { opacity:.3;cursor:not-allowed; }
.key--digit { background:#F0EDE7;color:#2C2416; }
.key--digit:hover:not(:disabled) { background:#E8E4DC; }
.key--action-delete { background:rgba(138,98,0,.07);color:#8A6200;border-color:rgba(138,98,0,.14); }
.key--action-delete:hover:not(:disabled) { background:rgba(138,98,0,.13); }
.key--action-clear { background:rgba(184,50,50,.06);color:#B83232;border-color:rgba(184,50,50,.14); }
.key--action-clear:hover:not(:disabled) { background:rgba(184,50,50,.12); }
.submit { width:100%;padding:14px 24px;background:#5C4FE0;color:#FFF;border:none;border-radius:12px;font-family:'Verdana',sans-serif;font-size:.92rem;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:10px;transition:all .15s;box-shadow:0 3px 14px rgba(92,79,224,.22); }
.submit:hover:not(:disabled) { background:#4A3ED0;transform:translateY(-1px); }
.submit:disabled { background:rgba(120,100,80,0.13);color:#9C8E80;box-shadow:none;cursor:not-allowed; }
.spinner { width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#FFF;border-radius:50%;animation:spin .7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg);} }
.contrast-btn { width:100%;padding:9px;background:transparent;color:#9C8E80;border:1px solid rgba(120,100,80,0.13);border-radius:10px;font-family:'Verdana',sans-serif;font-size:.78rem;cursor:pointer;transition:all .15s; }
.contrast-btn:hover { color:#2C2416;border-color:rgba(92,79,224,.25); }
.contrast-btn[aria-pressed="true"] { background:#5C4FE0;color:#FFF;border-color:#5C4FE0; }
.skip-link { position:absolute;top:-100px;left:16px;background:#5C4FE0;color:#FFF;padding:8px 16px;border-radius:8px;font-weight:bold;z-index:9999;text-decoration:none; }
.skip-link:focus { top:16px; }
@media(max-width:480px) { .card{padding:26px 18px 20px;} .key{font-size:1.25rem;} }
</style>