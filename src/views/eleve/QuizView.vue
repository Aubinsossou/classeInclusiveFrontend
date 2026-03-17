<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import AppTopbar from '@/components/eleve/AppTopbar.vue'

const router = useRouter()
const route  = useRoute()

const subjectId = route.params.subjectId
const lessonId  = String(route.params.lessonId)

const eleve   = ref(null)
const loading = ref(true)

async function loadData() {
  try {
    const response = await apiGet('eleve/getEleve')
    eleve.value    = response.data?.data || response.data
    localStorage.setItem('eleve', JSON.stringify(eleve.value))
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const isBlind = computed(() => (eleve.value?.handicap?.id ?? 1) === 2)

const apiCours = computed(() =>
  (eleve.value?.classe?.enseignant?.cours ?? []).find(c => String(c.id) === lessonId)
)

const questions = computed(() => {
  const cours = apiCours.value
  if (!cours?.quizzes?.length) return []
  const quiz = cours.quizzes[0]
  if (!quiz?.questions?.length) return []
  return quiz.questions.map(q => ({
    id:           q.id,
    text:         q.question || q.text || '',
    options:      (q.reponses || []).map(r => r.name || r.reponse || r.text || ''),
    correctIndex: (q.reponses || []).findIndex(r => r.status === 'correct' || r.is_correct || r.correct),
    explanation:  q.explication || '',
  }))
})

const quizName = computed(() => apiCours.value?.quizzes?.[0]?.name || 'Quiz')

const letters        = ['A','B','C','D']
const currentIndex   = ref(0)
const selectedAnswer = ref(null)
const answerGiven    = ref(false)
const feedbackState  = ref(null)
const answers        = ref([])
const nextBtn        = ref(null)

const currentQuestion = computed(() => questions.value[currentIndex.value])
const isLast          = computed(() => currentIndex.value === questions.value.length - 1)
const score           = computed(() => answers.value.filter((a,i) => a === questions.value[i]?.correctIndex).length)
const pageTitle       = computed(() => `Quiz — ${currentQuestion.value?.text?.slice(0,30) || ''}`)

function getAnswerClass(i) {
  if (!answerGiven.value) return selectedAnswer.value === i ? 'answer-btn--selected' : ''
  if (i === currentQuestion.value.correctIndex) return 'answer-btn--correct'
  if (i === selectedAnswer.value)               return 'answer-btn--wrong'
  return 'answer-btn--dim'
}

function selectAnswer(i) {
  if (answerGiven.value) return
  selectedAnswer.value = i
  answerGiven.value    = true
  answers.value[currentIndex.value] = i
  feedbackState.value = i === currentQuestion.value.correctIndex ? 'correct' : 'wrong'
  nextTick(() => { if (nextBtn.value) nextBtn.value.focus() })
}

function nextQuestion() {
  currentIndex.value++
  selectedAnswer.value = null
  answerGiven.value    = false
  feedbackState.value  = null
  nextTick(() => document.getElementById('quiz-question')?.focus())
}

function finishQuiz() {
  router.push({
    name: 'Result',
    params: { subjectId, lessonId },
    query:  { score: score.value, total: questions.value.length, answers: JSON.stringify(answers.value) }
  })
}

function confirmExit() {
  if (confirm('Quitter le quiz ? La progression sera perdue.'))
    router.push({ name: 'Courses', params: { subjectId } })
}

function handleKey(e) {
  if (['1','2','3','4'].includes(e.key) && !answerGiven.value) selectAnswer(parseInt(e.key)-1)
  if (e.key === 'ArrowRight' && answerGiven.value) { isLast.value ? finishQuiz() : nextQuestion() }
}

async function handleLogout() {
  try { await apiPost('eleve/logout') } catch {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  localStorage.removeItem('eleve')
  router.push({ name: 'EleveLogin' })
}

onMounted(() => { loadData(); window.addEventListener('keydown', handleKey) })
onUnmounted(() => window.removeEventListener('keydown', handleKey))
</script>

<template>
  <div class="app" role="main">
    <AppTopbar :page-title="pageTitle" @logout="handleLogout" />
    <a href="#quiz-question" class="skip-link">Aller à la question</a>

    <div v-if="loading" class="loading-state"><div class="spinner"></div></div>

    <template v-else-if="!questions.length">
      <div class="empty-quiz">
        <p>Aucune question disponible pour ce quiz.</p>
        <button class="retry-btn" @click="router.push({ name: 'Courses', params: { subjectId } })">Retour aux cours</button>
      </div>
    </template>

    <template v-else>
      <header class="quiz-header" role="banner">
        <div class="header-inner">
          <button class="back-btn" @click="confirmExit" type="button">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
            Quitter
          </button>
          <div class="pips-wrap">
            <div v-for="(q, i) in questions" :key="i"
              :class="['pip', {
                'pip--current': i === currentIndex,
                'pip--correct': answers[i] !== undefined && answers[i] === q.correctIndex,
                'pip--wrong':   answers[i] !== undefined && answers[i] !== q.correctIndex,
              }]"></div>
          </div>
          <div class="q-counter" aria-live="polite">
            <span class="q-cur">{{ currentIndex + 1 }}</span>
            <span class="q-sep">/</span>
            <span class="q-tot">{{ questions.length }}</span>
          </div>
        </div>
      </header>

      <div class="quiz-body">
        <div class="quiz-wrap">

          <!-- Titre du quiz -->
          <div class="quiz-title-card">
            <div class="quiz-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/></svg>
            </div>
            <div>
              <p class="quiz-title-label">Quiz en cours</p>
              <h2 class="quiz-title-name">{{ quizName }}</h2>
            </div>
          </div>

          <section class="question-card" id="quiz-question" role="region" aria-live="polite" tabindex="-1">
            <div class="q-badge">Question {{ currentIndex + 1 }}</div>
            <h1 class="q-text">{{ currentQuestion.text }}</h1>
          </section>

          <Transition name="feedback-slide">
            <div v-if="feedbackState" :class="['feedback-banner', `feedback-banner--${feedbackState}`]" role="alert">
              <div class="fb-icon">
                <svg v-if="feedbackState === 'correct'" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="rgba(74,222,128,.2)" stroke="#4ADE80" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="rgba(248,113,113,.2)" stroke="#F87171" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="#F87171" stroke-width="2.5" stroke-linecap="round"/></svg>
              </div>
              <div class="fb-content">
                <strong class="fb-title">{{ feedbackState === 'correct' ? 'Bonne réponse !' : 'Mauvaise réponse' }}</strong>
                <p v-if="feedbackState === 'wrong' && currentQuestion.explanation" class="fb-expl">{{ currentQuestion.explanation }}</p>
              </div>
            </div>
          </Transition>

          <fieldset class="answers-fieldset" :disabled="answerGiven">
            <legend class="sr-only">{{ currentQuestion.text }}</legend>
            <div class="answers-grid">
              <button v-for="(opt, i) in currentQuestion.options" :key="i"
                :class="['answer-btn', getAnswerClass(i)]"
                :disabled="answerGiven"
                @click="selectAnswer(i)" type="button">
                <span class="ans-letter">{{ letters[i] }}</span>
                <span class="ans-text">{{ opt }}</span>
                <span class="ans-indicator">
                  <svg v-if="answerGiven && i === currentQuestion.correctIndex" viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M20 6L9 17l-5-5" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/></svg>
                  <svg v-else-if="answerGiven && i === selectedAnswer && i !== currentQuestion.correctIndex" viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M18 6L6 18M6 6l12 12" stroke="#F87171" stroke-width="2.5" stroke-linecap="round"/></svg>
                </span>
              </button>
            </div>
          </fieldset>

          <div class="quiz-nav">
            <Transition name="nav-appear">
              <button v-if="answerGiven && !isLast" class="nav-btn nav-btn--next" @click="nextQuestion" ref="nextBtn" type="button">
                Question suivante
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
              </button>
              <button v-else-if="answerGiven && isLast" class="nav-btn nav-btn--finish" @click="finishQuiz" ref="nextBtn" type="button">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/></svg>
                Voir mes résultats
              </button>
            </Transition>
          </div>

          <p class="kbd-hint">
            <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> pour répondre
            <span v-if="answerGiven"> · <kbd>→</kbd> pour continuer</span>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0); }
.app { min-height:100vh;background:var(--bg,#F5F2ED);font-family:'Verdana','Geneva',sans-serif;color:#2C2416;display:flex;flex-direction:column; }
.skip-link { position:absolute;top:-100px;left:16px;background:#5C4FE0;color:#FFF;padding:10px 18px;border-radius:8px;font-weight:bold;z-index:9999;text-decoration:none; }
.skip-link:focus { top:16px; }
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:36px;height:36px;border:3px solid rgba(120,100,80,.12);border-top-color:#5C4FE0;border-radius:50%;animation:spin .7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.empty-quiz { display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 24px;text-align:center;color:#6B5E4E; }
.retry-btn { padding:10px 22px;background:#5C4FE0;color:#FFF;border:none;border-radius:10px;cursor:pointer;font-weight:bold; }
.quiz-header { background:#FDFBF8;border-bottom:1px solid rgba(120,100,80,0.12);position:sticky;top:0;z-index:100; }
.header-inner { max-width:760px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:20px; }
.back-btn { display:flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;color:#2C2416;border:1.5px solid rgba(120,100,80,0.35);border-radius:10px;font-family:'Verdana','Geneva',sans-serif;font-size:.875rem;font-weight:bold;cursor:pointer;flex-shrink:0;transition:all .15s; }
.back-btn:hover { background:rgba(184,50,50,.06);color:#B83232;border-color:rgba(184,50,50,.3); }
.pips-wrap { display:flex;gap:6px;flex:1;justify-content:center; }
.pip { height:6px;border-radius:999px;background:rgba(120,100,80,.15);transition:all .3s;width:28px; }
.pip--current { background:#2C2416;width:36px; }
.pip--correct { background:#1A7A46; }
.pip--wrong   { background:#B83232; }
.q-counter { display:flex;align-items:baseline;gap:3px;flex-shrink:0; }
.q-cur { font-family:'Georgia','Times New Roman',serif;font-size:1.1rem;font-weight:bold;color:#2C2416; }
.q-sep { color:#9C8E80; }
.q-tot { font-size:.9rem;color:#6B5E4E; }
.quiz-body { flex:1;display:flex;align-items:flex-start;justify-content:center;padding:36px 24px 60px; }
.quiz-title-card { display:flex;align-items:center;gap:14px;padding:18px 22px;background:#FDFBF8;border:1px solid rgba(79,70,229,.2);border-left:4px solid #5C4FE0;border-radius:14px; }
.quiz-title-icon { width:42px;height:42px;border-radius:12px;background:rgba(79,70,229,.1);border:1px solid rgba(79,70,229,.2);display:flex;align-items:center;justify-content:center;color:#5C4FE0;flex-shrink:0; }
.quiz-title-label { font-size:.72rem;font-weight:700;color:#9C8E80;text-transform:uppercase;letter-spacing:.06em;margin:0 0 3px; }
.quiz-title-name  { font-family:'Georgia','Times New Roman',serif;font-size:1.2rem;font-weight:bold;color:#2C2416;margin:0; }
.quiz-wrap { width:100%;max-width:1200px;display:flex;flex-direction:column;gap:20px; }
.question-card { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:18px;padding:32px;outline:none; }
.q-badge { display:inline-flex;padding:4px 14px;background:rgba(79,70,229,.15);border:1px solid rgba(79,70,229,.3);color:#5C4FE0;border-radius:999px;font-size:.78rem;font-weight:bold;margin-bottom:16px; }
.q-text  { font-family:'Georgia','Times New Roman',serif;font-size:1.5rem;font-weight:bold;color:#2C2416;margin:0;line-height:1.4; }
.feedback-banner { display:flex;align-items:flex-start;gap:14px;border-radius:18px;padding:16px 20px;border:1px solid; }
.feedback-banner--correct { background:rgba(74,222,128,.08);border-color:rgba(74,222,128,.25); }
.feedback-banner--wrong   { background:rgba(248,113,113,.08);border-color:rgba(248,113,113,.25); }
.fb-content { flex:1; }
.fb-title { display:block;font-size:.95rem;font-weight:bold;margin-bottom:4px; }
.feedback-banner--correct .fb-title { color:#1A7A46; }
.feedback-banner--wrong   .fb-title { color:#B83232; }
.fb-expl { margin:0;font-size:.85rem;color:#6B5E4E;line-height:1.5; }
.feedback-slide-enter-active { animation:fb-in .3s cubic-bezier(.34,1.56,.64,1) }
.feedback-slide-leave-active { animation:fb-in .2s ease reverse }
@keyframes fb-in { from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none} }
.answers-fieldset { border:none;padding:0;margin:0; }
.answers-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.answer-btn { width:100%;padding:18px 20px;background:#FDFBF8;color:#2C2416;border:1.5px solid rgba(120,100,80,0.12);border-radius:14px;font-family:'Verdana','Geneva',sans-serif;font-size:.95rem;cursor:pointer;text-align:left;display:flex;align-items:center;gap:14px;transition:all .15s;min-height:72px; }
.answer-btn:hover:not(:disabled) { border-color:rgba(79,70,229,.5);background:rgba(79,70,229,.04); }
.answer-btn:disabled { cursor:not-allowed; }
.answer-btn--selected { border-color:#5C4FE0;background:rgba(79,70,229,.08); }
.answer-btn--correct  { border-color:rgba(74,222,128,.5);background:rgba(74,222,128,.08); }
.answer-btn--wrong    { border-color:rgba(248,113,113,.5);background:rgba(248,113,113,.08); }
.answer-btn--dim      { opacity:.4; }
.ans-letter { width:36px;height:36px;border-radius:10px;background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:.9rem;flex-shrink:0; }
.answer-btn--correct .ans-letter { background:rgba(74,222,128,.2);border-color:rgba(74,222,128,.4);color:#1A7A46; }
.answer-btn--wrong   .ans-letter { background:rgba(248,113,113,.2);border-color:rgba(248,113,113,.4);color:#B83232; }
.ans-text      { flex:1;line-height:1.4; }
.ans-indicator { margin-left:auto;flex-shrink:0; }
.quiz-nav { display:flex;justify-content:flex-end; }
.nav-btn { display:flex;align-items:center;gap:10px;padding:15px 28px;border:none;border-radius:18px;font-family:'Verdana','Geneva',sans-serif;font-size:.95rem;font-weight:bold;cursor:pointer;transition:all .2s; }
.nav-btn--next   { background:#FDFBF8;color:#2C2416;border:1px solid rgba(120,100,80,0.12); }
.nav-btn--next:hover   { transform:translateX(4px); }
.nav-btn--finish { background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#FFF;box-shadow:0 8px 24px rgba(79,70,229,.3); }
.nav-btn--finish:hover { transform:translateY(-2px); }
.nav-appear-enter-active { animation:nav-in .3s cubic-bezier(.34,1.56,.64,1) }
@keyframes nav-in { from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none} }
.kbd-hint { text-align:center;font-size:.78rem;color:#9C8E80;display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin:0; }
kbd { display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);border-radius:6px;font-family:'Verdana','Geneva',sans-serif;font-size:.75rem;font-weight:bold; }
@media(max-width:600px) { .answers-grid{grid-template-columns:1fr;} .q-text{font-size:1.2rem;} .quiz-body{padding:20px 16px 40px;} }
</style>