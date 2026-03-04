import { createRouter, createWebHistory } from 'vue-router'


import Login from '@/views/Login.vue'
import Classe from '@/views/Classe.vue'
import Cours from '@/views/Cours.vue'
import Student from '@/views/Student.vue'

import Enseignant from '../views/Enseignant.vue'
import Eleve from '../views/Eleve.vue'

import HomeView from '../views/admin/adminDashboard.vue'
import MatiereView from '../views/admin/matiere/ajoutMatiere.vue'
import EnseignantDashboard from '../views/enseignant/enseignantDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  //  {
    //  path: '/',
      // name: 'student',
     // component: Student,
   // },

    // {
    //   path: '/login',
    //   name: 'login',
    //   component: Login,
    // },

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
