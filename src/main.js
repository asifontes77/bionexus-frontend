import "@/styles/dialogs.css";
import { installBioNexusDialogManager } from "@/services/dialogManager";
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
// ResizeObserver may defer notifications to a later frame. Ignore only the two benign browser messages.
window.addEventListener('error',event=>{
  const message=event?.message||'';
  if(message==='ResizeObserver loop completed with undelivered notifications.'||message==='ResizeObserver loop limit exceeded'){
    event.preventDefault();
    event.stopImmediatePropagation();
  }
},true);


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const sessionStore = useSessionStore(pinia)
const authorizationStore = useAuthorizationStore(pinia)

sessionStore.hydrate()

app.use(router)
installBioNexusGlobalLogging(app)
installBioNexusDialogManager();
app.mount('#app')

if (sessionStore.isAuthenticated) {
  authorizationStore.loadContext().catch(() => {
    authorizationStore.clear()
  })
} else {
  authorizationStore.clear()
}
