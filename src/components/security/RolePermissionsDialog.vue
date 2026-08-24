<template>
  <BioNexusDialog ref="dialog" size="wide" dialog-class="role-permissions-dialog" body-class="role-permissions-dialog-body" kicker="Asignacion de permisos" :title="selectedRole?.name || 'Rol'" @close="handleClosed">
    <template #header-actions>
      <span v-if="selectedRole?.code" class="role-dialog-code">({{ selectedRole.code }})</span>
    </template>
    <template #toolbar>
      <section class="role-permissions-toolbar">
        <BioNexusFormField label="Buscar permiso" field-id="role-permission-search">
          <input id="role-permission-search" :value="permissionSearchText" class="bio-nexus-field" type="search" autocomplete="off" :placeholder="'Nombre, descripci\u00f3n o m\u00f3dulo'" @input="emit('update:permissionSearchText', $event.target.value)" />
        </BioNexusFormField>
        <span><strong>{{ draftPermissionIds.length }}</strong> seleccionados</span>
      </section>
    </template>
    <section class="permissions-dialog-body" @wheel.stop>
      <div v-if="assignedPermissionsLoading" class="bio-nexus-message" role="status">Consultando permisos asignados...</div>
      <div v-else-if="assignedPermissionsError" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ assignedPermissionsError }}</div>
      <template v-else>
        <div v-if="selectedRole?.code === 'admin'" class="bio-nexus-warning">El rol administrador debe conservar los permisos esenciales.</div>
        <div v-if="inactiveAssignedPermissions.length > 0" class="bio-nexus-warning">Los permisos inactivos se conservan para consulta y se retiraran al guardar.</div>
        <div v-if="filteredPermissionModules.length === 0" class="bio-nexus-empty-state">No existen permisos que coincidan con la busqueda.</div>
        <BioNexusPermissionTree class="role-permission-tree" :modules="filteredPermissionModules" :search-text="permissionSearchText" :selected-ids="draftPermissionIds" selectable :disabled="!canAssignPermissions || savingPermissions" @toggle-permission="emit('togglePermission', $event)" @toggle-module="emit('toggleModulePermissions', $event)" empty-text="No existen permisos que coincidan con la busqueda." />
        <div v-if="savePermissionsError" class="bio-nexus-inline-message bio-nexus-message-error" role="alert">{{ savePermissionsError }}</div>
        <div v-if="savePermissionsMessage" class="bio-nexus-inline-message bio-nexus-message-success" role="status">{{ savePermissionsMessage }}</div>
      </template>
    </section>
    <template #footer-status>
      <span class="dialog-pending-status">{{ hasPermissionChanges ? "Existen cambios pendientes." : "Las asignaciones estan sincronizadas." }}</span>
    </template>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="savingPermissions" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button v-if="canAssignPermissions" type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="!hasPermissionChanges || savingPermissions" @click="emit('submit')"><BioNexusActionIcon action="assignPermissions" />{{ savingPermissions ? "Guardando..." : "Guardar permisos" }}</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusPermissionTree from "@/components/tree/BioNexusPermissionTree.vue";
const props = defineProps({ selectedRole: { type: Object, default: null }, permissionSearchText: String, draftPermissionIds: Array, assignedPermissionsLoading: Boolean, assignedPermissionsError: String, inactiveAssignedPermissions: Array, filteredPermissionModules: Array, canAssignPermissions: Boolean, savingPermissions: Boolean, savePermissionsError: String, savePermissionsMessage: String, hasPermissionChanges: Boolean });
const emit = defineEmits(["close", "submit", "update:permissionSearchText", "togglePermission", "toggleModulePermissions"]);
const dialog = ref(null);
function showModal() { dialog.value?.open(); }
function close() { dialog.value?.close(); }
function focus(options) { dialog.value?.element?.focus(options); }
function handleClosed() { emit("close"); }
defineExpose({ showModal, close, focus });
</script>
<style scoped>
.role-dialog-code { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); font-weight: var(--bio-nexus-font-weight-bold); }
.role-permissions-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--bio-nexus-space-4); box-sizing: border-box; width: 100%; padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); }
.role-permissions-toolbar > span { display: inline-flex; align-items: center; justify-content: flex-end; gap: var(--bio-nexus-space-1); min-width: 128px; min-height: var(--bio-nexus-control-height); color: var(--bio-nexus-color-text-muted); white-space: nowrap; }
.permissions-dialog-body { box-sizing: border-box; display: grid; align-content: start; gap: var(--bio-nexus-space-3); width: 100%; min-width: 0; min-height: 0; height: 100%; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.role-permission-tree { width: 100%; min-width: 0; }
.dialog-pending-status { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); }
@media (max-width: 720px) { .role-permissions-toolbar { grid-template-columns: 1fr; } }
</style>
<style>
dialog.bio-nexus-dialog.role-permissions-dialog { width: min(900px, calc(100vw - 32px)) !important; height: min(720px, calc(100dvh - 48px)) !important; }
dialog.bio-nexus-dialog.role-permissions-dialog > .bio-nexus-dialog-shell > .role-permissions-dialog-body { flex: 1 1 0; min-height: 0; overflow: hidden; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.role-permissions-dialog { width: calc(100vw - 16px) !important; height: calc(100dvh - 16px) !important; } }
</style>
