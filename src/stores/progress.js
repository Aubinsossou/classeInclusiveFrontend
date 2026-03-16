// ============================================================
//  stores/progress.js
//  Progression pédagogique persistée par élève (userId)
//  Clé localStorage : edu_progress_<userId>
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useProgressStore = defineStore('progress', () => {

  const auth = useAuthStore()

  // ── Structure de données ──────────────────────────────
  // {
  //   subjects: {
  //     [subjectId]: {
  //       courses: {
  //         [courseId]: {
  //           status: 'not_started' | 'in_progress' | 'completed'
  //           lastBlock: 0,          // index du dernier bloc lu
  //           totalBlocks: 0,
  //           score: null,           // score quiz (0-100) ou null
  //           completedAt: null,     // ISO date
  //           startedAt: null,
  //         }
  //       }
  //     }
  //   },
  //   lastVisited: { subjectId, courseId, view } // pour resume global
  // }

  const data = ref(load())

  // ── Persistance ───────────────────────────────────────
  function storageKey() {
    return `edu_progress_${auth.user?.id || 'guest'}`
  }

  function load() {
    try {
      const raw = localStorage.getItem(`edu_progress_${auth.user?.id || 'guest'}`)
      return raw ? JSON.parse(raw) : { subjects: {}, lastVisited: null }
    } catch {
      return { subjects: {}, lastVisited: null }
    }
  }

  function save() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(data.value))
    } catch (e) {
      console.warn('Progress save failed', e)
    }
  }

  // Recharge quand l'utilisateur change (login/logout)
  function reload() {
    data.value = load()
  }

  // ── Getters ───────────────────────────────────────────

  function getCourse(subjectId, courseId) {
    return data.value.subjects?.[subjectId]?.courses?.[courseId] || null
  }

  function getSubjectProgress(subjectId) {
    const courses = data.value.subjects?.[subjectId]?.courses || {}
    const all     = Object.values(courses)
    const done    = all.filter(c => c.status === 'completed').length
    return { total: all.length, completed: done }
  }

  function getCourseStatus(subjectId, courseId) {
    return getCourse(subjectId, courseId)?.status || 'not_started'
  }

  function getLastBlock(subjectId, courseId) {
    return getCourse(subjectId, courseId)?.lastBlock || 0
  }

  function getLastScore(subjectId, courseId) {
    return getCourse(subjectId, courseId)?.score ?? null
  }

  function isCompleted(subjectId, courseId) {
    return getCourseStatus(subjectId, courseId) === 'completed'
  }

  function isInProgress(subjectId, courseId) {
    return getCourseStatus(subjectId, courseId) === 'in_progress'
  }

  // Cours en cours le plus récent (pour le banner "Reprendre")
  const lastVisited = computed(() => data.value.lastVisited || null)

  // ── Mutations ─────────────────────────────────────────

  function ensureCourse(subjectId, courseId, totalBlocks = 0) {
    if (!data.value.subjects[subjectId]) {
      data.value.subjects[subjectId] = { courses: {} }
    }
    if (!data.value.subjects[subjectId].courses[courseId]) {
      data.value.subjects[subjectId].courses[courseId] = {
        status:      'not_started',
        lastBlock:   0,
        totalBlocks,
        score:       null,
        completedAt: null,
        startedAt:   null,
      }
    }
    return data.value.subjects[subjectId].courses[courseId]
  }

  // Démarrer ou reprendre un cours
  function startCourse(subjectId, courseId, totalBlocks) {
    const course = ensureCourse(subjectId, courseId, totalBlocks)
    if (course.status === 'not_started') {
      course.status    = 'in_progress'
      course.startedAt = new Date().toISOString()
    }
    course.totalBlocks = totalBlocks
    setLastVisited(subjectId, courseId, 'lesson')
    save()
  }

  // Sauvegarder la position dans le cours (bloc en cours)
  function saveBlock(subjectId, courseId, blockIndex) {
    const course = ensureCourse(subjectId, courseId)
    course.lastBlock = blockIndex
    if (course.status === 'not_started') {
      course.status    = 'in_progress'
      course.startedAt = new Date().toISOString()
    }
    save()
  }

  // Terminer un cours (sans quiz)
  function completeCourse(subjectId, courseId) {
    const course = ensureCourse(subjectId, courseId)
    course.status      = 'completed'
    course.lastBlock   = course.totalBlocks
    course.completedAt = new Date().toISOString()
    save()
  }

  // Sauvegarder le score du quiz et marquer comme terminé
  function saveQuizScore(subjectId, courseId, score, total) {
    const course   = ensureCourse(subjectId, courseId)
    const pct      = Math.round((score / total) * 100)
    course.score   = pct
    // Considéré terminé si score ≥ 50%
    if (pct >= 50) {
      course.status      = 'completed'
      course.completedAt = new Date().toISOString()
    }
    setLastVisited(subjectId, courseId, 'result')
    save()
  }

  function setLastVisited(subjectId, courseId, view = 'lesson') {
    data.value.lastVisited = {
      subjectId,
      courseId,
      view,
      at: new Date().toISOString(),
    }
  }

  // Réinitialiser la progression d'un cours (refaire)
  function resetCourse(subjectId, courseId) {
    const course = ensureCourse(subjectId, courseId)
    course.status      = 'not_started'
    course.lastBlock   = 0
    course.score       = null
    course.completedAt = null
    course.startedAt   = null
    save()
  }

  // Réinitialiser toute la progression
  function resetAll() {
    data.value = { subjects: {}, lastVisited: null }
    save()
  }

  return {
    data,
    // getters
    getCourse,
    getCourseStatus,
    getLastBlock,
    getLastScore,
    getSubjectProgress,
    isCompleted,
    isInProgress,
    lastVisited,
    // mutations
    startCourse,
    saveBlock,
    completeCourse,
    saveQuizScore,
    resetCourse,
    resetAll,
    reload,
  }
})
