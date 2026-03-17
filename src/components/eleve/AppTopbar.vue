
<script setup>
import { computed,ref, onMounted } from 'vue'
import { apiPost,apiGet,apiDelete } from '@/helpers/axiosApi'
import { useRouter } from 'vue-router'

const router = useRouter()
const eleve = ref()
const error = ref('')

async function loadData() {
  error.value = ''
    const response = await apiGet('eleve/getEleve')
    eleve.value =  response.data
    console.log('eleve.value: ', eleve.value); 
}


async function handleLogout() {
  try {
    await apiPost('eleve/logout')
  } catch {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  localStorage.removeItem('eleve')
  router.push("/eleve/login")
}


defineProps({ pageTitle: { type: String, default: '' } })


onMounted(async()=>{
  await loadData()
})

</script>



<!-- ═══════════════════════════════════════════════════════════
     AppTopbar.vue — boutons grands pour enfants
═══════════════════════════════════════════════════════════ -->
<template>
  <header class="app-topbar">

    <!-- GAUCHE : Logo + titre -->
    <div class="at-left">
      <div class="at-logo" aria-hidden="true">
        <svg viewBox="0 0 36 36" fill="none" width="28" height="28">
          <rect width="36" height="36" rx="10" fill="url(#atg)"/>
          <path d="M18 7L28 13V23L18 29L8 23V13L18 7Z" stroke="white" stroke-width="1.5" fill="none" opacity=".6"/>
          <circle cx="18" cy="18" r="5" fill="white" opacity=".9"/>
          <defs>
            <linearGradient id="atg" x1="0" y1="0" x2="36" y2="36">
              <stop offset="0%" stop-color="#4F46E5"/>
              <stop offset="100%" stop-color="#7C3AED"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="at-brand">Classe inclusive</span>
      <span v-if="pageTitle" class="at-sep" aria-hidden="true">/</span>
      <span v-if="pageTitle" class="at-page">{{ pageTitle }}</span>
    </div>

    <!-- CENTRE : Points + classe -->
    <div class="at-center">
      <div class="at-pts">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" class="at-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span class="at-sep2">·</span>
        <span class="at-pts-level">{{ eleve?.data?.classe?.name }}</span>
      </div>
    </div>

    <!-- DROITE : User | Thème | Déconnexion -->
    <div class="at-right">

      <div class="at-user" aria-label="Élève connecté" >
        <div class="at-avatar" >{{ eleve?.data?.name?.charAt(0) }}</div>
        <span class="at-username">{{ eleve?.data?.name}}</span>
      </div>

      <button class="at-btn at-btn--logout" @click="$emit('logout')" type="button" aria-label="Se déconnecter">
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="at-btn-label" @click="handleLogout">Quitter</span>
      </button>
    </div>

  </header>
</template>

<style scoped>

.app-topbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 70px;
  background: #FDFBF8;
  border-bottom: 1px solid rgba(120,100,80,0.12);
  flex-shrink: 0;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.at-left  { display:flex;align-items:center;gap:9px;flex-shrink:0;min-width:200px; }
.at-logo  { display:flex;align-items:center;flex-shrink:0; }
.at-brand { font-family:'Georgia', 'Times New Roman', serif;font-size:.95rem;font-weight:bold;color:#2C2416;white-space:nowrap; }
.at-sep   { color:#9C8E80;font-size:.85rem; }
.at-page  { font-size:.82rem;color:#6B5E4E;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px; }

.at-center { flex:1;display:flex;justify-content:center; }
.at-pts {
  display:flex;align-items:center;gap:7px;
  padding:6px 16px;
  background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);border-radius:999px;
}
.at-star      { color:#F59E0B;flex-shrink:0; }
.at-pts-val   { font-size:.95rem;font-weight:bold;color:#2C2416; }
.at-sep2      { color:#9C8E80; }
.at-pts-level { font-size:.82rem;font-weight:bold; }
.at-pts-bar-wrap { width:52px; }
.at-pts-bar  { height:4px;background:rgba(120,100,80,0.15);border-radius:999px;overflow:hidden; }
.at-pts-fill { height:100%;border-radius:999px;transition:width .6s; }

.at-right { display:flex;align-items:center;gap:10px;flex-shrink:0; }

.at-user {
  display:flex;align-items:center;gap:8px;
  padding:5px 12px 5px 5px;
  background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);border-radius:999px;
}
.at-avatar {
  width:34px;height:34px;border-radius:50%;
  background:linear-gradient(135deg,#5C4FE0,#7C3AED);
  display:flex;align-items:center;justify-content:center;
  font-weight:bold;font-size:.78rem;color:#FFF;flex-shrink:0;
}
.at-username { font-size:.84rem;font-weight:bold;color:#2C2416; }

/* ── Boutons grands adaptés aux enfants ── */
.at-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 20px;
  height: 48px;
  border-radius: 14px;
  font-size: .92rem;
  font-weight: bold;
  font-family: 'Verdana', 'Geneva', sans-serif;
  cursor: pointer;
  transition: all .15s;
  flex-shrink: 0;
  white-space: nowrap;
}
.at-btn-label { font-size: .92rem; font-weight: bold; }


.at-btn--logout {
  background: rgba(239,68,68,.08);
  border: 2px solid rgba(239,68,68,.25);
  color: #EF4444;
}
.at-btn--logout:hover {
  background: rgba(239,68,68,.18);
  border-color: rgba(239,68,68,.55);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(239,68,68,.25);
}

@media(max-width:760px) {
  .at-pts-bar-wrap { display:none; }
  .at-username { display:none; }
  .at-brand { display:none; }
  .at-page  { display:none; }
  .at-btn-label { display:none; }
  .at-btn { padding: 11px 14px; }
}
</style>