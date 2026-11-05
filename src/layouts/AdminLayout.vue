<template>
  <div class="admin-layout">
    <header class="admin-header">
      <RouterLink class="admin-brand" :to="{ name: 'admin-dashboard' }" aria-label="Bio Nexus, ir al dashboard">
        <img :src="bioNexusLogo" :alt="BIO_NEXUS_BRAND.logoAlt" />
      </RouterLink>

      <nav class="admin-navigation" aria-label="Navegación de administración">
        <template v-for="item in adminNavigationItems" :key="item.key">
          <RouterLink
            v-if="item.routeName"
            class="admin-navigation-link"
            :to="{ name: item.routeName }"
          >
            {{ item.label }}
          </RouterLink>
          <span v-else class="admin-navigation-link admin-navigation-link-disabled" aria-disabled="true">
            {{ item.label }}
            <small>Próximamente</small>
          </span>
        </template>
      </nav>

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
import bioNexusLogo from '@/assets/bionexus_logo.png'
import { BIO_NEXUS_BRAND } from '@/config/brand'
import { adminNavigationItems } from '@/config/adminNavigation'
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
.admin-header { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 10px 24px; border-bottom: 1px solid var(--bio-nexus-color-border); background: var(--bio-nexus-color-surface); }
.admin-brand { display: flex; flex: 0 0 auto; align-items: center; width: 176px; }
.admin-brand img { display: block; width: 100%; max-height: 54px; object-fit: contain; object-position: left center; }
.admin-navigation { display: flex; flex: 1 1 auto; align-items: center; gap: 4px; min-width: 0; overflow-x: auto; }
.admin-navigation-link { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 7px; min-height: 40px; padding: 0 12px; border-radius: var(--bio-nexus-radius-md); color: var(--bio-nexus-color-text-muted-strong); font-size: 14px; font-weight: 650; text-decoration: none; white-space: nowrap; }
.admin-navigation-link:hover, .admin-navigation-link.router-link-active { color: var(--bio-nexus-color-primary-strong); background: var(--bio-nexus-color-primary-soft); }
.admin-navigation-link:focus-visible { outline: 2px solid var(--bio-nexus-color-primary); outline-offset: 2px; }
.admin-navigation-link-disabled { color: var(--bio-nexus-color-text-muted); cursor: not-allowed; }
.admin-navigation-link-disabled small { padding: 3px 6px; border-radius: 999px; background: var(--bio-nexus-color-surface-muted); font-size: 10px; font-weight: 600; }
.admin-brand, .admin-owner { display: grid; gap: 2px; }
.admin-brand span, .admin-owner span { color: var(--bio-nexus-color-text-muted); font-size: 13px; }
.admin-session { display: flex; align-items: center; gap: 16px; }
.admin-owner { text-align: right; }
.admin-content { width: min(1480px, 100%); box-sizing: border-box; margin: 0 auto; padding: 28px 24px; }
@media (max-width: 960px) {
  .admin-header { flex-wrap: wrap; gap: 10px 20px; padding: 12px 20px; }
  .admin-navigation { order: 3; flex-basis: 100%; }
}
@media (max-width: 620px) {
  .admin-header { align-items: center; padding: 10px 16px; }
  .admin-brand { width: 148px; }
  .admin-brand img { max-height: 46px; }
  .admin-session { align-items: flex-end; flex-direction: column; gap: 8px; }
  .admin-owner { text-align: right; }
  .admin-content { padding: 16px; }
}
</style>
