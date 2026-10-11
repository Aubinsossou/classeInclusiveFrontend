// Contenu statique centralise de la landing publique.
// 100% vitrine : aucune requete API. Fonctionnalites reelles uniquement.

export const landingNav = [
  { id: 'plateforme', label: 'La plateforme' },
  { id: 'fonctionnalites', label: 'Fonctionnalités' },
  { id: 'pour-qui', label: 'Destinataires' },
  { id: 'acces', label: 'Accès aux espaces' },
  { id: 'tech', label: 'Sécurité et technologies' },
]

export const heroContent = {
  badge: 'Plateforme numérique au service de l’inclusion scolaire',
  titleA: 'Construire une école plus inclusive,',
  titleB: 'une classe à la fois.',
  subtitle:
    'Classe Inclusive permet aux acteurs autorisés de structurer, consulter et exploiter les informations nécessaires au suivi et à l’accompagnement des élèves, dans le respect des périmètres d’accès de chacun.',
  primaryCta: { label: 'Accéder aux espaces', href: '#acces' },
  secondaryCta: { label: 'Découvrir la plateforme', href: '#plateforme' },
  note: 'Page de présentation publique — la consultation des espaces nécessite une authentification.',
}

export const stackBadges = ['Vue 3', 'Vite', 'Vue Router', 'Pinia', 'Axios', 'API REST', 'AblePlayer']

// Note : aucun indicateur chiffré public n'est exposé.
// Aucun endpoint public fiable n'existe côté backend : on n'invente aucun chiffre.

export const problemsSolutions = {
  problems: [
    { title: 'Des informations réparties entre plusieurs sources', text: 'Les informations relatives au suivi scolaire peuvent être réparties entre plusieurs sources, ce qui complexifie leur consultation et la coordination entre les différents acteurs.' },
    { title: 'Des supports à adapter aux besoins éducatifs', text: 'Un support unique ne répond pas nécessairement aux besoins éducatifs de chaque élève, notamment en cas de déficience visuelle, auditive ou de troubles de l’attention.' },
    { title: 'Un pilotage à consolider', text: 'Sans environnement structuré, la consolidation des informations relatives aux classes, aux enseignants et aux contenus pédagogiques reste difficile pour les établissements et les partenaires.' },
  ],
  solutions: [
    { title: 'Un environnement numérique structuré', text: 'Classe Inclusive propose un environnement permettant de structurer et de centraliser les informations utiles au suivi de l’inclusion scolaire, selon les périmètres d’accès.' },
    { title: 'Des parcours tenant compte des besoins', text: 'La plateforme met à disposition des parcours adaptés : navigation vocale, contraste renforcé, ajustement de la taille du texte, sous-titrage vidéo et présentations simplifiées.' },
    { title: 'Des outils de suivi et de pilotage', text: 'Les établissements, les enseignants et les partenaires autorisés disposent d’outils de suivi portant sur les contenus et l’activité relevant de leur périmètre.' },
  ],
}

export const features = [
  { tag: 'Enseignant', title: 'Conception de contenus pédagogiques', text: 'Élaboration de cours en texte enrichi, audio, vidéo et pièces jointes, programmés par classe et par matière.' },
  { tag: 'Élève', title: 'Évaluation et suivi des acquis', text: 'Questionnaires associés aux leçons, consultation des résultats et continuité du suivi des apprentissages.' },
  { tag: 'Établissement', title: 'Organisation des informations scolaires', text: 'Structuration des informations relatives aux enseignants, aux élèves, aux matières et aux classes du périmètre de l’établissement.' },
  { tag: 'Accessibilité', title: 'Parcours avec navigation vocale', text: 'Navigation guidée par synthèse vocale et structuration compatible avec les lecteurs d’écran.' },
  { tag: 'Accessibilité', title: 'Adaptation visuelle et auditive', text: 'Contraste renforcé, ajustement de la taille du texte, sous-titrage vidéo et présentations simplifiées selon le profil.' },
  { tag: 'Partenaire', title: 'Consultation et analyse', text: 'Accès en lecture seule aux informations et indicateurs relevant du périmètre autorisé, à des fins de suivi et d’analyse.' },
]

export const audiences = [
  { role: 'Enseignants', login: '/enseignant/login', loginLabel: 'Connexion enseignant', points: ['Conception de cours et de questionnaires', 'Accompagnement individualisé et bilans', 'Programmation des contenus par classe'] },
  { role: 'Établissements scolaires', login: '/ecole/login', register: '/ecole/register', loginLabel: 'Connexion établissement', points: ['Structuration des informations des enseignants, élèves et classes', 'Organisation des matières et des parcours scolaires', 'Tableau de suivi du périmètre de l’établissement'] },
  { role: 'Partenaires institutionnels', login: '/client/login', loginLabel: 'Connexion partenaire (compte attribué)', points: ['Compte attribué par l’administrateur, sans inscription publique', 'Consultation des informations relevant du périmètre autorisé', 'Indicateurs de suivi et d’analyse réservés aux comptes autorisés'] },
]

export const steps = [
  { n: '01', title: 'Structuration par l’établissement', text: 'Création du compte de l’établissement, puis organisation des classes, des matières, des enseignants et des élèves.' },
  { n: '02', title: 'Production pédagogique par l’enseignant', text: 'Élaboration de contenus pédagogiques programmés par classe, questionnaires associés, suivi et bilans.' },
  { n: '03', title: 'Parcours de l’élève', text: 'Authentification par code personnel, consultation des cours programmés, parcours adapté et suivi des résultats.' },
]

export const previewCards = [
  { title: 'Espace enseignant', text: 'Conception de cours, élaboration de questionnaires, suivi des élèves et bilans individualisés — après authentification.', link: '/enseignant/login', linkLabel: 'Connexion enseignant' },
  { title: 'Espace établissement', text: 'Structuration des classes, matières, enseignants et élèves, organisation des parcours et tableau de suivi — après authentification.', link: '/ecole/login', linkLabel: 'Connexion établissement' },
  { title: 'Espace partenaire', text: 'Outils de consultation et tableaux de bord réservés aux comptes attribués par l’administrateur — aucune donnée exposée publiquement.', link: '/client/login', linkLabel: 'Connexion partenaire' },
]

export const techList = [
  { name: 'Vue 3 + Vite', detail: 'Application monopage : vues, composants, routeur, gestion d’état' },
  { name: 'Vue Router', detail: 'Distinction des routes publiques et privées, contrôle des accès par rôle' },
  { name: 'Pinia + Axios', detail: 'Gestion de l’état et communication avec l’API REST /api/v1' },
  { name: 'AblePlayer', detail: 'Lecteur multimédia accessible avec sous-titrage' },
]

export const footerAccess = [
  { label: 'Connexion enseignant', href: '/enseignant/login' },
  { label: 'Connexion établissement', href: '/ecole/login' },
  { label: 'Connexion partenaire', href: '/client/login' },
  { label: 'Inscription établissement', href: '/ecole/register' },
]
