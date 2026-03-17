<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import { useVoiceEngine } from '@/composables/useVoiceEngine'
import BlindTopbar from '@/components/eleve/BlindTopbar.vue'

const router = useRouter()
const route  = useRoute()
const voice  = useVoiceEngine()

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

const supervisorMode = ref(false)

function toggleSupervisor() {
  supervisorMode.value = !supervisorMode.value
  voice.stop()
}

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
    options:      (q.reponses || []).map(r => r.name || r.reponse || r.text || ''),
    correctIndex: (q.reponses || []).findIndex(r => r.status === 'correct' || r.is_correct || r.correct),
    explanation:  q.explication || '',
  }))
})

const currentIndex = ref(0)
const answers      = ref([])
const quizEnded    = ref(false)

const score = computed(() =>
  answers.value.filter((a, i) => a === questions.value[i]?.correctIndex).length
)

const scoreMention = computed(() => {
  if (!questions.value.length) return ''
  const pct = Math.round(score.value / questions.value.length * 100)
  return pct === 100 ? 'Score parfait !' : pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bien joué !' : 'Continuez !'
})

const nomEleve = computed(() => eleve.value?.prenom || eleve.value?.name || 'élève')

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

async function lancerQuiz() {
  if (!questions.value.length) {
    await voice.speak('Aucune question disponible pour ce quiz.')
    goBack()
    return
  }
  while (true) {
    if (quizEnded.value) return
    const q    = questions.value[currentIndex.value]
    const opts = q.options.map((o, i) => `${['A','B','C','D'][i]} : ${o}`).join('. ')
    await voice.speak(`Question ${currentIndex.value + 1} sur ${questions.value.length}. ${q.text}. ${opts}. Dites A, B, C ou D.`)
    await delay(700)

    let answerIndex = null
    while (answerIndex === null) {
      if (quizEnded.value) return
      const result = await voice.listen({
        'a|alpha':         'a',
        'b|bé|beta':       'b',
        'c|cé|se|charlie': 'c',
        'd|dé|delta':      'd',
        'repete|répète':   'repete',
        'quitter|stop':    'quitter',
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
        await voice.speak('Voulez-vous quitter ? Dites oui ou non.')
        const conf = await voice.listen({ 'oui': 'oui', 'non': 'non' }, 6000)
        if (conf?.action === 'oui') { goBack(); return }
        await voice.speak(`${q.text}. ${opts}. Dites A, B, C ou D.`)
        continue
      }
      await voice.speak(`Je n'ai pas compris. Dites A, B, C ou D.`)
      await delay(700)
    }

    if (answerIndex === null) continue
    const correct = answerIndex === q.correctIndex
    answers.value[currentIndex.value] = answerIndex

    const feedback = correct
      ? `Bonne réponse !`
      : `Mauvaise réponse. La bonne réponse était ${['A','B','C','D'][q.correctIndex]} : ${q.options[q.correctIndex]}.`
    await voice.speak(feedback)
    await delay(500)

    if (currentIndex.value === questions.value.length - 1) {
      await terminerQuiz()
      return
    }

    await voice.speak('Dites suite pour continuer.')
    await delay(700)
    const nav = await voice.listen({ 'suite|oui|continuer|suivant': 'suite', 'repete|répète': 'repete' }, 8000)
    if (nav?.action === 'repete') continue
    currentIndex.value++
  }
}

async function terminerQuiz() {
  quizEnded.value = true
  const pct = Math.round(score.value / questions.value.length * 100)
  await voice.speak(`Quiz terminé ! ${score.value} bonnes réponses sur ${questions.value.length}. ${pct} pourcent. ${scoreMention.value}`)
  await delay(700)
  const nav = await voice.listen({ 'retour|cours': 'retour', 'repete|répète': 'repete' }, 8000)
  if (nav?.action === 'repete') await voice.speak(`${score.value} sur ${questions.value.length}. ${scoreMention.value}`)
  goBack()
}

// Mode surveillant
async function svAnswer(index) {
  if (answers.value[currentIndex.value] !== undefined) return
  const q = questions.value[currentIndex.value]
  answers.value[currentIndex.value] = index
  const correct = index === q.correctIndex
  const feedback = correct
    ? 'Bonne réponse !'
    : `Mauvaise réponse. La bonne réponse était ${['A','B','C','D'][q.correctIndex]}.`
  await voice.speak(feedback)
  if (currentIndex.value === questions.value.length - 1) {
    quizEnded.value = true
    await voice.speak(`Quiz terminé ! ${score.value} sur ${questions.value.length}. ${scoreMention.value}`)
  }
}

function svNext() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}

function goBack() {
  voice.stop()
  router.push({ name: 'BlindCourses', params: { subjectId } })
}

async function handleLogout() {
  voice.stop()
  try { await apiPost('eleve/logout') } catch {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  localStorage.removeItem('eleve')
  router.push({ name: 'EleveLogin' })
}

onMounted(async () => {
  voice.reset()
  await loadData()
  if (!supervisorMode.value) setTimeout(lancerQuiz, 600)
})
onUnmounted(() => voice.stop())
</script>

<template>
  <div class="bv-page">
    <BlindTopbar :supervisor-mode="supervisorMode" @toggle-supervisor="toggleSupervisor" @logout="handleLogout" />

    <div class="bv-body">
      <aside class="bv-panel">
        <div :class="['voice-indicator', { 'vi--speaking': voice.isSpeaking.value, 'vi--listening': voice.isListening.value && !supervisorMode }]">
          <span class="vi-dot"></span>
          <span class="vi-label">{{ voice.isSpeaking.value ? 'Parle...' : voice.isListening.value && !supervisorMode ? 'Écoute...' : 'En attente' }}</span>
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

        <div class="monitor-block">
          <div class="monitor-title">Progression</div>
          <div class="quiz-score-row">
            <span class="qs-cur">Q {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <span class="qs-score">Score : {{ score }} / {{ currentIndex }}</span>
          </div>
          <div class="pips-row">
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

        <!-- Question + options -->
        <div class="monitor-block" v-if="questions.length">
          <div class="monitor-title">Question en cours</div>
          <p class="current-q-text">{{ questions[currentIndex]?.text }}</p>
          <ul class="current-opts">
            <li v-for="(opt, i) in questions[currentIndex]?.options" :key="i"
              :class="['opt-item', {
                'opt-item--correct':  answers[currentIndex] !== undefined && i === questions[currentIndex]?.correctIndex,
                'opt-item--selected': answers[currentIndex] === i,
              }]">
              <span class="opt-letter">{{ ['A','B','C','D'][i] }}</span>
              <span>{{ opt }}</span>
            </li>
          </ul>

          <!-- Boutons réponse superviseur -->
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

        <div v-if="!supervisorMode" class="monitor-block">
          <div class="monitor-title">Commandes</div>
          <div class="cmd-list">
            <div class="cmd-row"><kbd class="cmd-key">« A B C D »</kbd><span class="cmd-action">Répondre</span></div>
            <div class="cmd-row"><kbd class="cmd-key">« répète »</kbd><span class="cmd-action">Réécouter</span></div>
            <div class="cmd-row"><kbd class="cmd-key">« quitter »</kbd><span class="cmd-action">Quitter</span></div>
          </div>
        </div>

        <div class="panel-actions">
          <button v-if="!supervisorMode" class="pa-btn pa-btn--repeat" @click="lancerQuiz" type="button">Répéter</button>
          <button class="pa-btn pa-btn--quit" @click="goBack" type="button">Quitter</button>
        </div>
      </aside>

      <main class="bv-student" aria-live="polite">
        <div class="ss-orb ss-orb--1"></div>
        <div class="ss-orb ss-orb--2"></div>
        <div :class="['vv', { 'vv--speaking': voice.isSpeaking.value, 'vv--listening': voice.isListening.value && !supervisorMode }]">
          <div class="vv-ring r3"></div><div class="vv-ring r2"></div><div class="vv-ring r1"></div>
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

        <div v-if="quizEnded" class="ss-final">
          <span class="ss-score">{{ score }}/{{ questions.length }}</span>
          <span class="ss-mention">{{ scoreMention }}</span>
        </div>

        <p class="ss-status">{{ !supervisorMode && voice.isListening.value ? 'Parlez maintenant' : voice.isSpeaking.value ? 'Écoutez…' : '' }}</p>
      </main>
    </div>
  </div>
</template>

<style scoped>
.bv-page { min-height:100vh;background:var(--bg,#07080F);color:var(--text,#F0F2FF);font-family:var(--font-b,'Verdana',sans-serif);display:flex;flex-direction:column; }
.bv-body { display:grid;grid-template-columns:280px 1fr;flex:1;height:calc(100vh - 52px);overflow:hidden; }
.bv-panel { background:var(--surface,#13161F);border-right:1px solid var(--border,rgba(255,255,255,0.07));padding:16px;display:flex;flex-direction:column;gap:11px;overflow-y:auto; }
.voice-indicator { display:flex;align-items:center;gap:8px;background:var(--surface2,#1A1E2B);border:1px solid var(--border);border-radius:10px;padding:10px 12px; }
.vi-dot { width:8px;height:8px;border-radius:50%;background:var(--text3,#535878);flex-shrink:0; }
.vi--speaking .vi-dot  { background:var(--accent,#4F46E5);animation:pulse .9s infinite; }
.vi--listening .vi-dot { background:var(--green,#4ADE80);animation:pulse .5s infinite; }
.vi-label { font-size:.78rem;font-weight:bold;flex:1; }
.vi-stop  { padding:3px 7px;border-radius:5px;background:var(--red-bg);color:var(--red,#F87171);border:1px solid var(--red-border);font-size:.7rem;cursor:pointer; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.2} }
.tr-block { background:var(--surface2,#1A1E2B);border:1px solid var(--border);border-radius:10px;padding:9px 11px;border-left:3px solid; }
.tr--app  { border-left-color:var(--accent,#4F46E5); }
.tr--student { border-left-color:var(--green,#4ADE80); }
.tr-label { font-size:.64rem;font-weight:bold;color:var(--text2,#8B91B0);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px; }
.tr-text  { font-size:.78rem;margin:0;line-height:1.5;font-style:italic; }
.monitor-block { background:var(--surface2,#1A1E2B);border:1px solid var(--border);border-radius:10px;padding:11px; }
.monitor-title { font-size:.67rem;font-weight:bold;color:var(--text2,#8B91B0);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px; }
.quiz-score-row { display:flex;justify-content:space-between;margin-bottom:8px; }
.qs-cur,.qs-score { font-size:.78rem;font-weight:bold; }
.qs-score { color:var(--text2,#8B91B0); }
.pips-row { display:flex;gap:5px;flex-wrap:wrap;margin-bottom:4px; }
.pip { width:28px;height:28px;border-radius:7px;background:var(--surface,#13161F);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.68rem;color:var(--text3,#535878); }
.pip--current { background:var(--accent-bg,rgba(79,70,229,0.12));border-color:var(--accent-border,rgba(79,70,229,0.3));color:var(--accent,#4F46E5); }
.pip--correct { background:var(--green-bg,rgba(74,222,128,0.08));border-color:var(--green-border,rgba(74,222,128,0.25));color:var(--green,#4ADE80); }
.pip--wrong   { background:var(--red-bg,rgba(248,113,113,0.08));border-color:var(--red-border,rgba(248,113,113,0.25));color:var(--red,#F87171); }
.current-q-text { font-family:var(--font-d,'Georgia',serif);font-size:.88rem;font-weight:bold;margin:0 0 9px;line-height:1.5; }
.current-opts { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px; }
.opt-item { display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:8px;background:var(--surface,#13161F);font-size:.77rem;color:var(--text2,#8B91B0);border:1px solid transparent; }
.opt-item--correct  { background:var(--green-bg,rgba(74,222,128,0.08));border-color:var(--green-border,rgba(74,222,128,0.25));color:var(--green,#4ADE80); }
.opt-item--selected { background:var(--accent-bg,rgba(79,70,229,0.12));border-color:var(--accent-border,rgba(79,70,229,0.3));color:var(--text,#F0F2FF); }
.opt-letter { font-weight:bold;color:var(--accent,#4F46E5);min-width:14px;flex-shrink:0; }
.sv-answer-btns { display:flex;gap:5px;margin-top:9px; }
.sv-ans-btn { flex:1;padding:7px;border-radius:7px;background:var(--accent-bg,rgba(79,70,229,0.12));border:1px solid var(--accent-border,rgba(79,70,229,0.3));color:var(--accent,#4F46E5);font-weight:bold;font-size:.82rem;cursor:pointer;transition:all .15s;font-family:var(--font-b); }
.sv-ans-btn:hover { background:var(--accent,#4F46E5);color:#FFF; }
.sv-next-wrap { margin-top:8px; }
.sv-next-btn { width:100%;padding:8px;border-radius:8px;background:var(--accent,#4F46E5);color:#FFF;border:none;font-weight:bold;font-size:.78rem;cursor:pointer;font-family:var(--font-b); }
.cmd-list { display:flex;flex-direction:column;gap:5px; }
.cmd-row  { display:flex;align-items:center;gap:6px; }
.cmd-key  { padding:2px 6px;background:var(--surface,#13161F);border:1px solid var(--border);border-radius:5px;font-size:.67rem;color:#F59E0B; }
.cmd-action { font-size:.7rem;color:var(--text3,#535878); }
.panel-actions { display:flex;gap:6px;margin-top:auto; }
.pa-btn { flex:1;display:flex;align-items:center;justify-content:center;padding:8px;border-radius:9px;font-family:var(--font-b);font-size:.73rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.pa-btn--repeat { background:var(--surface2,#1A1E2B);color:var(--text2,#8B91B0);border:1px solid var(--border); }
.pa-btn--quit   { background:var(--red-bg,rgba(248,113,113,0.08));color:var(--red,#F87171);border:1px solid var(--red-border,rgba(248,113,113,0.25)); }
.bv-student { position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg2,#0E1019);gap:18px;padding:40px;overflow:hidden; }
.ss-orb { position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none; }
.ss-orb--1 { width:360px;height:360px;background:var(--accent,#4F46E5);opacity:.09;top:-80px;left:-80px; }
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
.ss-score  { font-family:var(--font-d,'Georgia',serif);font-size:3.5rem;font-weight:bold;line-height:1; }
.ss-mention{ font-size:.8rem;color:var(--text2,#8B91B0);text-transform:uppercase;letter-spacing:.1em; }
.ss-status { font-size:.78rem;color:var(--text3,#535878);letter-spacing:.08em;text-transform:uppercase;min-height:1.3em; }
@media(max-width:900px) { .bv-body{grid-template-columns:1fr;height:auto;} .bv-student{min-height:200px;} .bv-panel{border-right:none;border-bottom:1px solid var(--border);} }
</style>