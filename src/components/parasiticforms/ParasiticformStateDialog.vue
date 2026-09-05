<template><BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="record => emit('confirm', record)" /></template>
<script setup>
import { ref } from "vue";
import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const stateDialog = ref(null);
const configuration = { activateTitle: "Activar forma parasitaria", deactivateTitle: "Inactivar forma parasitaria", activateMessage: "El registro volverá a estar disponible en los flujos operativos.", deactivateMessage: "El registro permanecerá visible en este catálogo, pero se ocultará en los flujos operativos.", label: record => record?.description || "Registro seleccionado" };
function open(record) { stateDialog.value?.open(record, configuration); }
function close() { stateDialog.value?.close(); }
function clearError() { stateDialog.value?.clearError(); }
function setError(value) { stateDialog.value?.setError(value); }
defineExpose({ open, close, clearError, setError });
</script>
