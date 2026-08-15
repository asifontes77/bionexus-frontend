<template>
  <dialog ref="dialog" class="toro-dialog type-payment-state-dialog" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="confirm">
      <header class="dialog-header"><div><p>Estado del registro</p><h3>{{ target?.annulled ? "Activar tipo de pago" : "Inactivar tipo de pago" }}</h3></div><ToroDialogCloseButton @click="close" /></header>
      <section class="dialog-body type-payment-state-body"><p><strong>{{ target?.description }}</strong></p><p>{{ target?.annulled ? "El tipo de pago volvera a estar disponible." : "La forma de pago permanecera en el catalogo, pero no estara disponible para nuevas operaciones." }}</p><div v-if="errorMessage" class="toro-message toro-message-error" role="alert">{{ errorMessage }}</div></section>
      <footer class="dialog-footer"><button type="button" class="toro-action toro-action-secondary" :disabled="saving" @click="close"><ToroActionIcon action="cancel" /><span>Cancelar</span></button><button type="submit" class="toro-action toro-action-primary" :disabled="saving || !target"><ToroActionIcon :action="target?.annulled ? 'activate' : 'deactivate'" /><span>{{ saving ? "Guardando..." : target?.annulled ? "Activar" : "Inactivar" }}</span></button></footer>
    </form>
  </dialog>
</template>
<script setup>
import { ref } from "vue";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";
import ToroDialogCloseButton from "@/components/ui/ToroDialogCloseButton.vue";
defineProps({ saving: { type: Boolean, default: false } }); const emit = defineEmits(["confirm"]); const dialog = ref(null); const target = ref(null); const errorMessage = ref("");
function open(row) { target.value = row; errorMessage.value = ""; dialog.value?.showModal(); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = message; }
function confirm() { if (target.value) emit("confirm", target.value); }
defineExpose({ open, close, clearError, setError });
</script>
<style scoped>
.type-payment-state-dialog { width: min(520px, calc(100vw - 32px)); padding: 0; border: 1px solid var(--toro-color-border-strong); border-radius: var(--toro-radius-md); background: var(--toro-color-surface); color: var(--toro-color-text); box-shadow: var(--toro-shadow-md); }
.type-payment-state-dialog::backdrop { background: rgb(13 36 58 / 48%); backdrop-filter: blur(2px); }
.type-payment-state-body { display: grid; gap: var(--toro-space-3); }
.type-payment-state-body p { margin: 0; line-height: 1.55; }
</style>
