<script setup>
import { ref, onMounted } from 'vue'
import { apiDelete, apiGet } from '@/helpers/axiosApi'
import { useRouter } from 'vue-router'

const router = useRouter()
const clientName = ref('')
const mobileOpen = ref(false)

const linksTop = [
  { to: '/client/dashboard', label: 'Tableau de bord' },
  { to: '/client/ecoles', label: 'Établissements' },
  { to: '/client/eleves', label: 'Élèves' },
  { to: '/client/classes', label: 'Classes' },
  { to: '/client/matieres', label: 'Matières' },
  { to: '/client/enseignants', label: 'Enseignants' },
  { to: '/client/cours', label: 'Cours' },
  { to: '/client/quizzes', label: 'Quiz' },
  { to: '/client/handicaps', label: 'Handicaps' },
]

function pickName(payload) {
  const d = payload?.data ?? payload
  return d?.name || d?.nom || d?.full_name || d?.email || 'Client'
}

async function loadClient() {
  try {
    const res = await apiGet('client/getClient')
    clientName.value = pickName(res.data)
  } catch {
    clientName.value = 'Client'
  }
}

async function handleLogout() {
  try {
    await apiDelete('client/logout')
  } catch {
    // Même en cas d'erreur API, on nettoie la session locale
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    mobileOpen.value = false
    router.push('/client/login')
  }
}

onMounted(loadClient)
</script>

<template>
  <header id="header-client">
    <RouterLink to="/client/dashboard" class="hc-brand">
      <div class="hc-logo">
        <img src="@/assets/images/logo_classe_inclusive.png" alt="Logo classe inclusive" />
      </div>
      <div>
        <div class="logo-title">Classe inclusive</div>
        <div class="logo-desc">{{ clientName || 'Espace client' }}</div>
      </div>
    </RouterLink>

    <button class="hc-burger" type="button" @click="mobileOpen = !mobileOpen" aria-label="Menu">
      ☰
    </button>

    <nav class="header-part2" :class="{ open: mobileOpen }">
      <RouterLink
        v-for="l in linksTop"
        :key="l.to"
        :to="l.to"
        active-class="active"
        class="hc-link"
        @click="mobileOpen = false"
      >{{ l.label }}</RouterLink>
      <RouterLink to="/client/profil" active-class="active" class="hc-link" @click="mobileOpen = false">Profil</RouterLink>
    </nav>

    <div class="header-part3">
      <button type="button" class="header-part3-link2" @click="handleLogout">Déconnexion</button>
    </div>
  </header>
</template>

<style scoped>
#header-client {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: linear-gradient(135deg, #0f1b3e 0%, #1d2f6e 60%, #6d28d9 130%);
  padding: 14px 28px;
  margin-bottom: 30px;
  font-family: 'Plus Jakarta Sans', 'Nunito', sans-serif;
  flex-wrap: wrap;
}
.hc-brand { display: flex; align-items: center; gap: 10px; color: white; }
.hc-logo { width: 56px; display: flex; align-items: center; }
.hc-logo img { width: 100%; }
.logo-title { font-weight: 900; font-size: 1.25rem; line-height: 1; color: white; }
.logo-desc { opacity: 0.7; color: white; font-size: 0.85rem; }
.header-part2 { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.hc-link { padding: 8px 12px; color: rgba(255,255,255,0.72); text-decoration: none; font-weight: 700; font-size: 0.92rem; border-radius: 10px; }
.hc-link:hover { background: rgba(255,255,255,0.16); color: #fff; }
.active { background: rgba(255,255,255,0.18); border-radius: 10px; color: #fff !important; }
.header-part3 { display: flex; }
.header-part3-link2 {
  padding: 8px 16px; background: rgba(255,92,92,0.15); border: 1.5px solid rgba(255,92,92,0.4);
  color: #ff9090; border-radius: 3rem; font-weight: 800; cursor: pointer;
}
.header-part3-link2:hover { background: rgba(255,92,92,0.4); color: #fff; }
.hc-burger { display: none; background: rgba(255,255,255,0.14); color: #fff; border: none; border-radius: 10px; padding: 8px 12px; cursor: pointer; }
@media (max-width: 1024px) {
  .hc-burger { display: inline-flex; }
  .header-part2 { display: none; width: 100%; flex-direction: column; align-items: stretch; }
  .header-part2.open { display: flex; }
}
</style>
