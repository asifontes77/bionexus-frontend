<template>
  <section class="parasitic-page">
    <div v-if="loadError" class="toro-message toro-message-error" role="alert">
      <strong>No fue posible cargar las formas parasitarias.</strong>
      <span>{{ loadError }}</span>
    </div>

    <section class="toro-administrative-directory parasitic-directory">
      <div class="toro-administrative-toolbar parasitic-directory-toolbar">
        <label class="toro-administrative-filter parasitic-filter parasitic-search-filter">
          <span>Buscar descripcion</span>
          <input
            v-model.trim="searchText"
            type="search"
            placeholder="Escribe una descripcion"
          />
        </label>

        <label class="toro-administrative-filter parasitic-filter parasitic-status-filter">
          <span>Estado</span>
          <select v-model="statusFilter">
            <option value="all">Todos</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </label>

        <div class="toro-administrative-summary parasitic-directory-summary" aria-live="polite">
          <span><strong>{{ filteredRows.length }}</strong> resultados</span>
          <span><strong>{{ activeCount }}</strong> activos</span>
        </div>

        <div class="toro-administrative-actions parasitic-directory-actions">
          <button
            v-if="canCreate"
            type="button"
            class="toro-action toro-action-primary"
            :disabled="loading || saving"
            @click="openCreate"
          >
            <ToroActionIcon action="create" />
            <span>Nueva forma</span>
          </button>
          <button
            type="button"
            class="toro-action toro-action-primary"
            :disabled="loading || saving"
            @click="loadParasiticforms"
          >
            <ToroActionIcon action="refresh" />
            <span>{{ loading ? "Actualizando..." : "Actualizar" }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="toro-empty-state">Cargando formas parasitarias...</div>
      <div v-else-if="parasiticforms.length === 0" class="toro-empty-state">
        No existen formas parasitarias registradas.
      </div>
      <div v-else-if="filteredRows.length === 0" class="toro-empty-state">
        No existen registros que coincidan con los filtros.
      </div>
      <div v-else class="parasitic-grid-host">
        <ToroDataGrid
          ref="dataGrid"
          class="parasitic-grid"
          :row-data="filteredRows"
          :column-defs="columnDefs"
          :default-col-def="defaultColDef"
          :components="gridComponents"
          :get-row-id="getRowId"
          :quick-filter-text="searchText"
          :page-size="10"
          :page-size-selector="[10, 20, 50]"
          height="430px"
          empty-text="No existen formas parasitarias que coincidan con los filtros."
          @row-context-menu="openParasiticContextMenu"
      />

    <ToroContextMenu
      ref="parasiticContextMenu"
      :open="parasiticContextMenuState.open"
      :x="parasiticContextMenuState.x"
      :y="parasiticContextMenuState.y"
      :items="parasiticContextMenuItems"
      @select="runParasiticContextAction"
      @close="closeParasiticContextMenu"
    />
      </div>
    </section>

    <ParasiticformDialog
      ref="formDialog"
      :saving="saving"
      :can-create="canCreate"
      :can-update="canUpdateDescription"
      @submit="saveForm"
    />
    <ParasiticformStateDialog
      ref="stateDialog"
      :saving="saving"
      @confirm="saveState"
    />
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import ToroDataGrid from "@/components/grid/ToroDataGrid.vue";
import ToroGridToggleCell from "@/components/grid/ToroGridToggleCell.vue";
import ToroGridActionsCell from "@/components/grid/ToroGridActionsCell.vue";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";
import ParasiticformDialog from "@/components/parasiticforms/ParasiticformDialog.vue";
import ParasiticformStateDialog from "@/components/parasiticforms/ParasiticformStateDialog.vue";
import { useToroToast } from "@/composables/useToroToast";
import {
  createParasiticform,
  getParasiticformErrorMessage,
  getParasiticforms,
  updateParasiticform,
} from "@/services/parasiticformsService";
import { useAuthorizationStore } from "@/stores/authorization";
import ToroContextMenu from "@/components/ui/ToroContextMenu.vue";

const authorizationStore = useAuthorizationStore();
const toast = useToroToast();
const parasiticforms = ref([]);
const loading = ref(false);
const saving = ref(false);
const loadError = ref("");
const searchText = ref("");
const statusFilter = ref("all");
const formDialog = ref(null);
const stateDialog = ref(null);
const parasiticContextMenu = ref(null);
const parasiticContextMenuState = ref({ open: false, x: 0, y: 0, record: null });
const parasiticContextMenuItems = computed(() => {
  const record = parasiticContextMenuState.value.record;
  if (!record) return [];
  return [
    { key: "edit", icon: "edit", label: "Editar", visible: canUpdateDescription.value, disabled: saving.value, action: () => openEdit(record) },
    { key: "toggle-status", icon: record.annulled ? "activate" : "deactivate", label: record.annulled ? "Activar" : "Inactivar", visible: canChangeStatus.value, disabled: saving.value, action: () => openState(record) },
  ];
});
const dataGrid = ref(null);

const canCreate = computed(() => authorizationStore.hasPermission("parasiticforms.create"));
const canUpdateDescription = computed(() => authorizationStore.hasPermission("parasiticforms.update"));
const canChangeStatus = computed(() => authorizationStore.hasPermission("parasiticforms.change-status"));
const activeCount = computed(() => parasiticforms.value.filter((record) => !record.annulled).length);
const filteredRows = computed(() => {
  const search = searchText.value.toLocaleLowerCase();
  return parasiticforms.value
    .filter((record) => {
      if (statusFilter.value === "active" && record.annulled) return false;
      if (statusFilter.value === "inactive" && !record.annulled) return false;
      return search === "" || record.description.toLocaleLowerCase().includes(search);
    })
    .map((record) => ({ ...record, isActive: !record.annulled }));
});

const defaultColDef = Object.freeze({
  sortable: true,
  filter: true,
  resizable: true,
  suppressHeaderMenuButton: true,
});
const gridComponents = Object.freeze({ ToroGridActionsCell, ToroGridToggleCell });
const columnDefs = computed(() => [
  {
    field: "description",
    headerName: "Descripcion",
    flex: 1,
    minWidth: 280,
    filter: "agTextColumnFilter",
  },
  {
    field: "isActive",
    headerName: "Estado",
    width: 160,
    minWidth: 150,
    maxWidth: 180,
    filter: "agTextColumnFilter",
    valueFormatter: ({ value }) => (value ? "Activo" : "Inactivo"),

    headerClass: "toro-grid-toggle-header",
    cellClass: "toro-grid-toggle-cell",
    cellRenderer: ToroGridToggleCell,
  cellRendererParams: { onLabel: "Activo", offLabel: "Inactivo", ariaLabel: "Estado", disabled: () => !canChangeStatus.value || saving.value, onToggle: (row) => openState(row) },
  valueGetter: ({ data }) => Boolean(data?.isActive),
},


  {
    headerName: "Acciones",
    field: "actions",
    width: 110,
    sortable: false,
    filter: false,
    cellClass: "toro-grid-actions-cell",
    cellRenderer: ToroGridActionsCell,
    cellRendererParams: {
      actions: [
        {
          key: "edit",
          label: "Editar",
          visible: () => canUpdateDescription.value,
          disabled: () => saving.value,
          onClick: openEdit,
        },
      ],
    },
  }]);

function getRowId({ data }) { return String(data.id); }
function openCreate() { if (canCreate.value && !saving.value) formDialog.value?.openCreate(); }
async function openParasiticContextMenu({ event, row }) {
  if (!event || !row) return;
  event.preventDefault();
  parasiticContextMenuState.value = { open: true, x: event.clientX, y: event.clientY, record: row };
  await nextTick();
  parasiticContextMenu.value?.positionMenu?.();
}

function closeParasiticContextMenu() {
  parasiticContextMenuState.value = { open: false, x: 0, y: 0, record: null };
}

async function runParasiticContextAction(item) {
  const action = item?.action;
  closeParasiticContextMenu();
  if (typeof action === "function") await action();
}

function openEdit(record) { if (canUpdateDescription.value && !saving.value) formDialog.value?.openEdit(record); }
function openState(record) { if (canChangeStatus.value && !saving.value) stateDialog.value?.open(record); }
function replaceRecord(updated) {
  const index = parasiticforms.value.findIndex((record) => record.id === updated.id);
  const next = [...parasiticforms.value];
  if (index < 0) next.push(updated); else next[index] = updated;
  parasiticforms.value = next.sort((left, right) => left.description.localeCompare(right.description));

  nextTick(() => {
    const api = dataGrid.value?.getApi?.();
    api?.setGridOption?.('rowData', filteredRows.value);
    api?.refreshCells?.({ force: true });
    api?.redrawRows?.();
  });
}
async function saveForm({ mode, record, description }) {
  if (saving.value) return;
  saving.value = true;
  formDialog.value?.clearError();
  try {
    const updated = mode === "create" ? await createParasiticform(description) : await updateParasiticform(record.id, { description });
    if (!updated) throw new Error("El backend no devolvio un registro valido.");
    replaceRecord(updated);
    formDialog.value?.close();
    toast.success(mode === "create" ? "La forma parasitaria fue creada correctamente." : "La forma parasitaria fue actualizada correctamente.");
  } catch (error) {
    formDialog.value?.setError(getParasiticformErrorMessage(error, "No fue posible guardar la forma parasitaria."));
  } finally { saving.value = false; }
}
async function saveState(record) {
  if (saving.value || !canChangeStatus.value) return;
  saving.value = true;
  stateDialog.value?.clearError();
  try {
    const updated = await updateParasiticform(record.id, { annulled: !record.annulled });
    if (!updated) throw new Error("El backend no devolvio un registro valido.");
    replaceRecord(updated);
    stateDialog.value?.close();
    toast.success(updated.annulled ? "La forma parasitaria fue inactivada correctamente." : "La forma parasitaria fue activada correctamente.");
  } catch (error) {
    stateDialog.value?.setError(getParasiticformErrorMessage(error, "No fue posible cambiar el estado."));
  } finally { saving.value = false; }
}
async function loadParasiticforms() {
  if (loading.value || saving.value) return;
  loading.value = true;
  loadError.value = "";
  try { parasiticforms.value = await getParasiticforms(); }
  catch (error) {
    parasiticforms.value = [];
    loadError.value = getParasiticformErrorMessage(error, "No fue posible consultar el catalogo.");
    toast.error(loadError.value);
  } finally { loading.value = false; }
}
onMounted(loadParasiticforms);
</script>

<style scoped>
.parasitic-page { min-width: 0; }
.parasitic-grid-host { width: 100%; min-width: 0; }
.parasitic-grid { width: 100%; min-width: 0; }
@media (max-width: 1050px) { .parasitic-directory-toolbar { grid-template-columns: minmax(260px, 1fr) minmax(180px, 240px); } .parasitic-directory-summary, .parasitic-directory-actions { justify-content: flex-end; } }
@media (max-width: 720px) { .parasitic-directory-toolbar { grid-template-columns: 1fr; } .parasitic-directory-summary, .parasitic-directory-actions { justify-content: stretch; } .parasitic-directory-actions { display: grid; grid-template-columns: 1fr 1fr; } .parasitic-grid { height: 520px; min-height: 520px; } }
</style>
