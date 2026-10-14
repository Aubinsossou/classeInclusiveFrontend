/**
 * Auto-contrôle des fixtures et de la table de routage.
 * Usage : node tools/responsive/selfcheck.mjs
 *
 * Vérifie que (1) tous les modules se chargent, (2) chaque endpoint utilisé
 * par le front est couvert par une règle, (3) les formes de données
 * correspondent à ce que les appelants consomment.
 */

import { resolveApi, API_ROUTES } from './api-routes.mjs'
import { ROUTES, WIDTHS, MEASURE_COUNT, ROLES } from './routes.mjs'
import * as F from './fixtures.mjs'

let fails = 0
const ok = (label, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗'} ${label}${extra ? ' — ' + extra : ''}`)
  if (!cond) fails++
}

// ── Périmètre ──
ok(`${ROUTES.length} routes`, ROUTES.length === 39, `attendu 39`)
ok(`${WIDTHS.length} largeurs`, WIDTHS.length === 12, `attendu 12`)
ok(`${MEASURE_COUNT} mesures`, MEASURE_COUNT === 468, `attendu 468`)
ok(`${ROLES.length} rôles`, ROLES.length === 5, ROLES.join(', '))

// ── Fixtures chargées ──
const sizes = {
  classes: F.classes.length,
  eleves: F.eleves.length,
  enseignants: F.enseignants.length,
  matieres: F.matieres.length,
  cours: F.cours.length,
  quizzes: F.quizzes.length,
  questions: F.questions.length,
  handicaps: F.handicaps.length,
}
console.log('\nVolumétries :', JSON.stringify(sizes))
ok(
  'toutes les listes >= 4 lignes',
  Object.values(sizes).every((n) => n >= 4),
  'minimum pour exercer un tableau'
)

// ── Résolution des endpoints réellement appelés par le front ──
const CASES = [
  '/api/v1/ecole/getEcole',
  '/api/v1/ecole/handicap/index',
  '/api/v1/ecole/eleve/index',
  '/api/v1/ecole/classe/index/1',
  '/api/v1/ecole/matiere/index/1',
  '/api/v1/enseignant/getEnseignant',
  '/api/v1/enseignant/cours/index',
  '/api/v1/enseignant/cours/show/1',
  '/api/v1/retour-projection/index/1',
  '/api/v1/eleve/getEleve',
  '/api/v1/eleve/connexion',
  '/api/v1/client/getClient',
  '/api/v1/client/statistics/overview',
  '/api/v1/client/statistics/etablissements',
  '/api/v1/client/statistics/etablissements/1',
  '/api/v1/client/statistics/classes',
  '/api/v1/client/statistics/eleves',
  '/api/v1/client/statistics/enseignants',
  '/api/v1/client/statistics/matieres',
  '/api/v1/client/statistics/cours',
  '/api/v1/client/statistics/quiz',
  '/api/v1/client/statistics/handicaps',
  '/api/v1/client/eleves',
  '/api/v1/client/ecoles',
  '/api/v1/client/cours',
  '/api/v1/client/quizzes',
]

console.log('\nRésolution GET :')
const unmatched = []
for (const url of CASES) {
  const r = resolveApi('GET', url)
  if (!r.matched) unmatched.push(url)
  const d = r.body?.data
  const kind = Array.isArray(d) ? `${d.length} él.` : d?.data ? 'enveloppe' : 'objet'
  console.log(`  ${r.matched ? '✓' : '·'} ${url.padEnd(48)} ${kind}`)
}
ok('endpoints non couverts', unmatched.length === 0, unmatched.join(', ') || 'tous couverts')

// ── Écritures ──
const post = resolveApi('POST', '/api/v1/quiz/store')
ok('POST simulé en 200', post.status === 200)

// ── Cohérence des formes consommées par le code ──
// On rejoue le chemin d'accès RÉEL du front : axios expose res.data = body,
// donc « res.data.data » côté applicatif correspond à body.data ici.
const res = (url) => ({ data: resolveApi('GET', url).body })

// useClientStats.js:96 → res?.data?.data
const overview = res('/api/v1/client/statistics/overview')
ok(
  'overview : res.data.data lisible (useClientStats:96)',
  overview?.data?.data?.total_eleves === 1284,
  `reçu ${overview?.data?.data?.total_eleves}`
)

// adminDashboard.vue:29 → response.data.data
const handicaps = res('/api/v1/ecole/handicap/index')
ok(
  'handicaps : res.data.data lisible (adminDashboard:29)',
  Array.isArray(handicaps?.data?.data) && handicaps.data.data.length === 4,
  `reçu ${handicaps?.data?.data?.length} él.`
)

// useClientList.js:59 → normList(res.data) doit retrouver la liste
const normList = (payload) => {
  const d = payload?.data ?? payload
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.items)) return d.items
  if (d && typeof d === 'object') return [d]
  return []
}
const clientEleves = res('/api/v1/client/eleves')
const norm = normList(clientEleves.data)
ok(
  'listes client : normList() retrouve 12 élèves (useClientList:22)',
  norm.length === 12,
  `reçu ${norm.length}`
)

// ClientProfil.vue:17 → r.data?.data ?? r.data
const profil = res('/api/v1/client/getClient')
const d = profil?.data?.data ?? profil?.data
ok('profil : r.data?.data lisible (ClientProfil:17)', typeof d?.name === 'string', d?.name)

console.log(
  `\n${fails === 0 ? '✔ Auto-contrôle vert.' : `✘ ${fails} échec(s).`} (${API_ROUTES.length} règles)`
)
process.exit(fails ? 1 : 0)
