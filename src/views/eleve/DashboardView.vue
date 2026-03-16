<template>
  <div :class="['app']" role="main">
    <a href="#subjects" class="skip-link">Aller aux matières</a>
    <AppTopbar page-title="Mes matières" @logout="handleLogout" />

    <main class="main" id="subjects" tabindex="-1">

      <transition-group name="pts-pop" tag="div" class="pts-popups" aria-live="polite">
        <div v-for="p in pts.pending" :key="p.id" class="pts-popup">+{{ p.points }} pts — {{ p.label }}</div>
      </transition-group>

      <!-- Chargement -->
      <div v-if="isLoading" class="loading-state" aria-live="polite">
        <div class="spinner"></div>
        <p>Chargement des matières…</p>
      </div>

      <!-- Erreur -->
      <div v-else-if="loadError" class="error-state" role="alert">
        <p>{{ loadError }}</p>
        <button @click="loadData" type="button" class="retry-btn">Réessayer</button>
      </div>

      <template v-else>
        <div class="main-header">
          <div>
            <h1 class="main-title">Mes matières</h1>
            <p class="main-sub">Bonjour {{ auth.user?.name }} — Choisissez une matière</p>
          </div>
          <button class="history-btn" @click="showHistory = !showHistory" type="button">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Historique
          </button>
        </div>

        <div v-if="subjects.length === 0" class="empty-state">
          <p>Aucune matière disponible pour votre classe.</p>
        </div>

        <div v-else class="subjects-grid" role="list">
          <article v-for="(s, idx) in subjects" :key="s.id"
            class="subject-card" role="listitem" tabindex="0"
            :aria-label="`${s.name}, ${s.completedCount} cours terminés sur ${s.courseCount}`"
            @click="goTo(s.id)" @keydown.enter="goTo(s.id)" @keydown.space.prevent="goTo(s.id)"
            :style="{ '--cc': s.color, '--cd': idx * 0.07 + 's' }">
            <div class="card-glow" aria-hidden="true"></div>
            <div class="card-top">
              <div class="card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="24" height="24"
                  stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="s.iconPath"/>
                </svg>
              </div>
              <span class="card-badge">{{ s.completedCount }}/{{ s.courseCount }}</span>
            </div>
            <h2 class="card-name">{{ s.name }}</h2>
            <p class="card-desc">{{ s.courseCount }} cours disponibles</p>
            <div class="card-foot">
              <div class="card-track"><div class="card-fill" :style="{ width: pct(s) + '%' }"></div></div>
              <div class="card-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </article>
        </div>
      </template>

      <transition name="slide-up">
        <div v-if="showHistory" class="history-panel" role="region" aria-label="Historique des points">
          <div class="history-head">
            <h2 class="history-title">Historique des points</h2>
            <button class="history-close" @click="showHistory = false" type="button" aria-label="Fermer">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div v-if="!pts.history.length" class="history-empty">Aucun point encore. Commencez un quiz !</div>
          <ul v-else class="history-list" role="list">
            <li v-for="e in pts.history" :key="e.id" class="history-item" role="listitem">
              <span class="h-pts">+{{ e.points }}</span>
              <span class="h-lbl">{{ e.label }}</span>
              <span class="h-date">{{ fmt(e.timestamp) }}</span>
            </li>
          </ul>
        </div>
      </transition>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter }      from 'vue-router'
import { useThemeStore }  from '@/stores/theme'
import { useAuthStore }   from '@/stores/auth'
import { usePointsStore } from '@/stores/points'
import AppTopbar          from '@/components/eleve/AppTopbar.vue'

const router = useRouter()
const auth   = useAuthStore()
const theme  = useThemeStore()

const pts    = usePointsStore()

const showHistory = ref(false)
const isLoading   = ref(false)
const loadError   = ref('')

// Palette de couleurs et icônes par défaut selon l'index
const COLORS    = ['#4F46E5','#0EA5E9','#10B981','#F59E0B','#06B6D4','#EC4899','#8B5CF6','#EF4444']
const ICON_PATH = 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'

const subjects = computed(() => {
  return auth.matieres.map((m, idx) => {
    const coursDeMat = auth.coursByMatiere(m.id)
    return {
      id:             m.id,
      name:           m.name,
      color:          COLORS[idx % COLORS.length],
      iconPath:       ICON_PATH,
      courseCount:    coursDeMat.length,
      completedCount: 0,  // sera géré par progress store
    }
  })
})

function pct(s) { return s.courseCount ? Math.round(s.completedCount / s.courseCount * 100) : 0 }
function goTo(id) { router.push({ name: 'Courses', params: { subjectId: id } }) }
function fmt(iso) { return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) }

async function loadData() {
  if (auth.cours.length > 0) return  // déjà chargé au login
  isLoading.value = true
  loadError.value = ''
  try {
    await auth.fetchProfile()
  } catch {
    loadError.value = 'Impossible de charger les matières. Vérifiez votre connexion.'
  } finally {
    isLoading.value = false
  }
}

async function handleLogout() {
  await auth.logoutApi()
  router.push({ name: 'EleveLogin' })
}

onMounted(loadData)
</script>

<style scoped>
/* ── Palette fixe clair doux ── */
.app, .bv-page {
  --bg:            #F5F2ED;
  --bg2:           #EDE9E3;
  --surface:       #FDFBF8;
  --surface2:      #F0EDE7;
  --border:        rgba(120,100,80,0.12);
  --border2:       rgba(120,100,80,0.2);
  --text:          #2C2416;
  --text2:         #6B5E4E;
  --text3:         #9C8E80;
  --accent:        #5C4FE0;
  --accent2:       #7C3AED;
  --accent-bg:     rgba(92,79,224,0.08);
  --accent-border: rgba(92,79,224,0.22);
  --green:         #1A7A46;
  --green-bg:      rgba(26,122,70,0.08);
  --green-border:  rgba(26,122,70,0.2);
  --red:           #B83232;
  --red-bg:        rgba(184,50,50,0.07);
  --red-border:    rgba(184,50,50,0.2);
  --yellow:        #8A6200;
  --yellow-bg:     rgba(138,98,0,0.08);
  --yellow-border: rgba(138,98,0,0.2);
  --font-b:        'Verdana', 'Geneva', sans-serif;
  --font-d:        'Georgia', 'Times New Roman', serif;
  --radius:        18px;
}


.app { min-height:100vh; background:#F5F2ED; font-family:'Verdana', 'Geneva', sans-serif; color:#2C2416; display:flex; flex-direction:column; }
.skip-link { position:absolute;top:-100px;left:16px;background:#5C4FE0;color:#FFF;padding:10px 18px;border-radius:8px;font-weight:bold;z-index:9999;text-decoration:none; }
.skip-link:focus { top:16px; }

.main { flex:1;padding:36px 42px;overflow-y:auto;position:relative; }
.main-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:30px;gap:16px;flex-wrap:wrap; }
.main-title { font-family:'Georgia', 'Times New Roman', serif;font-size:1.85rem;font-weight:bold;color:#2C2416;margin:0 0 4px; }
.main-sub   { font-size:.875rem;color:#6B5E4E;margin:0; }
.history-btn { display:flex;align-items:center;gap:7px;padding:8px 14px;background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);color:#6B5E4E;border-radius:10px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.82rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.history-btn:hover { background:#F0EDE7;color:#2C2416;border-color:#5C4FE0; }

.loading-state { display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 0;color:#6B5E4E; }
.spinner { width:36px;height:36px;border:3px solid rgba(120,100,80,0.12);border-top-color:#5C4FE0;border-radius:50%;animation:spin .7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.error-state  { text-align:center;padding:60px 0;color:#B83232; }
.retry-btn    { margin-top:12px;padding:10px 22px;background:#5C4FE0;color:#FFF;border:none;border-radius:10px;cursor:pointer;font-weight:bold; }
.empty-state  { text-align:center;padding:60px 0;color:#6B5E4E;font-size:.9rem; }

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
.card-name { font-family:'Georgia', 'Times New Roman', serif;font-size:1rem;font-weight:bold;color:#2C2416;margin:0 0 5px; }
.card-desc { font-size:.78rem;color:#6B5E4E;margin:0 0 16px;line-height:1.5; }
.card-foot { display:flex;align-items:center;gap:10px; }
.card-track { flex:1;height:4px;background:rgba(120,100,80,0.15);border-radius:999px;overflow:hidden; }
.card-fill  { height:100%;background:#5C4FE0;border-radius:999px;transition:width .6s; }
.card-arrow { width:28px;height:28px;border-radius:50%;background:#5C4FE0;display:flex;align-items:center;justify-content:center;color:#FFF;flex-shrink:0;transition:transform .2s; }
.subject-card:hover .card-arrow { transform:translateX(3px); }

.pts-popups { position:fixed;top:68px;right:22px;z-index:9999;display:flex;flex-direction:column;gap:7px;pointer-events:none; }
.pts-popup  { background:linear-gradient(135deg,#5C4FE0,#7C3AED);color:#FFF;padding:9px 16px;border-radius:999px;font-size:.85rem;font-weight:bold;box-shadow:0 8px 24px rgba(92,79,224,0.18); }
.pts-pop-enter-active { animation:pop-in .4s cubic-bezier(.34,1.56,.64,1) }
.pts-pop-leave-active { animation:pop-out .3s ease forwards }
@keyframes pop-in  { from{opacity:0;transform:translateX(40px) scale(.8)}to{opacity:1;transform:none} }
@keyframes pop-out { to{opacity:0;transform:translateX(40px) scale(.8)} }

.history-panel { position:fixed;bottom:0;left:0;right:0;background:#FDFBF8;border-top:1px solid rgba(120,100,80,0.12);padding:20px 42px;max-height:300px;overflow-y:auto;z-index:200;box-shadow:0 16px 48px rgba(44,36,22,0.1); }
.slide-up-enter-active,.slide-up-leave-active { transition:transform .3s,opacity .3s; }
.slide-up-enter-from,.slide-up-leave-to { transform:translateY(100%);opacity:0; }
.history-head  { display:flex;align-items:center;justify-content:space-between;margin-bottom:12px; }
.history-title { font-family:'Georgia', 'Times New Roman', serif;font-size:.95rem;font-weight:bold;color:#2C2416;margin:0; }
.history-close { background:transparent;border:none;color:#6B5E4E;cursor:pointer;padding:4px; }
.history-empty { color:#6B5E4E;font-size:.85rem; }
.history-list  { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px; }
.history-item  { display:flex;align-items:center;gap:12px;padding:8px 12px;background:#F0EDE7;border-radius:8px; }
.h-pts  { font-weight:bold;color:#1A7A46;min-width:44px;font-size:.85rem; }
.h-lbl  { flex:1;font-size:.8rem;color:#2C2416; }
.h-date { font-size:.72rem;color:#9C8E80; }

@media(max-width:900px) { .main{padding:20px 16px} }
</style>