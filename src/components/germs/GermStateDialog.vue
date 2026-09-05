<template><BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="record => emit('confirm', record)" /></template>
<script setup>
import { ref } from "vue";
import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const stateDialog = ref(null);
const configuration = { activateTitle: "Activar germen", deactivateTitle: "Inactivar germen", activateMessage: "El germen volverá a estar disponible en antibiogramas.", deactivateMessage: "El registro permanecerá visible, pero no estará disponible en nuevos antibiogramas.", label: record => record?.germen || "Registro seleccionado" };
function open(record) { stateDialog.value?.open(record, configuration); }
function close() { stateDialog.value?.close(); }
function clearError() { stateDialog.value?.clearError(); }
function setError(value) { stateDialog.value?.setError(value); }
defineExpose({ open, close, clearError, setError });
</script>
