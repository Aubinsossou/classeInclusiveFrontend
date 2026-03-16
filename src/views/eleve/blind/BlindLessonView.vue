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

        <!-- Profil -->
        <div class="profile-row">
          <div class="avatar">{{ initials }}</div>
          <div>
            <p class="profile-name">{{ auth.user?.name }}</p>
            <p class="profile-role">{{ lesson.title }}</p>
          </div>
          <div class="pts-pill" :style="{ borderColor: points.currentLevel.color }">
            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" :style="{ color: points.currentLevel.color }"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {{ points.totalPoints }}
          </div>
        </div>

        <!-- Indicateur vocal -->
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

        <!-- Progression -->
        <div class="monitor-block">
          <div class="monitor-title">Progression</div>
          <div class="prog-row">
            <span class="prog-text">Bloc {{ currentBlockIndex + 1 }} / {{ lesson.content.length }}</span>
            <span class="prog-pct">{{ lessonProgress }}%</span>
          </div>
          <div class="prog-bar"><div class="prog-fill" :style="{ width: lessonProgress + '%' }"></div></div>

          <!-- Liste des blocs (cliquable en mode surveillant) -->
          <ul class="blocks-list">
            <li v-for="(b, i) in lesson.content" :key="i"
              :class="['bl-item',
                { 'bl-item--current': i === currentBlockIndex,
                  'bl-item--done': i < currentBlockIndex,
                  'bl-item--clickable': supervisorMode }]"
              @click="supervisorMode && svJumpToBlock(i)">
              <span class="bl-status">
                <svg v-if="i < currentBlockIndex" viewBox="0 0 24 24" fill="none" width="10" height="10"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                <span v-else-if="i === currentBlockIndex" class="bl-playing">▶</span>
                <span v-else class="bl-dot">○</span>
              </span>
              <span class="bl-text">{{ b.text?.slice(0, 48) }}{{ b.text?.length > 48 ? '…' : '' }}</span>
            </li>
          </ul>
        </div>

        <!-- Contrôles surveillant -->
        <div v-if="supervisorMode" class="sv-controls">
          <div class="sv-ctrl-title">Contrôles</div>
          <div class="sv-ctrl-row">
            <button class="sv-btn sv-btn--play" @click="svPlay" :disabled="isReading">
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {{ isReading ? 'Lecture…' : 'Lire' }}
            </button>
            <button class="sv-btn sv-btn--pause" @click="svPause" :disabled="!isReading">
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              Pause
            </button>
          </div>
          <div class="sv-ctrl-row">
            <button class="sv-btn sv-btn--nav" @click="svPrev" :disabled="currentBlockIndex === 0 || isReading">
              <svg viewBox="0 0 24 24" fill="none" width="11" height="11"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Préc.
            </button>
            <button class="sv-btn sv-btn--nav" @click="svNext" :disabled="currentBlockIndex >= lesson.content.length - 1 || isReading">
              Suiv.
              <svg viewBox="0 0 24 24" fill="none" width="11" height="11"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>

        <!-- Commandes vocales -->
        <div v-if="!supervisorMode" class="monitor-block">
          <div class="monitor-title">Commandes</div>
          <div class="cmd-list">
            <div v-for="c in activeCommands" :key="c.say" class="cmd-row">
              <kbd class="cmd-key">« {{ c.say }} »</kbd>
              <span class="cmd-action">{{ c.action }}</span>
            </div>
          </div>
        </div>

        <!-- Lecteur audio (mode surveillant) -->
        <div v-if="hasAudio && supervisorMode" class="audio-sv-block">
          <div class="monitor-title">Fichier audio</div>
          <audio
            ref="audioEl"
            :src="audioUrl"
            controls
            class="audio-sv-player"
            @play="audioPlaying = true"
            @pause="audioPlaying = false"
            @ended="audioEnded = true; audioPlaying = false"
          />
        </div>
        <!-- Audio caché pour mode vocal -->
        <audio v-else
          ref="audioEl"
          :src="audioUrl"
          @play="audioPlaying = true"
          @pause="audioPlaying = false"
          @ended="audioEnded = true; audioPlaying = false"
          style="display:none"
        />

        <!-- Actions bas -->
        <div class="panel-actions">
          <button v-if="!supervisorMode && !hasAudio" class="pa-btn pa-btn--repeat" @click="lireBloc">Répéter</button>
          <button class="pa-btn pa-btn--quiz" @click="goToQuiz">Quiz</button>
          <button class="pa-btn pa-btn--back" @click="goBack">Cours</button>
        </div>

      </aside>

      <!-- ÉCRAN ÉLÈVE -->
      <main class="bv-student" aria-live="polite" role="status">
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

        <div class="ss-progress">
          <div class="ss-prog-bar"><div class="ss-prog-fill" :style="{ width: lessonProgress + '%' }"></div></div>
          <span class="ss-prog-pct">{{ lessonProgress }}%</span>
        </div>

        <p class="ss-status">
          {{ !supervisorMode && voice.isListening.value ? 'Parlez maintenant' : voice.isSpeaking.value ? 'Écoutez…' : '' }}
        </p>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore }     from '@/stores/auth'
import { usePointsStore }   from '@/stores/points'
import { useVoiceEngine }   from '@/composables/useVoiceEngine'
import { useProgressStore } from '@/stores/progress'
import BlindTopbar          from '@/components/eleve/BlindTopbar.vue'

const router   = useRouter()
const route    = useRoute()
const auth     = useAuthStore()
const points   = usePointsStore()

const voice    = useVoiceEngine()
const progress = useProgressStore()

const subjectId = route.params.subjectId
const lessonId  = route.params.lessonId

const supervisorMode = ref(false)
const isReading      = ref(false)

// ── Lecteur audio natif ───────────────────────────────────
const audioEl       = ref(null)
const audioPlaying  = ref(false)
const audioEnded    = ref(false)

function toggleSupervisor() {
  supervisorMode.value = !supervisorMode.value
  voice.stop()
  isReading.value = false
  if (!supervisorMode.value) setTimeout(startLesson, 400)
}

const currentBlockIndex = ref(0)
const initials = computed(() =>
  (auth.user?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
)
const lessonProgress = computed(() =>
  lesson.value.content.length
    ? Math.round((currentBlockIndex.value / lesson.value.content.length) * 100)
    : 0
)

// ── Données API réelles ───────────────────────────────────
const apiCours = computed(() =>
  auth.user?.classe?.enseignant?.cours?.find(
    c => String(c.id) === String(lessonId)
  )
)

const lessonTitle = computed(() => apiCours.value?.title || 'Cours')
const audioUrl    = computed(() =>
  auth.mediaUrl((apiCours.value?.medias || []).find(m => m.type === 'audio')?.url || '')
)
const hasAudio    = computed(() => !!audioUrl.value)

// Convertir le contenu HTML de l'API en blocs vocaux
function htmlToVocalBlocks(html) {
  if (!html) return []
  // Supprimer les balises HTML et découper en paragraphes
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 5)
  return sentences.map(s => ({ type: 'paragraph', text: s }))
}

function toVocalBlocks(apiCours) {
  const result = []
  result.push({
    type: 'intro',
    text: `Bienvenue dans le cours : ${lessonTitle.value}. Dites suite pour commencer.`
  })

  if (apiCours?.contenu) {
    const blocks = htmlToVocalBlocks(apiCours.contenu)
    blocks.forEach((b, i) => {
      result.push({ type: 'paragraph', text: b.text })
    })
  } else {
    result.push({ type: 'paragraph', text: 'Contenu du cours non disponible.' })
  }

  result.push({
    type: 'outro',
    text: 'Fin du cours. Dites quiz pour le quiz, ou retour pour revenir.'
  })
  return result
}

const lesson = ref({
  id:      lessonId,
  title:   lessonTitle.value,
  content: [],
})

// Initialiser les données une fois auth.user disponible
onMounted(() => {
  lesson.value.title   = lessonTitle.value
  lesson.value.content = toVocalBlocks(apiCours.value)

  voice.reset()
  const total     = lesson.value.content.length
  const lastBlock = progress.getLastBlock(subjectId, lessonId)
  progress.startCourse(subjectId, lessonId, total)
  if (route.query.resume === '1' && lastBlock > 0) currentBlockIndex.value = lastBlock
  if (!supervisorMode.value) setTimeout(startLesson, 600)
})
onUnmounted(() => voice.stop())

const activeCommands = computed(() => hasAudio.value ? [
  { say:'pause',    action:'Mettre en pause'    },
  { say:'reprendre',action:'Reprendre la lecture'},
  { say:'quiz',     action:'Démarrer le quiz'   },
  { say:'retour',   action:'Retour aux cours'   },
] : [
  { say:'suite',  action:'Bloc suivant'      },
  { say:'répète', action:'Réécouter ce bloc' },
  { say:'pause',  action:'Mettre en pause'   },
  { say:'quiz',   action:'Démarrer le quiz'  },
  { say:'retour', action:'Retour aux cours'  },
])

async function startLesson() {
  if (hasAudio.value) {
    // Mode audio : lancer directement sans annonce TTS
    if (supervisorMode.value) return
    await lancerAudio()
  } else {
    // Mode TTS : lire le texte bloc par bloc
    await voice.speak(
      `Cours : ${lesson.value.title}. ${lesson.value.content.length} parties. Dites suite pour commencer.`
    )
    if (supervisorMode.value) return
    const result = await voice.listen({
      'suite|commencer|oui|ok': 'suite',
      'retour|non': 'retour',
    })
    if (result?.action === 'retour') { goBack(); return }
    await lireBloc()
  }
}

async function lancerAudio() {
  if (!audioEl.value) return
  audioEl.value.src = audioUrl.value
  audioEl.value.load()
  try {
    // Arrêter la synthèse vocale avant de lancer l'audio
    voice.stop()
    await audioEl.value.play()
    audioPlaying.value = true
    // Écouter les commandes pendant la lecture audio
    await ecouterPendantAudio()
  } catch (e) {
    await voice.speak('Impossible de lire le fichier audio.')
    await lireBloc()
  }
}

async function ecouterPendantAudio() {
  while (audioPlaying.value && !audioEnded.value) {
    if (supervisorMode.value) return
    const result = await voice.listen({
      'pause|stop|arrêter': 'pause',
      'reprendre|continuer|play': 'reprendre',
      'quiz':   'quiz',
      'retour': 'retour',
    }, 15000)
    if (!result?.action) continue
    const cmd = result.action
    if (cmd === 'pause')    { audioEl.value?.pause(); audioPlaying.value = false }
    if (cmd === 'reprendre') { audioEl.value?.play(); audioPlaying.value = true }
    if (cmd === 'quiz')     { audioEl.value?.pause(); progress.completeCourse(subjectId, lessonId); goToQuiz(); return }
    if (cmd === 'retour')   { audioEl.value?.pause(); goBack(); return }
  }
  // Fin audio
  if (audioEnded.value) {
    progress.completeCourse(subjectId, lessonId)
    await voice.speak('Fin du cours audio. Dites quiz pour le quiz, ou retour.')
    if (supervisorMode.value) return
    const r = await voice.listen({
      'quiz': 'quiz',
      'retour': 'retour',
    })
    if (r?.action === 'quiz') goToQuiz()
    else goBack()
  }
}

async function lireBloc() {
  if (supervisorMode.value) return
  while (true) {
    if (supervisorMode.value) return
    progress.saveBlock(subjectId, lessonId, currentBlockIndex.value)
    const block  = lesson.value.content[currentBlockIndex.value]
    const isLast = currentBlockIndex.value === lesson.value.content.length - 1
    await voice.speak((block.type === 'keypoint' ? 'Point important. ' : '') + block.text)
    if (supervisorMode.value) return
    const result = await voice.listen({
      'suite|suivant|oui|continuer': 'suite',
      'repete|répète|répéter|repeter': 'repete',
      'pause': 'pause',
      'quiz|commencer le quiz': 'quiz',
      'retour': 'retour',
    })
    if (supervisorMode.value) return
    const cmd = result?.action
    if (cmd === 'suite' && !isLast) { currentBlockIndex.value++; continue }
    if (cmd === 'repete') continue
    if (cmd === 'pause') { await attendrePause(); continue }
    if (cmd === 'quiz' || (isLast && cmd === 'suite')) {
      progress.completeCourse(subjectId, lessonId)
      goToQuiz(); return
    }
    if (cmd === 'retour') { goBack(); return }
    await voice.speak("Je n'ai pas compris. Dites suite, répète, pause, quiz ou retour.")
  }
}

async function attendrePause() {
  await voice.speak('Pause. Dites reprise pour continuer.')
  if (supervisorMode.value) return
  const result = await voice.listen({
    'reprise|continuer|suite|oui': 'reprise',
    'retour': 'retour',
  })
  if (result?.action === 'retour') goBack()
}

async function svPlay() {
  if (isReading.value) return
  isReading.value = true
  progress.saveBlock(subjectId, lessonId, currentBlockIndex.value)
  await voice.speak(lesson.value.content[currentBlockIndex.value].text)
  isReading.value = false
}

function svPause() { voice.stop(); isReading.value = false }
function svPrev()  { if (currentBlockIndex.value > 0) currentBlockIndex.value-- }
function svNext()  { if (currentBlockIndex.value < lesson.value.content.length - 1) currentBlockIndex.value++ }

async function svJumpToBlock(i) {
  voice.stop(); isReading.value = false
  currentBlockIndex.value = i
  await voice.speak(lesson.value.content[i].text)
}

function goToQuiz() { voice.stop(); router.push({ name: 'BlindQuiz', params: { subjectId, lessonId } }) }
function goBack()   { voice.stop(); router.push({ name: 'BlindCourses', params: { subjectId } }) }
function handleLogout() { voice.stop(); auth.logoutApi(); router.push({ name: 'EleveLogin' }) }
</script>

<style scoped>

.audio-sv-block { padding: 8px 0; }
.audio-sv-player { width: 100%; border-radius: 8px; height: 36px; }

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
  grid-template-columns: 260px 1fr;
  flex: 1;
  height: calc(100vh - 52px);
  overflow: hidden;
}

/* PANEL */
.bv-panel { background:var(--surface);border-right:1px solid var(--border);padding:16px;display:flex;flex-direction:column;gap:11px;overflow-y:auto; }

.profile-row { display:flex;align-items:center;gap:9px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px; }
.avatar { width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--accent),#7C3AED);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:.8rem;color:#FFF;flex-shrink:0; }
.profile-name { font-weight:bold;font-size:.78rem;margin:0 0 2px; }
.profile-role { font-size:.65rem;color:var(--text3);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px; }
.pts-pill { display:flex;align-items:center;gap:4px;margin-left:auto;padding:3px 8px;border:1px solid;border-radius:999px;font-size:.72rem;font-weight:bold;flex-shrink:0; }

.voice-indicator { display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px 12px; }
.vi-dot { width:8px;height:8px;border-radius:50%;background:var(--text3);flex-shrink:0; }
.vi--speaking .vi-dot  { background:var(--accent);animation:pulse .9s infinite; }
.vi--listening .vi-dot { background:var(--green);animation:pulse .5s infinite; }
.vi-label { font-size:.78rem;font-weight:bold;flex:1; }
.vi-stop { padding:3px 7px;border-radius:5px;background:var(--red-bg);color:var(--red);border:1px solid var(--red-border);font-size:.7rem;cursor:pointer; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.2} }

.tr-block { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:9px 11px;border-left:3px solid; }
.tr--app  { border-left-color:var(--accent); }
.tr--student { border-left-color:var(--green); }
.tr-label { font-size:.64rem;font-weight:bold;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px; }
.tr-text  { font-size:.78rem;margin:0;line-height:1.5;font-style:italic; }

.monitor-block { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:11px; }
.monitor-title { font-size:.67rem;font-weight:bold;color:var(--text2);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px; }

.prog-row  { display:flex;justify-content:space-between;margin-bottom:5px; }
.prog-text { font-size:.75rem;font-weight:bold; }
.prog-pct  { font-size:.75rem;color:var(--text2); }
.prog-bar  { height:5px;background:var(--border2);border-radius:999px;overflow:hidden;margin-bottom:9px; }
.prog-fill { height:100%;background:linear-gradient(90deg,var(--accent),#7C3AED);border-radius:999px;transition:width .5s; }

.blocks-list { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:3px;max-height:150px;overflow-y:auto; }
.bl-item { display:flex;align-items:flex-start;gap:5px;padding:4px 7px;border-radius:6px;font-size:.73rem;color:var(--text2);border:1px solid transparent; }
.bl-item--current { background:var(--accent-bg);border-color:var(--accent-border);color:var(--text); }
.bl-item--done    { color:var(--green); }
.bl-item--clickable { cursor:pointer; }
.bl-item--clickable:hover { background:var(--surface);border-color:var(--border2); }
.bl-status { flex-shrink:0;width:14px;text-align:center;padding-top:1px; }
.bl-playing { color:var(--accent);font-size:.65rem; }
.bl-dot { color:var(--text3);font-size:.65rem; }
.bl-text { line-height:1.4; }

/* Contrôles surveillant */
.sv-controls { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:11px;display:flex;flex-direction:column;gap:7px; }
.sv-ctrl-title { font-size:.67rem;font-weight:bold;color:var(--text2);text-transform:uppercase;letter-spacing:.07em; }
.sv-ctrl-row   { display:flex;gap:6px; }
.sv-btn { display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:7px;font-size:.74rem;font-weight:bold;cursor:pointer;border:1px solid transparent;transition:all .15s;font-family:var(--font-b);flex:1;justify-content:center; }
.sv-btn:disabled { opacity:.4;cursor:not-allowed; }
.sv-btn--play  { background:var(--accent);color:#FFF;border-color:var(--accent); }
.sv-btn--play:hover:not(:disabled) { filter:brightness(1.1); }
.sv-btn--pause { background:var(--surface);color:var(--text2);border-color:var(--border2); }
.sv-btn--nav   { background:transparent;color:var(--text2);border-color:var(--border); }
.sv-btn--nav:hover:not(:disabled) { color:var(--text);background:var(--surface); }

.cmd-list { display:flex;flex-direction:column;gap:5px; }
.cmd-row  { display:flex;align-items:center;gap:6px; }
.cmd-key  { padding:2px 6px;background:var(--surface);border:1px solid var(--border);border-radius:5px;font-size:.67rem;color:#F59E0B; }
.cmd-action { font-size:.7rem;color:var(--text3); }

.panel-actions { display:flex;gap:6px;margin-top:auto; }
.pa-btn { flex:1;display:flex;align-items:center;justify-content:center;padding:8px;border-radius:9px;font-family:var(--font-b);font-size:.73rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.pa-btn--repeat { background:var(--surface2);color:var(--text2);border:1px solid var(--border); }
.pa-btn--repeat:hover { color:var(--text); }
.pa-btn--quiz   { background:var(--green-bg);color:var(--green);border:1px solid var(--green-border); }
.pa-btn--back   { background:var(--accent-bg);color:var(--accent);border:1px solid var(--accent-border); }

/* ÉCRAN ÉLÈVE — utilise les variables du thème, pas de couleur hardcodée */
.bv-student {
  position: relative;
  display: flex;flex-direction:column;align-items:center;justify-content:center;
  background: var(--bg2);   /* ← variable thème, pas #000 */
  gap: 20px;padding: 40px;
  overflow: hidden;
}
.ss-orb { position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none; }
.ss-orb--1 { width:360px;height:360px;background:var(--accent);opacity:.1;top:-80px;left:-80px; }
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

.ss-progress { width:200px;display:flex;flex-direction:column;gap:5px;align-items:center; }
.ss-prog-bar  { width:100%;height:5px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden; }
.ss-prog-fill { height:100%;background:linear-gradient(90deg,var(--accent),#7C3AED);border-radius:999px;transition:width .5s; }
.ss-prog-pct  { font-size:.72rem;color:var(--text3); }
.ss-status { font-size:.8rem;color:var(--text3);letter-spacing:.08em;text-transform:uppercase;min-height:1.3em; }

@media(max-width:900px) {
  .bv-body { grid-template-columns:1fr;height:auto; }
  .bv-student { min-height:220px; }
  .bv-panel { border-right:none;border-bottom:1px solid var(--border); }
}
</style>