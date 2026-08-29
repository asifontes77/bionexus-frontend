<template>
  <section class="configuration-module-page">
    <div class="module-summary"><span>{{ visibleSections.length }} secciones</span></div>
    <section class="module-grid" :aria-label="'Secciones de ' + title">
      <component :is="section.routeName && canOpen(section) ? 'router-link' : 'article'" v-for="section in visibleSections" :key="section.title" class="module-card" :class="{ 'module-card-link': section.routeName && canOpen(section), 'module-card-pending': !section.routeName }" :to="section.routeName && canOpen(section) ? { name: section.routeName, query: section.query || {} } : undefined">
        <div class="module-card-icon" aria-hidden="true">{{ initials(section.title) }}</div>
        <div class="module-card-body"><div class="module-card-heading"><h3>{{ section.title }}</h3><span :class="'status-' + section.status">{{ statusLabel(section.status) }}</span></div><p>{{ section.description }}</p></div>
        <span v-if="section.routeName && canOpen(section)" class="module-card-arrow" aria-hidden="true">&#8250;</span>
      </component>
    </section>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthorizationStore } from '@/stores/authorization'
const route = useRoute()
const authorization = useAuthorizationStore()
const title = computed(() => String(route.meta.title || 'Configuración'))
const sections = computed(() => Array.isArray(route.meta.sections) ? route.meta.sections : [])
function canOpen(section) { return !section.permission || authorization.hasPermission(section.permission) }
const visibleSections = computed(() => sections.value.filter(section => !section.permission || canOpen(section)))
function initials(value) { return String(value).split(/s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() }
function statusLabel(status) { return status === 'available' ? 'Disponible' : status === 'last' ? 'Al final' : status === 'future' ? 'Futuro' : 'Pendiente' }
</script>
<style scoped>
.configuration-module-page{display:grid;gap:var(--bio-nexus-space-3);min-width:0}.module-summary{display:flex;justify-content:flex-end;min-height:20px}.module-summary span{padding:3px 8px;border:1px solid var(--bio-nexus-color-border);border-radius:999px;background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-text-muted);font-size:11px;font-weight:700}.module-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3)}.module-card{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:var(--bio-nexus-space-3);min-height:84px;padding:12px 15px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);color:inherit;text-decoration:none;box-shadow:0 3px 10px rgb(34 59 87 / 6%)}.module-card-link{transition:border-color .16s ease,box-shadow .16s ease,transform .16s ease}.module-card-link:hover{transform:translateY(-1px);border-color:var(--bio-nexus-color-primary);box-shadow:0 7px 18px rgb(34 59 87 / 10%)}.module-card-pending{background:color-mix(in srgb,var(--bio-nexus-color-surface-soft) 78%,white)}.module-card-icon{display:grid;place-items:center;width:36px;height:36px;border:1px solid color-mix(in srgb,var(--bio-nexus-color-primary) 18%,transparent);border-radius:9px;background:var(--bio-nexus-color-primary-soft);color:var(--bio-nexus-color-primary);font-size:12px;font-weight:900}.module-card-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}.module-card h3{margin:0;color:var(--bio-nexus-color-text);font-size:15px;line-height:1.2}.module-card p{margin:4px 0 0;color:var(--bio-nexus-color-text-secondary);font-size:12.5px;line-height:1.35}.module-card-heading span{flex:0 0 auto;padding:3px 7px;border-radius:999px;font-size:9px;font-weight:800;letter-spacing:.03em;text-transform:uppercase}.status-available{background:var(--bio-nexus-color-success-soft);color:var(--bio-nexus-color-success)}.status-pending,.status-future,.status-last{background:var(--bio-nexus-color-warning-soft);color:#8a5a00}.module-card-arrow{color:var(--bio-nexus-color-primary);font-size:22px;line-height:1}@media(max-width:820px){.module-grid{grid-template-columns:1fr}}@media(max-width:560px){.module-card{grid-template-columns:auto minmax(0,1fr);min-height:80px;padding:11px}.module-card-arrow{display:none}.module-card-heading{align-items:flex-start;flex-direction:column;gap:5px}}
</style>
