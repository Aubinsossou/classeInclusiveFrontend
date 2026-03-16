<template>
  <div :class="['app', adaptiveClasses]" :style="{background:'#F5F2ED',color:'#2C2416'}" role="main">
    <AppTopbar :page-title="pageTitle" @logout="handleLogout" />
    <a href="#quiz-question" class="skip-link">Aller à la question</a>

    <!-- Header -->
    <header class="quiz-header" role="banner">
      <div class="header-inner">
        <button class="back-btn" @click="confirmExit" type="button" aria-label="Quitter le quiz">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          Quitter
        </button>

        <!-- Pips progression -->
        <div class="pips-wrap" aria-label="Progression du quiz" role="group">
          <div v-for="(q, i) in questions" :key="i"
            :class="['pip', {
              'pip--current': i === currentIndex,
              'pip--correct': answers[i] !== undefined && answers[i] === q.correctIndex,
              'pip--wrong':   answers[i] !== undefined && answers[i] !== q.correctIndex,
            }]"
            :aria-label="pipLabel(i)" role="img"></div>
        </div>

        <div class="q-counter" aria-live="polite" aria-atomic="true">
          <span class="q-cur">{{ currentIndex + 1 }}</span>
          <span class="q-sep">/</span>
          <span class="q-tot">{{ questions.length }}</span>
        </div>
      </div>
    </header>

    <!-- Bouton lecture si aveugle -->
    <div v-if="auth.isBlind" class="speak-bar">
      <button class="speak-btn" @click="speakQuestion" type="button" aria-label="Lire la question">
        <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        Lire la question
      </button>
    </div>

    <!-- Contenu quiz -->
    <div class="quiz-body">
      <div class="quiz-wrap">

        <!-- Question -->
        <section class="question-card" id="quiz-question"
          role="region" aria-label="Question"
          aria-live="polite" aria-atomic="true" tabindex="-1">
          <div class="q-badge" aria-hidden="true">Question {{ currentIndex + 1 }}</div>
          <h1 class="q-text">{{ currentQuestion.text }}</h1>
          <div v-if="currentQuestion.hint" class="q-hint" role="note">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            {{ currentQuestion.hint }}
          </div>
        </section>

        <!-- Feedback -->
        <transition name="feedback-slide">
          <div v-if="feedbackState"
            :class="['feedback-banner', `feedback-banner--${feedbackState}`]"
            role="alert" aria-live="assertive" aria-atomic="true">
            <div class="fb-icon" aria-hidden="true">
              <svg v-if="feedbackState === 'correct'" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="rgba(74,222,128,.2)" stroke="#4ADE80" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="rgba(248,113,113,.2)" stroke="#F87171" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="#F87171" stroke-width="2.5" stroke-linecap="round"/></svg>
            </div>
            <div class="fb-content">
              <strong class="fb-title">{{ feedbackState === 'correct' ? 'Bonne réponse !' : 'Mauvaise réponse' }}</strong>
              <p v-if="feedbackState === 'wrong'" class="fb-expl">{{ currentQuestion.explanation }}</p>
            </div>
            <div v-if="feedbackState === 'correct'" class="fb-pts" aria-label="Points gagnés">+10 pts</div>
          </div>
        </transition>

        <!-- Réponses -->
        <fieldset class="answers-fieldset" :disabled="answerGiven" :aria-disabled="answerGiven">
          <legend class="sr-only">{{ currentQuestion.text }}</legend>
          <div :class="['answers-grid', auth.isLowVision ? 'answers-grid--single' : '']">
            <button
              v-for="(opt, i) in currentQuestion.options" :key="i"
              :class="['answer-btn', getAnswerClass(i)]"
              :disabled="answerGiven"
              :aria-pressed="selectedAnswer === i"
              :aria-label="answerLabel(opt, i)"
              @click="selectAnswer(i)"
              type="button">
              <span class="ans-letter" aria-hidden="true">{{ letters[i] }}</span>
              <span class="ans-text">{{ opt }}</span>
              <span class="ans-indicator" aria-hidden="true">
                <svg v-if="answerGiven && i === currentQuestion.correctIndex" viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M20 6L9 17l-5-5" stroke="#4ADE80" stroke-width="2.5" stroke-linecap="round"/></svg>
                <svg v-else-if="answerGiven && i === selectedAnswer && i !== currentQuestion.correctIndex" viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M18 6L6 18M6 6l12 12" stroke="#F87171" stroke-width="2.5" stroke-linecap="round"/></svg>
              </span>
            </button>
          </div>
        </fieldset>

        <!-- Navigation -->
        <div class="quiz-nav" role="group" aria-label="Navigation">
          <transition name="nav-appear">
            <button v-if="answerGiven && !isLast"
              class="nav-btn nav-btn--next"
              @click="nextQuestion"
              type="button"
              ref="nextBtn"
              aria-label="Question suivante">
              Question suivante
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
            </button>
            <button v-else-if="answerGiven && isLast"
              class="nav-btn nav-btn--finish"
              @click="finishQuiz"
              type="button"
              ref="nextBtn"
              aria-label="Voir mes résultats">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/></svg>
              Voir mes résultats
            </button>
          </transition>
        </div>

        <!-- Hint clavier -->
        <p class="kbd-hint" aria-hidden="true">
          <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> pour répondre
          <span v-if="answerGiven"> · <kbd>→</kbd> pour continuer</span>
        </p>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import AppTopbar from '@/components/eleve/AppTopbar.vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore }  from '@/stores/theme'
import { useAuthStore }   from '@/stores/auth'
import { usePointsStore }  from '@/stores/points'
import { useProgressStore } from '@/stores/progress'


const router = useRouter()
const auth   = useAuthStore()
const theme  = useThemeStore()

const route  = useRoute()
const pts      = usePointsStore()
const progress = useProgressStore()

const subjectId = route.params.subjectId
const lessonId  = route.params.lessonId

// ── Données API ──────────────────────────────────────────
const apiCours = computed(() =>
  auth.cours.find(c => String(c.id) === String(lessonId))
)

function apiQuizToQuestions(cours) {
  if (!cours?.quizzes?.length) return []
  const quiz = cours.quizzes[0]
  if (!quiz?.questions?.length) return []
  return quiz.questions.map(q => ({
    id:           q.id,
    text:         q.question || q.text || '',
    options:      (q.reponses || []).map(r => r.reponse || r.text || ''),
    correctIndex: (q.reponses || []).findIndex(r => r.is_correct || r.correct),
    explanation:  q.explication || '',
  }))
}

const letters      = ['A','B','C','D']
const currentIndex = ref(0)
const selectedAnswer = ref(null)
const answerGiven  = ref(false)
const feedbackState = ref(null)
const answers      = ref([])
const nextBtn      = ref(null)

const adaptiveClasses = computed(() => ({
  'mode-contrast':   auth.needsHighContrast,
  'mode-large-text': auth.needsLargeText,
}))
const pageTitle = computed(() => `Quiz — ${currentQuestion.value?.text?.slice(0, 30) || ''}`)

const questions = ref(apiQuizToQuestions(apiCours.value))

const currentQuestion = computed(() => questions.value[currentIndex.value])
const isLast          = computed(() => currentIndex.value === questions.value.length - 1)
const score           = computed(() => answers.value.filter((a,i) => a === questions.value[i]?.correctIndex).length)

function getAnswerClass(i) {
  if (!answerGiven.value) return selectedAnswer.value === i ? 'answer-btn--selected' : ''
  if (i === currentQuestion.value.correctIndex) return 'answer-btn--correct'
  if (i === selectedAnswer.value)               return 'answer-btn--wrong'
  return 'answer-btn--dim'
}

function answerLabel(opt, i) {
  const l = letters[i]
  if (!answerGiven.value) return `Réponse ${l} : ${opt}`
  if (i === currentQuestion.value.correctIndex) return `Réponse ${l} : ${opt}. Correcte.`
  if (i === selectedAnswer.value)               return `Réponse ${l} : ${opt}. Incorrecte.`
  return `Réponse ${l} : ${opt}`
}

function pipLabel(i) {
  if (i > currentIndex.value)  return `Question ${i+1} : non répondue`
  if (i === currentIndex.value) return `Question ${i+1} : en cours`
  return `Question ${i+1} : ${answers.value[i] === questions.value[i].correctIndex ? 'correcte' : 'incorrecte'}`
}

function selectAnswer(i) {
  if (answerGiven.value) return
  selectedAnswer.value = i
  answerGiven.value    = true
  answers.value[currentIndex.value] = i
  feedbackState.value = i === currentQuestion.value.correctIndex ? 'correct' : 'wrong'

  if (feedbackState.value === 'correct') pts.addPoints('CORRECT_ANSWER')

  if (auth.isBlind && 'speechSynthesis' in window) {
    const msg = feedbackState.value === 'correct' ? 'Bonne réponse !' : `Mauvaise réponse. ${currentQuestion.value.explanation}`
    const u = new SpeechSynthesisUtterance(msg); u.lang = 'fr-FR'
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
  }

  nextTick(() => { if (nextBtn.value) nextBtn.value.focus() })
}

function nextQuestion() {
  currentIndex.value++
  selectedAnswer.value = null
  answerGiven.value    = false
  feedbackState.value  = null
  nextTick(() => {
    document.getElementById('quiz-question')?.focus()
    if (auth.isBlind) speakQuestion()
  })
}

function finishQuiz() {
  pts.addPoints('QUIZ_COMPLETED')
  if (score.value === questions.value.length) pts.addPoints('QUIZ_PERFECT')
  setTimeout(() => pts.clearPending(), 4000)
  router.push({
    name: 'Result',
    params: { subjectId: route.params.subjectId, lessonId: route.params.lessonId },
    query:  { score: score.value, total: questions.value.length }
  })
}

function confirmExit() {
  if (confirm('Quitter le quiz ? La progression sera perdue.'))
    router.push({ name: 'Courses', params: { subjectId: route.params.subjectId } })
}

function speakQuestion() {
  if (!('speechSynthesis' in window)) return
  const q    = currentQuestion.value
  const opts = q.options.map((o,i) => `${letters[i]} : ${o}`).join('. ')
  const u = new SpeechSynthesisUtterance(`Question ${currentIndex.value + 1} : ${q.text}. ${opts}`)
  u.lang = 'fr-FR'; u.rate = 0.9
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u)
}

function handleKey(e) {
  if (['1','2','3','4'].includes(e.key) && !answerGiven.value) selectAnswer(parseInt(e.key)-1)
  if ((e.key === 'ArrowRight') && answerGiven.value) { isLast.value ? finishQuiz() : nextQuestion() }
}

function handleLogout() {
  voice.stop()
  auth.logoutApi()
  router.push({ name: 'EleveLogin' })
}
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
  --correct: #4ADE80;
  --wrong:   #F87171;
  --radius:  18px;
  --font-display:'Georgia','Times New Roman',serif;
  --font-body:'Verdana','Geneva',sans-serif;
  --focus-ring: 0 0 0 3px rgba(79,70,229,.6);
  min-height:100vh; background:#F5F2ED; font-family:'Verdana', 'Geneva', sans-serif; color:#2C2416;
  display:flex; flex-direction:column;
}
.app.mode-contrast  { --bg:#000;--surface:#0A0A0A;--text:#FFF;--text2:#DDD;--border:rgba(255,255,255,.2); }
.app.mode-large-text { font-size:1.1rem; }

.skip-link { position:absolute;top:-100px;left:16px;background:#5C4FE0;color:#FFF;padding:10px 18px;border-radius:8px;font-weight:bold;z-index:9999;text-decoration:none; }
.skip-link:focus { top:16px; }

/* Header */
.quiz-header { background:#FDFBF8;border-bottom:1px solid rgba(120,100,80,0.12);position:sticky;top:0;z-index:100; }
.header-inner { max-width:760px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:20px; }
.back-btn { display:flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;color:#6B5E4E;border:1px solid rgba(120,100,80,0.12);border-radius:10px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.875rem;cursor:pointer;flex-shrink:0;transition:all .15s; }
.back-btn:hover { color:#2C2416;border-color:rgba(255,255,255,.2); }
.back-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }

.pips-wrap { display:flex;gap:6px;flex:1;justify-content:center; }
.pip { height:6px;border-radius:999px;background:rgba(255,255,255,.1);transition:all .3s;width:28px; }
.pip--current { background:#2C2416;width:36px; }
.pip--correct { background:#1A7A46; }
.pip--wrong   { background:#B83232; }

.q-counter { display:flex;align-items:baseline;gap:3px;flex-shrink:0; }
.q-cur { font-family:'Georgia', 'Times New Roman', serif;font-size:1.1rem;font-weight:bold;color:#2C2416; }
.q-sep { color:#9C8E80; }
.q-tot { font-size:.9rem;color:#6B5E4E; }

/* Speak bar */
.speak-bar { background:rgba(245,158,11,.08);border-bottom:1px solid rgba(245,158,11,.2);padding:10px;display:flex;justify-content:center; }
.speak-btn { display:flex;align-items:center;gap:8px;padding:9px 20px;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);color:#F59E0B;border-radius:10px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.875rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.speak-btn:hover { background:rgba(245,158,11,.25); }
.speak-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(245,158,11,.4); }

/* Body */
.quiz-body { flex:1;display:flex;align-items:flex-start;justify-content:center;padding:36px 24px 60px; }
.quiz-wrap { width:100%;max-width:700px;display:flex;flex-direction:column;gap:20px; }

/* Question */
.question-card { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:18px;padding:32px;outline:none; }
.q-badge { display:inline-flex;padding:4px 14px;background:rgba(79,70,229,.15);border:1px solid rgba(79,70,229,.3);color:#5C4FE0;border-radius:999px;font-size:.78rem;font-weight:bold;margin-bottom:16px; }
.q-text  { font-family:'Georgia', 'Times New Roman', serif;font-size:1.5rem;font-weight:bold;color:#2C2416;margin:0;line-height:1.4; }
.q-hint  { display:flex;align-items:center;gap:6px;margin-top:14px;padding:10px 14px;background:rgba(255,255,255,.04);border-radius:8px;font-size:.82rem;color:#6B5E4E; }

/* Feedback */
.feedback-banner { display:flex;align-items:flex-start;gap:14px;border-radius:18px;padding:16px 20px;border:1px solid; }
.feedback-banner--correct { background:rgba(74,222,128,.08);border-color:rgba(74,222,128,.25); }
.feedback-banner--wrong   { background:rgba(248,113,113,.08);border-color:rgba(248,113,113,.25); }
.fb-content { flex:1; }
.fb-title { display:block;font-size:.95rem;font-weight:bold;margin-bottom:4px; }
.feedback-banner--correct .fb-title { color:#1A7A46; }
.feedback-banner--wrong   .fb-title { color:#B83232; }
.fb-expl  { margin:0;font-size:.85rem;color:#6B5E4E;line-height:1.5; }
.fb-pts   { padding:4px 12px;background:rgba(74,222,128,.15);border:1px solid rgba(74,222,128,.3);color:#1A7A46;border-radius:999px;font-size:.82rem;font-weight:bold;flex-shrink:0;align-self:center; }
.feedback-slide-enter-active { animation:fb-in .3s cubic-bezier(.34,1.56,.64,1) }
.feedback-slide-leave-active { animation:fb-in .2s ease reverse }
@keyframes fb-in { from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none} }

/* Réponses */
.answers-fieldset { border:none;padding:0;margin:0; }
.answers-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.answers-grid--single { grid-template-columns:1fr; }

.answer-btn {
  width:100%;padding:18px 20px;
  background:#FDFBF8;color:#2C2416;
  border:1.5px solid rgba(120,100,80,0.12);
  border-radius:14px;
  font-family:'Verdana', 'Geneva', sans-serif;font-size:.95rem;
  cursor:pointer;text-align:left;
  display:flex;align-items:center;gap:14px;
  transition:all .15s;
  min-height:72px;
  position:relative;overflow:hidden;
}
.answer-btn::before { content:'';position:absolute;inset:0;background:#5C4FE0;opacity:0;transition:opacity .15s; }
.answer-btn:hover:not(:disabled)::before { opacity:.04; }
.answer-btn:hover:not(:disabled) { border-color:rgba(79,70,229,.5); }
.answer-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.answer-btn:disabled { cursor:not-allowed; }

.answer-btn--selected { border-color:#5C4FE0;background:rgba(79,70,229,.08); }
.answer-btn--correct  { border-color:rgba(74,222,128,.5);background:rgba(74,222,128,.08); }
.answer-btn--wrong    { border-color:rgba(248,113,113,.5);background:rgba(248,113,113,.08); }
.answer-btn--dim      { opacity:.4; }

.ans-letter {
  width:36px;height:36px;border-radius:10px;
  background:rgba(120,100,80,0.06);border:1px solid rgba(120,100,80,0.12);
  display:flex;align-items:center;justify-content:center;
  font-weight:bold;font-size:.9rem;flex-shrink:0;
  transition:all .15s;
}
.answer-btn--correct .ans-letter { background:rgba(74,222,128,.2);border-color:rgba(74,222,128,.4);color:#1A7A46; }
.answer-btn--wrong   .ans-letter { background:rgba(248,113,113,.2);border-color:rgba(248,113,113,.4);color:#B83232; }
.ans-text      { flex:1;line-height:1.4; }
.ans-indicator { margin-left:auto;flex-shrink:0; }

/* Nav */
.quiz-nav { display:flex;justify-content:flex-end; }
.nav-btn { display:flex;align-items:center;gap:10px;padding:15px 28px;border:none;border-radius:18px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.95rem;font-weight:bold;cursor:pointer;transition:all .2s; }
.nav-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.nav-btn--next   { background:#FDFBF8;color:#2C2416;border:1px solid rgba(120,100,80,0.12); }
.nav-btn--next:hover   { background:rgba(120,100,80,0.06);transform:translateX(4px); }
.nav-btn--finish { background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#FFF;box-shadow:0 8px 24px rgba(79,70,229,.3); }
.nav-btn--finish:hover { transform:translateY(-2px);box-shadow:0 12px 32px rgba(79,70,229,.4); }
.nav-appear-enter-active { animation:nav-in .3s cubic-bezier(.34,1.56,.64,1) }
@keyframes nav-in { from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none} }

/* Kbd hint */
.kbd-hint { text-align:center;font-size:.78rem;color:#9C8E80;display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin:0; }
kbd { display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);border-radius:6px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.75rem;font-weight:bold;box-shadow:0 2px 0 rgba(0,0,0,.3); }

@media(max-width:600px) {
  .answers-grid { grid-template-columns:1fr; }
  .q-text { font-size:1.2rem; }
  .answer-btn { min-height:60px;padding:14px 16px; }
  .quiz-body { padding:20px 16px 40px; }
}

.theme-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
</style>