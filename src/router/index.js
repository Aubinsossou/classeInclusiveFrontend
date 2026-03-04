import { createRouter, createWebHistory } from 'vue-router'


import EcoleLogin from '@/views/Login.vue'
import EcoleClasse from '@/views/admin/adminClasse.vue'
import Cours from '@/views/enseignant/Cours.vue'
import EnseignantEleve from '@/views/enseignant/Student.vue'

import AdminEnseignant from '../views/admin/adminEnseignant.vue'
import AdminEleve from '../views/admin/adminEleve.vue'

import HomeView from '../views/admin/adminDashboard.vue'
import MatiereView from '../views/admin/adminMatiere.vue'
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
      path: '/enseignant/eleve',
      name: 'EnseignantEleve',
      component: EnseignantEleve,
    },

    {
      path: '/ecole/login',
      name: 'loginEcole',
      component: EcoleLogin,
      meta: { role: 'ecole' }
    },
     {
      path: '/ecole/enseignant',
      name: 'enseignant',
      component: AdminEnseignant,
      meta: { role: 'ecole' }
    },

    {
      path: '/ecole/matiere',
      name: 'matiere',
      component: MatiereView,
      meta: { role: 'ecole' }
    },

    {
      path: '/ecole/eleve',
      name: 'éleve',
      component: AdminEleve,
      meta: { role: 'ecole' }
    },
 {
      path: '/ecole/classe',
      name: 'ecoleClasse',
      component: EcoleClasse,
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
