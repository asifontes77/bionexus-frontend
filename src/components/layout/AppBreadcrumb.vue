<template>
  <nav class="app-breadcrumb" aria-label="Ruta de navegaci\u00f3n">
    <template v-for="(item, index) in items" :key="item.key">
      <span v-if="index" class="app-breadcrumb-separator" aria-hidden="true">/</span>
      <router-link v-if="item.to" class="app-breadcrumb-link" :to="item.to">{{ item.label }}</router-link>
      <span v-else class="app-breadcrumb-current" :aria-current="index === items.length - 1 ? 'page' : undefined">{{ item.label }}</span>
    </template>
  </nav>
</template>
<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const catalogRouteNames = new Set([
  "configuration-exams",
  "configuration-exams-order",
  "configuration-routines",
  "configuration-antibiotics",
  "configuration-germs",
  "configuration-parasiticforms",
  "configuration-sample-types",
  "configuration-worksheet-groups",
  "type-payments",
]);
const routeByLabel = Object.freeze({
  "Bio Nexus": { name: "dashboard" },
  "Cat\u00e1logos": { name: "configuration-catalogs" },
});
const labels = computed(() => {
  const currentName = String(route.name || "");
  if (catalogRouteNames.has(currentName)) {
    return ["Bio Nexus", "Configuraci\u00f3n", "Cat\u00e1logos", String(route.meta?.title || "")].filter(Boolean);
  }
  return ["Bio Nexus", ...(Array.isArray(route.meta?.breadcrumb) ? route.meta.breadcrumb : [])];
});
const items = computed(() => labels.value.map((label, index) => ({
  key: label + "-" + index,
  label,
  to: index === labels.value.length - 1 ? null : routeByLabel[label] || null,
})));
</script>
<style scoped>
.app-breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; min-height: 34px; color: var(--bio-nexus-color-text-secondary); font-family: var(--bio-nexus-font-family, Inter, Roboto, Arial, sans-serif); font-size: 13px; }
.app-breadcrumb-link { color: var(--bio-nexus-color-primary); font-weight: 600; text-decoration: none; }
.app-breadcrumb-link:hover, .app-breadcrumb-link:focus-visible { text-decoration: underline; outline: none; }
.app-breadcrumb-current { color: var(--bio-nexus-color-text-secondary); }
.app-breadcrumb-separator { color: var(--bio-nexus-color-accent); font-weight: 800; }
</style>
