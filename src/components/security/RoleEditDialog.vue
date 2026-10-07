<template>
  <BioNexusDialog ref="dialog" size="standard" dialog-class="role-edit-dialog" kicker="Editar rol" :title="selectedRole?.name || 'Rol'" @close="handleClosed">
    <form id="role-edit-form" class="role-dialog-form" novalidate @submit.prevent="emit('submit')">
      <BioNexusSectionPanel title="Información del rol" icon="admin_panel_settings" description="Actualiza la identificación y el estado operativo del rol." variant="accent" class="dialog-field-wide">
      <div v-if="updateRoleError" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-error" role="alert">{{ updateRoleError }}</div>
      <div v-if="updateRoleMessage" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-success" role="status">{{ updateRoleMessage }}</div>

      <BioNexusFormField label="Nombre" field-id="edit-role-name" :help="`${updateRoleForm.name.length} de 100 caracteres`" :error="updateRoleNameError" required wide>
        <input id="edit-role-name" v-model.trim="updateRoleForm.name" class="bio-nexus-field" type="text" maxlength="100" autocomplete="off" :disabled="editingRole" :aria-invalid="updateRoleNameError ? 'true' : undefined" :aria-describedby="updateRoleNameError ? 'edit-role-name-error' : 'edit-role-name-help'" required />
      </BioNexusFormField>

      <BioNexusFormField label="Descripción" field-id="edit-role-description" :help="`${updateRoleForm.description.length} de 250 caracteres`" wide>
        <textarea id="edit-role-description" v-model="updateRoleForm.description" class="bio-nexus-field" maxlength="250" rows="4" :disabled="editingRole" aria-describedby="edit-role-description-help"></textarea>
      </BioNexusFormField>

      <div class="dialog-field-wide role-active-option">
        <BioNexusCheckbox v-model="updateRoleForm.isActive" :disabled="editingRole || selectedRole?.code === 'admin'" label="Rol activo" :help="selectedRole?.code === 'admin' ? 'El rol administrador debe permanecer activo.' : 'Los roles desactivados no pueden asignarse a nuevos usuarios.'" />
      </div>
      </BioNexusSectionPanel>
    </form>

    <template #footer>
      <BioNexusActionButton type="button" variant="secondary" icon="cancel" :disabled="editingRole" @click="close">Cancelar</BioNexusActionButton>
      <BioNexusActionButton type="submit" form="role-edit-form" variant="primary" icon="save" :loading="editingRole" :disabled="!canUpdateRoles || !hasRoleMetadataChanges || Boolean(updateRoleNameError)">{{ editingRole ? "Guardando..." : "Guardar" }}</BioNexusActionButton>
    </template>
  </BioNexusDialog>
</template>

<script setup>
import { ref } from "vue";
import BioNexusCheckbox from "@/components/ui/BioNexusCheckbox.vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";

const props = defineProps({ selectedRole: { type: Object, default: null }, updateRoleForm: { type: Object, required: true }, updateRoleNameError: String, updateRoleError: String, updateRoleMessage: String, editingRole: Boolean, canUpdateRoles: Boolean, hasRoleMetadataChanges: Boolean });
const emit = defineEmits(["close", "submit"]);
const dialog = ref(null);
function showModal() { dialog.value?.open(); }
function close() { dialog.value?.close(); }
function focus(options) { dialog.value?.element?.focus(options); }
function handleClosed() { emit("close"); }
defineExpose({ showModal, close, focus });
</script>

<style scoped>
.role-dialog-form { display: grid; grid-template-columns: 1fr; align-content: start; gap: var(--bio-nexus-space-3); }
.dialog-field-wide { grid-column: 1 / -1; }
.role-active-option { display: block; min-width: 0; padding: var(--bio-nexus-space-2) var(--bio-nexus-space-1); }
.role-active-option :deep(.bio-nexus-checkbox) { width: 100%; }
.role-active-option :deep(.bio-nexus-checkbox-copy) { min-width: 0; }
</style>

<style>
dialog.bio-nexus-dialog.role-edit-dialog { width: min(680px, calc(100vw - 32px)) !important; height: auto !important; max-height: calc(100dvh - 48px) !important; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.role-edit-dialog { width: calc(100vw - 16px) !important; } }
</style>
