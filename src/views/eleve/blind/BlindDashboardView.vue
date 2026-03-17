<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import { useVoiceEngine } from '@/composables/useVoiceEngine'
import BlindTopbar from '@/components/eleve/BlindTopbar.vue'

const router = useRouter()
const voice  = useVoiceEngine()

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

const supervisorMode   = ref(false)
const currentSubjectId = ref(null)

function toggleSupervisor() {
  supervisorMode.value = !supervisorMode.value
  voice.stop()
  if (!supervisorMode.value) setTimeout(startDashboard, 400)
}

const COLORS = ['#4F46E5','#0EA5E9','#10B981','#F59E0B','#06B6D4','#EC4899']

// Matières extraites des cours du getEleve
const subjects = computed(() => {
  const cours = eleve.value?.classe?.enseignant?.cours ?? []
  const map = {}
  cours.forEach((c, idx) => {
    const m = c.matiere
    if (m && !map[m.id]) map[m.id] = { ...m, idx, courseCount: 0 }
    if (m) map[m.id].courseCount++
  })
  return Object.values(map).map(m => ({
    id:             m.id,
    name:           m.name,
    courseCount:    m.courseCount,
    completedCount: 0,
    color:          COLORS[m.idx % COLORS.length],
  }))
})

const nomEleve = computed(() => eleve.value?.prenom || eleve.value?.name || 'élève')

function selectSubject(s) {
  currentSubjectId.value = s.id
  voice.stop()
  if (!supervisorMode.value) voice.speak(`${s.name}. Chargement du cours.`)
  router.push({ name: 'BlindCourses', params: { subjectId: s.id } })
}

// ── Mode vocal ────────────────────────────────────────────
async function startDashboard() {
  if (!subjects.value.length) {
    await voice.announce(`Bonjour ${nomEleve.value}. Aucune matière disponible.`, {})
    return
  }
  const liste = subjects.value.map(s => s.name).join(', ')
  await voice.announce(
    `Bonjour ${nomEleve.value}. Vos matières : ${liste}. Dites le nom de la matière pour commencer.`,
    buildMap()
  )
}

function buildMap() {
  const map = {}
  subjects.value.forEach(s => {
    const nameKey = s.name.toLowerCase()
    const slug    = nameKey.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    map[nameKey] = () => choisir(s)
    if (slug !== nameKey) map[slug] = () => choisir(s)
    const firstWord = slug.split(' ')[0]
    if (firstWord.length > 3) map[firstWord] = () => choisir(s)
  })
  map['repete|répète|liste'] = () => startDashboard()
  map['quitter|déconnecter'] = () => handleLogout()
  return map
}

async function choisir(s) {
  currentSubjectId.value = s.id
  await voice.announce(
    `${s.name}. ${s.courseCount} cours disponibles. Voulez-vous entrer ? Dites oui ou non.`,
    {
      'oui|entrer|commencer': () => router.push({ name: 'BlindCourses', params: { subjectId: s.id } }),
      'non|retour|autre':     () => startDashboard(),
      'repete|répète':        () => choisir(s),
    }
  )
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
  if (!supervisorMode.value) setTimeout(startDashboard, 600)
})
onUnmounted(() => voice.stop())
</script>

<template>
  <div class="bv-page">
    <BlindTopbar
      :supervisor-mode="supervisorMode"
      @toggle-supervisor="toggleSupervisor"
      @logout="handleLogout"
    />

    <div class="bv-content">

      <!-- MODE VOCAL -->
      <template v-if="!supervisorMode">
        <div class="vocal-zone" aria-live="polite" role="status">
          <div :class="['vv', { 'vv--speaking': voice.isSpeaking.value, 'vv--listening': voice.isListening.value }]" aria-hidden="true">
            <div class="vv-ring r3"></div><div class="vv-ring r2"></div><div class="vv-ring r1"></div>
            <div class="vv-core">
              <svg v-if="voice.isListening.value" viewBox="0 0 24 24" fill="none" width="26" height="26">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="white" stroke-width="2"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" width="26" height="26">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          <p class="vocal-status">{{ voice.isListening.value ? 'Parlez maintenant' : voice.isSpeaking.value ? 'Écoutez...' : 'En attente' }}</p>
        </div>

        <div class="transcript-row" aria-live="polite">
          <div class="tr-item tr-item--app">
            <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
            <span class="tr-text">{{ voice.lastSpoken.value || '—' }}</span>
          </div>
          <div class="tr-divider"></div>
          <div class="tr-item tr-item--student">
            <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span class="tr-text">{{ voice.lastHeard.value || '—' }}</span>
          </div>
        </div>
      </template>

      <div class="section-header">
        <h2 class="section-title">{{ supervisorMode ? 'Choisissez un cours' : 'Choisissez une matière' }}</h2>
        <p class="section-hint" v-if="supervisorMode">Cliquez directement sur une matière</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <section v-else class="subjects-grid" role="list" aria-label="Matières disponibles">
        <button
          v-for="(s, i) in subjects" :key="s.id"
          :class="['subject-btn', { 'subject-btn--active': currentSubjectId === s.id }]"
          :style="{ '--sc': s.color }"
          @click="selectSubject(s)"
          type="button" role="listitem"
        >
          <span class="sb-num">{{ i + 1 }}</span>
          <div class="sb-info">
            <span class="sb-name">{{ s.name }}</span>
            <span class="sb-prog">{{ s.courseCount }} cours</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14" class="sb-arrow"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </section>

      <div v-if="!supervisorMode" class="commands-strip" role="note">
        <div class="cmd"><kbd class="cmd-key">« nom matière »</kbd><span class="cmd-desc">Choisir</span></div>
        <div class="cmd"><kbd class="cmd-key">« répète »</kbd><span class="cmd-desc">Réécouter</span></div>
        <div class="cmd"><kbd class="cmd-key">« quitter »</kbd><span class="cmd-desc">Déconnecter</span></div>
      </div>

    </div>

    <div class="bg-orb bg-orb--1" aria-hidden="true"></div>
    <div class="bg-orb bg-orb--2" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.bv-page { min-height:100vh;background:var(--bg,#07080F);color:var(--text,#F0F2FF);font-family:var(--font-b,'Verdana',sans-serif);display:flex;flex-direction:column;position:relative;overflow-x:hidden; }
.bg-orb { position:fixed;border-radius:50%;filter:blur(100px);opacity:.07;pointer-events:none;z-index:0; }
.bg-orb--1 { width:450px;height:450px;background:var(--accent,#4F46E5);top:-120px;left:-120px; }
.bg-orb--2 { width:350px;height:350px;background:#7C3AED;bottom:-80px;right:-80px; }
.bv-content { flex:1;display:flex;flex-direction:column;align-items:center;gap:24px;padding:32px;max-width:1000px;width:100%;margin:0 auto;position:relative;z-index:1; }

.loading-state { display:flex;justify-content:center;padding:40px 0; }
.spinner { width:36px;height:36px;border:3px solid rgba(255,255,255,.1);border-top-color:#4F46E5;border-radius:50%;animation:spin .7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }

.vocal-zone { display:flex;flex-direction:column;align-items:center;gap:12px; }
.vv { position:relative;width:110px;height:110px;display:flex;align-items:center;justify-content:center; }
.vv-ring { position:absolute;border-radius:50%;border:1.5px solid rgba(255,255,255,.05); }
.r1{width:110px;height:110px} .r2{width:78px;height:78px} .r3{width:50px;height:50px}
.vv-core { width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;z-index:1;transition:all .3s; }
.vv--speaking .vv-ring { border-color:rgba(79,70,229,.3);animation:ripple 2s ease-out infinite; }
.vv--speaking .r2{animation-delay:.35s} .vv--speaking .r3{animation-delay:.7s}
.vv--speaking .vv-core { background:rgba(79,70,229,.2);border-color:rgba(79,70,229,.5);box-shadow:0 0 24px rgba(79,70,229,.3); }
.vv--listening .vv-ring { border-color:rgba(74,222,128,.3);animation:ripple 1.1s ease-out infinite; }
.vv--listening .r2{animation-delay:.2s} .vv--listening .r3{animation-delay:.4s}
.vv--listening .vv-core { background:rgba(74,222,128,.15);border-color:rgba(74,222,128,.5);box-shadow:0 0 24px rgba(74,222,128,.2); }
@keyframes ripple { 0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.3);opacity:0} }
.vocal-status { font-size:.75rem;color:var(--text3,#535878);text-transform:uppercase;letter-spacing:.1em; }

.transcript-row { width:100%;max-width:700px;display:grid;grid-template-columns:1fr 1px 1fr;background:var(--surface,#13161F);border:1px solid var(--border,rgba(255,255,255,0.07));border-radius:12px;overflow:hidden; }
.tr-item { display:flex;align-items:flex-start;gap:8px;padding:12px 16px; }
.tr-item--app { border-left:3px solid var(--accent,#4F46E5); }
.tr-item--student { border-left:3px solid var(--green,#4ADE80); }
.tr-item svg { flex-shrink:0;margin-top:2px;color:var(--text2,#8B91B0); }
.tr-text { font-size:.8rem;color:var(--text,#F0F2FF);line-height:1.5;font-style:italic; }
.tr-divider { background:var(--border,rgba(255,255,255,0.07)); }

.section-header { text-align:center; }
.section-title { font-family:var(--font-d,'Georgia',serif);font-size:1.05rem;font-weight:bold;color:var(--text2,#8B91B0);text-transform:uppercase;letter-spacing:.06em;margin:0 0 4px; }
.section-hint  { font-size:.78rem;color:var(--text3,#535878);margin:0; }

.subjects-grid { width:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:10px; }
.subject-btn { display:flex;align-items:center;gap:12px;padding:16px 18px;background:var(--surface,#13161F);border:1px solid var(--border,rgba(255,255,255,0.07));border-radius:14px;color:var(--text,#F0F2FF);cursor:pointer;text-align:left;transition:all .15s;position:relative;overflow:hidden; }
.subject-btn::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--sc);opacity:0;transition:opacity .15s; }
.subject-btn:hover { border-color:var(--sc);transform:translateY(-2px); }
.subject-btn:hover::before,.subject-btn--active::before { opacity:1; }
.subject-btn--active { border-color:var(--sc); }
.sb-num  { width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,.05);color:var(--sc);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:.85rem;flex-shrink:0; }
.sb-info { flex:1;min-width:0; }
.sb-name { display:block;font-family:var(--font-d,'Georgia',serif);font-size:.9rem;font-weight:bold;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.sb-prog { display:block;font-size:.72rem;color:var(--text2,#8B91B0); }
.sb-arrow { color:var(--text3,#535878);flex-shrink:0;opacity:0;transition:opacity .15s; }
.subject-btn:hover .sb-arrow { opacity:1;color:var(--sc); }

.commands-strip { display:flex;flex-wrap:wrap;justify-content:center;gap:8px; }
.cmd { display:flex;align-items:center;gap:6px; }
.cmd-key  { padding:3px 9px;background:var(--surface,#13161F);border:1px solid var(--border,rgba(255,255,255,0.07));border-radius:6px;font-size:.72rem;color:#F59E0B; }
.cmd-desc { font-size:.72rem;color:var(--text3,#535878); }

@media(max-width:720px) { .subjects-grid{grid-template-columns:1fr 1fr;} .bv-content{padding:20px;} }
@media(max-width:480px) { .subjects-grid{grid-template-columns:1fr;} }
</style>