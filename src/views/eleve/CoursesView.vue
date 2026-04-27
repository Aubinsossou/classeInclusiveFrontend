<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import AppTopbar from '@/components/eleve/AppTopbar.vue'

const router = useRouter()
const route = useRoute()
const sid = String(route.params.subjectId)

const eleve = ref(null)
const loading = ref(true)
const COLORS = [
  '#4F46E5',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#06B6D4',
  '#EC4899',
  '#8B5CF6',
  '#EF4444',
]

const loadData = async () => {
  try {
    const response = await apiGet('eleve/getEleve')
    eleve.value = response.data?.data || response.data
    localStorage.setItem('eleve', JSON.stringify(eleve.value))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handicapId = computed(() => eleve.value?.handicap?.id ?? 1)
const isBlind = computed(() => handicapId.value === 2)
const isDeaf = computed(() => handicapId.value === 3)
const isAutisme = computed(() => handicapId.value === 5)
const isTrisomie = computed(() => handicapId.value === 6)
const isIMC = computed(() => handicapId.value === 8)
const isDI = computed(() => handicapId.value === 9)
const isSimplified = computed(() => isTrisomie.value || isDI.value)
const isMotor = computed(() => isIMC.value)

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

// Cours triés par date_programmation décroissante + filtrés par matière
const courses = computed(() =>
  allCours.value
    .filter((c) => String(c.matiere_id) === sid || String(c.matiere?.id) === sid)
    .sort((a, b) => new Date(b.date_programmation) - new Date(a.date_programmation))
    .map((c) => ({
      id: c.id,
      title: c.title || c.titre || 'Cours',
      locked: false,
      medias: c.medias || [],
      quizzes: c.quizzes || [],
      quiz_authorise: c.quiz_authorise === true || c.quiz_authorise == 1,
      date_prog: c.date_programmation
        ? new Date(c.date_programmation).toLocaleDateString('fr-FR')
        : null,
    })),
)

const goTo = (lessonId) => {
  const name = handicapId.value === 2 ? 'BlindLesson' : 'Lesson'
  router.push({ name, params: { subjectId: sid, lessonId } })
}

const speakAndGoTo = (lessonId, title) => {
  if (isDI.value || isTrisomie.value) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(title)
    u.lang = 'fr-FR'
    u.rate = 0.85
    u.onend = () => goTo(lessonId)
    u.onerror = () => goTo(lessonId)
    window.speechSynthesis.speak(u)
  } else {
    goTo(lessonId)
  }
}

const handleLogout = async () => {
  try {
    await apiPost('eleve/logout')
  } catch {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  localStorage.removeItem('eleve')
  router.push({ name: 'EleveLogin' })
}

onMounted(loadData)
</script>

<template>
  <div :class="['app', { 'app--motor': isMotor, 'app--simplified': isSimplified }]" role="main">
    <AppTopbar :page-title="currentMatiere.name" @logout="handleLogout" />
    <a href="#courses-list" class="skip-link">Aller aux cours</a>

    <header class="page-header" role="banner">
      <div class="header-inner">
        <button class="back-btn" @click="router.push({ name: 'Dashboard' })" type="button">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
          Matières
        </button>
        <div class="subject-label">
          <h1 class="subject-name">{{ currentMatiere.name }}</h1>
        </div>
      </div>
    </header>

    <div class="page-body">
      <div v-if="loading" class="loading-state"><div class="spinner"></div></div>

      <template v-else>
        <div class="list-head">
          <h2 class="list-title">{{ isSimplified ? 'Cours' : 'Liste des cours' }}</h2>
          <span v-if="!isSimplified" class="list-count">{{ courses.length }} cours</span>
        </div>

        <!-- Trisomie / DI : grands boutons avec TTS -->
        <div v-if="isSimplified" class="courses-simple" id="courses-list">
          <button
            v-for="(course, i) in courses"
            :key="course.id"
            class="simple-course-btn"
            @click="speakAndGoTo(course.id, course.title)"
            type="button"
            :aria-label="`Cours ${i + 1} : ${course.title}. Appuyez pour écouter et ouvrir.`"
          >
            <span class="scb-num">{{ i + 1 }}</span>
            <div class="scb-body">
              <span class="scb-title">{{ course.title }}</span>
              <span class="scb-hint">🔊 Appuyez pour écouter et ouvrir</span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <div v-if="!courses.length" class="empty-state"><p>Aucun cours disponible.</p></div>
        </div>

        <!-- Liste normale triée par date décroissante -->
        <ol v-else class="courses-list" id="courses-list" aria-label="Liste des cours">
          <li
            v-for="(course, i) in courses"
            :key="course.id"
            :class="['course-item', { 'course-item--locked': course.locked }]"
          >
            <div
              :class="['course-card', { 'course-card--motor': isMotor }]"
              :tabindex="course.locked ? -1 : 0"
              role="button"
              :aria-label="`Cours ${i + 1} : ${course.title}`"
              :aria-disabled="course.locked"
              @click="!course.locked && goTo(course.id)"
              @keydown.enter="!course.locked && goTo(course.id)"
              @keydown.space.prevent="!course.locked && goTo(course.id)"
            >
              <div
                :class="[
                  'course-num',
                  { 'course-num--locked': course.locked, 'course-num--motor': isMotor },
                ]"
                aria-hidden="true"
              >
                <svg v-if="course.locked" viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M7 11V7a5 5 0 0 1 10 0v4"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <span v-else>{{ i + 1 }}</span>
              </div>

              <div class="course-info">
                <div class="course-title-row">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <span v-if="course.date_prog" class="course-date">{{ course.date_prog }}</span>
                </div>
                <!-- Autisme : pas de chips distractives -->
                <div v-if="!isAutisme" class="course-meta">
                  <span
                    v-if="course.medias.some((m) => m.type === 'video')"
                    class="meta-chip meta-chip--video"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
                      <polygon
                        points="23 7 16 12 23 17 23 7"
                        stroke="currentColor"
                        stroke-width="2"
                      />
                      <rect
                        x="1"
                        y="5"
                        width="15"
                        height="14"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="2"
                      />
                    </svg>
                    Vidéo
                  </span>
                  <span
                    v-if="course.medias.some((m) => m.type === 'audio') && !isDeaf"
                    class="meta-chip meta-chip--audio"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
                      <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2" />
                      <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2" />
                    </svg>
                    Audio
                  </span>
                  <span
                    v-if="course.medias.some((m) => m.type === 'image') && !isBlind"
                    class="meta-chip meta-chip--image"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="2"
                      />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path
                        d="M21 15l-5-5L5 21"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                    Image
                  </span>
                  <!-- Quiz visible uniquement si quiz_authorise === true -->
                  <span
                    v-if="course.quizzes.length && course.quiz_authorise"
                    class="meta-chip meta-chip--quiz"
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                      <path
                        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                        stroke="currentColor"
                        stroke-width="2"
                      />
                    </svg>
                    Quiz disponible
                  </span>
                </div>
              </div>

              <div class="course-action" aria-hidden="true">
                <div v-if="course.locked" class="action-tag action-tag--locked">Verrouillé</div>
                <div v-else :class="['action-arrow', { 'action-arrow--motor': isMotor }]">
                  <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </li>
        </ol>

        <div v-if="!courses.length && !isSimplified" class="empty-state">
          <p>Aucun cours disponible pour cette matière.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--bg, #f5f2ed);
  font-family: 'Verdana', 'Geneva', sans-serif;
  color: #2c2416;
}
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  background: #5c4fe0;
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: bold;
  z-index: 9999;
  text-decoration: none;
}
.skip-link:focus {
  top: 16px;
}
.page-header {
  background: #fdfbf8;
  border-bottom: 1px solid rgba(120, 100, 80, 0.12);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  color: #6b5e4e;
  border: 1.5px solid rgba(120, 100, 80, 0.25);
  border-radius: 10px;
  font-family: 'Verdana', 'Geneva', sans-serif;
  font-size: 0.875rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}
.back-btn:hover {
  color: #2c2416;
  border-color: rgba(120, 100, 80, 0.45);
}
.app--motor .back-btn {
  padding: 12px 18px;
  font-size: 1rem;
}
.subject-label {
  flex: 1;
}
.subject-name {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c2416;
  margin: 0;
}
.page-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}
.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(120, 100, 80, 0.12);
  border-top-color: #5c4fe0;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.list-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}
.list-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c2416;
  margin: 0;
}
.list-count {
  font-size: 0.82rem;
  color: #9c8e80;
  font-weight: bold;
  background: rgba(120, 100, 80, 0.08);
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(120, 100, 80, 0.15);
}
.courses-simple {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.simple-course-btn {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
  background: #fdfbf8;
  border: 2px solid rgba(120, 100, 80, 0.15);
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  width: 100%;
  min-height: 80px;
}
.simple-course-btn:hover {
  border-color: #5c4fe0;
  background: rgba(79, 70, 229, 0.04);
  transform: translateX(4px);
}
.simple-course-btn:active {
  transform: scale(0.98);
}
.scb-num {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(79, 70, 229, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #5c4fe0;
  flex-shrink: 0;
}
.scb-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.scb-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c2416;
}
.scb-hint {
  font-size: 0.72rem;
  color: #9c8e80;
}
.courses-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.course-card {
  background: #fdfbf8;
  border: 1px solid rgba(120, 100, 80, 0.12);
  border-radius: 14px;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s,
    background 0.15s,
    transform 0.15s;
  position: relative;
  overflow: hidden;
}
.course-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #5c4fe0;
  opacity: 0;
  transition: opacity 0.15s;
}
.course-card:hover:not([aria-disabled='true']) {
  border-color: rgba(79, 70, 229, 0.4);
  background: rgba(79, 70, 229, 0.04);
  transform: translateX(4px);
}
.course-card:hover:not([aria-disabled='true'])::before {
  opacity: 1;
}
.course-card:focus-visible {
  border-color: rgba(79, 70, 229, 0.5);
  box-shadow: 0 0 0 3px rgba(92, 79, 224, 0.35);
}
.course-card--motor {
  padding: 26px 22px;
}
.course-item--locked .course-card {
  opacity: 0.45;
  cursor: not-allowed;
}
.course-num {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  flex-shrink: 0;
  background: #f0ede7;
  color: #6b5e4e;
  border: 1px solid rgba(120, 100, 80, 0.12);
}
.course-num--motor {
  width: 56px;
  height: 56px;
  font-size: 1.2rem;
}
.course-num--locked {
  background: rgba(255, 255, 255, 0.03);
}
.course-info {
  flex: 1;
  min-width: 0;
}
.course-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.course-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1rem;
  font-weight: bold;
  color: #2c2416;
  margin: 0;
}
.course-date {
  font-size: 0.72rem;
  color: #9c8e80;
  background: rgba(120, 100, 80, 0.08);
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(120, 100, 80, 0.12);
  white-space: nowrap;
}
.course-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: bold;
  border: 1px solid;
}
.meta-chip--video {
  background: rgba(139, 92, 246, 0.08);
  color: #7c3aed;
  border-color: rgba(139, 92, 246, 0.2);
}
.meta-chip--audio {
  background: rgba(245, 158, 11, 0.08);
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.2);
}
.meta-chip--image {
  background: rgba(16, 185, 129, 0.08);
  color: #065f46;
  border-color: rgba(16, 185, 129, 0.2);
}
.meta-chip--quiz {
  background: rgba(79, 70, 229, 0.08);
  color: #4338ca;
  border-color: rgba(79, 70, 229, 0.2);
}
.course-action {
  flex-shrink: 0;
}
.action-tag {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: bold;
}
.action-tag--locked {
  background: rgba(255, 255, 255, 0.04);
  color: #9c8e80;
  border: 1px solid rgba(120, 100, 80, 0.12);
}
.action-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(79, 70, 229, 0.15);
  border: 1px solid rgba(79, 70, 229, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c4fe0;
  transition: transform 0.15s;
}
.action-arrow--motor {
  width: 48px;
  height: 48px;
}
.course-card:hover .action-arrow {
  transform: translateX(3px);
}
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #6b5e4e;
  font-size: 0.9rem;
}
@media (max-width: 640px) {
  .page-body {
    padding: 20px 14px 40px;
  }
  .course-card {
    padding: 16px;
    gap: 12px;
  }
  .header-inner {
    padding: 14px 16px;
  }
}
</style>
