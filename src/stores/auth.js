// ============================================================
//  stores/auth.js — connecté à l'API réelle
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/axios'

const HANDICAP_MAP = {
  'aucun':              [],
  'aveugle':            ['blind'],
  'malvoyant':          ['low_vision'],
  'sourd':              ['deaf'],
  'sourd-muet':         ['deaf'],
  'muet':               ['deaf'],
  'sourd et malvoyant': ['deaf', 'low_vision'],
  'aveugle et sourd':   ['blind', 'deaf'],
}

function mapHandicap(handicapName) {
  if (!handicapName) return []
  return HANDICAP_MAP[handicapName.toLowerCase().trim()] ?? []
}

export const useAuthStore = defineStore('auth', () => {

  const user  = ref(null)
  const token = ref(localStorage.getItem('edu_token') || null)

  const disabilityTypes = computed(() => {
    if (user.value?.handicap?.name) return mapHandicap(user.value.handicap.name)
    return user.value?.disability_type || []
  })

  const isBlind         = computed(() => disabilityTypes.value.includes('blind'))
  const isLowVision     = computed(() => disabilityTypes.value.includes('low_vision'))
  const isDeaf          = computed(() => disabilityTypes.value.includes('deaf'))
  const isMute          = computed(() => disabilityTypes.value.includes('mute'))
  const isNormal        = computed(() => !!user.value && disabilityTypes.value.length === 0)
  const isLoggedIn      = computed(() => !!user.value && !!token.value)

  // Normal + malvoyant + sourd + sourd-muet = audio + vidéo + texte + zoom
  const hasAudioPlayer  = computed(() => !isBlind.value && !!user.value)
  const hasVideoPlayer  = computed(() => !isBlind.value && !!user.value)
  const hasTypoControls = computed(() => isLowVision.value || isNormal.value)
  const needsHighContrast = computed(() => isLowVision.value || isBlind.value)
  const needsSubtitles  = computed(() => isDeaf.value)
  const needsLargeText  = computed(() => isLowVision.value || isBlind.value)
  const needsAudio      = computed(() => isBlind.value)

  // ── API calls ─────────────────────────────────────────────

  async function loginWithCode(code) {
    const res = await api.post('/eleve/login', { code })
    const { data: userData, access_token } = res.data
    _setSession(userData, access_token)
    return userData
  }

  async function fetchProfile() {
    if (!token.value) return null
    try {
      const res = await api.get('/eleve/getEleve', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      const userData = res.data.data
      user.value = userData
      localStorage.setItem('edu_user', JSON.stringify(userData))
      return userData
    } catch (err) {
      if (err?.response?.status === 401) {
        // Token expiré — nettoyer la session
        _clearSession()
      }
      throw err
    }
  }

  async function logoutApi() {
    try {
      await api.delete('/eleve/logout', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
    } catch {}
    _clearSession()
  }

  // ── Helpers ───────────────────────────────────────────────

  function _setSession(userData, authToken) {
    user.value  = userData
    token.value = authToken
    localStorage.setItem('edu_token', authToken)
    localStorage.setItem('edu_user', JSON.stringify(userData))
  }

  function _clearSession() {
    user.value  = null
    token.value = null
    localStorage.removeItem('edu_token')
    localStorage.removeItem('edu_user')
  }

  function login(userData, authToken) { _setSession(userData, authToken) }
  function logout() { _clearSession() }

  function init() {
    const stored = localStorage.getItem('edu_user')
    if (stored && token.value) {
      try { user.value = JSON.parse(stored) } catch {}
    }
  }

  // Cours de l'enseignant de la classe (relation hasOne via classe_id)
  const cours = computed(() => {
    return user.value?.classe?.enseignant?.cours || []
  })

  // Matières uniques — extraites depuis cours.matiere (chargé par l'API)
  const matieres = computed(() => {
    const map = new Map()
    for (const c of cours.value) {
      if (c.matiere && !map.has(c.matiere.id)) {
        map.set(c.matiere.id, c.matiere)
      }
    }
    return [...map.values()]
  })

  // Cours filtrés par matière
  function coursByMatiere(matiereId) {
    return cours.value.filter(c => c.matiere?.id === Number(matiereId))
  }

  function mediasOfType(cours, type) {
    return (cours?.medias || []).filter(m => m.type === type)
  }

  // Préfixer les URLs relatives des médias avec l'URL du backend
  function mediaUrl(url) {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return base + url
  }

  return {
    user, token, isLoggedIn,
    disabilityTypes,
    isBlind, isLowVision, isDeaf, isMute, isNormal,
    needsAudio, hasAudioPlayer, hasVideoPlayer,
    hasTypoControls, needsHighContrast, needsSubtitles, needsLargeText,
    cours, matieres, coursByMatiere,
    loginWithCode, fetchProfile, logoutApi, mediaUrl,
    login, logout, init,
    mediasOfType,
  }
})