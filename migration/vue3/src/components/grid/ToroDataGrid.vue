<template>
  <section
    class="toro-data-grid"
    :class="{
      'toro-data-grid-fill': fill,
    }"
    :style="[gridContainerStyle, adaptiveGridHeightStyle]"
  >
        <div class="toro-grid-export-toolbar">
      <ToroGridExportMenu :disabled="!gridApi" :column-provider="getExportColumns" @export="exportGrid" />
    </div>
<AgGridVue
      class="toro-ag-grid"
      :theme="gridTheme"
      :row-data="rowData"
      :column-defs="columnDefs"
      :default-col-def="resolvedDefaultColDef"
      :components="components"
      :context="context"
      :get-row-id="getRowId"
      :pagination="pagination"
      :pagination-page-size="pageSize"
      :pagination-page-size-selector="false"
      :locale-text="AG_GRID_LOCALE_ES"
      :quick-filter-text="quickFilterText"
      :animate-rows="true"
      :row-height="rowHeight"
      :header-height="headerHeight"
      :dom-layout="domLayout"
      :suppress-cell-focus="false"
      :suppress-row-click-selection="true"
      :overlay-no-rows-template="emptyOverlay"
      @grid-ready="handleGridReady"
      @first-data-rendered="handleFirstDataRendered"
          @cell-context-menu="handleCellContextMenu"
  :prevent-default-on-context-menu="true"
  @contextmenu.prevent.stop
/>

    <label v-if="pagination" class="toro-grid-page-size-control">
      <span>Tama&ntilde;o de P&aacute;gina:</span>
      <select
        v-model="selectedPageSize"
        aria-label="Tamano de Pagina"
        @change="changePageSize"
      >
        <option v-for="size in effectivePageSizeSelector" :key="size" :value="String(size)">
          {{ size }}
        </option>
        <option value="all">Todos</option>
      </select>
    </label>
  </section>
</template>

<script setup>
import { computed, shallowRef, ref } from "vue";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridVue } from "ag-grid-vue3";
import { AG_GRID_LOCALE_ES } from "@ag-grid-community/locale";
import ToroGridExportMenu from "@/components/grid/ToroGridExportMenu.vue";
import { exportGridToExcel, exportGridToPdf } from "@/services/gridExportService.js";

ModuleRegistry.registerModules([
  AllCommunityModule,
]);

const props = defineProps({
  rowData: {
    type: Array,
    default: () => [],
  },
  columnDefs: {
    type: Array,
    required: true,
  },
  defaultColDef: {
    type: Object,
    default: () => ({}),
  },
  components: {
    type: Object,
    default: () => ({}),
  },
  context: {
    type: Object,
    default: () => ({}),
  },
  getRowId: {
    type: Function,
    default: undefined,
  },
  quickFilterText: {
    type: String,
    default: "",
  },
  pagination: {
    type: Boolean,
    default: true,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  pageSizeSelector: {
    type: Array,
    default: () => [
      10,
      20,
      50,
      100,
    ],
  },
  rowHeight: {
    type: Number,
    default: 38,
  },
  headerHeight: {
    type: Number,
    default: 44,
  },
  height: {
    type: String,
    default: "420px",
  },
  fill: {
    type: Boolean,
    default: false,
  },
  domLayout: {
    type: String,
    default: "normal",
    validator: (value) =>
      [
        "normal",
        "autoHeight",
        "print",
      ].includes(value),
  },
  emptyText: {
    type: String,
    default: "No existen registros disponibles.",
  },
  autoSizeColumns: {
    type: Boolean,
    default: false,
  },
  exportOptions: {
    type: [Object, Boolean],
    default: true,
  },
  minGridHeight: {
    type: Number,
    default: 300,
  },
  maxGridHeight: {
    type: Number,
    default: 520,
  },
});

const emit = defineEmits([
  "grid-ready",
  "first-data-rendered",
  "row-context-menu",
]);

const gridApi = shallowRef(null);

function getExportColumns() {
  if (!gridApi.value) return [];
  const options = props.exportOptions === true ? {} : (props.exportOptions || {});
  const excluded = new Set(["actions", ...(options.excludeColumns || [])]);
  return gridApi.value.getAllDisplayedColumns()
    .filter((column) => {
      const definition = column.getColDef();
      return !excluded.has(column.getColId())
        && !excluded.has(definition.field)
        && definition.suppressExport !== true;
    })
    .map((column) => ({
      id: column.getColId(),
      label: column.getColDef().headerName || column.getColId(),
    }));
}

async function exportGrid(request) {
  if (!gridApi.value || props.exportOptions === false || !request) return;
  const options = {
    ...(props.exportOptions === true ? {} : (props.exportOptions || {})),
    selectedColumnIds: request.selectedColumnIds,
  };
  if (request.format === "excel") {
    await exportGridToExcel(gridApi.value, options);
    return;
  }
  if (request.format === "pdf") exportGridToPdf(gridApi.value, options, request.orientation);
}

const gridTheme = themeQuartz.withParams({
  accentColor: "var(--toro-color-primary)",
  backgroundColor: "var(--toro-color-surface)",
  borderColor: "var(--toro-color-border)",
  borderRadius: "var(--toro-radius-md)",
  browserColorScheme: "light",
  cellHorizontalPaddingScale: 0.8,
  columnBorder: {
    color: "color-mix(in srgb, var(--toro-color-surface) 34%, transparent)",
    style: "solid",
    width: 1,
  },
  fontFamily: "inherit",
  fontSize: "var(--toro-font-size-sm)",
  menuTextColor: "var(--toro-color-text)",
  menuBackgroundColor: "var(--toro-color-surface)",
  menuBorder: {
    color: "var(--toro-color-border)",
    style: "solid",
    width: 1,
  },
  menuShadow: {
    color: "rgb(13 36 58 / 16%)",
    radius: 14,
    spread: 0,
    x: 0,
    y: 6,
  },
  foregroundColor: "var(--toro-color-text)",
  headerBackgroundColor: "#d8eaf4",
  headerFontSize: "var(--toro-font-size-xs)",
  headerFontWeight: "var(--toro-font-weight-bold)",
  headerTextColor: "#174b6b",
  oddRowBackgroundColor: "var(--toro-color-surface-soft)",
  rowBorder: {
    color: "var(--toro-color-border)",
    style: "solid",
    width: 1,
  },
  spacing: 6,
  wrapperBorder: false,
});

const resolvedDefaultColDef = computed(() => ({
  sortable: true,
  filter: true,
  resizable: true,
  suppressHeaderMenuButton: false,
  ...props.defaultColDef,
}));

const gridContainerStyle = computed(() => ({
  "--toro-grid-height": props.height,
}));

const selectedPageSize = ref(String(props.pageSize));

function changePageSize() {
  const totalRows = Math.max(1, Array.isArray(props.rowData) ? props.rowData.length : 0);
  const nextSize = selectedPageSize.value === "all"
    ? totalRows
    : Number(selectedPageSize.value);

  gridApi.value?.paginationSetPageSize(nextSize);
  gridApi.value?.paginationGoToFirstPage();
}

const effectivePageSizeSelector = computed(() => {
  const values = [...props.pageSizeSelector, 100]
    .map(Number)
    .filter((value) => Number.isInteger(value) && value > 0);

  return [...new Set(values)].sort((left, right) => left - right);
});

const adaptiveGridHeightStyle = computed(() => {
  const totalRows = Array.isArray(props.rowData) ? props.rowData.length : 0;
  const selectedRows = selectedPageSize.value === "all"
    ? totalRows
    : Number(selectedPageSize.value) || props.pageSize;
  const visibleRows = props.pagination
    ? Math.min(totalRows, Math.max(1, selectedRows))
    : totalRows;
  const exportToolbarHeight = props.exportOptions === false ? 0 : 42;
  const paginationHeight = props.pagination ? 46 : 0;
  const borderAllowance = 4;
  const naturalHeight =
    exportToolbarHeight +
    props.headerHeight +
    Math.max(1, visibleRows) * props.rowHeight +
    paginationHeight +
    borderAllowance;
  const minimum = Math.max(240, Number(props.minGridHeight) || 300);
  const maximum = Math.max(minimum, Number(props.maxGridHeight) || 680);
  const resolvedHeight = Math.min(maximum, Math.max(minimum, naturalHeight));

  return {
    "--toro-grid-height": `${resolvedHeight}px`,
  };
});

const emptyOverlay = computed(
  () =>
    `<span class="toro-grid-empty">${escapeHtml(
      props.emptyText,
    )}</span>`,
);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function handleGridReady(event) {
  gridApi.value = event.api;
  emit("grid-ready", event);
}

function handleFirstDataRendered(event) {
  if (props.autoSizeColumns) {
    event.api.autoSizeAllColumns(false);
  }

  emit("first-data-rendered", event);
}

defineExpose({
  getApi: () => gridApi.value,
  exportExcel: () => exportGrid("excel"),
  exportPdf: () => exportGrid("pdf"),
  refreshCells: (params) =>
    gridApi.value?.refreshCells(params),
  sizeColumnsToFit: () =>
    gridApi.value?.sizeColumnsToFit(),
});

function handleCellContextMenu(params) {
  const event = params?.event;
  const row = params?.data;

  if (!event || !row) return;

  event.preventDefault();
  event.stopPropagation();

  params.node?.setSelected?.(true, true);

  emit("row-context-menu", {
    event,
    row,
  });
}
</script>

<style scoped>
.toro-data-grid {
  width: 100%;
  min-width: 0;
  height: var(--toro-grid-height);
  overflow: hidden;
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
  position: relative;
}

.toro-data-grid-fill {
  height: 100%;
  min-height: 0;
}

.toro-ag-grid {
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.toro-data-grid :deep(.ag-root-wrapper) {
  border: 0;
}

/* TORO DATA GRID EMPHASIZED HEADER START */
.toro-data-grid :deep(.ag-header) {
  border-top: 1px solid #f9fdff;
  border-bottom: 1px solid #78abc5;
  background: #d8eaf4;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 92%),
    inset 0 -2px 0 rgb(59 124 158 / 16%),
    0 2px 5px rgb(13 36 58 / 12%);
}

.toro-data-grid :deep(.ag-header-row) {
  background: transparent;
}

.toro-data-grid :deep(.ag-header-cell),
.toro-data-grid :deep(.ag-header-group-cell) {
  background: linear-gradient(
    180deg,
    #eef8fc 0%,
    #deeff7 48%,
    #c9e2ef 100%
  ) !important;
  border-right: 1px solid #a9ccdd;
  box-shadow:
    inset 1px 0 0 rgb(255 255 255 / 70%),
    inset 0 1px 0 rgb(255 255 255 / 88%),
    inset 0 -1px 0 rgb(65 128 160 / 16%);
}

.toro-data-grid :deep(.ag-header-cell-label),
.toro-data-grid :deep(.ag-header-cell-text),
.toro-data-grid :deep(.ag-header-icon),
.toro-data-grid :deep(.ag-icon) {
  color: #174b6b !important;
  text-shadow: 0 1px 0 rgb(255 255 255 / 90%);
}

.toro-data-grid :deep(.ag-header-cell:hover),
.toro-data-grid :deep(.ag-header-cell.ag-header-active) {
  background: linear-gradient(
    180deg,
    #e4f4fb 0%,
    #cce7f3 52%,
    #b7d9e9 100%
  ) !important;
  box-shadow:
    inset 0 2px 0 rgb(255 255 255 / 76%),
    inset 0 -2px 0 rgb(46 112 148 / 20%);
}
/* TORO DATA GRID EMPHASIZED HEADER END */
.toro-data-grid :deep(.ag-header-cell-label) {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.toro-data-grid :deep(.ag-header-cell-text) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.toro-data-grid :deep(.ag-cell) {
  display: flex;
  align-items: center;
  line-height: 1.35;
}

.toro-data-grid :deep(.ag-row-hover) {
  background: var(--toro-color-info-soft);
}

.toro-data-grid :deep(.ag-paging-panel) {
  min-height: 44px;
  border-top-color: var(--toro-color-border);
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
  padding-right: 235px;
}

.toro-data-grid :deep(.ag-paging-button) {
  color: var(--toro-color-primary-strong);
}

.toro-data-grid :deep(.ag-overlay-no-rows-center) {
  padding: var(--toro-space-4);
  color: var(--toro-color-text-muted);
}

.toro-grid-empty {
  color: var(--toro-color-text-muted);
}

.toro-data-grid :deep(.ag-header-cell:not(:last-child)),
.toro-data-grid :deep(.ag-cell:not(:last-child)) {
  border-right: 1px solid var(--toro-color-border);
}
</style>

<style>
/* TORO AG Grid popup theme */

.ag-popup,
.ag-popup-child,
.ag-menu,
.ag-select-list {
  font-family: inherit;
  font-size: var(--toro-font-size-sm);
  color: var(--toro-color-text);
}

.ag-popup-child,
.ag-menu,
.ag-select-list {
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  box-shadow: 0 6px 14px rgb(13 36 58 / 16%);
  overflow: hidden;
}

.ag-picker-field-wrapper,
.ag-input-field-input,
.ag-text-field-input {
  border-color: var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  color: var(--toro-color-text);
  font-family: inherit;
  font-size: var(--toro-font-size-sm);
}

.ag-picker-field-wrapper {
  min-height: 36px;
  padding-inline: var(--toro-space-2);
}

.ag-input-field-input,
.ag-text-field-input {
  min-height: 36px;
  padding-inline: var(--toro-space-2);
}

.ag-picker-field-wrapper:focus-within,
.ag-input-field-input:focus,
.ag-text-field-input:focus {
  border-color: var(--toro-color-primary);
  box-shadow: 0 0 0 3px var(--toro-color-info-soft);
  outline: 0;
}

.ag-list-item,
.ag-virtual-list-item {
  min-height: 34px;
  padding-inline: var(--toro-space-2);
  color: var(--toro-color-text);
  font-family: inherit;
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-regular);
  line-height: 1.35;
}

.ag-list-item:hover,
.ag-virtual-list-item:hover,
.ag-list-item.ag-active-item,
.ag-virtual-list-item.ag-active-item,
.ag-list-item.ag-selected,
.ag-virtual-list-item.ag-selected {
  background: var(--toro-color-info-soft);
  color: var(--toro-color-primary-strong);
}

.ag-filter-body-wrapper,
.ag-filter-wrapper {
  gap: var(--toro-space-2);
  padding: var(--toro-space-2);
}

.ag-filter-condition-operator {
  color: var(--toro-color-text-muted);
  font-size: var(--toro-font-size-sm);
}

.ag-standard-button {
  min-height: 32px;
  padding-inline: var(--toro-space-2);
  border: 1px solid var(--toro-color-border-strong);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  color: var(--toro-color-primary-strong);
  font-family: inherit;
  font-size: var(--toro-font-size-sm);
  font-weight: var(--toro-font-weight-bold);
}

.ag-standard-button:hover {
  border-color: var(--toro-color-primary);
  background: var(--toro-color-info-soft);
}

.ag-paging-panel,
.ag-paging-panel select,
.ag-paging-page-size,
.ag-paging-row-summary-panel {
  font-family: inherit;
  font-size: var(--toro-font-size-sm);
  color: var(--toro-color-text-muted);
}

.ag-paging-panel select {
  min-height: 32px;
  padding-inline: var(--toro-space-2);
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-md);
  background: var(--toro-color-surface);
  color: var(--toro-color-text);
}

.ag-paging-button {
  border-radius: var(--toro-radius-md);
  color: var(--toro-color-primary-strong);
}

.ag-paging-button:not(.ag-disabled):hover {
  background: var(--toro-color-info-soft);
}

.ag-icon {
  color: var(--toro-color-primary-strong);
}

/* TORO AG Grid filter icon spacing */

.ag-filter-body-wrapper .ag-input-field,
.ag-filter-wrapper .ag-input-field {
  position: relative;
}

.ag-filter-body-wrapper .ag-input-field-input,
.ag-filter-body-wrapper .ag-text-field-input,
.ag-filter-wrapper .ag-input-field-input,
.ag-filter-wrapper .ag-text-field-input {
  padding-inline-start: 34px;
  padding-inline-end: 10px;
}

.ag-filter-body-wrapper .ag-input-field-before-start,
.ag-filter-wrapper .ag-input-field-before-start {
  position: absolute;
  inset-inline-start: 10px;
  top: 50%;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--toro-color-text-muted);
  pointer-events: none;
  transform: translateY(-50%);
}
.toro-grid-export-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0;
  align-items: center;
  min-height: 42px;
  padding: 4px 0 4px;
}



.toro-grid-page-size-control {
  position: absolute;
  right: 12px;
  bottom: 7px;
  z-index: 8;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  color: var(--toro-color-text-secondary);
  font-size: var(--toro-font-size-sm);
}

.toro-grid-page-size-control select {
  min-width: 76px;
  min-height: 34px;
  padding: 4px 28px 4px 10px;
  border: 1px solid var(--toro-color-border);
  border-radius: var(--toro-radius-sm);
  background: var(--toro-color-surface);
  color: var(--toro-color-text-primary);
  font: inherit;
}
</style>
