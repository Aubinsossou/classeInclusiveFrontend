import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet } from '@/helpers/axiosApi'

/**
 * Convertit une valeur en nombre fini, sinon null.
 * Jamais de NaN : typeof NaN non fini => null.
 */
export function num(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/**
 * Affichage d'un entier/compteur : 0 reste « 0 » ;
 * donnée absente ou invalide => « n/d » (jamais undefined/null/NaN).
 */
export function fmtNum(v) {
  const n = num(v)
  return n === null ? 'n/d' : n.toLocaleString('fr-FR')
}

/**
 * Affichage d'un pourcentage : 0 => « 0 % » ;
 * donnée absente/invalide => « n/d » (jamais « — % » ni NaN).
 */
export function fmtPct(v) {
  const n = num(v)
  if (n === null) return 'n/d'
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`
}

/** Largeur CSS (0-100) pour barres : n'affiche jamais de texte. */
export function barWidth(v) {
  const n = num(v)
  if (n === null) return 0
  return Math.max(0, Math.min(100, n))
}

export function asArray(v) {
  return Array.isArray(v) ? v : []
}

/** Lecture d'un chemin « a.b.c » dans l'objet JSON, sans planter sur null. */
export function resolve(data, path) {
  if (!path) return data
  return String(path).split('.').reduce((o, k) => (o == null ? o : o[k]), data)
}

/**
 * Message d'erreur unifié selon le code HTTP retourné par le backend :
 * 401 session expirée, 403 permission, 422 validation, réseau, sinon message serveur.
 */
export function clientErrorMessage(e) {
  if (!e?.response) return 'Problème réseau : impossible de contacter le serveur.'
  const status = e.response.status
  const serverMsg = typeof e.response.data?.message === 'string' ? e.response.data.message : ''
  if (status === 401) return 'Session expirée. Veuillez vous reconnecter.'
  if (status === 403) return 'Permission insuffisante pour consulter ces données.'
  if (status === 422) {
    const errors = e.response.data?.errors
    if (errors) {
      const first = Object.values(errors)[0]
      const msg = Array.isArray(first) ? first[0] : first
      if (msg) return String(msg)
    }
    return serverMsg || 'Requête invalide (erreur de validation).'
  }
  if (status >= 500) return serverMsg || 'Erreur serveur. Veuillez réessayer plus tard.'
  return serverMsg || 'Une erreur est survenue. Veuillez réessayer.'
}

/**
 * Composable de consommation d'un endpoint de statistiques.
 * Charge `endpoint` (GET + Bearer via apiGet), expose :
 *  - stats   : objet `data` de la réponse, ou null
 *  - loading : booléen
 *  - error   : message unifié (clientErrorMessage), ou ''
 *  - load()  : (re)chargement ; 401 => session nettoyée + redirection login.
 */
export function useClientStats(endpoint) {
  const router = useRouter()
  const stats = ref(null)
  const loading = ref(true)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const res = await apiGet(endpoint)
      const d = res?.data?.data
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        stats.value = d
      } else {
        stats.value = null
        error.value = 'Réponse du serveur invalide.'
      }
    } catch (e) {
      if (e?.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('role')
        router.push('/client/login')
        return
      }
      stats.value = null
      error.value = clientErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, load }
}
