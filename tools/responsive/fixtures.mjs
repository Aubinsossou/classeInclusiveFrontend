/**
 * Fixtures de mesure responsive — outils/responsive/fixtures.mjs
 *
 * ⚠️ Ces données ne sont PAS un contrat API. Elles servent uniquement à
 *    remplir les pages afin de mesurer le responsive sur du contenu réel.
 *
 * Principe : le contenu est volontairement « hostile ».
 *   - libellés longs, non coupables (pas d'espace de césure sur les noms propres)
 *   - tableaux à 10+ lignes
 *   - textes longs
 * Un contenu court et soigné ne révèle aucun débordement : la mesure serait
 * faussement verte. On cherche ici à faire craquer la mise en page.
 *
 * Formes déduites du code appelant (src/views/client/ClientDashboard.spec.js,
 * src/composables/useClientStats.js:96 → res.data.data, et les vues qui
 * consomment res.data.data ?? res.data).
 */

// ── Générateurs de chaînes hostiles ────────────────────────────────

/** Nom propre long sans espace de césure : cas le plus défavorable. */
export const LONG_NAME = 'Établissement-Saint-Exupéry-de-la-Communauté-Urbaine'

/** Libellé long avec espaces (teste le retour à la ligne). */
export const LONG_TEXT =
  'Accompagnement pédagogique individualisé des élèves à besoins éducatifs particuliers'

/** E-mail long. */
export const LONG_EMAIL = 'responsable.pedagogique@etablissement-saint-exupery-cu.fr'

/** Numéro formaté. */
export const TEL = '+33 5 56 00 00 00'

const seq = (n, f) => Array.from({ length: n }, (_, i) => f(i + 1))

/**
 * Classes embarquées dans l'objet école. Certaines vues école lisent
 * userAuth.value.classes (adminEleve.vue:22) au lieu d'appeler une route
 * dédiée : sans cette relation, la page reste bloquée sur « Chargement ».
 * Déclaré via fonction pour rester indépendant de l'ordre de déclaration.
 */
const classesOf = (n = 10) =>
  seq(n, (i) => ({
    id: i,
    name: `Sixième-${String.fromCharCode(64 + i)}-Groupe-Renforcé-${LONG_NAME}`,
    ecole_id: 1,
  }))


// ── Entités ────────────────────────────────────────────────────────

export const ecole = {
  id: 1,
  name: LONG_NAME,
  nom: LONG_NAME,
  email: LONG_EMAIL,
  numero: TEL,
  classes: classesOf(),
  handicaps: [
    { id: 1, name: 'Visuel' },
    { id: 2, name: 'Auditif' },
    { id: 3, name: 'Moteur' },
    { id: 4, name: 'Troubles-de-l’attention-et-des-apprentissages' },
  ],
}

export const enseignant = {
  id: 1,
  name: 'Mme-Rabearivelo-Antsambotiana',
  prenom: 'Hantarivonirina',
  matricule: 'ENS-2026-0001',
  email: LONG_EMAIL,
  ecole_id: 1,
  classe: { id: 1, name: LONG_NAME },
}

export const eleve = {
  id: 1,
  name: 'Kouassi-Brou-Ahoua',
  prenom: 'Amandine',
  code: 'ELV-2026-0001',
  email: LONG_EMAIL,
  classe_id: 1,
  ecole_id: 1,
  handicap: { id: 1, name: 'Visuel' },
}

export const handicaps = [
  { id: 1, name: 'Visuel' },
  { id: 2, name: 'Auditif' },
  { id: 3, name: 'Moteur' },
  { id: 4, name: 'Troubles-de-l’attention-et-des-apprentissages' },
]

export const classes = seq(10, (i) => ({
  id: i,
  name: `Sixième-${String.fromCharCode(64 + i)}-Groupe-Renforcé-${LONG_NAME}`,
  ecole_id: 1,
  ecole: { id: 1, name: LONG_NAME },
  eleves: Array.from({ length: 12 }, (_, k) => k),
  enseignants: Array.from({ length: 3 }, (_, k) => k),
  matieres: Array.from({ length: 8 }, (_, k) => k),
}))

export const eleves = seq(12, (i) => ({
  id: i,
  name: `Élève-Numéro-${String(i).padStart(3, '0')}-${LONG_NAME}`,
  prenom: 'Prénom-Très-Long-Pour-Tester',
  code: `ELV-2026-${String(i).padStart(4, '0')}`,
  email: `eleve${i}.${LONG_EMAIL}`,
  classe: { id: (i % 10) + 1, name: classes[i % 10].name },
  handicap: handicaps[i % handicaps.length],
}))

export const enseignants = seq(10, (i) => ({
  id: i,
  name: `Enseignant-${String(i).padStart(3, '0')}-Rabearivelo-Antsambotiana`,
  prenom: 'Hantarivonirina',
  matricule: `ENS-2026-${String(i).padStart(4, '0')}`,
  email: `enseignant${i}.${LONG_EMAIL}`,
  classe: { id: 1, name: classes[0].name },
}))

export const matieres = seq(10, (i) => ({
  id: i,
  name: `Mathématiques-Appliquées-et-Sciences-Physiques-${i}`,
  ecole: { id: 1, name: LONG_NAME },
  cours: Array.from({ length: 6 }, (_, k) => k),
}))

export const cours = seq(10, (i) => ({
  id: i,
  title: `Chapitre-${i}-${LONG_TEXT}`,
  is_published: i % 3 === 0,
  quiz_authorise: i % 2 === 0,
  matiere: { id: 1, name: matieres[0].name },
  classe: { id: 1, name: classes[0].name },
  enseignant: { id: 1, name: enseignants[0].name },
  medias: Array.from({ length: 4 }, (_, k) => k),
  url: 'https://cdn.example.org/media/cours/tres-longue-url-de-fichier-video.mp4',
  created_at: '2026-09-24T10:00:00.000000Z',
}))

export const quizzes = seq(10, (i) => ({
  id: i,
  name: `Évaluation-Diagnostic-${i}-${LONG_TEXT}`,
  cours: { id: 1, title: cours[0].title },
  questions: seq(8, (q) => ({ id: q })),
}))

export const questions = seq(8, (i) => ({
  id: i,
  question: `Question-numéro-${i}-${LONG_TEXT}-?`,
  reponses: [
    { id: 1, name: 'Réponse-correcte-candidate', status: 'correct' },
    { id: 2, name: 'Réponse-incorrecte-candidate', status: 'incorrect' },
  ],
}))

// ── Statistiques client (9 endpoints statistics/*) ─────────────────

const stripCours = {
  total: 1284,
  publies: 842,
  non_publies: 442,
  publies_pourcentage: 65.58,
  quiz_authorise: 631,
  quiz_authorise_pourcentage: 49.14,
  avec_medias: 214,
  avec_medias_pourcentage: 16.67,
}

const stripGeneric = (total) => ({
  total,
  pourcentage_actifs: 78.42,
  pourcentage_inactifs: 21.58,
  avec_contenu: Math.round(total * 0.6),
  sans_contenu: Math.round(total * 0.4),
})

export const statsOverview = {
  total_etablissements: 12,
  total_classes: 84,
  total_eleves: 1284,
  total_enseignants: 96,
  total_matieres: 47,
  total_cours: 1284,
  total_cours_publies: 842,
  total_cours_publies_pourcentage: 65.58,
  total_quiz: 312,
  total_handicaps: 4,
  repartition_sexe: {
    disponible: false,
    raison: 'Aucune colonne sexe/genre dans eleves et enseignants.',
  },
  repartition_niveau: {
    disponible: false,
    raison: 'Aucune colonne niveau/cycle dans classes (seul champ : name).',
  },
  repartition_par_classe: seq(10, (i) => ({
    id: i,
    name: classes[i - 1].name,
    ecole_id: 1,
    ecole_name: LONG_NAME,
    total_eleves: 128,
    pourcentage: 9.97,
  })),
  repartition_par_etablissement: seq(10, (i) => ({
    id: i,
    ecole_id: i,
    name: `${LONG_NAME}-${i}`,
    nom: `${LONG_NAME}-${i}`,
    total_classes: 84,
    total_eleves: 1284,
    total_enseignants: 96,
    total_cours: 1284,
    total_matieres: 47,
    total_quiz: 312,
  })),
  repartition_par_handicap: seq(4, (i) => ({
    id: i,
    name: handicaps[i - 1].name,
    total_eleves: 321,
    pourcentage: 25,
  })),
  cours: stripCours,
}

export const stats = {
  overview: statsOverview,
  etablissements: seq(10, (i) => ({
    id: i,
    name: `${LONG_NAME}-${i}`,
    nom: `${LONG_NAME}-${i}`,
    email: LONG_EMAIL,
    numero: TEL,
    total_classes: 84,
    total_eleves: 1284,
    total_enseignants: 96,
    total_cours: 1284,
    total_matieres: 47,
    total_quiz: 312,
  })),
  classes: seq(10, (i) => ({
    id: i,
    name: classes[i - 1].name,
    ecole_name: LONG_NAME,
    total_eleves: 128,
    pourcentage: 9.97,
  })),
  eleves: seq(10, (i) => ({ id: i, name: eleves[i - 1].name, pourcentage: 9.97 })),
  enseignants: seq(10, (i) => ({
    id: i,
    name: enseignants[i - 1].name,
    ...stripGeneric(96),
  })),
  matieres: seq(10, (i) => ({
    id: i,
    name: matieres[i - 1].name,
    total_cours: 128,
    total_cours_publies: 84,
    ...stripGeneric(128),
  })),
  cours: seq(10, (i) => ({ id: i, title: cours[i - 1].title, ...stripCours })),
  quiz: seq(10, (i) => ({
    id: i,
    name: quizzes[i - 1].name,
    total_questions: 128,
    ...stripGeneric(312),
  })),
  handicaps: seq(4, (i) => ({
    id: i,
    name: handicaps[i - 1].name,
    total_eleves: 321,
    total_types_handicap: 4,
    pourcentage: 25,
  })),
}

// ── Espace élève ───────────────────────────────────────────────────

export const matiereForEleve = {
  id: 1,
  name: 'Mathématiques-Appliquées-et-Sciences-Physiques',
}

export const coursesForEleve = seq(10, (i) => ({
  id: i,
  title: `Leçon-${i}-${LONG_TEXT}`,
  matiere_id: 1,
  is_completed: i % 2 === 0,
  medias: [{ type: 'video', url: 'https://cdn.example.org/media/lecon.mp4' }],
}))

export const lessonForEleve = {
  id: 1,
  title: `Leçon-1-${LONG_TEXT}`,
  contenu: LONG_TEXT,
  matiere: matiereForEleve,
  medias: [{ type: 'video', url: 'https://cdn.example.org/media/lecon.mp4' }],
  transcript: LONG_TEXT,
}

export const quizForEleve = {
  id: 1,
  name: `Évaluation-Diagnostic-${LONG_TEXT}`,
  cours: { id: 1, title: lessonForEleve.title },
  questions,
}

export const resultForEleve = {
  score: 6,
  total: 8,
  pourcentage: 75,
  reponses: questions.map((q) => ({
    question: q.question,
    reponse_eleve: q.reponses[0].name,
    reponse_correcte: q.reponses[0].name,
    status: 'correct',
  })),
}

/** Projection de bilan enseignant (retour-projection/index/:id). */
export const bilan = seq(10, (i) => ({
  id: i,
  eleve: { id: i, name: eleves[i - 1].name },
  cours: { id: i, title: cours[i - 1].title },
  score: 75,
  total: 8,
  pourcentage: 75,
  feedback: LONG_TEXT,
}))

export const fixtures = {
  ecole,
  enseignant,
  eleve,
  handicaps,
  classes,
  eleves,
  enseignants,
  matieres,
  cours,
  quizzes,
  questions,
  stats,
  bilan,
}

export default fixtures
