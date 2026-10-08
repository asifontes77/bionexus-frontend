<template>
  <BioNexusDialog ref="dialog" size="wide" dialog-class="permission-catalog-dialog" body-class="permission-catalog-dialog-body" kicker="Catálogo global" title="Permisos" @close="handleClosed">
    <section class="catalog-dialog-body" @wheel.stop>
      <BioNexusSectionPanel class="permission-catalog-panel" title="Catálogo de permisos" icon="catalog" description="Consulta los permisos disponibles organizados por módulo." variant="accent" compact>
        <div class="catalog-permissions-toolbar">
          <BioNexusFormField label="Buscar permiso" field-id="catalog-permission-search"><input id="catalog-permission-search" :value="catalogSearchText" class="bio-nexus-field" type="search" autocomplete="off" placeholder="Nombre, descripción o módulo" @input="emit('update:catalogSearchText', $event.target.value)"></BioNexusFormField>
          <span><strong>{{ catalogPermissionCount }}</strong> permisos</span>
        </div>
        <BioNexusPermissionTree class="catalog-tree" :modules="filteredCatalogModules" :search-text="catalogSearchText" empty-text="No existen permisos que coincidan con la búsqueda." />
      </BioNexusSectionPanel>
    </section>
    <template #footer><BioNexusActionButton type="button" variant="secondary" icon="close" @click="close">Cerrar</BioNexusActionButton></template>
  </BioNexusDialog>
</template>
<script setup>
import { computed, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue"; import BioNexusDialog from "@/components/ui/BioNexusDialog.vue"; import BioNexusFormField from "@/components/ui/BioNexusFormField.vue"; import BioNexusPermissionTree from "@/components/tree/BioNexusPermissionTree.vue"; import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";
const props = defineProps({ catalogSearchText: String, filteredCatalogModules: Array }); const catalogPermissionCount = computed(() => (props.filteredCatalogModules || []).reduce((total, module) => total + (module.permissions?.length || 0), 0)); const emit = defineEmits(["close", "update:catalogSearchText"]); const dialog = ref(null);
function showModal() { dialog.value?.open(); } function close() { dialog.value?.close(); } function focus(options) { dialog.value?.element?.focus(options); } function handleClosed() { emit("close"); } defineExpose({ showModal, close, focus });
</script>
<style scoped>
.catalog-dialog-body { box-sizing: border-box; width: 100%; min-width: 0; min-height: 0; height: 100%; overflow: hidden; }
.permission-catalog-panel { min-width: 0; min-height: 0; height: 100%; margin: 0; }
.permission-catalog-panel :deep(.bio-nexus-section-panel-body) { display: grid; align-content: start; gap: var(--bio-nexus-space-3); min-width: 0; min-height: 0; max-height: 100%; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.catalog-permissions-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--bio-nexus-space-4); }
.catalog-permissions-toolbar > span { display: inline-flex; align-items: center; justify-content: flex-end; gap: var(--bio-nexus-space-1); min-width: 96px; min-height: var(--bio-nexus-control-height); color: var(--bio-nexus-color-text-muted); white-space: nowrap; }
.catalog-tree { width: 100%; min-width: 0; } @media (max-width: 720px) { .catalog-permissions-toolbar { grid-template-columns: 1fr; } }
</style>
<style>
dialog.bio-nexus-dialog.permission-catalog-dialog { width: min(820px, calc(100vw - 32px)) !important; height: min(720px, calc(100dvh - 48px)) !important; }
dialog.bio-nexus-dialog.permission-catalog-dialog > .bio-nexus-dialog-shell > .permission-catalog-dialog-body { flex: 1 1 0; min-height: 0; overflow: hidden; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.permission-catalog-dialog { width: calc(100vw - 16px) !important; height: calc(100dvh - 16px) !important; } }
</style>
