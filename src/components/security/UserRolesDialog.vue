<template>
  <BioNexusDialog ref="dialog" size="wide" dialog-class="user-roles-dialog" body-class="user-roles-dialog-body" kicker="Asignacion directa" :title="`Roles de ${user?.name || 'Usuario'}`" :prevent-close="saving" @close="handleClosed">
    <template #toolbar>
      <section class="user-roles-toolbar">
        <BioNexusFormField label="Buscar rol" field-id="user-role-search">
          <input id="user-role-search" v-model="searchText" class="bio-nexus-field" type="search" autocomplete="off" placeholder="Codigo, nombre o descripcion" />
        </BioNexusFormField>
        <span><strong>{{ draftRoleIds.length }}</strong> seleccionados</span>
      </section>
    </template>
    <section class="assignment-dialog-body" @wheel.stop>
      <div v-if="loading" class="bio-nexus-empty-state">Consultando roles...</div>
      <div v-else-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
      <template v-else-if="authorization">
        <div v-if="user?.hidden" class="bio-nexus-message bio-nexus-message-warning" role="status">Los usuarios inactivos permanecen visibles para consulta, pero no pueden modificarse.</div>
        <div v-else-if="!canAssign" class="bio-nexus-empty-state">La cuenta actual puede consultar los roles, pero no modificarlos.</div>
        <div v-if="inactiveAssignedCount > 0" class="bio-nexus-message bio-nexus-message-warning" role="status">Los roles inactivos se conservan para consulta y se retiraran al guardar.</div>
        <div v-if="filteredRoles.length === 0" class="bio-nexus-empty-state">No existen roles que coincidan con la busqueda.</div>
        <div v-else class="role-assignment-list">
          <label v-for="role in filteredRoles" :key="role.id" class="role-assignment-option" :class="{ 'role-assignment-option-selected': isSelected(role.id), 'role-assignment-option-disabled': !role.isActive || user?.hidden }">
            <BioNexusCheckbox :checked="isSelected(role.id)" :disabled="!role.isActive || !canEdit || !canAssign || saving" stop-propagation @change="emit('toggle-role', role)" />
            <span class="role-assignment-copy"><strong>{{ role.name }}</strong><small>{{ role.code }} - {{ role.description || "Sin descripcion" }}</small></span>
            <span class="bio-nexus-badge" :class="role.isActive ? 'bio-nexus-badge-success' : 'bio-nexus-badge-warning'">{{ role.isActive ? "Activo" : "Inactivo" }}</span>
          </label>
        </div>
        <div v-if="saveError" class="bio-nexus-inline-message bio-nexus-message-error" role="alert">{{ saveError }}</div>
        <div v-if="saveMessage" class="bio-nexus-inline-message bio-nexus-message-success" role="status">{{ saveMessage }}</div>
      </template>
    </section>
    <template #footer-status><span class="dialog-pending-status">{{ hasChanges ? "Existen cambios pendientes." : "Los roles estan sincronizados." }}</span></template>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="cancel"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button v-if="canAssign" type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="!canEdit || !hasChanges || saving" @click="emit('save')"><BioNexusActionIcon action="assignRoles" />{{ saving ? "Guardando..." : "Guardar roles" }}</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import BioNexusCheckbox from "@/components/ui/BioNexusCheckbox.vue";
import { computed, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
const props = defineProps({ user: { type: Object, default: null }, authorization: { type: Object, default: null }, roles: { type: Array, default: () => [] }, draftRoleIds: { type: Array, default: () => [] }, loading: { type: Boolean, default: false }, errorMessage: { type: String, default: "" }, saveError: { type: String, default: "" }, saveMessage: { type: String, default: "" }, saving: { type: Boolean, default: false }, canAssign: { type: Boolean, default: false }, canEdit: { type: Boolean, default: false }, hasChanges: { type: Boolean, default: false }, inactiveAssignedCount: { type: Number, default: 0 } });
const emit = defineEmits(["toggle-role", "cancel", "save"]);
const dialog = ref(null); const searchText = ref("");
const filteredRoles = computed(() => { const search = searchText.value.trim().toLowerCase(); if (search === "") return props.roles; return props.roles.filter((role) => [role.code, role.name, role.description].filter((value) => typeof value === "string").some((value) => value.toLowerCase().includes(search))); });
function isSelected(roleId) { return props.draftRoleIds.includes(roleId); }
function open() { searchText.value = ""; dialog.value?.open(); }
function close() { dialog.value?.close(); }
function cancel() { if (props.saving) return; emit("cancel"); searchText.value = ""; close(); }
function handleClosed() { searchText.value = ""; }
defineExpose({ open, close });
</script>
<style scoped>
.user-roles-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--bio-nexus-space-4); box-sizing: border-box; width: 100%; padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); }
.user-roles-toolbar > span { display: inline-flex; align-items: center; justify-content: flex-end; gap: var(--bio-nexus-space-1); min-width: 128px; min-height: var(--bio-nexus-control-height); padding-right: var(--bio-nexus-space-2); color: var(--bio-nexus-color-text-muted); white-space: nowrap; }
.assignment-dialog-body { box-sizing: border-box; display: grid; align-content: start; gap: var(--bio-nexus-space-3); width: 100%; min-width: 0; min-height: 0; height: 100%; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.role-assignment-list { display: grid; gap: var(--bio-nexus-space-2); }
.role-assignment-option { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; align-items: center; gap: var(--bio-nexus-space-3); min-height: var(--bio-nexus-table-row-height); padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface); cursor: pointer; }
.role-assignment-option-selected { border-color: var(--bio-nexus-color-primary); background: var(--bio-nexus-color-selection-soft); }
.role-assignment-option-disabled { cursor: default; opacity: .68; }
.role-assignment-option input { width: 18px; height: 18px; margin: 0; accent-color: var(--bio-nexus-color-primary); }
.role-assignment-copy { display: grid; gap: 2px; min-width: 0; }
.role-assignment-copy small { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); }
.dialog-pending-status { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); }
@media (max-width: 720px) { .user-roles-toolbar { grid-template-columns: 1fr; } .role-assignment-option { grid-template-columns: 24px minmax(0, 1fr); } .role-assignment-option > .bio-nexus-badge { grid-column: 2; justify-self: start; } }
</style>
<style>
dialog.bio-nexus-dialog.user-roles-dialog { width: min(700px, calc(100vw - 32px)) !important; height: min(720px, calc(100dvh - 48px)) !important; }
dialog.bio-nexus-dialog.user-roles-dialog > .bio-nexus-dialog-shell > .user-roles-dialog-body { flex: 1 1 0; min-height: 0; overflow: hidden; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.user-roles-dialog { width: calc(100vw - 16px) !important; height: calc(100dvh - 16px) !important; } }
</style>
