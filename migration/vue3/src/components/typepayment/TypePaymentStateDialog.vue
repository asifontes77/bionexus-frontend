<template>
  <dialog ref="dialog" class="bio-nexus-dialog type-payment-state-dialog" @cancel.prevent="close">
    <form class="dialog-shell" @submit.prevent="confirm">
      <header class="dialog-header"><div><p>Estado del registro</p><h3>{{ target?.annulled ? "Activar tipo de pago" : "Inactivar tipo de pago" }}</h3></div><BioNexusDialogCloseButton @click="close" /></header>
      <section class="dialog-body type-payment-state-body"><p><strong>{{ target?.description }}</strong></p><p>{{ target?.annulled ? "El tipo de pago volvera a estar disponible." : "La forma de pago permanecera en el catalogo, pero no estara disponible para nuevas operaciones." }}</p><div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div></section>
      <footer class="dialog-footer"><button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" /><span>Cancelar</span></button><button type="submit" class="bio-nexus-action bio-nexus-action-primary" :disabled="saving || !target"><BioNexusActionIcon :action="target?.annulled ? 'activate' : 'deactivate'" /><span>{{ saving ? "Guardando..." : target?.annulled ? "Activar" : "Inactivar" }}</span></button></footer>
    </form>
  </dialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialogCloseButton from "@/components/ui/BioNexusDialogCloseButton.vue";
defineProps({ saving: { type: Boolean, default: false } }); const emit = defineEmits(["confirm"]); const dialog = ref(null); const target = ref(null); const errorMessage = ref("");
function open(row) { target.value = row; errorMessage.value = ""; dialog.value?.showModal(); }
function close() { if (dialog.value?.open) dialog.value.close(); }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = message; }
function confirm() { if (target.value) emit("confirm", target.value); }
defineExpose({ open, close, clearError, setError });
</script>
<style scoped>
.type-payment-state-dialog { width: min(520px, calc(100vw - 32px)); padding: 0; border: 1px solid var(--bio-nexus-color-border-strong); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-surface); color: var(--bio-nexus-color-text); font-family: var(--bio-nexus-font-family); font-size: var(--bio-nexus-font-size-md); font-weight: var(--bio-nexus-font-weight-regular); box-shadow: var(--bio-nexus-shadow-md); }
.type-payment-state-dialog::backdrop { background: rgb(13 36 58 / 48%); backdrop-filter: blur(2px); }
.type-payment-state-body { display: grid; gap: var(--bio-nexus-space-3); color: var(--bio-nexus-color-text-secondary); font-family: var(--bio-nexus-font-family); font-size: var(--bio-nexus-font-size-md); font-weight: var(--bio-nexus-font-weight-regular); }
.type-payment-state-body p { margin: 0; line-height: 1.55; }
.type-payment-state-body strong { color: var(--bio-nexus-color-text); font-weight: var(--bio-nexus-font-weight-medium); }
</style>
