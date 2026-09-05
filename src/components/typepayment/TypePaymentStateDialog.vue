<template><BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="record => emit('confirm', record)" /></template>
<script setup>
import { ref } from "vue";
import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const stateDialog = ref(null);
const configuration = { activateTitle: "Activar tipo de pago", deactivateTitle: "Inactivar tipo de pago", activateMessage: "El tipo de pago volverá a estar disponible.", deactivateMessage: "La forma de pago permanecerá en el catálogo, pero no estará disponible para nuevas operaciones.", label: record => record?.description || "Registro seleccionado" };
function open(record) { stateDialog.value?.open(record, configuration); }
function close() { stateDialog.value?.close(); }
function clearError() { stateDialog.value?.clearError(); }
function setError(value) { stateDialog.value?.setError(value); }
defineExpose({ open, close, clearError, setError });
</script>
