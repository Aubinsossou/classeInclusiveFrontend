<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import { useVoiceEngine } from '@/composables/useVoiceEngine'
import BlindTopbar from '@/components/eleve/BlindTopbar.vue'

const router = useRouter()
const route  = useRoute()
const voice  = useVoiceEngine()

const eleve   = ref(null)
const loading = ref(true)
const sid     = String(route.params.subjectId)

async function loadData() {
  try {
    const response = await apiGet('eleve/getEleve')
    eleve.value    = response.data?.data || response.data
    localStorage.setItem('eleve', JSON.stringify(eleve.value))
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const supervisorMode  = ref(false)
const currentCourseId = ref(null)

function toggleSupervisor() {
  supervisorMode.value = !supervisorMode.value
  voice.stop()
  if (!supervisorMode.value) setTimeout(startCourses, 400)
}

const allCours = computed(() => eleve.value?.classe?.enseignant?.cours ?? [])

const currentSubject = computed(() => {
  const m = allCours.value.find(c => String(c.matiere?.id) === sid)?.matiere
  return { id: sid, name: m?.name || 'Matière' }
})

const courses = computed(() =>
  allCours.value
    .filter(c => String(c.matiere_id) === sid || String(c.matiere?.id) === sid)
    .map(c => ({
      id:        c.id,
      title:     c.title || c.titre || 'Cours',
      locked:    false,
      completed: false,
      medias:    c.medias || [],
      quizzes:   c.quizzes || [],
    }))
)

function selectCourse(course, i) {
  if (course.locked) {
    if (!supervisorMode.value) voice.speak('Cours verrouillé.')
    return
  }
  currentCourseId.value = course.id
  voice.stop()
  if (!supervisorMode.value) voice.speak(`Cours ${i + 1} : ${course.title}.`)
  goToLesson(course.id)
}

async function startCourses() {
  if (!courses.value.length) {
    await voice.announce(`Aucun cours disponible pour cette matière.`, {})
    return
  }
  const liste = courses.value.map((c, i) => `Cours ${i+1} : ${c.title}`).join('. ')
  await voice.announce(
    `${currentSubject.value.name}. ${liste}. Dites le numéro pour commencer.`,
    buildMap()
  )
}

function buildMap() {
  const map = {}
  const nums  = ['un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix']
  const chiffres = ['1','2','3','4','5','6','7','8','9','10']
  courses.value.forEach((c, i) => {
    if (nums[i])     map[nums[i]]     = () => choisir(c, i)
    if (chiffres[i]) map[chiffres[i]] = () => choisir(c, i)
  })
  map['repete|répète']            = () => startCourses()
  map['retour|matieres|matières'] = () => goBack()
  return map
}

async function choisir(course, index) {
  currentCourseId.value = course.id
  await voice.announce(
    `Cours ${index + 1} : ${course.title}. Dites oui pour commencer.`,
    {
      'oui|commencer|entrer': () => goToLesson(course.id),
      'non|retour|autre':     () => startCourses(),
      'quiz':                 () => goToQuiz(course.id),
      'repete|répète':        () => choisir(course, index),
    }
  )
}

function goToLesson(id) { voice.stop(); router.push({ name: 'BlindLesson', params: { subjectId: sid, lessonId: id } }) }
function goToQuiz(id)   { voice.stop(); router.push({ name: 'BlindQuiz',   params: { subjectId: sid, lessonId: id } }) }
function goBack()       { voice.stop(); router.push({ name: 'BlindDashboard' }) }

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
  if (!supervisorMode.value) setTimeout(startCourses, 600)
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
          <span class="vi-label">{{ supervisorMode ? 'Mode surveillant' : voice.isSpeaking.value ? 'Parle...' : voice.isListening.value ? 'Écoute...' : 'En attente' }}</span>
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
          <div class="monitor-title">{{ currentSubject.name }}</div>
          <div class="sp-row">
            <span class="sp-val">{{ courses.length }} cours</span>
          </div>
        </div>

        <div v-if="!supervisorMode" class="monitor-block">
          <div class="monitor-title">Commandes</div>
          <div class="cmd-list">
            <div class="cmd-row"><kbd class="cmd-key">« un à dix »</kbd><span class="cmd-action">Choisir par numéro</span></div>
            <div class="cmd-row"><kbd class="cmd-key">« répète »</kbd><span class="cmd-action">Réécouter</span></div>
            <div class="cmd-row"><kbd class="cmd-key">« retour »</kbd><span class="cmd-action">Retour matières</span></div>
          </div>
        </div>

        <div class="panel-actions">
          <button v-if="!supervisorMode" class="pa-btn pa-btn--repeat" @click="startCourses">Répéter</button>
          <button class="pa-btn pa-btn--back" @click="goBack">Matières</button>
        </div>
      </aside>

      <main class="bv-main">
        <div class="courses-header">
          <h1 class="courses-title">{{ currentSubject.name }}</h1>
          <p class="courses-sub">{{ supervisorMode ? 'Cliquez sur un cours' : 'Dites le numéro du cours' }}</p>
        </div>

        <div v-if="loading" class="loading-state"><div class="spinner"></div></div>

        <div v-else class="courses-list">
          <button v-for="(course, i) in courses" :key="course.id"
            :class="['course-btn', { 'course-btn--active': currentCourseId === course.id }]"
            :disabled="course.locked"
            @click="selectCourse(course, i)"
            type="button">
            <span class="course-num">{{ i + 1 }}</span>
            <div class="course-info">
              <span class="course-title">{{ course.title }}</span>
              <span class="course-meta">
                <span v-if="course.medias.some(m => m.type === 'audio')" class="course-tag">Audio</span>
                <span v-if="course.quizzes.length" class="course-tag course-tag--quiz">Quiz</span>
              </span>
            </div>
            <div v-if="supervisorMode" class="course-actions">
              <button class="ca-btn ca-btn--lesson" @click.stop="goToLesson(course.id)">Cours</button>
              <button v-if="course.quizzes.length" class="ca-btn ca-btn--quiz" @click.stop="goToQuiz(course.id)">Quiz</button>
            </div>
            <svg v-else viewBox="0 0 24 24" fill="none" width="14" height="14" class="course-arrow"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>

          <div v-if="!courses.length" class="empty-state">Aucun cours pour cette matière.</div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.bv-page { min-height:100vh;background:var(--bg,#07080F);color:var(--text,#F0F2FF);font-family:var(--font-b,'Verdana',sans-serif);display:flex;flex-direction:column; }
.bv-body { display:grid;grid-template-columns:260px 1fr;flex:1;height:calc(100vh - 52px);overflow:hidden; }
.bv-panel { background:var(--surface,#13161F);border-right:1px solid var(--border,rgba(255,255,255,0.07));padding:16px;display:flex;flex-direction:column;gap:12px;overflow-y:auto; }
.voice-indicator { display:flex;align-items:center;gap:8px;background:var(--surface2,#1A1E2B);border:1px solid var(--border,rgba(255,255,255,0.07));border-radius:10px;padding:10px 12px; }
.vi-dot { width:8px;height:8px;border-radius:50%;background:var(--text3,#535878);flex-shrink:0; }
.vi--speaking .vi-dot  { background:var(--accent,#4F46E5);animation:pulse .9s infinite; }
.vi--listening .vi-dot { background:var(--green,#4ADE80);animation:pulse .5s infinite; }
.vi-label { font-size:.78rem;font-weight:bold;flex:1; }
.vi-stop { padding:3px 7px;border-radius:5px;background:var(--red-bg);color:var(--red);border:1px solid var(--red-border);font-size:.7rem;cursor:pointer; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.2} }
.tr-block { background:var(--surface2,#1A1E2B);border:1px solid var(--border);border-radius:10px;padding:10px 12px;border-left:3px solid; }
.tr--app     { border-left-color:var(--accent,#4F46E5); }
.tr--student { border-left-color:var(--green,#4ADE80); }
.tr-label { font-size:.65rem;font-weight:bold;color:var(--text2,#8B91B0);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px; }
.tr-text  { font-size:.79rem;margin:0;line-height:1.5;font-style:italic; }
.monitor-block { background:var(--surface2,#1A1E2B);border:1px solid var(--border);border-radius:10px;padding:11px; }
.monitor-title { font-size:.68rem;font-weight:bold;color:var(--text2,#8B91B0);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px; }
.sp-row { display:flex;align-items:center;gap:8px; }
.sp-val { font-size:.8rem;font-weight:bold; }
.cmd-list { display:flex;flex-direction:column;gap:5px; }
.cmd-row  { display:flex;align-items:center;gap:7px; }
.cmd-key  { padding:2px 7px;background:var(--surface,#13161F);border:1px solid var(--border);border-radius:5px;font-size:.68rem;color:#F59E0B; }
.cmd-action { font-size:.7rem;color:var(--text3,#535878); }
.panel-actions { display:flex;gap:8px;margin-top:auto; }
.pa-btn { flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:8px;border-radius:9px;font-family:var(--font-b);font-size:.74rem;font-weight:bold;cursor:pointer;transition:all .15s; }
.pa-btn--repeat { background:var(--surface2,#1A1E2B);color:var(--text2,#8B91B0);border:1px solid var(--border); }
.pa-btn--back   { background:var(--accent-bg,rgba(79,70,229,0.12));color:var(--accent,#4F46E5);border:1px solid var(--accent-border,rgba(79,70,229,0.3)); }
.bv-main { overflow-y:auto;padding:28px;display:flex;flex-direction:column;gap:20px; }
.courses-header { }
.courses-title { font-family:var(--font-d,'Georgia',serif);font-size:1.4rem;font-weight:bold;margin:0 0 4px; }
.courses-sub   { font-size:.8rem;color:var(--text2,#8B91B0);margin:0; }
.loading-state { display:flex;justify-content:center;padding:40px; }
.spinner { width:32px;height:32px;border:3px solid rgba(255,255,255,.08);border-top-color:#4F46E5;border-radius:50%;animation:spin .7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.courses-list { display:flex;flex-direction:column;gap:8px; }
.empty-state  { text-align:center;padding:40px;color:var(--text2,#8B91B0); }
.course-btn { display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface,#13161F);border:1px solid var(--border);border-radius:12px;color:var(--text,#F0F2FF);cursor:pointer;text-align:left;transition:all .15s;width:100%; }
.course-btn:hover:not(:disabled) { border-color:var(--border2,rgba(255,255,255,0.12));background:var(--surface2,#1A1E2B);transform:translateX(3px); }
.course-btn--active { border-color:var(--accent-border,rgba(79,70,229,0.3));background:var(--accent-bg,rgba(79,70,229,0.12)); }
.course-btn:disabled { opacity:.45;cursor:not-allowed; }
.course-num { width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:.85rem;background:var(--surface2,#1A1E2B);color:var(--text,#F0F2FF);border:1px solid var(--border); }
.course-info { flex:1;min-width:0;display:flex;flex-direction:column;gap:3px; }
.course-title { font-size:.88rem;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.course-meta  { display:flex;align-items:center;gap:6px; }
.course-tag   { font-size:.7rem;padding:2px 8px;border-radius:999px;font-weight:bold;background:var(--surface2);color:var(--text3);border:1px solid var(--border); }
.course-tag--quiz { background:var(--green-bg,rgba(74,222,128,0.08));color:var(--green,#4ADE80);border-color:var(--green-border,rgba(74,222,128,0.25)); }
.course-arrow { color:var(--text3,#535878);flex-shrink:0;opacity:0;transition:opacity .15s; }
.course-btn:hover .course-arrow { opacity:1; }
.course-actions { display:flex;gap:6px;flex-shrink:0; }
.ca-btn { display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:7px;font-size:.74rem;font-weight:bold;cursor:pointer;border:1px solid transparent;transition:all .15s;font-family:var(--font-b); }
.ca-btn--lesson { background:var(--accent-bg,rgba(79,70,229,0.12));color:var(--accent,#4F46E5);border-color:var(--accent-border,rgba(79,70,229,0.3)); }
.ca-btn--lesson:hover { background:var(--accent,#4F46E5);color:#FFF; }
.ca-btn--quiz   { background:var(--green-bg,rgba(74,222,128,0.08));color:var(--green,#4ADE80);border-color:var(--green-border); }
@media(max-width:900px) { .bv-body{grid-template-columns:1fr;height:auto;} .bv-panel{border-right:none;border-bottom:1px solid var(--border);} }
</style>