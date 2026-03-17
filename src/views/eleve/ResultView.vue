<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import AppTopbar from '@/components/eleve/AppTopbar.vue'
 
const router = useRouter()
const route  = useRoute()
 
const subjectId = route.params.subjectId
const lessonId  = String(route.params.lessonId)
 
const eleve = ref(null)
 
async function loadData() {
  try {
    const response = await apiGet('eleve/getEleve')
    eleve.value    = response.data?.data || response.data
    localStorage.setItem('eleve', JSON.stringify(eleve.value))
  } catch(e) { console.error(e) }
}
 
const score        = computed(() => parseInt(route.query.score) || 0)
const total        = computed(() => parseInt(route.query.total) || 0)
const scorePercent = computed(() => total.value ? Math.round(score.value / total.value * 100) : 0)
 
const answersRaw = computed(() => {
  try { return JSON.parse(route.query.answers || '[]') } catch { return [] }
})
 
const apiCours = computed(() =>
  (eleve.value?.classe?.enseignant?.cours ?? []).find(c => String(c.id) === lessonId)
)
 
const questions = computed(() => {
  const cours = apiCours.value
  if (!cours?.quizzes?.length) return []
  const quiz = cours.quizzes[0]
  if (!quiz?.questions?.length) return []
  return quiz.questions.map(q => ({
    text:         q.question || q.text || '',
    correctIndex:  (q.reponses || []).findIndex(r => r.status === 'correct' || r.is_correct || r.correct),
    correctAnswer: (q.reponses || []).find(r => r.status === 'correct' || r.is_correct || r.correct)?.name || (q.reponses || []).find(r => r.status === 'correct' || r.is_correct || r.correct)?.reponse || '',
  }))
})
 
const questionsResult = computed(() =>
  questions.value.map((q, i) => ({
    question:     q.text,
    correct:      answersRaw.value[i] === q.correctIndex,
    correctAnswer: q.correctAnswer,
  }))
)
 
// Ring SVG
const circumference = 2 * Math.PI * 80
const dashOffset    = computed(() => circumference - (scorePercent.value / 100) * circumference)
const ringColor1    = computed(() => scorePercent.value >= 80 ? '#4ADE80' : scorePercent.value >= 50 ? '#F59E0B' : '#F87171')
const ringColor2    = computed(() => scorePercent.value >= 80 ? '#22C55E' : scorePercent.value >= 50 ? '#EF4444' : '#DC2626')
 
const scoreLabel = computed(() => {
  if (scorePercent.value === 100) return 'Score parfait !'
  if (scorePercent.value >= 80)   return 'Excellent !'
  if (scorePercent.value >= 60)   return 'Bien joué !'
  if (scorePercent.value >= 40)   return 'Continuez !'
  return 'Pas de découragement !'
})
 
const motivationMessage = computed(() => {
  if (scorePercent.value === 100) return 'Félicitations, vous avez répondu correctement à toutes les questions !'
  if (scorePercent.value >= 80)   return 'Très bon résultat, vous maîtrisez très bien ce cours.'
  if (scorePercent.value >= 60)   return "Bon travail ! Relisez les points que vous n'avez pas réussis."
  if (scorePercent.value >= 40)   return "Vous progressez ! N'hésitez pas à relire le cours."
  return 'Ne vous découragez pas ! Relisez attentivement le cours avant de recommencer.'
})
 
function retryQuiz() {
  router.push({ name: 'Quiz', params: { subjectId, lessonId } })
}
function goHome() {
  router.push({ name: 'Dashboard' })
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
    <AppTopbar page-title="Résultats" @logout="handleLogout" />
 
    <div class="result-container">
 
      <header class="result-header">
        <button class="back-btn" @click="goHome" type="button">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          Matières
        </button>
        <h1 class="result-title">Résultats</h1>
        <div style="width:100px"></div>
      </header>
 
      <section class="score-section" role="region" aria-label="Score obtenu">
        <div class="ring-wrap" aria-hidden="true">
          <svg class="ring-svg" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   :stop-color="ringColor1"/>
                <stop offset="100%" :stop-color="ringColor2"/>
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(120,100,80,.12)" stroke-width="14"/>
            <circle cx="100" cy="100" r="80" fill="none"
              stroke="url(#ring-grad)" stroke-width="14" stroke-linecap="round"
              :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset"
              transform="rotate(-90 100 100)"
              style="transition:stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)"/>
          </svg>
          <div class="ring-center">
            <span class="ring-score">{{ score }}</span>
            <span class="ring-sep">/</span>
            <span class="ring-total">{{ total }}</span>
          </div>
        </div>
        <div class="score-text">
          <h2 class="score-label">{{ scoreLabel }}</h2>
          <p class="score-pct" :style="{ color: ringColor1 }">{{ scorePercent }}% de réussite</p>
          <p class="score-message">{{ motivationMessage }}</p>
        </div>
      </section>
 
      <section v-if="questionsResult.length" class="recap-section" role="region">
        <h2 class="section-title">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Détail des réponses
        </h2>
        <ol class="recap-list">
          <li v-for="(q, i) in questionsResult" :key="i"
            :class="['recap-item', q.correct ? 'recap-item--correct' : 'recap-item--wrong']">
            <div class="recap-num">{{ i + 1 }}</div>
            <div class="recap-status">
              <svg v-if="q.correct"  viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 6L9 17l-5-5" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M18 6L6 18M6 6l12 12" stroke="#F87171" stroke-width="2.5" stroke-linecap="round"/></svg>
            </div>
            <div class="recap-content">
              <p class="recap-q">{{ q.question }}</p>
              <p v-if="!q.correct" class="recap-answer">Bonne réponse : {{ q.correctAnswer }}</p>
            </div>
          </li>
        </ol>
      </section>
 
      <div class="actions-row">
        <button class="action-btn action-btn--secondary" @click="retryQuiz" type="button">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M1 4v6h6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M3.51 15A9 9 0 1 0 6 5.3L1 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          Reprendre le quiz
        </button>
        <button class="action-btn action-btn--primary" @click="goHome" type="button">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Retour aux matières
        </button>
      </div>
 
    </div>
  </div>
</template>
 
<style scoped>
.app { min-height:100vh;background:var(--bg,#F5F2ED);font-family:'Verdana','Geneva',sans-serif;color:#2C2416;display:flex;flex-direction:column; }
.result-container { width:100%;max-width:1500px;margin:0 auto;padding:40px 20px;display:flex;flex-direction:column;gap:24px; }
.result-header { display:flex;align-items:center;justify-content:space-between; }
.result-title { font-family:'Georgia','Times New Roman',serif;font-size:1.3rem;font-weight:bold;color:#2C2416;margin:0; }
.back-btn { display:flex;align-items:center;gap:8px;padding:10px 16px;background:#FDFBF8;border:1.5px solid rgba(120,100,80,0.25);color:#2C2416;border-radius:10px;font-family:'Verdana','Geneva',sans-serif;font-size:.875rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.back-btn:hover { border-color:rgba(120,100,80,0.45); }
.score-section { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:18px;padding:36px;display:flex;align-items:center;gap:36px;flex-wrap:wrap; }
.ring-wrap { position:relative;width:160px;height:160px;flex-shrink:0; }
.ring-svg  { width:100%;height:100%; }
.ring-center { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;align-items:baseline;gap:3px; }
.ring-score { font-family:'Georgia','Times New Roman',serif;font-size:3rem;font-weight:bold;color:#2C2416;line-height:1; }
.ring-sep   { font-size:1.3rem;color:#9C8E80;margin:0 2px; }
.ring-total { font-size:1.5rem;color:#6B5E4E; }
.score-text { flex:1;min-width:180px; }
.score-label   { font-family:'Georgia','Times New Roman',serif;font-size:1.6rem;font-weight:bold;color:#2C2416;margin:0 0 6px 0; }
.score-pct     { font-size:1.1rem;font-weight:bold;margin:0 0 10px 0; }
.score-message { font-size:.875rem;color:#6B5E4E;margin:0;line-height:1.6; }
.recap-section { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:18px;padding:28px; }
.section-title { display:flex;align-items:center;gap:8px;font-family:'Georgia','Times New Roman',serif;font-size:1rem;font-weight:bold;color:#2C2416;margin:0 0 18px 0; }
.recap-list { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px; }
.recap-item { display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:12px;border:1px solid; }
.recap-item--correct { background:rgba(74,222,128,.06);border-color:rgba(74,222,128,.2); }
.recap-item--wrong   { background:rgba(248,113,113,.06);border-color:rgba(248,113,113,.2); }
.recap-num    { width:26px;height:26px;border-radius:8px;background:#F0EDE7;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:bold;color:#6B5E4E;flex-shrink:0; }
.recap-status { flex-shrink:0;padding-top:4px; }
.recap-q      { margin:0 0 4px 0;font-size:.9rem;color:#2C2416;font-weight:600;line-height:1.4; }
.recap-answer { margin:0;font-size:.8rem;color:#6B5E4E; }
.actions-row { display:flex;gap:12px;flex-wrap:wrap; }
.action-btn { flex:1;min-width:180px;display:flex;align-items:center;justify-content:center;gap:9px;padding:16px 24px;border:none;border-radius:18px;font-family:'Verdana','Geneva',sans-serif;font-size:.95rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.action-btn--secondary { background:#F0EDE7;color:#2C2416;border:1px solid rgba(120,100,80,0.12); }
.action-btn--secondary:hover { opacity:.85; }
.action-btn--primary { background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#FFF;box-shadow:0 8px 24px rgba(79,70,229,.3); }
.action-btn--primary:hover { transform:translateY(-2px); }
</style>