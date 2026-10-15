/**
 * Test ciblé de l'écouteur console CDP — outils/responsive/t-console.mjs
 *
 * Isole une question précise : les événements Runtime.consoleAPICalled et
 * Runtime.exceptionThrown remontent-ils jusqu'au pilote ? Une console
 * silencieuse sur une page qui devrait journaliser signifie soit que le code
 * ne s'exécute pas, soit que l'écouteur est mal branché.
 *
 * Usage : node tools/responsive/t-console.mjs
 */

import { launchChrome, sleep } from './cdp.mjs'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const sink = []
const driver = await launchChrome()

driver.on('Runtime.consoleAPICalled', ({ type, args }) => {
  const msg = (args || []).map((a) => (a.value !== undefined ? String(a.value) : a.type)).join(' ')
  sink.push(`${type}: ${msg.slice(0, 200)}`)
})
driver.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
  sink.push(`exception: ${String(exceptionDetails?.exception?.description || '').slice(0, 300)}`)
})

// Page de test : journalise dès l'exécution, sans dépendre de l'app.
await driver.send('Page.navigate', { url: BASE + '/' }, driver.sessionId)
await sleep(3000)

await driver.evaluate("console.log('MARQUEUR-TEST-1'); console.warn('AVERT-TEST')")
// Exception volontaire, isolée dans son propre evaluate pour ne pas
// interrompre le script (evaluate() propage les exceptions).
try {
  await driver.evaluate("null.x")
} catch {}

const res = await driver.evaluate(`JSON.stringify({
  hasJQuery: typeof window.jQuery,
  hasAble: typeof window.Ably,
  vueMounted: !!document.getElementById('app') && document.getElementById('app').children.length > 0,
  appChildren: document.getElementById('app') ? document.getElementById('app').children.length : -1,
  scripts: Array.from(document.scripts).map(s => s.src.split('/').pop()).slice(0,8),
  readyState: document.readyState
})`)

console.log('État page :', res)
console.log(`\nÉvénements console captés (${sink.length}) :`)
for (const s of sink) console.log(`  ${s}`)

await driver.close()
console.log(
  `\n${sink.length >= 2 ? '✔ Écouteur console opérationnel' : '✘ Écouteur console défaillant — le problème est dans le pilote, pas dans l’app'}`
)
process.exit(sink.length >= 2 ? 0 : 1)
