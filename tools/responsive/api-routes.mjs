/**
 * Table de correspondance URL d'API → fixture.
 * Outil de mesure responsive uniquement (backend injoignable en local).
 *
 * L'ordre compte : la PREMIÈRE règle qui matche gagne.
 * Les réponses adoptent la forme attendue par chaque appelant :
 *   - { success, data } pour les vues qui lisent res.data.data ?? res.data
 *   - { data } brut (tableau) pour celles qui lisent res.data directement
 */

import * as F from './fixtures.mjs'

/** Enveloppe {success, data} — forme la plus courante côté backend. */
const wrap = (data) => ({ success: true, data })

/**
 * Règles de résolution. `re` est testée contre le chemin SANS le préfixe
 * /api/v1 (ex: 'ecole/eleve/index').
 */
export const API_ROUTES = [
  // ── École ──
  { re: /^ecole\/getEcole$/, body: () => wrap(F.ecole) },
  { re: /^ecole\/handicap\/index$/, body: () => wrap(F.handicaps) },
  { re: /^ecole\/eleve\/index$/, body: () => wrap(F.eleves) },
  { re: /^ecole\/classe\/index/, body: () => wrap(F.classes) },
  { re: /^ecole\/classe\/edit/, body: () => wrap(F.classes[0]) },
  { re: /^ecole\/classe\//, body: () => wrap(F.classes[0]) },
  { re: /^ecole\/matiere\/index/, body: () => wrap(F.matieres) },

  // ── Enseignant ──
  { re: /^enseignant\/getEnseignant$/, body: () => wrap(F.enseignant) },
  { re: /^enseignant\/cours\/index$/, body: () => wrap(F.cours) },
  { re: /^enseignant\/cours\/show/, body: () => wrap(F.cours[0]) },
  { re: /^enseignant\/cours\//, body: () => wrap(F.cours) },

  // ── Quiz / questions / réponses ──
  { re: /^quiz\/index/, body: () => wrap(F.quizzes) },
  { re: /^quiz\/show/, body: () => wrap(F.quizzes[0]) },
  { re: /^quiz\//, body: () => wrap(F.quizzes) },
  { re: /^question\/index/, body: () => wrap(F.questions) },
  { re: /^question\//, body: () => wrap(F.questions) },
  { re: /^reponse/, body: () => wrap(F.questions[0].reponses) },

  // ── Bilan enseignant ──
  { re: /^retour-projection\/index/, body: () => wrap(F.bilan) },

  // ── Élève ──
  { re: /^eleve\/getEleve$/, body: () => wrap(F.eleve) },
  { re: /^eleve\/connexion$/, body: () => wrap(F.eleve) },
  { re: /^eleve\/logout$/, body: () => wrap({ ok: true }) },
  { re: /^eleve\/matiere/, body: () => wrap([F.matiereForEleve]) },
  { re: /^eleve\/cours/, body: () => wrap(F.coursesForEleve) },
  { re: /^eleve\/lesson/, body: () => wrap(F.lessonForEleve) },
  { re: /^eleve\/quiz/, body: () => wrap(F.quizForEleve) },
  { re: /^eleve\/result/, body: () => wrap(F.resultForEleve) },

  // ── Client ──
  { re: /^client\/getClient$/, body: () => wrap(F.ecole) },
  { re: /^client\/statistics\/overview$/, body: () => wrap(F.stats.overview) },
  { re: /^client\/statistics\/etablissements\/\d+$/, body: () => wrap(F.stats.overview) },
  { re: /^client\/statistics\/etablissements$/, body: () => wrap(F.stats.etablissements) },
  { re: /^client\/statistics\/classes$/, body: () => wrap(F.stats.classes) },
  { re: /^client\/statistics\/eleves$/, body: () => wrap(F.stats.eleves) },
  { re: /^client\/statistics\/enseignants$/, body: () => wrap(F.stats.enseignants) },
  { re: /^client\/statistics\/matieres$/, body: () => wrap(F.stats.matieres) },
  { re: /^client\/statistics\/cours$/, body: () => wrap(F.stats.cours) },
  { re: /^client\/statistics\/quiz$/, body: () => wrap(F.stats.quiz) },
  { re: /^client\/statistics\/handicaps$/, body: () => wrap(F.stats.handicaps) },

  // Listes client (lecture seule)
  { re: /^client\/ecoles$/, body: () => wrap(F.stats.etablissements) },
  { re: /^client\/classes$/, body: () => wrap(F.classes) },
  { re: /^client\/matieres$/, body: () => wrap(F.matieres) },
  { re: /^client\/enseignants$/, body: () => wrap(F.enseignants) },
  { re: /^client\/cours$/, body: () => wrap(F.cours) },
  { re: /^client\/quizzes$/, body: () => wrap(F.quizzes) },
  { re: /^client\/handicaps$/, body: () => wrap(F.handicaps) },
  { re: /^client\/eleves$/, body: () => wrap(F.eleves) },
]

/** Écritures simulées : on renvoie un succès sans effet de bord. */
const isWrite = (method) => method === 'POST' || method === 'PUT' || method === 'PATCH'

/**
 * Résout une URL d'API en réponse HTTP simulée.
 * @returns {{status:number, body:unknown, matched:boolean}}
 */
export function resolveApi(method, pathname) {
  // Retire le préfixe /api/v1 et le slash initial, normalise les slashes.
  const path = pathname.replace(/^\/+/, '').replace(/^api\/v1\//, '').replace(/\/+$/, '')

  if (isWrite(method)) {
    return { status: 200, body: wrap({ ok: true }), matched: true }
  }

  for (const route of API_ROUTES) {
    if (route.re.test(path)) {
      return { status: 200, body: route.body(), matched: true }
    }
  }

  // Aucune règle : on renvoie une liste vide plutôt qu'une 404,
  // pour que la page rende son état « aucun résultat » et pas une erreur.
  return { status: 200, body: wrap([]), matched: false }
}

export default resolveApi
