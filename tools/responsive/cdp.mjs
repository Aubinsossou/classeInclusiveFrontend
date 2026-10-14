/**
 * Bibliothèque CDP — outils/responsive/cdp.mjs
 *
 * Enveloppe minimale autour de Chrome DevTools Protocol, via le WebSocket
 * natif de Node (globalThis.WebSocket, dispo depuis Node 22). Aucune
 * dépendance ajoutée au projet : le package.json reste intact.
 *
 * Responsabilités :
 *   - lancer Chrome headless avec un profil temporaire jetable
 *   - découvrir l'endpoint de debug /json/version
 *   - ouvrir une session de navigation aplatie (flatten)
 *   - exposer send(method, params) → Promise
 *   - INTERCEPTER le réseau (Fetch.enable/fulfillRequest) : c'est ce qui
 *     permet de mesurer les pages sur du contenu réel, backend injoignable
 */

import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Chemins Chrome usuels sous Windows. */
export function findChrome(explicit) {
  if (explicit) return explicit
  return [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ].filter(Boolean)[0]
}

/**
 * Lance Chrome headless et rend un pilote connecté.
 * @returns {Promise<object>} pilote (send / evaluate / on / close)
 */
export async function launchChrome({ port = 9222, chromePath, headless = true } = {}) {
  // Garde-fou : un Chrome résiduel sur ce port ferait tourner l'attente
  // ci-dessous à vide, puis échouer sans explication. On le dit tout de suite.
  try {
    const probe = await fetch(`http://127.0.0.1:${port}/json/version`)
    if (probe.ok) {
      throw new Error(
        `Le port ${port} est déjà utilisé par une instance Chrome. ` +
          `Fermez-la ou choisissez un autre port (--port).`
      )
    }
  } catch (e) {
    if (e.message.includes('déjà utilisé')) throw e
  }

  const userDir = mkdtempSync(join(tmpdir(), 'cdp-'))
  const args = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
  ]
  // headless=new (Chrome >= 112) : moteur de rendu complet, CSS fiable.
  if (headless) args.push('--headless=new')

  const chrome = spawn(findChrome(chromePath), args, { stdio: 'ignore' })

  const cleanup = () => {
    try {
      chrome.kill()
    } catch {}
    try {
      rmSync(userDir, { recursive: true, force: true })
    } catch {}
  }
  chrome.on('error', (e) => {
    console.error('Chrome introuvable :', e.message)
    process.exit(2)
  })

  // Attente de la disponibilité de l'endpoint de debug.
  let version = null
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (r.ok) {
        version = await r.json()
        break
      }
    } catch {}
    await sleep(250)
  }
  if (!version) {
    cleanup()
    throw new Error(`Chrome injoignable sur le port ${port}`)
  }

  const ws = new WebSocket(version.webSocketDebuggerUrl)
  let msgId = 0
  const pending = new Map()
  const listeners = new Map() // method → [handlers]

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', () => reject(new Error('WebSocket CDP en erreur')), { once: true })
  })

  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id)
      pending.delete(m.id)
      m.error ? rej(new Error(m.error.message)) : res(m.result)
      return
    }
    // Événements CDP (Fetch.requestPaused, etc.)
    if (m.method) {
      const hs = listeners.get(m.method)
      if (hs) for (const h of hs) h(m.params)
    }
  })

  /** Envoie une commande CDP. sessionId optionnel (mode aplati). */
  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const id = ++msgId
      pending.set(id, { res, rej })
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
    })

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })

  await send('Page.enable', {}, sessionId)
  await send('Runtime.enable', {}, sessionId)

  return {
    /** Commandes CDP brutes, dans la session de navigation. */
    send,
    sessionId,
    targetId,
    /** Abonne un gestionnaire à un événement CDP. */
    on(method, handler) {
      if (!listeners.has(method)) listeners.set(method, [])
      listeners.get(method).push(handler)
    },
    /** Évalue une expression JS dans la page et renvoie la valeur. */
    async evaluate(expression) {
      const { result, exceptionDetails } = await send(
        'Runtime.evaluate',
        { expression, returnByValue: true, awaitPromise: false },
        sessionId
      )
      if (exceptionDetails) {
        throw new Error(exceptionDetails.exception?.description || 'exception JS in-page')
      }
      return result.value
    },
    async close() {
      try {
        await send('Target.closeTarget', { targetId })
      } catch {}
      try {
        ws.close()
      } catch {}
      cleanup()
    },
  }
}

/**
 * Intercepte les appels réseau de l'API et les remplace par les fixtures.
 * Les requêtes hors périmètre (CDN Bootstrap, polices, assets Vite) passent
 * sans modification : le rendu reste fidèle à la production.
 *
 * @param driver pilote issu de launchChrome()
 * @param resolve fonction (method, url) → {status, body} | null
 */
export async function interceptApi(driver, resolve, onRequest) {
  const { send, sessionId } = driver

  driver.on('Fetch.requestPaused', async ({ requestId, request }) => {
    let url = null
    try {
      url = new URL(request.url)
    } catch {}

    // Toute requête interceptée DOIT recevoir une réponse : faute de
    // continueRequest/fulfillRequest, elle reste en suspens et la navigation
    // ne se termine jamais. On relaie donc explicitement tout ce qui sort du
    // périmètre API (document HTML, CSS, JS, CDN Bootstrap, polices).
    const inScope = url && /\/api\/v1\//.test(url.pathname)

    // Préflight CORS : une demande OPTIONS doit recevoir une réponse 204
    // avec les en-têtes CORS, et SURTOUT pas un corps JSON — sinon le
    // navigateur rejette la vraie requête qui suit.
    //
    // access-control-allow-headers liste EXPLICITEMENT les en-têtes envoyés
    // par axios (Content-Type, Authorization). Le joker '*' est refusé par
    // Chrome lorsqu'une autorisation (Bearer) est présente : le préflight
    // passe, puis la vraie requête est annulée silencieusement — la page
    // reste figée sur « Chargement » sans la moindre erreur console.
    if (request.method === 'OPTIONS') {
      try {
        await send(
          'Fetch.fulfillRequest',
          {
            requestId,
            responseCode: 204,
            responseHeaders: [
              { name: 'access-control-allow-origin', value: '*' },
              {
                name: 'access-control-allow-methods',
                value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
              },
              {
                name: 'access-control-allow-headers',
                value: 'Content-Type, Authorization, Accept, X-Requested-With',
              },
              { name: 'access-control-max-age', value: '86400' },
              { name: 'content-length', value: '0' },
            ],
          },
          sessionId
        )
      } catch {}
      return
    }

    if (!inScope) {
      try {
        await send('Fetch.continueRequest', { requestId }, sessionId)
      } catch {
        // Requête déjà annulée : sans conséquence.
      }
      return
    }

    const resolved = resolve(request.method, url.pathname)
    if (!resolved) {
      try {
        await send('Fetch.continueRequest', { requestId }, sessionId)
      } catch {}
      return
    }
    if (onRequest) onRequest(request.method, url.pathname)

    try {
      await send(
        'Fetch.fulfillRequest',
        {
          requestId,
          responseCode: resolved.status ?? 200,
          responseHeaders: [
            { name: 'content-type', value: 'application/json; charset=utf-8' },
            { name: 'access-control-allow-origin', value: '*' },
            { name: 'access-control-allow-headers', value: '*' },
            { name: 'access-control-allow-methods', value: '*' },
          ],
          body: JSON.stringify(resolved.body),
        },
        sessionId
      )
    } catch {
      // Requête annulée (navigation interrompue) : sans conséquence.
    }
  })

  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] }, sessionId)
}

export default { launchChrome, interceptApi, findChrome, sleep }
