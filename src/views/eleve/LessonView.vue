<template>
  <div :class="['app', adaptiveClasses]" :style="{background:'#F5F2ED',color:'#2C2416'}" role="main">
    <AppTopbar :page-title="pageTitle" @logout="handleLogout" />
    <a href="#lesson-content" class="skip-link">Aller au contenu</a>

    <!-- Header -->
    <header class="page-header" role="banner">
      <div class="header-inner">
        <button class="back-btn" @click="goBack" type="button" aria-label="Retour aux cours">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          Cours
        </button>
        <div class="lesson-label">
          <div class="lesson-type-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
            Cours
          </div>
          <h1 class="lesson-title">{{ lesson.title }}</h1>
        </div>
        <div class="header-pts" aria-label="Vos points">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          {{ points.totalPoints }}
        </div>
      </div>
    </header>

    <div class="page-body" id="lesson-content">

      <!-- ── BLOC AUDIO (aveugle / normal) ── -->
      <section v-if="auth.hasAudioPlayer && audioUrl" class="content-block block--audio" aria-label="Lecteur audio">
        <div class="block-header">
          <div class="block-icon-wrap block-icon--audio" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div>
            <h2 class="block-title">Écouter le cours</h2>
            <p class="block-sub">Espace = Pause · ← → = ±10 secondes</p>
          </div>
        </div>
        <div class="audio-player" role="group" aria-label="Lecteur audio">
          <audio ref="audioEl" :src="audioUrl" @timeupdate="onTimeUpdate" @loadedmetadata="onLoaded" @ended="isPlaying = false" preload="metadata"></audio>
          <div class="audio-progress-row">
            <span class="time-tag">{{ fmt(currentTime) }}</span>
            <div class="audio-track"
              role="slider" tabindex="0"
              :aria-valuenow="Math.round(currentTime)"
              :aria-valuemin="0" :aria-valuemax="Math.round(duration)"
              :aria-label="`Position ${fmt(currentTime)} / ${fmt(duration)}`"
              @click="seek" @keydown.left="skip(-10)" @keydown.right="skip(10)">
              <div class="audio-fill" :style="{ width: audioPct + '%' }"></div>
              <div class="audio-thumb" :style="{ left: audioPct + '%' }"></div>
            </div>
            <span class="time-tag">{{ fmt(duration) }}</span>
          </div>
          <div class="audio-controls" role="group" aria-label="Contrôles">
            <button class="ctrl-btn" @click="skip(-10)" type="button" aria-label="Reculer 10 secondes">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><polyline points="1 4 1 10 7 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3.51 15a9 9 0 1 0 .49-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="8" y="14" font-size="5" fill="currentColor" font-weight="bold">-10</text></svg>
            </button>
            <button class="ctrl-btn ctrl-btn--play" @click="togglePlay" type="button"
              :aria-label="isPlaying ? 'Pause' : 'Lecture'" :aria-pressed="isPlaying">
              <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            </button>
            <button class="ctrl-btn" @click="skip(10)" type="button" aria-label="Avancer 10 secondes">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><polyline points="23 4 23 10 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20.49 15a9 9 0 1 1-.49-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="8" y="14" font-size="5" fill="currentColor" font-weight="bold">+10</text></svg>
            </button>
            <button class="ctrl-btn ctrl-btn--rate" @click="cycleRate" type="button" :aria-label="`Vitesse ${rate}x`">
              {{ rate }}x
            </button>
          </div>
          <div role="status" aria-live="polite" class="sr-only">{{ audioStatus }}</div>
        </div>
        <details class="transcription">
          <summary class="transcription-toggle">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Lire la transcription
          </summary>
          <div class="transcription-body">
            <p v-for="(p, i) in lesson.transcription" :key="i">{{ p }}</p>
          </div>
        </details>
      </section>

      <!-- ── BLOC VIDÉO (sourd / normal) ── -->
      <section v-if="auth.hasVideoPlayer && videoUrl" class="content-block block--video" aria-label="Vidéo avec sous-titres">
        <div class="block-header">
          <div class="block-icon-wrap block-icon--video" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/><path d="M8 10l8 2-8 2V10z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 18h2M11 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div>
            <h2 class="block-title">Vidéo du cours</h2>
            <p class="block-sub">Sous-titres activés automatiquement</p>
          </div>
        </div>
        <div class="video-wrap">
          <video class="lesson-video" controls :src="videoUrl" aria-label="Vidéo du cours">
            <track kind="subtitles" :src="subtitlesUrl" srclang="fr" label="Français" default/>
          </video>
        </div>
      </section>

      <!-- ── BLOC IMAGES (tous sauf aveugle) ── -->
      <section v-if="!auth.isBlind && lessonImages.length" class="content-block block--images" aria-label="Images du cours">
        <div class="block-header">
          <div class="block-icon-wrap block-icon--images" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div>
            <h2 class="block-title">Illustrations</h2>
            <p class="block-sub">{{ lessonImages.length }} image{{ lessonImages.length > 1 ? 's' : '' }}</p>
          </div>
        </div>
        <div class="images-grid">
          <figure v-for="(img, i) in lessonImages" :key="img.id" class="lesson-figure">
            <img :src="img.url" :alt="img.alt || `Illustration ${i+1}`" class="lesson-img" loading="lazy"/>
          </figure>
        </div>
      </section>

      <!-- ── BLOC TEXTE (tous) ── -->
      <section class="content-block block--text" aria-label="Contenu du cours">
        <div class="block-header">
          <div class="block-icon-wrap block-icon--text" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
          </div>
          <div>
            <h2 class="block-title">Contenu du cours</h2>
          </div>
        </div>

        <!-- Contrôles typo malvoyant -->
        <div v-if="auth.hasTypoControls" class="typo-controls" role="group" aria-label="Taille du texte">
          <button class="typo-btn" @click="fs = Math.max(14, fs-2)" type="button" aria-label="Diminuer">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
            A
          </button>
          <span class="typo-val" aria-live="polite">{{ fs }}px</span>
          <button class="typo-btn typo-btn--lg" @click="fs = Math.min(32, fs+2)" type="button" aria-label="Augmenter">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
            A
          </button>
          <button class="typo-btn" @click="hiContrast = !hiContrast" :aria-pressed="hiContrast" type="button" aria-label="Contraste élevé">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 3v18" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>
            Contraste
          </button>
        </div>

        <article class="lesson-content"
          :class="{ 'hi-contrast': hiContrast }"
          :style="{ fontSize: fs + 'px', lineHeight: '1.8' }">
          <template v-for="(block, i) in lesson.content" :key="i">
            <h3 v-if="block.type === 'heading'" class="content-h">{{ block.text }}</h3>
            <p v-else-if="block.type === 'paragraph'" class="content-p">{{ block.text }}</p>
            <div v-else-if="block.type === 'keypoint'" class="content-kp" role="note">
              <div class="kp-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <p class="kp-text">{{ block.text }}</p>
            </div>
            <ul v-else-if="block.type === 'list'" class="content-list">
              <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
            </ul>
          </template>
          <!-- Fallback : afficher le HTML brut si pas de blocs parsés -->
          <div v-if="!lesson.content.length && lesson.rawHtml"
            class="content-raw"
            v-html="lesson.rawHtml">
          </div>
          <p v-if="!lesson.content.length && !lesson.rawHtml" class="content-empty">
            Ce cours n'a pas encore de contenu textuel.
          </p>
        </article>
      </section>

      <!-- ── CTA QUIZ ── -->
      <div class="quiz-cta">
        <div class="cta-inner">
          <div class="cta-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div>
            <p class="cta-title">{{ lesson.completed ? 'Quiz déjà passé' : 'Prêt à vous tester ?' }}</p>
            <p class="cta-sub">Gagnez jusqu'à <strong>+80 points</strong> sur ce quiz</p>
          </div>
          <button class="cta-btn" @click="goToQuiz" type="button" aria-label="Commencer le quiz">
            Commencer le quiz
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppTopbar            from '@/components/eleve/AppTopbar.vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore }  from '@/stores/theme'
import { useAuthStore }     from '@/stores/auth'
import { usePointsStore }   from '@/stores/points'
import { useProgressStore } from '@/stores/progress'

const router   = useRouter()
const route    = useRoute()
const auth     = useAuthStore()
const theme    = useThemeStore()
const points   = usePointsStore()
const progress = useProgressStore()

const subjectId = route.params.subjectId
const lessonId  = route.params.lessonId

const adaptiveClasses = computed(() => ({
  'mode-contrast':   auth.needsHighContrast,
  'mode-large-text': auth.needsLargeText,
}))

// Audio
const audioEl     = ref(null)
const isPlaying   = ref(false)
const currentTime = ref(0)
const duration    = ref(0)
const rate        = ref(1)
const audioStatus = ref('')
const audioPct    = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)

// Texte
const fs         = ref(auth.isLowVision ? 20 : 16)
const hiContrast = ref(auth.needsHighContrast)

// ── Données API ──────────────────────────────────────────
const apiCours = computed(() =>
  auth.cours.find(c => String(c.id) === String(lessonId))
)

const pageTitle = computed(() => apiCours.value?.titre || apiCours.value?.title || 'Leçon')

const courseMedias = computed(() => apiCours.value?.medias || [])

// URLs médias réactives — se mettent à jour avec apiCours
const audioUrl = computed(() => auth.mediaUrl(courseMedias.value.find(m => m.type === 'audio')?.url || ''))
const videoUrl = computed(() => auth.mediaUrl(courseMedias.value.find(m => m.type === 'video')?.url || ''))
const subtitlesUrl = computed(() => auth.mediaUrl(courseMedias.value.find(m => m.type === 'subtitle')?.url || ''))

const lessonImages = computed(() =>
  courseMedias.value
    .filter(m => m.type === 'image')
    .map(m => ({ ...m, url: auth.mediaUrl(m.url) }))
)

// Convertir HTML du contenu en blocs affichables
function htmlToBlocks(html) {
  if (!html) return []
  const div = document.createElement('div')
  div.innerHTML = html
  const blocks = []
  div.childNodes.forEach(node => {
    const tag  = node.nodeName?.toLowerCase()
    const text = node.textContent?.trim()
    if (!text) return
    if (['h1','h2','h3','h4'].includes(tag))  blocks.push({ type: 'heading',   text })
    else if (tag === 'ul' || tag === 'ol') {
      const items = [...node.querySelectorAll('li')].map(li => li.textContent.trim()).filter(Boolean)
      if (items.length) blocks.push({ type: 'list', items })
    }
    else if (tag === 'blockquote')            blocks.push({ type: 'keypoint',  text })
    else if (text.length > 2)                 blocks.push({ type: 'paragraph', text })
  })
  return blocks.length ? blocks : [{ type: 'paragraph', text: html.replace(/<[^>]+>/g,' ').trim() }]
}

const lesson = ref({
  id:           lessonId,
  title:        '',
  completed:    false,
  audioUrl:     '',
  videoUrl:     '',
  subtitlesUrl: '',
  transcription: [],
  content:      [],
  rawHtml:      '',
})

function togglePlay() {
  if (!audioEl.value) return
  if (isPlaying.value) { audioEl.value.pause(); audioStatus.value = 'Pause.' }
  else                 { audioEl.value.play();  audioStatus.value = 'Lecture.' }
  isPlaying.value = !isPlaying.value
}
function skip(s) {
  if (!audioEl.value) return
  audioEl.value.currentTime = Math.max(0, Math.min(duration.value, audioEl.value.currentTime + s))
  audioStatus.value = s > 0 ? `Avancé de ${s}s` : `Reculé de ${Math.abs(s)}s`
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
function onTimeUpdate() { if (audioEl.value) currentTime.value = audioEl.value.currentTime }
function onLoaded()     { if (audioEl.value) duration.value = audioEl.value.duration }
function fmt(s) {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const currentBlock = ref(0)

function handleLogout() {
  auth.logoutApi()
  router.push({ name: 'EleveLogin' })
}

function chargerCours(c) {
  if (!c) return
  console.log('[LessonView] chargerCours:', c.titre || c.title, '| contenu:', c.contenu?.slice(0,100))
  lesson.value.title        = c.titre || c.title || 'Cours'
  lesson.value.audioUrl     = auth.mediaUrl(courseMedias.value.find(m => m.type === 'audio')?.url  || '')
  lesson.value.videoUrl     = auth.mediaUrl(courseMedias.value.find(m => m.type === 'video')?.url  || '')
  lesson.value.subtitlesUrl = auth.mediaUrl(courseMedias.value.find(m => m.type === 'subtitle')?.url || '')
  lesson.value.transcription = [c.titre || c.title || '']
  lesson.value.rawHtml      = c.contenu || ''
  lesson.value.content      = htmlToBlocks(c.contenu || '')
  const total    = lesson.value.content.length
  const isResume = route.query.resume === '1'
  const lastBlock = progress.getLastBlock(subjectId, lessonId)
  progress.startCourse(subjectId, lessonId, Math.max(total, 1))
  if (isResume && lastBlock > 0) currentBlock.value = lastBlock
}

onMounted(() => {
  theme.apply()
  console.log('[LessonView] auth.cours:', auth.cours.length, '| lessonId:', lessonId)
  console.log('[LessonView] apiCours:', apiCours.value)
  console.log('[LessonView] user.classe:', auth.user?.classe?.enseignant ? 'hasOne OK' : 'hasOne MISSING', auth.user?.classe)
  if (apiCours.value) {
    chargerCours(apiCours.value)
  }
})

// Réagir quand les données API arrivent après le montage
watch(apiCours, (c) => {
  if (c && !lesson.value.content.length) chargerCours(c)
}, { immediate: false })

function saveCurrentBlock(index) {
  progress.saveBlock(subjectId, lessonId, index)
}

function goBack() {
  router.push({
    name: auth.isBlind ? 'BlindCourses' : 'Courses',
    params: { subjectId: route.params.subjectId }
  })
}

function goToQuiz() {
  progress.completeCourse(subjectId, lessonId)
  router.push({
    name: auth.isBlind ? 'BlindQuiz' : 'Quiz',
    params: {
      subjectId: route.params.subjectId,
      lessonId:  route.params.lessonId
    }
  })
}
</script>

<style scoped>
/* ── Palette fixe clair doux ── */
.app, .bv-page {
  --bg:            #F5F2ED;
  --bg2:           #EDE9E3;
  --surface:       #FDFBF8;
  --surface2:      #F0EDE7;
  --border:        rgba(120,100,80,0.12);
  --border2:       rgba(120,100,80,0.2);
  --text:          #2C2416;
  --text2:         #6B5E4E;
  --text3:         #9C8E80;
  --accent:        #5C4FE0;
  --accent2:       #7C3AED;
  --accent-bg:     rgba(92,79,224,0.08);
  --accent-border: rgba(92,79,224,0.22);
  --green:         #1A7A46;
  --green-bg:      rgba(26,122,70,0.08);
  --green-border:  rgba(26,122,70,0.2);
  --red:           #B83232;
  --red-bg:        rgba(184,50,50,0.07);
  --red-border:    rgba(184,50,50,0.2);
  --yellow:        #8A6200;
  --yellow-bg:     rgba(138,98,0,0.08);
  --yellow-border: rgba(138,98,0,0.2);
  --font-b:        'Verdana', 'Geneva', sans-serif;
  --font-d:        'Georgia', 'Times New Roman', serif;
  --radius:        18px;
}


.sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0); }

.app {
  min-height:100vh; background:#F5F2ED; font-family:'Verdana', 'Geneva', sans-serif; color:#2C2416;
  --radius: 18px;
}
.app.mode-contrast   { --bg:#000;--surface:#0A0A0A;--text:#FFF;--text2:#DDD;--border:rgba(255,255,255,.2); }
.app.mode-large-text { font-size:1.1rem; }

.skip-link { position:absolute;top:-100px;left:16px;background:#5C4FE0;color:#FFF;padding:10px 18px;border-radius:8px;font-weight:bold;z-index:9999;text-decoration:none; }
.skip-link:focus { top:16px; }

.page-header { background:#FDFBF8;border-bottom:1px solid rgba(120,100,80,0.12);position:sticky;top:0;z-index:100; }
.header-inner { max-width:860px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:16px; }
.back-btn { display:flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;color:#6B5E4E;border:1px solid rgba(120,100,80,0.12);border-radius:10px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.875rem;cursor:pointer;flex-shrink:0;transition:all .15s; }
.back-btn:hover { color:#2C2416;border-color:rgba(120,100,80,0.2); }
.back-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.lesson-label { display:flex;align-items:center;gap:10px;flex:1;min-width:0; }
.lesson-type-badge { display:flex;align-items:center;gap:5px;padding:4px 10px;background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);border-radius:999px;font-size:.72rem;color:#6B5E4E;flex-shrink:0; }
.lesson-title { font-family:'Georgia', 'Times New Roman', serif;font-size:1rem;font-weight:bold;color:#2C2416;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.header-pts { display:flex;align-items:center;gap:5px;padding:6px 12px;background:rgba(79,70,229,.12);border:1px solid rgba(79,70,229,.25);color:#5C4FE0;border-radius:999px;font-size:.82rem;font-weight:bold;flex-shrink:0; }

.page-body { max-width:860px;margin:0 auto;padding:32px 24px 60px;display:flex;flex-direction:column;gap:20px; }

.content-block { background:#FDFBF8;border:1px solid rgba(120,100,80,0.12);border-radius:18px;padding:28px;border-top:3px solid; }
.block--audio  { border-top-color:#F59E0B; }
.block--video  { border-top-color:#8B5CF6; }
.block--text   { border-top-color:#5C4FE0; }
.block--images { border-top-color:#10B981; }

.block-header { display:flex;align-items:flex-start;gap:16px;margin-bottom:24px; }
.block-icon-wrap { width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.block-icon--audio  { background:rgba(245,158,11,.12);color:#F59E0B;border:1px solid rgba(245,158,11,.2); }
.block-icon--video  { background:rgba(139,92,246,.12);color:#8B5CF6;border:1px solid rgba(139,92,246,.2); }
.block-icon--text   { background:rgba(79,70,229,.12);color:#5C4FE0;border:1px solid rgba(79,70,229,.2); }
.block-icon--images { background:rgba(16,185,129,.12);color:#10B981;border:1px solid rgba(16,185,129,.2); }
.block-title { font-family:'Georgia', 'Times New Roman', serif;font-size:1.1rem;font-weight:bold;color:#2C2416;margin:0 0 4px 0; }
.block-sub   { font-size:.8rem;color:#6B5E4E;margin:0; }

.audio-player { display:flex;flex-direction:column;gap:18px; }
.audio-progress-row { display:flex;align-items:center;gap:12px; }
.time-tag { font-size:.78rem;color:#9C8E80;min-width:36px; }
.audio-track { flex:1;height:6px;background:rgba(120,100,80,0.15);border-radius:999px;position:relative;cursor:pointer; }
.audio-track:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.audio-fill  { height:100%;background:linear-gradient(90deg,#F59E0B,#EF4444);border-radius:999px;pointer-events:none; }
.audio-thumb { position:absolute;top:50%;transform:translate(-50%,-50%);width:16px;height:16px;background:#FFF;border:3px solid #F59E0B;border-radius:50%;pointer-events:none;box-shadow:0 0 8px rgba(245,158,11,.4); }
.audio-controls { display:flex;align-items:center;justify-content:center;gap:14px; }
.ctrl-btn { display:flex;align-items:center;justify-content:center;padding:10px 16px;background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);color:#6B5E4E;border-radius:10px;cursor:pointer;font-family:'Verdana', 'Geneva', sans-serif;font-size:.85rem;font-weight:bold;transition:all .15s;min-width:52px; }
.ctrl-btn:hover { color:#2C2416; }
.ctrl-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }
.ctrl-btn--play { width:64px;height:64px;min-width:64px;border-radius:50%;background:linear-gradient(135deg,#F59E0B,#EF4444);color:#FFF;border:none;box-shadow:0 8px 20px rgba(245,158,11,.3); }
.ctrl-btn--play:hover { transform:scale(1.05); }
.ctrl-btn--rate { font-size:.8rem; }

.transcription { margin-top:8px;border:1px solid rgba(120,100,80,0.12);border-radius:12px;overflow:hidden; }
.transcription-toggle { display:flex;align-items:center;gap:8px;padding:13px 16px;cursor:pointer;font-size:.875rem;font-weight:bold;color:#6B5E4E;list-style:none;background:#FDFBF8; }
.transcription-toggle::-webkit-details-marker { display:none; }
.transcription-body { padding:16px;border-top:1px solid rgba(120,100,80,0.12); }
.transcription-body p { margin:0 0 10px 0;color:#6B5E4E;line-height:1.7;font-size:.9rem; }

.video-wrap { border-radius:12px;overflow:hidden;background:#FDFBF8; }
.lesson-video { width:100%;display:block;max-height:400px;object-fit:contain; }

.typo-controls { display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap; }
.typo-btn { display:flex;align-items:center;gap:5px;padding:8px 14px;background:#F0EDE7;border:1px solid rgba(120,100,80,0.12);color:#6B5E4E;border-radius:8px;font-family:'Verdana', 'Geneva', sans-serif;cursor:pointer;transition:all .15s; }
.typo-btn:hover { color:#2C2416; }
.typo-btn--lg { font-size:1.05rem; }
.typo-btn[aria-pressed="true"] { background:rgba(79,70,229,.15);color:#5C4FE0;border-color:rgba(79,70,229,.3); }
.typo-val { font-size:.78rem;color:#9C8E80;min-width:36px;text-align:center; }

.lesson-content { color:#6B5E4E; }
.content-raw { color:#2C2416; line-height:1.8; }
.content-raw p { margin-bottom:1em; }
.content-raw h1,.content-raw h2,.content-raw h3 { font-weight:bold;margin:1.2em 0 .5em;color:#2C2416; }
.content-raw ul,.content-raw ol { padding-left:1.5em;margin-bottom:1em; }
.content-empty { color:#9C8E80;font-style:italic;padding:16px 0; }
.lesson-content.hi-contrast { background:#000;color:#FFF;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.2); }
.content-h  { font-family:'Georgia', 'Times New Roman', serif;font-size:1.15rem;font-weight:bold;color:#2C2416;margin:24px 0 10px 0; }
.content-p  { margin:0 0 14px 0;line-height:inherit; }
.content-kp { display:flex;gap:12px;align-items:flex-start;background:rgba(79,70,229,.08);border:1px solid rgba(79,70,229,.2);border-left:3px solid #5C4FE0;border-radius:0 10px 10px 0;padding:14px 16px;margin:16px 0; }
.kp-icon    { color:#5C4FE0;flex-shrink:0;padding-top:2px; }
.kp-text    { margin:0;color:#2C2416;font-size:.9rem;line-height:1.6; }
.content-list { padding-left:20px;margin:10px 0 14px;display:flex;flex-direction:column;gap:6px;color:#6B5E4E; }

.images-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px; }
.lesson-figure { margin:0;border-radius:12px;overflow:hidden;background:#F0EDE7;border:1px solid rgba(120,100,80,0.12); }
.lesson-img { width:100%;height:200px;object-fit:cover;display:block;transition:transform .3s; }
.lesson-figure:hover .lesson-img { transform:scale(1.03); }

.quiz-cta { background:linear-gradient(135deg,rgba(79,70,229,.15),rgba(124,58,237,.15));border:1px solid rgba(79,70,229,.3);border-radius:18px;padding:24px 28px; }
.cta-inner { display:flex;align-items:center;gap:20px;flex-wrap:wrap; }
.cta-icon { width:52px;height:52px;border-radius:14px;background:rgba(79,70,229,.2);border:1px solid rgba(79,70,229,.3);display:flex;align-items:center;justify-content:center;color:#5C4FE0;flex-shrink:0; }
.cta-title { font-family:'Georgia', 'Times New Roman', serif;font-size:1rem;font-weight:bold;color:#2C2416;margin:0 0 4px 0; }
.cta-sub   { font-size:.82rem;color:#6B5E4E;margin:0; }
.cta-sub strong { color:#4ADE80; }
.cta-btn   { display:flex;align-items:center;gap:8px;padding:14px 24px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#FFF;border:none;border-radius:12px;font-family:'Verdana', 'Geneva', sans-serif;font-size:.95rem;font-weight:bold;cursor:pointer;margin-left:auto;transition:all .15s;box-shadow:0 8px 20px rgba(79,70,229,.3); }
.cta-btn:hover { transform:translateY(-2px);box-shadow:0 12px 28px rgba(79,70,229,.4); }
.cta-btn:focus-visible { outline:none;box-shadow:0 0 0 3px rgba(92,79,224,0.35); }

@media(max-width:640px) {
  .page-body { padding:20px 14px 40px; }
  .cta-inner { flex-direction:column;align-items:flex-start; }
  .cta-btn   { width:100%;justify-content:center; }
}
</style>