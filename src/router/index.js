import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/admin/adminDashboard.vue'
import MatiereView from '../views/admin/matiere/ajoutMatiere.vue'
import EnseignantDashboard from '../views/enseignant/enseignantDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
       meta: { role: 'ecole' }
    },
    {
      path: '/matiere',
      name: 'matiere',
      component: MatiereView,
       meta: { role: 'ecole' }
    },
     {
      path: '/enseignant/dashboard',
      name: 'enseignantDashboard',
      component: EnseignantDashboard,
       meta: { role: 'enseignant' }
    },
    
  ],
})

export default router
