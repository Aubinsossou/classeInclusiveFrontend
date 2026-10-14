/**
 * Sonde d'état d'une route protégée — outils/responsive/t-route.mjs
 *
 * Navigue avec session factice + interception API, puis rapporte l'état
 * interne : composant monté, contenu, appels API, console. Sert à distinguer
 * « la page n'a pas rendu » de « la page a rendu mais sans données ».
 *
 * Usage : node tools/responsive/t-route.mjs /ecole/eleve ecole
 */

import { launchChrome, interceptApi, sleep } from './cdp.mjs'
import { resolveApi } from './api-routes.mjs'
import { applySession } from './session.mjs'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const ROUTE = process.argv[2] || '/ecole/eleve'
const ROLE = process.argv[3] ?? 'ecole'
const WAIT = Number(process.env.WAIT || 6000)

const seen = []
const logs = []
const driver = await launchChrome()
driver.on('Runtime.consoleAPICalled', ({ type, args }) => {
  const m = (args || [])
    .map((a) => (a.value !== undefined ? (typeof a.value === 'object' ? JSON.stringify(a.value) : String(a.value)) : a.type))
    .join(' ')
    .slice(0, 220)
  logs.push(`${type}: ${m}`)
})
driver.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
  logs.push(`EXCEPTION: ${String(exceptionDetails?.exception?.description || exceptionDetails?.text || '').slice(0, 400)}`)
})

await interceptApi(driver, (m, p) => resolveApi(m, p), (m, p) => seen.push(`${m} ${p}`))
await applySession(driver, ROLE)

await driver.send('Emulation.setDeviceMetricsOverride', {
  width: 375, height: 900, deviceScaleFactor: 1, mobile: true,
}, driver.sessionId)
await driver.send('Page.navigate', { url: BASE + ROUTE }, driver.sessionId)
await sleep(WAIT)

const state = await driver.evaluate(`JSON.stringify({
  url: location.pathname,
  appChildren: document.getElementById('app') ? document.getElementById('app').children.length : -1,
  appHtml: document.getElementById('app') ? document.getElementById('app').innerHTML.length : 0,
  text: (document.body.innerText||'').replace(/\\s+/g,' ').trim().slice(0,700),
  rows: document.querySelectorAll('tbody tr').length,
  inputs: document.querySelectorAll('input,select,textarea').length,
  buttons: document.querySelectorAll('button').length,
  lsToken: !!localStorage.getItem('access_token'),
  lsRole: localStorage.getItem('role')
})`)

const s = JSON.parse(state)
console.log(`Route ${ROUTE} (rôle=${ROLE || 'vierge'}) — attente ${WAIT}ms`)
console.log(`  URL réelle    ${s.url}`)
console.log(`  session       token=${s.lsToken} role=${s.lsRole}`)
console.log(`  #app          ${s.appChildren} enfant(s), ${s.appHtml} car. HTML`)
console.log(`  contenu       ${s.rows} lignes, ${s.inputs} champs, ${s.buttons} boutons`)
console.log(`  texte         ${s.text || '(vide)'}`)

const tally = new Map()
for (const x of seen) tally.set(x, (tally.get(x) || 0) + 1)
console.log(`\nAppels API (${seen.length}) :`)
for (const [x, n] of tally) console.log(`  ${n}× ${x}`)
if (!seen.length) console.log('  (aucun)')

console.log(`\nConsole (${logs.length}) :`)
for (const l of logs.slice(0, 30)) console.log(`  ${l}`)
if (!logs.length) console.log('  (aucune)')

await driver.close()
