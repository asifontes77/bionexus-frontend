<template>
  <main class="results-email-view">
    <header class="results-email-header">
      <div><p class="bio-nexus-panel-eyebrow">Rutina diaria</p><h1>Entrega de resultados por correo</h1><p>Consulta pacientes aprobados y realiza entregas electrÃ³nicas controladas.</p></div>
      <div class="results-email-actions">
        <BioNexusFormField label="Fecha de ingreso" field-id="results-email-date" required><input id="results-email-date" v-model="date" class="bio-nexus-field" type="date" :disabled="busy" /></BioNexusFormField>
        <button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="busy || !date" @click="loadCandidates"><BioNexusActionIcon action="refresh" />Consultar</button>
        <button v-if="canSend" type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="busy || selected.length === 0" @click="sendDialog?.open()"><BioNexusActionIcon action="send" />Enviar ({{ selected.length }})</button>
      </div>
    </header>
    <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    <section class="results-email-summary"><span><strong>{{ rows.length }}</strong> candidatos</span><span><strong>{{ selected.length }}</strong> seleccionados</span><span><strong>{{ sentCount }}</strong> enviados</span></section>
    <BioNexusDataGrid :row-data="rows" :column-defs="columns" :get-row-id="getRowId" :row-selection="rowSelection" :search-enabled="true" v-model:search-model-value="search" :quick-filter-text="search" :refresh-enabled="true" :refreshing="loading" :refresh-disabled="busy || !date" :export-options="false" empty-text="Seleccione una fecha y consulte los pacientes aprobados." @grid-ready="onGridReady" @refresh="loadCandidates" />
    <PatientResultsEmailSendDialog ref="sendDialog" :records="selected" :sending="sending" @confirm="sendSelected" />
  </main>
</template>
<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useAuthorizationStore } from "@/stores/authorization";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import PatientResultsEmailSendDialog from "@/components/patients/PatientResultsEmailSendDialog.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { buildPatientResultHtml } from "@/services/patientResultReportBuilder";
import { getPatientResultApprover, getPatientResultLaboratory, getPatientResultsEmailCandidates, getValidatedPatientResults, sendPatientResultsEmail } from "@/services/patientResultsEmailService";
const authorization = useAuthorizationStore(); const toast = useBioNexusToast();
const date = ref(""); const rows = ref([]); const selected = ref([]); const search = ref(""); const loading = ref(false); const sending = ref(false); const errorMessage = ref(""); const sendDialog = ref(null); const gridApi = ref(null);
const busy = computed(() => loading.value || sending.value); const canSend = computed(() => authorization.hasPermission("patient-results-email.send")); const sentCount = computed(() => rows.value.filter((row) => row.email_status).length);
const rowSelection = { mode: "multiRow", checkboxes: canSend.value, headerCheckbox: canSend.value, enableClickSelection: canSend.value, isRowSelectable: (node) => canSend.value && !Boolean(node.data?.email_status) };
const columns = [
  { field: "patient_position", headerName: "Sec. / #", valueGetter: ({ data }) => `${data?.patient_position ?? ""} / ${data?.id ?? ""}`, minWidth: 120 },
  { field: "name", headerName: "Paciente", minWidth: 220, flex: 1 },
  { headerName: "Edad", valueGetter: ({ data }) => `${data?.age ?? ""} ${data?.month_year ?? ""}`.trim(), minWidth: 110 },
  { field: "admission_time", headerName: "Hora ingreso", minWidth: 130 },
  { field: "phone", headerName: "TelÃ©fono", minWidth: 140 },
  { field: "email", headerName: "Correo", minWidth: 240, flex: 1 },
  { field: "email_status", headerName: "Estado", valueFormatter: ({ value }) => value ? "Enviado" : "Pendiente", minWidth: 120 },
];
function getRowId({ data }) { return String(data.id); }
function syncSelection() { selected.value = gridApi.value?.getSelectedRows?.() ?? []; }
function onGridReady(event) { gridApi.value = event.api; event.api.addEventListener("selectionChanged", syncSelection); }
async function loadCandidates() { if (!date.value || busy.value) return; loading.value = true; errorMessage.value = ""; selected.value = []; try { rows.value = await getPatientResultsEmailCandidates(date.value); } catch (error) { errorMessage.value = messageFor(error); rows.value = []; } finally { loading.value = false; } }
async function sendSelected() {
  if (!canSend.value || sending.value || selected.value.length === 0) return;
  sending.value = true; sendDialog.value?.setError(""); let success = 0; const failures = [];
  try {
    const laboratory = await getPatientResultLaboratory();
    for (const candidate of [...selected.value]) {
      try { const patient = await getValidatedPatientResults(candidate.id); const html = await buildPatientResultHtml(patient, laboratory, getPatientResultApprover); await sendPatientResultsEmail(candidate.id, html); success += 1; }
      catch (error) { failures.push(`${candidate.patient_position ?? candidate.id}: ${messageFor(error)}`); }
    }
    sendDialog.value?.close(); await loadCandidates();
    if (success) toast.success(`${success} entrega${success === 1 ? "" : "s"} confirmada${success === 1 ? "" : "s"}.`);
    if (failures.length) toast.error(`${failures.length} entrega${failures.length === 1 ? "" : "s"} no completada${failures.length === 1 ? "" : "s"}. Revise los pacientes pendientes.`);
  } finally { sending.value = false; }
}
function messageFor(error) { const code = String(error?.message || ""); const messages = { PATIENT_RESULTS_EMAIL_ALREADY_SENT: "Los resultados ya fueron enviados.", PATIENT_RESULTS_EMAIL_NOT_APPROVED: "No existen resultados aprobados.", PATIENT_RESULTS_EMAIL_CONFIGURATION_INVALID: "La configuraciÃ³n de correo no estÃ¡ completa.", PATIENT_RESULTS_EMAIL_ADDRESS_INVALID: "El correo del paciente no es vÃ¡lido.", PATIENT_RESULTS_EMAIL_IN_PROGRESS: "El paciente ya estÃ¡ siendo procesado.", BIO_NEXUS_REQUEST_TIMEOUT: "La operaciÃ³n excediÃ³ el tiempo permitido." }; return messages[code] || "No fue posible completar la operaciÃ³n."; }
onBeforeUnmount(() => gridApi.value?.removeEventListener?.("selectionChanged", syncSelection));
</script>
<style scoped>
.results-email-view{display:grid;gap:var(--bio-nexus-space-4);min-width:0}.results-email-header{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--bio-nexus-space-4)}.results-email-header h1,.results-email-header p{margin:0}.results-email-header h1{color:var(--bio-nexus-color-primary-strong)}.results-email-header>div:first-child>p:last-child{margin-top:var(--bio-nexus-space-1);color:var(--bio-nexus-color-text-muted)}.results-email-actions{display:flex;align-items:flex-end;gap:var(--bio-nexus-space-2);flex-wrap:wrap}.results-email-actions .bio-nexus-action{min-height:44px}.results-email-summary{display:flex;gap:var(--bio-nexus-space-4);padding:var(--bio-nexus-space-3);border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface-soft);color:var(--bio-nexus-color-text-muted)}.results-email-summary strong{color:var(--bio-nexus-color-primary-strong)}@media(max-width:900px){.results-email-header{align-items:stretch;flex-direction:column}.results-email-actions{align-items:stretch}.results-email-actions>*{flex:1 1 180px}}@media(max-width:560px){.results-email-summary{display:grid;gap:var(--bio-nexus-space-2)}}
</style>
