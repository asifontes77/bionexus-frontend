<template>
  <BioNexusDialog ref="dialog" size="wide" dialog-class="permission-catalog-dialog" body-class="permission-catalog-dialog-body" kicker="Catalogo global" title="Permisos" @close="handleClosed">
    <template #toolbar>
      <section class="catalog-permissions-toolbar">
        <BioNexusFormField label="Buscar permiso" field-id="catalog-permission-search">
          <input id="catalog-permission-search" :value="catalogSearchText" class="bio-nexus-field" type="search" autocomplete="off" :placeholder="'Nombre, descripci\u00f3n o m\u00f3dulo'" @input="emit('update:catalogSearchText', $event.target.value)" />
        </BioNexusFormField>
        <span><strong>{{ filteredCatalogPermissions.length }}</strong> permisos</span>
      </section>
    </template>
    <section class="catalog-grid-body" @wheel.stop>
      <BioNexusPermissionTree class="catalog-tree" :permissions="filteredCatalogPermissions" :search-text="catalogSearchText" empty-text="No existen permisos que coincidan con la b\u00fasqueda." />
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="close"><BioNexusActionIcon action="close" />Cerrar</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusPermissionTree from "@/components/tree/BioNexusPermissionTree.vue";
const props = defineProps({ catalogSearchText: String, filteredCatalogPermissions: Array });
const emit = defineEmits(["close", "update:catalogSearchText"]);
const dialog = ref(null);
function showModal() { dialog.value?.open(); }
function close() { dialog.value?.close(); }
function focus(options) { dialog.value?.element?.focus(options); }
function handleClosed() { emit("close"); }
defineExpose({ showModal, close, focus });
</script>
<style scoped>
.catalog-permissions-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--bio-nexus-space-4); box-sizing: border-box; width: 100%; padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); }
.catalog-permissions-toolbar > span { display: inline-flex; align-items: center; justify-content: flex-end; gap: var(--bio-nexus-space-1); min-width: 96px; min-height: var(--bio-nexus-control-height); padding-right: var(--bio-nexus-space-1); color: var(--bio-nexus-color-text-muted); white-space: nowrap; }
.catalog-grid-body { box-sizing: border-box; width: 100%; min-width: 0; min-height: 0; height: 100%; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.catalog-tree { width: 100%; min-width: 0; }
@media (max-width: 720px) { .catalog-permissions-toolbar { grid-template-columns: 1fr; } }
</style>
<style>
dialog.bio-nexus-dialog.permission-catalog-dialog { width: min(820px, calc(100vw - 32px)) !important; height: min(720px, calc(100dvh - 48px)) !important; }
dialog.bio-nexus-dialog.permission-catalog-dialog > .bio-nexus-dialog-shell > .permission-catalog-dialog-body { flex: 1 1 0; min-height: 0; overflow: hidden; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.permission-catalog-dialog { width: calc(100vw - 16px) !important; height: calc(100dvh - 16px) !important; } }
</style>
