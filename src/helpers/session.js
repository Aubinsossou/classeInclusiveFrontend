// ============================================================
// helpers/session.js — source unique de vérité session/role (frontend)
// Règle : le frontend n'est PAS une barrière de sécurité.
// Le backend doit toujours revérifier auth + rôle + ownership.
// Ce module évite seulement les fuites UX et les confusions de rôle.
// ============================================================

export const ALLOWED_ROLES = ['ecole', 'enseignant', 'eleve', 'client']

export const TOKEN_KEY = 'access_token'
export const ROLE_KEY = 'role'
export const ELEVE_KEY = 'eleve'
// Clés historiques (stores/auth.js) — lues en repli, jamais écrites seules.
export const LEGACY_TOKEN_KEY = 'edu_token'
export const LEGACY_USER_KEY = 'edu_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || ''
}

export function getRole() {
  const r = (localStorage.getItem(ROLE_KEY) || '').trim()
  return ALLOWED_ROLES.includes(r) ? r : ''
}

export function isValidRole(r) {
  return ALLOWED_ROLES.includes(r)
}

export function setSession(token, role) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (isValidRole(role)) localStorage.setItem(ROLE_KEY, role)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(ELEVE_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  localStorage.removeItem(LEGACY_USER_KEY)
}

/** En-tête Authorization — OMIS quand aucun token (jamais « Bearer null »). */
export function authHeader() {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

/**
 * Vérifie qu'une ressource chargée appartient bien à l'utilisateur connecté.
 * @param {object} resource ressource API (ex. cours)
 * @param {(r: object, ctx: object) => boolean} isOwner prédicat métier
 * @param {object} ctx contexte (ex. { userId })
 * @returns {boolean} true si appartenance prouvée côté UI (indicatif uniquement)
 */
export function isOwnedBy(resource, isOwner, ctx = {}) {
  try {
    if (!resource || typeof isOwner !== 'function') return false
    return !!isOwner(resource, ctx)
  } catch {
    return false
  }
}

/** Un id d'URL est-il un entier strictement positif ? (anti-injection / NaN). */
export function isStrictPositiveInt(v) {
  const n = Number(v)
  return Number.isInteger(n) && n > 0
}
