<template>
  <dialog ref="dialog" class="bio-nexus-dialog user-assignment-dialog" tabindex="-1">
    <div class="dialog-shell">
      <header class="dialog-header">
        <div>
          <p>Asignación directa</p>
          <h3>Roles de {{ user?.name || "Usuario" }}</h3>
        </div>
        <BioNexusDialogCloseButton @click="cancel" />
      </header>

      <div class="dialog-toolbar">
        <BioNexusFormField label="Buscar rol" field-id="user-role-search">
          <input id="user-role-search" v-model="searchText" class="bio-nexus-field" type="search" autocomplete="off" placeholder="Código, nombre o descripción" />
        </BioNexusFormField>
        <span><strong>{{ draftRoleIds.length }}</strong> seleccionados</span>
      </div>

      <div class="dialog-body assignment-dialog-body">
        <div v-if="loading" class="bio-nexus-empty-state">Consultando roles...</div>
        <div v-else-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
        <template v-else-if="authorization">
          <div v-if="user?.hidden" class="bio-nexus-message bio-nexus-message-warning" role="status">
            Los usuarios inactivos permanecen visibles para consulta, pero no pueden modificarse.
          </div>
          <div v-else-if="!canAssign" class="bio-nexus-empty-state">
            La cuenta actual puede consultar los roles, pero no modificarlos.
          </div>
          <div v-if="inactiveAssignedCount > 0" class="bio-nexus-message bio-nexus-message-warning" role="status">
            Los roles inactivos se conservan para consulta y se retirarán al guardar.
          </div>
          <div v-if="filteredRoles.length === 0" class="bio-nexus-empty-state">No existen roles que coincidan con la búsqueda.</div>
          <div v-else class="role-assignment-list">
            <label
              v-for="role in filteredRoles"
              :key="role.id"
              class="role-assignment-option"
              :class="{
                'role-assignment-option-selected': isSelected(role.id),
                'role-assignment-option-disabled': !role.isActive || user?.hidden,
              }"
            >
              <input
                type="checkbox"
                :checked="isSelected(role.id)"
                :disabled="!role.isActive || !canEdit || !canAssign || saving"
                @change="emit('toggle-role', role)"
              />
              <span class="role-assignment-copy">
                <strong>{{ role.name }}</strong>
                <small>{{ role.code }} · {{ role.description || "Sin descripción" }}</small>
              </span>
              <span class="bio-nexus-badge" :class="role.isActive ? 'bio-nexus-badge-success' : 'bio-nexus-badge-warning'">
                {{ role.isActive ? "Activo" : "Inactivo" }}
              </span>
            </label>
          </div>
          <div v-if="saveError" class="bio-nexus-inline-message bio-nexus-message-error" role="alert">{{ saveError }}</div>
          <div v-if="saveMessage" class="bio-nexus-inline-message bio-nexus-message-success" role="status">{{ saveMessage }}</div>
        </template>
      </div>

      <footer class="dialog-footer">
        <span class="dialog-pending-status">{{ hasChanges ? "Existen cambios pendientes." : "Los roles están sincronizados." }}</span>
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="cancel">
          <BioNexusActionIcon action="cancel" />Cancelar
        </button>
        <button v-if="canAssign" type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="!canEdit || !hasChanges || saving" @click="emit('save')">
          <BioNexusActionIcon action="assignRoles" />{{ saving ? "Guardando..." : "Guardar roles" }}
        </button>
      </footer>
    </div>
  </dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";

const props = defineProps({
  user: { type: Object, default: null },
  authorization: { type: Object, default: null },
  roles: { type: Array, default: () => [] },
  draftRoleIds: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
  saveError: { type: String, default: "" },
  saveMessage: { type: String, default: "" },
  saving: { type: Boolean, default: false },
  canAssign: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  hasChanges: { type: Boolean, default: false },
  inactiveAssignedCount: { type: Number, default: 0 },
});
const emit = defineEmits(["toggle-role", "cancel", "save"]);
const dialog = ref(null);
const searchText = ref("");
const filteredRoles = computed(() => {
  const search = searchText.value.trim().toLowerCase();
  if (search === "") return props.roles;
  return props.roles.filter((role) => [role.code, role.name, role.description]
    .filter((value) => typeof value === "string")
    .some((value) => value.toLowerCase().includes(search)));
});
function isSelected(roleId) { return props.draftRoleIds.includes(roleId); }
function open() {
  searchText.value = "";
  if (!dialog.value || dialog.value.open) return;
  dialog.value.showModal();
  requestAnimationFrame(() => dialog.value?.focus({ preventScroll: true }));
}
function close() { if (dialog.value?.open) dialog.value.close(); }
function cancel() {
  if (props.saving) return;
  emit("cancel");
  searchText.value = "";
  close();
}
defineExpose({ open, close });
</script>

<style scoped>
.bio-nexus-dialog { width: min(700px, calc(100vw - 32px)); max-width: none; max-height: calc(100vh - 32px); padding: 0; border: 1px solid var(--bio-nexus-color-border-strong); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface); color: var(--bio-nexus-color-text); box-shadow: var(--bio-nexus-shadow-md); overflow: hidden; }
.bio-nexus-dialog::backdrop { background: color-mix(in srgb, var(--bio-nexus-color-sidebar-strong) 48%, transparent); backdrop-filter: blur(2px); }
.dialog-shell { display: flex; flex-direction: column; width: 100%; height: min(760px, calc(100vh - 32px)); max-height: calc(100vh - 32px); overflow: hidden; }
.dialog-header { display: flex; flex: 0 0 auto; align-items: center; justify-content: space-between; gap: var(--bio-nexus-space-3); padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); border-bottom: 1px solid var(--bio-nexus-color-border); background: var(--bio-nexus-color-surface); }
.dialog-header p, .dialog-header h3 { margin: 0; }
.dialog-header p { margin-bottom: var(--bio-nexus-space-1); color: var(--bio-nexus-color-accent-strong); font-size: var(--bio-nexus-font-size-xs); font-weight: var(--bio-nexus-font-weight-bold); text-transform: uppercase; letter-spacing: 0.06em; }
.dialog-toolbar { display: grid; grid-template-columns: minmax(280px, 1fr) auto; flex: 0 0 auto; align-items: end; gap: var(--bio-nexus-space-3); padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); border-bottom: 1px solid var(--bio-nexus-color-border); background: var(--bio-nexus-color-surface-soft); }
.dialog-toolbar > span { display: inline-flex; align-items: center; align-self: end; gap: var(--bio-nexus-space-1); min-height: var(--bio-nexus-control-height); color: var(--bio-nexus-color-text-muted); white-space: nowrap; }
.dialog-body { flex: 1 1 auto; min-height: 0; padding: var(--bio-nexus-space-4); overflow: auto; scrollbar-gutter: stable; }
.assignment-dialog-body { display: grid; align-content: start; gap: var(--bio-nexus-space-3); }
.dialog-footer { display: flex; flex: 0 0 auto; align-items: center; justify-content: flex-end; gap: var(--bio-nexus-space-2); padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); border-top: 1px solid var(--bio-nexus-color-border); background: var(--bio-nexus-color-surface-soft); }
.dialog-pending-status { margin-right: auto; color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); }
.role-assignment-list { display: grid; gap: var(--bio-nexus-space-2); }
.role-assignment-option { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; align-items: center; gap: var(--bio-nexus-space-3); min-height: var(--bio-nexus-table-row-height); padding: var(--bio-nexus-space-3); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface); cursor: pointer; }
.role-assignment-option-selected { border-color: var(--bio-nexus-color-primary); background: var(--bio-nexus-color-selection-soft); }
.role-assignment-option-disabled { cursor: default; opacity: 0.68; }
.role-assignment-option input { width: 18px; height: 18px; margin: 0; accent-color: var(--bio-nexus-color-primary); }
.role-assignment-copy { display: grid; gap: 2px; min-width: 0; }
.role-assignment-copy small { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); }
@media (max-width: 720px) { .bio-nexus-dialog { width: calc(100vw - 16px); } .dialog-shell { height: calc(100vh - 16px); max-height: calc(100vh - 16px); } .dialog-toolbar { grid-template-columns: 1fr; } .role-assignment-option { grid-template-columns: 24px minmax(0, 1fr); } .role-assignment-option > .bio-nexus-badge { grid-column: 2; justify-self: start; } .dialog-footer { flex-wrap: wrap; } .dialog-pending-status { flex-basis: 100%; } }
</style>
