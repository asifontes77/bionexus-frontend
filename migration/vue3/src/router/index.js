import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import LoginView from '@/views/LoginView.vue'
import MigrationHomeView from '@/views/MigrationHomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      public: true,
      title: 'Iniciar sesion'
    }
  },
  {
    path: '/',
    name: 'migration-home',
    component: MigrationHomeView,
    meta: {
      requiresAuth: true,
      title: 'TORO Vue 3'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      public: true,
      title: 'TORO 404'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const sessionStore = useSessionStore()

  if (to.meta.requiresAuth && !sessionStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (to.name === 'login' && sessionStore.isAuthenticated) {
    return {
      name: 'migration-home'
    }
  }

  return true
})

router.afterEach((to) => {
  document.title = typeof to.meta.title === 'string'
    ? to.meta.title
    : 'TORO'
})

export default router
