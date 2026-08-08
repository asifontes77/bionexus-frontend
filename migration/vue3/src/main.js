import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthorizationStore } from './stores/authorization'
import { useSessionStore } from './stores/session'
import './styles/theme.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import './styles/utilities.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const sessionStore = useSessionStore(pinia)
const authorizationStore = useAuthorizationStore(pinia)

sessionStore.hydrate()

if (sessionStore.isAuthenticated) {
  try {
    await authorizationStore.loadContext()
  } catch {
    authorizationStore.clear()
  }
} else {
  authorizationStore.clear()
}

app.use(router)
app.mount('#app')
