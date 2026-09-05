<template><BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="confirm" /></template>
<script setup>
import { ref } from "vue";
import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } }); const emit = defineEmits(["confirm"]); const stateDialog = ref(null); const entityLabel = ref("registro");
function configuration(label) { return { activateTitle: `Activar ${label}`, deactivateTitle: `Inactivar ${label}`, activateMessage: "El registro volverá a estar disponible.", deactivateMessage: "El registro permanecerá visible en el catálogo, pero no estará disponible en nuevos procesos.", label: record => record?.description || "Registro seleccionado" }; }
function open(row, label = "registro") { entityLabel.value = label; stateDialog.value?.open(row, configuration(label)); }
function confirm(row) { emit("confirm", row, entityLabel.value); }
function close() { stateDialog.value?.close(); } function clearError() { stateDialog.value?.clearError(); } function setError(value) { stateDialog.value?.setError(value); }
defineExpose({ open, close, clearError, setError });
</script>
