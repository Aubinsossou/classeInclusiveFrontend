import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '@/views/Login.vue'
import Classe from '@/views/Classe.vue'
import Cours from '@/views/Cours.vue'
import Student from '@/views/Student.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'student',
      component: Student,
    },

    // {
    //   path: '/login',
    //   name: 'login',
    //   component: Login,
    // },
    
  ],
})

export default router
