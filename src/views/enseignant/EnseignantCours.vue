<template>
  <div class="ce-root">
    <div class="ce-header">
      <button class="back-btn" @click="goBack">
        <AppIcon name="chevron-right" :size="14" style="transform:rotate(180deg)" />
        Retour à mes cours
      </button>

      <div class="ce-header-center">
        <div class="ce-header-title">
          <div class="ce-mode-badge" :class="isEdit ? 'badge-edit' : 'badge-new'">
            <AppIcon :name="isEdit ? 'edit' : 'plus'" :size="11" />
            {{ isEdit ? 'Modifier' : 'Nouveau cours' }}
          </div>
          <h1 class="ce-title">{{ form.title || (isEdit ? 'Modifier le cours' : 'Créer un cours') }}</h1>
        </div>
        <div class="ce-status-row" v-if="isEdit && editTarget">
          <span class="pro-badge" :class="editTarget.status === 'published' ? 'pro-badge-green' : 'pro-badge-gray'">
            {{ editTarget.status === 'published' ? 'Publié' : 'Brouillon' }}
          </span>
        </div>
      </div>

      <div class="ce-header-actions">
        <button class="pro-btn pro-btn-ghost" @click="goBack">Annuler</button>
        <button class="pro-btn pro-btn-green" @click="submitForm(false)" :disabled="!form.title.trim()">
          <AppIcon name="check" :size="14" />
          {{ isEdit ? 'Enregistrer' : 'Créer le cours' }}
        </button>
      </div>
    </div>

    <div class="ce-body">
      <div class="ce-main">
        <div class="ce-card">
          <div class="ce-card-head">
            <AppIcon name="book" :size="14" />
            Informations du cours
          </div>
          <div class="ce-card-body">
            <div class="ce-field ce-field-full">
              <label class="ce-label ce-label-req" for="ce-title">Titre du cours</label>
              <input id="ce-title" v-model="form.title" class="ce-input ce-input-lg"
                placeholder="Ex : Les additions et soustractions jusqu'à 100…" required />
              <span class="ce-helper">Soyez clair et descriptif pour les élèves.</span>
            </div>
            <div class="ce-field ce-field-full">
              <label class="ce-label" for="ce-desc">Description courte</label>
              <input id="ce-desc" v-model="form.desc" class="ce-input"
                placeholder="Résumez le cours en une phrase…" />
            </div>
            <div class="ce-row-2">
              <div class="ce-field">
                <label class="ce-label" for="ce-level">Niveau</label>
                <select id="ce-level" v-model="form.level" class="ce-input">
                  <option value="">Tous niveaux</option>
                  <option v-for="l in levels" :key="l" :value="l">{{ l }}</option>
                </select>
              </div>
              <div class="ce-field">
                <label class="ce-label" for="ce-duration">Durée estimée</label>
                <div class="ce-input-icon-wrap">
                  <AppIcon name="clock" :size="14" class="ce-input-icon" />
                  <input id="ce-duration" v-model="form.duration" class="ce-input ce-input-pl"
                    placeholder="Ex : 15 min" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ce-card">
          <div class="ce-card-head">
            <AppIcon name="edit" :size="14" />
            Contenu pédagogique
            <span class="ce-char-count">{{ form.content.length }} caractères</span>
          </div>
          <div class="ce-card-body">
            <div class="ce-toolbar">
              <button type="button" class="ce-tool-btn" @click="insertFormat('**','**')" title="Gras"><strong>G</strong></button>
              <button type="button" class="ce-tool-btn" @click="insertFormat('*','*')" title="Italique"><em>I</em></button>
              <button type="button" class="ce-tool-btn" @click="insertFormat('\n# ','')" title="Titre"><AppIcon name="layers" :size="12" /></button>
              <button type="button" class="ce-tool-btn" @click="insertFormat('\n- ','')" title="Liste"><AppIcon name="results" :size="12" /></button>
              <div class="ce-tool-sep"></div>
              <span class="ce-tool-hint">Markdown supporté</span>
            </div>
            <textarea id="ce-content" ref="contentRef" v-model="form.content" class="ce-textarea" rows="14"
              placeholder="Rédigez le contenu complet du cours ici…

Vous pouvez utiliser le Markdown :
# Titre de section
**texte en gras**
*texte en italique*
- élément de liste

Conseil : pensez aux élèves avec des difficultés de lecture. 
Utilisez des phrases courtes et claires."></textarea>
          </div>
        </div>

        <div class="ce-card">
          <div class="ce-card-head">
            <AppIcon name="publish" :size="14" />
            Médias du cours
            <span class="ce-head-hint">Supports visuels, audio et vidéo pour tous les profils d'élèves</span>
          </div>
          <div class="ce-card-body">
            <div class="media-grid">
              <div class="media-slot" :class="{ 'slot-filled': media.video.file }">
                <input ref="videoInput" type="file" accept="video/*" class="media-hidden" @change="handleFile('video', $event)" />
                <div v-if="!media.video.file" class="media-empty" @click="videoInput.click()">
                  <div class="media-empty-icon mi-video"><AppIcon name="video" :size="22" /></div>
                  <span class="media-empty-label">Vidéo</span>
                  <span class="media-empty-hint">MP4, MOV — pour tous</span>
                  <span class="media-empty-badge a11y-badge"><AppIcon name="eye" :size="10" /> Visuel</span>
                </div>
                <div v-else class="media-filled">
                  <video :src="media.video.preview" controls class="media-video"></video>
                  <div class="media-filled-footer">
                    <span class="media-filename">{{ media.video.file.name }}</span>
                    <button type="button" class="media-remove-btn" @click="removeMedia('video')"><AppIcon name="trash" :size="11" /> Retirer</button>
                  </div>
                </div>
              </div>

              <div class="media-slot" :class="{ 'slot-filled': media.images.files.length }">
                <input ref="imageInput" type="file" accept="image/*" multiple class="media-hidden" @change="handleFile('images', $event)" />
                <div v-if="!media.images.files.length" class="media-empty" @click="imageInput.click()">
                  <div class="media-empty-icon mi-image"><AppIcon name="image" :size="22" /></div>
                  <span class="media-empty-label">Images</span>
                  <span class="media-empty-hint">JPG, PNG — multiple</span>
                  <span class="media-empty-badge a11y-badge"><AppIcon name="eye" :size="10" /> Visuel</span>
                </div>
                <div v-else class="media-filled">
                  <div class="images-thumbs">
                    <div v-for="(url, i) in media.images.previews.slice(0,4)" :key="i" class="img-thumb">
                      <img :src="url" :alt="`Aperçu ${i+1}`" />
                      <span v-if="i===3 && media.images.files.length > 4" class="img-more">+{{ media.images.files.length - 4 }}</span>
                    </div>
                  </div>
                  <div class="media-filled-footer">
                    <span class="media-filename">{{ media.images.files.length }} image(s)</span>
                    <button type="button" class="media-remove-btn" @click="removeMedia('images')"><AppIcon name="trash" :size="11" /> Retirer</button>
                  </div>
                </div>
              </div>

              <div class="media-slot" :class="{ 'slot-filled': media.audio.file }">
                <input ref="audioInput" type="file" accept="audio/*" class="media-hidden" @change="handleFile('audio', $event)" />
                <div v-if="!media.audio.file" class="media-empty" @click="audioInput.click()">
                  <div class="media-empty-icon mi-audio"><AppIcon name="audio" :size="22" /></div>
                  <span class="media-empty-label">Audio</span>
                  <span class="media-empty-hint">MP3, WAV</span>
                  <span class="media-empty-badge a11y-badge a11y-hearing"><AppIcon name="ear" :size="10" /> Auditif</span>
                </div>
                <div v-else class="media-filled media-filled-audio">
                  <div class="audio-icon-wrap"><AppIcon name="refresh" :size="30" /></div>
                  <audio :src="media.audio.preview" controls class="audio-player"></audio>
                  <div class="media-filled-footer">
                    <span class="media-filename">{{ media.audio.file.name }}</span>
                    <button type="button" class="media-remove-btn" @click="removeMedia('audio')"><AppIcon name="trash" :size="11" /> Retirer</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="a11y-tip">
              <div class="a11y-tip-icon"><AppIcon name="teachers" :size="13" /></div>
              <p><strong>Conseil accessibilité :</strong> ajoutez l'audio pour les élèves malvoyants et la vidéo pour les élèves malentendants. La combinaison des 3 médias maximise l'inclusion.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="ce-sidebar">
        <div class="ce-card ce-preview-card">
          <div class="ce-card-head"><AppIcon name="eye" :size="14" /> Aperçu élève</div>
          <div class="preview-mock">
            <div class="pm-header">
              <div class="pm-icon"><AppIcon name="book" :size="16" /></div>
              <div class="pm-info">
                <div class="pm-title">{{ form.title || 'Titre du cours…' }}</div>
                <div class="pm-desc">{{ form.desc || 'Description…' }}</div>
              </div>
            </div>
            <div class="pm-badges">
              <span v-if="form.level" class="pm-badge">{{ form.level }}</span>
              <span v-if="form.duration" class="pm-badge"><AppIcon name="clock" :size="10" /> {{ form.duration }}</span>
              <span v-if="media.video.file" class="pm-badge pm-badge-blue"><AppIcon name="eye" :size="10" /> Vidéo</span>
              <span v-if="media.audio.file" class="pm-badge pm-badge-green"><AppIcon name="ear" :size="10" /> Audio</span>
              <span v-if="media.images.files.length" class="pm-badge pm-badge-violet">Images</span>
            </div>
            <div class="pm-content-preview" v-if="form.content">
              {{ form.content.slice(0, 140) }}{{ form.content.length > 140 ? '…' : '' }}
            </div>
            <div v-else class="pm-content-empty">Le contenu apparaîtra ici…</div>
            <div class="pm-a11y-bar">
              <div class="pm-a11y-item" :class="{ 'a11y-on': media.video.file }"><AppIcon name="eye" :size="12" /> Vidéo</div>
              <div class="pm-a11y-item" :class="{ 'a11y-on': media.audio.file }"><AppIcon name="ear" :size="12" /> Audio</div>
              <div class="pm-a11y-item" :class="{ 'a11y-on': media.images.files.length }"><AppIcon name="layers" :size="12" /> Images</div>
              <div class="pm-a11y-item a11y-on"><AppIcon name="edit" :size="12" /> Texte</div>
            </div>
          </div>

          <button v-if="isEdit" class="pro-btn ce-preview-btn" @click="openCoursePreview">
            <AppIcon name="eye" :size="14" /> Aperçu lecteur inclusif
          </button>
        </div>

        <div class="ce-card">
          <div class="ce-card-head"><AppIcon name="teachers" :size="14" /> Accessibilité</div>
          <div class="a11y-checks">
            <div class="a11y-check" :class="{ 'ac-ok': form.title.trim().length > 5 }">
              <AppIcon :name="form.title.trim().length > 5 ? 'check' : 'x'" :size="11" /> Titre descriptif
            </div>
            <div class="a11y-check" :class="{ 'ac-ok': form.desc.trim().length > 0 }">
              <AppIcon :name="form.desc.trim().length > 0 ? 'check' : 'x'" :size="11" /> Description présente
            </div>
            <div class="a11y-check" :class="{ 'ac-ok': form.content.trim().length > 50 }">
              <AppIcon :name="form.content.trim().length > 50 ? 'check' : 'x'" :size="11" /> Contenu textuel suffisant
            </div>
            <div class="a11y-check" :class="{ 'ac-ok': !!media.audio.file }">
              <AppIcon :name="media.audio.file ? 'check' : 'x'" :size="11" /> Audio (malvoyants)
            </div>
            <div class="a11y-check" :class="{ 'ac-ok': !!media.video.file }">
              <AppIcon :name="media.video.file ? 'check' : 'x'" :size="11" /> Vidéo (malentendants)
            </div>
            <div class="a11y-check" :class="{ 'ac-ok': !!media.images.files.length }">
              <AppIcon :name="media.images.files.length ? 'check' : 'x'" :size="11" /> Supports visuels
            </div>
          </div>
          <div class="a11y-score">
            <div class="a11y-score-bar">
              <div class="a11y-score-fill" :style="{ width: a11yScore + '%' }"></div>
            </div>
            <span class="a11y-score-text">Score d'inclusion : <strong>{{ a11yScore }}%</strong></span>
          </div>
        </div>

        <div class="ce-card">
          <div class="ce-card-head"><AppIcon name="lightning" :size="14" /> Publication</div>
          <div style="display:flex;flex-direction:column;gap:8px;padding:16px;">
            <button class="pro-btn pro-btn-green ce-action-btn" @click="submitForm(false)" :disabled="!form.title.trim()">
              <AppIcon name="check" :size="14" /> {{ isEdit ? 'Enregistrer' : 'Créer le cours' }}
            </button>
            <button v-if="isEdit && editTarget?.status === 'draft'" class="pro-btn ce-action-btn" style="background:var(--pro-blue-soft);color:var(--pro-blue)" @click="saveAndPublish">
              <AppIcon name="publish" :size="14" /> Enregistrer et publier
            </button>
            <button class="pro-btn pro-btn-ghost ce-action-btn" @click="goBack">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// ============================================================================
// 1. COMPOSANT D'ICÔNE INTÉGRÉ (Remplace @/components/AppIcon.vue)
// ============================================================================
const AppIcon = (props) => {
  return h('svg', {
    width: props.size || 24,
    height: props.size || 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: props.style,
    class: 'app-icon'
  }, [
    // Rendu d'une icône générique de remplacement
    h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
    h('text', { x: 12, y: 15, fontSize: 8, textAnchor: 'middle', stroke: 'none', fill: 'currentColor', fontWeight: 'bold' }, props.name.substring(0,4))
  ])
}

// ============================================================================
// 2. STORE INTÉGRÉ (Remplace @/store/useTeacherStore)
// ============================================================================
const store = reactive({
  myCourses: [],
  addCourse(data) {
    const newId = Date.now()
    this.myCourses.push({ id: newId, ...data, status: 'draft' })
    return newId
  },
  updateCourse(id, data) {
    const index = this.myCourses.findIndex(c => c.id === id)
    if (index !== -1) Object.assign(this.myCourses[index], data)
  },
  publishCourse(id) {
    const course = this.myCourses.find(c => c.id === id)
    if (course) course.status = 'published'
  }
})

// ============================================================================
// 3. LOGIQUE ORIGINALE DU COMPOSANT
// ============================================================================
const router = useRouter()
const route  = useRoute()

const levels = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème']

// Mode édition ou création
const courseId   = computed(() => route.params.id ? Number(route.params.id) : null)
const isEdit     = computed(() => !!courseId.value)
const editTarget = computed(() => isEdit.value ? store.myCourses.find(c => c.id === courseId.value) : null)

const form = reactive({ title:'', desc:'', content:'', level:'', duration:'' })

onMounted(() => {
  if (editTarget.value) {
    Object.assign(form, {
      title:    editTarget.value.title    ?? '',
      desc:     editTarget.value.desc     ?? '',
      content:  editTarget.value.content  ?? '',
      level:    editTarget.value.level    ?? '',
      duration: editTarget.value.duration ?? '',
    })
  }
})

// Médias
const videoInput = ref(null)
const imageInput = ref(null)
const audioInput = ref(null)
const media = reactive({
  video:  { file: null, preview: null },
  images: { files: [], previews: [] },
  audio:  { file: null, preview: null },
})

function handleFile(type, event) {
  const files = Array.from(event.target.files)
  if (!files.length) return
  if (type === 'video') {
    media.video.file = files[0]; media.video.preview = URL.createObjectURL(files[0])
  } else if (type === 'images') {
    media.images.files = files; media.images.previews = files.map(f => URL.createObjectURL(f))
  } else if (type === 'audio') {
    media.audio.file = files[0]; media.audio.preview = URL.createObjectURL(files[0])
  }
  event.target.value = ''
}

function removeMedia(type) {
  if (type === 'video') { if (media.video.preview) URL.revokeObjectURL(media.video.preview); media.video = { file:null, preview:null } }
  else if (type === 'images') { media.images.previews.forEach(u => URL.revokeObjectURL(u)); media.images = { files:[], previews:[] } }
  else if (type === 'audio') { if (media.audio.preview) URL.revokeObjectURL(media.audio.preview); media.audio = { file:null, preview:null } }
}

// Éditeur texte simple
const contentRef = ref(null)
function insertFormat(prefix, suffix) {
  const el = contentRef.value
  if (!el) return
  const start = el.selectionStart; const end = el.selectionEnd
  const sel = form.content.slice(start, end)
  form.content = form.content.slice(0, start) + prefix + sel + suffix + form.content.slice(end)
  setTimeout(() => { el.selectionStart = start + prefix.length; el.selectionEnd = end + prefix.length; el.focus() }, 0)
}

// Score d'accessibilité
const a11yScore = computed(() => {
  let pts = 0
  if (form.title.trim().length > 5)      pts += 17
  if (form.desc.trim().length > 0)       pts += 17
  if (form.content.trim().length > 50)   pts += 16
  if (media.audio.file)                  pts += 17
  if (media.video.file)                  pts += 17
  if (media.images.files.length)         pts += 16
  return pts
})

// Soumission et Redirections
function submitForm(publish = false) {
  if (!form.title.trim()) return
  const data = { ...form }
  if (isEdit.value) {
    store.updateCourse(courseId.value, data)
    if (publish) store.publishCourse(courseId.value)
  } else {
    const id = store.addCourse(data)
    if (publish && id) store.publishCourse(id)
  }
  // Redirection vers PreviewCours après l'enregistrement
  router.push({ name: 'enseignantpreviewcours' })
}

function saveAndPublish() { submitForm(true) }

function goBack() { 
  // Redirection vers PreviewCours pour l'annulation/retour
  router.push({ name: 'enseignantpreviewcours' }) 
}

function openCoursePreview() {
  // Redirection vers PreviewCours pour l'aperçu
  router.push({ name: 'enseignantpreviewcours' })
}
</script>

<style scoped>
/* Ajout de valeurs de secours (fallback) pour les variables CSS au cas où ton fichier global ne les aurait pas chargées */
.ce-root { display:flex; flex-direction:column; gap:0; min-height:100%; font-family: sans-serif; }

.ce-header { display:flex; align-items:center; gap:16px; flex-wrap:wrap; padding:16px 0 20px; border-bottom:1px solid var(--pro-border, #e2e8f0); margin-bottom:24px; }
.back-btn { display:inline-flex; align-items:center; gap:5px; font-size:0.8rem; font-weight:700; color:var(--pro-sub, #475569); border:none; background:none; cursor:pointer; padding:0; transition:color .15s; flex-shrink:0; }
.back-btn:hover { color:var(--pro-green, #10b981); }

.ce-header-center { flex:1; min-width:0; }
.ce-header-title  { display:flex; flex-direction:column; gap:4px; }
.ce-mode-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px; font-size:0.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.07em; align-self:flex-start; }
.badge-new  { background:var(--pro-green-soft, #d1fae5); color:var(--pro-green, #10b981); }
.badge-edit { background:var(--pro-blue-soft, #dbeafe);  color:var(--pro-blue, #3b82f6);  }
.ce-title { font-size:1.3rem; font-weight:900; color:var(--pro-ink, #0f172a); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0;}
.ce-status-row { margin-top:3px; }
.ce-header-actions { display:flex; gap:8px; flex-shrink:0; }

.pro-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
.pro-btn-green { background: var(--pro-green, #10b981); color: white; }
.pro-btn-green:disabled { opacity: 0.5; cursor: not-allowed; }
.pro-btn-ghost { background: transparent; border: 1px solid var(--pro-border, #e2e8f0); color: var(--pro-ink, #0f172a); }

.pro-badge { display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; }
.pro-badge-green { background:var(--pro-green-soft, #d1fae5); color:var(--pro-green, #10b981); }
.pro-badge-gray { background:#f1f5f9; color:#64748b; }

.ce-body { display:grid; grid-template-columns:1fr 320px; gap:22px; align-items:start; }
@media(max-width:900px) { .ce-body { grid-template-columns:1fr; } }

.ce-card { background:white; border:1.5px solid var(--pro-border, #e2e8f0); border-radius:var(--pro-r-lg, 12px); overflow:hidden; margin-bottom:18px; }
.ce-card:last-child { margin-bottom:0; }
.ce-card-head { display:flex; align-items:center; gap:8px; padding:12px 18px; background:#f8fafc; border-bottom:1px solid var(--pro-border, #e2e8f0); font-size:0.78rem; font-weight:800; color:var(--pro-sub, #475569); text-transform:uppercase; letter-spacing:.06em; }
.ce-head-hint { font-size:0.7rem; font-weight:500; color:var(--pro-muted, #94a3b8); text-transform:none; letter-spacing:0; margin-left:auto; }
.ce-char-count { font-size:0.7rem; font-weight:500; color:var(--pro-muted, #94a3b8); text-transform:none; letter-spacing:0; margin-left:auto; }
.ce-card-body { padding:18px; display:flex; flex-direction:column; gap:14px; }

.ce-field { display:flex; flex-direction:column; gap:6px; }
.ce-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
@media(max-width:560px) { .ce-row-2 { grid-template-columns:1fr; } }

.ce-label { font-size:0.8rem; font-weight:700; color:var(--pro-sub, #475569); }
.ce-label-req::after { content:'*'; color:var(--pro-red, #ef4444); margin-left:3px; }
.ce-helper { font-size:0.72rem; color:var(--pro-muted, #94a3b8); }

.ce-input { width:100%; padding:10px 14px; border:1.5px solid var(--pro-border, #e2e8f0); border-radius:var(--pro-r-md, 8px); font-size:0.9rem; color:var(--pro-ink, #0f172a); background:white; outline:none; transition:border-color .15s, box-shadow .15s; box-sizing:border-box; }
.ce-input:focus { border-color:var(--pro-green, #10b981); box-shadow:0 0 0 3px rgba(16,185,129,.1); }
.ce-input-lg { font-size:1rem; font-weight:600; padding:12px 16px; }
.ce-input-icon-wrap { position:relative; }
.ce-input-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--pro-muted, #94a3b8); pointer-events:none; }
.ce-input-pl { padding-left:36px; }

.ce-toolbar { display:flex; align-items:center; gap:4px; padding:8px 12px; background:#f8fafc; border:1.5px solid var(--pro-border, #e2e8f0); border-radius:var(--pro-r-sm, 6px) var(--pro-r-sm, 6px) 0 0; border-bottom:none; }
.ce-tool-btn { width:28px; height:28px; border-radius:6px; border:1px solid transparent; background:transparent; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.85rem; color:var(--pro-sub, #475569); transition:all .13s; }
.ce-tool-btn:hover { background:white; border-color:var(--pro-border, #e2e8f0); color:var(--pro-ink, #0f172a); }
.ce-tool-sep { width:1px; height:18px; background:var(--pro-border, #e2e8f0); margin:0 4px; }
.ce-tool-hint { font-size:0.68rem; color:var(--pro-muted, #94a3b8); margin-left:auto; }

.ce-textarea { width:100%; padding:14px 16px; border:1.5px solid var(--pro-border, #e2e8f0); border-radius:0 0 var(--pro-r-md, 8px) var(--pro-r-md, 8px); font-family:'Courier New', monospace; font-size:0.88rem; color:var(--pro-ink, #0f172a); line-height:1.75; background:white; outline:none; resize:vertical; transition:border-color .15s; box-sizing:border-box; }
.ce-textarea:focus { border-color:var(--pro-green, #10b981); box-shadow:0 0 0 3px rgba(16,185,129,.1); }

.media-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0; border:1.5px solid var(--pro-border, #e2e8f0); border-radius:var(--pro-r-md, 8px); overflow:hidden; }
.media-grid > *:not(:last-child) { border-right:1px solid var(--pro-border, #e2e8f0); }
@media(max-width:600px) { .media-grid { grid-template-columns:1fr; } .media-grid > *:not(:last-child) { border-right:none; border-bottom:1px solid var(--pro-border, #e2e8f0); } }
.media-hidden { display:none; }
.media-slot { min-height:150px; position:relative; }

.media-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:22px 14px; min-height:150px; cursor:pointer; transition:background .15s; position:relative; }
.media-empty:hover { background:rgba(16,185,129,.04); }

.media-empty-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:2px; }
.mi-video { background:rgba(59,130,246,.09);  color:var(--pro-blue, #3b82f6);  }
.mi-image { background:rgba(139,92,246,.09); color:var(--pro-violet, #8b5cf6); }
.mi-audio { background:rgba(16,185,129,.09);  color:var(--pro-green, #10b981); }

.media-empty-label { font-size:0.85rem; font-weight:800; color:var(--pro-ink, #0f172a); }
.media-empty-hint  { font-size:0.7rem; color:var(--pro-muted, #94a3b8); text-align:center; }
.media-empty-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:100px; font-size:0.68rem; font-weight:700; margin-top:2px; }
.a11y-badge { background:var(--pro-blue-soft, #dbeafe); color:var(--pro-blue, #3b82f6); }
.a11y-hearing { background:var(--pro-green-soft, #d1fae5); color:var(--pro-green, #10b981); }

.media-filled { display:flex; flex-direction:column; gap:8px; padding:12px; background:#f8fafc; min-height:150px; justify-content:center; }
.media-filled-audio { align-items:center; }
.media-video { width:100%; max-height:100px; border-radius:8px; object-fit:cover; }
.audio-icon-wrap { color:var(--pro-green, #10b981); opacity:.5; }
.audio-player { width:100%; max-width:180px; height:32px; accent-color:var(--pro-green, #10b981); }
.media-filled-footer { display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap; }
.media-filename { font-size:0.7rem; color:var(--pro-muted, #94a3b8); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:120px; }
.media-remove-btn { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:6px; border:1px solid var(--pro-red, #ef4444); background:transparent; color:var(--pro-red, #ef4444); font-size:0.7rem; font-weight:700; cursor:pointer; transition:all .13s; flex-shrink:0; }
.media-remove-btn:hover { background:var(--pro-red, #ef4444); color:white; }

.images-thumbs { display:grid; grid-template-columns:1fr 1fr; gap:4px; }
.img-thumb { position:relative; aspect-ratio:1; border-radius:6px; overflow:hidden; background:var(--pro-border, #e2e8f0); }
.img-thumb img { width:100%; height:100%; object-fit:cover; }
.img-more { position:absolute; inset:0; background:rgba(15,23,42,.55); color:white; font-size:0.8rem; font-weight:900; display:flex; align-items:center; justify-content:center; border-radius:6px; }

.a11y-tip { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-radius:var(--pro-r-md, 8px); background:rgba(59,130,246,.05); border:1px solid rgba(59,130,246,.15); font-size:0.78rem; line-height:1.6; color:var(--pro-sub, #475569); }
.a11y-tip-icon { color:var(--pro-blue, #3b82f6); flex-shrink:0; margin-top:1px; }

.ce-sidebar { position:sticky; top:20px; display:flex; flex-direction:column; gap:0; }
.preview-mock { padding:14px 16px; display:flex; flex-direction:column; gap:10px; }
.pm-header { display:flex; align-items:flex-start; gap:10px; }
.pm-icon { width:36px; height:36px; border-radius:10px; flex-shrink:0; background:var(--pro-green-soft, #d1fae5); color:var(--pro-green, #10b981); display:flex; align-items:center; justify-content:center; }
.pm-info { flex:1; min-width:0; }
.pm-title { font-size:0.88rem; font-weight:800; color:var(--pro-ink, #0f172a); line-height:1.3; word-break:break-word; }
.pm-desc  { font-size:0.73rem; color:var(--pro-muted, #94a3b8); margin-top:2px; word-break:break-word; }
.pm-badges { display:flex; flex-wrap:wrap; gap:5px; }
.pm-badge { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:100px; font-size:0.68rem; font-weight:700; background:var(--pro-bg, #f8fafc); color:var(--pro-sub, #475569); border:1px solid var(--pro-border, #e2e8f0); }
.pm-badge-blue   { background:var(--pro-blue-soft, #dbeafe);   color:var(--pro-blue, #3b82f6); }
.pm-badge-green  { background:var(--pro-green-soft, #d1fae5);  color:var(--pro-green, #10b981); }
.pm-badge-violet { background:var(--pro-violet-soft, #ede9fe); color:var(--pro-violet, #8b5cf6); }

.pm-content-preview { font-size:0.78rem; color:var(--pro-sub, #475569); line-height:1.6; padding:10px 12px; background:var(--pro-bg, #f8fafc); border-radius:8px; border:1px solid var(--pro-border, #e2e8f0); white-space:pre-wrap; }
.pm-content-empty { font-size:0.76rem; color:var(--pro-muted, #94a3b8); font-style:italic; padding:10px 12px; }

.pm-a11y-bar { display:flex; gap:5px; flex-wrap:wrap; padding-top:4px; border-top:1px solid var(--pro-border, #e2e8f0); }
.pm-a11y-item { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:100px; font-size:0.68rem; font-weight:700; background:var(--pro-bg, #f8fafc); color:var(--pro-muted, #94a3b8); border:1px solid var(--pro-border, #e2e8f0); transition:all .15s; }
.a11y-on { background:var(--pro-green-soft, #d1fae5); color:var(--pro-green, #10b981); border-color:rgba(16,185,129,.2); }

.ce-preview-btn { margin:0 16px 14px; width:calc(100% - 32px); justify-content:center; background:var(--pro-blue-soft, #dbeafe); color:var(--pro-blue, #3b82f6); border:1.5px solid rgba(59,130,246,.2); }
.ce-preview-btn:hover { background:var(--pro-blue, #3b82f6); color:white; }

.a11y-checks { display:flex; flex-direction:column; gap:5px; padding:14px 16px; }
.a11y-check { display:flex; align-items:center; gap:7px; padding:6px 10px; border-radius:8px; font-size:0.76rem; font-weight:600; color:var(--pro-muted, #94a3b8); background:#f8fafc; border:1px solid var(--pro-border, #e2e8f0); transition:all .15s; }
.ac-ok { color:var(--pro-green, #10b981); background:var(--pro-green-soft, #d1fae5); border-color:rgba(16,185,129,.2); }

.a11y-score { padding:0 16px 14px; display:flex; flex-direction:column; gap:6px; }
.a11y-score-bar { height:6px; background:var(--pro-border, #e2e8f0); border-radius:3px; overflow:hidden; }
.a11y-score-fill { height:100%; border-radius:3px; background:var(--pro-green, #10b981); transition:width .4s ease; }
.a11y-score-text { font-size:0.76rem; color:var(--pro-sub, #475569); }
.a11y-score-text strong { color:var(--pro-green, #10b981); }

.ce-action-btn { width:100%; justify-content:center; padding:11px; }
</style>