<template>
  <div :class="['app', adaptiveClasses]" :style="{background:'#F5F2ED',color:'#2C2416'}" role="main">
    <AppTopbar :page-title="pageTitle" @logout="handleLogout" />

    <div class="result-container">

      <!-- Header -->
      <header class="result-header">
        <button class="back-btn" @click="goHome" type="button" aria-label="Retour aux matières">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          Matières
        </button>
        <h1 class="result-title">Résultats</h1>
          <div aria-hidden="true" style="width:100px"></div>
      </header>

      <!-- Score principal -->
      <section class="score-section" role="region" aria-label="Score obtenu">

        <!-- Ring SVG animé -->
        <div class="ring-wrap" aria-hidden="true">
          <svg class="ring-svg" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   :stop-color="ringColor1"/>
                <stop offset="100%" :stop-color="ringColor2"/>
              </linearGradient>
            </defs>
            <!-- Fond -->
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="14"/>
            <!-- Arc coloré -->
            <circle cx="100" cy="100" r="80" fill="none"
              stroke="url(#ring-grad)" stroke-width="14"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              transform="rotate(-90 100 100)"
              style="transition: stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)"/>
            <!-- Décorations -->
            <circle cx="100" cy="100" r="66" fill="rgba(255,255,255,0.03)"/>
          </svg>
          <div class="ring-center">
            <span class="ring-score">{{ score }}</span>
            <span class="ring-sep">/</span>
            <span class="ring-total">{{ total }}</span>
          </div>
        </div>

        <!-- Texte score -->
        <div class="score-text">
          <div role="status" class="sr-only">Score : {{ score }} sur {{ total }}. {{ scorePercent }} pourcent.</div>
          <h2 class="score-label">{{ scoreLabel }}</h2>
          <p class="score-pct" :style="{ color: ringColor1 }">{{ scorePercent }}% de réussite</p>
          <p class="score-message">{{ motivationMessage }}</p>
        </div>

      </section>

      <!-- Points gagnés cette session -->
      <section class="points-earned-section" role="region" aria-label="Points gagnés">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Points gagnés
        </h2>
        <div class="points-earned-grid">
          <div v-for="item in sessionPoints" :key="item.label"
            class="points-earned-item"
            :class="{ 'points-earned-item--bonus': item.bonus }">
            <div class="pe-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path v-if="item.earned" d="M20 6L9 17l-5-5" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/>
                <path v-else d="M18 6L6 18M6 6l12 12" stroke="rgba(255,255,255,.2)" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="pe-label">{{ item.label }}</span>
            <span class="pe-points" :class="item.earned ? 'pe-points--earned' : 'pe-points--missed'">
              {{ item.earned ? '+' + item.pts : '-' }}
            </span>
          </div>
        </div>
        <div class="points-total-row">
          <span class="points-total-label">Total cette session</span>
          <span class="points-total-value">+{{ sessionTotal }} pts</span>
        </div>
        <!-- Barre niveau -->
        <div class="level-progress-block">
          <div class="level-row">
            <span class="level-badge" :style="{ color: points.currentLevel.color }">
              {{ points.currentLevel.name }}
            </span>
            <span v-if="points.nextLevel" class="level-next-info">
              encore {{ points.pointsToNextLevel }} pts → {{ points.nextLevel.name }}
            </span>
            <span v-else class="level-next-info">Niveau maximum atteint !</span>
          </div>
          <div class="level-bar" role="progressbar"
            :aria-valuenow="points.progressToNext" :aria-valuemin="0" :aria-valuemax="100">
            <div class="level-fill"></div>
          </div>
        </div>
      </section>

      <!-- Récapitulatif questions -->
      <section class="recap-section" role="region" aria-label="Récapitulatif des questions">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true"><path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Détail des réponses
        </h2>
        <ol class="recap-list">
          <li v-for="(q, i) in questionsResult" :key="i"
            :class="['recap-item', q.correct ? 'recap-item--correct' : 'recap-item--wrong']"
            :aria-label="`Question ${i+1} : ${q.correct ? 'Correcte' : 'Incorrecte'}. ${q.question}`">
            <div class="recap-num" aria-hidden="true">{{ i + 1 }}</div>
            <div class="recap-status" aria-hidden="true">
              <svg v-if="q.correct"  viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 6L9 17l-5-5" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M18 6L6 18M6 6l12 12" stroke="#F87171" stroke-width="2.5" stroke-linecap="round"/></svg>
            </div>
            <div class="recap-content">
              <p class="recap-q">{{ q.question }}</p>
              <p v-if="!q.correct" class="recap-answer">
                <svg viewBox="0 0 24 24" fill="none" width="13" height="13" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Bonne réponse : {{ q.correctAnswer }}
              </p>
            </div>
          </li>
        </ol>
      </section>

      <!-- Actions -->
      <div class="actions-row" role="group" aria-label="Actions">
        <button class="action-btn action-btn--secondary" @click="retryQuiz" type="button">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true"><path d="M1 4v6h6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M3.51 15A9 9 0 1 0 6 5.3L1 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          Reprendre le quiz
        </button>
        <button class="action-btn action-btn--primary" @click="goHome" type="button">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Retour aux matières
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppTopbar from '@/components/eleve/AppTopbar.vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore }  from '@/stores/theme'
import { useAuthStore }   from '@/stores/auth'
import { usePointsStore, POINT_RULES } from '@/stores/points'

const router = useRouter()
const auth   = useAuthStore()
const theme  = useThemeStore()

const route  = useRoute()
const points = usePointsStore()

const score        = computed(() => parseInt(route.query.score) || 0)
const total        = computed(() => parseInt(route.query.total) || 4)
const scorePercent = computed(() => Math.round(score.value / total.value * 100))

const adaptiveClasses = computed(() => ({
  'mode-contrast':   auth.needsHighContrast,
  'mode-large-text': auth.needsLargeText,
}))

// Ring
const circumference = 2 * Math.PI * 80
const dashOffset    = computed(() => circumference - (scorePercent.value / 100) * circumference)
const ringColor1    = computed(() => scorePercent.value >= 80 ? '#4ADE80' : scorePercent.value >= 50 ? '#F59E0B' : '#F87171')
const ringColor2    = computed(() => scorePercent.value >= 80 ? '#22C55E' : scorePercent.value >= 50 ? '#EF4444' : '#DC2626')

const scoreLabel = computed(() => {
  if (scorePercent.value === 100) return 'Score parfait !'
  if (scorePercent.value >= 80)  return 'Excellent !'
  if (scorePercent.value >= 60)  return 'Bien joué !'
  if (scorePercent.value >= 40)  return 'Continuez !'
  return 'Pas de découragement !'
})

const motivationMessage = computed(() => {
  if (scorePercent.value === 100) return 'Félicitations, vous avez répondu correctement à toutes les questions !'
  if (scorePercent.value >= 80)  return 'Très bon résultat, vous maîtrisez très bien ce cours.'
  if (scorePercent.value >= 60)  return "Bon travail ! Relisez les points que vous n'avez pas réussis."
  if (scorePercent.value >= 40)  return "Vous progressez ! N'hésitez pas à relire le cours."
  return 'Ne vous découragez pas ! Relisez attentivement le cours avant de recommencer.'
})

// Points session
const sessionPoints = computed(() => [
  { label: 'Bonnes réponses',  pts: score.value * 10, earned: score.value > 0, bonus: false },
  { label: 'Quiz terminé',     pts: 20,               earned: true,            bonus: false },
  { label: 'Quiz parfait',     pts: 50,               earned: scorePercent.value === 100, bonus: true },
])

const sessionTotal = computed(() =>
  sessionPoints.value.filter(p => p.earned).reduce((acc, p) => acc + p.pts, 0)
)

const questionsResult = computed(() => [
  { question: 'Combien font 3 × 4 ?',                    correct: true,                      correctAnswer: '12' },
  { question: 'Quel est le résultat de 5 × 5 ?',          correct: scorePercent.value >= 50,  correctAnswer: '25' },
  { question: 'Combien font 7 × 2 ?',                     correct: scorePercent.value >= 75,  correctAnswer: '14' },
  { question: 'Quel est le signe de la multiplication ?', correct: scorePercent.value >= 25,  correctAnswer: '×'  },
].slice(0, total.value))

function retryQuiz() {
  router.push({ name: auth.isBlind ? 'BlindQuiz' : 'Quiz', params: { subjectId: route.params.subjectId, lessonId: route.params.lessonId } })
}
function goHome() { router.push({ name: 'Dashboard' }) }

function handleLogout() { auth.logout(); router.push({ name: 'Login' }) }
onMounted(() => {
  theme.apply()
  // Ajouter les points
  for (const item of score.value > 0 ? [{ key: 'CORRECT_ANSWER', times: score.value }, { key: 'QUIZ_COMPLETED' }, ...(scorePercent.value === 100 ? [{ key: 'QUIZ_PERFECT' }] : [])] : [{ key: 'QUIZ_COMPLETED' }]) {
    if (item.times) {
      for (let i = 0; i < item.times; i++) points.addPoints(item.key)
    } else {
      points.addPoints(item.key)
    }
  }
  setTimeout(() => points.clearPending(), 4000)

  // Lecture vocale si aveugle
  if (auth.isBlind && 'speechSynthesis' in window) {
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(
        `Résultats. ${score.value} bonnes réponses sur ${total.value}. ${scorePercent.value} pourcent. ${motivationMessage.value} Vous avez gagné ${sessionTotal.value} points.`
      )
      u.lang = 'fr-FR'; u.rate = 0.9
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
    }, 800)
  }
})
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


.sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0); }

.app {
  --radius:  18px;
  --font-display: 'Georgia','Times New Roman',serif;
  --font-body:    'Verdana','Geneva',sans-serif;
  --focus-ring: 0 0 0 3px rgba(79,70,229,.6);
  min-height:100vh; background:#F5F2ED; font-family:'Verdana', 'Geneva', sans-serif; color:#2C2416;
  display:flex; align-items:flex-start; justify-content:center; padding:40px 20px;
}
.app.mode-contrast  { --bg:#000;--surface:#0A0A0A;--text:#FFF;--text2:#DDD;--border:rgba(255,255,255,.2); }
.app.mode-large-text { font-size:1.1rem; }

.result-container { width:100%;max-width:680px;display:flex;flex-direction:column;gap:24px; }

/* Header */
.result-header { display:flex;align-items:center;justify-content:space-between; }
.result-title { font-family:'Georgia', 'Times New Roman', serif;font-size:1.3rem;font-weight:bold;color:#2C2416;margin:0; }
.back-btn { display:flex;align-items:center;gap:8px;padding:10px 16px;background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);color:#6B5E4E;border-radius:10px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.875rem;cursor:pointer;transition:all .15s; }
.back-btn:hover { color:#2C2416;border-color:rgba(255,255,255,.2); }
.back-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }

/* Score */
.score-section { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:18px;padding:36px;display:flex;align-items:center;gap:36px;flex-wrap:wrap; }
.ring-wrap { position:relative;width:160px;height:160px;flex-shrink:0; }
.ring-svg  { width:100%;height:100%; }
.ring-center { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;align-items:baseline;gap:3px; }
.ring-score { font-family:'Georgia', 'Times New Roman', serif;font-size:3rem;font-weight:bold;color:#2C2416;line-height:1; }
.ring-sep   { font-size:1.3rem;color:#9C8E80;margin:0 2px; }
.ring-total { font-size:1.5rem;color:#6B5E4E; }
.score-text { flex:1;min-width:180px; }
.score-label   { font-family:'Georgia', 'Times New Roman', serif;font-size:1.6rem;font-weight:bold;color:#2C2416;margin:0 0 6px 0; }
.score-pct     { font-size:1.1rem;font-weight:bold;margin:0 0 10px 0; }
.score-message { font-size:.875rem;color:#6B5E4E;margin:0;line-height:1.6; }

/* Points section */
.points-earned-section { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:18px;padding:28px; }
.section-title { display:flex;align-items:center;gap:8px;font-family:'Georgia', 'Times New Roman', serif;font-size:1rem;font-weight:bold;color:#2C2416;margin:0 0 18px 0; }
.points-earned-grid { display:flex;flex-direction:column;gap:8px;margin-bottom:16px; }
.points-earned-item { display:flex;align-items:center;gap:12px;padding:11px 14px;background:#F0EDE7;border-radius:10px;border:1px solid rgba(120,100,80,0.12); }
.points-earned-item--bonus { border-color:rgba(79,70,229,.3);background:rgba(79,70,229,.08); }
.pe-icon { width:24px;flex-shrink:0; }
.pe-label { flex:1;font-size:.875rem;color:#6B5E4E; }
.pe-points { font-weight:bold;font-size:.9rem; }
.pe-points--earned { color:#4ADE80; }
.pe-points--missed { color:#9C8E80; }
.points-total-row { display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-top:1px solid rgba(120,100,80,0.12);margin-bottom:16px; }
.points-total-label { font-size:.875rem;color:#6B5E4E; }
.points-total-value { font-family:'Georgia', 'Times New Roman', serif;font-size:1.4rem;font-weight:bold;color:#4ADE80; }
.level-row { display:flex;justify-content:space-between;align-items:center;margin-bottom:8px; }
.level-badge { font-size:.85rem;font-weight:bold; }
.level-next-info { font-size:.78rem;color:#9C8E80; }
.level-bar { height:8px;background:rgba(120,100,80,0.06);border-radius:999px;overflow:hidden; }
.level-fill { height:100%;border-radius:999px;transition:width .8s ease; }

/* Récap */
.recap-section { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:18px;padding:28px; }
.recap-list { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px; }
.recap-item { display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid; }
.recap-item--correct { background:rgba(74,222,128,.06);border-color:rgba(74,222,128,.2); }
.recap-item--wrong   { background:rgba(248,113,113,.06);border-color:rgba(248,113,113,.2); }
.recap-num    { width:26px;height:26px;border-radius:8px;background:rgba(120,100,80,0.06);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:bold;color:#6B5E4E;flex-shrink:0; }
.recap-status { flex-shrink:0;padding-top:4px; }
.recap-q      { margin:0 0 4px 0;font-size:.9rem;color:#2C2416;font-weight:600;line-height:1.4; }
.recap-answer { display:flex;align-items:center;gap:5px;margin:0;font-size:.8rem;color:#6B5E4E; }

/* Actions */
.actions-row { display:flex;gap:12px;flex-wrap:wrap; }
.action-btn { flex:1;min-width:180px;display:flex;align-items:center;justify-content:center;gap:9px;padding:16px 24px;border:none;border-radius:18px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.95rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.action-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.action-btn--secondary { background:#F0EDE7;color:#2C2416;border:1px solid rgba(120,100,80,0.12); }
.action-btn--secondary:hover { background:rgba(255,255,255,.08); }
.action-btn--primary { background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#FFF;box-shadow:0 8px 24px rgba(79,70,229,.3); }
.action-btn--primary:hover { transform:translateY(-2px);box-shadow:0 12px 32px rgba(79,70,229,.4); }

.theme-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
</style>