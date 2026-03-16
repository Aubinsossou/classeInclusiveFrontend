import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/css/global.css'
import '@/assets/css/main.css'
// theme.css supprimé — variables CSS gérées dynamiquement par stores/theme.js

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

import('@/stores/theme').then(async ({ useThemeStore }) => {
  const themeStore = useThemeStore()
  themeStore.apply()

  // Init profil élève si token présent
  const { useAuthStore } = await import('@/stores/auth')
  const auth = useAuthStore()
  auth.init()
  // fetchProfile uniquement pour les élèves (edu_token)
  // Les enseignants/écoles ont leur propre token (access_token) géré séparément
  if (auth.token && localStorage.getItem('edu_token')) {
    try { await auth.fetchProfile() } catch (e) {
      // Token invalide ou expiré — session nettoyée dans fetchProfile
    }
  }

  app.mount('#app')
})