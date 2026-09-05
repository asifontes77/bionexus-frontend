<template>
  <BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="confirm" />
</template>
<script setup>
import { ref } from "vue";
import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
const props = defineProps({ saving: { type: Boolean, default: false } });
const emit = defineEmits(["confirm"]);
const stateDialog = ref(null);
const target = ref(null);
function open(records, annulled) {
  const items = Array.isArray(records) ? records.filter(Boolean) : [];
  if (!items.length) return;
  target.value = { id: "bulk-exams", annulled: !annulled, records: items, requestedAnnulled: annulled };
  const count = items.length;
  const noun = count === 1 ? "examen" : "exámenes";
  stateDialog.value?.open(target.value, {
    activateTitle: count === 1 ? "Activar examen" : `Activar ${count} exámenes`,
    deactivateTitle: count === 1 ? "Inactivar examen" : `Inactivar ${count} exámenes`,
    activateMessage: count === 1 ? "El examen volverá a estar disponible en nuevos procesos." : `Los ${count} exámenes volverán a estar disponibles en nuevos procesos.`,
    deactivateMessage: count === 1 ? "El examen permanecerá visible en el catálogo, pero no estará disponible en nuevos procesos." : `Los ${count} exámenes permanecerán visibles en el catálogo, pero no estarán disponibles en nuevos procesos.`,
    label: () => count === 1 ? items[0]?.description || "Examen seleccionado" : `${count} ${noun} seleccionados`,
  });
}
function confirm(value) { emit("confirm", value.records, value.requestedAnnulled); }
function close() { stateDialog.value?.close(); }
function clearError() { stateDialog.value?.clearError(); }
function setError(value) { stateDialog.value?.setError(value); }
defineExpose({ open, close, clearError, setError });
</script>
