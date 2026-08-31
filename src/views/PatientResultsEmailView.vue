<template>
  <main class="results-email-view">
    <section class="bio-nexus-panel results-email-filter" aria-label="Filtros de entrega de resultados">
      <div class="results-email-filter-copy">
        <span>Consulta por fecha</span>
        <p>Seleccione la fecha de ingreso para consultar pacientes con resultados aprobados.</p>
      </div>
      <div class="results-email-filter-controls">
        <BioNexusFormField label="Desde" field-id="results-email-date-from" required>
          <input id="results-email-date-from" v-model="dateFrom" class="bio-nexus-field" type="date" :disabled="busy" />
        </BioNexusFormField>
        <BioNexusFormField label="Hasta" field-id="results-email-date-to" required>
          <input id="results-email-date-to" v-model="dateTo" class="bio-nexus-field" type="date" :min="dateFrom" :disabled="busy" />
        </BioNexusFormField>
        <button type="button" class="bio-nexus-action bio-nexus-action-primary" :disabled="busy || !rangeValid" @click="loadCandidates">
          <BioNexusActionIcon action="search" />
          <span>{{ loading ? "Consultando..." : "Consultar" }}</span>
        </button>
      </div>
    </section>

    <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>

    <BioNexusDataGrid
      class="results-email-grid"
      :row-data="rows"
      :column-defs="columns"
      :default-col-def="defaultColDef"
      :get-row-id="getRowId"
      :row-selection="rowSelection"
      :search-enabled="true"
      v-model:search-model-value="search"
      :quick-filter-text="search"
      :refresh-enabled="true"
      :refreshing="loading"
      :refresh-disabled="busy || !rangeValid"
      :export-options="false"
      :min-grid-height="340"
      :max-grid-height="620"
      empty-text="Seleccione una fecha y consulte los pacientes aprobados."
      @grid-ready="onGridReady"
      @refresh="loadCandidates"
      @row-context-menu="openContextMenu"
    >
      <template #stats>
        <div class="results-email-stats" aria-label="Resumen de resultados">
          <span><strong>{{ rows.length }}</strong> candidatos</span>
          <span><strong>{{ selected.length }}</strong> seleccionados</span>
          <span><strong>{{ sentCount }}</strong> enviados</span>
        </div>
      </template>
      <template #actions>
        <button
          v-if="canSend"
          type="button"
          class="bio-nexus-action bio-nexus-action-primary"
          :disabled="busy || selected.length === 0"
          @click="sendDialog?.open()"
        >
          <BioNexusActionIcon action="send" />
          <span>Enviar ({{ selected.length }})</span>
        </button>
      </template>
    </BioNexusDataGrid>

    <BioNexusContextMenu
      ref="contextMenu"
      :open="contextMenuState.open"
      :x="contextMenuState.x"
      :y="contextMenuState.y"
      :items="contextMenuItems"
      @close="closeContextMenu"
      @select="handleContextMenuSelect"
    />

    <PatientResultsEmailSendDialog ref="sendDialog" :records="selected" :sending="sending" @confirm="sendSelected" />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useAuthorizationStore } from "@/stores/authorization";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusContextMenu from "@/components/ui/BioNexusContextMenu.vue";
import PatientResultsEmailSendDialog from "@/components/patients/PatientResultsEmailSendDialog.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { buildPatientResultHtml } from "@/services/patientResultReportBuilder";
import {
  getPatientResultApprover,
  getPatientResultLaboratory,
  getPatientResultsEmailCandidates,
  getValidatedPatientResults,
  sendPatientResultsEmail,
} from "@/services/patientResultsEmailService";

const authorization = useAuthorizationStore();
const toast = useBioNexusToast();
const dateFrom = ref("");
const dateTo = ref("");
const rows = ref([]);
const selected = ref([]);
const search = ref("");
const loading = ref(false);
const sending = ref(false);
const errorMessage = ref("");
const sendDialog = ref(null);
const gridApi = ref(null);
const contextMenu = ref(null);
const contextMenuState = ref({ open: false, x: 0, y: 0, row: null });

const busy = computed(() => loading.value || sending.value);
const canSend = computed(() => authorization.hasPermission("patient-results-email.send"));
const rangeValid = computed(() => Boolean(dateFrom.value && dateTo.value && dateFrom.value <= dateTo.value));
const contextMenuItems = computed(() => [{
  key: "send", label: "Enviar resultados por correo", icon: "send",
  disabled: !canSend.value || busy.value || Boolean(contextMenuState.value.row?.email_status),
}]);
const sentCount = computed(() => rows.value.filter((row) => row.email_status).length);
const rowSelection = computed(() => ({
  mode: "multiRow",
  checkboxes: canSend.value,
  headerCheckbox: canSend.value,
  enableClickSelection: canSend.value,
  isRowSelectable: (node) => canSend.value && !Boolean(node.data?.email_status),
}));
const defaultColDef = { minWidth: 90, flex: 1 };
const columns = [
  { field: "patient_position", headerName: "Sec. / #", valueGetter: ({ data }) => `${data?.patient_position ?? ""} / ${data?.id ?? ""}`, minWidth: 105, maxWidth: 135, flex: 0 },
  { field: "name", headerName: "Paciente", minWidth: 180, flex: 1.35 },
  { headerName: "Edad", valueGetter: ({ data }) => `${data?.age ?? ""} ${data?.month_year ?? ""}`.trim(), minWidth: 90, maxWidth: 120, flex: 0 },
  { field: "admission_time", headerName: "Hora ingreso", minWidth: 110, maxWidth: 140, flex: 0 },
  { field: "phone", headerName: "Tel\u00e9fono", minWidth: 120, flex: 0.8 },
  { field: "email", headerName: "Correo", minWidth: 190, flex: 1.3 },
  { field: "email_status", headerName: "Estado", valueFormatter: ({ value }) => value ? "Enviado" : "Pendiente", minWidth: 105, maxWidth: 125, flex: 0 },
  {
    colId: "actions", headerName: "Acciones", width: 92, minWidth: 92, maxWidth: 92, flex: 0,
    sortable: false, filter: false, resizable: false, suppressExport: true,
    cellRenderer: (params) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "results-email-row-action";
      button.title = params.data?.email_status ? "Resultados enviados" : "Enviar resultados por correo";
      button.setAttribute("aria-label", button.title);
      button.disabled = !canSend.value || busy.value || Boolean(params.data?.email_status);
      button.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">send</span>';
      button.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); prepareSingleSend(params.data); });
      return button;
    },
  },
];

function getRowId({ data }) { return String(data.id); }
function syncSelection() { selected.value = gridApi.value?.getSelectedRows?.() ?? []; }
function onGridReady(event) {
  gridApi.value = event.api;
  event.api.addEventListener("selectionChanged", syncSelection);
}
function prepareSingleSend(row) {
  if (!row || !canSend.value || busy.value || row.email_status) return;
  selected.value = [row];
  gridApi.value?.deselectAll?.();
  gridApi.value?.getRowNode?.(String(row.id))?.setSelected?.(true);
  sendDialog.value?.open();
}
async function openContextMenu({ event, row }) {
  contextMenuState.value = { open: true, x: event.clientX, y: event.clientY, row };
  await contextMenu.value?.positionMenu?.();
}
function closeContextMenu() { contextMenuState.value = { open: false, x: 0, y: 0, row: null }; }
function handleContextMenuSelect(item) {
  const row = contextMenuState.value.row;
  closeContextMenu();
  if (item?.key === "send") prepareSingleSend(row);
}
async function loadCandidates() {
  if (!rangeValid.value || busy.value) return;
  loading.value = true;
  errorMessage.value = "";
  selected.value = [];
  try {
    rows.value = await getPatientResultsEmailCandidates(dateFrom.value, dateTo.value);
  } catch (error) {
    errorMessage.value = messageFor(error);
    rows.value = [];
  } finally {
    loading.value = false;
  }
}
async function sendSelected() {
  if (!canSend.value || sending.value || selected.value.length === 0) return;
  sending.value = true;
  sendDialog.value?.setError("");
  let success = 0;
  const failures = [];
  try {
    const laboratory = await getPatientResultLaboratory();
    for (const candidate of [...selected.value]) {
      try {
        const patient = await getValidatedPatientResults(candidate.id);
        const html = await buildPatientResultHtml(patient, laboratory, getPatientResultApprover);
        await sendPatientResultsEmail(candidate.id, html);
        success += 1;
      } catch (error) {
        failures.push(`${candidate.patient_position ?? candidate.id}: ${messageFor(error)}`);
      }
    }
    sendDialog.value?.close();
    await loadCandidates();
    if (success) toast.success(`${success} entrega${success === 1 ? "" : "s"} confirmada${success === 1 ? "" : "s"}.`);
    if (failures.length) toast.error(`${failures.length} entrega${failures.length === 1 ? "" : "s"} no completada${failures.length === 1 ? "" : "s"}. Revise los pacientes pendientes.`);
  } finally {
    sending.value = false;
  }
}
function messageFor(error) {
  const code = String(error?.message || "");
  const messages = {
    PATIENT_RESULTS_EMAIL_DATE_RANGE_INVALID: "El rango de fechas no es vÃ¡lido.",
    PATIENT_RESULTS_EMAIL_DATE_RANGE_TOO_LARGE: "El rango no puede superar 31 dÃ­as.",
    PATIENT_RESULTS_EMAIL_ALREADY_SENT: "Los resultados ya fueron enviados.",
    PATIENT_RESULTS_EMAIL_NOT_APPROVED: "No existen resultados aprobados.",
    PATIENT_RESULTS_EMAIL_CONFIGURATION_INVALID: "La configuraci\u00f3n de correo no est\u00e1 completa.",
    PATIENT_RESULTS_EMAIL_ADDRESS_INVALID: "El correo del paciente no es v\u00e1lido.",
    PATIENT_RESULTS_EMAIL_IN_PROGRESS: "El paciente ya est\u00e1 siendo procesado.",
    BIO_NEXUS_REQUEST_TIMEOUT: "La operaci\u00f3n excedi\u00f3 el tiempo permitido.",
  };
  return messages[code] || "No fue posible completar la operaci\u00f3n.";
}
onBeforeUnmount(() => gridApi.value?.removeEventListener?.("selectionChanged", syncSelection));
</script>

<style scoped>
.results-email-view {
  display: grid;
  gap: var(--bio-nexus-space-4);
  min-width: 0;
}
.results-email-filter {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--bio-nexus-space-4);
  padding: var(--bio-nexus-space-4);
}
.results-email-filter-copy {
  display: grid;
  gap: var(--bio-nexus-space-1);
  min-width: 0;
}
.results-email-filter-copy > span {
  color: var(--bio-nexus-color-primary-strong);
  font-size: var(--bio-nexus-font-size-md);
  font-weight: var(--bio-nexus-font-weight-bold);
}
.results-email-filter-copy > p {
  margin: 0;
  color: var(--bio-nexus-color-text-muted);
  font-size: var(--bio-nexus-font-size-sm);
}
.results-email-filter-controls {
  display: flex;
  align-items: end;
  gap: var(--bio-nexus-space-2);
  flex: 0 0 auto;
}
.results-email-filter-controls :deep(.bio-nexus-form-field) {
  width: 190px;
}
.results-email-filter-controls .bio-nexus-action {
  min-height: var(--bio-nexus-control-height);
}
.results-email-stats {
  display: inline-flex;
  align-items: center;
  gap: var(--bio-nexus-space-3);
  color: var(--bio-nexus-color-text-muted);
  font-size: var(--bio-nexus-font-size-sm);
}
.results-email-stats strong {
  color: var(--bio-nexus-color-primary-strong);
  font-variant-numeric: tabular-nums;
}
.results-email-grid {
  min-width: 0;
}
@media (max-width: 860px) {
  .results-email-filter {
    align-items: stretch;
    flex-direction: column;
  }
  .results-email-filter-controls {
    align-items: stretch;
  }
  .results-email-filter-controls :deep(.bio-nexus-form-field) {
    width: auto;
    flex: 1 1 190px;
  }
}
@media (max-width: 560px) {
  .results-email-filter-controls {
    flex-direction: column;
  }
  .results-email-filter-controls .bio-nexus-action {
    width: 100%;
  }
  .results-email-stats {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--bio-nexus-space-1);
  }
}

.results-email-view :deep(.results-email-row-action) { display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;margin:auto;border:1px solid var(--bio-nexus-color-border-strong);border-radius:var(--bio-nexus-radius-sm);background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-primary-strong);cursor:pointer; }
.results-email-view :deep(.results-email-row-action:hover:not(:disabled)) { border-color:var(--bio-nexus-color-primary);background:var(--bio-nexus-color-info-soft); }
.results-email-view :deep(.results-email-row-action:disabled) { opacity:.45;cursor:not-allowed; }
.results-email-view :deep(.results-email-row-action .material-symbols-rounded) { font-size:18px; }
</style>
