<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import AppTopbar from '@/components/eleve/AppTopbar.vue'

const router  = useRouter()
const eleve   = ref(null)
const loading = ref(true)
const error   = ref('')

const COLORS    = ['#4F46E5','#0EA5E9','#10B981','#F59E0B','#06B6D4','#EC4899','#8B5CF6','#EF4444']
const ICON_PATH = 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'

async function loadData() {
  loading.value = true
  error.value   = ''
  try {
    const response = await apiGet('eleve/getEleve')
    eleve.value    = response.data?.data || response.data
    localStorage.setItem('eleve', JSON.stringify(eleve.value))
  } catch {
    error.value = 'Impossible de charger les matières. Vérifiez votre connexion.'
  } finally {
    loading.value = false
  }
}

// Matières uniques extraites des cours
const subjects = computed(() => {
  const cours = eleve.value?.classe?.enseignant?.cours ?? []
  const map = {}
  cours.forEach((c, idx) => {
    const m = c.matiere
    if (m && !map[m.id]) map[m.id] = { ...m, idx, courseCount: 0 }
    if (m) map[m.id].courseCount++
  })
  return Object.values(map).map((m) => ({
    id:          m.id,
    name:        m.name,
    color:       COLORS[m.idx % COLORS.length],
    iconPath:    ICON_PATH,
    courseCount: m.courseCount,
  }))
})

function goTo(id) {
  router.push({ name: 'Courses', params: { subjectId: id } })
}

async function handleLogout() {
  try { await apiPost('eleve/logout') } catch {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  localStorage.removeItem('eleve')
  router.push({ name: 'EleveLogin' })
}

onMounted(loadData)
</script>

<template>
  <div class="app" role="main">
    <a href="#subjects" class="skip-link">Aller aux matières</a>
    <AppTopbar page-title="Mes matières" @logout="handleLogout" />

    <main class="main" id="subjects" tabindex="-1">

      <div v-if="loading" class="loading-state" aria-live="polite">
        <div class="spinner"></div>
        <p>Chargement des matières…</p>
      </div>

      <div v-else-if="error" class="error-state" role="alert">
        <p>{{ error }}</p>
        <button @click="loadData" type="button" class="retry-btn">Réessayer</button>
      </div>

      <template v-else>
        <div class="main-header">
          <div>
            <h1 class="main-title">Liste des matières</h1>
            <p class="main-sub">Bonjour {{ eleve?.prenom }} — Choisissez une matière</p>
          </div>
        </div>

        <div v-if="subjects.length === 0" class="empty-state">
          <p>Aucune matière disponible pour votre classe.</p>
        </div>

        <div v-else class="subjects-grid" role="list">
          <article v-for="(s, idx) in subjects" :key="s.id"
            class="subject-card" role="listitem" tabindex="0"
            :aria-label="`${s.name}, ${s.courseCount} cours disponibles`"
            @click="goTo(s.id)"
            @keydown.enter="goTo(s.id)"
            @keydown.space.prevent="goTo(s.id)"
            :style="{ '--cc': s.color, '--cd': idx * 0.07 + 's' }">
            <div class="card-glow" aria-hidden="true"></div>
            <div class="card-top">
              <div class="card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="24" height="24"
                  stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="s.iconPath"/>
                </svg>
              </div>
              <span class="card-badge">{{ s.courseCount }} cours</span>
            </div>
            <h2 class="card-name">{{ s.name }}</h2>
            <p class="card-desc">{{ s.courseCount }} cours disponibles</p>
            <div class="card-foot">
              <div class="card-track"><div class="card-fill" style="width:0%"></div></div>
              <div class="card-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </article>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.app { min-height:100vh;background:var(--bg,#F5F2ED);font-family:'Verdana','Geneva',sans-serif;color:#2C2416;display:flex;flex-direction:column; }
.skip-link { position:absolute;top:-100px;left:16px;background:#5C4FE0;color:#FFF;padding:10px 18px;border-radius:8px;font-weight:bold;z-index:9999;text-decoration:none; }
.skip-link:focus { top:16px; }
.main { flex:1;max-width:1200px;width:100%;margin:0 auto;padding:36px 42px;overflow-y:auto; }
.main-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:30px;gap:16px;flex-wrap:wrap; }
.main-title { font-family:'Georgia','Times New Roman',serif;font-size:1.85rem;font-weight:bold;color:#2C2416;margin:0 0 4px; }
.main-sub   { font-size:.875rem;color:#6B5E4E;margin:0; }
.loading-state { display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 0;color:#6B5E4E; }
.spinner { width:36px;height:36px;border:3px solid rgba(120,100,80,0.12);border-top-color:#5C4FE0;border-radius:50%;animation:spin .7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.error-state { text-align:center;padding:60px 0;color:#B83232; }
.retry-btn   { margin-top:12px;padding:10px 22px;background:#5C4FE0;color:#FFF;border:none;border-radius:10px;cursor:pointer;font-weight:bold; }
.empty-state { text-align:center;padding:60px 0;color:#6B5E4E;font-size:.9rem; }
.subjects-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px; }
.subject-card { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:16px;padding:22px;cursor:pointer;position:relative;overflow:hidden;outline:none;transition:transform .2s,border-color .2s,box-shadow .2s;animation:card-in .4s ease both;animation-delay:var(--cd,0s); }
@keyframes card-in { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }
.subject-card:hover  { transform:translateY(-3px);border-color:#5C4FE0;box-shadow:0 10px 30px rgba(0,0,0,.12),0 0 0 1px #5C4FE0; }
.subject-card:focus-visible { border-color:#5C4FE0;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.card-glow { position:absolute;top:-40px;right:-40px;width:100px;height:100px;border-radius:50%;background:#5C4FE0;opacity:.07;filter:blur(32px);pointer-events:none; }
.subject-card:hover .card-glow { opacity:.13; }
.card-top  { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px; }
.card-icon { width:48px;height:48px;border-radius:12px;background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);display:flex;align-items:center;justify-content:center;color:#5C4FE0; }
.card-badge { padding:3px 9px;background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);border-radius:999px;font-size:.72rem;color:#6B5E4E;font-weight:bold; }
.card-name { font-family:'Georgia','Times New Roman',serif;font-size:1rem;font-weight:bold;color:#2C2416;margin:0 0 5px; }
.card-desc { font-size:.78rem;color:#6B5E4E;margin:0 0 16px;line-height:1.5; }
.card-foot { display:flex;align-items:center;gap:10px; }
.card-track { flex:1;height:4px;background:rgba(120,100,80,0.15);border-radius:999px;overflow:hidden; }
.card-fill  { height:100%;background:#5C4FE0;border-radius:999px; }
.card-arrow { width:28px;height:28px;border-radius:50%;background:#5C4FE0;display:flex;align-items:center;justify-content:center;color:#FFF;flex-shrink:0;transition:transform .2s; }
.subject-card:hover .card-arrow { transform:translateX(3px); }
@media(max-width:900px) { .main{padding:20px 16px} }
</style>