<template>
  <header class="app-topbar">
    <div class="topbar-leading">
      <button
        type="button"
        class="topbar-menu-button"
        aria-controls="app-sidebar"
        :aria-expanded="sidebarOpen"
        aria-label="Abrir menu principal"
        @click="emit('toggle-sidebar')"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <div>
        <p class="topbar-context">Area autenticada</p>
        <h1>{{ title }}</h1>
      </div>
    </div>

    <div class="topbar-user">
      <div class="topbar-avatar" aria-hidden="true">
        {{ initials }}
      </div>

      <div class="topbar-user-details">
        <strong>{{ displayName }}</strong>
        <span>{{ position }}</span>
      </div>

      <button type="button" class="topbar-logout" @click="emit('logout')">
        Cerrar sesion
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'TORO'
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['logout', 'toggle-sidebar'])

const displayName = computed(() => props.user?.name || 'Usuario TORO')
const position = computed(() => props.user?.position || 'Usuario autenticado')

const initials = computed(() => {
  const words = displayName.value
    .trim()
    .split(/\s+/)
    .filter((word) => word !== '')
    .slice(0, 2)

  const value = words
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()

  return value || 'TU'
})
</script>
