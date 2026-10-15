import { describe, it, expect, beforeEach } from 'vitest'

// jsdom n'expose pas window.speechSynthesis, que useVoiceEngine utilise
// dès l'import du module. On le polyfasse AVANT d'importer le routeur.
window.speechSynthesis = {
  getVoices: () => [],
  addEventListener() {},
  removeEventListener() {},
  cancel() {},
  speak() {},
}

// Import dynamique : le polyfill doit s'exécuter avant l'évaluation du routeur
// (qui importe useVoiceEngine en module).
const { default: router } = await import('@/router')

/** Simule une session telle que les écrans de login l'écrivent dans localStorage. */
function simulerSession(role) {
  localStorage.setItem('access_token', 'token-de-test')
  localStorage.setItem('role', role)
}

/** Navigue et renvoie la route finalement résolue (redirections incluses). */
async function allerA(path) {
  await router.push(path)
  return router.currentRoute.value
}

describe('Gardes du routeur (beforeEach)', () => {
  beforeEach(async () => {
    localStorage.clear()
    // Repartir d'une route publique neutre pour éviter les navigations en double.
    await router.push('/')
  })

  // ── Accessibilité publique ────────────────────────────────────────────────

  it('la landing reste accessible sans session', async () => {
    expect((await allerA('/')).name).toBe('landing')
  })

  // ── Sans token : redirection vers le login du domaine visité ──────────────

  it('redirige /ecole/dashboard vers le login école sans token', async () => {
    expect((await allerA('/ecole/dashboard')).name).toBe('ecoleLogin')
  })

  it('redirige /enseignant/dashboard vers le login enseignant sans token', async () => {
    expect((await allerA('/enseignant/dashboard')).name).toBe('enseignantlogin')
  })

  it('redirige /client/dashboard vers le login client sans token', async () => {
    expect((await allerA('/client/dashboard')).name).toBe('ClientLogin')
  })

  it('redirige /eleve/dashboard vers le login élève sans token', async () => {
    expect((await allerA('/eleve/dashboard')).name).toBe('EleveLogin')
  })

  // ── Token mais rôle inconnu ou absent ─────────────────────────────────────

  it('traite un rôle vide comme une session absente', async () => {
    localStorage.setItem('access_token', 'token-de-test')
    localStorage.setItem('role', '')

    expect((await allerA('/ecole/dashboard')).name).toBe('ecoleLogin')
  })

  it('traite un rôle inconnu comme une session absente', async () => {
    localStorage.setItem('access_token', 'token-de-test')
    localStorage.setItem('role', 'super-admin')

    expect((await allerA('/client/dashboard')).name).toBe('ClientLogin')
  })

  // ── Rôle bon : accès à l'espace own ───────────────────────────────────────

  it("un token école accède à l'espace école", async () => {
    simulerSession('ecole')
    expect((await allerA('/ecole/dashboard')).name).toBe('adminDashboard')
  })

  it("un token enseignant accède à l'espace enseignant", async () => {
    simulerSession('enseignant')
    expect((await allerA('/enseignant/eleve')).name).toBe('EnseignantEleve')
  })

  it("un token client accède à l'espace client", async () => {
    simulerSession('client')
    expect((await allerA('/client/cours')).name).toBe('ClientCours')
  })

  it("un token élève accède à l'espace élève", async () => {
    simulerSession('eleve')
    expect((await allerA('/eleve/dashboard')).name).toBe('Dashboard')
  })

  // ── Mauvais rôle : aucune session ne traverse un espace étranger ──────────
  // Les flags requiresXxxAuth sont prioritaires : ils renvoient vers le login
  // du domaine VISITÉ (le bloc « mauvais rôle → propre dashboard » du
  // beforeEach ne s'applique qu'à une route avec meta.role sans flag requires,
  // ce qui n'existe pas aujourd'hui — voir src/router/index.js).

  it('un client ne traverse pas /ecole/dashboard (renvoyé vers le login école)', async () => {
    simulerSession('client')
    expect((await allerA('/ecole/dashboard')).name).toBe('ecoleLogin')
  })

  it('une école ne traverse pas /client/dashboard (renvoyée vers le login client)', async () => {
    simulerSession('ecole')
    expect((await allerA('/client/dashboard')).name).toBe('ClientLogin')
  })

  it('un enseignant ne traverse pas /ecole/enseignant (renvoyé vers le login école)', async () => {
    simulerSession('enseignant')
    expect((await allerA('/ecole/enseignant')).name).toBe('ecoleLogin')
  })

  it('un élève ne traverse pas /client/classes (renvoyé vers le login client)', async () => {
    simulerSession('eleve')
    expect((await allerA('/client/classes')).name).toBe('ClientLogin')
  })

  it("une école ne traverse pas /enseignant/dashboard (renvoyée vers le login enseignant)", async () => {
    simulerSession('ecole')
    expect((await allerA('/enseignant/dashboard')).name).toBe('enseignantlogin')
  })

  it('un client ne traverse pas /eleve/dashboard (renvoyé vers EleveLogin)', async () => {
    simulerSession('client')
    expect((await allerA('/eleve/dashboard')).name).toBe('EleveLogin')
  })

  // ── Déjà connecté : le login du bon rôle renvoie au dashboard ────────────

  it('un client déjà connecté arrivant sur /client/login est renvoyé à son dashboard', async () => {
    simulerSession('client')
    expect((await allerA('/client/login')).name).toBe('ClientDashboard')
  })

  it("une école déjà connectée arrivant sur /ecole/login est renvoyée à son dashboard", async () => {
    simulerSession('ecole')
    expect((await allerA('/ecole/login')).name).toBe('adminDashboard')
  })

  it('un enseignant déjà connecté arrivant sur /enseignant/login est renvoyé à son dashboard', async () => {
    simulerSession('enseignant')
    expect((await allerA('/enseignant/login')).name).toBe('enseignantDashboard')
  })

  it('un élève déjà connecté arrivant sur /eleve/login est renvoyé à son dashboard', async () => {
    simulerSession('eleve')
    expect((await allerA('/eleve/login')).name).toBe('Dashboard')
  })

  it('le login école reste affiché à une session client active (comportement voulu)', async () => {
    simulerSession('client')
    expect((await allerA('/ecole/login')).name).toBe('ecoleLogin')
  })
})
