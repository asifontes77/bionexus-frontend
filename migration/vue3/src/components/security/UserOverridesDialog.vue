<template>
  <dialog ref="dialog" class="toro-dialog user-overrides-dialog" tabindex="-1">
    <div class="dialog-shell">
      <header class="dialog-header">
        <div>
          <p>Excepciones individuales</p>
          <h3>Permisos de {{ user?.name || "Usuario" }}</h3>
        </div>
        <ToroDialogCloseButton @click="cancel" />
      </header>
      <div class="dialog-toolbar overrides-toolbar">
        <ToroFormField label="Buscar permiso" field-id="user-permission-search">
          <input id="user-permission-search" v-model="searchText" class="toro-field" type="search" autocomplete="off" placeholder="Módulo, nombre o descripción" />
        </ToroFormField>
        <ToroFormField label="Estado" field-id="user-override-filter">
          <select id="user-override-filter" v-model="statusFilter" class="toro-field">
            <option value="all">Todos</option>
            <option value="inherited">Segun roles</option>
            <option value="allow">Permitir</option>
            <option value="deny">Denegar</option>
          </select>
        </ToroFormField>
        <span><strong>{{ draftOverrides.length }}</strong> excepciones</span>
      </div>
      <div class="dialog-body overrides-dialog-body">
        <div v-if="loading" class="toro-empty-state">Consultando permisos...</div>
        <div v-else-if="errorMessage" class="toro-message toro-message-error" role="alert">{{ errorMessage }}</div>
        <template v-else-if="authorization">
          <details class="override-explanation">
            <summary><span>¿Qué cambia una excepción individual?</span><small>Segun roles conserva la herencia; Permitir concede; Denegar bloquea.</small></summary>
            <div class="override-explanation-body">
              <p>Cada permiso parte del resultado heredado de los roles. Una excepción cambia solamente ese permiso para este usuario.</p>
              <dl>
                <div><dt>Segun roles</dt><dd>Conserva el resultado heredado de los roles asignados.</dd></div>
                <div><dt>Permitir</dt><dd>Concede el permiso directamente, aunque ningún rol activo lo otorgue.</dd></div>
                <div><dt>Denegar</dt><dd>Bloquea el permiso directamente y prevalece sobre los roles.</dd></div>
              </dl>
            </div>
          </details>
          <div v-if="user?.hidden" class="toro-message toro-message-warning" role="status">Los usuarios inactivos permanecen visibles para consulta, pero no pueden modificarse.</div>
          <div v-else-if="!canAssign" class="toro-empty-state">La cuenta actual puede consultar las excepciones, pero no modificarlas.</div>
          <div v-if="inactiveOverrideCount > 0" class="toro-message toro-message-warning" role="status">Las excepciones inactivas se conservan para consulta y se retirarán al guardar.</div>
          <div v-if="filteredModules.length === 0" class="toro-empty-state">No existen permisos que coincidan con los filtros.</div>
          <ToroPermissionTree
            class="user-override-tree"
            :modules="filteredModules"
            :search-text="searchText"
            empty-text="No existen permisos que coincidan con los filtros."
          >
            <template #permission-action="{ permission }">
              <div
                class="override-tree-action"
                :class="{ 'override-tree-action-disabled': !permission.isActive || user?.hidden }"
              >
                <select
                  :value="getEffect(permission.id)"
                  :aria-label="`Excepcion para ${permission.displayName}`"
                  :disabled="!permission.isActive || !canEdit || !canAssign || saving"
                  @change="emit('set-override', permission, $event.target.value)"
                >
                  <option value="">Segun roles</option>
                  <option :value="PermissionEffect.Allow">Permitir</option>
                  <option :value="PermissionEffect.Deny">Denegar</option>
                </select>
                <span class="toro-badge" :class="getBadgeClass(permission.id)">
                  {{ getLabel(permission.id) }}
                </span>
              </div>
            </template>
          </ToroPermissionTree>
          <div v-if="saveError" class="toro-inline-message toro-message-error" role="alert">{{ saveError }}</div>
          <div v-if="saveMessage" class="toro-inline-message toro-message-success" role="status">{{ saveMessage }}</div>
        </template>
      </div>
      <footer class="dialog-footer">
        <span class="dialog-pending-status">{{ hasChanges ? "Existen cambios pendientes." : "Las excepciones están sincronizadas." }}</span>
        <button type="button" class="toro-action toro-action-secondary" :disabled="saving" @click="cancel"><ToroActionIcon action="cancel" />Cancelar</button>
        <button v-if="canAssign" type="button" class="toro-action toro-action-primary" :disabled="!canEdit || !hasChanges || saving" @click="emit('save')"><ToroActionIcon action="assignPermissions" />{{ saving ? "Guardando..." : "Guardar excepciones" }}</button>
      </footer>
    </div>
  </dialog>
</template>
<script setup>
import { computed, ref } from "vue";
import { PermissionEffect } from "@/models/authorization";
import { groupPermissionsForPresentation } from "@/presentation/permissionPresentation";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";
import ToroDialogCloseButton from "@/components/ui/ToroDialogCloseButton.vue";
import ToroFormField from "@/components/ui/ToroFormField.vue";
import ToroPermissionTree from "@/components/tree/ToroPermissionTree.vue";
const props = defineProps({
  user: { type: Object, default: null }, authorization: { type: Object, default: null }, permissions: { type: Array, default: () => [] },
  draftOverrides: { type: Array, default: () => [] }, loading: { type: Boolean, default: false }, errorMessage: { type: String, default: "" },
  saveError: { type: String, default: "" }, saveMessage: { type: String, default: "" }, saving: { type: Boolean, default: false },
  canAssign: { type: Boolean, default: false }, canEdit: { type: Boolean, default: false }, hasChanges: { type: Boolean, default: false },
  inactiveOverrideCount: { type: Number, default: 0 },
});
const emit = defineEmits(["set-override", "cancel", "save"]);
const dialog = ref(null);
const searchText = ref("");
const statusFilter = ref("all");
const modules = computed(() => groupPermissionsForPresentation(props.permissions));
function getEffect(permissionId) { return props.draftOverrides.find((item) => item.permissionId === permissionId)?.effect || ""; }
const filteredModules = computed(() => {
  const search = searchText.value.trim().toLowerCase();
  return modules.value.map((module) => ({ ...module, permissions: module.permissions.filter((permission) => {
    const effect = getEffect(permission.id);
    const matchesEffect = statusFilter.value === "all" || (statusFilter.value === "inherited" && effect === "") || effect === statusFilter.value;
    const matchesSearch = search === "" || [module.label, permission.displayName, permission.displayDescription].some((value) => value.toLowerCase().includes(search));
    return matchesEffect && matchesSearch;
  }) })).filter((module) => module.permissions.length > 0);
});
function getLabel(permissionId) { const effect = getEffect(permissionId); if (effect === PermissionEffect.Allow) return "Permitir"; if (effect === PermissionEffect.Deny) return "Denegar"; return "Según roles"; }
function getBadgeClass(permissionId) { const effect = getEffect(permissionId); if (effect === PermissionEffect.Allow) return "toro-badge-success"; if (effect === PermissionEffect.Deny) return "toro-badge-danger"; return "toro-badge-neutral"; }
function open() { searchText.value = ""; statusFilter.value = "all"; if (!dialog.value || dialog.value.open) return; dialog.value.showModal(); requestAnimationFrame(() => dialog.value?.focus({ preventScroll: true })); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function cancel() { if (props.saving) return; emit("cancel"); searchText.value = ""; statusFilter.value = "all"; close(); }
defineExpose({ open, close });
</script>
<style scoped>
.toro-dialog { width: min(980px, calc(100vw - 32px)); max-width: none; max-height: calc(100vh - 32px); padding: 0; border: 1px solid var(--toro-color-border-strong); border-radius: var(--toro-radius-md); background: var(--toro-color-surface); color: var(--toro-color-text); box-shadow: var(--toro-shadow-md); overflow: hidden; }
.toro-dialog::backdrop { background: color-mix(in srgb, var(--toro-color-sidebar-strong) 48%, transparent); backdrop-filter: blur(2px); }
.dialog-shell { display: flex; flex-direction: column; width: 100%; height: min(760px, calc(100vh - 32px)); max-height: calc(100vh - 32px); overflow: hidden; }
.dialog-header { display: flex; flex: 0 0 auto; align-items: center; justify-content: space-between; gap: var(--toro-space-3); padding: var(--toro-space-3) var(--toro-space-4); border-bottom: 1px solid var(--toro-color-border); background: var(--toro-color-surface); }
.dialog-header p, .dialog-header h3, .override-module-summary h4 { margin: 0; }
.dialog-header p { margin-bottom: var(--toro-space-1); color: var(--toro-color-accent-strong); font-size: var(--toro-font-size-xs); font-weight: var(--toro-font-weight-bold); text-transform: uppercase; letter-spacing: 0.06em; }
.dialog-toolbar { display: grid; grid-template-columns: minmax(280px, 1fr) 180px auto; flex: 0 0 auto; align-items: end; gap: var(--toro-space-3); padding: var(--toro-space-3) var(--toro-space-4); border-bottom: 1px solid var(--toro-color-border); background: var(--toro-color-surface-soft); }
.dialog-toolbar > span { display: inline-flex; align-items: center; align-self: end; gap: var(--toro-space-1); min-height: var(--toro-control-height); color: var(--toro-color-text-muted); white-space: nowrap; }
.dialog-body { flex: 1 1 auto; min-height: 0; padding: var(--toro-space-4); overflow: auto; scrollbar-gutter: stable; }
.overrides-dialog-body { display: grid; align-content: start; gap: var(--toro-space-3); }
.dialog-footer { display: flex; flex: 0 0 auto; align-items: center; justify-content: flex-end; gap: var(--toro-space-2); padding: var(--toro-space-3) var(--toro-space-4); border-top: 1px solid var(--toro-color-border); background: var(--toro-color-surface-soft); }
.dialog-pending-status { margin-right: auto; color: var(--toro-color-text-muted); font-size: var(--toro-font-size-sm); }
.override-explanation { padding: 0; border: 1px solid var(--toro-color-border); border-radius: var(--toro-radius-md); background: var(--toro-color-info-soft); }
.override-explanation > summary { display: flex; align-items: center; gap: var(--toro-space-3); padding: var(--toro-space-3); color: var(--toro-color-primary-strong); font-weight: var(--toro-font-weight-bold); cursor: pointer; list-style: none; }
.override-explanation > summary small { margin-left: auto; color: var(--toro-color-text-muted); font-size: var(--toro-font-size-sm); font-weight: var(--toro-font-weight-regular); }
.override-explanation-body { display: grid; gap: var(--toro-space-2); padding: 0 var(--toro-space-3) var(--toro-space-3); }
.override-explanation-body p, .override-explanation-body dl, .override-explanation-body dd { margin: 0; }
.override-explanation-body p, .override-explanation-body dd { color: var(--toro-color-text-secondary); font-size: var(--toro-font-size-sm); line-height: 1.45; }
.override-explanation-body dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--toro-space-2); }
.override-explanation-body dl > div { padding: var(--toro-space-2); border: 1px solid var(--toro-color-border); border-radius: var(--toro-radius-sm); background: var(--toro-color-surface); }
.override-explanation-body dt { margin-bottom: var(--toro-space-1); color: var(--toro-color-primary-strong); font-size: var(--toro-font-size-sm); font-weight: var(--toro-font-weight-bold); }
.user-override-tree { width: 100%; min-width: 0; max-width: none; }
.override-tree-action { display: grid; grid-template-columns: 170px 100px; align-items: center; gap: var(--toro-space-2); min-width: 282px; }
.override-tree-action-disabled { opacity: 0.68; }
.override-tree-action select { width: 100%; min-height: 34px; padding-inline: var(--toro-space-2); border: 1px solid var(--toro-color-border-strong); border-radius: var(--toro-radius-md); background: var(--toro-color-surface); color: var(--toro-color-text); }
@media (max-width: 720px) { .toro-dialog { width: calc(100vw - 16px); } .dialog-shell { height: calc(100vh - 16px); max-height: calc(100vh - 16px); } .dialog-toolbar, .override-explanation-body dl { grid-template-columns: 1fr; } .override-tree-action { grid-template-columns: 1fr; min-width: 0; width: 100%; } .override-explanation > summary { align-items: flex-start; flex-direction: column; } .override-explanation > summary small { margin-left: 0; } .dialog-footer { flex-wrap: wrap; } .dialog-pending-status { flex-basis: 100%; } }
</style>
