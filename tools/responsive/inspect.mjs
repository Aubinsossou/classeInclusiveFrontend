/** Capture les erreurs console et les exceptions de page. */
async function captureConsole(driver, sink) {
  driver.on('Runtime.consoleAPICalled', ({ type, args }) => {
    const msg = (args || [])
      .map((a) => {
        if (a.value !== undefined) return typeof a.value === 'object' ? JSON.stringify(a.value).slice(0, 120) : String(a.value)
        return a.description || a.type
      })
      .join(' ')
      .slice(0, 300)
    // On garde tout : les vues journalisent leurs étapes de chargement
    // (ex. 'eleves.value:'), ce qui localise précisément une chaîne rompue.
    sink.push(`${type}: ${msg}`)
  })
  driver.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
    const d = exceptionDetails?.exception?.description || exceptionDetails?.text || 'inconnu'
    sink.push(`exception: ${String(d).slice(0, 400)}`)
  })
  // Réponses réseau : un statut inattendu explique une page qui reste vide.
  driver.on('Network.responseReceived', ({ response, type }) => {
    if (/\/api\/v1\//.test(response?.url || '') || response?.status >= 400) {
      sink.push(`réseau ${response.status} ${type} ${String(response.url).slice(-60)}`)
    }
  })
}

/** Diagnostic de rendu — outils/responsive/inspect.mjs
 *
 * Affiche l'état réel du DOM après navigation : chemin réellement atteint
 * (détecte les redirections du routeur), hauteur de contenu, nombre de
 * tableaux/lignes, erreurs console, et les appels API vus. Sert à comprendre
 * pourquoi une page ne rend pas son contenu métier.
 *
 * Usage : node tools/responsive/inspect.mjs /ecole/eleve ecole
 */

import { launchChrome, interceptApi, sleep } from './cdp.mjs'
import { resolveApi } from './api-routes.mjs'
import { applySession } from './session.mjs'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const ROUTE = process.argv[2] || '/ecole/eleve'
const ROLE = process.argv[3] ?? 'ecole'

const seen = []
const errors = []
const driver = await launchChrome()
await driver.send('Network.enable', {}, driver.sessionId)
await captureConsole(driver, errors)
await interceptApi(driver, (m, p) => resolveApi(m, p), (m, p) => seen.push(`${m} ${p}`))
await applySession(driver, ROLE)

await driver.send('Emulation.setDeviceMetricsOverride', {
  width: 375, height: 900, deviceScaleFactor: 1, mobile: true,
}, driver.sessionId)

await driver.send('Page.navigate', { url: BASE + ROUTE }, driver.sessionId)
await sleep(5000)

const state = await driver.evaluate(`(function(){
  var app = document.getElementById('app');
  var tables = document.querySelectorAll('table');
  var rows = document.querySelectorAll('tbody tr');
  var cards = document.querySelectorAll('.pro-card, .card, .subject-btn');
  var txt = (document.body.innerText || '').replace(/\\s+/g,' ').trim();
  var loader = document.querySelector('.loading, .loader, [class*=loading], [class*=spinner]');
  return JSON.stringify({
    url: location.pathname + location.search,
    appHtmlLen: app ? app.innerHTML.length : 0,
    appText: app ? (app.innerText || '').replace(/\\s+/g,' ').trim().slice(0,600) : '',
    tables: tables.length,
    rows: rows.length,
    cards: cards.length,
    loaderVisible: !!loader,
    bodyText: txt.slice(0, 400),
    ls: {
      token: !!localStorage.getItem('access_token'),
      role: localStorage.getItem('role'),
      edu: !!localStorage.getItem('edu_token')
    }
  });
})()`)

const s = JSON.parse(state)
console.log(`Route demandée : ${ROUTE}   (rôle=${ROLE || 'vierge'})`)
console.log(`URL réelle     : ${s.url}`)
console.log(`localStorage   : token=${s.ls.token} role=${s.ls.role} edu=${s.ls.edu}`)
console.log(`DOM app        : ${s.appHtmlLen} caractères HTML`)
console.log(`tables=${s.tables}  lignes=${s.rows}  cartes=${s.cards}  loader=${s.loaderVisible}`)
console.log(`\nTexte rendu :\n  ${s.appText || '(vide)'}`)
console.log(`\nAppels API (${seen.length} au total) :`)
const tally = new Map()
for (const x of seen) tally.set(x, (tally.get(x) || 0) + 1)
for (const [x, n] of tally) console.log(`  ${n}× ${x}`)

console.log(`\nConsole (${errors.length}) :`)
if (errors.length) {
  for (const e of errors.slice(0, 25)) console.log(`  ${e}`)
} else {
  console.log('  (aucune)')
}

await driver.close()
