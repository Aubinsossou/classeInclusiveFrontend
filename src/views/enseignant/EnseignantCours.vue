<script setup>
import { ref, computed, h, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet, apiPost, apiDelete } from '@/helpers/axiosApi'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import LoadingView from '@/components/admin/Loading.vue'

const svgPaths = {
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  chevron: '<polyline points="15 18 9 12 15 6"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  audio: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  upload: '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
  bold: '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>',
  italic: '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
  underline: '<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  'list-ol': '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-2-2-2"/>',
  'align-l': '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
  'align-c': '<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="10" x2="7" y2="10"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="7" y2="18"/>',
  'align-r': '<line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>',
  warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
}

const AppIcon = (props) =>
  h('svg', {
    width: props.size || 18,
    height: props.size || 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    innerHTML: svgPaths[props.name] || '<circle cx="12" cy="12" r="4"/>',
  })

const router  = useRouter()
const route   = useRoute()
const coursId = route.params.id
const isEdit  = !!coursId


const userAuth = ref([null])

const apiGetUser = async () => {
  const response = await apiGet('/enseignant/getEnseignant')
  userAuth.value = response.data.data
}

const mySubjects = computed(() => {
  // 1. Matières assignées à la classe
  const classMatieres = userAuth.value?.classe?.matieres ?? []
  // 2. Matière directe de l'enseignant (matiere_id sur l'enseignant)
  const directMatiere = userAuth.value?.matiere
  if (directMatiere && !classMatieres.find(m => m.id === directMatiere.id)) {
    return [...classMatieres, directMatiere]
  }
  return classMatieres
})
const myClasse   = computed(() => userAuth.value?.classe ?? null)
const hasClasse  = computed(() => !!myClasse.value)

// ─────────────────────────────────────────────
// HELPERS DATE
// ─────────────────────────────────────────────
function todayDatetimeLocal() {
  // Retourne la date/heure actuelle au format datetime-local : "2026-03-11T14:30"
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

// Convertit "2026-03-11T14:30" → "2026-03-11 14:30:00" pour Laravel
function tolaravelDate(val) {
  if (!val) return null
  return val.replace('T', ' ') + ':00'
}

// ─────────────────────────────────────────────
// FORM
// ─────────────────────────────────────────────
const form = reactive({
  title:              '',
  description:        '',
  matiere_id:         null,
  classe_id:          null,
  is_published:       false,
  date_programmation: todayDatetimeLocal(),   // ← pré-rempli avec la date actuelle
})



// ─────────────────────────────────────────────
// TIPTAP
// ─────────────────────────────────────────────
const editor = ref(null)

const initEditor = (content = '') => {
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({ underline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TextStyle,
    ],
    content,
    editorProps: { attributes: { class: 'tiptap-area' } },
  })
}

// ─────────────────────────────────────────────
// MÉDIAS EXISTANTS
// ─────────────────────────────────────────────
const existingMedias = ref([])
const deletingMedia  = ref(null)

const deleteExistingMedia = async (media) => {
  deletingMedia.value = media.id
  try {
    await apiDelete(`enseignant/cours/media/${media.id}`)
    existingMedias.value = existingMedias.value.filter((m) => m.id !== media.id)
  } catch (e) {
    console.error('Erreur suppression média:', e)
  } finally {
    deletingMedia.value = null
  }
}

// ─────────────────────────────────────────────
// UPLOAD NOUVEAUX MÉDIAS
// ─────────────────────────────────────────────
const newMedias = ref([])

const ACCEPT_MAP = { video: 'video/*', image: 'image/*', audio: 'audio/*' }

function handleFilePick(event, type) {
  const files = Array.from(event.target.files)
  const MAX_MB = 100
  files.forEach((file, i) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      errors.value[`media_size_${i}`] = `"${file.name}" dépasse ${MAX_MB}MB.`
      return
    }
    if (!file.size) {
      errors.value[`media_empty_${i}`] = `"${file.name}" est vide ou invalide.`
      return
    }
    const preview = type === 'image' || type === 'video' ? URL.createObjectURL(file) : null
    newMedias.value.push({
      file,
      type,
      preview,
      ordre: existingMedias.value.length + newMedias.value.length + i,
      name:  file.name,
      size:  (file.size / 1024 / 1024).toFixed(2) + ' MB',
    })
  })
  event.target.value = ''
}

function removeNewMedia(index) {
  const m = newMedias.value[index]
  if (m.preview) URL.revokeObjectURL(m.preview)
  newMedias.value.splice(index, 1)
}

// ─────────────────────────────────────────────
// CHARGEMENT
// ─────────────────────────────────────────────
const loading = ref(true)
const error   = ref(null)

onMounted(async () => {
  try {
    await apiGetUser()
    form.classe_id  = userAuth.value?.classe?.id ?? null
    // Auto-sélectionner la matière si l'enseignant n'en a qu'une
    if (!form.matiere_id && mySubjects.value.length === 1) {
      form.matiere_id = mySubjects.value[0].id
    } else if (!form.matiere_id && userAuth.value?.matiere_id) {
      form.matiere_id = userAuth.value.matiere_id
    }

    if (isEdit) {
      const response = await apiGet(`enseignant/cours/edit/${coursId}`)
      const data = response.data?.data ?? response.data
      form.title              = data.title              ?? ''
      form.description        = data.description        ?? ''
      form.matiere_id         = data.matiere_id         ?? null
      form.classe_id          = data.classe_id          ?? userAuth.value?.classe?.id ?? null
      form.is_published       = !!data.is_published
      // Charger la date programmée existante ou mettre la date actuelle
      form.date_programmation = data.date_programmation
        ? data.date_programmation.substring(0, 16).replace(' ', 'T')
        : todayDatetimeLocal()
      existingMedias.value    = data.medias ?? []
      initEditor(data.contenu ?? '')
    } else {
      initEditor('')
    }
  } catch (e) {
    error.value = 'Erreur lors du chargement.'
    console.error(e)
  } finally {
    loading.value = false
  }
})

// ─────────────────────────────────────────────
// SOUMISSION
// ─────────────────────────────────────────────
const saving      = ref(false)
const success     = ref(false)
const errors      = ref({})
const submitError = ref(null)

const submitForm = async (publish = null) => {
  errors.value      = {}
  submitError.value = null
  saving.value      = true

  if (!form.title.trim())  errors.value.title      = 'Le titre est requis.'
  if (!form.matiere_id)    errors.value.matiere_id  = 'La matière est requise.'
  if (!form.classe_id)     errors.value.classe_id   = 'Aucune classe assignée.'
  if (Object.keys(errors.value).length) { saving.value = false; return }

  const isPublished = publish !== null ? publish : form.is_published
  const url = isEdit ? `enseignant/cours/update/${coursId}` : 'enseignant/cours/store'

  try {
    let response

    if (newMedias.value.length > 0) {
      const fd = new FormData()
      fd.append('title',              form.title.trim())
      fd.append('description',        form.description.trim())
      fd.append('contenu',            editor.value?.getHTML() ?? '')
      fd.append('matiere_id',         form.matiere_id)
      fd.append('classe_id',          form.classe_id)
      fd.append('is_published',       isPublished ? 1 : 0)
      fd.append('date_programmation', tolaravelDate(form.date_programmation) ?? '')
      newMedias.value.forEach((m, i) => {
        fd.append(`medias_files[${i}]`,  m.file)
        fd.append(`medias_types[${i}]`,  m.type)
        fd.append(`medias_ordres[${i}]`, m.ordre)
      })
      response = await apiPost(url, fd)
    } else {
      response = await apiPost(url, {
        title:              form.title.trim(),
        description:        form.description.trim(),
        contenu:            editor.value?.getHTML() ?? '',
        matiere_id:         form.matiere_id,
        classe_id:          form.classe_id,
        is_published:       isPublished ? 1 : 0,
        date_programmation: tolaravelDate(form.date_programmation),
      })
    }

    console.log('[submitForm] Réponse:', response?.data)
    success.value = true
    setTimeout(() => router.push({ name: 'enseignantcours' }), 1200)
  } catch (e) {
    console.error('[submitForm] Erreur complète:', JSON.stringify(e?.response?.data ?? e, null, 2))
    console.error('[submitForm] Champs envoyés — matiere_id:', form.matiere_id, '| classe_id:', form.classe_id, '| title:', form.title)
    if (e?.response?.data?.errors) errors.value = e.response.data.errors
    else submitError.value = 'Une erreur est survenue. Vérifiez la console.'
  } finally {
    saving.value = false
  }
}

function goBack() { router.push({ name: 'enseignantcours' }) }

// ─────────────────────────────────────────────
// HELPERS MÉDIAS
// ─────────────────────────────────────────────
function mediaIcon(type)  { return { video: 'video', image: 'image', audio: 'audio' }[type] ?? 'upload' }
function mediaColor(type) { return { video: '#3b82f6', image: '#10b981', audio: '#f59e0b' }[type] ?? '#94a3b8' }
function mediaBg(type)    { return { video: '#dbeafe', image: '#d1fae5', audio: '#fef3c7' }[type] ?? '#f1f5f9' }
</script>

<template>
  <div class="cfv-root container">
    <LoadingView v-if="loading" :visible="loading" :fullscreen="true" message="Chargement" offset-top="100px" />

    <template v-else-if="!error">
      <div v-if="!hasClasse" class="cfv-no-classe">
        <AppIcon name="warning" :size="15" />
        Vous n'avez aucune classe assignée. Contactez l'administrateur de l'école avant de créer un cours.
      </div>

      <!-- EN-TÊTE -->
      <div class="cfv-header">
        <button class="back-btn" @click="goBack">
          <AppIcon name="chevron" :size="15" /> Mes cours
        </button>
        <div class="cfv-header-center">
          <span class="cfv-badge">{{ isEdit ? 'Édition' : 'Nouveau cours' }}</span>
          <h1 class="cfv-title">{{ isEdit ? form.title || 'Modifier le cours' : 'Créer un cours' }}</h1>
        </div>
        <div class="cfv-header-actions">
          <button class="pro-btn pro-btn-ghost" @click="submitForm(false)" :disabled="saving || !hasClasse">
            <AppIcon name="save" :size="14" />
            {{ saving ? 'Enregistrement…' : 'Brouillon' }}
          </button>
          <button class="pro-btn pro-btn-green" @click="submitForm(true)" :disabled="saving || !hasClasse">
            <AppIcon name="check" :size="14" />
            {{ saving ? 'Publication…' : 'Publier' }}
          </button>
        </div>
      </div>

      <Transition name="slide-down">
        <div v-if="success" class="cfv-success">
          <AppIcon name="check" :size="16" />
          {{ isEdit ? 'Cours mis à jour avec succès !' : 'Cours créé avec succès !' }} Redirection…
        </div>
      </Transition>

      <Transition name="slide-down">
        <div v-if="submitError" class="cfv-submit-error">
          <AppIcon name="warning" :size="15" /> {{ submitError }}
        </div>
      </Transition>

      <!-- GRILLE PRINCIPALE -->
      <div class="cfv-grid">
        <!-- ── COLONNE PRINCIPALE ── -->
        <div class="cfv-main">

          <!-- Infos de base -->
          <section class="cfv-card">
            <h2 class="cfv-section-title">Informations générales</h2>
            <div class="field">
              <label class="field-label">Titre <span class="req">*</span></label>
              <input v-model="form.title" class="pro-input" :class="{ 'pro-input-error': errors.title }" placeholder="Ex : Introduction aux fractions" />
              <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
            </div>
            <div class="field">
              <label class="field-label">Description courte</label>
              <textarea v-model="form.description" class="pro-input pro-textarea" rows="2" placeholder="Un résumé bref du cours affiché dans la liste…"></textarea>
            </div>
          </section>

          <!-- Éditeur Tiptap -->
          <section class="cfv-card">
            <h2 class="cfv-section-title">Contenu du cours</h2>
            <div v-if="editor" class="tiptap-toolbar">
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()"><AppIcon name="bold" :size="14" /></button>
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()"><AppIcon name="italic" :size="14" /></button>
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive('underline') }" @click="editor.chain().focus().toggleUnderline().run()"><AppIcon name="underline" :size="14" /></button>
              <div class="tt-sep"></div>
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"><span style="font-size:.75rem;font-weight:800">H2</span></button>
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive('heading', { level: 3 }) }" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"><span style="font-size:.75rem;font-weight:800">H3</span></button>
              <div class="tt-sep"></div>
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()"><AppIcon name="list" :size="14" /></button>
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive('orderedList') }" @click="editor.chain().focus().toggleOrderedList().run()"><AppIcon name="list-ol" :size="14" /></button>
              <div class="tt-sep"></div>
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive({ textAlign: 'left' }) }" @click="editor.chain().focus().setTextAlign('left').run()"><AppIcon name="align-l" :size="14" /></button>
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive({ textAlign: 'center' }) }" @click="editor.chain().focus().setTextAlign('center').run()"><AppIcon name="align-c" :size="14" /></button>
              <button class="tt-btn" :class="{ 'tt-active': editor.isActive({ textAlign: 'right' }) }" @click="editor.chain().focus().setTextAlign('right').run()"><AppIcon name="align-r" :size="14" /></button>
            </div>
            <EditorContent :editor="editor" class="tiptap-wrap" />
          </section>

          <!-- Médias -->
          <section class="cfv-card">
            <h2 class="cfv-section-title">Médias</h2>
            <p class="cfv-section-sub">Vidéo prioritaire comme miniature. Formats supportés : MP4, JPG/PNG, MP3/WAV. Max 100 MB par fichier.</p>

            <div v-if="existingMedias.length" class="medias-list">
              <div v-for="m in existingMedias" :key="m.id" class="media-item" :style="{ '--mc': mediaColor(m.type), '--mb': mediaBg(m.type) }">
                <div class="media-preview">
                  <video v-if="m.type === 'video'" :src="m.url" class="media-preview-el" muted />
                  <img v-else-if="m.type === 'image'" :src="m.url" :alt="m.type" class="media-preview-el" />
                  <div v-else class="media-preview-audio"><AppIcon name="audio" :size="22" /></div>
                </div>
                <div class="media-info">
                  <span class="media-type-badge"><AppIcon :name="mediaIcon(m.type)" :size="11" /> {{ m.type }}</span>
                  <span class="media-url">{{ m.url.split('/').pop() }}</span>
                </div>
                <button class="media-del-btn" @click="deleteExistingMedia(m)" :disabled="deletingMedia === m.id"><AppIcon name="trash" :size="13" /></button>
              </div>
            </div>

            <div v-if="newMedias.length" class="medias-list" style="margin-top:10px">
              <div v-for="(m, i) in newMedias" :key="i" class="media-item media-item-new" :style="{ '--mc': mediaColor(m.type), '--mb': mediaBg(m.type) }">
                <div class="media-preview">
                  <video v-if="m.type === 'video'" :src="m.preview" class="media-preview-el" muted />
                  <img v-else-if="m.type === 'image' && m.preview" :src="m.preview" class="media-preview-el" />
                  <div v-else class="media-preview-audio"><AppIcon :name="mediaIcon(m.type)" :size="22" /></div>
                </div>
                <div class="media-info">
                  <span class="media-type-badge"><AppIcon :name="mediaIcon(m.type)" :size="11" /> {{ m.type }} — nouveau</span>
                  <span class="media-url">{{ m.name }}</span>
                  <span class="media-size">{{ m.size }}</span>
                </div>
                <button class="media-del-btn" @click="removeNewMedia(i)"><AppIcon name="x" :size="13" /></button>
              </div>
            </div>

            <div class="media-add-row">
              <label class="media-add-btn">
                <AppIcon name="video" :size="15" style="color:#3b82f6" /><span>Vidéo</span>
                <input type="file" :accept="ACCEPT_MAP.video" multiple hidden @change="(e) => handleFilePick(e, 'video')" />
              </label>
              <label class="media-add-btn">
                <AppIcon name="image" :size="15" style="color:#10b981" /><span>Image</span>
                <input type="file" :accept="ACCEPT_MAP.image" multiple hidden @change="(e) => handleFilePick(e, 'image')" />
              </label>
              <label class="media-add-btn">
                <AppIcon name="audio" :size="15" style="color:#f59e0b" /><span>Audio</span>
                <input type="file" :accept="ACCEPT_MAP.audio" multiple hidden @change="(e) => handleFilePick(e, 'audio')" />
              </label>
            </div>
          </section>
        </div>

        <!-- ── COLONNE LATÉRALE ── -->
        <aside class="cfv-aside">

          <!-- Paramètres -->
          <section class="cfv-card">
            <h2 class="cfv-section-title">Paramètres</h2>

            <div class="field">
              <label class="field-label">Matière <span class="req">*</span></label>
              <select v-model="form.matiere_id" class="pro-input" :class="{ 'pro-input-error': errors.matiere_id }">
                <option :value="null">— Choisir une matière —</option>
                <option v-for="m in mySubjects" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
              <span v-if="errors.matiere_id" class="field-error">{{ errors.matiere_id }}</span>
            </div>

            <div class="field">
              <label class="field-label">Classe assignée</label>
              <div v-if="myClasse" class="classe-display">
                <span class="classe-name" style="text-transform: uppercase;">{{ myClasse.name }}</span>
              </div>
              <div v-else class="classe-missing">
                <AppIcon name="warning" :size="13" /> Aucune classe assignée
              </div>
            </div>

            <div class="field">
              <label class="field-label">Statut</label>
              <div class="toggle-row">
                <span class="toggle-label">{{ form.is_published ? 'Publié' : 'Brouillon' }}</span>
                <button type="button" class="toggle-btn" :class="{ 'toggle-on': form.is_published }" @click="form.is_published = !form.is_published" role="switch">
                  <span class="toggle-knob"></span>
                </button>
              </div>
            </div>
          </section>

          <!-- ── PROGRAMMATION ── -->
          <section class="cfv-card cfv-card-programmation">
            <div class="prog-header">
              <div class="prog-icon">
                <AppIcon name="calendar" :size="16" />
              </div>
              <div>
                <h2 class="cfv-section-title" style="margin:0">Programmation</h2>
                <p class="prog-sub">Date de publication automatique</p>
              </div>
            </div>

            <div class="field">
              <label class="field-label">Date et heure de programmation</label>
              <input
                type="datetime-local"
                v-model="form.date_programmation"
                class="pro-input pro-input-datetime"
              />
            </div>

            <button class="prog-reset-btn" @click="form.date_programmation = todayDatetimeLocal()">
              Réinitialiser à maintenant
            </button>
          </section>

          <!-- Résumé médias -->
          <section class="cfv-card" v-if="existingMedias.length || newMedias.length">
            <h2 class="cfv-section-title">Médias ajoutés</h2>
            <div class="media-summary">
              <div class="ms-row" v-if="[...existingMedias, ...newMedias].filter(m => m.type === 'video').length">
                <div class="ms-icon" style="background:#dbeafe;color:#3b82f6"><AppIcon name="video" :size="13" /></div>
                <span>{{ [...existingMedias, ...newMedias].filter(m => m.type === 'video').length }} vidéo(s)</span>
              </div>
              <div class="ms-row" v-if="[...existingMedias, ...newMedias].filter(m => m.type === 'image').length">
                <div class="ms-icon" style="background:#d1fae5;color:#10b981"><AppIcon name="image" :size="13" /></div>
                <span>{{ [...existingMedias, ...newMedias].filter(m => m.type === 'image').length }} image(s)</span>
              </div>
              <div class="ms-row" v-if="[...existingMedias, ...newMedias].filter(m => m.type === 'audio').length">
                <div class="ms-icon" style="background:#fef3c7;color:#f59e0b"><AppIcon name="audio" :size="13" /></div>
                <span>{{ [...existingMedias, ...newMedias].filter(m => m.type === 'audio').length }} audio(s)</span>
              </div>
            </div>
          </section>

          <!-- Actions -->
          <section class="cfv-card">
            <button class="pro-btn pro-btn-green" style="width:100%;justify-content:center" @click="submitForm(true)" :disabled="saving || !hasClasse">
              <AppIcon name="check" :size="15" />
              {{ saving ? 'Publication…' : isEdit ? 'Mettre à jour et publier' : 'Créer et publier' }}
            </button>
            <button class="pro-btn pro-btn-ghost" style="width:100%;justify-content:center;margin-top:8px" @click="submitForm(false)" :disabled="saving || !hasClasse">
              <AppIcon name="save" :size="15" />
              {{ saving ? 'Enregistrement…' : 'Enregistrer en brouillon' }}
            </button>
            <button class="pro-btn pro-btn-ghost" style="width:100%;justify-content:center;margin-top:8px;color:var(--pro-muted)" @click="goBack" :disabled="saving">
              Annuler
            </button>
          </section>
        </aside>
      </div>
    </template>

    <div v-else class="cfv-error-box pro-card">
      <AppIcon name="warning" :size="32" />
      <p>{{ error }}</p>
      <button class="pro-btn pro-btn-ghost" @click="goBack">Retour</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.cfv-root {
  --pro-green:#10b981; --pro-green-soft:#d1fae5;
  --pro-blue:#3b82f6;  --pro-blue-soft:#dbeafe;
  --pro-red:#ef4444;   --pro-red-soft:#fee2e2;
  --pro-amber:#f59e0b;
  --pro-border:#e2e8f0; --pro-muted:#94a3b8; --pro-sub:#475569;
  --pro-ink:#0f172a;   --pro-bg:#f8fafc;
  --pro-font:'Plus Jakarta Sans','Nunito',system-ui,sans-serif;
  --pro-r-md:8px; --pro-r-lg:12px;
  display:flex; flex-direction:column; gap:20px;
  font-family:var(--pro-font);
}

.cfv-no-classe { display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:var(--pro-r-md);background:var(--pro-red-soft);border:1.5px solid #fecaca;color:var(--pro-red);font-size:.85rem;font-weight:700; }
.cfv-submit-error { display:flex;align-items:center;gap:8px;padding:12px 18px;border-radius:var(--pro-r-md);background:var(--pro-red-soft);border:1.5px solid #fecaca;color:var(--pro-red);font-size:.85rem;font-weight:700; }

.cfv-header { display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding-bottom:18px;border-bottom:1.5px solid var(--pro-border); }
.back-btn { display:inline-flex;align-items:center;gap:5px;font-size:.8rem;font-weight:700;color:var(--pro-sub);border:none;background:none;cursor:pointer;padding:5px 0;transition:color .15s;flex-shrink:0;font-family:var(--pro-font); }
.back-btn:hover { color:var(--pro-green); }
.cfv-header-center { flex:1;min-width:0; }
.cfv-badge { display:inline-flex;padding:3px 10px;border-radius:100px;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;background:var(--pro-green-soft);color:var(--pro-green);margin-bottom:4px; }
.cfv-title { font-size:1.3rem;font-weight:900;color:var(--pro-ink);margin:0;line-height:1.2; }
.cfv-header-actions { display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap; }

.cfv-success { display:flex;align-items:center;gap:8px;padding:12px 18px;border-radius:var(--pro-r-md);background:var(--pro-green-soft);color:var(--pro-green);font-size:.88rem;font-weight:700;border:1.5px solid rgba(16,185,129,.3); }
.slide-down-enter-active { transition:all .25s ease; }
.slide-down-enter-from   { opacity:0;transform:translateY(-8px); }

.cfv-grid { display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start; }
@media(max-width:860px){ .cfv-grid { grid-template-columns:1fr; } }

.cfv-card { background:white;border:1.5px solid var(--pro-border);border-radius:var(--pro-r-lg);padding:20px;display:flex;flex-direction:column;gap:16px; }
.cfv-main  { display:flex;flex-direction:column;gap:16px; }
.cfv-aside { display:flex;flex-direction:column;gap:16px; }
.cfv-section-title { font-size:.88rem;font-weight:800;color:var(--pro-ink);margin:0; }
.cfv-section-sub   { font-size:.78rem;color:var(--pro-muted);margin:0; }

/* ── PROGRAMMATION ── */
.cfv-card-programmation { border-color: rgba(99,102,241,.25); background: linear-gradient(135deg, #fafbff, #f0f2ff); }
.prog-header { display:flex;align-items:center;gap:12px; }
.prog-icon { width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.prog-sub { font-size:.72rem;color:var(--pro-muted);margin:2px 0 0; }

.pro-input-datetime {
  color-scheme: light;
  cursor: pointer;
}
.pro-input-datetime::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: .6;
}
.pro-input-datetime::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.prog-status {
  display:flex;align-items:center;gap:6px;
  padding:7px 12px;border-radius:8px;
  font-size:.76rem;font-weight:700;
}
.prog-status-future { background:#ede9fe;color:#6d28d9;border:1px solid rgba(109,40,217,.2); }
.prog-status-now    { background:var(--pro-green-soft);color:#065f46;border:1px solid rgba(16,185,129,.2); }

.prog-reset-btn {
  align-self:flex-start;
  padding:5px 12px;
  border-radius:100px;
  border:1.5px dashed #c7d2fe;
  background:transparent;
  color:#6366f1;
  font-size:.72rem;
  font-weight:700;
  cursor:pointer;
  transition:all .15s;
  font-family:var(--pro-font);
}
.prog-reset-btn:hover { background:#eef2ff;border-style:solid; }

.field { display:flex;flex-direction:column;gap:5px; }
.field-label { font-size:.76rem;font-weight:700;color:var(--pro-sub); }
.req { color:var(--pro-red); }
.field-error { font-size:.72rem;color:var(--pro-red);font-weight:600; }

.pro-input { width:100%;padding:9px 12px;border:1.5px solid var(--pro-border);border-radius:var(--pro-r-md);font-size:.88rem;outline:none;transition:border-color .2s;font-family:var(--pro-font);box-sizing:border-box;color:var(--pro-ink);background:white; }
.pro-input:focus { border-color:var(--pro-green); }
.pro-input-error { border-color:var(--pro-red)!important; }
.pro-textarea { resize:vertical;min-height:72px; }

.classe-display { display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--pro-r-md);border:1.5px solid var(--pro-border);background:var(--pro-bg); }
.classe-name  { font-size:.9rem;font-weight:800;color:var(--pro-ink);flex:1; }
.classe-badge { padding:2px 8px;border-radius:100px;font-size:.68rem;font-weight:700;background:var(--pro-green-soft);color:var(--pro-green); }
.classe-missing { display:flex;align-items:center;gap:7px;padding:10px 14px;border-radius:var(--pro-r-md);border:1.5px solid #fecaca;background:var(--pro-red-soft);color:var(--pro-red);font-size:.82rem;font-weight:600; }

.pro-btn { display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:var(--pro-r-md);font-size:.85rem;font-weight:700;cursor:pointer;border:none;transition:all .2s;white-space:nowrap;font-family:var(--pro-font); }
.pro-btn-green { background:var(--pro-green);color:white; }
.pro-btn-green:hover:not(:disabled) { background:#059669; }
.pro-btn-green:disabled { opacity:.6;cursor:not-allowed; }
.pro-btn-ghost { background:transparent;border:1.5px solid var(--pro-border);color:var(--pro-ink); }
.pro-btn-ghost:hover:not(:disabled) { background:var(--pro-bg); }
.pro-btn-ghost:disabled { opacity:.5;cursor:not-allowed; }
.pro-card { background:white;border:1.5px solid var(--pro-border);border-radius:var(--pro-r-lg); }

.toggle-row  { display:flex;align-items:center;justify-content:space-between; }
.toggle-label { font-size:.85rem;font-weight:700;color:var(--pro-sub); }
.toggle-btn { width:44px;height:24px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .2s;background:var(--pro-border);padding:0;flex-shrink:0; }
.toggle-btn.toggle-on { background:var(--pro-green); }
.toggle-knob { position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:white;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s; }
.toggle-on .toggle-knob { transform:translateX(20px); }

.tiptap-toolbar { display:flex;align-items:center;gap:2px;flex-wrap:wrap;padding:8px;border:1.5px solid var(--pro-border);border-bottom:none;border-radius:var(--pro-r-md) var(--pro-r-md) 0 0;background:var(--pro-bg); }
.tt-btn { display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;border-radius:6px;border:none;background:transparent;cursor:pointer;color:var(--pro-sub);transition:all .15s;font-family:var(--pro-font);padding:0 6px; }
.tt-btn:hover { background:white;color:var(--pro-ink);box-shadow:0 1px 3px rgba(0,0,0,.08); }
.tt-active { background:white;color:var(--pro-green);box-shadow:0 1px 3px rgba(0,0,0,.1); }
.tt-sep { width:1px;height:20px;background:var(--pro-border);margin:0 4px; }
.tiptap-wrap { border:1.5px solid var(--pro-border);border-radius:0 0 var(--pro-r-md) var(--pro-r-md);min-height:200px; }
:deep(.tiptap-area) { padding:14px 16px;min-height:200px;outline:none;font-family:var(--pro-font);font-size:.9rem;color:var(--pro-ink);line-height:1.7; }
:deep(.tiptap-area h2) { font-size:1.2rem;font-weight:800;margin:12px 0 6px;color:var(--pro-ink); }
:deep(.tiptap-area h3) { font-size:1rem;font-weight:700;margin:10px 0 4px;color:var(--pro-ink); }
:deep(.tiptap-area ul), :deep(.tiptap-area ol) { padding-left:20px; }
:deep(.tiptap-area p) { margin:4px 0; }

.medias-list { display:flex;flex-direction:column;gap:8px; }
.media-item { display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:var(--pro-r-md);border:1.5px solid var(--pro-border);background:white; }
.media-item-new { border-color:rgba(16,185,129,.35);background:rgba(16,185,129,.02); }
.media-preview { width:52px;height:40px;border-radius:6px;overflow:hidden;flex-shrink:0;background:var(--pro-bg);display:flex;align-items:center;justify-content:center; }
.media-preview-el { width:100%;height:100%;object-fit:cover; }
.media-preview-audio { width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--mb,#fef3c7);color:var(--mc,#f59e0b); }
.media-info { flex:1;min-width:0;display:flex;flex-direction:column;gap:2px; }
.media-type-badge { display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:100px;font-size:.65rem;font-weight:700;background:var(--mb,#f1f5f9);color:var(--mc,#64748b);align-self:flex-start; }
.media-url  { font-size:.75rem;color:var(--pro-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.media-size { font-size:.7rem;color:var(--pro-muted); }
.media-del-btn { width:30px;height:30px;border-radius:7px;flex-shrink:0;border:1.5px solid var(--pro-border);background:white;color:var(--pro-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s; }
.media-del-btn:hover:not(:disabled) { background:var(--pro-red-soft);color:var(--pro-red);border-color:#fecaca; }
.media-del-btn:disabled { opacity:.5;cursor:not-allowed; }
.media-add-row { display:flex;gap:8px;flex-wrap:wrap;margin-top:4px; }
.media-add-btn { display:inline-flex;align-items:center;gap:20px;padding:70px 90px;border-radius:var(--pro-r-md);border:1.5px dashed var(--pro-border);background:var(--pro-bg);font-size:1rem;font-weight:700;color:var(--pro-sub);cursor:pointer;transition:all .15s;font-family:var(--pro-font); }
.media-add-btn:hover { border-color:var(--pro-green);color:var(--pro-green);background:var(--pro-green-soft); }

.media-summary { display:flex;flex-direction:column;gap:8px; }
.ms-row { display:flex;align-items:center;gap:10px;font-size:.82rem;font-weight:600;color:var(--pro-sub); }
.ms-icon { width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }

.cfv-error-box { display:flex;flex-direction:column;align-items:center;gap:12px;padding:48px;text-align:center;color:var(--pro-red); }
</style>