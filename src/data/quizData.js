// ============================================================
//  data/quizData.js  -  Questions par lessonId
//  Usage : getQuiz(lessonId, subjectPrefix)
// ============================================================

const quizDatabase = {

  // -- Mathematiques ------------------------------------------

  "math-1": {
    passingScore: 60,
    questions: [
      {
        id: "q1",
        text: "Quel nombre vient apres 49 ?",
        options: ["48", "50", "51", "59"],
        correctIndex: 1,
        explanation: "49 + 1 = 50. On passe a la dizaine suivante.",
      },
      {
        id: "q2",
        text: "Combien y a-t-il de dizaines dans 80 ?",
        options: ["8", "80", "18", "0"],
        correctIndex: 0,
        explanation: "80 = 8 dizaines et 0 unites.",
      },
      {
        id: "q3",
        text: "Quel est le plus grand nombre ?",
        options: ["72", "27", "70", "7"],
        correctIndex: 0,
        explanation: "72 est le plus grand car il a 7 dizaines et 2 unites.",
      },
      {
        id: "q4",
        text: "Comment ecrit-on quatre-vingt-cinq en chiffres ?",
        options: ["95", "85", "58", "75"],
        correctIndex: 1,
        explanation: "Quatre-vingts = 80, plus cinq = 85.",
      },
    ],
  },

  "math-2": {
    passingScore: 60,
    questions: [
      {
        id: "q1",
        text: "Combien font 34 + 25 ?",
        options: ["59", "69", "49", "58"],
        correctIndex: 0,
        explanation: "34 + 25 : unites 4+5=9, dizaines 3+2=5. Resultat : 59.",
      },
      {
        id: "q2",
        text: "Combien font 67 - 38 ?",
        options: ["39", "31", "29", "21"],
        correctIndex: 2,
        explanation: "67 - 38 = 29. On peut verifier : 29 + 38 = 67.",
      },
      {
        id: "q3",
        text: "Quel est le signe de l'addition ?",
        options: ["-", "x", "+", "/"],
        correctIndex: 2,
        explanation: "Le signe + (plus) est le signe de l'addition.",
      },
      {
        id: "q4",
        text: "Marie a 45 billes. Elle en perd 18. Combien en reste-t-il ?",
        options: ["63", "27", "37", "23"],
        correctIndex: 1,
        explanation: "45 - 18 = 27 billes restantes.",
      },
      {
        id: "q5",
        text: "Combien font 0 + 99 ?",
        options: ["100", "0", "99", "90"],
        correctIndex: 2,
        explanation: "Ajouter 0 ne change pas le nombre : 0 + 99 = 99.",
      },
    ],
  },

  "math-3": {
    passingScore: 60,
    questions: [
      {
        id: "q1",
        text: "Combien font 3 x 4 ?",
        options: ["10", "12", "14", "7"],
        correctIndex: 1,
        explanation: "3 x 4 = 12. Trois fois quatre egale douze.",
      },
      {
        id: "q2",
        text: "Combien font 5 x 5 ?",
        options: ["20", "15", "25", "30"],
        correctIndex: 2,
        explanation: "5 x 5 = 25. Cinq fois cinq egale vingt-cinq.",
      },
      {
        id: "q3",
        text: "Combien font 7 x 2 ?",
        options: ["12", "14", "16", "18"],
        correctIndex: 1,
        explanation: "7 x 2 = 14. Sept fois deux egale quatorze.",
      },
      {
        id: "q4",
        text: "Quel est le signe de la multiplication ?",
        options: ["+", "-", "x", "/"],
        correctIndex: 2,
        explanation: "Le signe x (fois) est le signe de la multiplication.",
      },
      {
        id: "q5",
        text: "Combien font 9 x 1 ?",
        options: ["0", "10", "9", "1"],
        correctIndex: 2,
        explanation: "Multiplier par 1 ne change pas le nombre : 9 x 1 = 9.",
      },
      {
        id: "q6",
        text: "Un paquet contient 6 bonbons. Combien dans 4 paquets ?",
        options: ["10", "24", "18", "12"],
        correctIndex: 1,
        explanation: "6 x 4 = 24 bonbons.",
      },
    ],
  },

  // -- Francais -----------------------------------------------

  "fr-1": {
    passingScore: 70,
    questions: [
      {
        id: "q1",
        text: "Parmi ces lettres, laquelle est une voyelle ?",
        options: ["B", "T", "A", "M"],
        correctIndex: 2,
        explanation: "Les voyelles sont : A, E, I, O, U, Y.",
      },
      {
        id: "q2",
        text: "Combien y a-t-il de voyelles dans le mot MAISON ?",
        options: ["2", "3", "4", "1"],
        correctIndex: 1,
        explanation: "M-A-I-S-O-N : A, I, O = 3 voyelles.",
      },
      {
        id: "q3",
        text: "Laquelle de ces lettres n'est PAS une voyelle ?",
        options: ["E", "I", "P", "U"],
        correctIndex: 2,
        explanation: "P est une consonne, pas une voyelle.",
      },
    ],
  },

  "fr-2": {
    passingScore: 60,
    questions: [
      {
        id: "q1",
        text: "Quelle phrase est correctement ecrite ?",
        options: [
          "le chat dort.",
          "Le chat dort.",
          "le Chat dort",
          "Le chat dort",
        ],
        correctIndex: 1,
        explanation: "Une phrase commence par une majuscule et finit par un point.",
      },
      {
        id: "q2",
        text: "Par quoi commence toujours une phrase ?",
        options: ["Un point", "Une minuscule", "Une majuscule", "Une virgule"],
        correctIndex: 2,
        explanation: "Toute phrase debute par une majuscule.",
      },
      {
        id: "q3",
        text: "Par quoi se termine une phrase affirmative ?",
        options: ["Une virgule", "Un point", "Un tiret", "Rien"],
        correctIndex: 1,
        explanation: "Une phrase affirmative se termine par un point.",
      },
    ],
  },

  // -- Sciences -----------------------------------------------

  "sci-1": {
    passingScore: 60,
    questions: [
      {
        id: "q1",
        text: "Quel organe utilise-t-on pour entendre ?",
        options: ["Les yeux", "Les oreilles", "Le nez", "La bouche"],
        correctIndex: 1,
        explanation: "Les oreilles sont les organes de l'ouie.",
      },
      {
        id: "q2",
        text: "Combien l'etre humain a-t-il de sens ?",
        options: ["3", "4", "5", "6"],
        correctIndex: 2,
        explanation: "Les 5 sens sont : la vue, l'ouie, l'odorat, le gout, le toucher.",
      },
      {
        id: "q3",
        text: "Quel sens utilise-t-on pour sentir une fleur ?",
        options: ["Le toucher", "L'ouie", "L'odorat", "La vue"],
        correctIndex: 2,
        explanation: "L'odorat (le nez) permet de sentir les odeurs.",
      },
      {
        id: "q4",
        text: "Quel organe est associe au sens du toucher ?",
        options: ["Le cerveau", "La langue", "La peau", "Les yeux"],
        correctIndex: 2,
        explanation: "La peau est l'organe du toucher.",
      },
    ],
  },


  // -- Français fr-3 à fr-8 ----------------------------------

  "fr-3": {
    passingScore: 60,
    questions: [
      { id:"q1", text:"Le nom 'Paris' est un nom :", options:["Commun","Propre","Verbe","Adjectif"], correctIndex:1, explanation:"Paris est un nom propre : il prend une majuscule." },
      { id:"q2", text:"Quel article accompagne 'chien' (masculin singulier) ?", options:["la","les","le","une"], correctIndex:2, explanation:"'le' est l'article défini masculin singulier." },
      { id:"q3", text:"Parmi ces mots, lequel est un nom commun ?", options:["Marie","Paris","maison","France"], correctIndex:2, explanation:"'maison' est un nom commun, les autres sont des noms propres." },
    ],
  },

  "fr-4": {
    passingScore: 60,
    questions: [
      { id:"q1", text:"Le verbe dans 'Le chat dort' est :", options:["chat","le","dort","aucun"], correctIndex:2, explanation:"'dort' exprime l'action : c'est le verbe." },
      { id:"q2", text:"Quelle est la forme infinitive de 'mangeons' ?", options:["manger","mangé","mange","mangeons"], correctIndex:0, explanation:"L'infinitif est la forme de base : manger." },
      { id:"q3", text:"Les verbes du 1er groupe se terminent par :", options:["-ir","-re","-er","-oir"], correctIndex:2, explanation:"Les verbes du 1er groupe se terminent par -er (manger, chanter...)." },
    ],
  },

  "fr-5": {
    passingScore: 60,
    questions: [
      { id:"q1", text:"Comment dit-on 'grand' au féminin ?", options:["grands","grande","grandi","grander"], correctIndex:1, explanation:"Au féminin, on ajoute -e : grand → grande." },
      { id:"q2", text:"L'adjectif qualificatif s'accorde avec :", options:["le verbe","le sujet","le nom","l'article"], correctIndex:2, explanation:"L'adjectif s'accorde en genre et en nombre avec le nom." },
      { id:"q3", text:"Quelle est la forme féminine plurielle de 'petit' ?", options:["petits","petites","petit","petite"], correctIndex:1, explanation:"Féminin pluriel : petite + s = petites." },
    ],
  },

  "fr-6": {
    passingScore: 60,
    questions: [
      { id:"q1", text:"Quel signe termine une question ?", options:[".",",","!","?"], correctIndex:3, explanation:"Le point d'interrogation ? termine une question." },
      { id:"q2", text:"La virgule sert à :", options:["Terminer la phrase","Marquer une petite pause","Poser une question","Exprimer une émotion"], correctIndex:1, explanation:"La virgule marque une petite pause dans la phrase." },
      { id:"q3", text:"'Quel beau chat !' est une phrase :", options:["Affirmative","Interrogative","Exclamative","Négative"], correctIndex:2, explanation:"Le point d'exclamation indique une phrase exclamative." },
    ],
  },

  "fr-7": {
    passingScore: 60,
    questions: [
      { id:"q1", text:"Quel est le pluriel de 'gâteau' ?", options:["gâteaus","gâteaux","gâteau","gâteauz"], correctIndex:1, explanation:"Les noms en -eau prennent -x au pluriel : gâteau → gâteaux." },
      { id:"q2", text:"Quel est le pluriel de 'cheval' ?", options:["chevals","chevaux","cheval","chevales"], correctIndex:1, explanation:"Les noms en -al prennent -aux au pluriel : cheval → chevaux." },
      { id:"q3", text:"Quel est le pluriel de 'bras' ?", options:["brass","brases","bras","brax"], correctIndex:2, explanation:"Les noms déjà en -s ne changent pas au pluriel : bras → bras." },
    ],
  },

  "fr-8": {
    passingScore: 60,
    questions: [
      { id:"q1", text:"Le passé composé de 'manger' est :", options:["je mangeais","j'ai mangé","je mange","je mangerai"], correctIndex:1, explanation:"Passé composé : auxiliaire avoir + participe passé = j'ai mangé." },
      { id:"q2", text:"L'imparfait exprime :", options:["Une action future","Une action présente","Une action passée qui durait","Une question"], correctIndex:2, explanation:"L'imparfait décrit une action passée qui durait ou se répétait." },
      { id:"q3", text:"Quel auxiliaire utilise-t-on avec 'aller' au passé composé ?", options:["avoir","être","faire","aller"], correctIndex:1, explanation:"'Aller' se conjugue avec l'auxiliaire être : je suis allé." },
    ],
  },

  // -- Fallback ----------------------------------------------

  "default": {
    passingScore: 60,
    questions: [
      {
        id: "q1",
        text: "Combien font 2 + 2 ?",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
        explanation: "2 + 2 = 4.",
      },
      {
        id: "q2",
        text: "Quelle est la capitale de la France ?",
        options: ["Lyon", "Marseille", "Paris", "Bordeaux"],
        correctIndex: 2,
        explanation: "Paris est la capitale de la France.",
      },
      {
        id: "q3",
        text: "Combien y a-t-il de jours dans une semaine ?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
        explanation: "Une semaine compte 7 jours.",
      },
    ],
  },
}

export function getQuiz(lessonId, subjectPrefix) {
  const key = subjectPrefix ? subjectPrefix + "-" + lessonId : String(lessonId)
  if (quizDatabase[key]) return quizDatabase[key]

  // Fallback intelligent : prendre le premier quiz de la même matière
  if (subjectPrefix) {
    const fallbackKey = Object.keys(quizDatabase).find(k => k.startsWith(subjectPrefix + "-"))
    if (fallbackKey) return quizDatabase[fallbackKey]
  }

  return quizDatabase["default"]
}

export function getSubjectQuizzes(subjectPrefix) {
  return Object.entries(quizDatabase)
    .filter(function(entry) { return entry[0].startsWith(subjectPrefix + "-") })
    .map(function(entry) { return Object.assign({ id: entry[0] }, entry[1]) })
}

export default quizDatabase
