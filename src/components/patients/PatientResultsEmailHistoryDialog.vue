<template>
  <BioNexusDialog ref="dialog" size="wide" body-class="patient-results-history-dialog-body" kicker="Trazabilidad" title="Historial de envios de resultados">
    <section class="history-dialog-body">
      <div class="history-scope-note">Muestra los intentos registrados entre <strong>{{ rangeLabel }}</strong>.</div>
      <div v-if="loading" class="bio-nexus-message">Consultando historial...</div>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
      <BioNexusDataGrid
        v-else
        class="history-grid"
        :row-data="rows"
        :column-defs="columns"
        :components="components"
        :min-grid-height="340"
        :max-grid-height="560"
        :search-enabled="true"
        v-model:search-model-value="search"
        :quick-filter-text="search"
        :export-options="false"
        empty-text="No existen intentos en el rango consultado."
      />
    </section>
    <template #footer><button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="close">Cerrar</button></template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import { getPatientResultsEmailHistory } from "@/services/patientResultsEmailService";
const dialog = ref(null);
const rows = ref([]);
const loading = ref(false);
const errorMessage = ref("");
const search = ref("");
const rangeLabel = ref("");
const components = { BioNexusOptionFilter };
const centeredHeader = "history-centered-header";
const centeredCell = "history-centered-cell";
const columns = [
  { field: "requestedAt", headerName: "Solicitado", valueFormatter: ({ value }) => formatDateTime(value), minWidth: 158, maxWidth: 178 },
  { field: "patientPosition", headerName: "Nro. ingreso", minWidth: 116, maxWidth: 130, headerClass: centeredHeader, cellClass: centeredCell },
  { field: "patientName", headerName: "Paciente", minWidth: 180, flex: 1.1 },
  { field: "recipientEmail", headerName: "Destinatario", minWidth: 190, flex: 1.1 },
  { field: "deliveryType", headerName: "Tipo", valueFormatter: ({ value }) => value === "resend" ? "Reenv\u00edo" : "Env\u00edo", filter: BioNexusOptionFilter, filterParams: { options: [{ value: "send", label: "Env\u00edo" }, { value: "resend", label: "Reenv\u00edo" }] }, minWidth: 112, maxWidth: 130, headerClass: centeredHeader, cellClass: centeredCell },
  { field: "status", headerName: "Resultado", valueFormatter: ({ value }) => ({ started: "En proceso", success: "Exitoso", failed: "Fallido" }[value] || value), filter: BioNexusOptionFilter, filterParams: { options: [{ value: "started", label: "En proceso" }, { value: "success", label: "Exitoso" }, { value: "failed", label: "Fallido" }] }, minWidth: 120, maxWidth: 140, headerClass: centeredHeader, cellClass: centeredCell },
  { field: "requestedByName", headerName: "Solicitado por", minWidth: 150 },
  { field: "completedByName", headerName: "Completado por", minWidth: 150 },
  { field: "pdfSizeBytes", headerName: "PDF bytes", minWidth: 105, maxWidth: 120, headerClass: centeredHeader, cellClass: centeredCell },
  { field: "errorCode", headerName: "Error", minWidth: 150, flex: 1 },
];
function displayDate(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : String(value || "");
}
function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}
async function open(dateFrom, dateTo) {
  rangeLabel.value = `${displayDate(dateFrom)} y ${displayDate(dateTo)}`;
  dialog.value?.open();
  loading.value = true;
  errorMessage.value = "";
  try { rows.value = await getPatientResultsEmailHistory(dateFrom, dateTo); }
  catch { rows.value = []; errorMessage.value = "No fue posible consultar el historial."; }
  finally { loading.value = false; }
}
function close() { dialog.value?.close(); }
defineExpose({ open });
</script>
<style scoped>
.history-dialog-body { box-sizing: border-box; width: 100%; min-width: 0; overflow: hidden; }
.history-scope-note { margin-bottom: var(--bio-nexus-space-3); color: var(--bio-nexus-color-text-muted); font-size: var(--bio-nexus-font-size-sm); }
.history-grid { width: 100%; min-width: 0; }
.history-grid :deep(.history-centered-header .ag-header-cell-label),
.history-grid :deep(.history-centered-cell) { justify-content: center; text-align: center; }
</style>
<style>
.patient-results-history-dialog-body {
  box-sizing: border-box;
  width: min(1460px, calc(100vw - 96px)) !important;
  max-width: calc(100vw - 96px) !important;
  min-width: 0 !important;
}
.patient-results-history-dialog-body .bio-nexus-dialog-content,
.patient-results-history-dialog-body .history-dialog-body,
.patient-results-history-dialog-body .history-grid {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}
@media (max-width: 760px) {
  .patient-results-history-dialog-body {
    width: calc(100vw - 32px) !important;
    max-width: calc(100vw - 32px) !important;
  }
}
</style>
