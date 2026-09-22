<template>
  <section class="dollar-value-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert">
      <strong>No fue posible cargar la cotizaci&#243;n.</strong>
      <span>{{ loadError }}</span>
    </div>

    <section class="dollar-value-automation-panel">
      <div class="automation-main">
        <div class="automation-heading">
          <span class="automation-eyebrow">ACTUALIZACIÓN PROGRAMADA</span>
          <div class="automation-title-row">
            <strong class="automation-title">Actualización automática</strong>
            <span class="automation-status" :class="{ 'automation-status-active': Boolean(automation.enabled) }">
              {{ automation.enabled ? "Activa" : "Desactivada" }}
            </span>
          </div>
          <span class="automation-description">Consulta el BCV de lunes a viernes y utiliza DolarApi como respaldo.</span>
        </div>
        <div class="automation-controls">
          <BioNexusCheckbox
            :model-value="Boolean(automation.enabled)"
            label="Actualizar automáticamente"
            :disabled="!canUpdate || automationSaving"
            @update:model-value="automation.enabled = Boolean($event)"
          />
          <BioNexusFormField class="automation-time-field" label="Hora" field-id="automation-time">
            <input id="automation-time" v-model="automation.run_time" class="bio-nexus-field" type="time" :disabled="!canUpdate || automationSaving">
          </BioNexusFormField>
        </div>
      </div>

      <div class="automation-footer">
        <div class="automation-meta">
          <span><b>Zona:</b> {{ automation.time_zone || "America/Caracas" }}</span>
          <span><b>Estado:</b> {{ automation.last_status || "Sin ejecuciones" }}</span>
          <span><b>Fuente:</b> {{ automation.last_source || "BCV / DolarApi" }}</span>
        </div>
        <div v-if="canUpdate" class="automation-actions">
          <BioNexusActionButton icon="play_circle" variant="secondary" :loading="automationRunning" :disabled="automationSaving" @click="runAutomation">Ejecutar ahora</BioNexusActionButton>
          <BioNexusActionButton icon="save" variant="primary" :loading="automationSaving" :disabled="automationRunning" @click="saveAutomation">Guardar configuración</BioNexusActionButton>
        </div>
      </div>
    </section>

    <section class="dollar-value-summary">
      <div class="current-value">
        <span class="current-value-section">PUBLICACIÓN MANUAL</span>
        <span class="current-value-label">Valor vigente</span>
        <strong>{{ current ? formatAmount(current.value) : "Sin registro" }}</strong>
        <span class="current-value-date">{{ current ? formatDate(current.date) : "No existe una cotizaci\u00f3n registrada." }}</span>
      </div>

      <form v-if="canUpdate" class="publish-form" @submit.prevent="publish">
        <BioNexusFormField label="Nuevo valor" field-id="dollar-value-input" required>
          <input
            id="dollar-value-input"
            v-model.trim="draft"
            class="bio-nexus-field"
            inputmode="decimal"
            autocomplete="off"
            :disabled="saving"
            placeholder="0,00"
          >
        </BioNexusFormField>
        <BioNexusActionButton icon="publish" type="submit" variant="primary" :loading="saving" :disabled="loading">
          Publicar valor
        </BioNexusActionButton>
      </form>
    </section>

    <section class="bio-nexus-administrative-directory dollar-value-directory">
      <header class="dollar-value-history-header">
        <div>
          <span class="dollar-value-section-eyebrow">REGISTRO DE CAMBIOS</span>
          <h2>Historial de cotizaciones</h2>
        </div>
        <span class="dollar-value-history-count">{{ history.length }} registro(s)</span>
      </header>
      <BioNexusDataGrid
        class="dollar-value-grid"
        :row-data="history"
        :column-defs="columnDefs"
        :default-col-def="defaultColDef"
        :get-row-id="getRowId"
        :quick-filter-text="searchText"
        :search-enabled="true"
        v-model:search-model-value="searchText"
        search-placeholder="Buscar en el historial"
        :refresh-enabled="true"
        :refreshing="loading"
        :refresh-disabled="saving"
        :page-size="10"
        :page-size-selector="[10, 20, 50, 100]"
        :min-grid-height="300"
        :max-grid-height="560"
        empty-text="No existen cotizaciones registradas."
        @refresh="load"
      >
      </BioNexusDataGrid>
    </section>
  </section>
</template>

<script setup>
import BioNexusCheckbox from "../components/ui/BioNexusCheckbox.vue";
import { computed, onMounted, ref } from "vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { dollarValueError, getCurrentDollarValue, getDollarValueAutomation, getDollarValueHistory, publishDollarValue, runDollarValueAutomation, saveDollarValueAutomation } from "@/services/dollarValueService";
import { useAuthorizationStore } from "@/stores/authorization";
import { useRegionalSettingsStore } from "@/stores/regionalSettings";
import { formatRegionalAmount, formatRegionalDateTime } from "@/services/regionalFormatter";

const authorizationStore = useAuthorizationStore();
const regionalSettingsStore = useRegionalSettingsStore();
const toast = useBioNexusToast();
const current = ref(null);
const history = ref([]);
const draft = ref("");
const searchText = ref("");
const loading = ref(false);
const saving = ref(false);
const loadError = ref("");
const automation = ref({ enabled: false, run_time: "18:00", time_zone: "America/Caracas", last_status: null, last_source: null });
const automationSaving = ref(false);
const automationRunning = ref(false);
const canUpdate = computed(() => authorizationStore.hasPermission("dollar-value.update"));
const defaultColDef = Object.freeze({ sortable: true, filter: true, resizable: true, suppressHeaderMenuButton: true });
const columnDefs = computed(() => [
  {
    field: "date",
    headerName: "Fecha efectiva",
    minWidth: 260,
    flex: 1,
    filter: "agDateColumnFilter",
    valueFormatter: ({ value }) => formatDate(value),
  },
  {
    field: "value",
    headerName: "Valor",
    width: 220,
    minWidth: 180,
    maxWidth: 260,
    filter: "agNumberColumnFilter",
    headerClass: "dollar-value-number-header",
    cellClass: "dollar-value-number-cell",
    valueFormatter: ({ value }) => formatAmount(value),
  },
]);

function getRowId({ data }) {
  return String(data.id);
}

function formatAmount(value) { return formatRegionalAmount(value, regionalSettingsStore.settings); }
function formatDate(value) { return formatRegionalDateTime(value, regionalSettingsStore.settings); }
async function load() {
  if (loading.value || saving.value) return;
  loading.value = true;
  loadError.value = "";
  try {
    const [active, rows, automatic] = await Promise.allSettled([getCurrentDollarValue(), getDollarValueHistory(), getDollarValueAutomation()]);
    current.value = active.status === "fulfilled" ? active.value : null;
    history.value = rows.status === "fulfilled" ? rows.value : [];
    if (automatic.status === "fulfilled") automation.value = automatic.value;
    if (active.status === "rejected" && rows.status === "rejected") throw active.reason;
  }
  catch (error) {
    loadError.value = dollarValueError(error, "No fue posible consultar el valor del d\u00f3lar.");
    toast.error(loadError.value);
  }
  finally {
    loading.value = false;
  }
}

async function saveAutomation() {
  if (automationSaving.value) return;
  automationSaving.value = true;
  try {
    automation.value = await saveDollarValueAutomation({ enabled: Boolean(automation.value.enabled), run_time: automation.value.run_time });
    toast.success("Configuración automática guardada correctamente.");
  } catch (error) { toast.error(dollarValueError(error, "No fue posible guardar la automatización.")); }
  finally { automationSaving.value = false; }
}

async function runAutomation() {
  if (automationRunning.value) return;
  automationRunning.value = true;
  try {
    const result = await runDollarValueAutomation();
    if (result?.status === "FAILED") throw new Error(result.error || "La consulta automática falló.");
    toast.success(result?.status === "UNCHANGED" ? "La cotización vigente no cambió." : "Cotización automática actualizada.");
    await load();
  } catch (error) { toast.error(dollarValueError(error, "No fue posible ejecutar la actualización automática.")); }
  finally { automationRunning.value = false; }
}

async function publish() {
  if (saving.value) return;
  saving.value = true;
  try {
    const saved = await publishDollarValue(draft.value.replace(",", "."));
    if (!saved) throw new Error("El Backend no devolvi\u00f3 una cotizaci\u00f3n v\u00e1lida.");
    draft.value = "";
    toast.success("Valor del d\u00f3lar publicado correctamente.");
    saving.value = false;
    await load();
  }
  catch (error) {
    toast.error(dollarValueError(error, "No fue posible publicar el valor del d\u00f3lar."));
  }
  finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.dollar-value-page,
.dollar-value-directory,
.dollar-value-grid {
  min-width: 0;
}

.dollar-value-page {
  display: grid;
  gap: var(--bio-nexus-space-4);
}

.dollar-value-summary {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(360px, auto);
  align-items: center;
  gap: var(--bio-nexus-space-5);
  padding: var(--bio-nexus-space-4);
  border: 1px solid var(--bio-nexus-color-border);
  border-radius: var(--bio-nexus-radius-md);
  background: var(--bio-nexus-color-surface);
}

.current-value {
  display: grid;
  gap: var(--bio-nexus-space-1);
}

.current-value-section,
.dollar-value-section-eyebrow {
  color: var(--bio-nexus-color-accent);
  font-size: var(--bio-nexus-font-size-xs);
  font-weight: var(--bio-nexus-font-weight-bold);
  letter-spacing: .06em;
  text-transform: uppercase;
}

.current-value-label {
  color: var(--bio-nexus-color-text-muted);
  font-size: var(--bio-nexus-font-size-xs);
  font-weight: var(--bio-nexus-font-weight-bold);
  letter-spacing: .04em;
  text-transform: uppercase;
}

.current-value strong {
  color: var(--bio-nexus-color-primary-strong);
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.current-value-date {
  color: var(--bio-nexus-color-text-secondary);
  font-size: var(--bio-nexus-font-size-sm);
}

.publish-form {
  display: grid;
  grid-template-columns: minmax(190px, 240px) auto;
  align-items: end;
  gap: var(--bio-nexus-space-3);
}

.publish-form .bio-nexus-action-button {
  min-height: var(--bio-nexus-control-height);
}

.history-stat {
  color: var(--bio-nexus-color-text-secondary);
  font-size: var(--bio-nexus-font-size-sm);
  font-weight: var(--bio-nexus-font-weight-bold);
}

.dollar-value-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--bio-nexus-space-3);
  padding: var(--bio-nexus-space-4);
  border: 1px solid var(--bio-nexus-color-border);
  border-bottom: 0;
  border-radius: var(--bio-nexus-radius-md) var(--bio-nexus-radius-md) 0 0;
  background: var(--bio-nexus-color-surface);
}
.dollar-value-history-header > div { display: grid; gap: var(--bio-nexus-space-1); }
.dollar-value-history-header h2 { margin: 0; color: var(--bio-nexus-color-text); font-size: 1.2rem; line-height: 1.2; }
.dollar-value-history-count { color: var(--bio-nexus-color-text-secondary); font-size: var(--bio-nexus-font-size-sm); font-weight: var(--bio-nexus-font-weight-bold); }

.dollar-value-grid {
  width: 100%;
}

.dollar-value-grid :deep(.dollar-value-number-header .ag-header-cell-label) {
  justify-content: flex-end;
}

.dollar-value-grid :deep(.dollar-value-number-cell) {
  justify-content: flex-end;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.dollar-value-automation-panel {
  display: grid;
  gap: var(--bio-nexus-space-3);
  padding: var(--bio-nexus-space-4);
  border: 1px solid var(--bio-nexus-color-border);
  border-radius: var(--bio-nexus-radius-md);
  background: var(--bio-nexus-color-surface);
}

.automation-main,
.automation-footer,
.automation-title-row,
.automation-controls,
.automation-meta,
.automation-actions {
  display: flex;
  align-items: center;
}

.automation-main,
.automation-footer {
  justify-content: space-between;
  gap: var(--bio-nexus-space-4);
}

.automation-heading {
  display: grid;
  gap: var(--bio-nexus-space-1);
  min-width: 0;
}

.automation-title-row {
  gap: var(--bio-nexus-space-2);
}

.automation-eyebrow {
  color: var(--bio-nexus-color-accent);
  font-size: var(--bio-nexus-font-size-xs);
  font-weight: var(--bio-nexus-font-weight-bold);
  letter-spacing: .06em;
  text-transform: uppercase;
}

.automation-title {
  color: var(--bio-nexus-color-text);
  font-size: 1.2rem;
  font-weight: var(--bio-nexus-font-weight-bold);
  line-height: 1.2;
}
.automation-status {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--bio-nexus-color-surface-muted);
  color: var(--bio-nexus-color-text-muted);
  font-size: var(--bio-nexus-font-size-xs);
  font-weight: var(--bio-nexus-font-weight-bold);
}

.automation-status-active {
  background: color-mix(in srgb, var(--bio-nexus-color-success) 12%, transparent);
  color: var(--bio-nexus-color-success);
}

.automation-description,
.automation-meta {
  color: var(--bio-nexus-color-text-secondary);
  font-size: var(--bio-nexus-font-size-sm);
}

.automation-controls,
.automation-actions {
  flex: 0 0 auto;
  gap: var(--bio-nexus-space-3);
}

.automation-controls {
  align-items: end;
}

.automation-time-field {
  width: 148px;
}

.automation-time-field :deep(.bio-nexus-field) {
  width: 100%;
}

.automation-footer {
  padding-top: var(--bio-nexus-space-3);
  border-top: 1px solid var(--bio-nexus-color-border);
}

.automation-meta {
  flex-wrap: wrap;
  gap: var(--bio-nexus-space-4);
}

@media (max-width: 780px) {
  .automation-main,
  .automation-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .automation-controls,
  .automation-actions {
    flex-wrap: wrap;
  }

  .automation-actions {
    justify-content: flex-end;
  }

  .dollar-value-summary,
  .publish-form {
    grid-template-columns: 1fr;
  }
}
</style>
