// ============================================================
//  stores/theme.js  — Thème fixe clair doux
// ============================================================

import { defineStore } from 'pinia'
import { ref } from 'vue'

// Palette clair doux — appliquée une seule fois au démarrage
const VARS = {
  '--bg':             '#F5F2ED',
  '--bg2':            '#EDE9E3',
  '--surface':        '#FDFBF8',
  '--surface2':       '#F0EDE7',
  '--border':         'rgba(120,100,80,0.12)',
  '--border2':        'rgba(120,100,80,0.2)',
  '--text':           '#2C2416',
  '--text2':          '#6B5E4E',
  '--text3':          '#9C8E80',
  '--accent':         '#5C4FE0',
  '--accent2':        '#7C3AED',
  '--accent-bg':      'rgba(92,79,224,0.08)',
  '--accent-border':  'rgba(92,79,224,0.22)',
  '--green':          '#1A7A46',
  '--green-bg':       'rgba(26,122,70,0.08)',
  '--green-border':   'rgba(26,122,70,0.2)',
  '--red':            '#B83232',
  '--red-bg':         'rgba(184,50,50,0.07)',
  '--red-border':     'rgba(184,50,50,0.2)',
  '--yellow':         '#8A6200',
  '--yellow-bg':      'rgba(138,98,0,0.08)',
  '--yellow-border':  'rgba(138,98,0,0.2)',
  '--shadow-sm':      '0 2px 8px rgba(44,36,22,0.07)',
  '--shadow-md':      '0 8px 24px rgba(44,36,22,0.1)',
}

function applyVars() {
  const targets = [
    document.documentElement,
    document.body,
    document.getElementById('app'),
  ]
  targets.forEach(el => {
    if (!el) return
    Object.entries(VARS).forEach(([k, v]) => el.style.setProperty(k, v))
    el.style.background = VARS['--bg']
    el.style.color = VARS['--text']
  })
}

// Appliquer immédiatement au chargement
applyVars()

export const useThemeStore = defineStore('theme', () => {
  const mode    = ref('light')
  const isDark  = ref(false)
  const isLight = ref(true)

  // No-op — thème fixe
  function toggle()    {}
  function setDark()   {}
  function setLight()  {}
  function setUser()   {}
  function clearUser() {}

  // Réappliquer si besoin (ex: après mount)
  function apply() { applyVars() }

  return { mode, isDark, isLight, toggle, setDark, setLight, setUser, clearUser, apply }
})