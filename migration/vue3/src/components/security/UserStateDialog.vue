<template>
  <dialog ref="dialog" class="bio-nexus-dialog user-state-dialog" tabindex="-1" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="confirm">
      <header class="dialog-header">
        <div>
          <p>Estado de la cuenta</p>
          <h3>{{ target?.hidden ? "Reactivar usuario" : "Inactivar usuario" }}</h3>
        </div>
        <BioNexusDialogCloseButton @click="close" />
      </header>
      <div class="dialog-body state-dialog-body">
        <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
        <p>{{ target?.hidden ? `El usuario ${target?.name || "seleccionado"} recuperará el acceso efectivo según sus roles y permisos.` : `El usuario ${target?.name || "seleccionado"} quedará visible para consulta, pero no podrá iniciar operaciones.` }}</p>
        <div v-if="!target?.hidden" class="bio-nexus-message bio-nexus-message-warning" role="status">El sistema impedirá inactivar al último administrador visible.</div>
      </div>
      <footer class="dialog-footer">
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
        <button type="submit" class="bio-nexus-action" :class="target?.hidden ? 'bio-nexus-action-primary' : 'bio-nexus-action-danger'" :disabled="saving || !target"><BioNexusIcon :name="target?.hidden ? 'person_check' : 'person_off'" :size="19" />{{ saving ? "Guardando..." : target?.hidden ? "Reactivar" : "Inactivar" }}</button>
      </footer>
    </form>
  </dialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const dialog = ref(null);
const target = ref(null);
const errorMessage = ref("");
function open(user) { target.value = user; errorMessage.value = ""; if (!dialog.value?.open) dialog.value?.showModal(); requestAnimationFrame(() => dialog.value?.focus({ preventScroll: true })); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function setError(message) { errorMessage.value = String(message || ""); }
function confirm() { if (target.value) emit("confirm", target.value); }
defineExpose({ open, close, setError });
</script>
<style scoped>
.bio-nexus-dialog { box-sizing: border-box; position: fixed; inset: 0; width: min(560px, calc(100vw - 32px)); min-width: 0; max-width: 560px; height: fit-content; max-height: calc(100vh - 32px); margin: auto; padding: 0; border: 1px solid var(--bio-nexus-color-border-strong); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface); color: var(--bio-nexus-color-text); box-shadow: var(--bio-nexus-shadow-md); overflow: hidden; }
.bio-nexus-dialog::backdrop { background: color-mix(in srgb, var(--bio-nexus-color-sidebar-strong) 48%, transparent); backdrop-filter: blur(2px); }
.dialog-shell { display: flex; flex-direction: column; width: 100%; max-height: calc(100vh - 32px); overflow: hidden; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; gap: var(--bio-nexus-space-3); padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); border-bottom: 1px solid var(--bio-nexus-color-border); background: var(--bio-nexus-color-surface); }
.dialog-header p, .dialog-header h3 { margin: 0; }
.dialog-header p { margin-bottom: var(--bio-nexus-space-1); color: var(--bio-nexus-color-accent-strong); font-size: var(--bio-nexus-font-size-xs); font-weight: var(--bio-nexus-font-weight-bold); text-transform: uppercase; letter-spacing: 0.06em; }
.dialog-body { padding: var(--bio-nexus-space-4); overflow: auto; }
.state-dialog-body { display: grid; gap: var(--bio-nexus-space-3); }
.state-dialog-body > p { margin: 0; color: var(--bio-nexus-color-text-secondary); line-height: 1.55; }
.dialog-footer { display: flex; align-items: center; justify-content: flex-end; gap: var(--bio-nexus-space-2); padding: var(--bio-nexus-space-3) var(--bio-nexus-space-4); border-top: 1px solid var(--bio-nexus-color-border); background: var(--bio-nexus-color-surface-soft); }
@media (max-width: 720px) { .bio-nexus-dialog { width: calc(100vw - 16px); } .dialog-footer { flex-wrap: wrap; } }
</style>
