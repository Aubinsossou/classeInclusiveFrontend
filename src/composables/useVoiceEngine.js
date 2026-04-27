// ============================================================
//  useVoiceEngine.js  —  Singleton global  v3 (Hybride Pro)
// ============================================================
import { ref } from 'vue'

const isSpeaking   = ref(false)
const isListening  = ref(false)
const lastHeard    = ref('')
const lastSpoken   = ref('')
const currentRecog = ref(null)
let   _aborted      = false
let   _frVoice      = null

// ── Cache voix native (Fallback) ──────────────────────────
function _loadVoices() {
  const voices = window.speechSynthesis.getVoices()
  _frVoice = voices.find(v => v.lang === 'fr-FR' && v.name.includes('Google')) 
             || voices.find(v => v.lang === 'fr-FR')
             || voices.find(v => v.lang.startsWith('fr'))
}

if (typeof window !== 'undefined') {
  _loadVoices()
  window.speechSynthesis.addEventListener('voiceschanged', _loadVoices)
}

function stopAll() {
  _aborted = true
  try { window.speechSynthesis.cancel() } catch {}
  // Arrêter aussi l'audio si on utilise le mode API
  if (window._currentAudio) {
    window._currentAudio.pause()
    window._currentAudio = null
  }
  isSpeaking.value = false
  if (currentRecog.value) {
    try { currentRecog.value.abort() } catch {}
    currentRecog.value = null
  }
  isListening.value = false
}

// ─────────────────────────────────────────────────────────
//  SPEAK (Version Hybride)
// ─────────────────────────────────────────────────────────
async function speak(text) {
  return new Promise(async (resolve) => {
    if (!text || _aborted) return resolve()

    _aborted = false // Sécurité : on réactive si on appelle speak
    lastSpoken.value = text
    isSpeaking.value = true

    // --- TENTATIVE VOIX PRO (API) ---
    try {
      // Remplace par l'URL de ton futur serveur Laravel en ligne
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error("Mode API indisponible")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      window._currentAudio = audio // Stockage pour pouvoir l'arrêter via stopAll

      audio.onended = () => {
        isSpeaking.value = false
        URL.revokeObjectURL(url)
        resolve()
      }
      audio.onerror = () => { throw new Error("Erreur audio") }
      audio.play()

    } catch (e) {
      // --- FALLBACK VOIX NATIVE (Si l'API échoue ou Firefox offline) ---
      console.warn("Mode API échoué, utilisation de la voix navigateur.");
      
      try { window.speechSynthesis.cancel() } catch {}

      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = 'fr-FR'
      utt.rate = 0.88
      if (_frVoice) utt.voice = _frVoice

      const safety = setTimeout(() => {
        isSpeaking.value = false
        resolve()
      }, 30000)

      utt.onend = () => {
        clearTimeout(safety)
        isSpeaking.value = false
        resolve()
      }
      utt.onerror = () => {
        clearTimeout(safety)
        isSpeaking.value = false
        resolve()
      }

      window.speechSynthesis.speak(utt)
    }
  })
}

// ─────────────────────────────────────────────────────────
//  LISTEN (Inchangé, car la reco de Chrome est déjà top)
// ─────────────────────────────────────────────────────────
function listen(commandMap, timeout = 9000) {
  return new Promise((resolve) => {
    if (_aborted) return resolve(null)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return resolve(null)

    if (currentRecog.value) {
      try { currentRecog.value.abort() } catch {}
    }

    const recog = new SpeechRecognition()
    recog.lang = 'fr-FR'
    recog.interimResults = false
    recog.maxAlternatives = 3
    currentRecog.value = recog
    isListening.value = true

    let done = false
    const finish = (val) => {
      if (done) return
      done = true
      clearTimeout(timer)
      isListening.value = false
      currentRecog.value = null
      resolve(val)
    }

    const timer = setTimeout(() => {
      try { recog.abort() } catch {}
      finish(null)
    }, timeout)

    recog.onresult = (e) => {
      const candidates = Array.from(e.results[0]).map(r =>
        r.transcript.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
      lastHeard.value = candidates[0] || ''

      for (const transcript of candidates) {
        for (const [pattern, action] of Object.entries(commandMap || {})) {
          if (pattern.split('|').some(v => transcript.includes(v))) {
            return finish({ transcript, action })
          }
        }
      }
      finish({ transcript: candidates[0], action: null })
    }

    recog.onerror = () => finish(null)
    recog.onend = () => finish(null)
    try { recog.start() } catch { finish(null) }
  })
}

// ─────────────────────────────────────────────────────────
//  ANNOUNCE & UTILS
// ─────────────────────────────────────────────────────────
async function announce(text, commandMap, onUnrecognized) {
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

function reset() { _aborted = false }

export function useVoiceEngine() {
  return { isSpeaking, isListening, lastHeard, lastSpoken, speak, listen, announce, reset, stop: stopAll, stopAll }
}