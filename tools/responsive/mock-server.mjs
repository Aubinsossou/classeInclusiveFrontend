/**
 * Serveur mock — outils/responsive/mock-server.mjs
 *
 * Sert le build statique (dist/) ET simule /api/v1/* avec les fixtures.
 * Sert de référence indépendante : si une page reste bloquée ici aussi,
 * le défaut est dans l'application, pas dans l'instrumentation CDP.
 * Aucune interception réseau, aucun Chrome piloté — du HTTP ordinaire.
 *
 * Usage : node tools/responsive/mock-server.mjs [port]
 */

import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, normalize } from 'node:path'
import { resolveApi } from './api-routes.mjs'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')
const PORT = Number(process.argv[2] || process.env.MOCK_PORT || 4180)

if (!existsSync(DIST)) {
  console.error('dist/ absent — lancez `npm run build` avant ce serveur.')
  process.exit(1)
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization, Accept, X-Requested-With',
}

const seen = []

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  // ── API simulée ──
  if (url.pathname.startsWith('/api/v1/')) {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { ...CORS, 'access-control-max-age': '86400', 'content-length': '0' })
      return res.end()
    }
    const r = resolveApi(req.method, url.pathname)
    seen.push(`${req.method} ${url.pathname}`)
    const body = JSON.stringify(r.body)
    res.writeHead(r.status ?? 200, {
      ...CORS,
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(body),
    })
    return res.end(body)
  }

  // ── Fichiers statiques, avec repli SPA ──
  // Toute route inconnue rend index.html : c'est le routeur Vue qui décide.
  let file = normalize(join(DIST, url.pathname))
  if (!file.startsWith(DIST)) file = join(DIST, 'index.html')
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')

  const ext = extname(file)
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' })
  res.end(readFileSync(file))
}).listen(PORT, () => {
  console.log(`Mock prêt → http://localhost:${PORT}/`)
  console.log(`Sert ${DIST} + /api/v1/* simulé (${seen.length} appel(s) pour l'instant)`)
  process.on('SIGINT', () => {
    console.log(`\n${seen.length} appel(s) API au total`)
    process.exit(0)
  })
})
