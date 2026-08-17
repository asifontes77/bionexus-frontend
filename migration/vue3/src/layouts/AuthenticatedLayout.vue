<template>
  <div
    class="authenticated-layout"
    :class="{ 'authenticated-layout-pinned': sidebarPinned }"
  >
    <AppSidebar
      :open="sidebarOpen"
      :pinned="sidebarPinned"
      :user="sessionStore.user"
      @close="closeSidebar"
      @toggle-pin="toggleSidebarPin"
    />

    <button
      v-if="sidebarOpen"
      type="button"
      class="sidebar-backdrop"
      aria-label="Cerrar menu principal"
      @click="closeSidebar"
    ></button>

    <div class="authenticated-main">
      <AppTopbar
        :sidebar-open="sidebarOpen"
        :title="pageTitle"
        :user="sessionStore.user"
        @logout="logout"
        @toggle-sidebar="toggleSidebar"
      />

      <main class="authenticated-content">
        <AppBreadcrumb />

        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useAuthorizationStore } from '@/stores/authorization'
import { useSessionStore } from '@/stores/session'

const SIDEBAR_PIN_STORAGE_KEY = 'bio-nexus.sidebar.pinned'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const authorizationStore = useAuthorizationStore()
const sidebarOpen = ref(false)
const sidebarPinned = ref(readSidebarPinnedPreference())

const pageTitle = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : 'Bio Nexus'
)

watch(
  () => route.fullPath,
  () => {
    closeSidebar()
  }
)

function readSidebarPinnedPreference() {
  try {
    return localStorage.getItem(SIDEBAR_PIN_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function persistSidebarPinnedPreference() {
  try {
    localStorage.setItem(
      SIDEBAR_PIN_STORAGE_KEY,
      sidebarPinned.value.toString()
    )
  } catch {
    return
  }
}

function closeSidebar() {
  sidebarOpen.value = false
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function toggleSidebarPin() {
  sidebarPinned.value = !sidebarPinned.value
  persistSidebarPinnedPreference()
}

async function logout() {
  closeSidebar()
  authorizationStore.clear()
  sessionStore.clear()
  await router.replace({ name: 'login' })
}
</script>
