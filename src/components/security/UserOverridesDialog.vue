<template>
  <BioNexusDialog ref="dialog" size="wide" dialog-class="user-overrides-dialog" body-class="user-overrides-dialog-body" kicker="Excepciones individuales" :title="`Permisos de ${user?.name || 'Usuario'}`" :prevent-close="saving" @close="handleClosed">
    <template #toolbar>
      <section class="overrides-toolbar">
        <BioNexusFormField label="Buscar permiso" field-id="user-permission-search">
          <input id="user-permission-search" v-model="searchText" class="bio-nexus-field" type="search" autocomplete="off" placeholder="Modulo, nombre o descripcion" />
        </BioNexusFormField>
        <BioNexusFormField label="Estado" field-id="user-override-filter">
          <select id="user-override-filter" v-model="statusFilter" class="bio-nexus-field">
            <option value="all">Todos</option>
            <option value="inherited">Segun roles</option>
            <option value="allow">Permitir</option>
            <option value="deny">Denegar</option>
          </select>
        </BioNexusFormField>
        <span><strong>{{ draftOverrides.length }}</strong> excepciones</span>
      </section>
    </template>
    <section class="overrides-dialog-body" @wheel.stop>
      <div v-if="loading" class="bio-nexus-empty-state">Consultando permisos...</div>
      <div v-else-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
      <template v-else-if="authorization">
        <details class="override-explanation">
          <summary><span>Que cambia una excepcion individual?</span><small>Segun roles conserva la herencia; Permitir concede; Denegar bloquea.</small></summary>
          <div class="override-explanation-body">
            <p>Cada permiso parte del resultado heredado de los roles. Una excepcion cambia solamente ese permiso para este usuario.</p>
            <dl>
              <div><dt>Segun roles</dt><dd>Conserva el resultado heredado de los roles asignados.</dd></div>
              <div><dt>Permitir</dt><dd>Concede el permiso directamente, aunque ningun rol activo lo otorgue.</dd></div>
              <div><dt>Denegar</dt><dd>Bloquea el permiso directamente y prevalece sobre los roles.</dd></div>
            </dl>
          </div>
        </details>
        <div v-if="user?.hidden" class="bio-nexus-message bio-nexus-message-warning" role="status">Los usuarios inactivos permanecen visibles para consulta, pero no pueden modificarse.</div>
        <div v-else-if="!canAssign" class="bio-nexus-empty-state">La cuenta actual puede consultar las excepciones, pero no modificarlas.</div>
        <div v-if="inactiveOverrideCount > 0" class="bio-nexus-message bio-nexus-message-warning" role="status">Las excepciones inactivas se conservan para consulta y se retiraran al guardar.</div>
        <div v-if="filteredModules.length === 0" class="bio-nexus-empty-state">No existen permisos que coincidan con los filtros.</div>
        <BioNexusPermissionTree class="user-override-tree" :modules="filteredModules" :search-text="searchText" empty-text="No existen permisos que coincidan con los filtros.">
          <template #permission-action="{ permission }">
            <div class="override-tree-action" :class="{ 'override-tree-action-disabled': !permission.isActive || user?.hidden }">
              <select :value="getEffect(permission.id)" :aria-label="`Excepcion para ${permission.displayName}`" :disabled="!permission.isActive || !canEdit || !canAssign || saving" @change="emit('set-override', permission, $event.target.value)">
                <option value="">Segun roles</option>
                <option :value="PermissionEffect.Allow">Permitir</option>
                <option :value="PermissionEffect.Deny">Denegar</option>
              </select>
              <span class="bio-nexus-badge" :class="getBadgeClass(permission.id)">{{ getLabel(permission.id) }}</span>
            </div>
          </template>
        </BioNexusPermissionTree>
        <div v-if="saveError" class="bio-nexus-inline-message bio-nexus-message-error" role="alert">{{ saveError }}</div>
        <div v-if="saveMessage" class="bio-nexus-inline-message bio-nexus-message-success" role="status">{{ saveMessage }}</div>
      </template>
    </section>
    <template #footer-status><span class="dialog-pending-status">{{ hasChanges ? "Existen cambios pendientes." : "Las excepciones estan sincronizadas." }}</span></template>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="cancel"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button v-if="canAssign" type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="!canEdit || !hasChanges || saving" @click="emit('save')"><BioNexusActionIcon action="assignPermissions" />{{ saving ? "Guardando..." : "Guardar excepciones" }}</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { computed, ref } from "vue";
import { PermissionEffect } from "@/models/authorization";
import { groupPermissionsForPresentation } from "@/presentation/permissionPresentation";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusPermissionTree from "@/components/tree/BioNexusPermissionTree.vue";
const props = defineProps({ user: { type: Object, default: null }, authorization: { type: Object, default: null }, permissions: { type: Array, default: () => [] }, draftOverrides: { type: Array, default: () => [] }, loading: { type: Boolean, default: false }, errorMessage: { type: String, default: "" }, saveError: { type: String, default: "" }, saveMessage: { type: String, default: "" }, saving: { type: Boolean, default: false }, canAssign: { type: Boolean, default: false }, canEdit: { type: Boolean, default: false }, hasChanges: { type: Boolean, default: false }, inactiveOverrideCount: { type: Number, default: 0 } });
const emit = defineEmits(["set-override", "cancel", "save"]);
const dialog = ref(null); const searchText = ref(""); const statusFilter = ref("all");
const modules = computed(() => groupPermissionsForPresentation(props.permissions));
function getEffect(permissionId) { return props.draftOverrides.find((item) => item.permissionId === permissionId)?.effect || ""; }
const filteredModules = computed(() => { const search = searchText.value.trim().toLowerCase(); return modules.value.map((module) => ({ ...module, permissions: module.permissions.filter((permission) => { const effect = getEffect(permission.id); const matchesEffect = statusFilter.value === "all" || (statusFilter.value === "inherited" && effect === "") || effect === statusFilter.value; const matchesSearch = search === "" || [module.label, permission.displayName, permission.displayDescription].some((value) => value.toLowerCase().includes(search)); return matchesEffect && matchesSearch; }) })).filter((module) => module.permissions.length > 0); });
function getLabel(permissionId) { const effect = getEffect(permissionId); if (effect === PermissionEffect.Allow) return "Permitir"; if (effect === PermissionEffect.Deny) return "Denegar"; return "Segun roles"; }
function getBadgeClass(permissionId) { const effect = getEffect(permissionId); if (effect === PermissionEffect.Allow) return "bio-nexus-badge-success"; if (effect === PermissionEffect.Deny) return "bio-nexus-badge-danger"; return "bio-nexus-badge-neutral"; }
function open() { searchText.value = ""; statusFilter.value = "all"; dialog.value?.open(); }
function close() { dialog.value?.close(); }
function cancel() { if (props.saving) return; emit("cancel"); searchText.value = ""; statusFilter.value = "all"; close(); }
function handleClosed() { searchText.value = ""; statusFilter.value = "all"; }
defineExpose({ open, close });
</script>
<style scoped>
.overrides-toolbar { display: grid; grid-template-columns: minmax(280px, 1fr) 180px auto; align-items: end; gap: var(--bio-nexus-space-3); box-sizing: border-box; width: 100%; padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); }
.overrides-toolbar > span { display: inline-flex; align-items: center; justify-content: flex-end; gap: var(--bio-nexus-space-1); min-width: 132px; min-height: var(--bio-nexus-control-height); padding: 0 var(--bio-nexus-space-2) 0 var(--bio-nexus-space-3); color: var(--bio-nexus-color-text-muted); white-space: nowrap; }
.overrides-dialog-body { box-sizing: border-box; display: grid; align-content: start; gap: var(--bio-nexus-space-3); width: 100%; min-width: 0; min-height: 0; height: 100%; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.override-explanation { padding: 0; border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-info-soft); }
.override-explanation > summary { display: flex; align-items: center; gap: var(--bio-nexus-space-3); padding: var(--bio-nexus-space-3); color: var(--bio-nexus-color-primary-strong); font-weight: var(--bio-nexus-font-weight-bold); cursor: pointer; list-style: none; }
.override-explanation > summary small { margin-left: auto; color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); font-weight: var(--bio-nexus-font-weight-regular); }
.override-explanation-body { display: grid; gap: var(--bio-nexus-space-2); padding: 0 var(--bio-nexus-space-3) var(--bio-nexus-space-3); }
.override-explanation-body p, .override-explanation-body dl, .override-explanation-body dd { margin: 0; }
.override-explanation-body dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--bio-nexus-space-2); }
.override-explanation-body dl > div { padding: var(--bio-nexus-space-2); border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-sm); background: var(--bio-nexus-color-surface); }
.user-override-tree { width: 100%; min-width: 0; }
.override-tree-action { display: grid; grid-template-columns: 170px 100px; align-items: center; gap: var(--bio-nexus-space-2); min-width: 282px; }
.override-tree-action-disabled { opacity: .68; }
.override-tree-action select { width: 100%; min-height: 34px; padding-inline: var(--bio-nexus-space-2); border: 1px solid var(--bio-nexus-color-border-strong); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface); color: var(--bio-nexus-color-text); }
.dialog-pending-status { color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); }
@media (max-width: 720px) { .overrides-toolbar, .override-explanation-body dl { grid-template-columns: 1fr; } .override-tree-action { grid-template-columns: 1fr; min-width: 0; width: 100%; } .override-explanation > summary { align-items: flex-start; flex-direction: column; } .override-explanation > summary small { margin-left: 0; } }

/* BIO NEXUS OVERRIDE EXPLANATION THEME START */
.override-explanation { border-color: var(--bio-nexus-color-border) !important; background: var(--bio-nexus-color-surface-soft) !important; }
.override-explanation > summary { color: var(--bio-nexus-color-primary-strong) !important; font-family: var(--bio-nexus-font-family); font-size: var(--bio-nexus-font-size-md); font-weight: var(--bio-nexus-font-weight-bold); }
.override-explanation > summary small, .override-explanation-body p, .override-explanation-body dd { color: var(--bio-nexus-color-text-secondary) !important; font-family: var(--bio-nexus-font-family); font-size: var(--bio-nexus-font-size-sm); font-weight: var(--bio-nexus-font-weight-regular); line-height: 1.45; }
.override-explanation-body dl > div { border-color: var(--bio-nexus-color-border) !important; background: var(--bio-nexus-color-surface) !important; box-shadow: none !important; }
.override-explanation-body dt { margin-bottom: var(--bio-nexus-space-1); color: var(--bio-nexus-color-primary-strong); font-family: var(--bio-nexus-font-family); font-size: var(--bio-nexus-font-size-sm); font-weight: var(--bio-nexus-font-weight-bold); }
/* BIO NEXUS OVERRIDE EXPLANATION THEME END */</style>
<style>
dialog.bio-nexus-dialog.user-overrides-dialog { width: min(900px, calc(100vw - 32px)) !important; height: min(720px, calc(100dvh - 48px)) !important; }
dialog.bio-nexus-dialog.user-overrides-dialog > .bio-nexus-dialog-shell > .user-overrides-dialog-body { flex: 1 1 0; min-height: 0; overflow: hidden; }
@media (max-width: 720px) { dialog.bio-nexus-dialog.user-overrides-dialog { width: calc(100vw - 16px) !important; height: calc(100dvh - 16px) !important; } }
</style>
