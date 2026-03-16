<template>
  <div :class="['bv-page']">

    <BlindTopbar
      :supervisor-mode="supervisorMode"
      @toggle-supervisor="toggleSupervisor"
      @logout="handleLogout"
    />

    <div class="bv-body">

      <!-- PANEL GAUCHE -->
      <aside class="bv-panel">

        <!-- Profil + pts -->
        <div class="profile-row">
          <div class="avatar">{{ initials }}</div>
          <div>
            <p class="profile-name">{{ auth.user?.name }}</p>
            <p class="profile-role">Quiz</p>
          </div>
          <div class="pts-pill" :style="{ borderColor: points.currentLevel.color }">
            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" :style="{ color: points.currentLevel.color }">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {{ points.totalPoints }}
          </div>
        </div>

        <!-- Niveau -->
        <div class="level-row">
          <span class="level-name" :style="{ color: points.currentLevel.color }">{{ points.currentLevel.name }}</span>
          <span class="level-next" v-if="points.nextLevel">+{{ points.pointsToNextLevel }} → {{ points.nextLevel.name }}</span>
        </div>
        <div class="level-bar"><div class="level-fill"></div></div>

        <!-- Indicateur vocal -->
        <div :class="['voice-indicator', {
          'vi--speaking':  voice.isSpeaking.value,
          'vi--listening': voice.isListening.value && !supervisorMode
        }]">
          <span class="vi-dot"></span>
          <span class="vi-label">
            {{ voice.isSpeaking.value ? 'Parle...' : (voice.isListening.value && !supervisorMode) ? 'Écoute...' : 'En attente' }}
          </span>
          <button v-if="supervisorMode && voice.isSpeaking.value" class="vi-stop" @click="voice.stop()">■</button>
        </div>

        <div class="tr-block tr--app">
          <div class="tr-label">Dit</div>
          <p class="tr-text">{{ voice.lastSpoken.value || '—' }}</p>
        </div>
        <div class="tr-block tr--student" v-if="!supervisorMode">
          <div class="tr-label">Entendu</div>
          <p class="tr-text">{{ voice.lastHeard.value || '—' }}</p>
        </div>

        <!-- Progression quiz -->
        <div class="monitor-block">
          <div class="monitor-title">Progression</div>
          <div class="quiz-score-row">
            <span class="qs-cur">Q {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <span class="qs-score">Score : {{ score }} / {{ currentIndex }}</span>
          </div>
          <div class="pips-row" role="group" aria-label="Questions">
            <div v-for="(q, i) in questions" :key="i"
              :class="['pip', {
                'pip--current': i === currentIndex,
                'pip--correct': answers[i] !== undefined && answers[i] === q.correctIndex,
                'pip--wrong':   answers[i] !== undefined && answers[i] !== q.correctIndex
              }]">
              <svg v-if="answers[i] !== undefined && answers[i] === q.correctIndex" viewBox="0 0 24 24" fill="none" width="10" height="10"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
              <svg v-else-if="answers[i] !== undefined && answers[i] !== q.correctIndex" viewBox="0 0 24 24" fill="none" width="10" height="10"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
              <span v-else-if="i === currentIndex">▶</span>
              <span v-else>{{ i + 1 }}</span>
            </div>
          </div>
        </div>

        <!-- Question + options dans le panel -->
        <div class="monitor-block">
          <div class="monitor-title">Question en cours</div>
          <p class="current-q-text">{{ questions[currentIndex]?.text }}</p>
          <ul class="current-opts">
            <li v-for="(opt, i) in questions[currentIndex]?.options" :key="i"
              :class="['opt-item', {
                'opt-item--correct':  quizEnded && i === questions[currentIndex]?.correctIndex,
                'opt-item--selected': answers[currentIndex] === i,
              }]">
              <span class="opt-letter">{{ ['A','B','C','D'][i] }}</span>
              <span>{{ opt }}</span>
              <svg v-if="answers[currentIndex] === i && answers[currentIndex] === questions[currentIndex]?.correctIndex"
                viewBox="0 0 24 24" fill="none" width="12" height="12" class="opt-icon">
                <path d="M20 6L9 17l-5-5" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="answers[currentIndex] === i && answers[currentIndex] !== questions[currentIndex]?.correctIndex"
                viewBox="0 0 24 24" fill="none" width="12" height="12" class="opt-icon">
                <path d="M18 6L6 18M6 6l12 12" stroke="var(--red)" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </li>
          </ul>

          <!-- Boutons réponse rapide — mode surveillant -->
          <div v-if="supervisorMode && answers[currentIndex] === undefined && !quizEnded" class="sv-answer-btns">
            <button v-for="(opt, i) in questions[currentIndex]?.options" :key="i"
              class="sv-ans-btn" @click="svAnswer(i)" type="button">
              {{ ['A','B','C','D'][i] }}
            </button>
          </div>
          <div v-if="supervisorMode && answers[currentIndex] !== undefined && !quizEnded" class="sv-next-wrap">
            <button class="sv-next-btn" @click="svNext" type="button">Question suivante →</button>
          </div>
        </div>

        <!-- Commandes vocales (mode vocal seulement) -->
        <div v-if="!supervisorMode" class="monitor-block">
          <div class="monitor-title">Commandes</div>
          <div class="cmd-list">
            <div v-for="c in activeCommands" :key="c.say" class="cmd-row">
              <kbd class="cmd-key">« {{ c.say }} »</kbd>
              <span class="cmd-action">{{ c.action }}</span>
            </div>
          </div>
        </div>

        <!-- Actions bas panel -->
        <div class="panel-actions">
          <button v-if="!supervisorMode" class="pa-btn pa-btn--repeat" @click="poserQuestion" type="button">Répéter</button>
          <button class="pa-btn pa-btn--quit" @click="goBack" type="button">Quitter</button>
        </div>

      </aside>

      <!-- ÉCRAN ÉLÈVE (côté droit) -->
      <main class="bv-student" aria-live="polite" role="status">
        <div class="ss-orb ss-orb--1"></div>
        <div class="ss-orb ss-orb--2"></div>

        <div :class="['vv', {
          'vv--speaking':  voice.isSpeaking.value,
          'vv--listening': voice.isListening.value && !supervisorMode
        }]">
          <div class="vv-ring r3"></div>
          <div class="vv-ring r2"></div>
          <div class="vv-ring r1"></div>
          <div class="vv-core">
            <svg v-if="voice.isListening.value && !supervisorMode" viewBox="0 0 24 24" fill="none" width="30" height="30">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="white" stroke-width="2"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" width="30" height="30">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="white" stroke-width="2" stroke-linejoin="round"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <!-- Score final -->
        <div v-if="quizEnded" class="ss-final">
          <span class="ss-score">{{ score }}/{{ questions.length }}</span>
          <span class="ss-mention">{{ scoreMention }}</span>
        </div>

        <p class="ss-status">
          {{ (!supervisorMode && voice.isListening.value) ? 'Parlez maintenant' : voice.isSpeaking.value ? 'Écoutez…' : '' }}
        </p>

        <div class="ss-pts">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {{ points.totalPoints }} pts · {{ points.currentLevel.name }}
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore }     from '@/stores/auth'
import { usePointsStore }   from '@/stores/points'
import { useThemeStore }    from '@/stores/theme'
import { useVoiceEngine }   from '@/composables/useVoiceEngine'
import { useProgressStore } from '@/stores/progress'

import BlindTopbar          from '@/components/eleve/BlindTopbar.vue'

const router   = useRouter()
const route    = useRoute()
const auth     = useAuthStore()
const points   = usePointsStore()
const theme    = useThemeStore()

const voice    = useVoiceEngine()
const progress = useProgressStore()

const subjectId = route.params.subjectId
const lessonId  = route.params.lessonId
const apiCours = computed(() =>
  auth.user?.classe?.enseignant?.cours?.find(
    c => String(c.id) === String(lessonId)
  )
)

function apiQuizToQuestions(cours) {
  if (!cours?.quizzes?.length) return []
  const quiz = cours.quizzes[0]
  if (!quiz?.questions?.length) return []
  return quiz.questions.map(q => ({
    text:         q.question,
    options:      q.reponses.map(r => r.reponse),
    correctIndex: q.reponses.findIndex(r => r.is_correct == 1 || r.is_correct === true),
    explanation:  '',
  }))
}

const questions = ref([])

onMounted(() => {
  const apiQuestions = apiQuizToQuestions(apiCours.value)
  questions.value = apiQuestions.length ? apiQuestions : []
  voice.reset()
  if (!supervisorMode.value) setTimeout(poserQuestion, 600)
})

const initials = computed(() =>
  (auth.user?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
)
const score = computed(() =>
  answers.value.filter((a, i) => a === questions.value[i]?.correctIndex).length
)
const scoreMention = computed(() => {
  const pct = Math.round(score.value / questions.value.length * 100)
  return pct === 100 ? 'Parfait ! 🎉' : pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bien joué !' : 'Continuez !'
})

const activeCommands = ref([
  { say:'A / B / C / D', action:'Répondre'  },
  { say:'répète',        action:'Réécouter' },
  { say:'quitter',       action:'Quitter'   },
])

// ── Boucle principale quiz ────────────────────────────────
async function lancerQuiz() {
  while (true) {
    if (quizEnded.value) return

    const q    = questions.value[currentIndex.value]
    const opts = q.options.map((o, i) => `${['A','B','C','D'][i]} : ${o}`).join('. ')

    await voice.speak(
      `Question ${currentIndex.value + 1} sur ${questions.value.length}. ${q.text}. ${opts}. Dites A, B, C ou D.`
    )
    await delay(700)

    let answerIndex = null
    while (answerIndex === null) {
      if (quizEnded.value) return

      const result = await voice.listen({
        'a|alpha':           'a',
        'b|bé|beta':         'b',
        'c|cé|se|charlie':   'c',
        'd|dé|de|delta':     'd',
        'repete|répète':     'repete',
        'quitter|stop':      'quitter',
      }, 10000)

      const cmd = result?.action

      if (cmd === 'a') { answerIndex = 0; break }
      if (cmd === 'b') { answerIndex = 1; break }
      if (cmd === 'c') { answerIndex = 2; break }
      if (cmd === 'd') { answerIndex = 3; break }

      if (cmd === 'repete') {
        await voice.speak(`${q.text}. ${opts}`)
        await delay(700)
        continue
      }

      if (cmd === 'quitter') {
        await voice.speak('Voulez-vous vraiment quitter ? Dites oui ou non.')
        await delay(700)
        const conf = await voice.listen({ 'oui|quitter': 'oui', 'non|rester': 'non' }, 6000)
        if (conf?.action === 'oui') { goBack(); return }
        await voice.speak(`${q.text}. ${opts}. Dites A, B, C ou D.`)
        await delay(700)
        continue
      }

      // Non compris
      const entendu = result?.transcript ? `« ${result.transcript} »` : ''
      await voice.speak(`Je n'ai pas compris ${entendu}. Dites A, B, C ou D.`)
      await delay(700)
    }

    if (answerIndex === null) continue

    const correct = answerIndex === q.correctIndex
    answers.value[currentIndex.value] = answerIndex
    if (correct) points.addPoints('CORRECT_ANSWER')

    const feedback = correct
      ? `Bonne réponse ! ${q.explanation || ''}`
      : `Mauvaise réponse. La bonne réponse était ${['A','B','C','D'][q.correctIndex]} : ${q.options[q.correctIndex]}. ${q.explanation || ''}`

    await voice.speak(feedback)
    await delay(500)

    if (currentIndex.value === questions.value.length - 1) {
      await terminerQuiz()
      return
    }

    await voice.speak('Dites suite pour la question suivante ou répète pour réécouter.')
    await delay(700)
    const nav = await voice.listen({
      'suite|oui|continuer|suivant': 'suite',
      'repete|répète|non':           'repete',
    }, 8000)

    if (nav?.action === 'repete') continue
    currentIndex.value++
  }
}

async function poserQuestion() {
  await lancerQuiz()
}

async function terminerQuiz() {
  quizEnded.value = true
  points.addPoints('QUIZ_COMPLETED')
  if (score.value === questions.value.length) points.addPoints('QUIZ_PERFECT')
  setTimeout(() => points.clearPending?.(), 4000)
  progress.saveQuizScore(subjectId, lessonId, score.value, questions.value.length)

  const pct     = Math.round(score.value / questions.value.length * 100)
  const mention = pct === 100 ? 'Score parfait !' : pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bien joué !' : 'Continuez vos efforts.'

  await voice.speak(
    `Quiz terminé ! ${score.value} bonnes réponses sur ${questions.value.length}. ${pct} pourcent. ${mention}`
  )
  await delay(700)
  const nav = await voice.listen({ 'retour|cours': 'retour', 'repete|répète': 'repete' }, 8000)
  if (nav?.action === 'repete') {
    await voice.speak(`${score.value} sur ${questions.value.length}. ${mention}`)
    await delay(500)
  }
  goBack()
}

// ── Mode surveillant ──────────────────────────────────────
async function svAnswer(index) {
  if (answers.value[currentIndex.value] !== undefined) return
  const q       = questions.value[currentIndex.value]
  const correct = index === q.correctIndex
  answers.value[currentIndex.value] = index
  if (correct) points.addPoints('CORRECT_ANSWER')
  const feedback = correct
    ? `Bonne réponse ! ${q.explanation || ''}`
    : `Mauvaise réponse. La bonne réponse était ${['A','B','C','D'][q.correctIndex]}. ${q.explanation || ''}`
  await voice.speak(feedback)
  if (currentIndex.value === questions.value.length - 1) {
    quizEnded.value = true
    points.addPoints('QUIZ_COMPLETED')
    if (score.value === questions.value.length) points.addPoints('QUIZ_PERFECT')
    progress.saveQuizScore(subjectId, lessonId, score.value, questions.value.length)
    await voice.speak(`Quiz terminé ! ${score.value} sur ${questions.value.length}. ${scoreMention.value}`)
  }
}

function svNext() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}

// ── Navigation ────────────────────────────────────────────
function goBack() {
  voice.stop()
  progress.saveQuizScore(subjectId, lessonId, score.value, questions.value.length)
  router.push({ name: 'BlindCourses', params: { subjectId } })
}

function handleLogout() {
  voice.stop()
  auth.logoutApi()
  router.push({ name: 'EleveLogin' })
}

onMounted(() => {
  voice.reset()
  if (!supervisorMode.value) setTimeout(poserQuestion, 600)
})
onUnmounted(() => voice.stop())
</script>

<style scoped>

.bv-page {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-b);
  display: flex;
  flex-direction: column;
}
.bv-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  flex: 1;
  height: calc(100vh - 52px);
  overflow: hidden;
}

.bv-panel {
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  overflow-y: auto;
}

.profile-row { display:flex;align-items:center;gap:9px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px; }
.avatar { width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--accent),#7C3AED);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:.8rem;color:#FFF;flex-shrink:0; }
.profile-name { font-weight:bold;font-size:.78rem;margin:0 0 2px; }
.profile-role { font-size:.65rem;color:var(--text3);margin:0; }
.pts-pill { display:flex;align-items:center;gap:4px;margin-left:auto;padding:3px 8px;border:1px solid;border-radius:999px;font-size:.72rem;font-weight:bold;flex-shrink:0; }

.level-row  { display:flex;justify-content:space-between; }
.level-name { font-size:.76rem;font-weight:bold; }
.level-next { font-size:.68rem;color:var(--text3); }
.level-bar  { height:4px;background:var(--border2);border-radius:999px;overflow:hidden; }
.level-fill { height:100%;border-radius:999px;transition:width .6s; }

.voice-indicator { display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px 12px; }
.vi-dot { width:8px;height:8px;border-radius:50%;background:var(--text3);flex-shrink:0; }
.vi--speaking .vi-dot  { background:var(--accent);animation:pulse .9s infinite; }
.vi--listening .vi-dot { background:var(--green);animation:pulse .5s infinite; }
.vi-label { font-size:.78rem;font-weight:bold;flex:1; }
.vi-stop  { padding:3px 7px;border-radius:5px;background:var(--red-bg);color:var(--red);border:1px solid var(--red-border);font-size:.7rem;cursor:pointer; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.2} }

.tr-block { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:9px 11px;border-left:3px solid; }
.tr--app     { border-left-color:var(--accent); }
.tr--student { border-left-color:var(--green); }
.tr-label { font-size:.64rem;font-weight:bold;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px; }
.tr-text  { font-size:.78rem;margin:0;line-height:1.5;font-style:italic; }

.monitor-block { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:11px; }
.monitor-title { font-size:.67rem;font-weight:bold;color:var(--text2);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px; }

.quiz-score-row { display:flex;justify-content:space-between;margin-bottom:8px; }
.qs-cur   { font-size:.78rem;font-weight:bold; }
.qs-score { font-size:.75rem;color:var(--text2); }

.pips-row { display:flex;gap:5px;flex-wrap:wrap; }
.pip { width:28px;height:28px;border-radius:7px;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.68rem;color:var(--text3);transition:all .2s; }
.pip--current { background:var(--accent-bg);border-color:var(--accent-border);color:var(--accent); }
.pip--correct { background:var(--green-bg);border-color:var(--green-border);color:var(--green); }
.pip--wrong   { background:var(--red-bg);border-color:var(--red-border);color:var(--red); }

.current-q-text { font-family:var(--font-d);font-size:.88rem;font-weight:bold;margin:0 0 9px;line-height:1.5; }
.current-opts { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px; }
.opt-item { display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:8px;background:var(--surface);font-size:.77rem;color:var(--text2);border:1px solid transparent;transition:all .15s; }
.opt-item--correct  { background:var(--green-bg);border-color:var(--green-border);color:var(--green); }
.opt-item--selected { background:var(--accent-bg);border-color:var(--accent-border);color:var(--text); }
.opt-letter { font-weight:bold;color:var(--accent);min-width:14px;flex-shrink:0; }
.opt-icon   { margin-left:auto;flex-shrink:0; }

.sv-answer-btns { display:flex;gap:5px;margin-top:9px; }
.sv-ans-btn { flex:1;padding:7px;border-radius:7px;background:var(--accent-bg);border:1px solid var(--accent-border);color:var(--accent);font-weight:bold;font-size:.82rem;cursor:pointer;transition:all .15s;font-family:var(--font-b); }
.sv-ans-btn:hover { background:var(--accent);color:#FFF; }
.sv-next-wrap { margin-top:8px; }
.sv-next-btn { width:100%;padding:8px;border-radius:8px;background:var(--accent);color:#FFF;border:none;font-weight:bold;font-size:.78rem;cursor:pointer;font-family:var(--font-b); }
.sv-next-btn:hover { filter:brightness(1.1); }

.cmd-list { display:flex;flex-direction:column;gap:5px; }
.cmd-row  { display:flex;align-items:center;gap:6px; }
.cmd-key  { padding:2px 6px;background:var(--surface);border:1px solid var(--border);border-radius:5px;font-size:.67rem;color:#F59E0B; }
.cmd-action { font-size:.7rem;color:var(--text3); }

.panel-actions { display:flex;gap:6px;margin-top:auto; }
.pa-btn { flex:1;display:flex;align-items:center;justify-content:center;padding:8px;border-radius:9px;font-family:var(--font-b);font-size:.73rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.pa-btn--repeat { background:var(--surface2);color:var(--text2);border:1px solid var(--border); }
.pa-btn--repeat:hover { color:var(--text); }
.pa-btn--quit   { background:var(--red-bg);color:var(--red);border:1px solid var(--red-border); }

.bv-student {
  position: relative;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: var(--bg2);
  gap: 18px; padding: 40px; overflow: hidden;
}
.ss-orb { position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none; }
.ss-orb--1 { width:360px;height:360px;background:var(--accent);opacity:.09;top:-80px;left:-80px; }
.ss-orb--2 { width:260px;height:260px;background:#7C3AED;opacity:.07;bottom:-60px;right:-60px; }

.vv { position:relative;width:150px;height:150px;display:flex;align-items:center;justify-content:center; }
.vv-ring { position:absolute;border-radius:50%;border:1.5px solid rgba(255,255,255,.05); }
.r1{width:150px;height:150px} .r2{width:108px;height:108px} .r3{width:70px;height:70px}
.vv-core { width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;z-index:1;transition:all .3s; }
.vv--speaking .vv-ring  { border-color:rgba(79,70,229,.25);animation:ripple 2s ease-out infinite; }
.vv--speaking .r2{animation-delay:.35s} .vv--speaking .r3{animation-delay:.7s}
.vv--speaking .vv-core  { background:rgba(79,70,229,.18);border-color:rgba(79,70,229,.4);box-shadow:0 0 28px rgba(79,70,229,.25); }
.vv--listening .vv-ring { border-color:rgba(74,222,128,.25);animation:ripple 1.1s ease-out infinite; }
.vv--listening .r2{animation-delay:.2s} .vv--listening .r3{animation-delay:.4s}
.vv--listening .vv-core { background:rgba(74,222,128,.12);border-color:rgba(74,222,128,.4);box-shadow:0 0 28px rgba(74,222,128,.2); }
@keyframes ripple { 0%{transform:scale(.88);opacity:.9}100%{transform:scale(1.2);opacity:0} }

.ss-final  { text-align:center;display:flex;flex-direction:column;gap:4px; }
.ss-score  { font-family:var(--font-d);font-size:3.5rem;font-weight:bold;color:var(--text);line-height:1; }
.ss-mention{ font-size:.8rem;color:var(--text2);text-transform:uppercase;letter-spacing:.1em; }
.ss-status { font-size:.78rem;color:var(--text3);letter-spacing:.08em;text-transform:uppercase;min-height:1.3em; }
.ss-pts { display:flex;align-items:center;gap:6px;padding:6px 14px;background:var(--accent-bg);border:1px solid var(--accent-border);border-radius:999px;font-size:.76rem;font-weight:bold;color:var(--accent);position:absolute;bottom:24px; }

@media(max-width:900px) {
  .bv-body { grid-template-columns:1fr;height:auto; }
  .bv-student { min-height:200px; }
  .bv-panel { border-right:none;border-bottom:1px solid var(--border); }
}
</style>