<template>
  <BioNexusStateDialog ref="dialog" :saving="saving" @confirm="row => emit('confirm', row)" />
</template>
<script setup>
import { ref } from "vue";
import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const dialog = ref(null);
const configuration = {
  kicker: "Estado del comprobante",
  isInactive: row => !Boolean(row?.isActive),
  activateTitle: "Activar comprobante",
  deactivateTitle: "Inactivar comprobante",
  activateMessage: "El comprobante se utilizará para nuevas impresiones de este tipo.",
  deactivateMessage: "El comprobante dejará de utilizarse para nuevas impresiones.",
  deactivateWarning: () => "Siempre debe permanecer al menos un comprobante activo. Si este es el último activo, la operación será rechazada.",
  activateAction: "Activar",
  deactivateAction: "Inactivar",
  activateIcon: "activate",
  deactivateIcon: "deactivate",
  label: row => row?.name || "Comprobante seleccionado",
};
function open(row) { dialog.value?.open(row, configuration); }
function close() { dialog.value?.close(); }
function setError(value) { dialog.value?.setError(value); }
function clearError() { dialog.value?.clearError(); }
defineExpose({ open, close, setError, clearError });
</script>
