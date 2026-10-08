<template>
  <BioNexusDialog ref="dialog" size="standard" dialog-class="role-edit-dialog" shell-class="role-edit-shell" body-class="role-edit-dialog-body" kicker="Editar rol" :title="selectedRole?.name || 'Rol'" :prevent-close="editingRole || hasRoleMetadataChanges" @before-close="requestClose" @close="handleClosed">
    <form id="role-edit-form" class="role-dialog-form" novalidate @submit.prevent="emit('submit')">
            <BioNexusFormErrors :errors="updateRoleError" />
      <div v-if="updateRoleMessage" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-success" role="status">{{ updateRoleMessage }}</div>
      <BioNexusSectionPanel class="role-information-section dialog-field-wide" title="Información del rol" icon="admin_panel_settings" description="Actualiza la identificación y el estado operativo del rol." variant="accent">



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
      <BioNexusActionButton type="button" variant="secondary" icon="cancel" :disabled="editingRole" @click="requestClose">Cancelar</BioNexusActionButton>
      <BioNexusActionButton type="submit" form="role-edit-form" variant="primary" icon="save" :loading="editingRole" :disabled="!canUpdateRoles || !hasRoleMetadataChanges || Boolean(updateRoleNameError)">{{ editingRole ? "Guardando..." : "Guardar" }}</BioNexusActionButton>
    </template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>

<script setup>
import { ref } from "vue";
import BioNexusCheckbox from "@/components/ui/BioNexusCheckbox.vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";

const props = defineProps({ selectedRole: { type: Object, default: null }, updateRoleForm: { type: Object, required: true }, updateRoleNameError: String, updateRoleError: String, updateRoleMessage: String, editingRole: Boolean, canUpdateRoles: Boolean, hasRoleMetadataChanges: Boolean });
const emit = defineEmits(["close", "submit"]);
const dialog = ref(null);
const discardDialog = ref(null);
function showModal() { dialog.value?.open(); }
function close() { dialog.value?.close(); }
async function requestClose() {
  if (props.editingRole) return;
  if (props.hasRoleMetadataChanges) {
    const accepted = await discardDialog.value?.ask({ kicker: "Confirmacion", title: "Descartar cambios", message: "Hay cambios sin guardar. ¿Deseas salir y descartarlos?", icon: "warning", variant: "danger", confirmIcon: "delete", confirmText: "Si, salir y descartar cambios", cancelText: "Continuar editando" });
    if (!accepted) return;
  }
  dialog.value?.close();
}
function focus(options) { dialog.value?.element?.focus(options); }
function handleClosed() { emit("close"); }
defineExpose({ showModal, close, focus });
</script>

<style scoped>
.role-dialog-form { display: grid; grid-template-columns: 1fr; align-content: start; gap: var(--bio-nexus-space-5); min-width: 0; }
.dialog-field-wide { grid-column: 1 / -1; }
.role-information-section { min-width: 0; }
.role-information-section :deep(.bio-nexus-section-panel-body) { display: grid; align-content: start; gap: var(--bio-nexus-space-6); min-width: 0; }
.role-active-option { display: block; min-width: 0; padding: var(--bio-nexus-space-2) var(--bio-nexus-space-1); }
.role-active-option :deep(.bio-nexus-checkbox) { width: 100%; }
.role-active-option :deep(.bio-nexus-checkbox-copy) { min-width: 0; }
</style>

<style>
dialog.bio-nexus-dialog.role-edit-dialog { width: min(680px, calc(100vw - 32px)) !important; height: auto !important; max-height: calc(100dvh - 48px) !important; }
dialog.bio-nexus-dialog.role-edit-dialog > .role-edit-shell { height: auto !important; max-height: calc(100dvh - 48px) !important; }
dialog.bio-nexus-dialog.role-edit-dialog > .role-edit-shell > .role-edit-dialog-body { flex: 0 1 auto !important; min-height: 0; overflow-x: hidden !important; overflow-y: auto !important; overscroll-behavior: contain; scrollbar-gutter: stable; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.role-edit-dialog { width: calc(100vw - 16px) !important; } }
</style>
