<template>
  <div :class="['app', adaptiveClasses]" :style="{background:'#F5F2ED',color:'#2C2416'}" role="main">
    <AppTopbar :page-title="pageTitle" @logout="handleLogout" />
    <a href="#courses-list" class="skip-link">Aller aux cours</a>

    <!-- Header -->
    <header class="page-header" role="banner">
      <div class="header-inner">
        <button class="back-btn" @click="router.push({ name: 'Dashboard' })" type="button" aria-label="Retour aux matières">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          Matières
        </button>
        <div class="subject-label">
          <div class="subject-icon-wrap" aria-hidden="true">
            <component :is="currentSubject.svgIcon" :color="currentSubject.color"/>
          </div>
          <h1 class="subject-name">{{ currentSubject.name }}</h1>
        </div>
        <!-- Points rapides -->
        <div class="header-pts" aria-label="Vos points">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          {{ points.totalPoints }}
        </div>
      </div>
    </header>

    <div class="page-body">

      <!-- Progression globale -->
      <section class="progress-section" aria-label="Progression">
        <div class="progress-card">
          <div class="progress-stats">
            <div class="stat">
              <span class="stat-val">{{ completedCount }}</span>
              <span class="stat-lbl">Terminés</span>
            </div>
            <div class="progress-bar-wrap" role="presentation">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: globalPct + '%' }"></div>
              </div>
              <span class="progress-pct">{{ globalPct }}%</span>
            </div>
            <div class="stat">
              <span class="stat-val">{{ courses.length }}</span>
              <span class="stat-lbl">Total</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Liste cours -->
      <ol class="courses-list" id="courses-list" aria-label="Liste des cours">
        <li v-for="(course, i) in courses" :key="course.id"
          :class="['course-item', { 'course-item--done': course.completed, 'course-item--locked': course.locked }]">

          <div class="course-card" :tabindex="course.locked ? -1 : 0" role="button"
            :aria-label="courseLabel(course, i)"
            :aria-disabled="course.locked"
            @click="!course.locked && goTo(course.id)"
            @keydown.enter="!course.locked && goTo(course.id)"
            @keydown.space.prevent="!course.locked && goTo(course.id)">

            <!-- Numéro / état -->
            <div :class="['course-num', { 'course-num--done': course.completed, 'course-num--locked': course.locked }]" aria-hidden="true">
              <svg v-if="course.completed" viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
              <svg v-else-if="course.locked" viewBox="0 0 24 24" fill="none" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span v-else>{{ i + 1 }}</span>
            </div>

            <!-- Infos -->
            <div class="course-info">
              <h2 class="course-title">{{ course.title }}</h2>
              <div class="course-meta">
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" width="13" height="13" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                  {{ course.duration }}
                </span>
                <span class="meta-sep" aria-hidden="true">·</span>
                <span class="meta-item">{{ course.type }}</span>
                <span v-if="course.completed" class="meta-sep" aria-hidden="true">·</span>
                <span v-if="course.completed" class="meta-score">{{ course.scoreLabel }}</span>
              </div>
              <!-- Étoiles si terminé -->
              <div v-if="course.completed" class="course-stars" aria-label="Note obtenue">
                <svg v-for="n in 3" :key="n" viewBox="0 0 24 24" fill="none" width="14" height="14" :aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    :fill="n <= course.starsCount ? '#F59E0B' : 'none'"
                    :stroke="n <= course.starsCount ? '#F59E0B' : 'rgba(255,255,255,.2)'"
                    stroke-width="1.5"/>
                </svg>
              </div>
            </div>

            <!-- Action -->
            <div class="course-action" aria-hidden="true">
              <div v-if="course.locked" class="action-tag action-tag--locked">Verrouillé</div>
              <div v-else-if="course.completed" class="action-tag action-tag--done">Refaire</div>
              <div v-else class="action-arrow">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
              </div>
            </div>

          </div>
        </li>
      </ol>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h, markRaw } from 'vue'
import AppTopbar from '@/components/eleve/AppTopbar.vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore }  from '@/stores/theme'
import { useAuthStore }   from '@/stores/auth'
import { usePointsStore } from '@/stores/points'

const router = useRouter()
const auth   = useAuthStore()
const theme  = useThemeStore()

const route  = useRoute()
const points = usePointsStore()

const adaptiveClasses = computed(() => ({
  'mode-contrast':   auth.needsHighContrast,
  'mode-large-text': auth.needsLargeText,
}))

const COLORS = ['#4F46E5','#0EA5E9','#10B981','#F59E0B','#06B6D4','#EC4899','#8B5CF6','#EF4444']

const sid = String(route.params.subjectId)

// Matière réelle depuis le store
const allMatieres = auth.matieres
const matiereIdx  = allMatieres.findIndex(m => String(m.id) === sid)
const matiere     = allMatieres[matiereIdx] || { id: sid, name: 'Matière' }

const currentSubject = ref({
  id:    matiere.id,
  name:  matiere.name,
  color: COLORS[matiereIdx % COLORS.length] || '#4F46E5',
})

// Cours réels depuis le store
const courses = ref(
  auth.coursByMatiere(matiere.id).map(c => ({
    id:         c.id,
    title:      c.titre || c.title || 'Cours',
    duration:   c.duree  || '—',
    type:       'Cours + Quiz',
    completed:  false,
    locked:     false,
    starsCount: 0,
    scoreLabel: '',
    medias:     c.medias || [],
    quizzes:    c.quizzes || [],
  }))
)

const completedCount = computed(() => courses.value.filter(c => c.completed).length)
const globalPct      = computed(() => Math.round(completedCount.value / courses.value.length * 100))

function courseLabel(c, i) {
  if (c.locked)    return `Cours ${i+1} : ${c.title}. Verrouillé.`
  if (c.completed) return `Cours ${i+1} : ${c.title}. Terminé. Score : ${c.scoreLabel}.`
  return `Cours ${i+1} : ${c.title}. Durée : ${c.duration}. Appuyez pour commencer.`
}

function goTo(lessonId) {
  router.push({ name: auth.isBlind ? 'BlindLesson' : 'Lesson', params: { subjectId: route.params.subjectId, lessonId } })
}

const pageTitle = computed(() => currentSubject.value.name)
async function handleLogout() { await auth.logoutApi(); router.push({ name: 'EleveLogin' }) }
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


.app {
  --correct: #4ADE80;
  --radius:  18px;
  --font-display:'Georgia','Times New Roman',serif;
  --font-body:'Verdana','Geneva',sans-serif;
  --focus-ring: 0 0 0 3px rgba(79,70,229,.6);
  min-height:100vh; background:#F5F2ED; font-family:'Verdana', 'Geneva', sans-serif; color:#2C2416;
}
.app.mode-contrast  { --bg:#000;--surface:#0A0A0A;--text:#FFF;--text2:#DDD;--border:rgba(255,255,255,.2); }
.app.mode-large-text { font-size:1.1rem; }

.skip-link { position:absolute;top:-100px;left:16px;background:#5C4FE0;color:#FFF;padding:10px 18px;border-radius:8px;font-weight:bold;z-index:9999;text-decoration:none; }
.skip-link:focus { top:16px; }

/* Header */
.page-header { background:#FDFBF8;border-bottom:1px solid rgba(120,100,80,0.12);position:sticky;top:0;z-index:100; }
.header-inner { max-width:860px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:16px; }
.back-btn { display:flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;color:#6B5E4E;border:1px solid rgba(120,100,80,0.12);border-radius:10px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.875rem;cursor:pointer;flex-shrink:0;transition:all .15s; }
.back-btn:hover { color:#2C2416;border-color:rgba(255,255,255,.2); }
.back-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.subject-label { display:flex;align-items:center;gap:12px;flex:1; }
.subject-icon-wrap { width:40px;height:40px;border-radius:10px;border:1px solid;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.subject-name { font-family:'Georgia', 'Times New Roman', serif;font-size:1.1rem;font-weight:bold;color:#2C2416;margin:0; }
.header-pts { display:flex;align-items:center;gap:5px;padding:6px 12px;background:rgba(79,70,229,.12);border:1px solid rgba(79,70,229,.25);color:#5C4FE0;border-radius:999px;font-size:.82rem;font-weight:bold;flex-shrink:0; }

/* Body */
.page-body { max-width:860px;margin:0 auto;padding:32px 24px 60px; }

/* Progression */
.progress-card { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:18px;padding:20px 24px;margin-bottom:28px; }
.progress-stats { display:flex;align-items:center;gap:20px; }
.stat { text-align:center;min-width:52px; }
.stat-val { display:block;font-family:'Georgia', 'Times New Roman', serif;font-size:1.6rem;font-weight:bold;color:#2C2416; }
.stat-lbl { font-size:.75rem;color:#9C8E80;text-transform:uppercase;letter-spacing:.05em; }
.progress-bar-wrap { flex:1;display:flex;flex-direction:column;gap:6px; }
.progress-bar { height:8px;background:rgba(120,100,80,0.08);border-radius:999px;overflow:hidden; }
.progress-fill { height:100%;background:linear-gradient(90deg,#5C4FE0,#7C3AED);border-radius:999px;transition:width .8s ease; }
.progress-pct { font-size:.78rem;color:#6B5E4E;text-align:right; }

/* Cours list */
.courses-list { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px; }

.course-card {
  background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:14px;
  padding:20px 22px;display:flex;align-items:center;gap:18px;
  cursor:pointer;outline:none;
  transition:border-color .15s,background .15s,transform .15s;
  position:relative;overflow:hidden;
}
.course-card::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#5C4FE0;opacity:0;transition:opacity .15s; }
.course-card:hover:not([aria-disabled="true"]) { border-color:rgba(79,70,229,.4);background:rgba(79,70,229,.04);transform:translateX(4px); }
.course-card:hover:not([aria-disabled="true"])::before { opacity:1; }
.course-card:focus-visible { border-color:rgba(79,70,229,.5);box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.course-item--locked .course-card { opacity:.45;cursor:not-allowed; }
.course-item--done .course-card::before { background:#1A7A46;opacity:1; }

/* Numéro */
.course-num { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:bold;flex-shrink:0;background:#F0EDE7;color:#6B5E4E;border:1px solid rgba(120,100,80,0.12); }
.course-num--done   { background:rgba(74,222,128,.1);color:#1A7A46;border-color:rgba(74,222,128,.3); }
.course-num--locked { background:rgba(255,255,255,.03); }

/* Infos */
.course-info { flex:1;min-width:0; }
.course-title { font-family:'Georgia', 'Times New Roman', serif;font-size:1rem;font-weight:bold;color:#2C2416;margin:0 0 6px 0; }
.course-meta  { display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:.8rem;color:#6B5E4E;margin-bottom:4px; }
.meta-item    { display:flex;align-items:center;gap:4px; }
.meta-sep     { color:#9C8E80; }
.meta-score   { color:#1A7A46;font-weight:bold; }
.course-stars { display:flex;gap:3px; }

/* Action */
.action-tag { padding:5px 12px;border-radius:999px;font-size:.78rem;font-weight:bold; }
.action-tag--locked { background:rgba(255,255,255,.04);color:#9C8E80;border:1px solid rgba(120,100,80,0.12); }
.action-tag--done   { background:rgba(74,222,128,.1);color:#1A7A46;border:1px solid rgba(74,222,128,.25); }
.action-arrow { width:36px;height:36px;border-radius:50%;background:rgba(79,70,229,.15);border:1px solid rgba(79,70,229,.3);display:flex;align-items:center;justify-content:center;color:#5C4FE0;transition:transform .15s; }
.course-card:hover .action-arrow { transform:translateX(3px); }

@media(max-width:640px) {
  .page-body { padding:20px 14px 40px; }
  .course-card { padding:16px;gap:12px; }
  .header-inner { padding:14px 16px; }
}

.theme-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
</style>