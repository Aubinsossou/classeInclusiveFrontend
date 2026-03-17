<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import { useVoiceEngine } from '@/composables/useVoiceEngine'
import AppTopbar from '@/components/eleve/AppTopbar.vue'

const router = useRouter()
const route = useRoute()
const voice = useVoiceEngine()

const subjectId = route.params.subjectId
const lessonId = String(route.params.lessonId)

const eleve = ref(null)
const loading = ref(true)

async function loadData() {
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
const isLowVision = computed(() => handicapId.value === 4)
const hasTts = computed(() => handicapId.value === 2 || handicapId.value === 4)

const apiCours = computed(() =>
  (eleve.value?.classe?.enseignant?.cours ?? []).find((c) => String(c.id) === lessonId),
)
const pageTitle = computed(() => apiCours.value?.title || apiCours.value?.titre || 'Leçon')
const courseMedias = computed(() => apiCours.value?.medias || [])

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'
function fullUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return BASE_URL + url
}

const videoUrl = computed(() =>
  fullUrl(courseMedias.value?.find((m) => m.type === 'video')?.url || ''),
)
const audioUrl = computed(() =>
  fullUrl(courseMedias.value.find((m) => m.type === 'audio')?.url || ''),
)
const lessonImages = computed(() =>
  courseMedias.value.filter((m) => m.type === 'image').map((m) => ({ ...m, url: fullUrl(m.url) })),
)

const hasVideo = computed(() => !!videoUrl.value)
const hasAudio = computed(() => !!audioUrl.value && !isDeaf.value)
const hasImages = computed(() => !isBlind.value && lessonImages.value.length > 0)

// ── Contenu texte ─────────────────────────────────────────
function htmlToBlocks(html) {
  if (!html) return []
  const div = document.createElement('div')
  div.innerHTML = html
  const blocks = []
  div.childNodes.forEach((node) => {
    const tag = node.nodeName?.toLowerCase()
    const text = node.textContent?.trim()
    if (!text) return
    if (['h1', 'h2', 'h3', 'h4'].includes(tag)) blocks.push({ type: 'heading', text })
    else if (tag === 'ul' || tag === 'ol') {
      const items = [...node.querySelectorAll('li')]
        .map((li) => li.textContent.trim())
        .filter(Boolean)
      if (items.length) blocks.push({ type: 'list', items })
    } else if (tag === 'blockquote') blocks.push({ type: 'keypoint', text })
    else if (text.length > 2) blocks.push({ type: 'paragraph', text })
  })
  return blocks
}

const lesson = ref({ title: '', content: [], rawHtml: '' })
const fs = ref(16)
const hiContrast = ref(false)

function chargerCours(c) {
  if (!c) return
  lesson.value.title = c.title || c.titre || 'Cours'
  lesson.value.rawHtml = c.contenu || ''
  lesson.value.content = htmlToBlocks(c.contenu || '')
  if (isLowVision.value) fs.value = 20
}

watch(
  apiCours,
  (c) => {
    if (c) chargerCours(c)
  },
  { immediate: true },
)

// ── TTS ───────────────────────────────────────────────────
const isTtsPlaying = ref(false)

function getPlainText() {
  const div = document.createElement('div')
  div.innerHTML = lesson.value.rawHtml || ''
  return div.textContent?.trim() || lesson.value.title
}

async function toggleTts() {
  if (isTtsPlaying.value) {
    voice.stop()
    isTtsPlaying.value = false
    return
  }
  const text = getPlainText()
  if (!text) return
  isTtsPlaying.value = true
  await voice.speak(text)
  isTtsPlaying.value = false
}

// ── Audio natif ───────────────────────────────────────────
const audioEl = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const rate = ref(1)
const audioPct = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))

function togglePlay() {
  if (!audioEl.value) return
  if (isPlaying.value) audioEl.value.pause()
  else audioEl.value.play()
  isPlaying.value = !isPlaying.value
}
function skip(s) {
  if (!audioEl.value) return
  audioEl.value.currentTime = Math.max(0, Math.min(duration.value, audioEl.value.currentTime + s))
}
function seek(e) {
  if (!audioEl.value) return
  const r = e.currentTarget.getBoundingClientRect()
  audioEl.value.currentTime = ((e.clientX - r.left) / r.width) * duration.value
}
function cycleRate() {
  const rates = [0.75, 1, 1.25, 1.5, 2]
  rate.value = rates[(rates.indexOf(rate.value) + 1) % rates.length]
  if (audioEl.value) audioEl.value.playbackRate = rate.value
}
function onTimeUpdate() {
  if (audioEl.value) currentTime.value = audioEl.value.currentTime
}
function onLoaded() {
  if (audioEl.value) duration.value = audioEl.value.duration
}
function fmt(s) {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

// ── Vidéo native ──────────────────────────────────────────
const ableVideoId = `able-video-${lessonId}`

async function initAblePlayer() {
  if (!videoUrl.value || typeof window.AblePlayer === 'undefined') return
  await nextTick()
  try {
    if (window.$) new window.AblePlayer(window.$(`#${ableVideoId}`))
  } catch (e) {
    console.warn('[AblePlayer]', e)
  }
}

// ── Navigation ────────────────────────────────────────────
function goBack() {
  router.push({ name: 'Courses', params: { subjectId } })
}
function goToQuiz() {
  router.push({ name: isBlind.value ? 'BlindQuiz' : 'Quiz', params: { subjectId, lessonId } })
}

async function handleLogout() {
  try {
    await apiPost('eleve/logout')
  } catch {}
  localStorage.removeItem('access_token')
  localStorage.removeItem('role')
  localStorage.removeItem('eleve')
  router.push({ name: 'EleveLogin' })
}

onMounted(async () => {
  await loadData()
  if (videoUrl.value) initAblePlayer()
})

watch(videoUrl, (url) => {
  if (url) initAblePlayer()
})

onMounted(() => {
  voice.reset() 
})

onUnmounted(() => {
  voice.stop() 
})
</script>

<template>
  <div class="app" role="main">
    <AppTopbar :page-title="pageTitle" @logout="handleLogout" />
    <a href="#lesson-content" class="skip-link">Aller au contenu</a>

    <header class="page-header" role="banner">
      <div class="header-inner">
        <button class="back-btn" @click="goBack" type="button">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
          Cours
        </button>
        <div class="lesson-label">
          <h1 class="lesson-title">{{ lesson.title }}</h1>
        </div>
      </div>
    </header>

    <div v-if="loading" class="loading-state"><div class="spinner"></div></div>

    <div v-else class="page-body" id="lesson-content">
      <!-- VIDÉO -->
      <section v-if="hasVideo" class="content-block block--video">
        <div class="block-header">
          <div class="block-icon-wrap block-icon--video">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="3"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M8 10l8 2-8 2V10z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2 class="block-title">Vidéo du cours</h2>
            <p v-if="isBlind" class="block-sub">Audio de la vidéo disponible</p>
            <p v-else-if="isDeaf" class="block-sub">Sous-titres disponibles</p>
          </div>
        </div>
        <div class="able-wrap">
          <video
            class="lesson-video"
            controls
            :src="videoUrl"
            aria-label="Vidéo du cours"
            width="100%"
            style="height: 550px"
          >
            <track kind="subtitles" srclang="fr" label="Français" default />
          </video>
        </div>
      </section>

      <!-- AUDIO -->
      <section v-if="hasAudio" class="content-block block--audio">
        <div class="block-header">
          <div class="block-icon-wrap block-icon--audio">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <polygon
                points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <path
                d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div>
            <h2 class="block-title">Audio du cours</h2>
            <p class="block-sub">Espace = Pause · ← → = ±10 secondes</p>
          </div>
        </div>

        <div class="audio-quick-btns">
          <button class="quick-btn quick-btn--audio" @click="toggleTts" type="button">
            <svg
              v-if="!isTtsPlaying"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="16"
              height="16"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            {{ isTtsPlaying ? 'Arrêter la lecture' : 'Écouter le cours' }}
          </button>
        </div>

        <div class="audio-player">
          <audio
            ref="audioEl"
            :src="audioUrl"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoaded"
            @ended="isPlaying = false"
            preload="metadata"
          ></audio>
          <div class="audio-progress-row">
            <span class="time-tag">{{ fmt(currentTime) }}</span>
            <div class="audio-track" @click="seek">
              <div class="audio-fill" :style="{ width: audioPct + '%' }"></div>
              <div class="audio-thumb" :style="{ left: audioPct + '%' }"></div>
            </div>
            <span class="time-tag">{{ fmt(duration) }}</span>
          </div>
          <div class="audio-controls">
            <button class="ctrl-btn" @click="skip(-10)" type="button">-10s</button>
            <button class="ctrl-btn ctrl-btn--play" @click="togglePlay" type="button">
              <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
            <button class="ctrl-btn" @click="skip(10)" type="button">+10s</button>
            <button class="ctrl-btn ctrl-btn--rate" @click="cycleRate" type="button">
              {{ rate }}x
            </button>
          </div>
        </div>
      </section>

      <!-- IMAGES -->
      <section v-if="hasImages" class="content-block block--images">
        <div class="block-header">
          <div class="block-icon-wrap block-icon--images">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
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
          </div>
          <div>
            <h2 class="block-title">Illustrations</h2>
            <p class="block-sub">
              {{ lessonImages.length }} image{{ lessonImages.length > 1 ? 's' : '' }} · Cliquez pour
              zoomer
            </p>
          </div>
        </div>
        <div
          v-viewer="{
            toolbar: true,
            navbar: lessonImages.length > 1,
            title: false,
            movable: true,
            zoomable: true,
            rotatable: false,
            scalable: false,
            transition: true,
            fullscreen: true,
            keyboard: true,
          }"
          class="images-grid"
        >
          <figure v-for="(img, i) in lessonImages" :key="img.id || i" class="lesson-figure">
            <img :src="img.url" :alt="`Illustration ${i + 1}`" class="lesson-img" loading="lazy" />
            <div class="img-zoom-hint" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
                <path
                  d="M21 21l-4.35-4.35M11 8v6M8 11h6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Zoomer
            </div>
          </figure>
        </div>
      </section>

      <!-- TEXTE -->
      <section class="content-block block--text">
        <div class="block-header">
          <div class="block-icon-wrap block-icon--text">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path
                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="block-title-row">
            <h2 class="block-title">Contenu du cours</h2>
            <button
              v-if="hasTts"
              class="tts-btn"
              :class="{ 'tts-btn--active': isTtsPlaying }"
              @click="toggleTts"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path
                  d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              {{ isTtsPlaying ? 'Arrêter' : 'Écouter le texte' }}
            </button>
          </div>
        </div>

        <!-- Contrôles typo + contraste malvoyant -->
        <div class="typo-controls">
          <button class="typo-btn" @click="fs = Math.max(14, fs - 2)" type="button">A-</button>
          <span class="typo-val">{{ fs }}px</span>
          <button class="typo-btn typo-btn--lg" @click="fs = Math.min(32, fs + 2)" type="button">
            A+
          </button>
          <button
            v-if="isLowVision"
            class="typo-btn typo-btn--contrast"
            :class="{ 'typo-btn--contrast-active': hiContrast }"
            :aria-pressed="hiContrast"
            @click="hiContrast = !hiContrast"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" />
            </svg>
            Contraste
          </button>
        </div>

        <article
          class="lesson-content"
          :class="{ 'hi-contrast': hiContrast }"
          :style="{ fontSize: fs + 'px', lineHeight: '1.8' }"
        >
          <template v-for="(block, i) in lesson.content" :key="i">
            <h3 v-if="block.type === 'heading'" class="content-h">{{ block.text }}</h3>
            <p v-else-if="block.type === 'paragraph'" class="content-p">{{ block.text }}</p>
            <div v-else-if="block.type === 'keypoint'" class="content-kp">
              <p class="kp-text">{{ block.text }}</p>
            </div>
            <ul v-else-if="block.type === 'list'" class="content-list">
              <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
            </ul>
          </template>
          <div
            v-if="!lesson.content.length && lesson.rawHtml"
            class="content-raw"
            v-html="lesson.rawHtml"
          ></div>
          <p v-if="!lesson.content.length && !lesson.rawHtml" class="content-empty">
            Ce cours n'a pas encore de contenu textuel.
          </p>
        </article>
      </section>

      <!-- CTA Quiz -->
      <div v-if="apiCours?.quizzes?.length" class="quiz-cta">
        <div class="cta-inner">
          <div class="cta-icon">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
              <path
                d="M9 11l3 3L22 4"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div>
            <p class="cta-title">Prêt à vous tester ?</p>
            <p class="cta-sub">{{ apiCours.quizzes[0]?.questions?.length ?? 0 }} questions</p>
          </div>
          <button class="cta-btn" @click="goToQuiz" type="button">
            Commencer le quiz
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
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
.lesson-label {
  flex: 1;
  min-width: 0;
}
.lesson-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1rem;
  font-weight: bold;
  color: #2c2416;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.spinner {
  width: 36px;
  height: 36px;
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
.page-body {
  max-width: 1500px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.content-block {
  background: #fdfbf8;
  border: 1px solid rgba(120, 100, 80, 0.12);
  border-radius: 18px;
  padding: 28px;
  border-top: 3px solid;
}
.block--audio {
  border-top-color: #f59e0b;
}
.block--video {
  border-top-color: #8b5cf6;
}
.block--text {
  border-top-color: #5c4fe0;
}
.block--images {
  border-top-color: #10b981;
}
.block-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}
.block-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}
.block-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.block-icon--audio {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.block-icon--video {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.2);
}
.block-icon--text {
  background: rgba(79, 70, 229, 0.12);
  color: #5c4fe0;
  border: 1px solid rgba(79, 70, 229, 0.2);
}
.block-icon--images {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.block-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c2416;
  margin: 0;
}
.block-sub {
  font-size: 0.8rem;
  color: #6b5e4e;
  margin: 4px 0 0 0;
}
.able-wrap {
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}
.audio-quick-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-family: 'Verdana', 'Geneva', sans-serif;
  font-size: 0.875rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid;
}
.quick-btn--audio {
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
  border-color: rgba(245, 158, 11, 0.35);
}
.quick-btn--audio:hover {
  background: rgba(245, 158, 11, 0.22);
}
.quick-btn--tts {
  background: rgba(79, 70, 229, 0.1);
  color: #3730a3;
  border-color: rgba(79, 70, 229, 0.3);
}
.quick-btn--tts:hover {
  background: rgba(79, 70, 229, 0.18);
}
.audio-player {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.audio-progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.time-tag {
  font-size: 0.78rem;
  color: #9c8e80;
  min-width: 36px;
}
.audio-track {
  flex: 1;
  height: 6px;
  background: rgba(120, 100, 80, 0.15);
  border-radius: 999px;
  position: relative;
  cursor: pointer;
}
.audio-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  border-radius: 999px;
  pointer-events: none;
}
.audio-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: #fff;
  border: 3px solid #f59e0b;
  border-radius: 50%;
  pointer-events: none;
}
.audio-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background: #f0ede7;
  border: 1px solid rgba(120, 100, 80, 0.12);
  color: #6b5e4e;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Verdana', 'Geneva', sans-serif;
  font-size: 0.85rem;
  font-weight: bold;
  transition: all 0.15s;
  min-width: 52px;
}
.ctrl-btn:hover {
  color: #2c2416;
}
.ctrl-btn--play {
  width: 64px;
  height: 64px;
  min-width: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: #fff;
  border: none;
}
.ctrl-btn--play:hover {
  transform: scale(1.05);
}
.tts-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 8px;
  font-family: 'Verdana', 'Geneva', sans-serif;
  font-size: 0.78rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s;
  background: rgba(79, 70, 229, 0.08);
  color: #3730a3;
  border: 1.5px solid rgba(79, 70, 229, 0.25);
}
.tts-btn:hover {
  background: rgba(79, 70, 229, 0.16);
}
.tts-btn--active {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;
}
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}
.lesson-figure {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #f0ede7;
  border: 1px solid rgba(120, 100, 80, 0.12);
  position: relative;
  cursor: zoom-in;
}
.lesson-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.lesson-figure:hover .lesson-img {
  transform: scale(1.03);
}
.img-zoom-hint {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: bold;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}
.lesson-figure:hover .img-zoom-hint {
  opacity: 1;
}

/* Contrôles typo */
.typo-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.typo-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  background: #f0ede7;
  border: 1px solid rgba(120, 100, 80, 0.12);
  color: #6b5e4e;
  border-radius: 8px;
  font-family: 'Verdana', 'Geneva', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
}
.typo-btn--lg {
  font-size: 1.05rem;
}
.typo-btn--contrast {
  gap: 6px;
}
.typo-btn--contrast-active {
  background: rgba(79, 70, 229, 0.15);
  color: #5c4fe0;
  border-color: rgba(79, 70, 229, 0.35);
  font-weight: bold;
}
.typo-val {
  font-size: 0.78rem;
  color: #9c8e80;
  min-width: 36px;
  text-align: center;
}

/* Contenu texte */
.lesson-content {
  color: #6b5e4e;
}
.content-h {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.15rem;
  font-weight: bold;
  color: #2c2416;
  margin: 24px 0 10px 0;
}
.content-p {
  margin: 0 0 14px 0;
  line-height: inherit;
  color: #000;
}
.content-kp {
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-left: 3px solid #5c4fe0;
  border-radius: 0 10px 10px 0;
  padding: 14px 16px;
  margin: 16px 0;
}
.kp-text {
  margin: 0;
  color: #2c2416;
  font-size: 0.9rem;
  line-height: 1.6;
}
.content-list {
  padding-left: 20px;
  margin: 10px 0 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.content-raw {
  color: #2c2416;
  line-height: 1.8;
}
.content-raw p {
  margin-bottom: 1em;
}
.content-raw h1,
.content-raw h2,
.content-raw h3 {
  font-weight: bold;
  margin: 1.2em 0 0.5em;
  color: #2c2416;
}
.content-raw ul,
.content-raw ol {
  padding-left: 1.5em;
  margin-bottom: 1em;
}
.content-empty {
  color: #9c8e80;
  font-style: italic;
  padding: 16px 0;
}

/* Mode contraste élevé — malvoyant */
.hi-contrast {
  background: #000;
  color: #ffe066;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid rgba(255, 224, 102, 0.3);
}
.hi-contrast .content-h {
  color: #ffe066;
}
.hi-contrast .content-p {
  color: #fff;
}
.hi-contrast .content-kp {
  background: rgba(255, 224, 102, 0.1);
  border-color: rgba(255, 224, 102, 0.4);
  border-left-color: #ffe066;
}
.hi-contrast .kp-text {
  color: #ffe066;
}
.hi-contrast li {
  color: #fff;
}

/* Quiz CTA */
.quiz-cta {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(124, 58, 237, 0.15));
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 18px;
  padding: 24px 28px;
}
.cta-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.cta-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(79, 70, 229, 0.2);
  border: 1px solid rgba(79, 70, 229, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c4fe0;
  flex-shrink: 0;
}
.cta-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1rem;
  font-weight: bold;
  color: #2c2416;
  margin: 0 0 4px 0;
}
.cta-sub {
  font-size: 0.82rem;
  color: #6b5e4e;
  margin: 0;
}
.cta-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'Verdana', 'Geneva', sans-serif;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  margin-left: auto;
  transition: all 0.15s;
}
.cta-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .page-body {
    padding: 20px 14px 40px;
  }
  .cta-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .cta-btn {
    width: 100%;
    justify-content: center;
  }
  .audio-quick-btns {
    flex-direction: column;
  }
  .quick-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
