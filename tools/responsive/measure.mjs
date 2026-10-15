/**
 * Mesure responsive — outils/responsive/measure.mjs
 *
 * Architecture retenue : ORIGINE UNIQUE.
 *   1. `npm run build` avec VITE_API_URL pointant vers le mock
 *   2. mock-server.mjs sert dist/ ET simule /api/v1/*
 *   3. Chrome navigue, injecte une session par rôle, mesure le DOM
 *
 * Pourquoi pas l'interception réseau CDP ? Elle a été essayée et abandonnée :
 * le bundle inline `baseURL: http://localhost:8000/api/v1` au build. Toute
 * interception devait reproduire un préflight CORS conforme ; le moindre écart
 * faisait échouer la vraie requête EN SILENCE (aucune erreur console), la page
 * restant figée sur « Chargement ». En servant l'app et l'API sur le même port,
 * il n'y a plus de CORS du tout : la mesure porte sur le rendu réel.
 *
 * Usage :
 *   npm run build:mock
 *   node tools/responsive/mock-server.mjs 4180
 *   node tools/responsive/measure.mjs
 */

import { launchChrome, sleep } from './cdp.mjs'
import { applySession } from './session.mjs'
import { PROBE, parseProbe } from './probe.mjs'
import { ROUTES, WIDTHS, HEIGHT } from './routes.mjs'

const BASE = process.env.BASE_URL || 'http://localhost:4180'
const PORT = Number(process.env.CDP_PORT || 9333)
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null

const routes = ONLY ? ROUTES.filter((r) => ONLY.has(r.p)) : ROUTES
const roles = [...new Set(routes.map((r) => r.role))]

console.log(`Mesure sur ${BASE} — ${routes.length} route(s) × ${WIDTHS.length} largeur(s)`)
console.log(`Port CDP ${PORT}\n`)

const driver = await launchChrome({ port: PORT })
const results = []
let checks = 0

for (const role of roles) {
  await applySession(driver, role)

  for (const w of WIDTHS) {
    await driver.send(
      'Emulation.setDeviceMetricsOverride',
      { width: w, height: HEIGHT, deviceScaleFactor: 1, mobile: w < 768 },
      driver.sessionId
    )

    for (const route of routes.filter((r) => r.role === role)) {
      await driver.send('Page.navigate', { url: BASE + route.p }, driver.sessionId)
      await sleep(1400) // laisse le routeur + les requêtes se résorber

      const probe = parseProbe(await driver.evaluate(PROBE))
      if (!probe) continue
      checks++

      results.push({ route: route.p, role, width: w, ...probe })

      const flag = probe.hOverflow ? '✗' : '·'
      const detail = probe.hOverflow
        ? `débordement +${probe.hExcess}px (${probe.offCount} él. hors cadre)`
        : 'ok'
      console.log(`${flag} ${String(w).padStart(4)}px ${route.p} — ${detail}`)
    }
  }
}

await driver.close()

// ── Synthèse ──
const overflow = results.filter((r) => r.hOverflow)
console.log(`\n${'═'.repeat(64)}`)
console.log(`${checks} mesures — ${overflow.length} débordement(s) horizontal(aux)`)

if (overflow.length) {
  console.log('\nPar route :')
  const byRoute = new Map()
  for (const r of overflow) {
    if (!byRoute.has(r.route)) byRoute.set(r.route, [])
    byRoute.get(r.route).push(r)
  }
  for (const [route, list] of [...byRoute].sort((a, b) => b[1].length - a[1].length)) {
    const worst = list.reduce((a, b) => (b.hExcess > a.hExcess ? b : a))
    console.log(
      `  ${route} — ${list.length}/${WIDTHS.length} largeurs, pire +${worst.hExcess}px à ${worst.width}px`
    )
  }
}

console.log(
  `\n${overflow.length === 0 ? '✔ Aucun débordement horizontal.' : `✘ ${overflow.length} mesure(s) en débordement.`}`
)
process.exit(overflow.length ? 1 : 0)
