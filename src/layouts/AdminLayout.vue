<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="admin-brand">
        <strong>Bio Nexus</strong>
        <span>Administración de la plataforma</span>
      </div>

      <div class="admin-session">
        <div class="admin-owner">
          <strong>{{ ownerName }}</strong>
          <span>Propietario de la plataforma</span>
        </div>
        <BioNexusActionButton type="button" variant="secondary" @click="logout">
          Cerrar sesión
        </BioNexusActionButton>
      </div>
    </header>

    <main class="admin-content"><router-view /></main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import { useAdminSessionStore } from '@/stores/adminSession'

const ACTIVITY_EVENTS = ['click', 'keydown', 'pointerdown', 'scroll', 'touchstart']
const CHECK_INTERVAL_MS = 15_000
const RENEW_BEFORE_EXPIRATION_MS = 10 * 60_000
const MINIMUM_RENEW_INTERVAL_MS = 5 * 60_000

const router = useRouter()
const session = useAdminSessionStore()
const ownerName = computed(() => session.user?.name || 'Propietario')
let monitorId = 0
let lastActivityAt = Date.now()
let lastRenewAttemptAt = 0
let renewalPromise = null

function registerActivity() {
  lastActivityAt = Date.now()
}

async function logout() {
  stopSessionMonitor()
  session.clear()
  await router.replace({ name: 'admin-login' })
}

async function renewIfRequired() {
  if (!session.isAuthenticated) {
    await logout()
    return
  }

  const now = Date.now()
  const activeRecently = now - lastActivityAt <= RENEW_BEFORE_EXPIRATION_MS
  const expiresSoon = session.expiresAt > 0 && session.expiresAt - now <= RENEW_BEFORE_EXPIRATION_MS
  const canRenew = now - lastRenewAttemptAt >= MINIMUM_RENEW_INTERVAL_MS
  if (!activeRecently || !expiresSoon || !canRenew || renewalPromise) return

  lastRenewAttemptAt = now
  renewalPromise = session.renew()
  try {
    await renewalPromise
  } catch {
    await logout()
  } finally {
    renewalPromise = null
  }
}

function startSessionMonitor() {
  ACTIVITY_EVENTS.forEach((eventName) =>
    window.addEventListener(eventName, registerActivity, { passive: true })
  )
  monitorId = window.setInterval(renewIfRequired, CHECK_INTERVAL_MS)
}

function stopSessionMonitor() {
  ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, registerActivity))
  if (monitorId) window.clearInterval(monitorId)
  monitorId = 0
}

onMounted(() => {
  session.hydrate()
  if (!session.isAuthenticated) {
    logout()
    return
  }
  startSessionMonitor()
})

onBeforeUnmount(stopSessionMonitor)
</script>

<style scoped>
.admin-layout { min-height: 100vh; background: var(--bio-nexus-color-surface-muted); }
.admin-header { min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 24px; border-bottom: 1px solid var(--bio-nexus-color-border); background: var(--bio-nexus-color-surface); }
.admin-brand, .admin-owner { display: grid; gap: 2px; }
.admin-brand span, .admin-owner span { color: var(--bio-nexus-color-text-muted); font-size: 13px; }
.admin-session { display: flex; align-items: center; gap: 16px; }
.admin-owner { text-align: right; }
.admin-content { padding: 24px; }
@media (max-width: 620px) {
  .admin-header { align-items: flex-start; padding: 12px 16px; }
  .admin-session { align-items: flex-end; flex-direction: column; gap: 8px; }
  .admin-owner { text-align: right; }
  .admin-content { padding: 16px; }
}
</style>
