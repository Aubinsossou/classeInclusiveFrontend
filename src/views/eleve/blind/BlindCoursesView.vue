<template>
  <div :class="['bv-page']">

    <BlindTopbar
      :supervisor-mode="supervisorMode"
      @toggle-supervisor="toggleSupervisor"
      @logout="handleLogout"
    />

    <div class="bv-body">

      <!-- PANEL GAUCHE : statut vocal + infos -->
      <aside class="bv-panel">

        <!-- Indicateur vocal -->
        <div :class="['voice-indicator', { 'vi--speaking': voice.isSpeaking.value, 'vi--listening': voice.isListening.value && !supervisorMode }]">
          <span class="vi-dot"></span>
          <span class="vi-label">
            {{ supervisorMode ? 'Mode surveillant' : voice.isSpeaking.value ? 'Parle...' : voice.isListening.value ? 'Écoute...' : 'En attente' }}
          </span>
          <button v-if="supervisorMode && voice.isSpeaking.value" class="vi-stop" @click="voice.stop()" title="Stopper la voix">■</button>
        </div>

        <!-- Transcription -->
        <div class="tr-block tr--app">
          <div class="tr-label">Dit</div>
          <p class="tr-text">{{ voice.lastSpoken.value || '—' }}</p>
        </div>
        <div class="tr-block tr--student" v-if="!supervisorMode">
          <div class="tr-label">Entendu</div>
          <p class="tr-text">{{ voice.lastHeard.value || '—' }}</p>
        </div>

        <!-- Progression matière -->
        <div class="monitor-block">
          <div class="monitor-title">{{ currentSubject.name }}</div>
          <div class="sp-row">
            <span class="sp-val">{{ completedCount }}/{{ courses.length }}</span>
            <div class="sp-bar"><div class="sp-fill"></div></div>
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
          <button v-if="!supervisorMode" class="pa-btn pa-btn--repeat" @click="startCourses">
            <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><polyline points="1 4 1 10 7 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3.51 15A9 9 0 1 0 6 5.3L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Répéter
          </button>
          <button class="pa-btn pa-btn--back" @click="goBack">
            <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Matières
          </button>
        </div>

      </aside>

      <!-- ZONE PRINCIPALE : liste des cours -->
      <main class="bv-main">

        <div class="courses-header">
          <h1 class="courses-title">{{ currentSubject.name }}</h1>
          <p class="courses-sub" v-if="supervisorMode">Cliquez directement sur un cours pour y accéder</p>
          <p class="courses-sub" v-else>Dites le numéro du cours</p>
        </div>

        <div class="courses-list">
          <button
            v-for="(course, i) in courses"
            :key="course.id"
            :class="['course-btn', {
              'course-btn--done':   course.completed,
              'course-btn--locked': course.locked,
              'course-btn--active': currentCourseId === course.id
            }]"
            :disabled="course.locked"
            @click="selectCourse(course, i)"
            type="button"
          >
            <!-- Numéro -->
            <span :class="['course-num', { 'course-num--done': course.completed, 'course-num--locked': course.locked }]">
              <svg v-if="course.completed" viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
              <svg v-else-if="course.locked" viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span v-else>{{ i + 1 }}</span>
            </span>

            <!-- Infos cours -->
            <div class="course-info">
              <span class="course-title">{{ course.title }}</span>
              <span class="course-meta">
                <span v-if="course.completed" class="course-tag course-tag--done">Terminé</span>
                <span v-else-if="course.locked" class="course-tag course-tag--locked">Verrouillé</span>
                <span v-else class="course-duration">{{ course.duration }}</span>
              </span>
            </div>

            <!-- Action rapide (mode surveillant) -->
            <div v-if="supervisorMode && !course.locked" class="course-actions">
              <button class="ca-btn ca-btn--lesson" @click.stop="goToLesson(course.id)" title="Ouvrir le cours">
                <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/></svg>
                Cours
              </button>
              <button class="ca-btn ca-btn--quiz" @click.stop="goToQuiz(course.id)" title="Aller au quiz">
                <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Quiz
              </button>
            </div>

            <svg v-else-if="!course.locked && !supervisorMode" viewBox="0 0 24 24" fill="none" width="14" height="14" class="course-arrow"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>

      </main>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore }    from '@/stores/auth'
import { usePointsStore }  from '@/stores/points'
import { useProgressStore} from '@/stores/progress'
import { useThemeStore }   from '@/stores/theme'
import { useVoiceEngine }  from '@/composables/useVoiceEngine'
import BlindTopbar         from '@/components/eleve/BlindTopbar.vue'

const router   = useRouter()
const route    = useRoute()
const auth     = useAuthStore()
const points   = usePointsStore()
const progress = useProgressStore()
const theme    = useThemeStore()

const voice    = useVoiceEngine()

// ── Mode ─────────────────────────────────────────────────
const supervisorMode  = ref(false)
const currentCourseId = ref(null)

function toggleSupervisor() {
  supervisorMode.value = !supervisorMode.value
  voice.stop()
  if (!supervisorMode.value) setTimeout(startCourses, 400)
}

// ── Données depuis le store auth ──────────────────────────
const sid = String(route.params.subjectId)

const currentSubject = computed(() => {
  const m = auth.matieres.find(m => String(m.id) === sid)
  return { id: sid, name: m?.nom || m?.name || 'Matière' }
})

const courses = computed(() =>
  auth.coursByMatiere(Number(sid)).map(c => ({
    id:        c.id,
    title:     c.titre || c.title,
    duration:  c.duree ? `${c.duree} min` : '—',
    completed: progress.isCompleted(sid, c.id),
    locked:    false,
  }))
)

const completedCount = computed(() => progress.getSubjectProgress(sid).completed)

const activeCommands = ref([
  { say:'un à dix', action:'Choisir par numéro' },
  { say:'répète',   action:'Réécouter la liste' },
  { say:'retour',   action:'Retour aux matières'},
])

// ── Action unifiée — navigation toujours immédiate ───────
function selectCourse(course, i) {
  if (course.locked) {
    // Annonce non-bloquante
    if (!supervisorMode.value) voice.speak('Cours verrouillé.')
    return
  }
  currentCourseId.value = course.id
  voice.stop()
  // La voix annonce en parallèle sans bloquer la navigation
  if (!supervisorMode.value) {
    voice.speak(`Cours ${i + 1} : ${course.title}.`)
  }
  goToLesson(course.id)
}

// ── Mode vocal ────────────────────────────────────────────
async function startCourses() {
  const liste = courses.value.map((c, i) => {
    if (c.locked)    return `Cours ${i + 1} : ${c.title}, verrouillé`
    if (c.completed) return `Cours ${i + 1} : ${c.title}, terminé`
    return `Cours ${i + 1} : ${c.title}, ${c.duration}`
  }).join('. ')
  await voice.announce(
    `${currentSubject.value.name}. ${liste}. Dites le numéro pour commencer.`,
    buildMap()
  )
}

function buildMap() {
  const map = {}
  const nums = ['un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix']
  courses.value.forEach((c, i) => { if (nums[i]) map[nums[i]] = () => choisir(c, i) })
  map['repete|répète']            = () => startCourses()
  map['retour|matieres|matières'] = () => goBack()
  return map
}

async function choisir(course, index) {
  currentCourseId.value = course.id
  if (course.locked) {
    await voice.announce('Cours verrouillé. Terminez les précédents.', { 'repete|répète': () => startCourses() })
    return
  }
  const etat = course.completed ? 'Vous avez déjà terminé ce cours.' : ''
  await voice.announce(
    `Cours ${index + 1} : ${course.title}. ${course.duration}. ${etat} Dites oui pour commencer.`,
    {
      'oui|commencer|entrer': () => goToLesson(course.id),
      'non|retour|autre':     () => startCourses(),
      'quiz':                 () => goToQuiz(course.id),
      'repete|répète':        () => choisir(course, index),
    }
  )
}

// ── Navigation ────────────────────────────────────────────
function goToLesson(id) { voice.stop(); router.push({ name: 'BlindLesson', params: { subjectId: sid, lessonId: id } }) }
function goToQuiz(id)   { voice.stop(); router.push({ name: 'BlindQuiz',   params: { subjectId: sid, lessonId: id } }) }
function goBack()       { voice.stop(); router.push({ name: 'BlindDashboard' }) }
function handleLogout() { voice.stop(); auth.logout(); router.push({ name: 'Login' }) }

onMounted(() => {
  voice.reset()
  if (!supervisorMode.value) setTimeout(startCourses, 600)
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
  grid-template-columns: 260px 1fr;
  flex: 1;
  overflow: hidden;
  height: calc(100vh - 52px);
}

/* ── PANEL ─────────────────────────────────────────────── */
.bv-panel {
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.voice-indicator { display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px 12px; }
.vi-dot { width:8px;height:8px;border-radius:50%;background:var(--text3);flex-shrink:0; }
.vi--speaking .vi-dot  { background:var(--accent);animation:pulse .9s infinite; }
.vi--listening .vi-dot { background:var(--green);animation:pulse .5s infinite; }
.vi-label { font-size:.78rem;font-weight:bold;flex:1; }
.vi-stop { margin-left:auto;padding:3px 7px;border-radius:5px;background:var(--red-bg);color:var(--red);border:1px solid var(--red-border);font-size:.7rem;cursor:pointer; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.2} }

.tr-block { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;border-left:3px solid; }
.tr--app     { border-left-color:var(--accent); }
.tr--student { border-left-color:var(--green); }
.tr-label { font-size:.65rem;font-weight:bold;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px; }
.tr-text  { font-size:.79rem;margin:0;line-height:1.5;font-style:italic;color:var(--text); }

.monitor-block { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:11px; }
.monitor-title { font-size:.68rem;font-weight:bold;color:var(--text2);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px; }
.sp-row { display:flex;align-items:center;gap:8px; }
.sp-val  { font-size:.8rem;font-weight:bold;min-width:28px; }
.sp-bar  { flex:1;height:5px;background:var(--border2);border-radius:999px;overflow:hidden; }
.sp-fill { height:100%;background:linear-gradient(90deg,var(--accent),#7C3AED);border-radius:999px; }
.cmd-list { display:flex;flex-direction:column;gap:5px; }
.cmd-row  { display:flex;align-items:center;gap:7px; }
.cmd-key  { padding:2px 7px;background:var(--surface);border:1px solid var(--border);border-radius:5px;font-size:.68rem;color:#F59E0B; }
.cmd-action { font-size:.7rem;color:var(--text3); }

.panel-actions { display:flex;gap:8px;margin-top:auto; }
.pa-btn { flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;border-radius:9px;font-family:var(--font-b);font-size:.74rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.pa-btn--repeat { background:var(--surface2);color:var(--text2);border:1px solid var(--border); }
.pa-btn--repeat:hover { color:var(--text); }
.pa-btn--back   { background:var(--accent-bg);color:var(--accent);border:1px solid var(--accent-border); }
.pa-btn--back:hover { filter:brightness(1.1); }

/* ── MAIN ──────────────────────────────────────────────── */
.bv-main {
  overflow-y: auto;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.courses-header { }
.courses-title  { font-family:var(--font-d);font-size:1.4rem;font-weight:bold;margin:0 0 4px; }
.courses-sub    { font-size:.8rem;color:var(--text2);margin:0; }

/* Liste des cours */
.courses-list { display:flex;flex-direction:column;gap:8px; }

.course-btn {
  display: flex;align-items:center;gap:14px;
  padding: 14px 16px;
  background: var(--surface);border:1px solid var(--border);border-radius:12px;
  color: var(--text);cursor:pointer;text-align:left;
  transition: all .15s;width:100%;
}
.course-btn:hover:not(:disabled) { border-color:var(--border2);background:var(--surface2);transform:translateX(3px); }
.course-btn--active { border-color:var(--accent-border);background:var(--accent-bg); }
.course-btn--done   { opacity:.75; }
.course-btn--locked { opacity:.45;cursor:not-allowed; }

.course-num {
  width:34px;height:34px;border-radius:9px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-weight:bold;font-size:.85rem;
  background:var(--surface2);color:var(--text);border:1px solid var(--border);
}
.course-num--done   { background:var(--green-bg);color:var(--green);border-color:var(--green-border); }
.course-num--locked { background:var(--surface2);color:var(--text3); }

.course-info { flex:1;min-width:0;display:flex;flex-direction:column;gap:3px; }
.course-title { font-size:.88rem;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.course-meta  { display:flex;align-items:center;gap:6px; }
.course-tag   { font-size:.7rem;padding:2px 8px;border-radius:999px;font-weight:bold; }
.course-tag--done   { background:var(--green-bg);color:var(--green);border:1px solid var(--green-border); }
.course-tag--locked { background:var(--surface2);color:var(--text3);border:1px solid var(--border); }
.course-duration    { font-size:.75rem;color:var(--text3); }

.course-arrow { color:var(--text3);flex-shrink:0;opacity:0;transition:opacity .15s; }
.course-btn:hover .course-arrow { opacity:1; }

/* Boutons d'action rapide (mode surveillant) */
.course-actions { display:flex;gap:6px;flex-shrink:0; }
.ca-btn {
  display:flex;align-items:center;gap:5px;
  padding:6px 10px;border-radius:7px;
  font-size:.74rem;font-weight:bold;cursor:pointer;
  border:1px solid transparent;transition:all .15s;font-family:var(--font-b);
}
.ca-btn--lesson { background:var(--accent-bg);color:var(--accent);border-color:var(--accent-border); }
.ca-btn--lesson:hover { background:var(--accent);color:#FFF; }
.ca-btn--quiz   { background:var(--green-bg);color:var(--green);border-color:var(--green-border); }
.ca-btn--quiz:hover { filter:brightness(1.1); }

@media(max-width:900px) {
  .bv-body { grid-template-columns:1fr;height:auto; }
  .bv-panel { border-right:none;border-bottom:1px solid var(--border); }
}
</style>