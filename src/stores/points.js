// ============================================================
//  stores/points.js
//  Système de points persistant via localStorage
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LEVELS = [
  { name: 'Débutant',   min: 0,    max: 99,   color: '#94A3B8' },
  { name: 'Apprenti',   min: 100,  max: 299,  color: '#F59E0B' },
  { name: 'Confirmé',   min: 300,  max: 599,  color: '#F97316' },
  { name: 'Expert',     min: 600,  max: 999,  color: '#3B82F6' },
  { name: 'Champion',   min: 1000, max: 9999, color: '#A855F7' },
]

const POINT_RULES = {
  CORRECT_ANSWER:    { points: 10,  label: 'Bonne réponse'      },
  QUIZ_COMPLETED:    { points: 20,  label: 'Quiz terminé'        },
  QUIZ_PERFECT:      { points: 50,  label: 'Quiz parfait !'      },
  LESSON_COMPLETED:  { points: 15,  label: 'Cours terminé'       },
  FIRST_LESSON:      { points: 5,   label: 'Premier cours !'     },
}

export { POINT_RULES, LEVELS }

export const usePointsStore = defineStore('points', () => {

  // ── État ──────────────────────────────────────────────
  const totalPoints = ref(parseInt(localStorage.getItem('edu_points') || '0'))
  const history     = ref(JSON.parse(localStorage.getItem('edu_points_history') || '[]'))
  const pending     = ref([])   // points en attente d'animation

  // ── Niveau calculé ────────────────────────────────────
  const currentLevel = computed(() =>
    [...LEVELS].reverse().find(l => totalPoints.value >= l.min) || LEVELS[0]
  )

  const nextLevel = computed(() => {
    const idx = LEVELS.findIndex(l => l.name === currentLevel.value.name)
    return LEVELS[idx + 1] || null
  })

  const progressToNext = computed(() => {
    if (!nextLevel.value) return 100
    const range    = nextLevel.value.min - currentLevel.value.min
    const progress = totalPoints.value - currentLevel.value.min
    return Math.min(100, Math.round((progress / range) * 100))
  })

  const pointsToNextLevel = computed(() =>
    nextLevel.value ? nextLevel.value.min - totalPoints.value : 0
  )

  // ── Ajouter des points ────────────────────────────────
  function addPoints(ruleKey, meta = {}) {
    const rule = POINT_RULES[ruleKey]
    if (!rule) return

    const entry = {
      id:        Date.now(),
      points:    rule.points,
      label:     rule.label,
      timestamp: new Date().toISOString(),
      ...meta
    }

    totalPoints.value += rule.points
    history.value.unshift(entry)
    pending.value.push(entry)  // pour l'animation

    // Garder max 50 entrées dans l'historique
    if (history.value.length > 50) history.value = history.value.slice(0, 50)

    // Persister
    localStorage.setItem('edu_points', totalPoints.value.toString())
    localStorage.setItem('edu_points_history', JSON.stringify(history.value))

    return entry
  }

  // ── Consommer les points en attente (après animation) ─
  function clearPending() {
    pending.value = []
  }

  // ── Reset (pour les tests) ────────────────────────────
  function reset() {
    totalPoints.value = 0
    history.value     = []
    pending.value     = []
    localStorage.removeItem('edu_points')
    localStorage.removeItem('edu_points_history')
  }

  return {
    totalPoints,
    history,
    pending,
    currentLevel,
    nextLevel,
    progressToNext,
    pointsToNextLevel,
    addPoints,
    clearPending,
    reset,
    LEVELS,
    POINT_RULES,
  }
})
