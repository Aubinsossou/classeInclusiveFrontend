/**
 * mediaUrl.js — utilitaire centralisé pour la construction des URL de médias.
 *
 * Problème historique : la vue élève (LessonView.vue) construisait les URLs
 * via un helper local `fullUrl()`, mais la vue enseignant (EnseignantCours.vue)
 * affichait `m.url` tel quel. Si l'API retourne un chemin relatif
 * (ex : "/storage/app/public/..."), le navigateur ne peut pas le résoudre
 * comme URL absolue → le média ne s'affiche pas à la modification.
 *
 * Cette fonction normalise TOUTES les URLs de médias du projet.
 */

/** Base du serveur (hors /api/v1) — ex : http://localhost:8000 */
const BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '')

/**
 * Construit l'URL complète d'un média à partir du chemin retourné par l'API.
 *
 * Règles :
 *  - `null` / `undefined` / `''`  → ''
 *  - URL absolue (http:// ou https://) → retournée telle quelle
 *  - Chemin commençant par '/'   → BASE_URL + chemin
 *  - Chemin relatif (sans '/')    → BASE_URL + '/' + chemin
 *
 * @param {string|null|undefined} path - Chemin retourné par l'API
 * @returns {string} URL complète prête pour <img src>, <video src>, <audio src>
 */
export function getMediaUrl(path) {
  if (!path) return ''
  const p = String(path).trim()
  if (!p) return ''
  // URL déjà absolue
  if (/^https?:\/\//i.test(p)) return p
  // Chemin raciné → préfixe avec la base
  if (p.startsWith('/')) return BASE_URL + p
  // Chemin raciné contenant 'storage' → origin du navigateur (fichiers stockés dans /storage/...)
  if (p.startsWith('/') && p.includes('storage')) {
    const origin = window.location.origin || 'http://localhost:8000'
    return origin.replace(/\$/, '') + p
  }
  // Chemin relatif → préfixe avec la base + '/'
  return BASE_URL + '/' + p
}

/**
 * Récupère le nom de fichier affichable depuis une URL/chemin.
 * Ex : "http://host/storage/app/public/video.mp4" → "video.mp4"
 */
export function mediaFileName(url) {
  if (!url) return ''
  try {
    const withoutQuery = String(url).split('?')[0]
    return withoutQuery.split('/').pop() || ''
  } catch {
    return ''
  }
}
