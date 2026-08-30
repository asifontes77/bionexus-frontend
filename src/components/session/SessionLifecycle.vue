<template>
  <dialog ref="dialog" class="bio-nexus-dialog session-expiration-dialog" @cancel.prevent>
    <div class="bio-nexus-dialog-shell">
      <header class="bio-nexus-dialog-header">
        <div class="bio-nexus-dialog-heading">
          <p class="bio-nexus-dialog-kicker">Seguridad</p>
          <h2 class="bio-nexus-dialog-title">La sesion esta por vencer</h2>
          <small class="bio-nexus-dialog-subtitle">No se detecto actividad reciente.</small>
        </div>
      </header>
      <div class="bio-nexus-dialog-body session-expiration-body">
        <div class="session-expiration-icon" aria-hidden="true"><BioNexusIcon name="schedule" :size="34" /></div>
        <p>La sesion se cerrara automaticamente en <strong>{{ formattedCountdown }}</strong>.</p>
        <p class="session-expiration-help">Seleccione Continuar para renovar la sesion o Cerrar sesion para salir ahora.</p>
      </div>
      <footer class="bio-nexus-dialog-footer">
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="renewing" @click="closeSession">Cerrar sesion</button>
        <button ref="continueButton" type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="renewing" @click="continueSession">{{ renewing ? 'Renovando...' : 'Continuar' }}</button>
      </footer>
    </div>
  </dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import BioNexusIcon from '@/components/ui/BioNexusIcon.vue'
import { getSessionPolicy, renewSession } from '@/services/authService'
import { connectSessionPolicySocket, disconnectSessionPolicySocket } from '@/services/sessionPolicySocket'
import { connectAuthorizationEventsSocket, disconnectAuthorizationEventsSocket } from '@/services/authorizationEventsSocket'
import { useAuthorizationStore } from '@/stores/authorization'
import { useSessionStore } from '@/stores/session'

const DEFAULT_POLICY = Object.freeze({ sessionTimeoutMinutes: 30, inactivityTimeoutMinutes: 20, countdownSeconds: 120 })
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel']
const MONITOR_INTERVAL_MS = 1000
const RENEW_WINDOW_MS = 60000
const router = useRouter()
const toast = useBioNexusToast()
const session = useSessionStore()
const authorization = useAuthorizationStore()
const dialog = ref(null)
const continueButton = ref(null)
const countdown = ref(0)
const renewing = ref(false)
let policy = { ...DEFAULT_POLICY }
let lastActivityAt = Date.now()
let timer = 0
let renewPromise = null

const formattedCountdown = computed(() => {
  const value = Math.max(0, countdown.value)
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
})

function normalizePolicy(value) {
  const sessionTimeoutMinutes = Number(value?.session_timeout_minutes)
  const inactivityTimeoutMinutes = Number(value?.inactivity_timeout_minutes)
  const countdownSeconds = Number(value?.countdown_seconds)
  const normalized = {
    sessionTimeoutMinutes: Number.isInteger(sessionTimeoutMinutes) && sessionTimeoutMinutes >= 5 ? sessionTimeoutMinutes : DEFAULT_POLICY.sessionTimeoutMinutes,
    inactivityTimeoutMinutes: Number.isInteger(inactivityTimeoutMinutes) && inactivityTimeoutMinutes >= 1 ? inactivityTimeoutMinutes : DEFAULT_POLICY.inactivityTimeoutMinutes,
    countdownSeconds: Number.isInteger(countdownSeconds) && countdownSeconds >= 0 ? countdownSeconds : DEFAULT_POLICY.countdownSeconds
  }
  if ((normalized.inactivityTimeoutMinutes * 60) + normalized.countdownSeconds > normalized.sessionTimeoutMinutes * 60) return { ...DEFAULT_POLICY }
  return normalized
}

function registerActivity() {
  if (!session.isAuthenticated || dialog.value?.open) return
  lastActivityAt = Date.now()
}

async function loadPolicy() {
  try { policy = normalizePolicy(await getSessionPolicy()) } catch { policy = { ...DEFAULT_POLICY } }
}

async function applyAuthorizationUpdate() {
  try {
    await authorization.loadContext({ force: true })
    toast.info('Tus permisos de acceso fueron actualizados. Los cambios ya est\u00e1n activos.')
    const required = Array.isArray(router.currentRoute.value.meta.permissions)
      ? router.currentRoute.value.meta.permissions
      : router.currentRoute.value.meta.permission
        ? [router.currentRoute.value.meta.permission]
        : []
    if (required.length > 0 && !authorization.hasAllPermissions(required)) await router.replace({ name: 'dashboard' })
  } catch {
    authorization.clear()
    await router.replace({ name: 'dashboard' })
  }
}

function applyLocalPolicy(event) {
  policy = normalizePolicy(event?.detail)
  if (policy.countdownSeconds === 0 && dialog.value?.open) dialog.value.close()
  void monitor()
}
function applyRemotePolicy(value) {
  policy = normalizePolicy(value)
  if (policy.countdownSeconds === 0 && dialog.value?.open) dialog.value.close()
  toast.info(
    `La configuraci\u00f3n de seguridad de la sesi\u00f3n fue actualizada. Los nuevos tiempos ya est\u00e1n activos y la sesi\u00f3n se cerrar\u00e1 despu\u00e9s de ${policy.inactivityTimeoutMinutes} ${policy.inactivityTimeoutMinutes === 1 ? 'minuto' : 'minutos'} sin actividad.`
  )
  void monitor()
}
async function performRenewal() {
  if (renewPromise) return renewPromise
  renewPromise = renewSession().then((response) => {
    session.applyRenewal(response)
    return response
  }).finally(() => { renewPromise = null })
  return renewPromise
}

async function expireSession(redirect = true) {
  if (dialog.value?.open) dialog.value.close()
  authorization.clear()
  session.clear()
  if (redirect && router.currentRoute.value.name !== 'login') {
    await router.replace({ name: 'login', query: { reason: 'session-expired' } })
  }
}

async function continueSession() {
  if (renewing.value) return
  renewing.value = true
  try {
    await performRenewal()
    lastActivityAt = Date.now()
    countdown.value = 0
    if (dialog.value?.open) dialog.value.close()
  } catch { await expireSession() }
  finally { renewing.value = false }
}

async function closeSession() { await expireSession() }

async function monitor() {
  if (!session.token) return
  const now = Date.now()
  if (!session.isAuthenticated || (session.expiresAt > 0 && now >= session.expiresAt)) { await expireSession(); return }
  const inactiveSeconds = Math.floor((now - lastActivityAt) / 1000)
  const inactivityLimitSeconds = policy.inactivityTimeoutMinutes * 60
  if (dialog.value?.open) {
    countdown.value = Math.max(0, policy.countdownSeconds - (inactiveSeconds - inactivityLimitSeconds))
    if (countdown.value <= 0) await expireSession()
    return
  }
  if (inactiveSeconds >= inactivityLimitSeconds) {
    if (policy.countdownSeconds === 0) {
      await expireSession()
      return
    }
    countdown.value = policy.countdownSeconds
    dialog.value?.showModal()
    await nextTick()
    continueButton.value?.focus()
    return
  }
  if (session.expiresAt > 0 && session.expiresAt - now <= RENEW_WINDOW_MS) {
    try { await performRenewal() } catch { await expireSession() }
  }
}

function unauthorized() { void expireSession() }
function applyExternalRenewal(event) {
  if (!event?.detail?.token) return
  session.applyRenewal(event.detail)
}

watch(() => session.token, async (token, previousToken) => {
  if (!token) { disconnectSessionPolicySocket(); disconnectAuthorizationEventsSocket(); return }
  if (!previousToken) lastActivityAt = Date.now()
  await loadPolicy()
  connectSessionPolicySocket(token, applyRemotePolicy)
  connectAuthorizationEventsSocket(token, applyAuthorizationUpdate)
})

onMounted(async () => {
  ACTIVITY_EVENTS.forEach((eventName) => globalThis.addEventListener(eventName, registerActivity, { passive: true }))
  globalThis.addEventListener('bio-nexus:unauthorized', unauthorized)
  globalThis.addEventListener('bio-nexus:session-renewed', applyExternalRenewal)
  globalThis.addEventListener('bio-nexus:session-policy-local', applyLocalPolicy)
  if (session.isAuthenticated) { await loadPolicy(); connectSessionPolicySocket(session.token, applyRemotePolicy); connectAuthorizationEventsSocket(session.token, applyAuthorizationUpdate) }
  timer = globalThis.setInterval(monitor, MONITOR_INTERVAL_MS)
})

onBeforeUnmount(() => {
  ACTIVITY_EVENTS.forEach((eventName) => globalThis.removeEventListener(eventName, registerActivity))
  globalThis.removeEventListener('bio-nexus:unauthorized', unauthorized)
  globalThis.removeEventListener('bio-nexus:session-renewed', applyExternalRenewal)
  globalThis.removeEventListener('bio-nexus:session-policy-local', applyLocalPolicy)
  globalThis.clearInterval(timer)
})
</script>

<style scoped>
.session-expiration-dialog{width:min(520px,calc(100vw - 32px));padding:0;border:0;background:transparent}.session-expiration-body{display:grid;justify-items:center;gap:var(--bio-nexus-space-3);text-align:center}.session-expiration-body p{margin:0;line-height:1.5}.session-expiration-icon{display:grid;width:64px;height:64px;place-items:center;border:1px solid var(--bio-nexus-color-accent-border);border-radius:50%;color:var(--bio-nexus-color-accent-strong);background:var(--bio-nexus-color-accent-soft)}.session-expiration-help{color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-sm)}
</style>
