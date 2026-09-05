<template><BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="record => emit('confirm', record)" /></template>
<script setup>
import { ref } from "vue"; import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } }); const emit = defineEmits(["confirm"]); const stateDialog = ref(null);
const configuration = { kicker: "Estado del rol", isInactive: role => role?.isActive !== true, activateTitle: "Activar rol", deactivateTitle: "Inactivar rol", activateMessage: "El rol volverá a estar disponible para las asignaciones permitidas.", deactivateMessage: "El rol quedará inactivo y no podrá asignarse a nuevos usuarios.", label: role => role?.name || role?.code || "Rol seleccionado", dangerOnDeactivate: true };
function open(role) { stateDialog.value?.open(role, configuration); } function close() { stateDialog.value?.close(); } function clearError() { stateDialog.value?.clearError(); } function setError(value) { stateDialog.value?.setError(value); }
defineExpose({ open, close, clearError, setError });
</script>
