<template>
  <section class="type-payment-page">
    <div v-if="loadError" class="toro-message toro-message-error" role="alert">
      <strong>No fue posible cargar los Formas de pago.</strong>
      <span>{{ loadError }}</span>
    </div>

    <section class="toro-administrative-directory type-payment-directory">


      <div v-if="loading" class="toro-empty-state">Cargando Formas de pago...</div>
      <div v-else-if="rows.length === 0" class="toro-empty-state">No existen Formas de pago registrados.</div>
      <div v-else-if="filteredRows.length === 0" class="toro-empty-state">No existen registros que coincidan con los filtros.</div>
      <ToroDataGrid
        v-else
        class="type-payment-grid"
        :row-data="filteredRows"
        :column-defs="columnDefs"
        :default-col-def="defaultColDef"
        :components="gridComponents"
        :get-row-id="getRowId"
        :quick-filter-text="searchText"
        :page-size="10"
        :page-size-selector="[10, 20, 50]"
        height="520px"
        empty-text="No existen Formas de pago para mostrar."
        @row-context-menu="openTypePaymentContextMenu"
      :search-enabled="true"
      v-model:search-model-value="searchText"
      search-placeholder="Buscar tipo de pago"
      :refresh-enabled="true"
      :refreshing="loading"
      :refresh-disabled="saving"
      @refresh="loadRows"
    >
      <template #actions>
        <button
          v-if="canCreate"
          type="button"
          class="toro-action toro-action-primary"
          :disabled="loading || saving"
          @click="openCreate"
        >
          <ToroActionIcon action="create" />
          <span>Nuevo tipo</span>
        </button>
      </template>
    </ToroDataGrid>

    <ToroContextMenu
      ref="typePaymentContextMenu"
      :open="typePaymentContextMenuState.open"
      :x="typePaymentContextMenuState.x"
      :y="typePaymentContextMenuState.y"
      :items="typePaymentContextMenuItems"
      @select="runTypePaymentContextAction"
      @close="closeTypePaymentContextMenu"
    />
    </section>

    <TypePaymentDialog ref="formDialog" :saving="saving" :can-create="canCreate" :can-update="canUpdate" @submit="saveForm" />
    <TypePaymentStateDialog ref="stateDialog" :saving="saving" @confirm="saveState" />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, nextTick } from "vue";
import ToroDataGrid from "@/components/grid/ToroDataGrid.vue";
import ToroGridActionsCell from "@/components/grid/ToroGridActionsCell.vue";
import ToroGridToggleCell from "@/components/grid/ToroGridToggleCell.vue";
import ToroStatusBadgeCell from "@/components/grid/ToroStatusBadgeCell.vue";
import ToroActionIcon from "@/components/ui/ToroActionIcon.vue";
import TypePaymentDialog from "@/components/typepayment/TypePaymentDialog.vue";
import TypePaymentStateDialog from "@/components/typepayment/TypePaymentStateDialog.vue";
import { useToroToast } from "@/composables/useToroToast";
import { createTypePayment, getTypePaymentErrorMessage, getTypePayments, updateTypePayment } from "@/services/typePaymentService";
import { useAuthorizationStore } from "@/stores/authorization";
import ToroContextMenu from "@/components/ui/ToroContextMenu.vue";

const authorizationStore = useAuthorizationStore();
const toast = useToroToast();
const rows = shallowRef([]);
const loading = ref(false);
const saving = ref(false);
const loadError = ref("");
const searchText = ref("");
const formDialog = ref(null);
const stateDialog = ref(null);
const typePaymentContextMenu = ref(null);
const typePaymentContextMenuState = ref({ open: false, x: 0, y: 0, row: null });
const typePaymentContextMenuItems = computed(() => {
  const row = typePaymentContextMenuState.value.row;
  if (!row) return [];
  return [
    { key: "edit", label: "Editar", icon: "edit", visible: canUpdate.value, disabled: saving.value, action: () => openEdit(row) },
    { key: "toggle-status", label: row.annulled ? "Activar" : "Inactivar", icon: row.annulled ? "activate" : "deactivate", visible: canChangeStatus.value, disabled: saving.value, action: () => openState(row) },
  ];
});
const contextMenu = reactive({ visible: false, x: 0, y: 0, row: null });
const canCreate = computed(() => authorizationStore.hasPermission("typepayment.create"));
const canUpdate = computed(() => authorizationStore.hasPermission("typepayment.update"));
const canChangeStatus = computed(() => authorizationStore.hasPermission("typepayment.change-status"));
const filteredRows = computed(() => rows.value.filter((item) => {
  return true;
}).map((item) => ({ ...item, isActive: !item.annulled })));

const defaultColDef = Object.freeze({ sortable: true, filter: true, resizable: true, suppressHeaderMenuButton: true });
const gridComponents = Object.freeze({ ToroGridActionsCell, ToroStatusBadgeCell, ToroGridToggleCell });
const columnDefs = computed(() => [
  { field: "description", headerName: "Descripcion", minWidth: 210, flex: 1 },
  { field: "description_1", headerName: "Descripcion auxiliar 1", minWidth: 190, flex: 1 },
  { field: "description_2", headerName: "Descripcion auxiliar 2", minWidth: 190, flex: 1 },
  {
    field: "only_dollars",
    headerName: "Solo dolares",
    width: 170,
    headerClass: "type-payment-center-header",
    cellClass: "type-payment-center-cell",
    cellRenderer: "ToroGridToggleCell",
    cellRendererParams: { onLabel: "Si", offLabel: "No", ariaLabel: "Solo dolares", disabled: () => !canUpdate.value || saving.value, onToggle: toggleOnlyDollars },
  },
  {
    field: "isActive",
    headerName: "Estado",
    width: 170,
    headerClass: "type-payment-center-header",
    cellClass: "type-payment-center-cell",
    cellRenderer: "ToroGridToggleCell",
    cellRendererParams: { onLabel: "Activo", offLabel: "Inactivo", ariaLabel: "Estado", disabled: () => !canChangeStatus.value || saving.value, onToggle: openState },
  },
  {
    headerName: "Acciones",
    field: "actions",
    width: 110,
    sortable: false,
    filter: false,
    cellClass: "toro-grid-actions-cell",
    cellRenderer: "ToroGridActionsCell",
    cellRendererParams: {
      actions: [
        { key: "edit", label: "Editar", icon: "edit", visible: () => canUpdate.value, disabled: () => saving.value, onClick: openEdit },
      ],
    },
  },
]);

function getRowId({ data }) {
  return String(data.id);
}

function openCreate() {
  if (canCreate.value && !saving.value) formDialog.value?.openCreate();
}

async function openTypePaymentContextMenu({ event, row }) {
  if (!event || !row || (!canUpdate.value && !canChangeStatus.value)) return;
  event.preventDefault();
  typePaymentContextMenuState.value = { open: true, x: event.clientX, y: event.clientY, row };
  await nextTick();
  typePaymentContextMenu.value?.positionMenu?.();
}

function closeTypePaymentContextMenu() {
  typePaymentContextMenuState.value = { open: false, x: 0, y: 0, row: null };
}

async function runTypePaymentContextAction(item) {
  const action = item?.action;
  closeTypePaymentContextMenu();
  if (typeof action === "function") await action();
}

function openEdit(row) {
  if (canUpdate.value && !saving.value && row) formDialog.value?.openEdit(row);
}

function openState(row) {
  if (canChangeStatus.value && !saving.value && row) stateDialog.value?.open(row);
}

function replaceRow(saved) {
  const normalized = { ...saved };
  const next = rows.value.map((item) => item.id === normalized.id ? normalized : item);
  if (!next.some((item) => item.id === normalized.id)) next.push(normalized);
  rows.value = next.sort((left, right) => left.description.localeCompare(right.description));
}

async function reconcileRowsSilently() {
  try {
    rows.value = await getTypePayments();
    return true;
  } catch {
    return false;
  }
}

async function toggleOnlyDollars(row) {
  if (!canUpdate.value || saving.value || !row) return;
  saving.value = true;
  closeTypePaymentContextMenu();
  try {
    const saved = await updateTypePayment(row.id, { only_dollars: !row.only_dollars });
    replaceRow(saved);
    void reconcileRowsSilently();
    toast.success(saved.only_dollars ? "Solo dolares activado." : "Solo dolares desactivado.");
  } catch (error) {
    toast.error(getTypePaymentErrorMessage(error, "No fue posible cambiar Solo dolares."));
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(row) {
  if (!canChangeStatus.value || saving.value || !row) return;
  saving.value = true;
  closeTypePaymentContextMenu();
  try {
    const saved = await updateTypePayment(row.id, { annulled: !row.annulled });
    replaceRow(saved);
    void reconcileRowsSilently();
    toast.success(saved.annulled ? "Tipo de pago inactivado." : "Tipo de pago activado.");
  } catch (error) {
    toast.error(getTypePaymentErrorMessage(error, "No fue posible cambiar el estado."));
  } finally {
    saving.value = false;
  }
}

async function saveForm(payload) {
  if (saving.value) return;
  saving.value = true;
  formDialog.value?.clearError();
  try {
    const saved = payload.mode === "create"
      ? await createTypePayment(payload.values)
      : await updateTypePayment(payload.record.id, payload.values);
    replaceRow(saved);
    await reconcileRowsSilently();
    formDialog.value?.close();
    toast.success(payload.mode === "create" ? "Tipo de pago creado correctamente." : "Tipo de pago actualizado correctamente.");
  } catch (error) {
    formDialog.value?.setError(getTypePaymentErrorMessage(error, "No fue posible guardar el tipo de pago."));
  } finally { saving.value = false; }
}
async function saveState(row) {
  if (saving.value || !canChangeStatus.value) return;
  saving.value = true;
  stateDialog.value?.clearError();
  try {
    const saved = await updateTypePayment(row.id, { annulled: !row.annulled });
    replaceRow(saved);
    void reconcileRowsSilently();
    stateDialog.value?.close();
    toast.success(saved.annulled ? "Tipo de pago inactivado correctamente." : "Tipo de pago activado correctamente.");
  } catch (error) {
    stateDialog.value?.setError(getTypePaymentErrorMessage(error, "No fue posible cambiar el estado."));
  } finally { saving.value = false; }
}
async function loadRows(options = {}) {
  const allowWhileSaving = Boolean(options.allowWhileSaving);
  const showToastOnError = options.showToastOnError !== false;
  if (loading.value || (saving.value && !allowWhileSaving)) return false;
  loading.value = true;
  loadError.value = "";
  try {
    rows.value = await getTypePayments();
    return true;
  } catch (error) {
    rows.value = [];
    loadError.value = getTypePaymentErrorMessage(error, "No fue posible consultar los Formas de pago.");
    if (showToastOnError) toast.error(loadError.value);
    throw error;
  } finally {
    loading.value = false;
  }
}
onMounted(() => {
  loadRows();
});
onBeforeUnmount(() => {
});
</script>

<style scoped>
.type-payment-page { min-width: 0; }
.type-payment-grid :deep(.toro-grid-actions-cell) { justify-content: center; }
.type-payment-grid :deep(.type-payment-dollar-indicator) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 100%;
}
.type-payment-grid :deep(.type-payment-dollar-switch) {
  position: relative;
  display: inline-flex;
  width: 34px;
  height: 18px;
  padding: 2px;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: 999px;
  background: var(--toro-color-surface-muted);
  transition: background-color 160ms ease, border-color 160ms ease;
}
.type-payment-grid :deep(.type-payment-dollar-switch.is-on) {
  border-color: var(--toro-color-success, #18836f);
  background: var(--toro-color-success, #18836f);
}
.type-payment-grid :deep(.type-payment-dollar-switch-knob) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(15 42 61 / 24%);
  transform: translateX(0);
  transition: transform 160ms ease;
}
.type-payment-grid :deep(.type-payment-dollar-switch.is-on .type-payment-dollar-switch-knob) {
  transform: translateX(16px);
}
.type-payment-grid :deep(.type-payment-dollar-badge) {
  min-width: 34px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f1f5f8;
  color: #52677a;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
}
.type-payment-grid :deep(.type-payment-dollar-badge.is-on) {
  background: #e4f8ef;
  color: #147360;
}
.type-payment-grid :deep(.type-payment-center-header .ag-header-cell-label) {
  justify-content: center;
}
.type-payment-grid :deep(.type-payment-center-cell) {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.type-payment-grid :deep(.type-payment-dollar-indicator.is-interactive) {
  cursor: pointer;
  user-select: none;
}
.type-payment-grid :deep(.type-payment-dollar-indicator.is-interactive:focus-visible) {
  outline: 2px solid var(--toro-color-primary, #26789f);
  outline-offset: 3px;
  border-radius: 999px;
}
.type-payment-context-menu {
  position: fixed;
  z-index: 1200;
  display: grid;
  min-width: 190px;
  padding: 6px;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: 10px;
  background: var(--toro-color-surface);
  box-shadow: 0 12px 32px rgb(15 42 61 / 22%);
}
.type-payment-context-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--toro-color-text);
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.type-payment-context-menu button:hover,
.type-payment-context-menu button:focus-visible {
  background: var(--toro-color-surface-muted);
  outline: none;
}
.type-payment-grid :deep(.type-payment-center-header .ag-header-cell-label) {
  justify-content: center;
}
.type-payment-grid :deep(.type-payment-center-cell) {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.type-payment-grid :deep(.type-payment-toggle-cell) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 100%;
}
.type-payment-grid :deep(.type-payment-toggle-cell.is-interactive) {
  cursor: pointer;
  user-select: none;
}
.type-payment-grid :deep(.type-payment-toggle-cell.is-interactive:focus-visible) {
  outline: 2px solid var(--toro-color-primary, #26789f);
  outline-offset: 3px;
  border-radius: 999px;
}
.type-payment-grid :deep(.type-payment-toggle) {
  display: inline-flex;
  width: 34px;
  height: 18px;
  padding: 2px;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: 999px;
  background: var(--toro-color-surface-muted);
}
.type-payment-grid :deep(.type-payment-toggle.is-on) {
  border-color: var(--toro-color-success, #18836f);
  background: var(--toro-color-success, #18836f);
}
.type-payment-grid :deep(.type-payment-toggle-knob) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(15 42 61 / 24%);
  transform: translateX(0);
  transition: transform 160ms ease;
}
.type-payment-grid :deep(.type-payment-toggle.is-on .type-payment-toggle-knob) {
  transform: translateX(16px);
}
.type-payment-grid :deep(.type-payment-toggle-badge) {
  min-width: 40px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f1f5f8;
  color: #52677a;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
}
.type-payment-grid :deep(.type-payment-toggle-badge.is-on) {
  background: #e4f8ef;
  color: #147360;
}
.type-payment-context-menu {
  position: fixed;
  z-index: 1200;
  display: grid;
  min-width: 190px;
  padding: 6px;
  border: 1px solid var(--toro-color-border-strong);
  border-radius: 10px;
  background: var(--toro-color-surface);
  box-shadow: 0 12px 32px rgb(15 42 61 / 22%);
}
.type-payment-context-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--toro-color-text);
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.type-payment-context-menu button:hover,
.type-payment-context-menu button:focus-visible {
  background: var(--toro-color-surface-muted);
  outline: none;
}


</style>
