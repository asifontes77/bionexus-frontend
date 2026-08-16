<template>
  <dialog ref="dialog" class="toro-dialog user-state-dialog" tabindex="-1" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="confirm">
      <header class="dialog-header">
        <div>
          <p>Estado de la cuenta</p>
          <h3>{{ target?.hidden ? "Reactivar usuario" : "Inactivar usuario" }}</h3>
        </div>
        <ToroDialogCloseButton @click="close" />
      </header>
      <div class="dialog-body state-dialog-body">
        <div v-if="errorMessage" class="toro-message toro-message-error" role="alert">{{ errorMessage }}</div>
        <p>{{ target?.hidden ? `El usuario ${target?.name || "seleccionado"} recuperará el acceso efectivo según sus roles y permisos.` : `El usuario ${target?.name || "seleccionado"} quedará visible para consulta, pero no podrá iniciar operaciones.` }}</p>
        <div v-if="!target?.hidden" class="toro-message toro-message-warning" role="status">El sistema impedirá inactivar al último administrador visible.</div>
      </div>
      <footer class="dialog-footer">
        <button type="button" class="toro-action toro-action-secondary" :disabled="saving" @click="close"><ToroActionIcon action="cancel" />Cancelar</button>
        <button type="submit" class="toro-action" :class="target?.hidden ? 'toro-action-primary' : 'toro-action-danger'" :disabled="saving || !target"><ToroIcon :name="target?.hidden ? 'person_check' : 'person_off'" :size="19" />{{ saving ? "Guardando..." : target?.hidden ? "Reactivar" : "Inactivar" }}</button>
      </footer>
    </form>
  </dialog>
</template>
<script setup>
import { ref } from "vue";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";
import ToroDialogCloseButton from "@/components/ui/ToroDialogCloseButton.vue";
import ToroIcon from "@/components/ui/ToroIcon.vue";
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
.toro-dialog { box-sizing: border-box; position: fixed; inset: 0; width: min(560px, calc(100vw - 32px)); min-width: 0; max-width: 560px; height: fit-content; max-height: calc(100vh - 32px); margin: auto; padding: 0; border: 1px solid var(--toro-color-border-strong); border-radius: var(--toro-radius-md); background: var(--toro-color-surface); color: var(--toro-color-text); box-shadow: var(--toro-shadow-md); overflow: hidden; }
.toro-dialog::backdrop { background: color-mix(in srgb, var(--toro-color-sidebar-strong) 48%, transparent); backdrop-filter: blur(2px); }
.dialog-shell { display: flex; flex-direction: column; width: 100%; max-height: calc(100vh - 32px); overflow: hidden; }
.dialog-header { display: flex; align-items: center; justify-content: space-between; gap: var(--toro-space-3); padding: var(--toro-space-3) var(--toro-space-4); border-bottom: 1px solid var(--toro-color-border); background: var(--toro-color-surface); }
.dialog-header p, .dialog-header h3 { margin: 0; }
.dialog-header p { margin-bottom: var(--toro-space-1); color: var(--toro-color-accent-strong); font-size: var(--toro-font-size-xs); font-weight: var(--toro-font-weight-bold); text-transform: uppercase; letter-spacing: 0.06em; }
.dialog-body { padding: var(--toro-space-4); overflow: auto; }
.state-dialog-body { display: grid; gap: var(--toro-space-3); }
.state-dialog-body > p { margin: 0; color: var(--toro-color-text-secondary); line-height: 1.55; }
.dialog-footer { display: flex; align-items: center; justify-content: flex-end; gap: var(--toro-space-2); padding: var(--toro-space-3) var(--toro-space-4); border-top: 1px solid var(--toro-color-border); background: var(--toro-color-surface-soft); }
@media (max-width: 720px) { .toro-dialog { width: calc(100vw - 16px); } .dialog-footer { flex-wrap: wrap; } }
</style>
