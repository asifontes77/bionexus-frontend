<template>
<dialog ref="dialog" class="bio-nexus-dialog role-dialog role-detail-dialog" tabindex="-1">
      <div class="dialog-shell">
        <header class="dialog-header">
          <div>
            <p>Detalle administrativo</p>
            <h3>{{ selectedRole?.name || "Rol" }}</h3>
          </div>

          <BioNexusDialogCloseButton @click="emit('close')" />
        </header>

        <div v-if="selectedRole" class="dialog-body role-summary-card">
          <div class="role-summary-heading">
            <div>
              <span class="role-summary-code">{{ selectedRole.code }}</span>
              <h4>{{ selectedRole.name }}</h4>
              <p>
                {{ selectedRole.isSystem ? "Rol de sistema" : "Rol configurable" }}
              </p>
            </div>

            <span class="bio-nexus-badge" :class="{
              'bio-nexus-badge-warning': !selectedRole.isActive,
            }">
              {{ selectedRole.isActive ? "Activo" : "Inactivo" }}
            </span>
          </div>

          <section class="role-summary-description">
            <span>Descripción</span>
            <p>{{ selectedRole.description || "Sin descripción" }}</p>
          </section>

          <dl class="role-summary-metadata">
            <div>
              <dt>Identificador</dt>
              <dd>{{ selectedRole.id }}</dd>
            </div>

            <div>
              <dt>Tipo</dt>
              <dd>{{ selectedRole.isSystem ? "Sistema" : "Configurable" }}</dd>
            </div>
          </dl>
        </div>
        <footer class="dialog-footer">
          <button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="emit('close')">
  <BioNexusActionIcon action="close" />
            Cerrar
          </button>
        </footer>
      </div>
    </dialog>
</template>

<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusPermissionTree from "@/components/tree/BioNexusPermissionTree.vue";

const props = defineProps({ selectedRole: { type: Object, default: null } });
const emit = defineEmits(["close"]);
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

.role-detail-dialog { width: min(760px, calc(100vw - 32px)); }
</style>
