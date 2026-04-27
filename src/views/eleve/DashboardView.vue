<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet, apiPost } from '@/helpers/axiosApi'
import AppTopbar from '@/components/eleve/AppTopbar.vue'

const router = useRouter()
const eleve = ref(null)
const loading = ref(true)
const error = ref('')
const showHistorique = ref(false)
// FIX: Trisomie — contrôle combien de matières on affiche
const showAllSimplified = ref(false)
const SIMPLIFIED_LIMIT = 3

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
const ICON_PATH = 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await apiGet('eleve/getEleve')
    eleve.value = response.data?.data || response.data
    localStorage.setItem('eleve', JSON.stringify(eleve.value))
  } catch {
    error.value = 'Impossible de charger les matières. Vérifiez votre connexion.'
  } finally {
    loading.value = false
  }
}

const handicapId = computed(() => eleve.value?.handicap?.id ?? 1)
const isAutisme = computed(() => handicapId.value === 5)
const isTrisomie = computed(() => handicapId.value === 6)
const isTDAH = computed(() => handicapId.value === 7)
const isIMC = computed(() => handicapId.value === 8)
const isDI = computed(() => handicapId.value === 9)
const isSimplified = computed(() => isTrisomie.value || isDI.value)
const isMotor = computed(() => isIMC.value)
const isFocus = computed(() => isTDAH.value)

const today = new Date().toISOString().split('T')[0]
const allCours = computed(() => eleve.value?.classe?.enseignant?.cours ?? [])

const coursFiltres = computed(() =>
  allCours.value.filter((c) => {
    if (!c.date_programmation) return false
    const dp = c.date_programmation.split('T')[0]
    if (showHistorique.value) return dp < today
    return dp === today
  }),
)

// Toutes les matières calculées (sans limite)
const allSubjects = computed(() => {
  const sourceCours = showHistorique.value ? allCours.value : coursFiltres.value
  const map = {}
  sourceCours.forEach((c, idx) => {
    const m = c.matiere
    if (m && !map[m.id]) map[m.id] = { ...m, idx, courseCount: 0 }
    if (m) map[m.id].courseCount++
  })
  let list = Object.values(map).map((m) => ({
    id: m.id,
    name: m.name,
    color: COLORS[m.idx % COLORS.length],
    iconPath: ICON_PATH,
    courseCount: m.courseCount,
  }))
  return list
})

// FIX: Pour Trisomie/DI, on limite à SIMPLIFIED_LIMIT sauf si showAllSimplified
const subjects = computed(() => {
  const list = allSubjects.value
  if (isSimplified.value && !showAllSimplified.value) {
    return list.slice(0, SIMPLIFIED_LIMIT)
  }
  return list
})

// FIX: Y a-t-il des matières cachées pour Trisomie/DI ?
const hasMoreSimplified = computed(
  () => isSimplified.value && allSubjects.value.length > SIMPLIFIED_LIMIT,
)

const featuredSubject = computed(() =>
  isTDAH.value && subjects.value.length ? subjects.value[0] : null,
)

const goTo = (id) => router.push({ name: 'Courses', params: { subjectId: id } })

const speakAndGoTo = (subject) => {
  if (isDI.value || isTrisomie.value) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(subject.name)
    u.lang = 'fr-FR'
    u.rate = 0.85
    u.onend = () => goTo(subject.id)
    u.onerror = () => goTo(subject.id)
    window.speechSynthesis.speak(u)
  } else {
    goTo(subject.id)
  }
}

const toggleHistorique = () => {
  showHistorique.value = !showHistorique.value
  showAllSimplified.value = false // reset quand on change de mode
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
  <div
    :class="[
      'app',
      { 'app--focus': isFocus, 'app--simplified': isSimplified, 'app--motor': isMotor },
    ]"
    role="main"
  >
    <a href="#subjects" class="skip-link">Aller aux matières</a>
    <AppTopbar page-title="Mes matières" @logout="handleLogout" />

    <main class="main" id="subjects" tabindex="-1">
      <div v-if="loading" class="loading-state" aria-live="polite">
        <div class="spinner"></div>
        <p>Chargement des matières…</p>
      </div>

      <div v-else-if="error" class="error-state" role="alert">
        <p>{{ error }}</p>
        <button @click="loadData" type="button" class="retry-btn">Réessayer</button>
      </div>

      <template v-else>
        <div class="main-header">
          <div>
            <h1 v-if="isSimplified" class="main-title main-title--simple">
              Bonjour {{ eleve?.prenom }} !
            </h1>
            <h1 v-else class="main-title">
              {{ showHistorique ? 'Historique des cours' : 'Cours du jour' }}
            </h1>
            <p v-if="!isSimplified" class="main-sub">
              Bonjour {{ eleve?.prenom }} —
              {{ showHistorique ? 'Tous vos cours passés' : "Cours programmés pour aujourd'hui" }}
            </p>
          </div>
          <button
            v-if="!isSimplified"
            class="historique-btn"
            :class="{ 'historique-btn--active': showHistorique }"
            @click="toggleHistorique"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <polyline
                points="12 6 12 12 16 14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {{ showHistorique ? 'Cours du jour' : 'Historique' }}
          </button>
        </div>

        <!-- TDA/H : matière mise en avant -->
        <div
          v-if="featuredSubject"
          class="featured-subject"
          @click="goTo(featuredSubject.id)"
          role="button"
          tabindex="0"
          @keydown.enter="goTo(featuredSubject.id)"
        >
          <div class="featured-label">Continuer ici →</div>
          <div class="featured-name">{{ featuredSubject.name }}</div>
          <div class="featured-count">{{ featuredSubject.courseCount }} cours</div>
        </div>

        <div v-if="subjects.length === 0" class="empty-state">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            width="40"
            height="40"
            style="opacity: 0.3; margin-bottom: 12px"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          <p v-if="showHistorique">Aucun cours passé pour le moment.</p>
          <p v-else>Aucun cours programmé pour aujourd'hui.</p>
          <button
            v-if="!showHistorique"
            class="historique-btn"
            @click="toggleHistorique"
            type="button"
          >
            Voir l'historique
          </button>
        </div>

        <!-- Trisomie / DI : boutons simples avec TTS -->
        <div v-else-if="isSimplified" class="subjects-simple" role="list">
          <button
            v-for="s in subjects"
            :key="s.id"
            class="simple-btn"
            :style="{ '--cc': s.color }"
            @click="speakAndGoTo(s)"
            role="listitem"
            :aria-label="`${s.name}, appuyez pour écouter et ouvrir`"
          >
            <div class="simple-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                width="32"
                height="32"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path :d="s.iconPath" />
              </svg>
            </div>
            <div class="simple-body">
              <span class="simple-name">{{ s.name }}</span>
              <span class="simple-hint">🔊 Appuyez pour écouter</span>
            </div>
            <span class="simple-count">{{ s.courseCount }} cours</span>
          </button>

          <!-- FIX: Bouton "Voir plus" si matières cachées -->
          <button
            v-if="hasMoreSimplified && !showAllSimplified"
            class="simple-btn simple-btn--more"
            @click="showAllSimplified = true"
            type="button"
            :aria-label="`Voir ${allSubjects.length - SIMPLIFIED_LIMIT} matière(s) de plus`"
          >
            <div class="simple-icon simple-icon--more" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                width="28"
                height="28"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <div class="simple-body">
              <span class="simple-name">Voir plus</span>
              <span class="simple-hint"
                >{{ allSubjects.length - SIMPLIFIED_LIMIT }} matière(s) supplémentaire(s)</span
              >
            </div>
          </button>

          <!-- Bouton réduire -->
          <button
            v-if="showAllSimplified && hasMoreSimplified"
            class="simple-btn simple-btn--less"
            @click="showAllSimplified = false"
            type="button"
          >
            <div class="simple-icon simple-icon--more" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                width="28"
                height="28"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <div class="simple-body">
              <span class="simple-name">Voir moins</span>
            </div>
          </button>
        </div>

        <!-- Grille normale -->
        <div v-else class="subjects-grid" role="list">
          <article
            v-for="(s, idx) in subjects"
            :key="s.id"
            class="subject-card"
            role="listitem"
            tabindex="0"
            :aria-label="`${s.name}, ${s.courseCount} cours disponibles`"
            @click="goTo(s.id)"
            @keydown.enter="goTo(s.id)"
            @keydown.space.prevent="goTo(s.id)"
            :style="{ '--cc': s.color, '--cd': isFocus ? '0s' : idx * 0.07 + 's' }"
          >
            <div class="card-glow" aria-hidden="true"></div>
            <div class="card-top">
              <div class="card-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path :d="s.iconPath" />
                </svg>
              </div>
              <span class="card-badge">{{ s.courseCount }} cours</span>
            </div>
            <h2 class="card-name">{{ s.name }}</h2>
            <p v-if="!isAutisme" class="card-desc">{{ s.courseCount }} cours disponibles</p>
            <div class="card-foot">
              <div class="card-track"><div class="card-fill" style="width: 0%"></div></div>
              <div class="card-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
          </article>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--bg, #f5f2ed);
  font-family: 'Verdana', 'Geneva', sans-serif;
  color: #2c2416;
  display: flex;
  flex-direction: column;
}
.app--focus {
  background: #f8f8f5;
}
.app--focus .subject-card {
  animation: none !important;
}
.app--motor .subject-card {
  min-height: 100px;
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
.main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 36px 42px;
  overflow-y: auto;
}
.main-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 16px;
  flex-wrap: wrap;
}
.main-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.85rem;
  font-weight: bold;
  color: #2c2416;
  margin: 0 0 4px;
}
.main-title--simple {
  font-size: 2.2rem;
}
.main-sub {
  font-size: 0.875rem;
  color: #6b5e4e;
  margin: 0;
}
.historique-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  background: #fdfbf8;
  border: 1.5px solid rgba(120, 100, 80, 0.2);
  color: #6b5e4e;
  border-radius: 10px;
  font-family: 'Verdana', 'Geneva', sans-serif;
  font-size: 0.82rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.historique-btn:hover {
  border-color: #5c4fe0;
  color: #5c4fe0;
  background: rgba(79, 70, 229, 0.04);
}
.historique-btn--active {
  background: rgba(79, 70, 229, 0.1);
  border-color: #5c4fe0;
  color: #5c4fe0;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: #6b5e4e;
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
.error-state {
  text-align: center;
  padding: 60px 0;
  color: #b83232;
}
.retry-btn {
  margin-top: 12px;
  padding: 10px 22px;
  background: #5c4fe0;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #6b5e4e;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.featured-subject {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  border-radius: 16px;
  padding: 22px 28px;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.15s;
  outline: none;
}
.featured-subject:hover,
.featured-subject:focus-visible {
  transform: translateY(-2px);
}
.featured-label {
  font-size: 0.78rem;
  font-weight: bold;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.featured-name {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.4rem;
  font-weight: bold;
}
.featured-count {
  font-size: 0.82rem;
  opacity: 0.75;
}
.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.subject-card {
  background: #fdfbf8;
  border: 1px solid rgba(120, 100, 80, 0.12);
  border-radius: 16px;
  padding: 22px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  outline: none;
  transition:
    transform 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  animation: card-in 0.4s ease both;
  animation-delay: var(--cd, 0s);
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.subject-card:hover {
  transform: translateY(-3px);
  border-color: #5c4fe0;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.12),
    0 0 0 1px #5c4fe0;
}
.subject-card:focus-visible {
  border-color: #5c4fe0;
  box-shadow: 0 0 0 3px rgba(92, 79, 224, 0.35);
}
.app--motor .subject-card {
  padding: 28px;
}
.card-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #5c4fe0;
  opacity: 0.07;
  filter: blur(32px);
  pointer-events: none;
}
.subject-card:hover .card-glow {
  opacity: 0.13;
}
.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}
.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0ede7;
  border: 1px solid rgba(120, 100, 80, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c4fe0;
}
.app--motor .card-icon {
  width: 60px;
  height: 60px;
}
.card-badge {
  padding: 3px 9px;
  background: #f0ede7;
  border: 1px solid rgba(120, 100, 80, 0.12);
  border-radius: 999px;
  font-size: 0.72rem;
  color: #6b5e4e;
  font-weight: bold;
}
.card-name {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1rem;
  font-weight: bold;
  color: #2c2416;
  margin: 0 0 5px;
}
.card-desc {
  font-size: 0.78rem;
  color: #6b5e4e;
  margin: 0 0 16px;
  line-height: 1.5;
}
.card-foot {
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-track {
  flex: 1;
  height: 4px;
  background: rgba(120, 100, 80, 0.15);
  border-radius: 999px;
  overflow: hidden;
}
.card-fill {
  height: 100%;
  background: #5c4fe0;
  border-radius: 999px;
}
.card-arrow {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #5c4fe0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.subject-card:hover .card-arrow {
  transform: translateX(3px);
}
.app--motor .card-arrow {
  width: 40px;
  height: 40px;
}
.subjects-simple {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.simple-btn {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  background: #fdfbf8;
  border: 2px solid rgba(120, 100, 80, 0.15);
  border-radius: 18px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  width: 100%;
  min-height: 84px;
}
.simple-btn:hover {
  border-color: var(--cc, #5c4fe0);
  background: rgba(0, 0, 0, 0.02);
  transform: translateX(4px);
}
.simple-btn:active {
  transform: scale(0.98);
}

/* FIX: Styles boutons "Voir plus / Voir moins" */
.simple-btn--more {
  border-color: rgba(79, 70, 229, 0.3);
  background: rgba(79, 70, 229, 0.04);
}
.simple-btn--more:hover {
  border-color: #5c4fe0;
  background: rgba(79, 70, 229, 0.08);
  transform: translateX(4px);
}
.simple-btn--less {
  border-style: dashed;
  border-color: rgba(120, 100, 80, 0.25);
  background: rgba(120, 100, 80, 0.04);
}
.simple-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #f0ede7;
  border: 1px solid rgba(120, 100, 80, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c4fe0;
  flex-shrink: 0;
}
.simple-icon--more {
  background: rgba(79, 70, 229, 0.1);
  border-color: rgba(79, 70, 229, 0.2);
}
.simple-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.simple-name {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c2416;
}
.simple-hint {
  font-size: 0.72rem;
  color: #9c8e80;
}
.simple-count {
  font-size: 0.85rem;
  color: #9c8e80;
  font-weight: bold;
  flex-shrink: 0;
}
@media (max-width: 900px) {
  .main {
    padding: 20px 16px;
  }
}
</style>
