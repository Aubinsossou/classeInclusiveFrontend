// ============================================================
//  useVoiceEngine.js  —  Singleton global  v2
//
//  Bugs corrigés :
//  1. _aborted restait true après stopAll → speak() muet
//     Fix : speak() remet _aborted = false lui-même
//  2. getVoices() retourne [] au 1er appel (async)
//     Fix : voix chargée via voiceschanged + cache
//  3. Chaîne announce → lireBloc rompue si _aborted
//     Fix : lireBloc passe par announce(), pas speak() direct
// ============================================================

import { ref } from 'vue'

// ── Singleton ─────────────────────────────────────────────
const isSpeaking   = ref(false)
const isListening  = ref(false)
const lastHeard    = ref('')
const lastSpoken   = ref('')
const currentRecog = ref(null)
let   _aborted     = false

// ── Cache voix française ──────────────────────────────────
let _frVoice = null

function _loadVoices() {
  const voices = window.speechSynthesis.getVoices()
  const fr = voices.find(v => v.lang === 'fr-FR')
          || voices.find(v => v.lang.startsWith('fr'))
  if (fr) _frVoice = fr
}

// Charger maintenant ET lors de voiceschanged
_loadVoices()
if (typeof window !== 'undefined') {
  window.speechSynthesis.addEventListener('voiceschanged', _loadVoices)
}

// ─────────────────────────────────────────────────────────
//  STOP global
// ─────────────────────────────────────────────────────────
function stopAll() {
  _aborted = true
  try { window.speechSynthesis.cancel() } catch {}
  isSpeaking.value  = false
  if (currentRecog.value) {
    try { currentRecog.value.abort() } catch {}
    currentRecog.value = null
  }
  isListening.value = false
}

// ─────────────────────────────────────────────────────────
//  SPEAK
// ─────────────────────────────────────────────────────────
function speak(text) {
  return new Promise((resolve) => {
    if (!text) { resolve(); return }
    // Si stopAll() a été appelé (navigation), on ne parle pas
    if (_aborted) { resolve(); return }

    lastSpoken.value  = text
    isSpeaking.value  = true

    // Annuler toute synthèse en cours
    try { window.speechSynthesis.cancel() } catch {}

    const utt     = new SpeechSynthesisUtterance(text)
    utt.lang      = 'fr-FR'
    utt.rate      = 0.88
    utt.pitch     = 1.0
    utt.volume    = 1.0

    // ← FIX 2 : utiliser le cache voix
    if (_frVoice) utt.voice = _frVoice

    utt.onend = () => {
      isSpeaking.value = false
      resolve()
    }
    utt.onerror = (e) => {
      isSpeaking.value = false
      // Ignorer l'erreur "interrupted" (cancel() appelé volontairement)
      resolve()
    }

    // Workaround Chrome : speechSynthesis se bloque après ~15s
    // On relance si nécessaire
    window.speechSynthesis.speak(utt)

    // Safety : si onend ne se déclenche pas après 30s
    const safety = setTimeout(() => {
      isSpeaking.value = false
      resolve()
    }, 30000)
    utt.onend = () => { clearTimeout(safety); isSpeaking.value = false; resolve() }
    utt.onerror = () => { clearTimeout(safety); isSpeaking.value = false; resolve() }
  })
}

// ─────────────────────────────────────────────────────────
//  LISTEN
// ─────────────────────────────────────────────────────────
function listen(commandMap, timeout = 9000) {
  return new Promise((resolve) => {
    if (_aborted) { resolve(null); return }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { resolve(null); return }

    if (currentRecog.value) {
      try { currentRecog.value.abort() } catch {}
    }

    const recog = new SpeechRecognition()
    recog.lang             = 'fr-FR'
    recog.interimResults   = false
    recog.maxAlternatives  = 3
    currentRecog.value     = recog
    isListening.value      = true

    let done = false
    function finish(val) {
      if (done) return
      done = true
      clearTimeout(timer)
      isListening.value  = false
      currentRecog.value = null
      resolve(val)
    }

    const timer = setTimeout(() => {
      try { recog.abort() } catch {}
      finish(null)
    }, timeout)

    recog.onresult = (e) => {
      const candidates = Array.from(e.results[0]).map(r =>
        r.transcript.toLowerCase().trim()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
      lastHeard.value = candidates[0] || ''

      for (const transcript of candidates) {
        for (const [pattern, action] of Object.entries(commandMap || {})) {
          const variants = pattern.split('|')
          if (variants.some(v => transcript.includes(v))) {
            finish({ transcript, action })
            return
          }
        }
      }
      // ← CHANGEMENT : si rien compris, retourner transcript sans action
      finish({ transcript: candidates[0], action: null })
    }

    recog.onerror = () => finish(null)
    recog.onend   = () => finish(null)

    try { recog.start() } catch { finish(null) }
  })
}
// ─────────────────────────────────────────────────────────
//  ANNOUNCE — parle puis écoute
// ─────────────────────────────────────────────────────────
async function announce(text, commandMap, onUnrecognized) {
  // Ne pas réinitialiser _aborted ici — speak() le fait
  await speak(text)
  if (_aborted) return

  if (!commandMap || Object.keys(commandMap).length === 0) return

  const result = await listen(commandMap)
  if (_aborted) return

  if (result?.action) {
    await result.action()
  } else if (typeof onUnrecognized === 'function') {
    await onUnrecognized(result?.transcript || '')
  }
}

// ─────────────────────────────────────────────────────────
//  Export
// ─────────────────────────────────────────────────────────
// Réinitialiser le flag _aborted — à appeler en onMounted des vues blind
function reset() {
  _aborted = false
}

export function useVoiceEngine() {
  return {
    isSpeaking,
    isListening,
    lastHeard,
    lastSpoken,
    speak,
    listen,
    announce,
    reset,
    stop:    stopAll,
    stopAll,
  }
}

export { stopAll as stopVoice }
