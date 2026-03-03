import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Enseignant from '../views/Enseignant.vue'
import Eleve from '../views/Eleve.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/admin/enseignant',
      name: 'enseignant',
      component: Enseignant,
    },
    {
      path: '/admin/eleve',
      name: 'éleve',
      component: Eleve,
    }
    
  ],
})

export default router
