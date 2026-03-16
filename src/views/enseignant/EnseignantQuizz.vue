<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, h } from 'vue'
import { apiGet, apiPost, apiDelete } from '@/helpers/axiosApi'
import LoadingView from '@/components/admin/Loading.vue'


function getIconInner(name) {
  const icons = {
    'plus':          '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    'check':         '<polyline points="20 6 9 17 4 12"/>',
    'x':             '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    'trash':         '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    'edit':          '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    'quiz':          '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'results':       '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    'publish':       '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    'chart':         '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    'teachers':      '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    'clock':         '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'trophy':        '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
    'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  }
  return icons[name] ?? '<circle cx="12" cy="12" r="4"/>'
}
const AppIcon = (props, { attrs }) => h('svg', {
  width: props.size || 20, height: props.size || 20,
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  innerHTML: getIconInner(props.name), ...attrs,
})


const userAuth  = ref(null)
const loading   = ref(true)

const apiGetUser = async () => {
  try {
    const response = await apiGet('enseignant/getEnseignant')
    userAuth.value = response.data.data
    console.log('userAuth:', userAuth.value)
  } catch (error) {
    console.error('erreur getEnseignant:', error.response?.data ?? error)
  }
}

const refresh = async () => {
  await apiGetUser()
}

// ─────────────────────────────────────────────
// COMPUTED — matières, cours, quiz
// ─────────────────────────────────────────────
const mySubjects = computed(() => userAuth.value?.classe?.matieres ?? [])

const myCours = computed(() =>
  mySubjects.value
    .flatMap(m => m.cours ?? [])
    .filter(c => c.enseignant_id === userAuth.value?.id)
)

const myQuizzes = computed(() =>
  myCours.value.flatMap(c => c.quizzes ?? [])
)

function getCoursTitre(cours_id) {
  return myCours.value.find(c => c.id === cours_id)?.title ?? '—'
}

function getCoursByMatiere(matiere_id) {
  if (!matiere_id) return myCours.value
  const mat = mySubjects.value.find(m => m.id === matiere_id)
  return (mat?.cours ?? []).filter(c => c.enseignant_id === userAuth.value?.id)
}

// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
const activeQuiz = ref(null)
const view       = ref('list')

function openEditor(q) {
  activeQuiz.value = myQuizzes.value.find(x => x.id === q.id) ?? q
  view.value = 'editor'
  stopPolling()
}
function openResults(q) {
  activeQuiz.value = myQuizzes.value.find(x => x.id === q.id) ?? q
  view.value = 'results'
  startPolling(q.id)
}
function backToList() {
  activeQuiz.value = null
  view.value = 'list'
  stopPolling()
}
function backToEditor() {
  view.value = 'editor'
  stopPolling()
}

const syncActiveQuiz = () => {
  if (activeQuiz.value) {
    activeQuiz.value = myQuizzes.value.find(x => x.id === activeQuiz.value.id) ?? null
  }
}

// ─────────────────────────────────────────────
// CRÉER UN QUIZ
// ─────────────────────────────────────────────
const creating        = ref(false)
const createName      = ref('')
const createMatiereId = ref(null)
const createCoursId   = ref(null)
const createLoading   = ref(false)

const filteredCoursCreate = computed(() => getCoursByMatiere(createMatiereId.value))

function openCreate() {
  creating.value        = true
  createName.value      = ''
  createMatiereId.value = mySubjects.value.length === 1 ? mySubjects.value[0].id : null
  createCoursId.value   = null
}

function onMatiereChange() {
  const still = filteredCoursCreate.value.find(c => c.id === createCoursId.value)
  if (!still) createCoursId.value = null
}

const submitCreateQuiz = async () => {
  if (!createName.value.trim() || !createCoursId.value) return
  createLoading.value = true
  try {
    await apiPost('quiz/store', {
      name:          createName.value.trim(),
      cours_id:      createCoursId.value,
      enseignant_id: userAuth.value.id,
    })
    await refresh()
    syncActiveQuiz()
    creating.value = false
    const newQuiz = [...myQuizzes.value].reverse().find(q => q.cours_id === createCoursId.value)
    if (newQuiz) openEditor(newQuiz)
  } finally {
    createLoading.value = false
  }
}

// ─────────────────────────────────────────────
// SUPPRIMER UN QUIZ
// ─────────────────────────────────────────────
const deleteQuiz = async (q) => {
  if (!confirm(`Supprimer « ${q.name} » ?`)) return
  await apiDelete(`quiz/destroy/${q.id}`)
  await refresh()
  if (activeQuiz.value?.id === q.id) backToList()
}

// ─────────────────────────────────────────────
// QUESTIONS
// ─────────────────────────────────────────────
const addingQuestion  = ref(false)
const questionDraft   = ref('')
const questionLoading = ref(false)

const submitQuestion = async () => {
  const text = questionDraft.value.trim()
  if (!text || !activeQuiz.value) return
  questionLoading.value = true
  try {
    await apiPost('question/store', {
      question: text,
      quiz_id:  activeQuiz.value.id,
    })
    questionDraft.value  = ''
    addingQuestion.value = false
    await refresh()
    syncActiveQuiz()
  } finally {
    questionLoading.value = false
  }
}

const deleteQuestion = async (qu) => {
  if (!confirm('Supprimer cette question ?')) return
  await apiDelete(`question/destroy/${qu.id}`)
  await refresh()
  syncActiveQuiz()
}

// ─────────────────────────────────────────────
// RÉPONSES
// ─────────────────────────────────────────────
const addingReponseTo = ref(null)
const reponseDraft    = reactive({})
const correctDraft    = reactive({})
const reponseInputs   = reactive({})

function openAddReponse(qu) {
  addingReponseTo.value = qu.id
  reponseDraft[qu.id]   = ''
  correctDraft[qu.id]   = false
  nextTick(() => { if (reponseInputs[qu.id]) reponseInputs[qu.id].focus() })
}

const submitReponse = async (qu) => {
  const text = (reponseDraft[qu.id] || '').trim()
  if (!text) return
  await apiPost('reponse/store', {
    question_id: qu.id,
    listReponse: [{ name: text, status: correctDraft[qu.id] ? 'correct' : 'incorrect' }],
  })
  addingReponseTo.value = null
  reponseDraft[qu.id]   = ''
  correctDraft[qu.id]   = false
  await refresh()
  syncActiveQuiz()
}

const updateReponseStatus = async (qu, rep, event) => {
  const status = event.target.value
  await apiPost(`reponse/update/${rep.id}`, {
    question_id: qu.id,
    listReponse: [{ name: rep.name, status }],
  })
  await refresh()
  syncActiveQuiz()
}

const deleteReponse = async (qu, rep) => {
  await apiDelete(`reponse/destroy/${rep.id}`)
  await refresh()
  syncActiveQuiz()
}

// ─────────────────────────────────────────────
// PUBLICATION
// ─────────────────────────────────────────────
const publishing     = ref(false)
const publishSuccess = ref(false)

const totalReponses = computed(() =>
  activeQuiz.value?.questions?.reduce((acc, qu) => acc + (qu.reponses?.length ?? 0), 0) ?? 0
)
const canPublish = computed(() =>
  (activeQuiz.value?.questions?.length ?? 0) > 0 &&
  activeQuiz.value.questions.every(qu => (qu.reponses?.length ?? 0) > 0)
)

const publishQuiz = async () => {
  if (!canPublish.value) return
  publishing.value     = true
  publishSuccess.value = false
  setTimeout(() => {
    publishing.value     = false
    publishSuccess.value = true
    setTimeout(() => { publishSuccess.value = false }, 3000)
  }, 800)
}

// ─────────────────────────────────────────────
// RÉSULTATS
// ─────────────────────────────────────────────
const filteredResults = computed(() => {
  const eleves = userAuth.value?.classe?.eleves ?? []
  return eleves.map(e => {
    const note = e.notes?.find(n => n.quiz_id === activeQuiz.value?.id) ?? null
    const total = activeQuiz.value?.questions?.length ?? 0
    return {
      id:    e.id,
      name:  `${e.prenom} ${e.name}`,
      score: note ? note.note : null,
      total,
    }
  })
})

const stats = computed(() => {
  const done = filteredResults.value.filter(r => r.score !== null)
  if (!done.length) return { avg: 0, doneCount: 0, successRate: 0 }
  const scores = done.map(r => (r.score / r.total) * 100)
  return {
    avg:         Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    doneCount:   done.length,
    successRate: Math.round((scores.filter(s => s >= 50).length / done.length) * 100),
  }
})

function pct(r) { return r.total ? Math.round((r.score / r.total) * 100) : 0 }
function scoreColor(r) {
  if (r.score === null) return 'var(--pro-muted)'
  const p = pct(r)
  if (p >= 80) return 'var(--pro-green)'
  if (p >= 50) return 'var(--pro-amber)'
  return 'var(--pro-red)'
}

const distribution = computed(() => {
  const done = filteredResults.value.filter(r => r.score !== null)
  const buckets = [
    { label: '0–20%',   min: 0,  max: 20,  count: 0, color: 'var(--pro-red)'   },
    { label: '20–40%',  min: 20, max: 40,  count: 0, color: '#F97316'          },
    { label: '40–60%',  min: 40, max: 60,  count: 0, color: 'var(--pro-amber)' },
    { label: '60–80%',  min: 60, max: 80,  count: 0, color: '#65A30D'          },
    { label: '80–100%', min: 80, max: 101, count: 0, color: 'var(--pro-green)' },
  ]
  done.forEach(r => {
    const p = pct(r)
    const b = buckets.find(b => p >= b.min && p < b.max)
    if (b) b.count++
  })
  const maxCount = Math.max(1, ...buckets.map(b => b.count))
  return buckets.map(b => ({ ...b, height: Math.max(4, (b.count / maxCount) * 100) }))
})

// ─────────────────────────────────────────────
// POLLING
// ─────────────────────────────────────────────
let _pollTimer = null
function startPolling() {
  stopPolling()
  _pollTimer = setInterval(() => { /* apiGet résultats quand route dispo */ }, 8000)
}
function stopPolling() {
  if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null }
}

// ─────────────────────────────────────────────
// HELPERS UI
// ─────────────────────────────────────────────
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

function getReponseClass(rep)      { return rep.status === 'correct' ? 'answer-correct' : 'answer-incorrect' }
function getReponseBadgeClass(rep) { return rep.status === 'correct' ? 'ans-badge-correct' : 'ans-badge-incorrect' }

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
onMounted(async () => {
  await apiGetUser()
  loading.value = false
})
onUnmounted(() => { stopPolling() })
</script>

<template>
  <div class="qv-root container">

   
    <LoadingView v-if="loading" :visible="loading" :fullscreen="true" message="Chargement" offset-top="100px" />

    <template v-else>

      <template v-if="view === 'list'">
        <div class="pro-page-header">
          <div>
            <h1 class="pro-page-title">Mes quiz</h1>
            <p class="pro-page-sub">{{ myQuizzes.length }} quiz créé(s)</p>
          </div>
          <button class="pro-btn pro-btn-green" @click="openCreate">
            <AppIcon name="plus" :size="15" /> Nouveau quiz
          </button>
        </div>

        <Transition name="slide-down">
          <div v-if="creating" class="create-box pro-card">
            <div class="create-box-head">
              <div class="create-box-icon"><AppIcon name="plus" :size="16" /></div>
              <span>Nouveau quiz</span>
            </div>
            <div class="create-box-fields">
              <div class="cbf-field" style="grid-column:1/-1">
                <label class="cbl">Titre du quiz <span class="req">*</span></label>
                <input
                  v-model="createName"
                  class="pro-input"
                  placeholder="Ex : Quiz sur les additions…"
                  autofocus
                  @keydown.escape="creating = false"
                />
              </div>
              <div class="cbf-field">
                <label class="cbl">Matière</label>
                <select v-model="createMatiereId" class="pro-input" @change="onMatiereChange">
                  <option :value="null">— Toutes les matières —</option>
                  <option v-for="s in mySubjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div class="cbf-field">
                <label class="cbl">Cours associé <span class="req">*</span></label>
                <select v-model="createCoursId" class="pro-input" :disabled="!filteredCoursCreate.length">
                  <option :value="null">
                    {{ filteredCoursCreate.length ? '— Choisir un cours —' : 'Aucun cours disponible' }}
                  </option>
                  <option v-for="c in filteredCoursCreate" :key="c.id" :value="c.id">{{ c.title }}</option>
                </select>
              </div>
            </div>
            <div class="create-box-actions">
              <button class="pro-btn pro-btn-ghost pro-btn-sm" @click="creating = false">Annuler</button>
              <button
                class="pro-btn pro-btn-green pro-btn-sm"
                @click="submitCreateQuiz"
                :disabled="!createName.trim() || !createCoursId || createLoading"
              >
                <AppIcon name="check" :size="13" />
                {{ createLoading ? 'Création…' : 'Créer et ajouter des questions' }}
              </button>
            </div>
          </div>
        </Transition>

        <div v-if="myQuizzes.length" class="quiz-grid">
          <div v-for="q in myQuizzes" :key="q.id" class="quiz-card pro-card">
            <div class="qc-header">
              <div class="qc-icon"><AppIcon name="quiz" :size="20" /></div>
              <div class="qc-info">
                <div class="qc-title">{{ q.name }}</div>
                <div class="qc-course">{{ getCoursTitre(q.cours_id) }}</div>
              </div>
              <button class="pro-icon-btn pro-icon-btn-danger qc-delete" @click.stop="deleteQuiz(q)">
                <AppIcon name="trash" :size="13" />
              </button>
            </div>
            <div class="qc-meta">
              <span class="qc-chip qc-chip-blue">
                <AppIcon name="quiz" :size="11" />
                {{ q.questions?.length ?? 0 }} question{{ (q.questions?.length ?? 0) > 1 ? 's' : '' }}
              </span>
              <span class="qc-chip qc-chip-green">
                <AppIcon name="check" :size="11" />
                {{ q.questions?.reduce((a, qu) => a + (qu.reponses?.length ?? 0), 0) ?? 0 }} réponse(s)
              </span>
            </div>
            <div class="qc-actions">
              <button class="qca-btn qca-edit" @click="openEditor(q)">
                <AppIcon name="edit" :size="13" /> Modifier
              </button>
              <button class="qca-btn qca-results" @click="openResults(q)">
                <AppIcon name="results" :size="13" /> Résultats
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="!creating" class="pro-empty pro-card" style="padding:52px">
          <AppIcon name="quiz" :size="44" class="pro-empty-icon" />
          <p style="font-size:1rem;font-weight:800;margin:12px 0 4px">Aucun quiz créé</p>
          <p style="font-size:.85rem;color:var(--pro-muted);margin:0">Créez votre premier quiz interactif !</p>
          <button class="pro-btn pro-btn-green" style="margin-top:16px" @click="openCreate">
            <AppIcon name="plus" :size="15" /> Nouveau quiz
          </button>
        </div>
      </template>

      <!-- ══════════════════════════════════════
           VUE ÉDITEUR
      ══════════════════════════════════════ -->
      <template v-else-if="view === 'editor' && activeQuiz">
        <div class="editor-header">
          <button class="back-btn" @click="backToList">
            <AppIcon name="chevron-right" :size="14" style="transform:rotate(180deg)" />
            Mes quiz
          </button>
          <div class="editor-header-center">
            <h1 class="editor-title">{{ activeQuiz.name }}</h1>
            <p class="editor-sub">{{ getCoursTitre(activeQuiz.cours_id) }}</p>
          </div>
          <div class="editor-header-actions">
            <button class="qca-btn qca-results" @click="openResults(activeQuiz)">
              <AppIcon name="results" :size="13" /> Résultats
            </button>
            <button class="pro-btn pro-btn-green" @click="publishQuiz" :disabled="!canPublish || publishing">
              <AppIcon name="publish" :size="14" />
              {{ publishing ? 'Publication…' : 'Publier' }}
            </button>
          </div>
        </div>

        <div class="publish-status-bar">
          <div class="psb-item" :class="{ 'psb-ok': (activeQuiz.questions?.length ?? 0) > 0 }">
            <AppIcon :name="(activeQuiz.questions?.length ?? 0) ? 'check' : 'x'" :size="11" />
            {{ activeQuiz.questions?.length ?? 0 }} question{{ (activeQuiz.questions?.length ?? 0) > 1 ? 's' : '' }}
          </div>
          <div class="psb-item" :class="{ 'psb-ok': totalReponses > 0 }">
            <AppIcon :name="totalReponses ? 'check' : 'x'" :size="11" />
            {{ totalReponses }} réponse{{ totalReponses > 1 ? 's' : '' }}
          </div>
          <div class="psb-item" :class="{ 'psb-ok': canPublish }">
            <AppIcon :name="canPublish ? 'check' : 'x'" :size="11" />
            {{ canPublish ? 'Prêt à publier' : 'Chaque question doit avoir au moins 1 réponse' }}
          </div>
          <div v-if="publishSuccess" class="psb-success">
            <AppIcon name="check" :size="12" /> Quiz publié avec succès !
          </div>
        </div>

        <div class="questions-list">
          <div v-for="(qu, qi) in (activeQuiz.questions ?? [])" :key="qu.id" class="question-card">
            <div class="qcard-header">
              <div class="qcard-num">{{ qi + 1 }}</div>
              <div class="qcard-question-text">{{ qu.question }}</div>
              <button class="qcard-delete-btn" @click="deleteQuestion(qu)" title="Supprimer">
                <AppIcon name="trash" :size="13" />
              </button>
            </div>
            <div class="qcard-body">
              <div class="answers-list">
                <div
                  v-for="(rep, ri) in (qu.reponses ?? [])"
                  :key="rep.id"
                  class="answer-row"
                  :class="getReponseClass(rep)"
                >
                  <div class="ans-badge" :class="getReponseBadgeClass(rep)">{{ letters[ri] }}</div>
                  <div class="ans-text-area">
                    <span class="ans-text">{{ rep.name }}</span>
                    <span v-if="rep.status === 'correct'" class="ans-correct-label">
                      <AppIcon name="check" :size="10" /> Correcte
                    </span>
                    <span v-else class="ans-incorrect-label">
                      <AppIcon name="x" :size="10" /> Incorrecte
                    </span>
                  </div>
                  <div class="ans-select-wrap">
                    <select class="ans-select" :value="rep.status" @change="updateReponseStatus(qu, rep, $event)">
                      <option value="correct">Correcte</option>
                      <option value="incorrect">Incorrecte</option>
                    </select>
                  </div>
                  <button class="ans-del-btn" @click="deleteReponse(qu, rep)" title="Supprimer">
                    <AppIcon name="trash" :size="11" />
                  </button>
                </div>

                <div v-if="addingReponseTo === qu.id" class="answer-add-form">
                  <div class="aaf-badge-ghost">{{ letters[qu.reponses?.length ?? 0] }}</div>
                  <input
                    :ref="el => (reponseInputs[qu.id] = el)"
                    v-model="reponseDraft[qu.id]"
                    class="aaf-input"
                    placeholder="Écrire la réponse…"
                    @keydown.enter.prevent="submitReponse(qu)"
                    @keydown.escape="addingReponseTo = null"
                  />
                  <select v-model="correctDraft[qu.id]" class="aaf-select">
                    <option :value="true">Correcte</option>
                    <option :value="false">Incorrecte</option>
                  </select>
                  <button class="aaf-submit" :disabled="!reponseDraft[qu.id]?.trim()" @click="submitReponse(qu)">
                    <AppIcon name="check" :size="13" />
                  </button>
                  <button class="aaf-cancel" @click="addingReponseTo = null">
                    <AppIcon name="x" :size="13" />
                  </button>
                </div>

                <button v-else class="add-answer-btn" @click="openAddReponse(qu)">
                  <AppIcon name="plus" :size="13" /> Ajouter une réponse
                </button>
              </div>
            </div>
          </div>

          <div v-if="addingQuestion" class="question-add-form">
            <div class="qaf-header">
              <div class="qcard-num qcard-num-ghost">{{ (activeQuiz.questions?.length ?? 0) + 1 }}</div>
              <input
                v-model="questionDraft"
                class="qaf-input"
                placeholder="Écrire la question ici…"
                @keydown.enter.prevent="submitQuestion"
                @keydown.escape="addingQuestion = false"
                autofocus
              />
              <button
                class="pro-btn pro-btn-green pro-btn-sm"
                :disabled="!questionDraft.trim() || questionLoading"
                @click="submitQuestion"
              >
                <AppIcon name="check" :size="13" />
                {{ questionLoading ? '…' : 'Ajouter' }}
              </button>
              <button class="pro-icon-btn" @click="addingQuestion = false">
                <AppIcon name="x" :size="14" />
              </button>
            </div>
          </div>

          <button v-else class="add-question-btn" @click="addingQuestion = true">
            <AppIcon name="plus" :size="18" /> Ajouter une question
          </button>

          <div v-if="!(activeQuiz.questions?.length) && !addingQuestion" class="empty-questions">
            <AppIcon name="quiz" :size="40" class="pro-empty-icon" />
            <p>Commencez par ajouter votre première question.</p>
            <button class="pro-btn pro-btn-green" @click="addingQuestion = true">
              <AppIcon name="plus" :size="15" /> Première question
            </button>
          </div>
        </div>
      </template>

      <!-- ══════════════════════════════════════
           VUE RÉSULTATS
      ══════════════════════════════════════ -->
      <template v-else-if="view === 'results' && activeQuiz">
        <div class="editor-header">
          <button class="back-btn" @click="backToEditor">
            <AppIcon name="chevron-right" :size="14" style="transform:rotate(180deg)" />
            Retour
          </button>
          <div class="editor-header-center">
            <div class="editor-badge editor-badge-results">
              <AppIcon name="results" :size="11" /> Résultats
            </div>
            <h1 class="editor-title">{{ activeQuiz.name }}</h1>
            <p class="editor-sub">{{ getCoursTitre(activeQuiz.cours_id) }}</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card stat-blue">
            <div class="stat-icon"><AppIcon name="teachers" :size="18" /></div>
            <div class="stat-val">{{ stats.doneCount }}</div>
            <div class="stat-label">Notés</div>
          </div>
          <div class="stat-card stat-green">
            <div class="stat-icon"><AppIcon name="chart" :size="18" /></div>
            <div class="stat-val">{{ stats.avg }}%</div>
            <div class="stat-label">Moyenne</div>
          </div>
          <div class="stat-card stat-violet">
            <div class="stat-icon"><AppIcon name="trophy" :size="18" /></div>
            <div class="stat-val">{{ stats.successRate }}%</div>
            <div class="stat-label">Réussite</div>
          </div>
        </div>

        <!-- Tableau élèves + notes -->
        <div class="pro-card results-card">
          <div class="results-header">
            <h2 class="results-title">
              <AppIcon name="results" :size="16" /> Notes des élèves
            </h2>
          </div>
          <table class="results-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Score</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredResults" :key="r.id">
                <td>
                  <div class="student-cell">
                    <div class="student-av">{{ r.name.charAt(0) }}</div>
                    {{ r.name }}
                  </div>
                </td>
                <td>
                  <div v-if="r.score !== null" class="score-bar-wrap">
                    <div class="score-track">
                      <div class="score-fill" :style="{ width: pct(r) + '%', background: scoreColor(r) }"></div>
                    </div>
                    <span class="score-pct" :style="{ color: scoreColor(r) }">{{ pct(r) }}%</span>
                  </div>
                  <span v-else style="color:var(--pro-muted);font-size:.8rem">Pas encore noté</span>
                </td>
                <td class="score-frac">
                  <template v-if="r.score !== null">
                    <strong>{{ r.score }}</strong>
                    <span style="color:var(--pro-muted)">/{{ r.total }}</span>
                  </template>
                  <span v-else style="color:var(--pro-muted)">—</span>
                </td>
              </tr>
              <tr v-if="!filteredResults.length">
                <td colspan="3" style="text-align:center;padding:32px;color:var(--pro-muted);font-style:italic">
                  Aucun élève dans cette classe.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Distribution -->
        <div class="pro-card">
          <h2 class="results-title" style="padding:16px 20px 0">
            <AppIcon name="chart" :size="16" /> Distribution des notes
          </h2>
          <div class="dist-chart">
            <div v-for="b in distribution" :key="b.label" class="dist-col">
              <div class="dist-bar-wrap">
                <div class="dist-bar" :style="{ height: b.height + '%', background: b.color }">
                  <span v-if="b.count" class="dist-count">{{ b.count }}</span>
                </div>
              </div>
              <span class="dist-label">{{ b.label }}</span>
            </div>
          </div>
        </div>
      </template>

    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.qv-root {
  --pro-green:#10b981; --pro-green-soft:#d1fae5;
  --pro-blue:#3b82f6;  --pro-blue-soft:#dbeafe;
  --pro-amber:#f59e0b; --pro-amber-soft:#fef3c7;
  --pro-violet:#8b5cf6;
  --pro-red:#ef4444;   --pro-red-soft:#fee2e2;
  --pro-border:#e2e8f0; --pro-sub:#475569; --pro-muted:#94a3b8;
  --pro-ink:#0f172a;   --pro-bg:#f8fafc; --pro-card:#ffffff;
  --pro-font:'Plus Jakarta Sans','Nunito',system-ui,sans-serif;
  --pro-shadow-sm:0 1px 2px rgba(0,0,0,.05);
  --pro-shadow-md:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -1px rgba(0,0,0,.06);
  --pro-shadow-lg:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05);
  --pro-r-md:8px; --pro-r-lg:12px;
  display:flex; flex-direction:column; gap:18px;
  font-family:var(--pro-font);
}

.pro-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.pro-page-title  { font-size:1.8rem; font-weight:900; color:var(--pro-ink); margin:0; }
.pro-page-sub    { font-size:.9rem; color:var(--pro-muted); margin:4px 0 0; }
.pro-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 16px; border-radius:8px; font-size:.85rem; font-weight:700; cursor:pointer; border:none; transition:all .2s; white-space:nowrap; font-family:var(--pro-font); }
.pro-btn-green { background:var(--pro-green); color:white; }
.pro-btn-green:hover:not(:disabled) { background:#059669; }
.pro-btn-green:disabled { opacity:.6; cursor:not-allowed; }
.pro-btn-ghost { background:transparent; border:1.5px solid var(--pro-border); color:var(--pro-ink); }
.pro-btn-ghost:hover { background:var(--pro-bg); }
.pro-btn-sm { padding:6px 12px; font-size:.8rem; }
.pro-icon-btn { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; border:1.5px solid var(--pro-border); background:white; cursor:pointer; transition:all .15s; }
.pro-icon-btn-danger { color:var(--pro-red); border-color:transparent; }
.pro-icon-btn-danger:hover { background:#fef2f2; border-color:#fecaca; }
.pro-card { background:white; border:1.5px solid var(--pro-border); border-radius:var(--pro-r-lg); overflow:hidden; }
.pro-input { width:100%; padding:8px 12px; border:1.5px solid var(--pro-border); border-radius:8px; font-size:.9rem; outline:none; transition:border-color .2s; font-family:var(--pro-font); box-sizing:border-box; background:white; color:var(--pro-ink); }
.pro-input:focus { border-color:var(--pro-green); }
.req { color:var(--pro-red); }
.pro-empty { text-align:center; color:var(--pro-muted); display:flex; flex-direction:column; align-items:center; }
.pro-empty-icon { opacity:.4; }

.slide-down-enter-active { transition:all .25s ease; }
.slide-down-enter-from   { opacity:0; transform:translateY(-10px); }

.create-box { padding:20px; display:flex; flex-direction:column; gap:16px; border:2px dashed rgba(16,185,129,.35); background:rgba(16,185,129,.03); }
.create-box-head { display:flex; align-items:center; gap:10px; font-size:.88rem; font-weight:800; color:var(--pro-green); }
.create-box-icon { width:30px; height:30px; border-radius:8px; background:var(--pro-green-soft); color:var(--pro-green); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.create-box-fields { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media(max-width:600px){ .create-box-fields { grid-template-columns:1fr; } }
.cbf-field { display:flex; flex-direction:column; gap:5px; }
.cbl { font-size:.76rem; font-weight:700; color:var(--pro-sub); }
.create-box-actions { display:flex; gap:8px; justify-content:flex-end; }

.quiz-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; }
.quiz-card { padding:0; display:flex; flex-direction:column; overflow:hidden; transition:transform .2s,box-shadow .2s; }
.quiz-card:hover { transform:translateY(-2px); box-shadow:var(--pro-shadow-lg); }
.qc-header { display:flex; align-items:flex-start; gap:12px; padding:16px 16px 12px; border-bottom:1px solid var(--pro-border); }
.qc-icon { width:40px; height:40px; border-radius:10px; flex-shrink:0; background:var(--pro-green-soft); color:var(--pro-green); display:flex; align-items:center; justify-content:center; }
.qc-info { flex:1; min-width:0; }
.qc-title  { font-size:.92rem; font-weight:800; color:var(--pro-ink); line-height:1.3; }
.qc-course { font-size:.72rem; color:var(--pro-muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.qc-delete { opacity:0; transition:opacity .15s; }
.quiz-card:hover .qc-delete { opacity:1; }
.qc-meta { display:flex; gap:6px; flex-wrap:wrap; padding:10px 16px; }
.qc-chip { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:100px; font-size:.7rem; font-weight:700; }
.qc-chip-blue  { background:var(--pro-blue-soft); color:var(--pro-blue); }
.qc-chip-green { background:var(--pro-green-soft); color:var(--pro-green); }
.qc-actions { display:flex; gap:0; margin-top:auto; border-top:1px solid var(--pro-border); }
.qca-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:11px; border:none; cursor:pointer; font-size:.78rem; font-weight:700; transition:all .15s; font-family:var(--pro-font); }
.qca-btn:not(:last-child) { border-right:1px solid var(--pro-border); }
.qca-edit    { background:white; color:var(--pro-sub); }
.qca-edit:hover { background:var(--pro-bg); color:var(--pro-ink); }
.qca-results { background:white; color:var(--pro-blue); }
.qca-results:hover { background:var(--pro-blue-soft); }

.back-btn { display:inline-flex; align-items:center; gap:5px; font-size:.8rem; font-weight:700; color:var(--pro-sub); border:none; background:none; cursor:pointer; padding:5px 0; transition:color .15s; flex-shrink:0; font-family:var(--pro-font); }
.back-btn:hover { color:var(--pro-green); }
.editor-header { display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap; padding-bottom:18px; border-bottom:1.5px solid var(--pro-border); }
.editor-header-center { flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.editor-badge { display:inline-flex; align-items:center; gap:5px; align-self:flex-start; padding:3px 10px; border-radius:100px; font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.07em; background:var(--pro-green-soft); color:var(--pro-green); }
.editor-badge-results { background:var(--pro-blue-soft); color:var(--pro-blue); }
.editor-title { font-size:1.25rem; font-weight:900; color:var(--pro-ink); margin:0; line-height:1.2; }
.editor-sub   { font-size:.78rem; color:var(--pro-muted); margin:0; }
.editor-header-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap; }

.publish-status-bar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:10px 16px; border-radius:var(--pro-r-md); background:var(--pro-bg); border:1.5px solid var(--pro-border); }
.psb-item { display:inline-flex; align-items:center; gap:5px; font-size:.75rem; font-weight:600; color:var(--pro-muted); padding:3px 8px; border-radius:6px; background:white; border:1px solid var(--pro-border); }
.psb-ok   { color:var(--pro-green); background:var(--pro-green-soft); border-color:rgba(16,185,129,.2); }
.psb-success { display:inline-flex; align-items:center; gap:5px; font-size:.75rem; font-weight:700; color:var(--pro-green); padding:4px 10px; border-radius:6px; background:var(--pro-green-soft); border:1px solid rgba(16,185,129,.2); margin-left:auto; }

.questions-list { display:flex; flex-direction:column; gap:12px; }
.question-card { background:white; border:1.5px solid var(--pro-border); border-radius:var(--pro-r-lg); overflow:hidden; box-shadow:var(--pro-shadow-sm); transition:box-shadow .15s; }
.question-card:hover { box-shadow:var(--pro-shadow-md); }
.qcard-header { display:flex; align-items:center; gap:12px; padding:14px 18px; background:linear-gradient(to right,#f8fafc,#f1f5f9); border-bottom:1px solid var(--pro-border); }
.qcard-num { width:28px; height:28px; border-radius:8px; flex-shrink:0; background:var(--pro-green); color:white; font-size:.72rem; font-weight:900; display:flex; align-items:center; justify-content:center; }
.qcard-num-ghost { background:var(--pro-border); color:var(--pro-muted); }
.qcard-question-text { flex:1; font-size:.92rem; font-weight:700; color:var(--pro-ink); line-height:1.4; }
.qcard-delete-btn { width:30px; height:30px; border-radius:8px; flex-shrink:0; border:1.5px solid var(--pro-border); background:white; color:var(--pro-red); cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:all .15s; }
.question-card:hover .qcard-delete-btn { opacity:1; }
.qcard-delete-btn:hover { background:var(--pro-red); color:white; border-color:var(--pro-red); }
.qcard-body { padding:12px 18px 14px; }

.answers-list { display:flex; flex-direction:column; gap:6px; }
.answer-row { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; border:1.5px solid var(--pro-border); background:white; transition:all .15s; }
.answer-correct   { border-color:rgba(16,185,129,.4); background:rgba(16,185,129,.04); }
.answer-incorrect { border-color:var(--pro-border); }
.ans-badge { width:26px; height:26px; border-radius:7px; flex-shrink:0; font-size:.7rem; font-weight:900; display:flex; align-items:center; justify-content:center; }
.ans-badge-correct   { background:var(--pro-green); color:white; }
.ans-badge-incorrect { background:#e8edf3; color:var(--pro-sub); }
.ans-text-area { flex:1; min-width:0; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.ans-text { font-size:.85rem; color:var(--pro-ink); font-weight:500; }
.ans-correct-label   { display:inline-flex; align-items:center; gap:3px; padding:2px 7px; border-radius:100px; font-size:.68rem; font-weight:700; background:var(--pro-green-soft); color:var(--pro-green); }
.ans-incorrect-label { display:inline-flex; align-items:center; gap:3px; padding:2px 7px; border-radius:100px; font-size:.68rem; font-weight:700; background:#f1f5f9; color:var(--pro-muted); }
.ans-select-wrap { flex-shrink:0; }
.ans-select { padding:5px 26px 5px 10px; border-radius:8px; border:1.5px solid var(--pro-border); font-size:.75rem; font-weight:700; color:var(--pro-sub); background:white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 6px center / 14px; cursor:pointer; outline:none; appearance:none; transition:border-color .15s; }
.ans-select:focus { border-color:var(--pro-green); }
.answer-correct .ans-select { border-color:rgba(16,185,129,.4); color:var(--pro-green); background-color:rgba(16,185,129,.05); }
.ans-del-btn { width:26px; height:26px; border-radius:6px; flex-shrink:0; border:1.5px solid var(--pro-border); background:transparent; color:var(--pro-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:all .15s; }
.answer-row:hover .ans-del-btn { opacity:1; }
.ans-del-btn:hover { background:var(--pro-red); color:white; border-color:var(--pro-red); }

.answer-add-form { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px; border:2px dashed var(--pro-green); background:rgba(16,185,129,.03); }
.aaf-badge-ghost { width:26px; height:26px; border-radius:7px; flex-shrink:0; background:var(--pro-border); color:var(--pro-muted); font-size:.7rem; font-weight:900; display:flex; align-items:center; justify-content:center; }
.aaf-input { flex:1; min-width:0; padding:7px 11px; border:1.5px solid var(--pro-border); border-radius:8px; font-size:.85rem; color:var(--pro-ink); outline:none; transition:border-color .15s; background:white; font-family:var(--pro-font); }
.aaf-input:focus { border-color:var(--pro-green); }
.aaf-select { padding:7px 28px 7px 10px; border-radius:8px; flex-shrink:0; border:1.5px solid var(--pro-border); font-size:.78rem; font-weight:700; color:var(--pro-sub); background:white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 6px center / 14px; cursor:pointer; outline:none; appearance:none; transition:all .15s; font-family:var(--pro-font); }
.aaf-select:focus { border-color:var(--pro-green); }
.aaf-submit, .aaf-cancel { width:32px; height:32px; border-radius:8px; flex-shrink:0; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.aaf-submit { background:var(--pro-green); color:white; }
.aaf-submit:hover:not(:disabled) { background:#047857; }
.aaf-submit:disabled { opacity:.4; cursor:not-allowed; }
.aaf-cancel { background:var(--pro-bg); color:var(--pro-muted); border:1.5px solid var(--pro-border); }
.aaf-cancel:hover { background:white; color:var(--pro-red); border-color:var(--pro-red); }
.add-answer-btn { display:inline-flex; align-items:center; gap:6px; align-self:flex-start; padding:7px 13px; border-radius:100px; border:1.5px dashed var(--pro-border); background:transparent; font-size:.78rem; font-weight:700; color:var(--pro-muted); cursor:pointer; transition:all .15s; margin-top:4px; font-family:var(--pro-font); }
.add-answer-btn:hover { border-color:var(--pro-green); color:var(--pro-green); background:var(--pro-green-soft); }

.question-add-form { background:white; border:2px dashed var(--pro-border); border-radius:var(--pro-r-lg); padding:14px 16px; transition:border-color .15s; }
.question-add-form:focus-within { border-color:var(--pro-green); }
.qaf-header { display:flex; align-items:center; gap:10px; }
.qaf-input { flex:1; min-width:0; padding:10px 14px; border:1.5px solid var(--pro-border); border-radius:var(--pro-r-md); font-size:.9rem; color:var(--pro-ink); outline:none; transition:border-color .15s; background:white; font-family:var(--pro-font); }
.qaf-input:focus { border-color:var(--pro-green); box-shadow:0 0 0 3px rgba(16,185,129,.1); }
.add-question-btn { display:flex; align-items:center; justify-content:center; gap:10px; padding:16px; border-radius:var(--pro-r-lg); border:2px dashed var(--pro-border); background:transparent; font-size:.9rem; font-weight:700; color:var(--pro-muted); cursor:pointer; transition:all .2s; width:100%; font-family:var(--pro-font); }
.add-question-btn:hover { border-color:var(--pro-green); color:var(--pro-green); background:rgba(16,185,129,.03); }
.empty-questions { display:flex; flex-direction:column; align-items:center; gap:8px; padding:40px 20px; text-align:center; color:var(--pro-muted); }

.stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
@media(max-width:640px){ .stats-grid { grid-template-columns:repeat(2,1fr); } }
.stat-card { padding:16px 18px; border-radius:var(--pro-r-lg); display:flex; flex-direction:column; gap:6px; border:1.5px solid var(--pro-border); background:white; position:relative; overflow:hidden; }
.stat-card::before { content:''; position:absolute; top:-20px; right:-20px; width:70px; height:70px; border-radius:50%; opacity:.07; }
.stat-blue   { --sc:var(--pro-blue);   } .stat-blue::before   { background:var(--pro-blue); }
.stat-green  { --sc:var(--pro-green);  } .stat-green::before  { background:var(--pro-green); }
.stat-violet { --sc:var(--pro-violet); } .stat-violet::before { background:var(--pro-violet); }
.stat-icon  { width:34px; height:34px; border-radius:9px; background:color-mix(in srgb,var(--sc) 12%,white); color:var(--sc); display:flex; align-items:center; justify-content:center; }
.stat-val   { font-size:1.7rem; font-weight:900; color:var(--pro-ink); line-height:1; }
.stat-label { font-size:.72rem; color:var(--pro-muted); text-transform:uppercase; letter-spacing:.06em; font-weight:700; }

.results-card { overflow:hidden; }
.results-header { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:14px 20px; border-bottom:1px solid var(--pro-border); }
.results-title { display:flex; align-items:center; gap:8px; font-size:.9rem; font-weight:800; color:var(--pro-ink); margin:0; }
.results-table { width:100%; border-collapse:collapse; }
.results-table th { padding:9px 16px; font-size:.7rem; font-weight:800; color:var(--pro-muted); text-transform:uppercase; letter-spacing:.06em; background:#f8fafc; border-bottom:1px solid var(--pro-border); text-align:left; }
.results-table td { padding:10px 16px; border-bottom:1px solid var(--pro-border); font-size:.84rem; vertical-align:middle; }
.results-table tr:last-child td { border-bottom:none; }
.student-cell { display:flex; align-items:center; gap:9px; font-weight:600; color:var(--pro-ink); }
.student-av { width:28px; height:28px; border-radius:50%; flex-shrink:0; background:var(--pro-blue-soft); color:var(--pro-blue); font-size:.75rem; font-weight:900; display:flex; align-items:center; justify-content:center; }
.score-bar-wrap { display:flex; align-items:center; gap:8px; }
.score-track { flex:1; height:6px; border-radius:3px; background:var(--pro-border); overflow:hidden; }
.score-fill  { height:100%; border-radius:3px; transition:width .6s ease; }
.score-pct   { font-size:.8rem; font-weight:800; width:36px; text-align:right; flex-shrink:0; }
.score-frac  { white-space:nowrap; }

.dist-chart { display:flex; align-items:flex-end; justify-content:space-around; gap:8px; padding:16px 20px 14px; height:130px; }
.dist-col { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; }
.dist-bar-wrap { flex:1; display:flex; align-items:flex-end; width:100%; }
.dist-bar { width:100%; border-radius:5px 5px 0 0; min-height:4px; display:flex; align-items:flex-start; justify-content:center; transition:height .4s ease; }
.dist-count { font-size:.7rem; font-weight:900; color:white; padding-top:4px; }
.dist-label { font-size:.65rem; font-weight:700; color:var(--pro-muted); white-space:nowrap; }
</style>