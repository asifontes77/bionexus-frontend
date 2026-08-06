<template>
  <div class="authenticated-layout">
    <AppSidebar :open="sidebarOpen" @close="closeSidebar" />

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
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const sidebarOpen = ref(false)

const pageTitle = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : 'TORO'
)

watch(
  () => route.fullPath,
  () => {
    closeSidebar()
  }
)

function closeSidebar() {
  sidebarOpen.value = false
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

async function logout() {
  closeSidebar()
  sessionStore.clear()
  await router.replace({ name: 'login' })
}
</script>
