<template>
  <section class="tax-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert">
      <strong>No fue posible cargar los impuestos.</strong>
      <span>{{ loadError }}</span>
    </div>

    <section class="bio-nexus-administrative-directory">
      <div v-if="loading" class="bio-nexus-empty-state">Cargando impuestos...</div>
      <BioNexusDataGrid
        v-else
        class="tax-grid"
        :row-data="rows"
        :column-defs="columns"
        :default-col-def="defaults"
        :components="components"
        :get-row-id="getRowId"
        :search-enabled="true"
        v-model:search-model-value="search"
        search-placeholder="Buscar impuesto"
        :refresh-enabled="true"
        :refreshing="loading"
        :refresh-disabled="saving"
        :page-size="10"
        :page-size-selector="[10, 20, 50, 100]"
        :min-grid-height="300"
        :max-grid-height="560"
        empty-text="No existen impuestos para mostrar."
        @refresh="load"
        @row-context-menu="openContextMenu"
      >
        <template #actions>
          <button
            v-if="canCreate"
            type="button"
            class="bio-nexus-action bio-nexus-action-primary"
            :disabled="saving"
            @click="formDialog?.openCreate()"
          >
            <BioNexusActionIcon action="create" />
            <span>Nuevo impuesto</span>
          </button>
        </template>
      </BioNexusDataGrid>

      <BioNexusContextMenu
        ref="contextMenu"
        :open="contextState.open"
        :x="contextState.x"
        :y="contextState.y"
        :items="contextItems"
        @select="runContextAction"
        @close="closeContextMenu"
      />
    </section>

    <TaxDialog ref="formDialog" :saving="saving" @submit="save" />
    <TaxDeleteDialog ref="deleteDialog" :saving="saving" @confirm="remove" />
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusGridActionsCell from "@/components/grid/BioNexusGridActionsCell.vue";
import BioNexusGridToggleCell from "@/components/grid/BioNexusGridToggleCell.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusContextMenu from "@/components/ui/BioNexusContextMenu.vue";
import TaxDialog from "@/components/tax/TaxDialog.vue";
import TaxDeleteDialog from "@/components/tax/TaxDeleteDialog.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { createTax, deleteTax, getTaxes, getTaxErrorMessage, updateTax } from "@/services/taxService";
import { useAuthorizationStore } from "@/stores/authorization";

const authorization = useAuthorizationStore();
const toast = useBioNexusToast();
const rows = ref([]);
const loading = ref(false);
const saving = ref(false);
const loadError = ref("");
const search = ref("");
const formDialog = ref(null);
const deleteDialog = ref(null);
const contextMenu = ref(null);
const contextState = ref({ open: false, x: 0, y: 0, row: null });

const canCreate = computed(() => authorization.hasPermission("tax.create"));
const canUpdate = computed(() => authorization.hasPermission("tax.update"));
const canDelete = computed(() => authorization.hasPermission("tax.delete"));
const defaults = Object.freeze({ sortable: true, filter: true, resizable: true, suppressHeaderMenuButton: true });
const components = Object.freeze({ BioNexusGridActionsCell, BioNexusGridToggleCell });
const yesNo = Object.freeze([{ value: true, label: "Si" }, { value: false, label: "No" }]);

const contextItems = computed(() => {
  const row = contextState.value.row;
  if (!row) return [];
  return [
    { key: "edit", label: "Editar", icon: "edit", visible: canUpdate.value, disabled: saving.value, action: () => formDialog.value?.openEdit(row) },
    { key: "delete", label: "Eliminar", icon: "delete", visible: canDelete.value, disabled: saving.value, action: () => deleteDialog.value?.open(row) },
  ];
});

function toggleColumn(field, headerName, width, onLabel = "Si", offLabel = "No") {
  return {
    field,
    headerName,
    width,
    minWidth: width,
    filter: BioNexusOptionFilter,
    filterParams: { options: yesNo },
    headerClass: "tax-center-header",
    cellClass: "tax-center-cell",
    cellRenderer: BioNexusGridToggleCell,
    cellRendererParams: {
      onLabel,
      offLabel,
      ariaLabel: headerName,
      disabled: () => !canUpdate.value || saving.value,
      onToggle: (row) => toggleBoolean(row, field),
    },
  };
}

const columns = computed(() => [
  { field: "description", headerName: "Descripcion", minWidth: 220, flex: 1 },
  { field: "value", headerName: "Porcentaje", width: 150, minWidth: 150, headerClass: "tax-center-header", cellClass: "tax-center-cell", valueFormatter: ({ value }) => `${Number(value).toFixed(2)} %` },
  toggleColumn("only_dollars", "Solo dolares", 170),
  toggleColumn("always_subtotal", "Fijo en subtotal", 180),
  toggleColumn("hide", "Oculto", 150),
  {
    headerName: "Acciones",
    colId: "actions",
    width: 110,
    minWidth: 110,
    maxWidth: 110,
    pinned: "right",
    lockPinned: true,
    sortable: false,
    filter: false,
    resizable: false,
    suppressMovable: true,
    headerClass: "bio-nexus-grid-actions-header",
    cellClass: "bio-nexus-grid-actions-cell",
    cellRenderer: BioNexusGridActionsCell,
    cellRendererParams: {
      actions: [
        { key: "edit", label: "Editar", icon: "edit", visible: () => canUpdate.value, disabled: () => saving.value, onClick: (row) => formDialog.value?.openEdit(row) },
        { key: "delete", label: "Eliminar", icon: "delete", visible: () => canDelete.value, disabled: () => saving.value, onClick: (row) => deleteDialog.value?.open(row) },
      ],
    },
  },
]);

function getRowId({ data }) { return String(data.id); }
function replace(value) {
  const next = rows.value.map((row) => row.id === value.id ? value : row);
  if (!next.some((row) => row.id === value.id)) next.push(value);
  rows.value = next.sort((left, right) => left.description.localeCompare(right.description));
}
async function openContextMenu({ event, row }) {
  if (!event || !row || (!canUpdate.value && !canDelete.value)) return;
  event.preventDefault();
  contextState.value = { open: true, x: event.clientX, y: event.clientY, row };
  await nextTick();
  contextMenu.value?.positionMenu?.();
}
function closeContextMenu() { contextState.value = { open: false, x: 0, y: 0, row: null }; }
async function runContextAction(item) {
  const action = item?.action;
  closeContextMenu();
  if (typeof action === "function") await action();
}
async function load() {
  if (loading.value || saving.value) return;
  loading.value = true;
  loadError.value = "";
  try { rows.value = await getTaxes(); }
  catch (error) { rows.value = []; loadError.value = getTaxErrorMessage(error, "No fue posible consultar los impuestos."); toast.error(loadError.value); }
  finally { loading.value = false; }
}
async function toggleBoolean(row, field) {
  if (!canUpdate.value || saving.value || !row) return;
  saving.value = true;
  closeContextMenu();
  try {
    const saved = await updateTax(row.id, { ...row, [field]: !row[field] });
    replace(saved);
    toast.success("Impuesto actualizado correctamente.");
  }
  catch (error) { toast.error(getTaxErrorMessage(error, "No fue posible actualizar el impuesto.")); }
  finally { saving.value = false; }
}
async function save(payload) {
  if (saving.value) return;
  saving.value = true;
  formDialog.value?.clearError();
  try {
    const value = payload.mode === "create" ? await createTax(payload.values) : await updateTax(payload.record.id, payload.values);
    replace(value);
    formDialog.value?.close();
    toast.success(payload.mode === "create" ? "Impuesto creado correctamente." : "Impuesto actualizado correctamente.");
  }
  catch (error) { formDialog.value?.setError(getTaxErrorMessage(error, "No fue posible guardar el impuesto.")); }
  finally { saving.value = false; }
}
async function remove(record) {
  if (saving.value || !record) return;
  saving.value = true;
  deleteDialog.value?.clearError();
  try {
    await deleteTax(record.id);
    rows.value = rows.value.filter((row) => row.id !== record.id);
    deleteDialog.value?.close();
    toast.success("Impuesto eliminado correctamente.");
  }
  catch (error) { deleteDialog.value?.setError(getTaxErrorMessage(error, "No fue posible eliminar el impuesto.")); }
  finally { saving.value = false; }
}

onMounted(load);
</script>

<style scoped>
.tax-page,.tax-grid{min-width:0}
.tax-grid :deep(.tax-center-header .ag-header-cell-label){justify-content:center}
.tax-grid :deep(.tax-center-cell){display:flex;align-items:center;justify-content:center;text-align:center}
.tax-grid :deep(.bio-nexus-grid-actions-header .ag-header-cell-label),.tax-grid :deep(.bio-nexus-grid-actions-cell){justify-content:center}
.tax-grid :deep(.ag-pinned-right-header),.tax-grid :deep(.ag-pinned-right-cols-container){border-left:1px solid var(--bio-nexus-color-border-strong)}
</style>