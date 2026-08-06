<template>
  <aside
    id="app-sidebar"
    class="app-sidebar"
    :class="{ 'app-sidebar-open': open }"
    aria-label="Navegacion principal"
  >
    <div class="sidebar-brand">
      <div class="sidebar-brand-mark" aria-hidden="true">T</div>

      <div>
        <p class="sidebar-brand-name">TORO</p>
        <p class="sidebar-brand-caption">Gestion de laboratorio</p>
      </div>

      <button
        type="button"
        class="sidebar-close"
        aria-label="Cerrar menu"
        @click="emit('close')"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <nav class="sidebar-navigation">
      <p class="sidebar-section-title">Principal</p>

      <router-link
        v-for="item in navigationItems"
        :key="item.key"
        class="sidebar-link"
        :to="{ name: item.routeName }"
        @click="emit('close')"
      >
        <span class="sidebar-link-icon" aria-hidden="true">
          {{ item.abbreviation }}
        </span>
        <span>{{ item.label }}</span>
      </router-link>

      <p class="sidebar-section-title sidebar-modules-title">Modulos</p>

      <div
        v-for="item in plannedModules"
        :key="item.key"
        class="sidebar-link sidebar-link-disabled"
        :title="`${item.label}: pendiente de migracion`"
      >
        <span class="sidebar-link-icon" aria-hidden="true">
          {{ item.abbreviation }}
        </span>

        <span>{{ item.label }}</span>
        <span class="sidebar-pending">Proximamente</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <span class="sidebar-status-dot" aria-hidden="true"></span>

      <div>
        <strong>Vue 3</strong>
        <span>Migracion activa</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { navigationItems, plannedModules } from '@/config/navigation'

defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
</script>
