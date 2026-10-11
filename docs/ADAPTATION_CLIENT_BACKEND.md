# Adaptation des interfaces Client au backend

> ⚠️ **DOCUMENT OBSOLETE** (constaté le 24/09/2026, confirmé par l'agent Backend dans `docs/AI_COORDINATION.md`) : ce document décrit l'ancien périmètre (« 8 GET », « pas de données élèves »). Le frontend utilise désormais `GET /v1/client/eleves` et les 9 endpoints `statistics/*`. **Source de vérité : `docs/API_CONTRACT.md` + `docs/FRONTEND_REQUIREMENTS.md` à la racine du workspace.** Conservé pour historique uniquement.

Source de vérité : contrat transmis le 24/09/2026 (`POST /v1/client/register|login`, `DELETE /v1/client/logout`, 8 `GET` lecture seule, types §4, erreurs §5, limites §6). Base `http://127.0.0.1:8000/api`, `Accept: application/json`, `Bearer`, CORS `api/*` ouvert.

## Fichiers adaptés (frontend `classeInclusiveFrontend`)

```text
src/services/axios.js → + Accept: application/json (exigé §1)
src/views/client/ClientRegister.vue → champ numero optionnel, seuil password 4, POST {name,email,numero|null,password}, erreurs par champ 400
src/views/client/ClientLogin.vue → 400 message exact (Aucun client trouvé avec ce mail / Email ou mot de passe incorrect), tokenOf étendu, status insensible à la casse, refresh_token ignoré (401 → re-login)
src/composables/useClientList.js → resolvePath a.b.c pour recherche/tri sur relations
src/components/client/ClientDataPage.vue → cell() : tableaux → N élément(s), objets → name|title|nom|email|id ; countOf, boolOf
src/views/client/ClientEcoles.vue → name, numero, email
src/views/client/ClientClasses.vue → name, ecole.name, compte(eleves), enseignant.name, compte(matieres)
src/views/client/ClientMatieres.vue → name, ecole.name, compte(cours)
src/views/client/ClientEnseignants.vue → name, prenom, matricule, email, classe.name (jamais password)
src/views/client/ClientCours.vue → title, matiere.name, classe.name, enseignant.name, is_published badge, compte(medias), url tel quel
src/views/client/ClientQuizzes.vue → name, cours.title, compte(questions) ; lecture seule, jamais reponses[].status
src/views/client/ClientHandicaps.vue → id, name
src/views/client/ClientProfil.vue → id, name, email, numero, roles[].name (jamais password)
src/views/client/ClientDashboard.vue → compteurs length réels, tags h.name
```

## Interdits respectés

Lecture seule stricte, filtre UI uniquement, pas d'écrans update/reset profil, pas de données élèves, pas de nouvelle dépendance, `admin/enseignant/eleve/auth store` intacts.
