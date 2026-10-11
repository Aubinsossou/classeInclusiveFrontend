import { describe, it, expect } from 'vitest'
import {
  num,
  fmtNum,
  fmtPct,
  barWidth,
  asArray,
  resolve,
  clientErrorMessage,
} from '@/composables/useClientStats'

describe('helpers statistiques — num()', () => {
  it('accepte les nombres finis et les chaînes numériques', () => {
    expect(num(0)).toBe(0)
    expect(num(42)).toBe(42)
    expect(num('7')).toBe(7)
    expect(num('7.5')).toBe(7.5)
    expect(num(' 10 ')).toBe(10)
  })
  it('refuse tout ce qui n est pas un nombre fini', () => {
    expect(num(NaN)).toBeNull()
    expect(num(Infinity)).toBeNull()
    expect(num(null)).toBeNull()
    expect(num(undefined)).toBeNull()
    expect(num('')).toBeNull()
    expect(num('abc')).toBeNull()
    expect(num({})).toBeNull()
    expect(num([1])).toBeNull()
  })
})

describe('helpers statistiques — fmtNum()', () => {
  it('affiche 0 comme « 0 » (jamais vide)', () => {
    expect(fmtNum(0)).toBe('0')
    expect(fmtNum('0')).toBe('0')
  })
  it('formate les entiers', () => {
    expect(fmtNum(42)).toBe('42')
    expect(fmtNum(1234)).toMatch(/^1.234$/)
  })
  it('retourne « n/d » pour undefined/null/NaN — jamais undefined, null ou NaN affichés', () => {
    for (const v of [undefined, null, NaN, '', 'abc', {}, Infinity]) {
      const out = fmtNum(v)
      expect(out).toBe('n/d')
      expect(out).not.toContain('undefined')
      expect(out).not.toContain('NaN')
      expect(out).not.toContain('null')
    }
  })
})

describe('helpers statistiques — fmtPct()', () => {
  it('affiche 0 % pour 0', () => {
    expect(fmtPct(0)).toMatch(/^0\s?%$/)
    expect(fmtPct(0)).toBe('0 %')
  })
  it('formate les pourcentages réels', () => {
    expect(fmtPct(50)).toBe('50 %')
    expect(fmtPct(50.5)).toMatch(/^50,5\s?%$/)
  })
  it('retourne « n/d » et jamais « — % » pour une valeur invalide', () => {
    for (const v of [undefined, null, NaN, 'x']) {
      const out = fmtPct(v)
      expect(out).toBe('n/d')
      expect(out).not.toContain('—')
      expect(out).not.toContain('%')
      expect(out).not.toContain('NaN')
    }
  })
})

describe('helpers statistiques — barWidth()', () => {
  it('borne entre 0 et 100 et ne renvoie jamais NaN', () => {
    expect(barWidth(50)).toBe(50)
    expect(barWidth(150)).toBe(100)
    expect(barWidth(-3)).toBe(0)
    expect(barWidth(0)).toBe(0)
    expect(barWidth(null)).toBe(0)
    expect(barWidth(undefined)).toBe(0)
    expect(barWidth(NaN)).toBe(0)
  })
})

describe('helpers statistiques — asArray() / resolve()', () => {
  it('asArray ne renvoie que des tableaux', () => {
    expect(asArray([1, 2])).toEqual([1, 2])
    expect(asArray(null)).toEqual([])
    expect(asArray(undefined)).toEqual([])
    expect(asArray({ a: 1 })).toEqual([])
  })
  it('resolve lit les chemins sans planter sur null', () => {
    expect(resolve({ a: { b: 2 } }, 'a.b')).toBe(2)
    expect(resolve({ a: null }, 'a.b')).toBeNull()
    expect(resolve(null, 'a.b')).toBeNull()
    expect(resolve({ a: 1 }, '')).toEqual({ a: 1 })
  })
})

describe('clientErrorMessage()', () => {
  it('401 => session expirée', () => {
    expect(clientErrorMessage({ response: { status: 401 } })).toMatch(/Session expirée/)
  })
  it('403 => permission insuffisante', () => {
    expect(clientErrorMessage({ response: { status: 403 } })).toMatch(/Permission insuffisante/)
  })
  it('422 => message de validation du serveur si présent', () => {
    const e = { response: { status: 422, data: { errors: { ecole_id: ['Le champ ecole_id est invalide.'] } } } }
    expect(clientErrorMessage(e)).toBe('Le champ ecole_id est invalide.')
  })
  it('422 sans errors => message serveur ou générique', () => {
    expect(clientErrorMessage({ response: { status: 422, data: { message: 'Etablissement introuvable (id : 999).' } } }))
      .toBe('Etablissement introuvable (id : 999).')
    expect(clientErrorMessage({ response: { status: 422, data: {} } })).toMatch(/validation/)
  })
  it('absence de réponse => problème réseau', () => {
    expect(clientErrorMessage(new Error('boom'))).toMatch(/réseau/)
    expect(clientErrorMessage({})).toMatch(/réseau/)
  })
  it('500 => message serveur exploitable sinon erreur serveur', () => {
    expect(clientErrorMessage({ response: { status: 500, data: { message: 'Crash SQL.' } } })).toBe('Crash SQL.')
    expect(clientErrorMessage({ response: { status: 500, data: {} } })).toMatch(/Erreur serveur/)
  })
  it('autres codes => message serveur si exploitable', () => {
    expect(clientErrorMessage({ response: { status: 400, data: { message: 'Email inconnu' } } })).toBe('Email inconnu')
    expect(clientErrorMessage({ response: { status: 404, data: {} } })).toMatch(/erreur/i)
  })
})
