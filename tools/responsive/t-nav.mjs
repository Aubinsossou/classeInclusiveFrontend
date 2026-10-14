/**
 * Sonde de session de navigation — outils/responsive/t-nav.mjs
 *
 * Attache un écouteur console AVANT la navigation (Page.addScriptToEvaluate
 * onNewDocument n'est pas fiable pour capter ce qui se joue pendant le
 * chargement : on branche ici l'écouteur, puis on navigue).
 *
 * Sert à savoir si le code applicatif s'exécute réellement, ce qu'une mesure
 * après coup ne permet pas de distinguer.
 *
 * Usage : node tools/responsive/t-nav.mjs /ecole/eleve ecole
 */

import { launchChrome, interceptApi, sleep } from './cdp.mjs'
import { resolveApi } from './api-routes.mjs'
import { applySession } from './session.mjs'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const ROUTE = process.argv[2] || '/ecole/eleve'
const ROLE = process.argv[3] ?? 'ecole'

const logs = []
const seen = []
const driver = await launchChrome()

// Écouteur branché AVANT toute navigation.
driver.on('Runtime.consoleAPICalled', ({ type, args }) => {
  const m = (args || [])
    .map((a) => (a.value !== undefined ? (typeof a.value === 'object' ? JSON.stringify(a.value) : String(a.value)) : `<${a.type}>`))
    .join(' ')
    .slice(0, 200)
  logs.push(`${type}: ${m}`)
})
driver.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
  logs.push(`EXCEPTION: ${String(exceptionDetails?.exception?.description || exceptionDetails?.text || '').slice(0, 500)}`)
})
driver.on('Log.entryAdded', ({ entry }) => {
  if (entry?.level === 'error') logs.push(`log.${entry.level}: ${String(entry.text).slice(0, 200)}`)
})
driver.on('Page.loadEventFired', () => logs.push('-- load --'))
driver.on('Page.frameNavigated', ({ frame }) => {
  if (frame?.url) logs.push(`-- nav ${frame.url} --`)
})
await driver.send('Log.enable', {}, driver.sessionId)

await interceptApi(driver, (m, p) => resolveApi(m, p), (m, p) => seen.push(`${m} ${p}`))
await applySession(driver, ROLE)

await driver.send('Page.navigate', { url: BASE + ROUTE }, driver.sessionId)
await sleep(8000)

console.log(`Navigation ${ROUTE} (rôle=${ROLE})`)
console.log(`Appels API (${seen.length}) : ${seen.join(' | ') || '(aucun)'}`)
console.log(`\nJournal chronologique (${logs.length}) :`)
for (const l of logs.slice(0, 40)) console.log(`  ${l}`)
if (!logs.length) console.log('  (vide — aucun code applicatif exécuté)')

await driver.close()
