<template>
<dialog ref="dialog" class="toro-dialog catalog-dialog toro-catalog-layout" tabindex="-1">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div>
            <p>Catálogo global</p>
            <h3>Permisos</h3>
          </div>

          <ToroDialogCloseButton @click="emit('close')" />
        </header>

        <div class="permissions-dialog-toolbar catalog-permissions-toolbar">
          <ToroFormField label="Buscar permiso" field-id="catalog-permission-search">
            <input
              id="catalog-permission-search"
              :value="catalogSearchText"
              class="toro-field"
              type="search"
              autocomplete="off"
              :placeholder="'Nombre, descripci\u00f3n o m\u00f3dulo'"
              @input="emit('update:catalogSearchText', $event.target.value)"
            />
          </ToroFormField>

          <span><strong>{{ filteredCatalogPermissions.length }}</strong> permisos</span>
        </div>

        <div class="dialog-body catalog-grid-body">
          <ToroPermissionTree
            class="catalog-tree" :permissions="filteredCatalogPermissions"
            :search-text="catalogSearchText"
            empty-text="No existen permisos que coincidan con la búsqueda."
          />
        </div>
        <footer class="dialog-footer">
          <button type="button" class="toro-action toro-action-secondary" @click="emit('close')">
  <ToroActionIcon action="close" />
            Cerrar
          </button>
        </footer>
      </div>
    </dialog>
</template>

<script setup>
import { ref } from "vue";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";
import ToroDialogCloseButton from "@/components/ui/ToroDialogCloseButton.vue";
import ToroFormField from "@/components/ui/ToroFormField.vue";
import ToroPermissionTree from "@/components/tree/ToroPermissionTree.vue";

const props = defineProps({ catalogSearchText: String, filteredCatalogPermissions: Array });
const emit = defineEmits(["close","update:catalogSearchText"]);
const dialog = ref(null);
function showModal() { if (!dialog.value?.open) dialog.value?.showModal(); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function focus(options) { dialog.value?.focus(options); }
defineExpose({ showModal, close, focus });
</script>

<style scoped>
.dialog-field-wide { grid-column: 1 / -1; }
.role-dialog-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--toro-space-3); }
.role-active-option { display: grid; grid-template-columns: 24px minmax(0, 1fr); align-items: center; }
.role-active-option input { width: 18px; height: 18px; accent-color: var(--toro-color-primary); }
.role-summary-card { display: grid; gap: var(--toro-space-4); padding: var(--toro-space-4); }
.role-summary-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--toro-space-4); padding-bottom: var(--toro-space-3); border-bottom: 1px solid var(--toro-color-border); }
.role-summary-code { color: var(--toro-color-primary-strong); font-size: var(--toro-font-size-sm); font-weight: var(--toro-font-weight-bold); }
.role-summary-description { padding: var(--toro-space-3); border: 1px solid var(--toro-color-border); border-radius: var(--toro-radius-md); background: var(--toro-color-surface-soft); }
.role-summary-metadata { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--toro-space-3); margin: 0; }
.role-summary-metadata > div { padding: var(--toro-space-3); border: 1px solid var(--toro-color-border); border-radius: var(--toro-radius-md); }
.role-summary-metadata dd { margin: var(--toro-space-1) 0 0; font-weight: var(--toro-font-weight-bold); }
.permissions-dialog, .catalog-dialog { width: min(980px, calc(100vw - 32px)); max-width: 980px; }
.permissions-dialog-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--toro-space-3); padding: var(--toro-space-3) var(--toro-space-4); border-bottom: 1px solid var(--toro-color-border); background: var(--toro-color-surface-soft); }
.permissions-dialog-body, .catalog-grid-body { min-height: 0; overflow: auto; }
.role-permission-tree, .catalog-tree { width: 100%; min-width: 0; }
.dialog-pending-status { margin-right: auto; color: var(--toro-color-text-muted); font-size: var(--toro-font-size-sm); }
@media (max-width: 720px) { .role-dialog-form, .permissions-dialog-toolbar, .role-summary-metadata { grid-template-columns: 1fr; } .role-summary-heading { flex-direction: column; } }
</style>
