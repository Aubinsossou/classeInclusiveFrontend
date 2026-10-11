/**
 * Vérification responsive comportementale (réelle) : Chrome headless + CDP.
 * Compare documentElement.scrollWidth à innerWidth sur chaque route × largeur.
 * Les routes protégées sont rendues en injectant une session factice avant tout
 * script de page ; la suppression du token par le handler 401 est neutralisée
 * pour que la mesure porte sur la page et non sur la redirection.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'
const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9222
const WIDTHS = [320, 375, 390, 480, 640, 768, 1024, 1280, 1440, 1920]

const ROUTES = [
  { p: '/', role: '' },
  { p: '/ecole/login', role: '' },
  { p: '/ecole/register', role: '' },
  { p: '/client/login', role: '' },
  { p: '/client/register', role: '' },
  { p: '/eleve/login', role: '' },
  { p: '/enseignant/login', role: '' },
  { p: '/ecole/dashboard', role: 'ecole' },
  { p: '/ecole/enseignant', role: 'ecole' },
  { p: '/ecole/matiere', role: 'ecole' },
  { p: '/ecole/eleve', role: 'ecole' },
  { p: '/ecole/classe', role: 'ecole' },
  { p: '/enseignant/dashboard', role: 'enseignant' },
  { p: '/enseignant/cours', role: 'enseignant' },
  { p: '/enseignant/eleve', role: 'enseignant' },
  { p: '/enseignant/quiz', role: 'enseignant' },
  { p: '/eleve/dashboard', role: 'eleve' },
  { p: '/eleve/subject/1/courses', role: 'eleve' },
  { p: '/eleve/subject/1/lesson/1', role: 'eleve' },
  { p: '/eleve/subject/1/lesson/1/result', role: 'eleve' },
  { p: '/eleve/blind', role: 'eleve' },
  { p: '/client/dashboard', role: 'client' },
  { p: '/client/profil', role: 'client' },
  { p: '/client/eleves', role: 'client' },
  { p: '/client/etablissements/1', role: 'client' },
]

const AUTH_TMPL = [
  '(function(){',
  '  var role = __ROLE__;',
  '  try {',
  "    localStorage.setItem('access_token','e2e-dryrun');",
  "    localStorage.setItem('role', role);",
  '    var rm = Storage.prototype.removeItem;',
  '    Storage.prototype.removeItem = function(k){',
  "      if (k === 'access_token' || k === 'role') return;",
  '      return rm.call(this, k);',
  '    };',
  '    Storage.prototype.clear = function(){};',
  '  } catch(e){}',
  '})()',
].join('\n')

const EVAL = [
  '(function(){',
  '  var de = document.documentElement;',
  '  var vw = window.innerWidth;',
  '  var sw = Math.max(de.scrollWidth, document.body ? document.body.scrollWidth : 0);',
  '  var off = [];',
  '  if (sw > vw + 1) {',
  "    var all = document.querySelectorAll('body *');",
  '    for (var i = 0; i < all.length; i++) {',
  '      var el = all[i];',
  '      var r = el.getBoundingClientRect();',
  '      if (r.width === 0) continue;',
  '      if (r.right > vw + 1 || r.left < -1) {',
  '        var cs = getComputedStyle(el);',
  "        if (cs.position === 'fixed' && cs.pointerEvents === 'none') continue;",
  '        var cn = el.className;',
  '        if (cn && cn.baseVal !== undefined) cn = cn.baseVal;',
  "        off.push({ tag: el.tagName.toLowerCase(), cls: String(cn||'').slice(0,70), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) });",
  '      }',
  '    }',
  '    off.sort(function(a,b){ return b.right - a.right });',
  '  }',
  "  return JSON.stringify({ vw: vw, sw: sw, off: off.slice(0,6), url: location.pathname });",
  '})()',
].join('\n')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const userDir = mkdtempSync(join(tmpdir(), 'cdp-'))

const chrome = spawn(CHROME, [
  '--headless=new',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + userDir,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--hide-scrollbars',
  'about:blank',
])
chrome.on('error', (e) => {
  console.error('Chrome:', e.message)
  process.exit(2)
})

async function waitForBrowser() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + PORT + '/json/version')
      if (r.ok) return
    } catch {}
    await sleep(300)
  }
  throw new Error('Chrome injoignable')
}

let msgId = 0
function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)
    const pending = new Map()
    ws.addEventListener('open', () =>
      resolve({
        send(method, params = {}, sessionId) {
          const id = ++msgId
          return new Promise((res, rej) => {
            pending.set(id, { res, rej })
            ws.send(JSON.stringify({ id, method, params, sessionId }))
          })
        },
        close: () => ws.close(),
      })
    )
    ws.addEventListener('error', reject)
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id)
        pending.delete(m.id)
        m.error ? rej(new Error(m.error.message)) : res(m.result)
      }
    })
  })
}

async function main() {
  await waitForBrowser()
  const info = await (await fetch('http://127.0.0.1:' + PORT + '/json/version')).json()
  const browser = await connect(info.webSocketDebuggerUrl)
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true })

  const roles = [...new Set(ROUTES.map((r) => r.role))]
  const failures = []
  let checks = 0

  for (const role of roles) {
    const src = AUTH_TMPL.replace('__ROLE__', JSON.stringify(role || ''))
    await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: src }, sessionId)

    for (const w of WIDTHS) {
      await browser.send(
        'Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 },
        sessionId
      )
      for (const route of ROUTES.filter((r) => r.role === role)) {
        await browser.send('Page.navigate', { url: BASE + route.p }, sessionId)
        await sleep(1200)
        const { result } = await browser.send(
          'Runtime.evaluate',
          { expression: EVAL, returnByValue: true },
          sessionId
        )
        const r = JSON.parse(result.value)
        checks++
        if (r.sw > r.vw + 1) {
          failures.push({ w, p: route.p })
          const who = r.off
            ? r.off.map((o) => o.tag + '.' + o.cls + ' (' + o.left + '->' + o.right + ', ' + o.w + 'px)').join(' | ')
            : ''
          console.log('x ' + String(w).padStart(4) + 'px ' + route.p + ' -> scrollWidth ' + r.sw + ' > ' + r.vw + (r.url !== route.p ? ' [redir ' + r.url + ']' : ''))
          if (who) console.log('        ' + who)
        }
      }
    }
  }

  console.log('')
  console.log((failures.length === 0 ? 'OK ' : 'KO ') + checks + ' mesures - ' + failures.length + ' debordement(s) horizontal(aux).')
  await browser.send('Target.closeTarget', { targetId })
  browser.close()
  chrome.kill()
  try { rmSync(userDir, { recursive: true, force: true }) } catch {}
  process.exit(failures.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  chrome.kill()
  process.exit(2)
})
