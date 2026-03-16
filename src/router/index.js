import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Login.vue'
import EcoleClasse from '@/views/admin/adminClasse.vue'
import Cours from '@/views/enseignant/Cours.vue'
import EnseignantEleve from '@/views/enseignant/Student.vue'
import EcoleRegister from '@/views/admin/EcoleRegister.vue'
import EnseignantCours from '@/views/enseignant/EnseignantCours.vue'
import EnseignantPreviewCours from '@/views/enseignant/EnseignantPreviewCours.vue'
import EnseignantQuizz from '@/views/enseignant/EnseignantQuizz.vue'
import EnseignantLogin from '@/views/enseignant/EnseignantLogin.vue'
import AdminEnseignant from '../views/admin/adminEnseignant.vue'
import AdminEleve from '../views/admin/adminEleve.vue'
import adminDashboard from '../views/admin/adminDashboard.vue'
import MatiereView from '../views/admin/adminMatiere.vue'
import EnseignantDashboard from '../views/enseignant/enseignantDashboard.vue'
import EcoleLogin from '@/views/admin/EcoleLogin.vue'


// ── Imports espace élève ────────────────────────────────
import EleveLogin      from '@/views/eleve/LoginView.vue'
import EleveDashboard  from '@/views/eleve/DashboardView.vue'
import EleveCourses    from '@/views/eleve/CoursesView.vue'
import EleveLesson     from '@/views/eleve/LessonView.vue'
import EleveQuiz       from '@/views/eleve/QuizView.vue'
import EleveResult     from '@/views/eleve/ResultView.vue'
import BlindDashboard  from '@/views/eleve/blind/BlindDashboardView.vue'
import BlindCourses    from '@/views/eleve/blind/BlindCoursesView.vue'
import BlindLesson     from '@/views/eleve/blind/BlindLessonView.vue'
import BlindQuiz       from '@/views/eleve/blind/BlindQuizView.vue'
import { stopVoice }   from '@/composables/useVoiceEngine'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },

    {
      path: '/ecole/register',
      name: 'ecoleRegister',
      component: EcoleRegister,
      meta: { requiresEcoleAuth: false }

    },
    {
      path: '/ecole/dashboard',
      name: 'adminDashboard',
      component: adminDashboard,
      meta: { role: 'ecole',requiresEcoleAuth: true }
    },

    {
      path: '/ecole/login',
      name: 'ecoleLogin',
      component: EcoleLogin,
      meta: { requiresEcoleAuth: false }

    },

    {
      path: '/ecole/enseignant',
      name: 'enseignant',
      component: AdminEnseignant,
      meta: { role: 'ecole', requiresEcoleAuth: true }
    },

    {
      path: '/ecole/matiere',
      name: 'matiere',
      component: MatiereView,
      meta: { role: 'ecole', requiresEcoleAuth: true }
    },

    {
      path: '/ecole/eleve',
      name: 'éleve',
      component: AdminEleve,
      meta: { role: 'ecole', requiresEcoleAuth: true }
    },
    {
      path: '/ecole/classe',
      name: 'ecoleClasse',
      component: EcoleClasse,
      meta: { role: 'ecole', requiresEcoleAuth: true }
    },

    {
      path: '/enseignant/login',
      name: 'enseignantlogin',
      component: EnseignantLogin,
      meta: { requiresEnseignantAuth: false }

    },


    {
      path: '/enseignant/dashboard',
      name: 'enseignantDashboard',
      component: EnseignantDashboard,
      meta: { role: 'enseignant', requiresEnseignantAuth: true }
    },
    {
      path: '/enseignant/cours',
      name: 'enseignantcours',
      component: EnseignantPreviewCours,
      meta: { role: 'enseignant', requiresEnseignantAuth: true }
    },
    {
      path: '/enseignant/cours/form',
      name: 'enseignantcoursform',
      component: EnseignantCours,
      meta: { role: 'enseignant', requiresEnseignantAuth: true }
    },
    {
      path: '/enseignant/cours/form/:id',
      name: 'enseignantcoursformedit',
      component: EnseignantCours,
      meta: { role: 'enseignant', requiresEnseignantAuth: true }
    },
    {
      path: '/enseignant/eleve',
      name: 'EnseignantEleve',
      component: EnseignantEleve,
      meta: { role: 'enseignant', requiresEnseignantAuth: true }
    },

    {
      path: '/enseignant/quiz',
      name: 'enseignantquizz',
      component: EnseignantQuizz,
      meta: { role: 'enseignant', requiresEnseignantAuth: true }

    },

    // {
    //   path: '/enseignant/eleve',
    //   name: 'enseignantstudent',
    //   component: EnseignantStudent,
    //   meta: { role: 'enseignant', requiresEnseignantAuth: true }

    // },



    // ── Espace élève ──────────────────────────────────────
    { path: '/eleve', name: 'EleveLogin', component: EleveLogin },
    { path: '/eleve/dashboard', name: 'Dashboard', component: EleveDashboard, meta: { role: 'eleve', requiresEleveAuth: true } },
    { path: '/eleve/subject/:subjectId/courses', name: 'Courses', component: EleveCourses, meta: { role: 'eleve', requiresEleveAuth: true }, props: true },
    { path: '/eleve/subject/:subjectId/lesson/:lessonId', name: 'Lesson', component: EleveLesson, meta: { role: 'eleve', requiresEleveAuth: true }, props: true },
    { path: '/eleve/subject/:subjectId/lesson/:lessonId/quiz', name: 'Quiz', component: EleveQuiz, meta: { role: 'eleve', requiresEleveAuth: true }, props: true },
    { path: '/eleve/subject/:subjectId/lesson/:lessonId/result', name: 'Result', component: EleveResult, meta: { role: 'eleve', requiresEleveAuth: true }, props: true },
    { path: '/eleve/blind', name: 'BlindDashboard', component: BlindDashboard, meta: { role: 'eleve', requiresEleveAuth: true } },
    { path: '/eleve/blind/subject/:subjectId', name: 'BlindCourses', component: BlindCourses, meta: { role: 'eleve', requiresEleveAuth: true }, props: true },
    { path: '/eleve/blind/subject/:subjectId/lesson/:lessonId', name: 'BlindLesson', component: BlindLesson, meta: { role: 'eleve', requiresEleveAuth: true }, props: true },
    { path: '/eleve/blind/subject/:subjectId/lesson/:lessonId/quiz', name: 'BlindQuiz', component: BlindQuiz, meta: { role: 'eleve', requiresEleveAuth: true }, props: true },

  ],
})
export default router

router.beforeEach((to) => {
  stopVoice()

  // Guard élève
  const eleveToken = localStorage.getItem('edu_token')
  if (to.meta.requiresEleveAuth && !eleveToken) return { name: 'EleveLogin' }

  const token = localStorage.getItem("access_token")
  const role = localStorage.getItem("role")


  if (!token) {

    if (to.meta.requiresEcoleAuth) {
      return { name: "ecoleLogin" }
    }

    if (to.meta.requiresEnseignantAuth) {
      return { name: "enseignantlogin" }
    }
    // if (to.meta.requiresEleveAuth) {
    //   return { name: "eleveLogin" }
    // }

  }

  if (token && (to.name === "ecoleLogin" || to.name === "enseignantlogin" || to.name === "ecoleRegister")) {

    if (role === "ecole") {
      return { name: "adminDashboard" }
    }

    if (role === "enseignant") {
      return { name: "enseignantDashboard" }
    }
    //  if (role === "eleve") {
    //   return { name: "eleveDashboard" }
    // }

  }
  if (to.meta.role && to.meta.role !== role) {

    if (role === "ecole") {
      return { name: "adminDashboard" }
    }

    if (role === "enseignant") {
      return { name: "enseignantDashboard" }
    }
    // if (role === "eleve") {
    //   return { name: "eleveDashboard" }
    // }

  }

})