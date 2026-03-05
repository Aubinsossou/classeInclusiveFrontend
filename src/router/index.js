import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '@/views/Login.vue'
import Classe from '@/views/Classe.vue'
import Cours from '@/views/Cours.vue'
import Student from '@/views/Student.vue'
import PreviewCours from '@/views/PreviewCours.vue'
import Quizz from '@/views/Quizz.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },

    {
      path: '/Cours',
      name: 'cours',
      component: Cours,
    },
    
    {
      path: '/PreviewCours',
      name: 'previewcours',
      component: PreviewCours,
    },

    {
      path: '/Quizz',
      name: 'quizz',
      component: Quizz,
    },

    {
      path: '/Student',
      name: 'student',
      component: Student,
    },
  ],
})

export default router
