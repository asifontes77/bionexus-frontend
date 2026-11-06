<template>
  <div class="admin-layout">
    <header class="admin-header">
      <RouterLink class="admin-brand" :to="{ name: 'admin-dashboard' }" aria-label="Bio Nexus, ir al dashboard">
        <img :src="bioNexusLogo" :alt="BIO_NEXUS_BRAND.logoAlt" />
        <span class="admin-brand-context">Administración central</span>
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
        <span class="admin-owner-avatar" aria-hidden="true"><BioNexusIcon name="admin_panel_settings" :size="21" /></span>
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
import BioNexusIcon from '@/components/ui/BioNexusIcon.vue'
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
.admin-layout {
  font-family: var(--bio-nexus-font-family);
  color: var(--bio-nexus-color-text);
  font-family: var(--bio-nexus-font-family);
  color: var(--bio-nexus-color-text);
  min-height: 100vh;
  background:
    linear-gradient(180deg, var(--bio-nexus-color-surface) 0, var(--bio-nexus-color-surface-muted) 150px);
}
.admin-header {
  position: sticky;
  z-index: 20;
  top: 0;
  display: grid;
  grid-template-columns: 188px minmax(360px, 1fr) minmax(300px, 360px);
  align-items: center;
  gap: var(--bio-nexus-space-4);
  min-height: 78px;
  padding: 10px 24px;
  border-bottom: 1px solid var(--bio-nexus-color-border);
  background: color-mix(in srgb, var(--bio-nexus-color-surface) 94%, transparent);
  box-shadow: var(--bio-nexus-shadow-sm);
  backdrop-filter: blur(14px);
}
.admin-header::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--bio-nexus-color-primary), var(--bio-nexus-color-accent));
  content: '';
}
.admin-brand {
  display: grid;
  grid-template-columns: 176px;
  align-items: center;
  gap: 1px;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}
.admin-brand img {
  display: block;
  width: 176px;
  max-height: 48px;
  object-fit: contain;
  object-position: left center;
}
.admin-brand-context {
  padding-left: 3px;
  color: var(--bio-nexus-color-text-muted);
  font-size: var(--bio-nexus-font-size-xs);
  font-weight: var(--bio-nexus-font-weight-semibold);
  letter-spacing: .055em;
  text-transform: uppercase;
}
.admin-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  padding: 4px;
  overflow-x: auto;
  border: 1px solid var(--bio-nexus-color-border);
  border-radius: var(--bio-nexus-radius-lg);
  background: var(--bio-nexus-color-surface-soft);
  scrollbar-width: thin;
}
.admin-navigation-link {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 13px;
  border-radius: var(--bio-nexus-radius-md);
  color: var(--bio-nexus-color-text-muted-strong);
  font-size: var(--bio-nexus-font-size-sm);
  font-weight: var(--bio-nexus-font-weight-semibold);
  text-decoration: none;
  white-space: nowrap;
  transition: background-color .16s ease, color .16s ease, box-shadow .16s ease;
}
.admin-navigation-link:hover {
  color: var(--bio-nexus-color-primary-strong);
  background: var(--bio-nexus-color-surface);
}
.admin-navigation-link.router-link-active {
  color: var(--bio-nexus-color-primary-strong);
  background: var(--bio-nexus-color-surface);
  box-shadow: var(--bio-nexus-shadow-sm);
}
.admin-navigation-link.router-link-active::after {
  position: absolute;
  right: 14px;
  bottom: 3px;
  left: 14px;
  height: 2px;
  border-radius: 999px;
  background: var(--bio-nexus-color-accent);
  content: '';
}
.admin-navigation-link:focus-visible,
.admin-brand:focus-visible {
  outline: 2px solid var(--bio-nexus-color-primary);
  outline-offset: 2px;
}
.admin-navigation-link-disabled {
  color: var(--bio-nexus-color-text-muted);
  cursor: not-allowed;
  opacity: .72;
}
.admin-navigation-link-disabled small {
  padding: 3px 6px;
  border-radius: 999px;
  background: var(--bio-nexus-color-surface-muted);
  font-size: 10px;
  font-weight: var(--bio-nexus-font-weight-semibold);
}
.admin-session {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
  width: 100%;
}
.admin-owner-avatar {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: 50%;
  color: var(--bio-nexus-color-primary-strong);
  background: var(--bio-nexus-color-surface-soft);
  font-size: 21px;
}
.admin-owner {
  display: grid;
  gap: 2px;
  min-width: 0;
  max-width: 190px;
  text-align: right;
}
.admin-owner strong,
.admin-owner span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.admin-owner strong {
  color: var(--bio-nexus-color-text);
  font-size: var(--bio-nexus-font-size-sm);
}
.admin-owner span {
  color: var(--bio-nexus-color-text-muted);
  font-size: var(--bio-nexus-font-size-xs);
}
.admin-content {
  box-sizing: border-box;
  width: min(1480px, 100%);
  margin: 0 auto;
  padding: 28px 24px 40px;
}
@media (max-width: 1100px) {
  .admin-header { grid-template-columns: auto 1fr; gap: 10px 18px; padding: 12px 20px; }
  .admin-navigation { grid-column: 1 / -1; grid-row: 2; justify-content: flex-start; }
  .admin-session { justify-self: end; }
}
@media (max-width: 680px) {
  .admin-header { grid-template-columns: minmax(0, 1fr) auto; padding: 10px 14px; }
  .admin-brand { grid-template-columns: minmax(132px, 158px); }
  .admin-brand img { width: min(158px, 100%); max-height: 42px; }
  .admin-brand-context { display: none; }
  .admin-owner-avatar, .admin-owner { display: none; }
  .admin-session { grid-template-columns: auto; }
  .admin-navigation { margin: 0 -4px; }
  .admin-navigation-link { min-height: 36px; padding: 0 11px; }
  .admin-content { padding: 18px 14px 28px; }
}
</style>
