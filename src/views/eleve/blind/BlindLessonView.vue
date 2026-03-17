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

const supervisorMode    = ref(false)
const isReading         = ref(false)
const currentBlockIndex = ref(0)

// ── Audio — un seul ref, pas de double ───────────────────
const audioEl      = ref(null)
const audioPlaying = ref(false)
const audioEnded   = ref(false)
const showAudioCtrl = ref(false) // pour le surveillant

function toggleSupervisor() {
  supervisorMode.value = !supervisorMode.value
  voice.stop()
  voice.reset()
  isReading.value = false
  if (!supervisorMode.value) setTimeout(startLesson, 400)
}

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'
function fullUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return BASE_URL + url
}

const apiCours    = computed(() =>
  (eleve.value?.classe?.enseignant?.cours ?? []).find(c => String(c.id) === lessonId)
)
const lessonTitle = computed(() => apiCours.value?.title || apiCours.value?.titre || 'Cours')
const audioUrl    = computed(() => fullUrl((apiCours.value?.medias || []).find(m => m.type === 'audio')?.url || ''))
const hasAudio    = computed(() => !!audioUrl.value)

function htmlToVocalBlocks(html) {
  if (!html) return []
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 5)
  return sentences.map(s => ({ type: 'paragraph', text: s }))
}

const lesson = computed(() => {
  const c = apiCours.value
  if (!c) return { title: '', content: [] }
  const blocks = []
  blocks.push({ type: 'intro', text: `Cours : ${lessonTitle.value}.` })
  if (c.contenu) {
    htmlToVocalBlocks(c.contenu).forEach(b => blocks.push(b))
  } else {
    blocks.push({ type: 'paragraph', text: 'Contenu non disponible.' })
  }
  blocks.push({ type: 'outro', text: 'Fin du cours. Dites quiz pour le quiz, ou retour pour revenir.' })
  return { title: lessonTitle.value, content: blocks }
})

const lessonProgress = computed(() =>
  lesson.value.content.length
    ? Math.round((currentBlockIndex.value / lesson.value.content.length) * 100)
    : 0
)

// ── Démarrage leçon ───────────────────────────────────────
async function startLesson() {
  if (supervisorMode.value) return
  if (hasAudio.value) {
    await lancerAudio()
  } else {
    // Lire directement sans attendre commande vocale
    await lireBloc()
  }
}

// ── Audio ─────────────────────────────────────────────────
async function lancerAudio() {
  if (supervisorMode.value) return
  // Attendre que audioEl soit monté
  await new Promise(r => setTimeout(r, 200))
  if (!audioEl.value) {
    // Fallback TTS si l'audio n'est pas disponible
    await lireBloc()
    return
  }
  try {
    audioEnded.value   = false
    audioPlaying.value = false
    audioEl.value.src  = audioUrl.value
    audioEl.value.load()
    await audioEl.value.play()
    audioPlaying.value = true
    await ecouterPendantAudio()
  } catch(e) {
    console.warn('[BlindLesson] audio play error:', e)
    await lireBloc()
  }
}

async function ecouterPendantAudio() {
  while (audioPlaying.value && !audioEnded.value) {
    if (supervisorMode.value) return
    const result = await voice.listen({
      'pause|stop':          'pause',
      'reprendre|continuer': 'reprendre',
      'quiz':                'quiz',
      'retour':              'retour',
    }, 15000)
    if (supervisorMode.value) return
    const cmd = result?.action
    if (cmd === 'pause')     { audioEl.value?.pause(); audioPlaying.value = false }
    if (cmd === 'reprendre') { audioEl.value?.play();  audioPlaying.value = true }
    if (cmd === 'quiz')      { audioEl.value?.pause(); goToQuiz(); return }
    if (cmd === 'retour')    { audioEl.value?.pause(); goBack();   return }
  }
  if (audioEnded.value) {
    await voice.speak('Fin du cours audio. Dites quiz pour le quiz, ou retour.')
    if (supervisorMode.value) return
    const r = await voice.listen({ 'quiz': 'quiz', 'retour': 'retour' }, 8000)
    if (r?.action === 'quiz') goToQuiz()
    else goBack()
  }
}

// ── TTS bloc par bloc ─────────────────────────────────────
async function lireBloc() {
  if (supervisorMode.value) return
  while (true) {
    if (supervisorMode.value) return
    const block  = lesson.value.content[currentBlockIndex.value]
    if (!block) return
    const isLast = currentBlockIndex.value === lesson.value.content.length - 1

    await voice.speak(block.text)
    if (supervisorMode.value) return

    // Sur le dernier bloc, passer directement au quiz
    if (isLast) {
      await voice.speak('Fin du cours. Dites quiz pour commencer le quiz, ou retour.')
      if (supervisorMode.value) return
      const r = await voice.listen({
        'quiz|commencer': 'quiz',
        'retour':         'retour',
        'repete|répète':  'repete',
      }, 10000)
      if (r?.action === 'quiz')   { goToQuiz(); return }
      if (r?.action === 'retour') { goBack();   return }
      continue // répète le dernier bloc
    }

    const result = await voice.listen({
      'suite|suivant|oui|continuer': 'suite',
      'repete|répète':               'repete',
      'pause':                       'pause',
      'quiz':                        'quiz',
      'retour':                      'retour',
    }, 12000)

    if (supervisorMode.value) return
    const cmd = result?.action

    if (cmd === 'suite')  { currentBlockIndex.value++; continue }
    if (cmd === 'repete') { continue }
    if (cmd === 'quiz')   { goToQuiz(); return }
    if (cmd === 'retour') { goBack();   return }
    if (cmd === 'pause') {
      await voice.speak('Pause. Dites reprise pour continuer.')
      await voice.listen({ 'reprise|continuer|suite': 'suite', 'retour': 'retour' }, 30000)
      continue
    }
    // Pas compris — passer au suivant automatiquement
    currentBlockIndex.value++
  }
}

// ── Contrôles surveillant ─────────────────────────────────
async function svPlay() {
  if (isReading.value) return
  isReading.value = true
  voice.reset()
  await voice.speak(lesson.value.content[currentBlockIndex.value]?.text || '')
  isReading.value = false
}
function svPause() { voice.stop(); isReading.value = false }
function svPrev()  { if (currentBlockIndex.value > 0) currentBlockIndex.value-- }
function svNext()  { if (currentBlockIndex.value < lesson.value.content.length - 1) currentBlockIndex.value++ }

function goToQuiz() { voice.stop(); router.push({ name: 'BlindQuiz',   params: { subjectId, lessonId } }) }
function goBack()   { voice.stop(); router.push({ name: 'BlindCourses', params: { subjectId } }) }

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
  if (!supervisorMode.value) setTimeout(startLesson, 800)
})
onUnmounted(() => voice.stop())
</script>

<template>
  <div class="bv-page">
    <BlindTopbar :supervisor-mode="supervisorMode" @toggle-supervisor="toggleSupervisor" @logout="handleLogout" />

    <div class="bv-body">
      <aside class="bv-panel">

        <!-- Indicateur vocal -->
        <div :class="['voice-indicator', { 'vi--speaking': voice.isSpeaking.value, 'vi--listening': voice.isListening.value && !supervisorMode }]">
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

        <!-- Progression -->
        <div class="monitor-block">
          <div class="monitor-title">Progression</div>
          <div class="prog-row">
            <span class="prog-text">Bloc {{ currentBlockIndex + 1 }} / {{ lesson.content.length }}</span>
            <span class="prog-pct">{{ lessonProgress }}%</span>
          </div>
          <div class="prog-bar"><div class="prog-fill" :style="{ width: lessonProgress + '%' }"></div></div>
          <ul class="blocks-list">
            <li v-for="(b, i) in lesson.content" :key="i"
              :class="['bl-item', {
                'bl-item--current':   i === currentBlockIndex,
                'bl-item--done':      i < currentBlockIndex,
                'bl-item--clickable': supervisorMode
              }]"
              @click="supervisorMode && (currentBlockIndex = i)">
              <span class="bl-status">
                <svg v-if="i < currentBlockIndex" viewBox="0 0 24 24" fill="none" width="10" height="10"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                <span v-else-if="i === currentBlockIndex" class="bl-playing">▶</span>
                <span v-else class="bl-dot">○</span>
              </span>
              <span class="bl-text">{{ b.text?.slice(0, 48) }}{{ b.text?.length > 48 ? '…' : '' }}</span>
            </li>
          </ul>
        </div>

        <!-- Lecteur audio (un seul élément audio) -->
        <div class="monitor-block" v-if="hasAudio">
          <div class="monitor-title">Fichier audio</div>
          <audio
            ref="audioEl"
            :src="audioUrl"
            :controls="supervisorMode"
            class="audio-sv-player"
            :style="{ display: supervisorMode ? 'block' : 'none' }"
            @play="audioPlaying = true"
            @pause="audioPlaying = false"
            @ended="audioEnded = true; audioPlaying = false"
          />
          <p v-if="!supervisorMode" class="audio-hint">Audio en lecture automatique</p>
        </div>

        <!-- Contrôles surveillant -->
        <div v-if="supervisorMode" class="sv-controls">
          <div class="sv-ctrl-row">
            <button class="sv-btn sv-btn--play"  @click="svPlay"  :disabled="isReading">▶ Lire</button>
            <button class="sv-btn sv-btn--pause" @click="svPause" :disabled="!isReading">⏸ Pause</button>
          </div>
          <div class="sv-ctrl-row">
            <button class="sv-btn sv-btn--nav" @click="svPrev" :disabled="currentBlockIndex === 0 || isReading">← Préc.</button>
            <button class="sv-btn sv-btn--nav" @click="svNext" :disabled="currentBlockIndex >= lesson.content.length - 1 || isReading">Suiv. →</button>
          </div>
        </div>

        <!-- Commandes vocales -->
        <div v-if="!supervisorMode" class="monitor-block">
          <div class="monitor-title">Commandes</div>
          <div class="cmd-list">
            <div v-if="hasAudio">
              <div class="cmd-row"><kbd class="cmd-key">« pause »</kbd><span class="cmd-action">Mettre en pause</span></div>
              <div class="cmd-row"><kbd class="cmd-key">« reprendre »</kbd><span class="cmd-action">Reprendre</span></div>
            </div>
            <div v-else>
              <div class="cmd-row"><kbd class="cmd-key">« suite »</kbd><span class="cmd-action">Bloc suivant</span></div>
              <div class="cmd-row"><kbd class="cmd-key">« répète »</kbd><span class="cmd-action">Réécouter</span></div>
            </div>
            <div class="cmd-row"><kbd class="cmd-key">« quiz »</kbd><span class="cmd-action">Démarrer le quiz</span></div>
            <div class="cmd-row"><kbd class="cmd-key">« retour »</kbd><span class="cmd-action">Retour aux cours</span></div>
          </div>
        </div>

        <div class="panel-actions">
          <button v-if="!supervisorMode" class="pa-btn pa-btn--repeat" @click="() => { voice.stop(); voice.reset(); startLesson() }">Répéter</button>
          <button class="pa-btn pa-btn--quiz" @click="goToQuiz">Quiz</button>
          <button class="pa-btn pa-btn--back" @click="goBack">Cours</button>
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

        <div class="ss-title">{{ lesson.title }}</div>

        <div class="ss-progress">
          <div class="ss-prog-bar"><div class="ss-prog-fill" :style="{ width: lessonProgress + '%' }"></div></div>
          <span class="ss-prog-pct">{{ lessonProgress }}%</span>
        </div>

        <p class="ss-status">
          {{ !supervisorMode && voice.isListening.value ? 'Parlez maintenant' : voice.isSpeaking.value ? 'Écoutez…' : 'En attente' }}
        </p>
      </main>
    </div>
  </div>
</template>

<style scoped>
.bv-page { min-height:100vh;background:var(--bg,#07080F);color:var(--text,#F0F2FF);font-family:var(--font-b,'Verdana',sans-serif);display:flex;flex-direction:column; }
.bv-body { display:grid;grid-template-columns:260px 1fr;flex:1;height:calc(100vh - 52px);overflow:hidden; }
.bv-panel { background:var(--surface,#13161F);border-right:1px solid var(--border,rgba(255,255,255,0.07));padding:16px;display:flex;flex-direction:column;gap:11px;overflow-y:auto; }
.voice-indicator { display:flex;align-items:center;gap:8px;background:var(--surface2,#1A1E2B);border:1px solid var(--border);border-radius:10px;padding:10px 12px; }
.vi-dot { width:8px;height:8px;border-radius:50%;background:var(--text3,#535878);flex-shrink:0; }
.vi--speaking .vi-dot  { background:var(--accent,#4F46E5);animation:pulse .9s infinite; }
.vi--listening .vi-dot { background:var(--green,#4ADE80);animation:pulse .5s infinite; }
.vi-label { font-size:.78rem;font-weight:bold;flex:1; }
.vi-stop  { padding:3px 7px;border-radius:5px;background:var(--red-bg,rgba(248,113,113,.1));color:var(--red,#F87171);border:1px solid var(--red-border,rgba(248,113,113,.25));font-size:.7rem;cursor:pointer; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.2} }
.tr-block { background:var(--surface2,#1A1E2B);border:1px solid var(--border);border-radius:10px;padding:9px 11px;border-left:3px solid; }
.tr--app  { border-left-color:var(--accent,#4F46E5); }
.tr--student { border-left-color:var(--green,#4ADE80); }
.tr-label { font-size:.64rem;font-weight:bold;color:var(--text2,#8B91B0);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px; }
.tr-text  { font-size:.78rem;margin:0;line-height:1.5;font-style:italic;color:var(--text,#F0F2FF); }
.monitor-block { background:var(--surface2,#1A1E2B);border:1px solid var(--border);border-radius:10px;padding:11px; }
.monitor-title { font-size:.67rem;font-weight:bold;color:var(--text2,#8B91B0);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px; }
.prog-row  { display:flex;justify-content:space-between;margin-bottom:5px; }
.prog-text,.prog-pct { font-size:.75rem;font-weight:bold; }
.prog-pct { color:var(--text2,#8B91B0); }
.prog-bar  { height:5px;background:var(--border2,rgba(255,255,255,.12));border-radius:999px;overflow:hidden;margin-bottom:9px; }
.prog-fill { height:100%;background:linear-gradient(90deg,var(--accent,#4F46E5),#7C3AED);border-radius:999px;transition:width .5s; }
.blocks-list { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:3px;max-height:150px;overflow-y:auto; }
.bl-item { display:flex;align-items:flex-start;gap:5px;padding:4px 7px;border-radius:6px;font-size:.73rem;color:var(--text2,#8B91B0);border:1px solid transparent; }
.bl-item--current { background:var(--accent-bg,rgba(79,70,229,.12));border-color:var(--accent-border,rgba(79,70,229,.3));color:var(--text,#F0F2FF); }
.bl-item--done    { color:var(--green,#4ADE80); }
.bl-item--clickable { cursor:pointer; }
.bl-item--clickable:hover { background:var(--surface,#13161F); }
.bl-status { flex-shrink:0;width:14px;text-align:center;padding-top:1px; }
.bl-playing { color:var(--accent,#4F46E5);font-size:.65rem; }
.bl-dot { color:var(--text3,#535878);font-size:.65rem; }
.bl-text { line-height:1.4; }
.audio-sv-player { width:100%;border-radius:8px;height:36px;margin-top:6px; }
.audio-hint { font-size:.72rem;color:var(--text3,#535878);margin:4px 0 0;font-style:italic; }
.sv-controls { background:var(--surface2,#1A1E2B);border:1px solid var(--border);border-radius:10px;padding:11px;display:flex;flex-direction:column;gap:7px; }
.sv-ctrl-row { display:flex;gap:6px; }
.sv-btn { display:flex;align-items:center;justify-content:center;gap:4px;padding:6px 10px;border-radius:7px;font-size:.74rem;font-weight:bold;cursor:pointer;border:1px solid transparent;transition:all .15s;font-family:var(--font-b,'Verdana',sans-serif);flex:1; }
.sv-btn:disabled { opacity:.4;cursor:not-allowed; }
.sv-btn--play  { background:var(--accent,#4F46E5);color:#FFF; }
.sv-btn--pause { background:var(--surface,#13161F);color:var(--text2,#8B91B0);border-color:var(--border); }
.sv-btn--nav   { background:transparent;color:var(--text2,#8B91B0);border-color:var(--border); }
.cmd-list { display:flex;flex-direction:column;gap:5px; }
.cmd-row  { display:flex;align-items:center;gap:6px; }
.cmd-key  { padding:2px 6px;background:var(--surface,#13161F);border:1px solid var(--border);border-radius:5px;font-size:.67rem;color:#F59E0B; }
.cmd-action { font-size:.7rem;color:var(--text3,#535878); }
.panel-actions { display:flex;gap:6px;margin-top:auto; }
.pa-btn { flex:1;display:flex;align-items:center;justify-content:center;padding:8px;border-radius:9px;font-family:var(--font-b,'Verdana',sans-serif);font-size:.73rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.pa-btn--repeat { background:var(--surface2,#1A1E2B);color:var(--text2,#8B91B0);border:1px solid var(--border); }
.pa-btn--quiz   { background:var(--green-bg,rgba(74,222,128,.08));color:var(--green,#4ADE80);border:1px solid var(--green-border,rgba(74,222,128,.25)); }
.pa-btn--back   { background:var(--accent-bg,rgba(79,70,229,.12));color:var(--accent,#4F46E5);border:1px solid var(--accent-border,rgba(79,70,229,.3)); }
.bv-student { position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg2,#0E1019);gap:20px;padding:40px;overflow:hidden; }
.ss-orb { position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none; }
.ss-orb--1 { width:360px;height:360px;background:var(--accent,#4F46E5);opacity:.1;top:-80px;left:-80px; }
.ss-orb--2 { width:260px;height:260px;background:#7C3AED;opacity:.08;bottom:-60px;right:-60px; }
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
.ss-title { font-family:'Georgia','Times New Roman',serif;font-size:1rem;font-weight:bold;color:var(--text,#F0F2FF);text-align:center;max-width:400px; }
.ss-progress { width:200px;display:flex;flex-direction:column;gap:5px;align-items:center; }
.ss-prog-bar  { width:100%;height:5px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden; }
.ss-prog-fill { height:100%;background:linear-gradient(90deg,var(--accent,#4F46E5),#7C3AED);border-radius:999px;transition:width .5s; }
.ss-prog-pct  { font-size:.72rem;color:var(--text3,#535878); }
.ss-status { font-size:.8rem;color:var(--text3,#535878);letter-spacing:.08em;text-transform:uppercase;min-height:1.3em; }
@media(max-width:900px) { .bv-body{grid-template-columns:1fr;height:auto;} .bv-student{min-height:220px;} .bv-panel{border-right:none;border-bottom:1px solid var(--border);} }
</style>