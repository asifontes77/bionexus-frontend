<template>
  <BioNexusDialog ref="dialog" size="compact" dialog-class="bio-nexus-state-dialog" :kicker="configuration.kicker || 'Estado del registro'" :title="title" @close="reset">
    <section class="bio-nexus-state-dialog-body">
      <p v-if="recordLabel"><strong>{{ recordLabel }}</strong></p>
      <p>{{ message }}</p>
      <div v-if="warning" class="bio-nexus-message bio-nexus-message-warning" role="status">{{ warning }}</div>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" /><span>Cancelar</span></button>
      <button type="button" class="bio-nexus-action" :class="primaryClass" :disabled="saving || !target" @click="confirm"><BioNexusActionIcon :action="actionIcon" /><span>{{ actionText }}</span></button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { computed, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const dialog = ref(null); const target = ref(null); const configuration = ref({}); const errorMessage = ref("");
const inactive = computed(() => configuration.value.isInactive?.(target.value) ?? Boolean(target.value?.annulled));
const recordLabel = computed(() => configuration.value.label?.(target.value) || target.value?.description || "");
const title = computed(() => inactive.value ? configuration.value.activateTitle || "Activar registro" : configuration.value.deactivateTitle || "Inactivar registro");
const message = computed(() => inactive.value ? configuration.value.activateMessage || "El registro volverá a estar disponible." : configuration.value.deactivateMessage || "El registro permanecerá visible, pero no estará disponible en nuevos procesos.");
const warning = computed(() => inactive.value ? configuration.value.activateWarning?.(target.value) || "" : configuration.value.deactivateWarning?.(target.value) || "");
const actionText = computed(() => props.saving ? "Guardando..." : inactive.value ? configuration.value.activateAction || "Activar" : configuration.value.deactivateAction || "Inactivar");
const actionIcon = computed(() => inactive.value ? configuration.value.activateIcon || "activate" : configuration.value.deactivateIcon || "deactivate");
const primaryClass = computed(() => !inactive.value && configuration.value.dangerOnDeactivate ? "bio-nexus-action-danger" : "bio-nexus-action-primary");
function open(record, options = {}) { target.value = record; configuration.value = options; errorMessage.value = ""; dialog.value?.open(); }
function close() { dialog.value?.close(); }
function reset() { target.value = null; configuration.value = {}; errorMessage.value = ""; }
function clearError() { errorMessage.value = ""; }
function setError(value) { errorMessage.value = String(value || ""); }
function confirm() { if (target.value && !props.saving) emit("confirm", target.value); }
defineExpose({ open, close, clearError, setError });
</script>
<style scoped>.bio-nexus-state-dialog-body{display:grid;gap:var(--bio-nexus-space-3);color:var(--bio-nexus-color-text-secondary);font-family:var(--bio-nexus-font-family);font-size:var(--bio-nexus-font-size-md);font-weight:var(--bio-nexus-font-weight-regular)}.bio-nexus-state-dialog-body p{margin:0;line-height:1.55}.bio-nexus-state-dialog-body strong{color:var(--bio-nexus-color-text);font-weight:var(--bio-nexus-font-weight-medium)}</style>
