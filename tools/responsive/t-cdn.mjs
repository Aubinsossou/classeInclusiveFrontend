/**
 * Contrôle des ressources externes — outils/responsive/t-cdn.mjs
 *
 * index.html charge Bootstrap, jQuery et Able Player en <script>/<link>
 * SYNCHRONES dans le <head>. Une telle ressource en erreur retarde le parse
 * du bundle Vue : toute l'application monte tard, ou pas du tout. Ce contrôle
 * détecte ce cas avant toute mesure, sinon les chiffres seraient faussés.
 *
 * Usage : node tools/responsive/t-cdn.mjs
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const html = readFileSync(join(ROOT, 'index.html'), 'utf8')

// URL des ressources réellement chargées : <script src> et <link href>.
// On exclut volontairement <link rel="preconnect">, qui n'est qu'une annonce
// de connexion (pas une ressource) et renverrait un 404 légitime.
const urls = []
for (const m of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
  const tag = m[0]
  const url = tag.match(/(?:src|href)="(https?:\/\/[^"]+)"/i)?.[1]
  if (!url) continue
  if (/rel\s*=\s*["']?preconnect/i.test(tag)) continue
  urls.push(url)
}

console.log(`${urls.length} ressource(s) externe(s) chargée(s) par index.html\n`)

let ko = 0
for (const url of urls) {
  let verdict = 'OK'
  let detail = ''
  try {
    // redirect:'manual' — on teste l'URL TELLE QU'ÉCRITE. Suivre les
    // redirections masquerait une URL mal formée, qui est justement le défaut
    // recherché : un CDN qui redirige reste un détour réseau inutile.
    const r = await fetch(url, { method: 'GET', redirect: 'manual' })
    if (r.status >= 400) {
      verdict = `HTTP ${r.status}`
      ko++
    } else if (r.type === 'opaqueredirect') {
      verdict = `REDIRIGE (${r.status})`
      ko++
    } else {
      const len = Number(r.headers.get('content-length') || 0)
      detail = len ? ` ${(len / 1024).toFixed(0)}KB` : ''
    }
  } catch (e) {
    verdict = `INJOIGNABLE (${e.message})`
    ko++
  }
  console.log(`  ${verdict === 'OK' ? '✓' : '✗'} ${verdict.padEnd(20)} ${url}${detail}`)
}

// Ressources dont l'échec retarde ou empêche le montage de Vue.
const BLOCKING = ['ableplayer', 'jquery']
const blockingUrls = urls.filter((u) => BLOCKING.some((b) => u.includes(b)))

console.log(
  `\n${ko === 0 ? '✔ Toutes les ressources externes répondent telles qu’écrites.' : `✘ ${ko} ressource(s) en échec sur ${urls.length}.`}`
)
if (blockingUrls.length) {
  console.log('⚠️  Ressources bloquantes (leur échec retarde le montage de Vue) :')
  for (const u of blockingUrls) console.log(`   ${u}`)
}
process.exit(ko === 0 ? 0 : 1)
