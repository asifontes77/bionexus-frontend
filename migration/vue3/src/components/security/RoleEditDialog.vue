<template>
<dialog ref="dialog" class="bio-nexus-dialog role-dialog role-edit-dialog" tabindex="-1">
      <form class="dialog-shell" novalidate @submit.prevent="emit('submit')">
        <header class="dialog-header">
          <div>
            <p>Editar rol</p>
            <h3>{{ selectedRole?.name || "Rol" }}</h3>
          </div>

          <BioNexusDialogCloseButton @click="emit('close')" />
        </header>

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

          <label class="dialog-field-wide role-active-option bio-nexus-option">
            <input v-model="updateRoleForm.isActive" type="checkbox"
              :disabled="editingRole || selectedRole?.code === 'admin'" />
            <span class="bio-nexus-option-copy">
              <strong>Rol activo</strong>
              <small>
                {{
                  selectedRole?.code === "admin"
                    ? "El rol administrador debe permanecer activo."
                    : "Los roles inactivos no pueden asignarse a nuevos usuarios."
                }}
              </small>
            </span>
          </label>

          <div v-if="updateRoleError" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-error" role="alert">
            {{ updateRoleError }}
          </div>

          <div v-if="updateRoleMessage" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-success"
            role="status">
            {{ updateRoleMessage }}
          </div>
        </div>

        <footer class="dialog-footer">
          <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="editingRole"
            @click="emit('close')">
  <BioNexusActionIcon action="cancel" />
            Cancelar
          </button>

          <button type="submit" class="bio-nexus-action bio-nexus-action-primary" :disabled="editingRole || !canUpdateRoles || !hasRoleMetadataChanges">
  <BioNexusActionIcon action="save" />
            {{ editingRole ? "Guardando..." : "Guardar" }}
          </button>
        </footer>
      </form>
    </dialog>
</template>

<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusPermissionTree from "@/components/tree/BioNexusPermissionTree.vue";

const props = defineProps({ selectedRole: { type: Object, default: null }, updateRoleForm: { type: Object, required: true }, updateRoleNameError: String, updateRoleError: String, updateRoleMessage: String, editingRole: Boolean, canUpdateRoles: Boolean, hasRoleMetadataChanges: Boolean });
const emit = defineEmits(["close","submit"]);
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
</style>
