<template>
  <BioNexusDialog ref="dialog" size="compact" kicker="Entrega electrÃ³nica" title="Enviar resultados por correo" @close="handleClosed">
    <section class="send-dialog-body">
      <p>Se procesarÃ¡n <strong>{{ records.length }}</strong> pacientes de forma individual.</p>
      <p>Solo se marcarÃ¡n como enviados los registros confirmados por el Backend.</p>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="sending" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="sending || records.length === 0" @click="$emit('confirm')"><BioNexusActionIcon action="send" />{{ sending ? "Enviando..." : "Enviar" }}</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
defineProps({ records: { type: Array, default: () => [] }, sending: { type: Boolean, default: false } });
defineEmits(["confirm"]);
const dialog = ref(null); const errorMessage = ref("");
function open() { errorMessage.value = ""; dialog.value?.open(); }
function close() { dialog.value?.close(); }
function handleClosed() { if (!dialog.value?.open) errorMessage.value = ""; }
function setError(value) { errorMessage.value = String(value || ""); }
defineExpose({ open, close, setError });
</script>
<style scoped>.send-dialog-body{display:grid;gap:var(--bio-nexus-space-3)}.send-dialog-body p{margin:0;color:var(--bio-nexus-color-text-secondary);line-height:1.5}</style>
