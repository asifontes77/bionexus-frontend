import Vue from 'vue'
import VueRouter from 'vue-router'
import View404 from '@/views/View404.vue'
import Login from '@/components/Login.vue'
import Home from '@/views/Home.vue'
import settingRouter from '@/router/setting.router'
import movementsRouter from '@/router/movements.router'
import PatientAdmission from '@/router/admission.router'
import PatientHistory from '@/router/history.router'
import PatientApprove from '@/router/approve.router'
import { authGuard } from '@/auth/authGuard'

const SettingLayout = () => import('@/layouts/modules/SettingLayout.vue')
const PatientAdmissionLayout = () => import('@/layouts/modules/PatientAdmissionLayout.vue')
const PatientHistoryLayout = () => import('@/layouts/modules/HistoryLayout.vue')
const PatientApproveLayout = () => import('@/layouts/modules/ApproveLayout.vue')
const MovementsLayout = () => import('@/layouts/modules/MovementsLayout.vue')
Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { layout: 'BlankLayout', title: 'Login'},
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/',
    name: 'home',
    component: Home,
    beforeEnter: authGuard,
    meta: { layout: 'SuiteLayout', title: 'Home', requiresAuth: true}
  },
  {
    path: '/setting',
    component: SettingLayout,
    children: settingRouter,
    beforeEnter: authGuard,
    meta: { layout: 'SuiteLayout', requiresAuth: true}
  },
  {
    path: '/movements',
    component: MovementsLayout,
    children: movementsRouter,
    beforeEnter: authGuard,
    meta: { layout: 'SuiteLayout', requiresAuth: true}
  },
    
  {
    path: '/admission',
    component: PatientAdmissionLayout,
    children: PatientAdmission,
    beforeEnter: authGuard,
    meta: { layout: 'SuiteLayout', requiresAuth: true}
  },  
  {
    path: '/history',
    component: PatientHistoryLayout,
    children: PatientHistory,
    beforeEnter: authGuard,
    meta: { layout: 'SuiteLayout', requiresAuth: true}
  }, 
  {
    path: '/approve',
    component: PatientApproveLayout,
    children: PatientApprove,
    beforeEnter: authGuard,
    meta: { layout: 'SuiteLayout', requiresAuth: true}
  },
  {
    path: '/:invalidRoute',
    name: 'View404',
    component: View404,
    meta: { layout: 'BlankLayout', title: 'TORO 404'},
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})


export default router
