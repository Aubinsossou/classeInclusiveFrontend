/**
 * Sonde de connexion — outils/responsive/smoke.mjs
 *
 * Valide la chaîne complète sur UNE seule route avant de lancer les 468
 * mesures : lancement Chrome, interception API, session factice, rendu,
 * probe. Si un maillon casse, on le sait en quelques secondes au lieu
 * d'attendre la fin d'un balayage complet.
 *
 * Usage : node tools/responsive/smoke.mjs [route]
 */

import { launchChrome, interceptApi, sleep } from './cdp.mjs'
import { resolveApi } from './api-routes.mjs'
import { applySession } from './session.mjs'
import { PROBE, parseProbe } from './probe.mjs'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const ROUTE = process.argv[2] || '/ecole/eleve'
const ROLE = process.env.ROLE || 'ecole'

const seen = []
const driver = await launchChrome()
await interceptApi(driver, (m, p) => resolveApi(m, p), (m, p) => seen.push(p))
await applySession(driver, ROLE)

console.log(`Mesure ${ROUTE} (rôle=${ROLE || 'public'}) sur ${BASE}`)
await driver.send('Emulation.setDeviceMetricsOverride', {
  width: 375,
  height: 900,
  deviceScaleFactor: 1,
  mobile: true,
}, driver.sessionId)

await driver.send('Page.navigate', { url: BASE + ROUTE }, driver.sessionId)
await sleep(4000)

const raw = await driver.evaluate(PROBE)
const probe = parseProbe(raw)

if (!probe) {
  console.error('✘ Probe illisible :', String(raw).slice(0, 300))
  await driver.close()
  process.exit(1)
}

console.log('\nRésultat :')
console.log(`  viewport        ${probe.vw} × ${probe.vh}`)
console.log(`  scrollWidth     ${probe.sw}  → débordement H : ${probe.hOverflow ? 'OUI (+' + probe.hExcess + 'px)' : 'non'}`)
console.log(`  scrollHeight    ${probe.sh}  → rognage V     : ${probe.vClipped ? 'OUI' : 'non'}`)
console.log(`  hors cadre      ${probe.offCount}`)
console.log(`  texte tronqué   ${probe.truncatedCount}`)
console.log(`  cibles < 44px   ${probe.smallTargetsCount}`)
console.log(`  polices < 12px  ${probe.smallFontsCount}`)
console.log(`  titre           ${probe.title}`)

if (probe.off.length) {
  console.log('\nÉléments hors cadre (12 premiers) :')
  for (const o of probe.off) console.log(`  ${o.sel}  ${o.left}→${o.right} (${o.w}px)`)
}
if (probe.truncated.length) {
  console.log('\nTexte tronqué (8 premiers) :')
  for (const t of probe.truncated) console.log(`  ${t.sel}  perdu ${t.lost}px`)
}

console.log(`\nAppels API interceptés (${seen.length}) :`)
for (const p of [...new Set(seen)]) console.log(`  ${p}`)

await driver.close()

// Critère de succès : la page a rendu ET l'API a été interceptée.
const apiOk = seen.length > 0
console.log(
  `\n${apiOk ? '✔ Chaîne validée' : '✘ Aucun appel API intercepté — le mock est inopérant'}`
)
process.exit(apiOk ? 0 : 1)
