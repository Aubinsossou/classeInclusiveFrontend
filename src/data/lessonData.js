// ============================================================
//  data/lessonData.js
//  Contenu des lecons par subjectId et lessonId
//  Usage : getLesson(subjectId, lessonId)
// ============================================================

const catalog = {

  // ── MATHEMATIQUES ─────────────────────────────────────
  '1': {
    '1': {
      title: 'Les nombres jusqu\'a 100',
      content: [
        { type:'heading',   text:'Compter jusqu\'a 100' },
        { type:'paragraph', text:'Les nombres de 1 a 100 sont organises en dizaines et en unites. Une dizaine vaut 10 unites.' },
        { type:'keypoint',  text:'Retenir : 10 unites = 1 dizaine. 10 dizaines = 100.' },
        { type:'heading',   text:'Les dizaines' },
        { type:'list',      items:['10 = une dizaine','20 = deux dizaines','30 = trois dizaines','50 = cinq dizaines','100 = dix dizaines'] },
        { type:'paragraph', text:'Entre chaque dizaine, on compte les unites : 21, 22, 23... jusqu\'a la dizaine suivante.' },
        { type:'keypoint',  text:'Astuce : pour trouver les dizaines d\'un nombre, on regarde le chiffre de gauche.' },
      ]
    },
    '2': {
      title: 'L\'addition et la soustraction',
      content: [
        { type:'heading',   text:'L\'addition' },
        { type:'paragraph', text:'L\'addition permet de reunir deux quantites. Le signe de l\'addition est +.' },
        { type:'keypoint',  text:'Exemple : 24 + 15 = 39. On additionne unites puis dizaines.' },
        { type:'heading',   text:'La soustraction' },
        { type:'paragraph', text:'La soustraction permet d\'enlever une quantite. Le signe est -.' },
        { type:'list',      items:['35 - 12 = 23','50 - 25 = 25','100 - 40 = 60'] },
        { type:'keypoint',  text:'Verifier : le resultat d\'une soustraction + ce qu\'on a enleve = le nombre de depart.' },
      ]
    },
    '3': {
      title: 'La multiplication',
      content: [
        { type:'heading',   text:'Qu\'est-ce que la multiplication ?' },
        { type:'paragraph', text:'La multiplication est une operation fondamentale permettant de calculer rapidement l\'addition repetee d\'un meme nombre.' },
        { type:'keypoint',  text:'Retenir : multiplier, c\'est additionner plusieurs fois le meme nombre.' },
        { type:'heading',   text:'Comment lire une multiplication ?' },
        { type:'paragraph', text:'Dans 3 x 4 = 12, on dit 3 fois 4 egale 12. Le signe x se lit fois.' },
        { type:'list',      items:['3 x 1 = 3','3 x 2 = 6','3 x 3 = 9','3 x 4 = 12','3 x 5 = 15'] },
        { type:'keypoint',  text:'Astuce : compter de 3 en 3 pour memoriser la table.' },
      ]
    },
    '4': {
      title: 'La division',
      content: [
        { type:'heading',   text:'Qu\'est-ce que la division ?' },
        { type:'paragraph', text:'La division permet de partager une quantite en parts egales. Le signe est :' },
        { type:'keypoint',  text:'Exemple : 12 : 3 = 4. On partage 12 en 3 groupes egaux de 4.' },
        { type:'heading',   text:'Division et multiplication' },
        { type:'paragraph', text:'Division et multiplication sont des operations inverses : 3 x 4 = 12, donc 12 : 3 = 4.' },
        { type:'list',      items:['20 : 4 = 5','15 : 3 = 5','100 : 10 = 10'] },
      ]
    },
    '5': {
      title: 'Les fractions simples',
      content: [
        { type:'heading',   text:'Qu\'est-ce qu\'une fraction ?' },
        { type:'paragraph', text:'Une fraction represente une partie d\'un tout. Elle s\'ecrit avec un numerateur (en haut) et un denominateur (en bas).' },
        { type:'keypoint',  text:'Exemple : 1/2 signifie une part sur deux parts egales, c\'est la moitie.' },
        { type:'list',      items:['1/2 = la moitie','1/4 = le quart','1/3 = le tiers','3/4 = trois quarts'] },
      ]
    },
  },

  // ── FRANCAIS ──────────────────────────────────────────
  '2': {
    '1': {
      title: 'Les voyelles et consonnes',
      content: [
        { type:'heading',   text:'L\'alphabet' },
        { type:'paragraph', text:'L\'alphabet francais contient 26 lettres. Ces lettres se divisent en deux groupes : les voyelles et les consonnes.' },
        { type:'keypoint',  text:'Les 6 voyelles sont : A, E, I, O, U, Y. Toutes les autres lettres sont des consonnes.' },
        { type:'heading',   text:'Pourquoi c\'est important ?' },
        { type:'paragraph', text:'Dans chaque syllabe, il y a au moins une voyelle. Les voyelles donnent du son aux mots.' },
        { type:'list',      items:['A comme Avion','E comme Ecole','I comme Ile','O comme Orange','U comme Usage','Y comme Yeux'] },
        { type:'keypoint',  text:'Astuce : pour trouver les voyelles, chante : A E I O U Y !' },
      ]
    },
    '2': {
      title: 'La phrase',
      content: [
        { type:'heading',   text:'Qu\'est-ce qu\'une phrase ?' },
        { type:'paragraph', text:'Une phrase est un groupe de mots qui a un sens complet. Elle exprime une idee ou une action.' },
        { type:'keypoint',  text:'Regles : une phrase commence par une MAJUSCULE et se termine par un point.' },
        { type:'heading',   text:'Les types de phrases' },
        { type:'list',      items:['Phrase affirmative : Le chat dort.','Phrase negative : Le chat ne dort pas.','Phrase interrogative : Le chat dort-il ?','Phrase exclamative : Quel beau chat !'] },
        { type:'keypoint',  text:'Toujours verifier : majuscule au debut, ponctuation a la fin.' },
      ]
    },
    '3': {
      title: 'Le nom et l\'article',
      content: [
        { type:'heading',   text:'Le nom' },
        { type:'paragraph', text:'Le nom designe une personne, un animal, une chose ou une idee. On distingue les noms communs et les noms propres.' },
        { type:'keypoint',  text:'Nom propre = prend toujours une majuscule. Ex : Marie, Paris, France.' },
        { type:'heading',   text:'L\'article' },
        { type:'paragraph', text:'L\'article accompagne le nom. Il indique le genre (masculin/feminin) et le nombre (singulier/pluriel).' },
        { type:'list',      items:['Articles definis : le, la, les','Articles indefinis : un, une, des','Ex : le chien, une maison, des fleurs'] },
      ]
    },
    '4': {
      title: 'Le verbe',
      content: [
        { type:'heading',   text:'Qu\'est-ce qu\'un verbe ?' },
        { type:'paragraph', text:'Le verbe exprime une action ou un etat. C\'est le mot le plus important de la phrase.' },
        { type:'keypoint',  text:'Pour trouver le verbe : demande "qu\'est-ce que fait le sujet ?"' },
        { type:'heading',   text:'L\'infinitif' },
        { type:'paragraph', text:'La forme de base du verbe s\'appelle l\'infinitif. Ex : manger, courir, etre, avoir.' },
        { type:'list',      items:['1er groupe : verbes en -er (manger, chanter)','2e groupe : verbes en -ir (finir, grandir)','3e groupe : verbes irreguliers (etre, avoir, faire)'] },
      ]
    },
    '5': {
      title: 'L\'adjectif',
      content: [
        { type:'heading',   text:'Le role de l\'adjectif' },
        { type:'paragraph', text:'L\'adjectif qualificatif decrit ou precise le nom. Il s\'accorde en genre et en nombre avec le nom qu\'il accompagne.' },
        { type:'keypoint',  text:'Regle : l\'adjectif s\'accorde avec le nom. Un grand garcon, une grande fille, de grands enfants.' },
        { type:'list',      items:['Masculin singulier : grand','Feminin singulier : grande','Masculin pluriel : grands','Feminin pluriel : grandes'] },
      ]
    },
    '6': {
      title: 'La ponctuation',
      content: [
        { type:'heading',   text:'Les signes de ponctuation' },
        { type:'paragraph', text:'La ponctuation permet de structurer le texte et d\'indiquer les pauses, les questions, les exclamations.' },
        { type:'list',      items:['Le point . : fin de phrase','La virgule , : petite pause','Le point d\'interrogation ? : question','Le point d\'exclamation ! : emotion','Les deux points : : annonce une liste ou une explication'] },
        { type:'keypoint',  text:'Sans ponctuation, un texte est difficile a lire et a comprendre.' },
      ]
    },
    '7': {
      title: 'Le pluriel',
      content: [
        { type:'heading',   text:'Former le pluriel' },
        { type:'paragraph', text:'En francais, on forme generalement le pluriel en ajoutant un -s a la fin du nom ou de l\'adjectif.' },
        { type:'keypoint',  text:'Regle generale : chat -> chats, maison -> maisons, grand -> grands.' },
        { type:'heading',   text:'Les exceptions' },
        { type:'list',      items:['Noms en -eau : gateau -> gateaux','Noms en -al : cheval -> chevaux','Noms en -s/-x/-z : ne changent pas : bras -> bras'] },
      ]
    },
    '8': {
      title: 'Les temps du passe',
      content: [
        { type:'heading',   text:'Le passe compose' },
        { type:'paragraph', text:'Le passe compose exprime une action terminee. Il se forme avec l\'auxiliaire avoir ou etre + le participe passe.' },
        { type:'keypoint',  text:'Exemple : j\'ai mange, je suis alle, nous avons joue.' },
        { type:'heading',   text:'L\'imparfait' },
        { type:'paragraph', text:'L\'imparfait exprime une action passee qui durait ou se repetait.' },
        { type:'list',      items:['Je mangeais tous les jours.','Il pleuvait souvent.','Nous jouions dans la cour.'] },
      ]
    },
  },

  // ── SCIENCES ──────────────────────────────────────────
  '3': {
    '1': {
      title: 'Les cinq sens',
      content: [
        { type:'heading',   text:'Nos cinq sens' },
        { type:'paragraph', text:'Les etres humains ont cinq sens qui leur permettent de percevoir le monde : la vue, l\'ouie, l\'odorat, le gout et le toucher.' },
        { type:'keypoint',  text:'Retenir : chaque sens a son organe. Vue = yeux, Ouie = oreilles, Odorat = nez, Gout = langue, Toucher = peau.' },
        { type:'heading',   text:'A quoi servent les sens ?' },
        { type:'paragraph', text:'Les sens nous permettent de nous adapter a notre environnement et de rester en securite.' },
        { type:'list',      items:['La vue : voir les objets, les couleurs, les distances','L\'ouie : entendre les sons et la parole','L\'odorat : sentir les odeurs','Le gout : distinguer le sale, le sucre, l\'acide, l\'amer','Le toucher : sentir le chaud, le froid, la douleur'] },
      ]
    },
    '2': {
      title: 'Le corps humain',
      content: [
        { type:'heading',   text:'Les grandes parties du corps' },
        { type:'paragraph', text:'Le corps humain est compose de plusieurs grandes parties : la tete, le tronc et les membres.' },
        { type:'list',      items:['La tete : cerveau, yeux, oreilles, nez, bouche','Le tronc : coeur, poumons, estomac, foie','Les membres : bras, mains, jambes, pieds'] },
        { type:'keypoint',  text:'Le cerveau est l\'organe le plus important : il controle tout le corps.' },
      ]
    },
    '3': {
      title: 'Les animaux',
      content: [
        { type:'heading',   text:'Classer les animaux' },
        { type:'paragraph', text:'Les animaux se classent en plusieurs groupes selon leurs caracteristiques : les mammiferes, les oiseaux, les poissons, les reptiles et les insectes.' },
        { type:'list',      items:['Mammiferes : chien, chat, baleine (allaitent leurs petits)','Oiseaux : aigle, pingouin, autruche (ont des plumes)','Poissons : carpe, requin, saumon (vivent dans l\'eau)','Reptiles : serpent, crocodile, tortue (sang froid)','Insectes : abeille, fourmi, papillon (6 pattes)'] },
        { type:'keypoint',  text:'Astuce : les mammiferes ont des poils, respirent de l\'air et allaitent leurs petits.' },
      ]
    },
  },

  // ── HISTOIRE ──────────────────────────────────────────
  '4': {
    '1': {
      title: 'La prehistoire',
      content: [
        { type:'heading',   text:'Quand commence la prehistoire ?' },
        { type:'paragraph', text:'La prehistoire commence avec l\'apparition des premiers hommes (il y a environ 3 millions d\'annees) et se termine avec l\'invention de l\'ecriture (vers 3 200 av. J.-C.).' },
        { type:'keypoint',  text:'La prehistoire represente 99% de l\'histoire humaine !' },
        { type:'list',      items:['Les premiers hommes : Homo habilis, Homo erectus','Homo sapiens apparait il y a 200 000 ans','Invention de l\'agriculture il y a 10 000 ans','Invention de l\'ecriture : fin de la prehistoire'] },
      ]
    },
    '2': {
      title: 'L\'Antiquite',
      content: [
        { type:'heading',   text:'Les grandes civilisations antiques' },
        { type:'paragraph', text:'L\'Antiquite va de l\'invention de l\'ecriture (-3200) jusqu\'a la chute de Rome (476 ap. J.-C.). C\'est l\'epoque des grandes civilisations.' },
        { type:'list',      items:['L\'Egypte antique : les pharaons, les pyramides','La Grece antique : democratie, philosophie, jeux olympiques','Rome antique : republique puis empire, routes, droit'] },
        { type:'keypoint',  text:'La Grece antique a invente la democratie, le mot qui signifie gouvernement du peuple.' },
      ]
    },
  },

  // ── GEOGRAPHIE ────────────────────────────────────────
  '5': {
    '1': {
      title: 'Les continents',
      content: [
        { type:'heading',   text:'Les 5 continents' },
        { type:'paragraph', text:'La Terre est divisee en 5 continents habites et 2 poles. Chaque continent regroupe plusieurs pays.' },
        { type:'list',      items:['Europe : France, Espagne, Allemagne...','Asie : Chine, Inde, Japon...','Afrique : Maroc, Senegal, Afrique du Sud...','Ameriques : USA, Bresil, Canada...','Oceanie : Australie, Nouvelle-Zelande...'] },
        { type:'keypoint',  text:'Moyen mnemotechnique : Europe, Asie, Afrique, Amerique, Oceanie = EA3O.' },
      ]
    },
    '2': {
      title: 'La France',
      content: [
        { type:'heading',   text:'La France en chiffres' },
        { type:'paragraph', text:'La France est un pays d\'Europe occidentale. C\'est le plus grand pays de l\'Union europeenne par sa superficie.' },
        { type:'keypoint',  text:'Capitale : Paris. Superficie : 643 000 km2. Population : 68 millions d\'habitants.' },
        { type:'list',      items:['13 regions metropolitaines','96 departements','Pays voisins : Espagne, Italie, Suisse, Allemagne, Belgique','Mers : Atlantique, Mediterranee, Manche'] },
      ]
    },
    '3': {
      title: 'Les pays voisins',
      content: [
        { type:'heading',   text:'Les voisins de la France' },
        { type:'paragraph', text:'La France partage ses frontieres avec 6 pays europeens. Connaitre ses voisins aide a comprendre l\'histoire et la geographie europeenne.' },
        { type:'list',      items:['Au nord : Belgique, Luxembourg','A l\'est : Allemagne, Suisse, Italie','Au sud : Espagne (et Andorre)','Iles proches : Royaume-Uni (de l\'autre cote de la Manche)'] },
      ]
    },
  },

  // ── ARTS ──────────────────────────────────────────────
  '6': {
    '1': {
      title: 'Les couleurs primaires',
      content: [
        { type:'heading',   text:'Qu\'est-ce qu\'une couleur primaire ?' },
        { type:'paragraph', text:'Les couleurs primaires sont les couleurs de base qui ne peuvent pas etre obtenues en melangeant d\'autres couleurs.' },
        { type:'keypoint',  text:'Les 3 couleurs primaires en peinture : Rouge, Jaune, Bleu.' },
        { type:'heading',   text:'Les couleurs secondaires' },
        { type:'paragraph', text:'En melangeant deux couleurs primaires, on obtient une couleur secondaire.' },
        { type:'list',      items:['Rouge + Jaune = Orange','Jaune + Bleu = Vert','Bleu + Rouge = Violet'] },
      ]
    },
    '2': {
      title: 'Les formes geometriques',
      content: [
        { type:'heading',   text:'Les formes de base' },
        { type:'paragraph', text:'En art comme en geometrie, on retrouve des formes fondamentales qui servent de base a toutes les creations visuelles.' },
        { type:'list',      items:['Le cercle : aucun angle, aucun cote','Le carre : 4 cotes egaux, 4 angles droits','Le rectangle : 4 angles droits, cotes opposes egaux','Le triangle : 3 cotes, 3 angles'] },
        { type:'keypoint',  text:'En art, on decompose souvent les objets en formes simples pour mieux les dessiner.' },
      ]
    },
    '3': {
      title: 'La perspective',
      content: [
        { type:'heading',   text:'Qu\'est-ce que la perspective ?' },
        { type:'paragraph', text:'La perspective est une technique qui permet de representer la profondeur sur une surface plate. Elle donne l\'illusion du relief et de la distance.' },
        { type:'keypoint',  text:'Principe : les objets paraissent plus petits quand ils sont loin, plus grands quand ils sont pres.' },
        { type:'list',      items:['Point de fuite : le point ou les lignes se rejoignent a l\'horizon','Ligne d\'horizon : la limite entre ciel et terre','Objets proches : grands et detailles','Objets lointains : petits et moins detailles'] },
      ]
    },
    '4': {
      title: 'Les grands peintres',
      content: [
        { type:'heading',   text:'Quelques artistes celebres' },
        { type:'paragraph', text:'L\'histoire de l\'art est riche de peintres et artistes qui ont transforme notre facon de voir le monde.' },
        { type:'list',      items:['Leonard de Vinci (1452-1519) : la Joconde','Michel-Ange (1475-1564) : plafond de la Chapelle Sixtine','Claude Monet (1840-1926) : les Nympheas','Pablo Picasso (1881-1973) : le cubisme'] },
        { type:'keypoint',  text:'Chaque epoque a son style : Renaissance, Impressionnisme, Cubisme, Art moderne...' },
      ]
    },
  },
}

// ── API publique ─────────────────────────────────────────

export function getLesson(subjectId, lessonId) {
  const sid = String(subjectId)
  const lid = String(lessonId)
  const subject = catalog[sid]
  if (!subject) return getDefaultLesson(sid, lid)
  return subject[lid] || getDefaultLesson(sid, lid)
}

function getDefaultLesson(sid, lid) {
  return {
    title: 'Cours ' + lid,
    content: [
      { type:'heading',   text:'Contenu en cours de preparation' },
      { type:'paragraph', text:'Ce cours sera bientot disponible. Revenez plus tard !' },
      { type:'keypoint',  text:'En attendant, vous pouvez explorer les autres cours disponibles.' },
    ]
  }
}

export default catalog
