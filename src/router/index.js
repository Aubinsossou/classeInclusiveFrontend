import { createRouter, createWebHistory } from 'vue-router'


import EcoleClasse from '@/views/admin/adminClasse.vue'
import Cours from '@/views/enseignant/Cours.vue'
import EnseignantEleve from '@/views/enseignant/Student.vue'
import EcoleRegister from '@/views/admin/EcoleRegister.vue'
import EnseignantCours from '@/views/enseignant/EnseignantCours.vue'
import EnseignantPreviewCours from '@/views/enseignant/EnseignantPreviewCours.vue'
import EnseignantQuizz from '@/views/enseignant/EnseignantQuizz.vue'
import EnseignantStudent from '@/views/enseignant/EnseignantStudent.vue'
import EnseignantLogin from '@/views/enseignant/EnseignantLogin.vue'
import AdminEnseignant from '../views/admin/adminEnseignant.vue'
import AdminEleve from '../views/admin/adminEleve.vue'
import AdminHandicap from '../views/admin/adminHandicap.vue'
import HomeView from '../views/admin/adminDashboard.vue'
import MatiereView from '../views/admin/adminMatiere.vue'
import EnseignantDashboard from '../views/enseignant/enseignantDashboard.vue'
import EcoleLogin from '@/views/admin/EcoleLogin.vue'

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
      path: '/ecole/register',
      name: 'ecoleRegister',
      component: EcoleRegister,
    },
    {
      path: '/ecole/login',
      name: 'ecoleLogin',
      component: EcoleLogin,
    },


    {
      path: '/ecole/handicap',
      name: 'adminHandicap',
      component: AdminHandicap,
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
      path: '/enseignant/login',
      name: 'enseignantlogin',
      component: EnseignantLogin,
    },


    {
      path: '/enseignant/dashboard',
      name: 'enseignantDashboard',
      component: EnseignantDashboard,
      meta: { role: 'enseignant' }
    },
    {
      path: '/enseignant/cours',
      name: 'enseignantcours',
      component: EnseignantCours,
    },
    {
      path: '/enseignant/eleve',
      name: 'EnseignantEleve',
      component: EnseignantEleve,
    },
    {
      path: '/enseignant/previewcours',
      name: 'enseignantpreviewcours',
      component: EnseignantPreviewCours,
    },

    {
      path: '/enseignant/quiz',
      name: 'enseignantquizz',
      component: EnseignantQuizz,
    },

    {
      path: '/enseignant/eleve',
      name: 'enseignantstudent',
      component: EnseignantStudent,
    },


  ],
})

export default router
