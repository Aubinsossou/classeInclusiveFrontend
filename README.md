# Classe Inclusive — Frontend (document de référence pour l'équipe Back-End Laravel)

> Ce README est la **référence contractuelle côté front** : tout ce que l'interface attend de l'API Laravel.
> Basé uniquement sur le code de `src/` (routeur, stores, helpers, vues). Aucun endpoint ni champ n'est inventé : en cas de doute, la mention **« À confirmer »** est utilisée.
> Aucun secret réel n'est inclus : toutes les valeurs sont fictives.

- Dépôt front : `classeInclusiveFrontend` (branche observée : `landing-page`)
- Public cible : développeur back-end Laravel qui ne connaît pas le front.

---

## 1. Présentation du projet et stack technique

**Classe Inclusive** est une plateforme d'apprentissage adaptatif et inclusif. Le front est une SPA Vue qui consomme une API Laravel. Quatre espaces isolés par rôle : **école (admin établissement)**, **enseignant**, **élève** (dont parcours aveugle/malvoyant avec synthèse vocale), **client** (consultatif/analytique en lecture seule).

| Élément | Valeur observée dans le code |
|---|---|
| Framework | Vue `^3.5.28` (`src/main.js`, `package.json`) |
| Routeur | `vue-router` `^5.0.2` (`src/router/index.js`) |
| Store | `pinia` `^3.0.4` (`src/stores/auth.js`, `src/stores/theme.js`) |
| HTTP | `axios` `^1.13.6` (`src/services/axios.js`, `src/helpers/axiosApi.js`) |
| Éditeur de cours | `@tiptap/vue-3` + `starter-kit` + `text-align`, `underline`, `text-style` (`src/views/enseignant/EnseignantCours.vue`) ; `@vueup/vue-quill` en dépendance (`package.json`) |
| Visionneuse images | `v-viewer` (`src/main.js`) |
| Build / dev | `vite` (`vite.config.js` : alias `@` → `./src`), plugin `@vitejs/plugin-vue`, `vite-plugin-vue-devtools` |
| Tests | `vitest` + `@vue/test-utils` + `jsdom` (`npm run test:unit`) |
| Formatage | `prettier` (`npm run format`) |
| Node requis | `^20.19.0 || >=22.12.0` (`package.json#engines`) |
| Mock local (outil, pas un contrat) | `npm run mock:api` → `node tools/responsive/mock-server.mjs 4180` ; `npm run build:mock` (`vite build --mode mock`). Les fixtures de `tools/responsive/` servent aux mesures responsive, **ce ne sont pas un contrat API** (voir `tools/responsive/fixtures.mjs`). |

Routes front (rappel) : `/` (landing), `/ecole/*`, `/enseignant/*`, `/eleve/*` (+ `/eleve/blind/*`), `/client/*` (`src/router/index.js`).

## 2. Installation et lancement

### Prérequis

- Node.js `^20.19.0` ou `>=22.12.0`, npm.
- Un back-end Laravel joignable en HTTP (CORS à autoriser, voir §3).

### Commandes (conservées de l'ancien README, toujours exactes)

```sh
npm install
npm run dev      # dev + hot-reload (Vite)
npm run build    # build production
npm run preview  # prévisualiser le build
npm run test:unit
npm run format
npm run mock:api   # sert dist/ + simule /api/v1/* (outil de mesure uniquement)
npm run build:mock # build avec VITE_API_URL pointant vers le mock
```

### Variables d'environnement attendues

| Variable | Usage dans le code | Exemple fictif (ne pas utiliser de secret réel) |
|---|---|---|
| `VITE_API_URL` | Base serveur **sans** `/api/v1`. `src/services/axios.js` fait `VITE_API_URL + '/api/v1'`. `src/helpers/mediaUrl.js` en dérive l'URL des médias. | `VITE_API_URL=http://localhost:8000` |
| `BASE_URL` (Vite, implicite) | `createWebHistory(import.meta.env.BASE_URL)` (`src/router/index.js`) | valeur par défaut `/` |

Exemple de fichier `.env` (fictif) :

```env
VITE_API_URL=http://localhost:8000
```

> Aucun fichier `.env` réel n'est versionné. Ne jamais commiter de token, clé ou mot de passe.

## 3. Configuration de l'API

### 3.1 URL de base

```
{ VITE_API_URL }/api/v1/{chemin}
```

Exemple fictif : `http://localhost:8000/api/v1/ecole/login`. Le code appelle `apiGet/apiPost/apiPut/apiDelete('ecole/login', …)` et axios préfixe avec `VITE_API_URL + '/api/v1'` (`src/services/axios.js`, `src/helpers/axiosApi.js`).

Médias : si l'API renvoie un chemin relatif (`/storage/…`) ou relatif sans slash, le front préfixe avec `VITE_API_URL` nettoyé (`src/helpers/mediaUrl.js#getMediaUrl`). Si l'API renvoie déjà `http(s)://…`, elle est utilisée telle quelle.

### 3.2 En-têtes envoyés

| En-tête | Valeur | Source |
|---|---|---|
| `Accept` | `application/json` | `src/services/axios.js` |
| `Content-Type` | `application/json` en JSON ; **omis** (multipart auto) quand `FormData` | `src/helpers/axiosApi.js#apiPost` (`transformRequest` identité pour `FormData`) |
| `Authorization` | `Bearer <access_token>` sur les routes protégées | `src/helpers/axiosApi.js`, `src/stores/auth.js` |

Aucun cookie, aucun CSRF, aucun `X-Requested-With` n'est envoyé par le front (le mock les autorise en CORS mais le front ne les émet pas).

### 3.3 Authentification, tokens, refresh, déconnexion

- Schéma : **Bearer token opaque**, stocké en clair dans `localStorage` sous `access_token` (+ `role`, + `eleve` pour l'élève). Clés historiques élève `edu_token` / `edu_user` encore lues en repli (`src/helpers/session.js`, `src/stores/auth.js`, `src/main.js`).
- Rôles stockés : `'ecole' | 'enseignant' | 'eleve' | 'client'` (`src/helpers/session.js#ALLOWED_ROLES`, `src/router/index.js`). Le login école/enseignant lit aussi `data.data.roles[0].name` (voir §4).
- **Pas de refresh token dans le code.** Aucun appel `/refresh`, aucun renouvellement silencieux trouvé.
- **Pas de durée de vie connue côté front** : À confirmer (le front suppose le token valide jusqu'à 401).
- Sur **401 global** : intercepteur axios (`src/services/axios.js`) → supprime `access_token` + `role`, redirige vers le login de l'espace courant (`/ecole/login`, `/enseignant/login`, `/eleve/login`, `/client/login`), sauf si déjà sur une page d'auth. Les composables (`useClientList`, `useClientStats`) et plusieurs vues refont le même nettoyage + redirection.
- Déconnexion : appel API (voir §4 : `DELETE ecole/logout`, `DELETE enseignant/logout`, `POST eleve/logout`, `DELETE client/logout`), **puis** suppression locale systématique même en cas d'échec réseau (`finally`), puis redirection vers le login de l'espace.


## 4. Liste COMPLÈTE des endpoints appelés par le front

Conventions : `URL` = chemin **après** `/api/v1/`. Le front lit la plupart des réponses via `response.data?.data ?? response.data` (double forme acceptée). Champs marqués **« À confirmer »** quand le code ne les prouve pas.

### 4.1 Auth — école / enseignant / élève / client

| # | Méthode | URL | Auth | Corps (types, obligatoire ?) | Réponse attendue | Erreurs gérées | Fichier(s) |
|---|---|---|---|---|---|---|---|
| A1 | POST | `ecole/register` | non | `{ name: string (oblig.), email: string (oblig.), numero: string (oblig.), password: string (oblig., min 6 front) }` | Succès → redirection `ecoleLogin`. Structure À confirmer | `422` → `errors` (1re erreur) ; `message` sinon | `src/views/admin/EcoleRegister.vue` |
| A2 | POST | `ecole/login` | non | `{ email: string, password: string }` | `{ status: 'success', access_token: string, data: { roles: [{ name }] } }`, redirection `/ecole/dashboard` | Messages exacts : `'Aucune ecole trouver avec ce mail'` ; `'Email ou mot de passe incorrect'` | `src/views/admin/EcoleLogin.vue` |
| A3 | DELETE | `ecole/logout` | oui | — | Ignorée. Nettoyage + `/ecole/login` même en échec | À confirmer | `src/components/admin/header.vue` |
| A4 | POST | `/enseignant/login` | non | `{ email: string, password: string }` | Même forme que A2, redirection `/enseignant/dashboard` | `'Une erreur est survenu veillez reessayer'` ; détail À confirmer | `src/views/enseignant/EnseignantLogin.vue` |
| A5 | DELETE | `enseignant/logout` | oui | — | Ignorée + nettoyage + `/enseignant/login` | À confirmer | `src/components/admin/HeaderEnseignant.vue` |
| A6 | POST | `eleve/login` | non | `{ code: string (min 4 front) }` | Token : `data?.token \| data?.access_token` (store : `res.data.{ data, access_token }`). Forme À confirmer | `400/401` → « Code incorrect. » ; `message` sinon | `src/views/eleve/LoginView.vue`, `src/stores/auth.js` |
| A7 | POST | `eleve/logout` | oui (toléré sans) | — | Ignorée. Nettoyage `access_token`+`role`+`eleve` même en échec | Aucune (catch vide) | vues `eleve/*`, `blind/*`, `AppTopbar.vue`, `BlindTopbar.vue` |
| A8 | GET | `eleve/connexion` | oui (?) | — | **Usage flou** : sans `await`, valeur jamais exploitée. À confirmer | À confirmer | `src/views/eleve/LoginView.vue`, `AppTopbar.vue` |
| A9 | POST | `client/login` | non | `{ email: string, password: string }` | Token lu large : `access_token \| token \| data.access_token \| data.data.access_token`. `role='client'` forcé | `400 + message` tel quel ; `401` → « E-mail ou mot de passe incorrect. » ; `errors` → 1re erreur | `src/views/client/ClientLogin.vue` |
| A10 | POST | `client/register` | non | `{ name, email (oblig.), numero: string\|null (optionnel), password (min 4 front) }` | Message `ok`, puis `ClientLogin`. Structure À confirmer | `errors` par champ + 1re erreur | `src/views/client/ClientRegister.vue` |
| A11 | DELETE | `client/logout` | oui | — | Ignorée. Nettoyage en `finally` | Aucune | `src/components/client/HeaderClient.vue` |
| A12 | POST | `enseignant/change-password` | oui | `{ current_password*, password* (min 8, différent), password_confirmation* }` | `{ status: 'success', message? }` → reset ; sinon `serverError` | `401` → purge + login ; `message` + `errors` | `src/views/enseignant/EnseignantProfil.vue` |
| A13 | POST | `/api/synthesize` (**hors `/api/v1`**, `fetch` natif) | À confirmer (aucune auth envoyée) | `{ text: string }` JSON | `Blob` audio joué. Échec → fallback voix navigateur | Fallback silencieux | `src/composables/useVoiceEngine.js` |
### 4.2 Profil / contexte connecté

| # | Méthode | URL | Auth | Réponse attendue | Fichier(s) |
|---|---|---|---|---|---|
| B1 | GET | `ecole/getEcole` | oui | Objet école + relations (`id`, `name`, `classes?`, `matieres?`). Fournit `ecole_id`, nom affiché. Détail §5 | `src/components/admin/header.vue`, `src/views/admin/*` |
| B2 | GET | `/enseignant/getEnseignant` ou `enseignant/getEnseignant` (2 formes) | oui | `{ data: { id, name, prenom, matricule?, email?, ecole_id?, classe_id?, classe?: { id, name, matieres?, eleves?, cours? }, matiere? } }`. **Pivot espace enseignant** | `HeaderEnseignant.vue`, `src/views/enseignant/*` |
| B3 | GET | `eleve/getEleve` | oui | Élève + graphe : `{ data: { id, name, prenom, code, classe_id, ecole_id, handicap: { id, name }, classe: { enseignant: { cours: […] } } } }`, cache `localStorage.eleve`. **Seule source cours/quiz côté élève** | `src/stores/auth.js`, `src/components/eleve/*`, `src/views/eleve/*`, `blind/*` |
| B4 | GET | `client/getClient` | oui | `{ data: { id, name, email, numero?, roles? } }`, filtré `stripSensitive` | `HeaderClient.vue`, `ClientProfil.vue` |

### 4.3 Espace école — classes / matières / enseignants / élèves / handicaps

| # | Méthode | URL | Auth | Corps | Réponse attendue | Fichier(s) |
|---|---|---|---|---|---|---|
| C1 | GET | `ecole/classe/index/{ecole_id}` | oui | — | Liste (`id`, `name`, `ecole_id`, `ecole?`, `eleves?`, `enseignants?`, `matieres?`). `adminClasse.vue` lit en fait le cache `getEcole` | `adminDashboard.vue`, `adminEnseignant.vue` |
| C2 | POST | `/ecole/classe/store` | oui | `{ name: string (oblig.), ecole_id: number }` | À confirmer | `adminClasse.vue` |
| C3 | GET | `ecole/classe/edit/{id}` | oui | — | `{ data: { name } }` | `adminClasse.vue` |
| C4 | PUT | `ecole/classe/update/{id}` | oui | `{ name, ecole_id: number }` | À confirmer | `adminClasse.vue` |
| C5 | DELETE | `ecole/classe/destroy/{id}` | oui | — | À confirmer | `adminClasse.vue` |
| C6 | POST | `/ecole/classe/assigneMatiere/store` | oui | `{ classe_id: number, matiere_id: number[] (multi), ecole_id: number }` | À confirmer | `adminClasse.vue` |
| C7 | GET | `ecole/matiere/index/{ecole_id}` | oui | — | Liste (`id`, `name`) | `adminDashboard.vue`, `adminMatiere.vue` |
| C8 | POST | `ecole/matiere/store` | oui | `{ name: string, ecole_id: number }` | À confirmer | `adminMatiere.vue` |
| C9 | POST | `ecole/matiere/update/{id}` (POST, pas PUT) | oui | `{ name, ecole_id: number }` | À confirmer | `adminMatiere.vue` |
| C10 | DELETE | `ecole/matiere/destroy/{id}` | oui | — | À confirmer | `adminMatiere.vue` |
| C11 | GET | `/ecole/enseignant/index/{ecole_id}` | oui | — | Liste (`id`, `name`, `prenom`, `email`, `matricule`, `numero`, `classe?`) | `adminDashboard.vue`, `adminEnseignant.vue` |
| C12 | POST | `/ecole/enseignant/registerEnseignant` | oui | `{ name, prenom, email, numero, matricule: string, ecole_id: number }` | À confirmer | `adminEnseignant.vue` |
| C13 | GET | `/ecole/enseignant/edit/{id}` | oui | — | Détail. Forme À confirmer | `adminEnseignant.vue` |
| C14 | PUT | `/ecole/enseignant/update/{id}` | oui | `{ name, email, matricule, prenom, numero, ecole_id }` | À confirmer | `adminEnseignant.vue` |
| C15 | PUT | `/ecole/enseignant/update/assigne/classe/{enseignant_id}` | oui | `{ classe_id: number\|null }` | À confirmer | `adminEnseignant.vue` |
| C16 | DELETE | `/ecole/enseignant/destroy/{id}` | oui | — | À confirmer | `adminEnseignant.vue` |
| C17 | GET | `ecole/eleve/index` | oui | — | `{ data: […] }` (`id`, `name`, `prenom`, `dateOfNaissance`, `numeroParent`, `classe_id`, `handicap_id`, `handicap?`, `code`) | `adminDashboard.vue`, `adminEleve.vue` |
| C18 | POST | `ecole/eleve/registerEleve` | oui | `{ name, prenom, dateOfNaissance, numeroParent, classe_id, handicap_id, ecole_id, code }` | À confirmer | `adminEleve.vue` |
| C19 | POST | `ecole/eleve/update/{id}` (POST) | oui | Idem C18 **sans `code`** | À confirmer | `adminEleve.vue` |
| C20 | DELETE | `ecole/eleve/destroy/{id}` | oui | — | À confirmer | `adminEleve.vue` |
| C21 | GET | `ecole/handicap/index` | oui | — | `{ id: number, name: string }` (lu `data` ou `data.data` selon vue) | `admin/*`, `Student.vue` |
### 4.4 Espace enseignant — cours, médias, élèves, quiz

> Quiz lus **imbriqués dans `getEnseignant`** (`classe.matieres[].cours[].quizzes[].questions[].reponses[]`). Aucun `GET quiz/*`. Eager-loading requis côté back.

| # | Méthode | URL | Auth | Corps | Réponse attendue | Fichier(s) |
|---|---|---|---|---|---|---|
| D1 | GET | `enseignant/cours/index` | oui | — | `{ data: [...] }` ou `[...]` (double lecture). Voir §5 | `EnseignantPreviewCours.vue` |
| D2 | GET | `enseignant/cours/show/{id}` | oui | — | `{ data: { title, description, contenu (HTML), resume, matiere_id, classe_id, is_published, date_programmation, medias, materiel, strategie } }` | `EnseignantCours.vue` |
| D3 | POST | `enseignant/cours/store` (JSON ou multipart, voir §8) | oui | `{ title*, description, contenu (HTML), resume, matiere_id*, classe_id*, is_published: 0\|1, date_programmation: 'YYYY-MM-DD HH:mm:ss'\|null, listMateriels: [{name}], listStrategies: [{name}] }` | À confirmer | `EnseignantCours.vue` |
| D4 | POST | `enseignant/cours/update/{id}` (POST, pas PUT) | oui | Idem D3 (JSON ou FormData) | À confirmer | `EnseignantCours.vue` |
| D5 | DELETE | `enseignant/cours/destroy/{id}` | oui | — | À confirmer (retrait local) | `EnseignantPreviewCours.vue` |
| D6 | DELETE | `/enseignant/cours/media/{media_id}` | oui | — | À confirmer (retrait local) | `EnseignantCours.vue` |
| D7 | POST | `enseignant/cours/authorise_quiz` | oui | `{ enseignant_id: number, cours_id: number }` (toggle, sans booléen) | À confirmer (front inverse localement) | `EnseignantPreviewCours.vue` |
| D8 | POST | `enseignant/classe/eleve/store` | oui | `{ name*, prenom*, numeroParent, handicap_id: number\|'', dateOfNaissance, code* }` — **sans `classe_id`** | `{ message?, data? }` | `AddEleveForm.vue`, `Student.vue` |
## 5. Modèles de données tels que le front les manipule

> Champs déduits des lectures/écritures réelles. Tout champ non vu est marqué À confirmer. Exemples fictifs.

### 5.1 Utilisateur / rôles

```json
{
  "id": 1,
  "name": "Exemple",
  "prenom": "Fictif",
  "email": "utilisateur@exemple.com",
  "numero": "0700000000",
  "matricule": "ENS-2026-0001",
  "ecole_id": 1,
  "classe_id": 1,
  "roles": [{ "name": "ecole" }]
}
```

| Champ | Type | Vu où |
|---|---|---|
| `id` | number | partout |
| `name` / `prenom` | string | formulaires école/enseignant/élève/client |
| `email` / `password` | string | logins + registers |
| `numero` / `numeroParent` | string | école (`numero`), élève (`numeroParent`) |
| `matricule` | string | enseignant |
| `code` | string | code connexion élève (login, CRUD) |
| `ecole_id` / `classe_id` / `handicap_id` | number | rattachements |
| `roles[].name` | string (`ecole`…) | login école/enseignant (`roles[0].name`) |
| `is_connect` | boolean\|string (`true`/`"true"`) | pastille « en ligne » (`Student.vue#isOnline`) |

### 5.2 École / classe / matière / handicap

```json
{
  "id": 1, "name": "École Exemple", "email": "ecole@exemple.com", "numero": "0700000000",
  "classes": [{ "id": 1, "name": "6e A", "ecole_id": 1 }],
### 5.4 Cours / média / matériel / stratégie

```json
{
  "id": 10,
  "title": "Les fractions (exemple fictif)",
  "description": "Résumé court",
  "contenu": "<p>HTML édité (Tiptap)</p>",
  "resume": "Résumé pour révision",
  "matiere_id": 1,
  "matiere": { "id": 1, "name": "Mathématiques" },
  "classe_id": 2,
  "enseignant_id": 5,
  "is_published": true,
  "quiz_authorise": false,
  "date_programmation": "2026-10-20 08:00:00",
  "medias": [{ "id": 3, "type": "image", "url": "/storage/cours/exemple.jpg", "ordre": 0, "name": "exemple.jpg" }],
  "materiel": [{ "name": "Ardoise" }],
  "strategie": [{ "name": "Lecture à voix haute" }]
}
```

Média : `{ id?, type: 'image'|'video'|'audio', url: string (relative ou absolue), ordre?: number, name? }`. Types acceptés côté front : `video/*`, `image/*`, `audio/*` (§8). `materiel`/`strategie` acceptés en objets `{name}` (le front convertit les strings).

### 5.5 Quiz / question / réponse / note

```json
{
  "id": 7, "name": "Quiz exemple", "cours_id": 10,
  "questions": [
    { "id": 11, "question": "2 + 2 = ?",
      "reponses": [
        { "id": 21, "name": "4", "status": "correct" },
        { "id": 22, "name": "3", "status": "incorrect" }
      ] }
## 6. Gestion des erreurs

Format Laravel supposé (observé dans le code) :

```json
{ "message": "Motif (exemple fictif)", "errors": { "email": ["Texte (exemple fictif)"] } }
```

| Code | Sens front | Affichage |
|---|---|---|
| `422` | validation | 1re erreur de `errors` ; sinon `message` |
| `401` | session expirée | purge `access_token`+`role` (+`eleve`) puis login de l'espace (intercepteur global + vues) |
| `403` | permission | « Permission insuffisante pour consulter ces données. » (client) |
| `404` | introuvable | À confirmer (aucun traitement dédié ; générique) |
| `409` | conflit code élève | « Ce code est déjà utilisé par un autre élève. » (champ `code`) |
| `500+` | serveur | « Erreur serveur. Veuillez réessayer plus tard. » + bouton « Réessayer » (client) |
| réseau | injoignable | « Problème réseau : impossible de contacter le serveur. » |

Validation locale pré-API : `required` (bordure + `aria-invalid` + toast, `useFormValidation.js`) ; école min 6, client min 4, enseignant min 8 + différent + confirmation ; code élève min 4.

## 7. Rôles et permissions (côté interface)

Le front n'est **pas** une barrière de sécurité (`src/helpers/session.js` : backend doit revérifier auth + rôle + ownership). Gardes : `requiresEcoleAuth`+`ecole`, `requiresEnseignantAuth`+`enseignant`, `requiresEleveAuth`+`eleve`, `requiresClientAuth`+`client`.
## 8. Upload de fichiers / images

- Seul upload : **médias de cours** (`EnseignantCours.vue`). Si fichiers → `FormData`, sinon JSON. `Content-Type` laissé au navigateur.
- Champs `FormData` : `title`, `description`, `contenu` (HTML), `resume`, `matiere_id`, `classe_id`, `is_published` (`1`/`0`), `date_programmation` (`'YYYY-MM-DD HH:mm:ss'` ou `''`), `listMateriels[i][name]`, `listStrategies[i][name]`, et par fichier : `medias_files[i]` (binaire), `medias_types[i]` (`image`|`video`|`audio`), `medias_ordres[i]` (entier).
- Limites front : **100 Mo / fichier**, vide refusé. Types : `video/*`, `image/*`, `audio/*`.
- Réponse `store`/`update` : À confirmer. Suppression : `DELETE /enseignant/cours/media/{media_id}` (D6).
- Lecture : `m.url` absolue ou relative (`/storage/…` OK, préfixée avec `VITE_API_URL`).

## 9. Points d'accessibilité (dépendent de l'API)

- **Texte toujours disponible** : `contenu` (HTML) + `resume` + `description` — la voix lit le HTML nettoyé. Jamais de cours « image-only » sans texte.
- **Transcription** : À confirmer — mock prévoit `transcript`, aucune vue ne le lit ; prévoir `transcript` pour audio/vidéo serait un plus.
- **Alt médias** : aucun champ `alt`/`legende` lu (nom de fichier affiché). À ajouter côté back si possible.
- **`handicap.{id,name}` stable** : pilote tout l'adaptatif (blind si `id===2`, vocal, contraste, simplifié). Ne pas renommer sans prévenir.
- **Quiz vocalisables** : `question` + `reponses[].name` en texte brut ; `status` requis ; `explication?` lue si présente.
- **Dates** : `date_programmation` (`YYYY-MM-DD HH:mm:ss`) pilote « cours du jour ».

## 10. Écarts et problèmes — à confirmer avec le back-end

1. Enveloppe : `status`+`access_token`+`roles[]` vs token large vs `{data}` vs `{success,data}` — unifier par endpoint.
2. `GET eleve/connexion` (A8) : rôle réel ? À supprimer ou documenter.
3. Verbes : `POST` pour updates (C9/C19/D4/D16) vs `PUT` (C4/C14) ; `POST eleve/logout` vs `DELETE` ailleurs — uniformiser.
4. Slash initial incohérent (`/enseignant/login`, `/ecole/enseignant/*`, `/eleve/note/store`…) — accepter les deux.
5. `GET ecole/classe/edit/{id}` vs REST ; update élève école sans `code` (C19) vs enseignant avec `code` optionnel (D9) — confirmer.
6. `authorise_quiz` (D7) : toggle sans booléen — idempotence et réponse à confirmer.
7. E2 réassigne `eleve` avec la réponse du bilan — confirmer qu'elle renvoie un élève complet.
8. `retour-projection/index/{id}` (D18) sans préfixe + forme polymorphe — contrat exact à confirmer.
9. Stats F3/F4/F5 : aucune vue — garder ? `per_page=200` (F18) : tout renvoyer ? `repartition_sexe/niveau` retirés de l'UI le 24/09/2026 — ne pas en dépendre.
10. `POST /api/synthesize` (A13, hors `/api/v1`, sans auth) : réel ou stub ? À confirmer.
11. Orthographe : `medias_files/types/ordres`, `listMateriels[i][name]`, `materiel`/`strategie` (singulier !), `contenu` vs `content` — confirmer.
12. Types : `is_connect` (`true`/`"true"`), `is_published`/`quiz_authorise` (`0/1`/bool), dates (SQL vs ISO) — normaliser.
13. Refresh/TTL/révocation : aucun dans le front — À confirmer.
14. Ancien README : seules `npm install/dev/build/preview/test:unit` conservées ; le reste (template Vite) était obsolète.


| Rôle | Voit / peut faire (UI) |
|---|---|
| `ecole` | Dashboard, CRUD classes/matières/enseignants/élèves, assignations matières↔classes et classes↔enseignants |
| `enseignant` | Dashboard, CRUD cours (+médias, publication, autorisation quiz), CRUD élèves **de sa classe** (sans `classe_id`), CRUD quiz/questions/réponses, bilan, profil + mot de passe. Sans `classe_id` : gestion élèves bloquée |
| `eleve` | Matières du jour (`date_programmation == today`), cours, leçon, quiz (si `quiz_authorise`), résultat, bilan. `handicap.id === 2` → parcours `/eleve/blind/*` (vocal). Adaptations 3/4/5/6/7/8/9 |
| `client` | **Lecture seule** : dashboard, 8 listes, détail établissement, profil. Corrections quiz jamais affichées |

  ]
}
```

Question lue : `question` (ou `text`), `quiz_id`, `explication?`. Réponse : `name` (ou `reponse`/`text`), `status: 'correct'|'incorrect'` (ou `is_correct`/`correct`). Note élève (E1) : `{ note: number, eleve_id, quiz_id }`. Bilan (E2/D18) : `{ apprentissage, methode_apprentissage, difficultes, application_future, eleve_id, cours_id, feedback?, score?, pourcentage? }` — forme exacte À confirmer.

  "matieres": [{ "id": 1, "name": "Mathématiques" }]
}
```

Classe lue : `{ id, name, ecole_id, ecole?, eleves?, enseignants?, matieres? }`. Matière : `{ id, name }`. Handicap : `{ id, name }` — IDs utilisés côté élève : `2=aveugle→parcours blind, 3=sourd, 4=malvoyant, 5=autisme, 6=trisomie, 7=TDAH, 8=IMC, 9=DI` (`DashboardView.vue`, `LessonView.vue`, `QuizView.vue`). Correspondance exacte back ↔ front **À confirmer**.

### 5.3 Élève (profil `getEleve`)

Le front exploite le graphe imbriqué : `eleve.classe.enseignant.cours[].matiere`, `cours[].medias[]`, `cours[].quizzes[].questions[].reponses[]`, `cours[].quiz_authorise`, `cours[].date_programmation`, `eleve.handicap.{id,name}`.
| D9 | POST | `enseignant/classe/eleve/update/{id}` (POST) | oui | Idem D8, `code` optionnel | `{ message?, data? }` ; `409` → code déjà utilisé | `AddEleveForm.vue`, `Student.vue` |
| D10 | DELETE | `enseignant/classe/eleve/destroy/{id}` | oui | — | `{ message? }` | `Student.vue` |
| D11 | POST | `quiz/store` | oui | `{ name*, cours_id*, enseignant_id }` | À confirmer | `EnseignantQuizz.vue` |
| D12 | DELETE | `quiz/destroy/{id}` | oui | — | À confirmer | `EnseignantQuizz.vue` |
| D13 | POST | `question/store` | oui | `{ question*, quiz_id* }` | À confirmer | `EnseignantQuizz.vue` |
| D14 | DELETE | `question/destroy/{id}` | oui | — | À confirmer | `EnseignantQuizz.vue` |
| D15 | POST | `reponse/store` | oui | `{ question_id*, listReponse: [{ name*, status: 'correct'\|'incorrect' }] }` | À confirmer | `EnseignantQuizz.vue` |
| D16 | POST | `reponse/update/{id}` (POST) | oui | `{ question_id, listReponse: [{ name, status }] }` | À confirmer | `EnseignantQuizz.vue` |
| D17 | DELETE | `reponse/destroy/{id}` | oui | — | À confirmer | `EnseignantQuizz.vue` |
| D18 | GET | `retour-projection/index/{enseignant_id}` (sans préfixe) | oui | — | Tableau, `{ cours: [...] }` ou objet (normalisé). Cours + `retours_projections`. Voir §5 | `EleveBilan.vue` |
### 4.5 Espace élève — notes et bilans

| # | Méthode | URL | Auth | Corps | Réponse attendue | Fichier(s) |
|---|---|---|---|---|---|---|
| E1 | POST | `/eleve/note/store` | oui | `{ note: number (score), eleve_id: number, quiz_id: number }` — fire-and-forget, score passé en query | Ignorée. Persistance À confirmer | `src/views/eleve/QuizView.vue` |
| E2 | POST | `eleve/retour-projection/store` | oui | `{ apprentissage*, methode_apprentissage, difficultes, application_future, eleve_id, cours_id }` | `data?.data \| data` réassigné à `eleve` (!!). Forme À confirmer | `src/views/eleve/LessonView.vue` |

### 4.6 Espace client — lecture seule + statistiques

`useClientList` accepte `data`, `data.data`, `data.items` ou objet unique. `useClientStats` exige `res.data.data` **objet non-tableau**. Tri/recherche/pagination côté front.

| # | Méthode | URL | Champs lus | Fichier(s) |
|---|---|---|---|---|
| F1 | GET | `client/statistics/overview` | Compteurs `total_etablissements, total_classes, total_eleves, total_enseignants, total_matieres, total_cours, total_quiz, total_handicaps` ; `repartition_par_classe[]` ; `repartition_par_etablissement[]` ; `repartition_par_handicap[]` (`id, name, total_eleves, pourcentage`) ; `cours: { total, publies, publies_pourcentage, quiz_authorise(+_pourcentage), avec_medias(+_pourcentage) }`. Exemple réel : `ClientDashboard.spec.js` | `ClientDashboard.vue` |
| F2 | GET | `client/statistics/etablissements/{id}` | `etablissement: { nom?, numero?, email? }`, compteurs échelle établissement, `enseignants: { avec_classe(+_pct), sans_classe(+_pct) }`, `cours: {...}`, `quiz: { moyenne_questions_par_quiz, total_notes }` | `ClientEtablissement.vue` |
| F3 | GET | `client/statistics/etablissements` | À confirmer (aucune vue) | — |
| F4 | GET | `client/statistics/classes` | À confirmer (aucune vue) | — |
| F5 | GET | `client/statistics/eleves` | À confirmer (aucune vue) | — |
| F6 | GET | `client/statistics/enseignants` | `total_enseignants, avec_classe(+_pct), sans_classe(+_pct), cours_moyen_par_enseignant, quiz_moyen_par_enseignant` | `ClientEnseignants.vue` |
| F7 | GET | `client/statistics/matieres` | `total_matieres, total_cours` | `ClientMatieres.vue` |
| F8 | GET | `client/statistics/cours` | `total_cours, publies(+_pct), non_publies, quiz_authorise(+_pct)` | `ClientCours.vue` |
| F9 | GET | `client/statistics/quiz` | `total_quiz, total_questions, total_reponses, moyenne_questions_par_quiz` | `ClientQuizzes.vue` |
| F10 | GET | `client/statistics/handicaps` | `total_types_handicap, total_eleves` | `ClientHandicaps.vue` |
| F11 | GET | `client/ecoles` | `{ id, name, numero, email }` | `ClientEcoles.vue` |
| F12 | GET | `client/classes` | `{ name, ecole.name, eleves[] (compté), enseignant.name, matieres[] (compté) }` | `ClientClasses.vue` |
| F13 | GET | `client/matieres` | `{ name, ecole.name, cours[] (compté) }` | `ClientMatieres.vue` |
| F14 | GET | `client/enseignants` | `{ name, prenom, matricule, email, classe.name }` | `ClientEnseignants.vue` |
| F15 | GET | `client/cours` | `{ title, matiere.name, classe.name, enseignant.name, is_published (Oui/Non), medias[] (compté) }`. Corrections jamais affichées | `ClientCours.vue` |
| F16 | GET | `client/quizzes` | `{ name, cours.title, questions[] (compté) }` | `ClientQuizzes.vue` |
| F17 | GET | `client/handicaps` | `{ id, name }` | `ClientHandicaps.vue` |
| F18 | GET | `client/eleves?ecole_id={id}&per_page=200` | `{ name, prenom, classe.name, classe.ecole.name, handicap.name }`. `per_page=200` : tout renvoyer ? À confirmer | `ClientEleves.vue` |


