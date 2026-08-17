<template>
<dialog ref="dialog" class="bio-nexus-dialog role-dialog role-create-dialog"  tabindex="-1">
      <form class="dialog-shell" novalidate @submit.prevent="emit('submit')">
        <header class="dialog-header">
          <div>
            <p>Nuevo registro</p>
            <h3>Crear rol</h3>
          </div>

          <BioNexusDialogCloseButton @click="emit('close')" />
        </header>

        <div class="dialog-body role-dialog-form">
                    <BioNexusFormField
            label="Código"
            field-id="create-role-code"
            :error="createRoleCodeError"
            help="Letras minusculas, numeros, puntos, guiones y guiones bajos."
            required
          >
            <input
              id="create-role-code"
              v-model.trim="createRoleForm.code"
              class="bio-nexus-field"
              type="text"
              maxlength="60"
              autocomplete="off"
              placeholder="Ejemplo: supervisor"
              :disabled="creatingRole"
              :aria-invalid="createRoleCodeError ? 'true' : undefined"
              :aria-describedby="
                createRoleCodeError
                  ? 'create-role-code-error'
                  : 'create-role-code-help'
              "
              required
            />
          </BioNexusFormField>

                    <BioNexusFormField
            label="Nombre"
            field-id="create-role-name"
            :error="createRoleNameError"
            required
          >
            <input
              id="create-role-name"
              v-model.trim="createRoleForm.name"
              class="bio-nexus-field"
              type="text"
              maxlength="100"
              autocomplete="off"
              placeholder="Nombre visible del rol"
              :disabled="creatingRole"
              :aria-invalid="createRoleNameError ? 'true' : undefined"
              :aria-describedby="createRoleNameError ? 'create-role-name-error' : undefined"
              required
            />
          </BioNexusFormField>

                    <BioNexusFormField
            label="Descripción"
            field-id="create-role-description"
            :help="`${createRoleForm.description.length} de 250 caracteres`"
            wide
          >
            <textarea
              id="create-role-description"
              v-model="createRoleForm.description"
              class="bio-nexus-field"
              maxlength="250"
              rows="4"
              placeholder="Descripción opcional"
              :disabled="creatingRole"
              aria-describedby="create-role-description-help"
            ></textarea>
          </BioNexusFormField>

          <div v-if="createRoleError" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-error" role="alert">
            {{ createRoleError }}
          </div>

          <div v-if="createRoleMessage" class="dialog-field-wide bio-nexus-inline-message bio-nexus-message-success"
            role="status">
            {{ createRoleMessage }}
          </div>
        </div>

        <footer class="dialog-footer">
          <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="creatingRole"
            @click="emit('close')">
  <BioNexusActionIcon action="cancel" />
            Cancelar
          </button>

          <button type="submit" class="bio-nexus-action bio-nexus-action-primary" :disabled="creatingRole || !canCreateRoles">
  <BioNexusActionIcon action="create" />
            {{ creatingRole ? "Creando..." : "Crear rol" }}
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

const props = defineProps({ creatingRole: Boolean, canCreateRoles: Boolean, createRoleForm: { type: Object, required: true }, createRoleCodeError: String, createRoleNameError: String, createRoleError: String, createRoleMessage: String });
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


/* Stable width with natural height. Validation does not change the dialog width. */
.role-create-dialog {
  width: min(680px, calc(100vw - 32px));
  min-width: min(680px, calc(100vw - 32px));
}

.role-create-dialog .role-dialog-form {
  grid-template-rows: minmax(104px, auto) auto;
}

@media (max-width: 720px) {
  .role-create-dialog {
    width: calc(100vw - 16px);
    min-width: 0;
  }

  .role-create-dialog .role-dialog-form {
    grid-template-rows: none;
  }
}
</style>
