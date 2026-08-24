<template>
  <BioNexusDialog ref="dialog" size="compact" kicker="Estado del registro" :title="target?.annulled ? 'Activar forma parasitaria' : 'Inactivar forma parasitaria'" @close="handleClosed">
    <section class="parasiticform-state-body">
      <p><strong>{{ target?.description }}</strong></p>
      <p>{{ target?.annulled ? "El registro volverá a estar disponible en los flujos operativos." : "El registro permanecerá visible en este catálogo, pero se ocultará en los flujos operativos." }}</p>
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
const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]); const dialog = ref(null); const target = ref(null); const errorMessage = ref("");
function open(record) { target.value = record; errorMessage.value = ""; dialog.value?.open(); }
function close() { dialog.value?.close(); }
function handleClosed() { target.value = null; errorMessage.value = ""; }
function clearError() { errorMessage.value = ""; }
function setError(message) { errorMessage.value = message; }
function confirm() { if (target.value && !props.saving) emit("confirm", target.value); }
defineExpose({ open, close, clearError, setError });
</script>
<style scoped>
.parasiticform-state-body { display: grid; gap: var(--bio-nexus-space-3); color: var(--bio-nexus-color-text-secondary); font-family: var(--bio-nexus-font-family); font-size: var(--bio-nexus-font-size-md); font-weight: var(--bio-nexus-font-weight-regular); }
.parasiticform-state-body p { margin: 0; line-height: 1.55; }
.parasiticform-state-body strong { color: var(--bio-nexus-color-text); font-weight: var(--bio-nexus-font-weight-medium); }
</style>
