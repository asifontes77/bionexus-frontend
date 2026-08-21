<template>
  <BioNexusDialog ref="dialog" size="compact" kicker="Estado del registro" :title="dialogTitle" @close="handleClosed">
    <section class="exam-state-body">
      <p><strong>{{ target?.description }}</strong></p>
      <p>{{ target?.annulled ? "El registro volvera a estar disponible." : "El registro permanecera visible en el catalogo, pero no estara disponible en nuevos procesos." }}</p>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="saving || !target" @click="confirm"><BioNexusActionIcon :action="target?.annulled ? 'activate' : 'deactivate'" />{{ target?.annulled ? "Activar" : "Inactivar" }}</button>
    </template>
  </BioNexusDialog>
</template>

<script setup>
import { computed, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";

const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const dialog = ref(null);
const target = ref(null);
const entityLabel = ref("registro");
const errorMessage = ref("");
const dialogTitle = computed(() => `${target.value?.annulled ? "Activar" : "Inactivar"} ${entityLabel.value}`);

function open(row, label = "registro") { target.value = row; entityLabel.value = label; errorMessage.value = ""; dialog.value?.open(); }
function close() { dialog.value?.close(); }
function handleClosed() { target.value = null; entityLabel.value = "registro"; errorMessage.value = ""; }
function clearError() { errorMessage.value = ""; }
function setError(value) { errorMessage.value = String(value || ""); }
function confirm() { if (target.value && !props.saving) emit("confirm", target.value, entityLabel.value); }
defineExpose({ open, close, clearError, setError });
</script>

<style scoped>
.exam-state-body { display: grid; gap: var(--bio-nexus-space-3); }
.exam-state-body > p { margin: 0; color: var(--bio-nexus-color-text-secondary); line-height: 1.5; }
.exam-state-body strong { color: var(--bio-nexus-color-text); }
</style>
