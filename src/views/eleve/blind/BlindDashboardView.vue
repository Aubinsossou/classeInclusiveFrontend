<template>
  <div :class="['bv-page']">

    <BlindTopbar
      :supervisor-mode="supervisorMode"
      @toggle-supervisor="toggleSupervisor"
      @logout="handleLogout"
    />

    <div class="bv-content">

      <!-- ══ MODE VOCAL ══ -->
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

      <!-- Titre section -->
      <div class="section-header">
        <h2 class="section-title">{{ supervisorMode ? 'Choisissez un cours' : 'Choisissez une matière' }}</h2>
        <p class="section-hint" v-if="supervisorMode">Cliquez directement sur une matière ou un cours</p>
      </div>

      <!-- Grille matières — cliquable immédiatement dans les deux modes -->
      <section class="subjects-grid" role="list" aria-label="Matières disponibles">
        <button
          v-for="(s, i) in subjects" :key="s.id"
          :class="['subject-btn', { 'subject-btn--active': currentSubjectId === s.id }]"
          :style="{ '--sc': s.color }"
          @click="selectSubject(s, i)"
          type="button" role="listitem"
        >
          <span class="sb-num">{{ i + 1 }}</span>
          <div class="sb-info">
            <span class="sb-name">{{ s.name }}</span>
            <span class="sb-prog">{{ s.completedCount }}/{{ s.courseCount }} cours</span>
          </div>
          <div class="sb-bar-wrap"><div class="sb-bar"><div class="sb-fill"></div></div></div>
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14" class="sb-arrow"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </section>

      <!-- Commandes vocales (mode vocal uniquement) -->
      <div v-if="!supervisorMode" class="commands-strip" role="note">
        <div v-for="c in activeCommands" :key="c.say" class="cmd">
          <kbd class="cmd-key">« {{ c.say }} »</kbd>
          <span class="cmd-desc">{{ c.action }}</span>
        </div>
      </div>

    </div>

    <div class="bg-orb bg-orb--1" aria-hidden="true"></div>
    <div class="bg-orb bg-orb--2" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter }       from 'vue-router'
import { useAuthStore }    from '@/stores/auth'
import { usePointsStore }  from '@/stores/points'
import { useProgressStore} from '@/stores/progress'
import { useThemeStore }   from '@/stores/theme'
import { useVoiceEngine }  from '@/composables/useVoiceEngine'
import BlindTopbar         from '@/components/eleve/BlindTopbar.vue'

const router   = useRouter()
const auth     = useAuthStore()
const points   = usePointsStore()
const progress = useProgressStore()
const theme    = useThemeStore()

const voice    = useVoiceEngine()

// ── Mode ─────────────────────────────────────────────────
const supervisorMode   = ref(false)
const currentSubjectId = ref(null)

function toggleSupervisor() {
  supervisorMode.value = !supervisorMode.value
  voice.stop()
  if (!supervisorMode.value) setTimeout(startDashboard, 400)
}

// ── Données depuis le store auth ──────────────────────────
const COLORS = ['#4F46E5','#0EA5E9','#10B981','#F59E0B','#06B6D4','#EC4899']

const subjects = computed(() =>
  auth.matieres.map((m, i) => {
    const cours       = auth.coursByMatiere(m.id)
    const { completed } = progress.getSubjectProgress(m.id)
    return {
      id:             m.id,
      name:           m.nom || m.name,
      courseCount:    cours.length,
      completedCount: completed,
      color:          COLORS[i % COLORS.length],
    }
  })
)

const activeCommands = computed(() => [
  { say: 'nom de la matière',             action: 'Choisir par nom'     },
  { say: 'répète',                         action: 'Réécouter la liste'  },
  { say: 'points',                         action: 'Connaître mon score' },
  { say: 'quitter',                        action: 'Déconnecter'         },
])

// ── Action unifiée — navigation immédiate dans les deux modes ─
function selectSubject(s, i) {
  currentSubjectId.value = s.id
  voice.stop()
  if (!supervisorMode.value) {
    voice.speak(`${s.name}. Chargement du cours.`)
  }
  router.push({ name: 'BlindCourses', params: { subjectId: s.id } })
}

// ── Mode vocal ────────────────────────────────────────────
async function startDashboard() {
  if (!subjects.value.length) {
    await voice.announce(`Bonjour ${auth.user?.name}. Aucune matière disponible pour le moment.`, {})
    return
  }
  const liste = subjects.value.map(s => s.name).join(', ')
  await voice.announce(
    `Bonjour ${auth.user?.name}. Vos matières : ${liste}. Dites le nom de la matière pour commencer.`,
    buildMap()
  )
}

function buildMap() {
  const map = {}
  subjects.value.forEach(s => {
    // Nom exact (insensible à la casse)
    const nameKey = s.name.toLowerCase()
    // Variante sans accents (ex: "mathematiques" pour "Mathématiques")
    const slug = nameKey.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    map[nameKey] = () => choisir(s)
    if (slug !== nameKey) map[slug] = () => choisir(s)
    // Premier mot suffisamment long (ex: "mathematiques", "francais", "sciences")
    const firstWord = slug.split(' ')[0]
    if (firstWord.length > 3) map[firstWord] = () => choisir(s)
  })
  map['repete|répète|liste'] = () => startDashboard()
  map['points|score|niveau'] = async () => {
    await voice.announce(
      `Vous avez ${points.totalPoints} points, niveau ${points.currentLevel.name}.`,
      buildMap()
    )
  }
  map['quitter|déconnecter'] = () => handleLogout()
  return map
}

async function choisir(s) {
  currentSubjectId.value = s.id
  await voice.announce(
    `${s.name}. ${s.completedCount} cours terminés sur ${s.courseCount}. Voulez-vous entrer ? Dites oui ou non.`,
    {
      'oui|entrer|commencer': () => router.push({ name: 'BlindCourses', params: { subjectId: s.id } }),
      'non|retour|autre':     () => startDashboard(),
      'repete|répète':        () => choisir(s),
    }
  )
}

function handleLogout() { voice.stop(); auth.logoutApi(); router.push({ name: 'EleveLogin' }) }

onMounted(() => {
  voice.reset()
  if (!supervisorMode.value) setTimeout(startDashboard, 600)
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
  position: relative;
  overflow-x: hidden;
}

.bg-orb { position:fixed;border-radius:50%;filter:blur(100px);opacity:.07;pointer-events:none;z-index:0; }
.bg-orb--1 { width:450px;height:450px;background:var(--accent);top:-120px;left:-120px; }
.bg-orb--2 { width:350px;height:350px;background:#7C3AED;bottom:-80px;right:-80px; }

.bv-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Visualiseur vocal */
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
.vocal-status { font-size:.75rem;color:var(--text3);text-transform:uppercase;letter-spacing:.1em; }

/* Transcription */
.transcript-row { width:100%;max-width:700px;display:grid;grid-template-columns:1fr 1px 1fr;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden; }
.tr-item { display:flex;align-items:flex-start;gap:8px;padding:12px 16px; }
.tr-item--app { border-left:3px solid var(--accent); }
.tr-item--student { border-left:3px solid var(--green); }
.tr-item svg { flex-shrink:0;margin-top:2px;color:var(--text2); }
.tr-text { font-size:.8rem;color:var(--text);line-height:1.5;font-style:italic; }
.tr-divider { background:var(--border); }

/* En-tête section */
.section-header { text-align:center; }
.section-title { font-family:var(--font-d);font-size:1.05rem;font-weight:bold;color:var(--text2);text-transform:uppercase;letter-spacing:.06em;margin:0 0 4px; }
.section-hint  { font-size:.78rem;color:var(--text3);margin:0; }

/* Grille matières */
.subjects-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.subject-btn {
  display: flex;align-items:center;gap:12px;
  padding: 16px 18px;
  background: var(--surface);border:1px solid var(--border);border-radius:14px;
  color: var(--text);cursor:pointer;text-align:left;
  transition: all .15s;position:relative;overflow:hidden;
}
.subject-btn::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--sc);opacity:0;transition:opacity .15s; }
.subject-btn:hover   { border-color:var(--sc);transform:translateY(-2px);box-shadow:var(--shadow-sm); }
.subject-btn:hover::before,.subject-btn--active::before { opacity:1; }
.subject-btn--active { border-color:var(--sc);background:color-mix(in srgb,var(--sc) 8%,transparent); }

.sb-num  { width:32px;height:32px;border-radius:9px;background:color-mix(in srgb,var(--sc) 15%,transparent);color:var(--sc);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:.85rem;flex-shrink:0;border:1px solid color-mix(in srgb,var(--sc) 25%,transparent); }
.sb-info { flex:1;min-width:0; }
.sb-name { display:block;font-family:var(--font-d);font-size:.9rem;font-weight:bold;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.sb-prog { display:block;font-size:.72rem;color:var(--text2); }
.sb-bar-wrap { width:36px; }
.sb-bar  { height:3px;background:var(--border2);border-radius:999px;overflow:hidden; }
.sb-fill { height:100%;border-radius:999px;transition:width .6s; }
.sb-arrow { color:var(--text3);flex-shrink:0;opacity:0;transition:opacity .15s; }
.subject-btn:hover .sb-arrow { opacity:1;color:var(--sc); }

/* Commandes */
.commands-strip { display:flex;flex-wrap:wrap;justify-content:center;gap:8px; }
.cmd { display:flex;align-items:center;gap:6px; }
.cmd-key  { padding:3px 9px;background:var(--surface);border:1px solid var(--border);border-radius:6px;font-size:.72rem;color:#F59E0B; }
.cmd-desc { font-size:.72rem;color:var(--text3); }

@media(max-width:720px) {
  .subjects-grid { grid-template-columns:1fr 1fr; }
  .bv-content { padding:20px; }
}
@media(max-width:480px) {
  .subjects-grid { grid-template-columns:1fr; }
}
</style>