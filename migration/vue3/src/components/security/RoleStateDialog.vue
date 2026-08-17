<template>
  <dialog ref="dialog" class="toro-dialog role-state-dialog" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="confirm">
      <header class="dialog-header">
        <div>
          <p>Estado del rol</p>
          <h3>{{ target?.isActive ? "Inactivar rol" : "Activar rol" }}</h3>
        </div>
        <BioNexusDialogCloseButton @click="close" />
      </header>
      <div class="dialog-body">
        <div class="toro-message toro-message-warning" role="status">
          {{ target?.isActive
            ? "El rol quedara inactivo y no podra asignarse a nuevos usuarios."
            : "El rol volvera a estar disponible para las asignaciones permitidas." }}
        </div>
        <p v-if="errorMessage" class="toro-message toro-message-danger" role="alert">{{ errorMessage }}</p>
      </div>
      <footer class="dialog-footer">
        <button type="button" class="toro-action toro-action-secondary" :disabled="saving" @click="close">
          <BioNexusActionIcon action="cancel" />
          <span>Cancelar</span>
        </button>
        <button type="submit" class="toro-action" :class="target?.isActive ? 'toro-action-danger' : 'toro-action-primary'" :disabled="saving || !target">
          <BioNexusActionIcon :action="target?.isActive ? 'deactivate' : 'activate'" />
          <span>{{ saving ? "Guardando..." : target?.isActive ? "Inactivar" : "Activar" }}</span>
        </button>
      </footer>
    </form>
  </dialog>
</template>

<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";

defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const dialog = ref(null);
const target = ref(null);
const errorMessage = ref("");

function open(role) { target.value = role; errorMessage.value = ""; dialog.value?.showModal(); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function setError(message) { errorMessage.value = String(message ?? ""); }
function clearError() { errorMessage.value = ""; }
function confirm() { if (target.value) emit("confirm", target.value); }

defineExpose({ open, close, setError, clearError });
</script>

<style scoped>
.role-state-dialog {
  width: min(520px, calc(100vw - 32px));
  padding: 0;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  color: var(--toro-color-text);
  font-family: var(--toro-font-family);
  font-size: var(--toro-font-size-md);
  font-weight: var(--toro-font-weight-regular);
  box-shadow: var(--toro-shadow-md);
}

.role-state-dialog::backdrop {
  background: rgb(13 36 58 / 48%);
  backdrop-filter: blur(2px);
}

.role-state-dialog .dialog-body {
  color: var(--toro-color-text-secondary);
  font-family: var(--toro-font-family);
  font-size: var(--toro-font-size-md);
  font-weight: var(--toro-font-weight-regular);
}
</style>
