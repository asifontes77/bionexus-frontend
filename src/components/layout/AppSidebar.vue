<template>
  <aside
    id="app-sidebar"
    class="app-sidebar"
    :class="{
      'app-sidebar-open': open,
      'app-sidebar-pinned': pinned
    }"
    aria-label="Navegacion principal"
  >
    <div class="sidebar-brand">
      <div class="sidebar-brand-mark">
        <img :src="bioNexusLogo" alt="" aria-hidden="true" />
      </div>
      <div class="sidebar-brand-content">
        <p class="sidebar-brand-name">{{ BIO_NEXUS_BRAND.name }}</p>
        <p class="sidebar-brand-caption">{{ BIO_NEXUS_BRAND.descriptor }}</p>
      </div>

      <button
        type="button"
        class="sidebar-pin"
        :class="{ 'sidebar-pin-active': pinned }"
        :aria-label="pinned ? 'Liberar menu lateral' : 'Fijar menu lateral'"
        :title="pinned ? 'Liberar menu lateral' : 'Fijar menu lateral'"
        @click="emit('toggle-pin')"
      >
        <span aria-hidden="true">
          {{ pinned ? 'FI' : 'LI' }}
        </span>
      </button>

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
      <p class="sidebar-section-title">Sistema</p>

      <template v-for="item in authorizedNavigation" :key="item.key">
        <router-link
          v-if="item.migrated && item.routeName"
          class="sidebar-link"
          :to="{ name: item.routeName }"
          :title="item.label"
          @click="emit('close')"
        >
          <span class="sidebar-link-icon" aria-hidden="true">
            {{ item.abbreviation }}
          </span>

          <span class="sidebar-link-label">{{ item.label }}</span>
        </router-link>

        <div
          v-else-if="!item.children"
          class="sidebar-link sidebar-link-disabled"
          :title="`${item.label}: pendiente de migracion`"
          aria-disabled="true"
        >
          <span class="sidebar-link-icon" aria-hidden="true">
            {{ item.abbreviation }}
          </span>

          <span class="sidebar-link-label">{{ item.label }}</span>
          <span class="sidebar-pending">Pendiente</span>
        </div>

        <section v-else class="sidebar-group">
          <button
            type="button"
            class="sidebar-group-toggle"
            :title="item.label"
            :aria-expanded="isGroupOpen(item.key)"
            :aria-controls="`sidebar-group-${item.key}`"
            @click="toggleGroup(item.key)"
          >
            <span class="sidebar-link-icon" aria-hidden="true">
              {{ item.abbreviation }}
            </span>

            <span class="sidebar-link-label">{{ item.label }}</span>

            <span class="sidebar-group-count">
              {{ item.children.length }}
            </span>

            <span
              class="sidebar-group-chevron"
              :class="{ 'sidebar-group-chevron-open': isGroupOpen(item.key) }"
              aria-hidden="true"
            >
              &#8250;
            </span>
          </button>

          <div
            v-show="isGroupOpen(item.key)"
            :id="`sidebar-group-${item.key}`"
            class="sidebar-group-items"
          >
            <template v-for="child in item.children" :key="child.key">
              <router-link
                v-if="child.migrated && child.routeName"
                class="sidebar-child-link"
                :to="{ name: child.routeName }"
                @click="emit('close')"
              >
                <span class="sidebar-child-marker" aria-hidden="true"></span>
                <span>{{ child.label }}</span>
              </router-link>

              <div
                v-else
                class="sidebar-child-link sidebar-child-link-disabled"
                :title="`${child.label}: pendiente de migracion`"
                aria-disabled="true"
              >
                <span class="sidebar-child-marker" aria-hidden="true"></span>
                <span>{{ child.label }}</span>
                <span class="sidebar-child-pending">Pendiente</span>
              </div>
            </template>
          </div>
        </section>
      </template>
    </nav>

    <div class="sidebar-footer">
      <span class="sidebar-status-dot" aria-hidden="true"></span>

      <div class="sidebar-footer-content">
        <strong>Vue 3</strong>
        <span>{{ migrationSummary }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import bioNexusLogo from '@/assets/bionexus_logo-only.png'
import { BIO_NEXUS_BRAND } from '@/config/brand'
import { navigationItems } from '@/config/navigation'
import { useAuthorizationStore } from "@/stores/authorization";

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  pinned: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'toggle-pin'])
const openGroups = ref([])
const authorizationStore = useAuthorizationStore();

const userRoles = computed(() => {
  const roles = props.user?.roles

  if (Array.isArray(roles)) {
    return roles
      .filter((role) => typeof role === 'string')
      .map((role) => role.trim().toLowerCase())
      .filter((role) => role !== '')
  }

  if (typeof roles !== 'string') return []

  return roles
    .split(',')
    .map((role) => role.trim().toLowerCase())
    .filter((role) => role !== '')
})

function hasRequiredRole(requiredRoles) {
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) return true

  return requiredRoles.some((requiredRole) =>
    userRoles.value.includes(requiredRole.toLowerCase())
  )
}

function hasRequiredPermissions(requiredPermissions) {
  if (
    !Array.isArray(requiredPermissions) ||
    requiredPermissions.length === 0
  ) {
    return true;
  }

  return authorizationStore.hasAllPermissions(requiredPermissions);
}

function canAccessNavigationItem(item) {
  return (
    hasRequiredRole(item.roles) &&
    hasRequiredPermissions(item.permissions)
  );
}

const authorizedNavigation = computed(() =>
  navigationItems
    .filter((item) => canAccessNavigationItem(item))
    .map((item) => {
      if (!Array.isArray(item.children)) return item;

      return {
        ...item,
        children: item.children.filter((child) =>
          canAccessNavigationItem(child),
        ),
      };
    })
    .filter((item) => !item.children || item.children.length > 0),
);

const migrationSummary = computed(() => {
  const destinations = authorizedNavigation.value.reduce(
    (total, item) => total + (item.children?.length || 1),
    0
  )

  const migrated = authorizedNavigation.value.reduce((total, item) => {
    if (item.children) {
      return total + item.children.filter((child) => child.migrated).length
    }

    return total + (item.migrated ? 1 : 0)
  }, 0)

  return `${migrated} de ${destinations} disponibles`
})

function isGroupOpen(groupKey) {
  return openGroups.value.includes(groupKey)
}

function toggleGroup(groupKey) {
  if (isGroupOpen(groupKey)) {
    openGroups.value = openGroups.value.filter((key) => key !== groupKey)
    return
  }

  openGroups.value = [...openGroups.value, groupKey]
}
</script>
