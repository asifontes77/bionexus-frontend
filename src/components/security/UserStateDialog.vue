<template><BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="record => emit('confirm', record)" /></template>
<script setup>
import { ref } from "vue"; import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } }); const emit = defineEmits(["confirm"]); const stateDialog = ref(null);
const configuration = { kicker: "Estado de la cuenta", isInactive: user => user?.hidden === true, activateTitle: "Reactivar usuario", deactivateTitle: "Desactivar usuario", activateAction: "Reactivar", activateMessage: "El usuario recuperará el acceso efectivo según sus roles y permisos.", deactivateMessage: "El usuario quedará visible para consulta, pero no podrá iniciar operaciones.", deactivateWarning: () => "El sistema impedirá desactivar al último administrador visible.", label: user => user?.name || user?.userName || "Usuario seleccionado", dangerOnDeactivate: true };
function open(user) { stateDialog.value?.open(user, configuration); } function close() { stateDialog.value?.close(); } function clearError() { stateDialog.value?.clearError(); } function setError(value) { stateDialog.value?.setError(value); }
defineExpose({ open, close, clearError, setError });
</script>
