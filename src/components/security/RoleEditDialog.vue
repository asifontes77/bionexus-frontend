<template>
<BioNexusDialog ref="dialog" size="standard" kicker="Editar rol" :title="selectedRole?.name || &quot;Rol&quot;" @close="handleDialogClosed">

        <div class="dialog-body role-dialog-form">
                    <BioNexusFormField
            label="Código"
            field-id="edit-role-code"
            help="El código identifica al rol y no puede modificarse."
            disabled
          >
            <input
              id="edit-role-code"
              :value="selectedRole?.code || ''"
              class="bio-nexus-field"
              type="text"
              aria-disabled="true"
              aria-describedby="edit-role-code-help"
              disabled
            />
          </BioNexusFormField>

                    <BioNexusFormField
            label="Nombre"
            field-id="edit-role-name"
            :error="updateRoleNameError"
            required
          >
            <input
              id="edit-role-name"
              v-model.trim="updateRoleForm.name"
              class="bio-nexus-field"
              type="text"
              maxlength="100"
              :disabled="editingRole"
              :aria-invalid="updateRoleNameError ? 'true' : undefined"
              :aria-describedby="updateRoleNameError ? 'edit-role-name-error' : undefined"
              required
            />
          </BioNexusFormField>

                    <BioNexusFormField
            label="Descripción"
            field-id="edit-role-description"
            :help="`${updateRoleForm.description.length} de 250 caracteres`"
            wide
          >
            <textarea
              id="edit-role-description"
              v-model="updateRoleForm.description"
              class="bio-nexus-field"
              maxlength="250"
              rows="4"
              :disabled="editingRole"
              aria-describedby="edit-role-description-help"
            ></textarea>
          </BioNexusFormField>

          <div class="dialog-field-wide role-active-option">
            <BioNexusCheckbox v-model="updateRoleForm.isActive" :disabled="editingRole || selectedRole?.code === 'admin'" label="Rol activo" :help="selectedRole?.code === 'admin' ? 'El rol administrador debe permanecer activo.' : 'Los roles inactivos no pueden asignarse a nuevos usuarios.'" />
          </div>

          <div v-if="updateRoleError" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-error" role="alert">
            {{ updateRoleError }}
          </div>

          <div v-if="updateRoleMessage" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-success"
            role="status">
            {{ updateRoleMessage }}
          </div>
        </div>

        <template #footer>
          <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="editingRole"
            @click="emit('close')">
  <BioNexusActionIcon action="cancel" />
            Cancelar
          </button>

          <button  class="bio-nexus-action bio-nexus-action-primary" :disabled="editingRole || !canUpdateRoles || !hasRoleMetadataChanges" type="button" @click="emit('submit')">
  <BioNexusActionIcon action="save" />
            {{ editingRole ? "Guardando..." : "Guardar" }}
          </button>
        </template>
  </BioNexusDialog>
</template>

<script setup>
import BioNexusCheckbox from "@/components/ui/BioNexusCheckbox.vue";
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusPermissionTree from "@/components/tree/BioNexusPermissionTree.vue";

const props = defineProps({ selectedRole: { type: Object, default: null }, updateRoleForm: { type: Object, required: true }, updateRoleNameError: String, updateRoleError: String, updateRoleMessage: String, editingRole: Boolean, canUpdateRoles: Boolean, hasRoleMetadataChanges: Boolean });
const emit = defineEmits(["close","submit"]);
const dialog = ref(null);
function showModal() { dialog.value?.open(); }
function close() { dialog.value?.close(); }
function focus(options) { dialog.value?.element?.focus(options); }
function handleDialogClosed() {}
defineExpose({ showModal, close, focus });
</script>

<style scoped>
.dialog-field-wide { grid-column: 1 / -1; }
.role-dialog-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); }
.role-active-option { display: block; min-width: 0; }
.role-active-option :deep(.bio-nexus-checkbox) { width: 100%; }
.role-summary-card { display: grid; gap: var(--bio-nexus-space-4); padding: var(--bio-nexus-space-4); }
.role-summary-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--bio-nexus-space-4); padding-bottom: var(--bio-nexus-space-3); border-bottom: 1px solid var(--bio-nexus-color-border); }
.role-summary-code { color: var(--bio-nexus-color-primary-strong); font-size: var(--bio-nexus-font-size-sm); font-weight: var(--bio-nexus-font-weight-bold); }
.role-summary-description { padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface-soft); }
.role-summary-metadata { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); margin: 0; }
.role-summary-metadata > div { padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); }
.role-summary-metadata dd { margin: var(--bio-nexus-space-1) 0 0; font-weight: var(--bio-nexus-font-weight-bold); }
.permissions-dialog, .catalog-dialog { width: min(980px, calc(100vw - 32px)); max-width: 980px; }
.permissions-dialog-toolbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--bio-nexus-space-3); padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); border-bottom: 1px solid var(--bio-nexus-color-border); background: var(--bio-nexus-color-surface-soft); }
.permissions-dialog-body, .catalog-grid-body { min-height: 0; overflow: auto; }
.role-permission-tree, .catalog-tree { width: 100%; min-width: 0; }
.dialog-pending-status { margin-right: auto; color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); }
@media (max-width: 720px) { .role-dialog-form, .permissions-dialog-toolbar, .role-summary-metadata { grid-template-columns: 1fr; } .role-summary-heading { flex-direction: column; } }


/* Keep Editar rol aligned with the approved Nuevo rol geometry. */
.role-edit-dialog {
  width: min(680px, calc(100vw - 32px));
  min-width: min(680px, calc(100vw - 32px));
}

@media (max-width: 720px) {
  .role-edit-dialog {
    width: calc(100vw - 16px);
    min-width: 0;
  }
}

/* BIO NEXUS ROLE ACTIVE SPACING START */
.role-active-option {
  padding: var(--bio-nexus-space-2) var(--bio-nexus-space-1);
}
.role-active-option :deep(.bio-nexus-checkbox-copy) {
  min-width: 0;
}
/* BIO NEXUS ROLE ACTIVE SPACING END */</style>
