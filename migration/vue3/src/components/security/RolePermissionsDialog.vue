<template>
<dialog ref="dialog" class="toro-dialog permissions-dialog" tabindex="-1">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div>
            <p>Asignación de permisos</p>
            <h3>
              {{ selectedRole?.name || "Rol" }}
              <span v-if="selectedRole?.code" class="role-dialog-code">
                ({{ selectedRole.code }})
              </span>
            </h3>
          </div>

          <ToroDialogCloseButton @click="emit('close')" />
        </header>

        <div class="permissions-dialog-toolbar role-permissions-toolbar">
          <ToroFormField label="Buscar permiso" field-id="role-permission-search">
            <input
              id="role-permission-search"
              :value="permissionSearchText"
              class="toro-field"
              type="search"
              autocomplete="off"
              :placeholder="'Nombre, descripci\u00f3n o m\u00f3dulo'"
              @input="emit('update:permissionSearchText', $event.target.value)"
            />
          </ToroFormField>

          <span>
            <strong>{{ draftPermissionIds.length }}</strong> seleccionados
          </span>
        </div>

        <div class="dialog-body permissions-dialog-body">
          <div v-if="assignedPermissionsLoading" class="toro-message" role="status">
            Consultando permisos asignados...
          </div>

          <div v-else-if="assignedPermissionsError" class="toro-message toro-message-error" role="alert">
            {{ assignedPermissionsError }}
          </div>

          <template v-else>
            <div v-if="selectedRole?.code === 'admin'" class="toro-warning">
              El rol administrador debe conservar los permisos esenciales.
            </div>

            <div v-if="inactiveAssignedPermissions.length > 0" class="toro-warning">
              Los permisos inactivos se conservan para consulta y se retiraran al guardar.
            </div>

            <div v-if="filteredPermissionModules.length === 0" class="toro-empty-state">
              No existen permisos que coincidan con la búsqueda.
            </div>

            <ToroPermissionTree
              class="role-permission-tree"
              :modules="filteredPermissionModules"
              :search-text="permissionSearchText"
              :selected-ids="draftPermissionIds"
              selectable
              :disabled="!canAssignPermissions || savingPermissions"
              @toggle-permission="emit('togglePermission', $event)"
              @toggle-module="emit('toggleModulePermissions', $event)"
              empty-text="No existen permisos que coincidan con la búsqueda."
            />

            <div v-if="savePermissionsError" class="toro-inline-message toro-message-error" role="alert">
              {{ savePermissionsError }}
            </div>

            <div v-if="savePermissionsMessage" class="toro-inline-message toro-message-success" role="status">
              {{ savePermissionsMessage }}
            </div>
          </template>
        </div>

        <footer class="dialog-footer">
          <span class="dialog-pending-status">
            {{
              hasPermissionChanges
                ? "Existen cambios pendientes."
                : "Las asignaciones están sincronizadas."
            }}
          </span>

          <button type="button" class="toro-action toro-action-secondary" :disabled="savingPermissions"
            @click="emit('close')">
  <ToroActionIcon action="cancel" />
            Cancelar
          </button>

          <button v-if="canAssignPermissions" type="button" class="toro-action toro-action-primary"
            :disabled="!hasPermissionChanges || savingPermissions" @click="emit('submit')">
  <ToroActionIcon action="assignPermissions" />
            {{ savingPermissions ? "Guardando..." : "Guardar permisos" }}
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

const props = defineProps({ selectedRole: { type: Object, default: null }, permissionSearchText: String, draftPermissionIds: Array, assignedPermissionsLoading: Boolean, assignedPermissionsError: String, inactiveAssignedPermissions: Array, filteredPermissionModules: Array, canAssignPermissions: Boolean, savingPermissions: Boolean, savePermissionsError: String, savePermissionsMessage: String, hasPermissionChanges: Boolean });
const emit = defineEmits(["close","submit","update:permissionSearchText","togglePermission","toggleModulePermissions"]);
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
