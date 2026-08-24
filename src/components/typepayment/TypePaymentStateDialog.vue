<template>
  <BioNexusDialog ref="dialog" size="compact" kicker="Estado del registro" :title="target?.annulled ? 'Activar tipo de pago' : 'Inactivar tipo de pago'" @close="handleClosed">
    <section class="type-payment-state-body">
      <p><strong>{{ target?.description }}</strong></p>
      <p>{{ target?.annulled ? "El tipo de pago volverá a estar disponible." : "La forma de pago permanecerá en el catálogo, pero no estará disponible para nuevas operaciones." }}</p>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" /><span>Cancelar</span></button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="saving || !target" @click="confirm"><BioNexusActionIcon :action="target?.annulled ? 'activate' : 'deactivate'" /><span>{{ saving ? "Guardando..." : target?.annulled ? "Activar" : "Inactivar" }}</span></button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } }); const emit = defineEmits(["confirm"]); const dialog = ref(null); const target = ref(null); const errorMessage = ref("");
function open(row) { target.value = row; errorMessage.value = ""; dialog.value?.open(); }
function close() { dialog.value?.close(); }
function handleClosed() { target.value = null; errorMessage.value = ""; }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = message; }
function confirm() { if (target.value && !props.saving) emit("confirm", target.value); }
defineExpose({ open, close, clearError, setError });
</script>
<style scoped>
.type-payment-state-body { display: grid; gap: var(--bio-nexus-space-3); color: var(--bio-nexus-color-text-secondary); font-family: var(--bio-nexus-font-family); font-size: var(--bio-nexus-font-size-md); font-weight: var(--bio-nexus-font-weight-regular); }
.type-payment-state-body p { margin: 0; line-height: 1.55; }
.type-payment-state-body strong { color: var(--bio-nexus-color-text); font-weight: var(--bio-nexus-font-weight-medium); }
</style>
