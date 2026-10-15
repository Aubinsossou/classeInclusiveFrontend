
import axios from 'axios';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL + '/api/v1', 
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default api;

// ── Gestion globale du 401 (session expirée / token invalide) ──
// Sans cela, une page qui met `loading = true` avant ses appels reste
// bloquée sur son spinner à vie : le 401 interrompt `onMounted` avant
// `loading = false`. On nettoie la session et on redirige vers le login
// de l'espace courant, quel que soit la page appelante.
const LOGIN_BY_ROLE = {
  ecole: '/ecole/login',
  enseignant: '/enseignant/login',
  eleve: '/eleve/login',
  client: '/client/login',
}
// Pages où une redirection vers un login n'a aucun sens (éviter la boucle).
const AUTH_PATHS = [
  '/ecole/login', '/ecole/register',
  '/enseignant/login',
  '/eleve/login',
  '/client/login', '/client/register',
]

let redirectingToLogin = false

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401 && !redirectingToLogin) {
      const role = (localStorage.getItem('role') || '').trim()
      const target = LOGIN_BY_ROLE[role] || '/'

      // Session invalide : on vide les clés AVANT toute navigation,
      // sinon le garde du routeur laisse passer un token mort.
      localStorage.removeItem('access_token')
      localStorage.removeItem('role')

      redirectingToLogin = true
      try {
        // Import dynamique : évite un cycle statique
        // router → vues → axiosApi → services/axios → router.
        const { default: router } = await import('@/router')
        const current = router.currentRoute.value.path
        if (!AUTH_PATHS.includes(current) && current !== target) {
          await router.push(target)
        }
      } catch (e) {
        // Repli si le routeur n'est pas encore montable.
        if (!AUTH_PATHS.includes(window.location.pathname)) {
          window.location.assign(target)
        }
      } finally {
        redirectingToLogin = false
      }
    }
    return Promise.reject(error)
  }
)