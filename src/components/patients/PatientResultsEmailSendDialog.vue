<template>
  <BioNexusDialog ref="dialog" size="compact" kicker="Entrega electrÃ³nica" title="Enviar resultados por correo" @close="handleClosed">
    <section class="send-dialog-body">
      <p>Se procesarÃ¡n <strong>{{ records.length }}</strong> pacientes de forma individual.</p>
      <p>Solo se marcarÃ¡n como enviados los registros confirmados por el Backend.</p>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="locked" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="locked || records.length === 0" :aria-busy="locked" @click="confirm"><BioNexusActionIcon action="send" />{{ sending ? "Enviando..." : "Enviar" }}</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { computed, ref, watch } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
const props = defineProps({ records: { type: Array, default: () => [] }, sending: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const confirming = ref(false);
const locked = computed(() => props.sending || confirming.value);
watch(() => props.sending, (value) => { if (!value) confirming.value = false; });
const dialog = ref(null); const errorMessage = ref("");
function open() { confirming.value = false; errorMessage.value = ""; dialog.value?.open(); }
function close() { if (!locked.value) dialog.value?.close(); }
function confirm() { if (locked.value || props.records.length === 0) return; confirming.value = true; emit("confirm"); }
function handleClosed() { if (!dialog.value?.open) errorMessage.value = ""; }
function setError(value) { errorMessage.value = String(value || ""); }
defineExpose({ open, close, setError });
</script>
<style scoped>.send-dialog-body{display:grid;gap:var(--bio-nexus-space-3)}.send-dialog-body p{margin:0;color:var(--bio-nexus-color-text-secondary);line-height:1.5}</style>
