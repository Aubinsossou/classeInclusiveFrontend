/**
 * Référence indépendante — outils/responsive/t-ref.mjs
 *
 * Navigue avec Chrome SANS interception réseau CDP, contre le serveur mock
 * (mock-server.mjs). Si une page reste bloquée ici aussi, le défaut est dans
 * l'application et non dans l'instrumentation. C'est le test qui tranche.
 *
 * Prérequis : node tools/responsive/mock-server.mjs 4180
 * Usage :     BASE_URL=http://localhost:4180 node tools/responsive/t-ref.mjs /ecole/eleve ecole
 */

import { launchChrome, sleep } from './cdp.mjs'
import { applySession } from './session.mjs'

const BASE = process.env.BASE_URL || 'http://localhost:4180'
const ROUTE = process.argv[2] || '/ecole/eleve'
const ROLE = process.argv[3] ?? 'ecole'

const logs = []
const driver = await launchChrome()
// Écouteur console AVANT navigation, avec sérialisation profonde :
// axios journalise un objet d'erreur dont le détail (status, url, message)
// est la clé du diagnostic.
driver.on('Runtime.consoleAPICalled', ({ type, args }) => {
  const m = (args || [])
    .map((a) => {
      if (a.value !== undefined) return typeof a.value === 'object' ? JSON.stringify(a.value).slice(0, 100) : String(a.value)
      return `<${a.type}>`
    })
    .join(' ')
    .slice(0, 220)
  logs.push(`${type}: ${m}`)
})

// Les objets <object> ci-dessus sont des RemoteObject : on les résout
// explicitement dans la page pour lire leur contenu réel.
await driver.send('Page.addScriptToEvaluateOnNewDocument', {
  source: [
    '(function(){',
    '  var E = console.error, W = console.warn;',
    '  function deep(o){',
    '    try {',
    '      if (o instanceof Error) return String(o.message) + " | status=" + (o.response && o.response.status) + " | url=" + (o.config && o.config.url);',
    '      if (o && o.response) return "HTTP " + o.response.status + " " + (o.response.statusText||"") + " url=" + (o.config && o.config.url) + " data=" + JSON.stringify(o.response.data).slice(0,200);',
    '      if (o && o.config) return "axios url=" + o.config.url + " method=" + o.config.method + " baseURL=" + o.config.baseURL;',
    '      return typeof o === "object" ? JSON.stringify(o).slice(0,300) : String(o);',
    '    } catch(e){ return "[non sérialisable]"; }',
    '  }',
    '  console.error = function(){ E.apply(console, Array.prototype.map.call(arguments, deep)); };',
    '  console.warn  = function(){ W.apply(console, Array.prototype.map.call(arguments, deep)); };',
    '})()',
  ].join('\n'),
}, driver.sessionId)
driver.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
  logs.push(`EXCEPTION: ${String(exceptionDetails?.exception?.description || exceptionDetails?.text || '').slice(0, 400)}`)
})
await driver.send('Log.enable', {}, driver.sessionId)
await applySession(driver, ROLE)

await driver.send('Emulation.setDeviceMetricsOverride', {
  width: 375, height: 900, deviceScaleFactor: 1, mobile: true,
}, driver.sessionId)
await driver.send('Page.navigate', { url: BASE + ROUTE }, driver.sessionId)
await sleep(8000)

const s = JSON.parse(await driver.evaluate(`JSON.stringify({
  url: location.pathname,
  appHtml: document.getElementById('app') ? document.getElementById('app').innerHTML.length : 0,
  text: (document.body.innerText||'').replace(/\\s+/g,' ').trim().slice(0,400),
  rows: document.querySelectorAll('tbody tr').length,
  buttons: document.querySelectorAll('button').length
})`))

console.log(`Référence ${ROUTE} (rôle=${ROLE}) sur ${BASE} — sans interception CDP`)
console.log(`  URL       ${s.url}`)
console.log(`  #app      ${s.appHtml} car. HTML`)
console.log(`  contenu   ${s.rows} lignes, ${s.buttons} boutons`)
console.log(`  texte     ${s.text || '(vide)'}`)
console.log(`\nConsole (${logs.length}) :`)
for (const l of logs.slice(0, 30)) console.log(`  ${l}`)
if (!logs.length) console.log('  (aucune)')

await driver.close()
const rendered = s.appHtml > 1000
console.log(`\n${rendered ? '✔ Page rendue : le défaut vient de l’interception CDP' : '✘ Page non rendue : le défaut est dans l’APPLICATION'}`)
process.exit(rendered ? 0 : 1)
