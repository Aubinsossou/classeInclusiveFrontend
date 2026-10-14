/**
 * Périmètre de mesure : routes réelles × rôles × largeurs.
 * Outil de mesure responsive — outils/responsive/routes.mjs
 *
 * L'inventaire des 39 routes est extrait de src/router/index.js (branche
 * landing-page). Les routes protégées listent le rôle requis, car c'est le
 * rôle qui détermine le jeu de fixtures injecté.
 */

/** 12 largeurs : couvre le petit mobile jusqu'au grand desktop, sans trou. */
export const WIDTHS = [
  320, 360, 375, 390, 414, 480, 600, 768, 900, 1024, 1280, 1440,
]

export const HEIGHT = 900

/**
 * `role: ''` = route publique, aucune session requise.
 * `role: 'ecole'|'enseignant'|'eleve'|'client'` = session factice correspondante.
 */
export const ROUTES = [
  // ── Publiques ────────────────────────────────────────────────────
  { p: '/', role: '' },
  { p: '/ecole/login', role: '' },
  { p: '/ecole/register', role: '' },
  { p: '/enseignant/login', role: '' },
  { p: '/eleve/login', role: '' },
  { p: '/client/login', role: '' },
  { p: '/client/register', role: '' },

  // ── Espace école ─────────────────────────────────────────────────
  { p: '/ecole/dashboard', role: 'ecole' },
  { p: '/ecole/enseignant', role: 'ecole' },
  { p: '/ecole/matiere', role: 'ecole' },
  { p: '/ecole/eleve', role: 'ecole' },
  { p: '/ecole/classe', role: 'ecole' },

  // ── Espace enseignant ────────────────────────────────────────────
  { p: '/enseignant/dashboard', role: 'enseignant' },
  { p: '/enseignant/cours', role: 'enseignant' },
  { p: '/enseignant/cours/form', role: 'enseignant' },
  { p: '/enseignant/cours/form/1', role: 'enseignant' },
  { p: '/enseignant/eleve', role: 'enseignant' },
  { p: '/enseignant/quiz', role: 'enseignant' },
  { p: '/enseignant/cours/bilan', role: 'enseignant' },

  // ── Espace élève (standard) ──────────────────────────────────────
  { p: '/eleve/dashboard', role: 'eleve' },
  { p: '/eleve/subject/1/courses', role: 'eleve' },
  { p: '/eleve/subject/1/lesson/1', role: 'eleve' },
  { p: '/eleve/subject/1/lesson/1/quiz', role: 'eleve' },
  { p: '/eleve/subject/1/lesson/1/result', role: 'eleve' },

  // ── Espace élève (déficience visuelle) ───────────────────────────
  { p: '/eleve/blind', role: 'eleve' },
  { p: '/eleve/blind/subject/1', role: 'eleve' },
  { p: '/eleve/blind/subject/1/lesson/1', role: 'eleve' },
  { p: '/eleve/blind/subject/1/lesson/1/quiz', role: 'eleve' },

  // ── Espace client (lecture seule) ────────────────────────────────
  { p: '/client/dashboard', role: 'client' },
  { p: '/client/ecoles', role: 'client' },
  { p: '/client/classes', role: 'client' },
  { p: '/client/matieres', role: 'client' },
  { p: '/client/enseignants', role: 'client' },
  { p: '/client/cours', role: 'client' },
  { p: '/client/quizzes', role: 'client' },
  { p: '/client/handicaps', role: 'client' },
  { p: '/client/eleves', role: 'client' },
  { p: '/client/etablissements/1', role: 'client' },
  { p: '/client/profil', role: 'client' },
]

/** Rôles distincts, dans l'ordre de balayage. */
export const ROLES = [...new Set(ROUTES.map((r) => r.role))]

/** Nombre de mesures réellement effectuées (route × largeur). */
export const MEASURE_COUNT = ROUTES.length * WIDTHS.length

export default { WIDTHS, HEIGHT, ROUTES, ROLES, MEASURE_COUNT }
