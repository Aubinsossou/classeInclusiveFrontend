import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = join(process.cwd(), 'src')
const files = []
;(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p)
    else if (['.vue', '.css'].includes(extname(p))) files.push(p)
  }
})(ROOT)

const checks = [
  {
    name: 'Largeur fixe >= 320px (déborde sous 320px)',
    re: /(?<!max-|min-)\bwidth:\s*(\d{3,4})px/g,
    filter: (m, v) => Number(v) >= 320,
    hint: 'Remplacer par width:100% + max-width, ou min()/flex.',
  },
  {
    name: 'min-width fixe >= 180px',
    re: /min-width:\s*(\d{3,4})px/g,
    filter: (m, v) => Number(v) >= 180,
    hint: 'Utiliser min-width:min(Xpx,100%).',
  },
  {
    name: 'minmax(Xpx,…) sans garde min()',
    re: /minmax\(\s*(\d{3,4})px(?!\s*,?\s*min\()/g,
    filter: () => true,
    hint: 'Utiliser minmax(min(Xpx,100%),…).',
  },
  {
    name: 'Hauteur fixe >= 500px',
    re: /(?<!max-)\bheight:\s*(\d{3,4})px/g,
    filter: (m, v) => Number(v) >= 500,
    hint: 'Utiliser min()/aspect-ratio ou une media query.',
  },
  {
    name: 'Grille à N colonnes fixes sans repli auto',
    re: /grid-template-columns:\s*repeat\((\d+),\s*1fr\)/g,
    filter: () => true,
    hint: 'Vérifier l’existence d’une media query qui passe à 1fr.',
  },
]

let total = 0
for (const c of checks) {
  const hits = []
  for (const f of files) {
    const src = readFileSync(f, 'utf8')
    src.split('\n').forEach((line, i) => {
      if (line.trimStart().startsWith('/*') || line.trimStart().startsWith('*')) return
      for (const m of line.matchAll(c.re)) {
        if (c.filter(m, m[1])) hits.push({ f, i: i + 1, line: line.trim() })
      }
    })
  }
  if (hits.length) {
    console.log(`\n✗ ${c.name} — ${hits.length} occurrence(s)`)
    for (const h of hits) console.log(`   ${h.f.replace(ROOT, 'src')}:${h.i}  ${h.line.slice(0, 120)}`)
    console.log(`   → ${c.hint}`)
    total += hits.length
  } else {
    console.log(`\n✓ ${c.name} — 0 occurrence`)
  }
}
console.log(`\n${total === 0 ? '✔ Aucun pattern à risque détecté.' : `${total} point(s) à examiner.`}`)
