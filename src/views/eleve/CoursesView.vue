<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import AppTopbar from '@/components/eleve/AppTopbar.vue'

const router = useRouter()
const route  = useRoute()
const sid    = String(route.params.subjectId)

const eleve   = ref(null)
const loading = ref(true)

const COLORS = ['#4F46E5','#0EA5E9','#10B981','#F59E0B','#06B6D4','#EC4899','#8B5CF6','#EF4444']

async function loadData() {
  try {
    const response = await apiGet('eleve/getEleve')
    eleve.value    = response.data?.data || response.data
    localStorage.setItem('eleve', JSON.stringify(eleve.value))
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handicapId = computed(() => eleve.value?.handicap?.id ?? 1)

const allCours = computed(() => eleve.value?.classe?.enseignant?.cours ?? [])

const currentMatiere = computed(() => {
  const matieres = {}
  allCours.value.forEach((c, idx) => {
    const m = c.matiere
    if (m && !matieres[m.id]) matieres[m.id] = { ...m, idx }
  })
  const m = matieres[sid]
  return m
    ? { id: m.id, name: m.name, color: COLORS[m.idx % COLORS.length] }
    : { name: 'Matière', color: '#4F46E5' }
})

const courses = computed(() =>
  allCours.value
    .filter(c => String(c.matiere_id) === sid || String(c.matiere?.id) === sid)
    .map(c => ({
      id:      c.id,
      title:   c.title || c.titre || 'Cours',
      locked:  false,
      medias:  c.medias  || [],
      quizzes: c.quizzes || [],
    }))
)

function goTo(lessonId) {
  const name = handicapId.value === 2 ? 'BlindLesson' : 'Lesson'
  router.push({ name, params: { subjectId: sid, lessonId } })
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
    <AppTopbar :page-title="currentMatiere.name" @logout="handleLogout" />
    <a href="#courses-list" class="skip-link">Aller aux cours</a>

    <header class="page-header" role="banner">
      <div class="header-inner">
        <button class="back-btn" @click="router.push({ name: 'Dashboard' })" type="button">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          Matières
        </button>
        <div class="subject-label">
          <h1 class="subject-name">{{ currentMatiere.name }}</h1>
        </div>
      </div>
    </header>

    <div class="page-body">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div class="list-head">
          <h2 class="list-title">Liste des cours</h2>
          <span class="list-count">{{ courses.length }} cours</span>
        </div>

        <ol class="courses-list" id="courses-list" aria-label="Liste des cours">
          <li v-for="(course, i) in courses" :key="course.id"
            :class="['course-item', { 'course-item--locked': course.locked }]">
            <div class="course-card" :tabindex="course.locked ? -1 : 0" role="button"
              :aria-label="`Cours ${i+1} : ${course.title}`"
              :aria-disabled="course.locked"
              @click="!course.locked && goTo(course.id)"
              @keydown.enter="!course.locked && goTo(course.id)"
              @keydown.space.prevent="!course.locked && goTo(course.id)">

              <div :class="['course-num', { 'course-num--locked': course.locked }]" aria-hidden="true">
                <svg v-if="course.locked" viewBox="0 0 24 24" fill="none" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <span v-else>{{ i + 1 }}</span>
              </div>

              <div class="course-info">
                <h3 class="course-title">{{ course.title }}</h3>
                <div class="course-meta">
                  <span v-if="course.medias.some(m => m.type === 'video')" class="meta-chip meta-chip--video">
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11"><polygon points="23 7 16 12 23 17 23 7" stroke="currentColor" stroke-width="2"/><rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="2"/></svg>
                    Vidéo
                  </span>
                  <span v-if="course.medias.some(m => m.type === 'audio')" class="meta-chip meta-chip--audio">
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11"><path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/></svg>
                    Audio
                  </span>
                  <span v-if="course.medias.some(m => m.type === 'image')" class="meta-chip meta-chip--image">
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                    Image
                  </span>
                  <span v-if="course.quizzes.length" class="meta-chip meta-chip--quiz">
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/></svg>
                    Quiz
                  </span>
                </div>
              </div>

              <div class="course-action" aria-hidden="true">
                <div v-if="course.locked" class="action-tag action-tag--locked">Verrouillé</div>
                <div v-else class="action-arrow">
                  <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </div>
              </div>
            </div>
          </li>
        </ol>

        <div v-if="!courses.length" class="empty-state">
          <p>Aucun cours disponible pour cette matière.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.app { min-height:100vh;background:var(--bg,#F5F2ED);font-family:'Verdana','Geneva',sans-serif;color:#2C2416; }
.skip-link { position:absolute;top:-100px;left:16px;background:#5C4FE0;color:#FFF;padding:10px 18px;border-radius:8px;font-weight:bold;z-index:9999;text-decoration:none; }
.skip-link:focus { top:16px; }
.page-header { background:#FDFBF8;border-bottom:1px solid rgba(120,100,80,0.12);position:sticky;top:0;z-index:100; }
.header-inner { padding:14px 24px;display:flex;align-items:center;gap:16px; }
.back-btn { display:flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;color:#6B5E4E;border:1.5px solid rgba(120,100,80,0.25);border-radius:10px;font-family:'Verdana','Geneva',sans-serif;font-size:.875rem;cursor:pointer;flex-shrink:0;transition:all .15s; }
.back-btn:hover { color:#2C2416;border-color:rgba(120,100,80,0.45); }
.subject-label { flex:1; }
.subject-name { font-family:'Georgia','Times New Roman',serif;font-size:1.1rem;font-weight:bold;color:#2C2416;margin:0; }
.page-body { max-width:1200px;margin:0 auto;padding:32px 24px 60px; }
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid rgba(120,100,80,0.12);border-top-color:#5C4FE0;border-radius:50%;animation:spin .7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.list-head { display:flex;align-items:baseline;gap:12px;margin-bottom:20px; }
.list-title { font-family:'Georgia','Times New Roman',serif;font-size:1.5rem;font-weight:bold;color:#2C2416;margin:0; }
.list-count { font-size:.82rem;color:#9C8E80;font-weight:bold;background:rgba(120,100,80,0.08);padding:3px 10px;border-radius:999px;border:1px solid rgba(120,100,80,0.15); }
.courses-list { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px; }
.course-card { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:14px;padding:20px 22px;display:flex;align-items:center;gap:18px;cursor:pointer;outline:none;transition:border-color .15s,background .15s,transform .15s;position:relative;overflow:hidden; }
.course-card::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:#5C4FE0;opacity:0;transition:opacity .15s; }
.course-card:hover:not([aria-disabled="true"]) { border-color:rgba(79,70,229,.4);background:rgba(79,70,229,.04);transform:translateX(4px); }
.course-card:hover:not([aria-disabled="true"])::before { opacity:1; }
.course-card:focus-visible { border-color:rgba(79,70,229,.5);box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.course-item--locked .course-card { opacity:.45;cursor:not-allowed; }
.course-num { width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:bold;flex-shrink:0;background:#F0EDE7;color:#6B5E4E;border:1px solid rgba(120,100,80,0.12); }
.course-num--locked { background:rgba(255,255,255,.03); }
.course-info { flex:1;min-width:0; }
.course-title { font-family:'Georgia','Times New Roman',serif;font-size:1rem;font-weight:bold;color:#2C2416;margin:0 0 8px 0; }
.course-meta  { display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
.meta-chip { display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:999px;font-size:.7rem;font-weight:bold;border:1px solid; }
.meta-chip--video { background:rgba(139,92,246,.08);color:#7C3AED;border-color:rgba(139,92,246,.2); }
.meta-chip--audio { background:rgba(245,158,11,.08);color:#B45309;border-color:rgba(245,158,11,.2); }
.meta-chip--image { background:rgba(16,185,129,.08);color:#065F46;border-color:rgba(16,185,129,.2); }
.meta-chip--quiz  { background:rgba(79,70,229,.08);color:#4338CA;border-color:rgba(79,70,229,.2); }
.course-action { flex-shrink:0; }
.action-tag { padding:5px 12px;border-radius:999px;font-size:.78rem;font-weight:bold; }
.action-tag--locked { background:rgba(255,255,255,.04);color:#9C8E80;border:1px solid rgba(120,100,80,0.12); }
.action-arrow { width:36px;height:36px;border-radius:50%;background:rgba(79,70,229,.15);border:1px solid rgba(79,70,229,.3);display:flex;align-items:center;justify-content:center;color:#5C4FE0;transition:transform .15s; }
.course-card:hover .action-arrow { transform:translateX(3px); }
.empty-state { text-align:center;padding:60px 0;color:#6B5E4E;font-size:.9rem; }
@media(max-width:640px) { .page-body{padding:20px 14px 40px;} .course-card{padding:16px;gap:12px;} .header-inner{padding:14px 16px;} }
</style>