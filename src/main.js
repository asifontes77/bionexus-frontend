import "@fontsource-variable/material-symbols-rounded/wght.css";
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { installBioNexusGlobalLogging } from './services/bioNexusLogHelper'
import { useAuthorizationStore } from './stores/authorization'
import { useSessionStore } from './stores/session'
import './styles/theme.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import './styles/utilities.css'
import './styles/security-management.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const sessionStore = useSessionStore(pinia)
const authorizationStore = useAuthorizationStore(pinia)

sessionStore.hydrate()

app.use(router)
installBioNexusGlobalLogging(app)
app.mount('#app')

if (sessionStore.isAuthenticated) {
  authorizationStore.loadContext().catch(async () => {
    authorizationStore.clear()
    sessionStore.clear()
    if (router.currentRoute.value.name !== 'login') {
      await router.replace({
        name: 'login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
    }
  })
} else {
  authorizationStore.clear()
}
