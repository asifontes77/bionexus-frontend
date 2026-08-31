<template>
  <BioNexusDialog ref="dialog" size="compact" kicker="Entrega electr&#243;nica" title="Enviar resultados por correo" @close="handleClosed">
    <section class="send-dialog-body">
      <p>Se procesar&#225;n <strong>{{ records.length }}</strong> pacientes de forma individual.</p>
      <p><strong>{{ initialCount }}</strong> env&#237;os iniciales y <strong>{{ resendCount }}</strong> reenv&#237;os se confirmar&#225;n en una sola operaci&#243;n.</p>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="locked" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="locked || records.length === 0" :aria-busy="locked" @click="confirm"><BioNexusActionIcon action="send" />{{ locked ? "Enviando..." : actionLabel }}</button>
    </template>
  </BioNexusDialog>
</template>
<script setup>
import { computed, ref } from "vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
const props = defineProps({ records: { type: Array, default: () => [] }, sending: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const confirming = ref(false);
const dialog = ref(null);
const errorMessage = ref("");
const locked = computed(() => props.sending || confirming.value);
const initialCount = computed(() => props.records.filter((record) => !record.email_status).length);
const resendCount = computed(() => props.records.filter((record) => Boolean(record.email_status)).length);
const actionLabel = computed(() => resendCount.value > 0 && initialCount.value === 0 ? "Reenviar" : "Enviar");
function open() { confirming.value = false; errorMessage.value = ""; dialog.value?.open(); }
function close() { if (!locked.value) dialog.value?.close(); }
function closeAfterOperation() { confirming.value = false; dialog.value?.close(); }
function confirm() { if (locked.value || props.records.length === 0) return; confirming.value = true; emit("confirm"); }
function handleClosed() { errorMessage.value = ""; confirming.value = false; }
function setError(value) { errorMessage.value = String(value || ""); confirming.value = false; }
defineExpose({ open, close, closeAfterOperation, setError });
</script>
<style scoped>
.send-dialog-body { display: grid; gap: var(--bio-nexus-space-3); }
.send-dialog-body p { margin: 0; color: var(--bio-nexus-color-text-secondary); line-height: 1.5; }
</style>
