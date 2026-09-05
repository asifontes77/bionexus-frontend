<template><BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="record => emit('confirm', record)" /></template>
<script setup>
import { ref } from "vue";
import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]); const stateDialog = ref(null);
const configuration = { activateTitle: "Activar grupo de hoja de trabajo", deactivateTitle: "Inactivar grupo de hoja de trabajo", activateMessage: "El grupo de hoja de trabajo volverá a estar disponible para nuevas asignaciones.", deactivateMessage: "El grupo de hoja de trabajo permanecerá visible, pero no admitirá nuevas asignaciones.", label: record => record?.description || "Grupo de hoja de trabajo" };
function open(record) { stateDialog.value?.open(record, configuration); }
function close() { stateDialog.value?.close(); }
function clearError() { stateDialog.value?.clearError(); }
function setError(value) { stateDialog.value?.setError(value); }
defineExpose({ open, close, clearError, setError });
</script>
