<template>
  <dialog ref="dialog" class="toro-dialog role-state-dialog" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="confirm">
      <header class="dialog-header">
        <div>
          <p>Estado del rol</p>
          <h3>{{ target?.isActive ? "Inactivar rol" : "Activar rol" }}</h3>
        </div>
        <ToroDialogCloseButton @click="close" />
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
          <ToroActionIcon action="cancel" />
          <span>Cancelar</span>
        </button>
        <button type="submit" class="toro-action" :class="target?.isActive ? 'toro-action-danger' : 'toro-action-primary'" :disabled="saving || !target">
          <ToroActionIcon :action="target?.isActive ? 'deactivate' : 'activate'" />
          <span>{{ saving ? "Guardando..." : target?.isActive ? "Inactivar" : "Activar" }}</span>
        </button>
      </footer>
    </form>
  </dialog>
</template>

<script setup>
import { ref } from "vue";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";
import ToroDialogCloseButton from "@/components/ui/ToroDialogCloseButton.vue";

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
