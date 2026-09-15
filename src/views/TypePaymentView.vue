<template>
  <section class="type-payment-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert">
      <strong>No fue posible cargar los Formas de pago.</strong>
      <span>{{ loadError }}</span>
    </div>

    <section class="bio-nexus-administrative-directory type-payment-directory">


      <div v-if="loading" class="bio-nexus-empty-state">Cargando Formas de pago...</div>
      <div v-else-if="rows.length === 0" class="bio-nexus-empty-state">No existen Formas de pago registrados.</div>
      <div v-else-if="filteredRows.length === 0" class="bio-nexus-empty-state">No existen registros que coincidan con los filtros.</div>
      <BioNexusDataGrid
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
      @refresh="loadRows" @grid-ready="rememberGrid"
    >
      <template #actions><div class="type-payment-grid-actions"><button type="button" class="type-payment-order-button" :disabled="!selectedRow || selectedIndex <= 0 || orderSaving" @click="moveSelected(-1)">↑</button><button type="button" class="type-payment-order-button" :disabled="!selectedRow || selectedIndex >= rows.length - 1 || orderSaving" @click="moveSelected(1)">↓</button><button type="button" class="bio-nexus-action bio-nexus-action-secondary" :disabled="!orderDirty || orderSaving" @click="saveOrder"><BioNexusActionIcon action="save"/>Guardar orden</button></div>
        <button
          v-if="canCreate"
          type="button"
          class="bio-nexus-action bio-nexus-action-primary"
          :disabled="loading || saving"
          @click="openCreate"
        >
          <BioNexusActionIcon action="create" />
          <span>Nuevo tipo</span>
        </button>
      </template>
    </BioNexusDataGrid>

    <BioNexusContextMenu
      ref="typePaymentContextMenu"
      :open="typePaymentContextMenuState.open"
      :x="typePaymentContextMenuState.x"
      :y="typePaymentContextMenuState.y"
      :items="typePaymentContextMenuItems"
      @select="runTypePaymentContextAction"
      @close="closeTypePaymentContextMenu"
    />
    </section>

    <TypePaymentDialog ref="formDialog" :saving="saving" :can-create="canCreate" :can-update="canUpdate" :currency-options="currencyOptions" @submit="saveForm" />
    <TypePaymentStateDialog ref="stateDialog" :saving="saving" @confirm="saveState" />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, nextTick } from "vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusGridActionsCell from "@/components/grid/BioNexusGridActionsCell.vue";
import BioNexusGridToggleCell from "@/components/grid/BioNexusGridToggleCell.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import BioNexusStatusBadgeCell from "@/components/grid/BioNexusStatusBadgeCell.vue";
import TypePaymentOrderSelectCell from "@/components/typepayment/TypePaymentOrderSelectCell.vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import TypePaymentDialog from "@/components/typepayment/TypePaymentDialog.vue";
import TypePaymentStateDialog from "@/components/typepayment/TypePaymentStateDialog.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { getActiveCurrencies } from "@/services/currencyService";
import { createTypePayment, getTypePaymentErrorMessage, getTypePayments, reorderTypePayments, updateTypePayment } from "@/services/typePaymentService";
import { useAuthorizationStore } from "@/stores/authorization";
import BioNexusContextMenu from "@/components/ui/BioNexusContextMenu.vue";

const authorizationStore = useAuthorizationStore();
const toast = useBioNexusToast();
const rows = shallowRef([]);
const currencyCatalog=ref([]);const currencyOptions=computed(()=>currencyCatalog.value);
const loading = ref(false);
const orderSaving=ref(false),selectedOrderId=ref(null),orderOriginal=ref(""),keyboardOriginal=ref([]),gridApi=ref(null);
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

const defaultColDef = Object.freeze({ sortable:true, filter:true, resizable:true, suppressHeaderMenuButton:true, cellClassRules:{ "type-payment-order-selected-cell": params => Number(params?.data?.id) === Number(selectedOrderId.value) } });
const gridComponents = Object.freeze({ BioNexusGridActionsCell, BioNexusStatusBadgeCell, BioNexusGridToggleCell, TypePaymentOrderSelectCell });
const selectedRow=computed(()=>rows.value.find(row=>row.id===selectedOrderId.value)||null),selectedIndex=computed(()=>selectedRow.value?rows.value.findIndex(row=>row.id===selectedRow.value.id):-1),orderSnapshot=()=>JSON.stringify(rows.value.map(row=>row.id)),orderDirty=computed(()=>orderSnapshot()!==orderOriginal.value);
const columnDefs = computed(() => [
  { colId:"order-select", headerName:"Orden", width:72, minWidth:72, maxWidth:72, suppressMovable:true, sortable:false, filter:false, resizable:false, headerClass:"type-payment-order-select-header", cellClass:"type-payment-order-select-cell", cellRenderer:"TypePaymentOrderSelectCell", cellRendererParams:{isSelected:row=>row.id===selectedOrderId.value,onSelect:selectForOrder} },
  { field:"position", headerName:"Posición", width:120, type:"numericColumn", headerClass:"type-payment-center-header", cellClass:"type-payment-center-cell type-payment-position-cell", cellRenderer:params=>`<span class="type-payment-position-number">${params.value}</span>` },
  { field: "description", headerName: "Descripción", minWidth: 210, flex: 1.2 },
  { colId: "currencies", headerName: "Monedas", minWidth: 180, flex: 1, valueGetter: ({ data }) => (data?.currencies ?? []).map((currency) => `${currency.code}${currency.isDefault ? " (pred.)" : ""}`).join(", ") },
  {
    field: "isActive",
    filter: BioNexusOptionFilter,
    filterParams: {
      options: [{"value":true,"label":"Activo"},{"value":false,"label":"Inactivo"}],
    },
    headerName: "Estado",
    width: 170,
    headerClass: "type-payment-center-header",
    cellClass: "type-payment-center-cell",
    cellRenderer: "BioNexusGridToggleCell",
    cellRendererParams: { onLabel: "Activo", offLabel: "Inactivo", ariaLabel: "Estado", disabled: () => !canChangeStatus.value || saving.value, onToggle: openState },
  },
  {
    colId: "actions",
    headerName: "Acciones",
    width: 110,
    minWidth: 110,
    maxWidth: 110,
    flex: 0,
    pinned: "right",
    lockPinned: true,
    suppressMovable: true,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    headerClass: "bio-nexus-grid-actions-header",
    cellClass: "bio-nexus-grid-actions-cell",
    cellRenderer: "BioNexusGridActionsCell",
    cellRendererParams: {
      actions: [
        { key: "edit", label: "Editar", icon: "edit", visible: () => canUpdate.value, disabled: () => saving.value, onClick: openEdit },
      ],
    },
  },
]);

function rememberGrid(event){gridApi.value=event?.api??null;}
function refreshOrderCells(){gridApi.value?.refreshCells?.({force:true});}
function selectForOrder(row,checked){if(!row)return;if(checked){selectedOrderId.value=row.id;keyboardOriginal.value=rows.value.map(item=>item.id);}else if(selectedOrderId.value===row.id){selectedOrderId.value=null;keyboardOriginal.value=[];}nextTick(refreshOrderCells);}
function moveSelected(delta){const index=selectedIndex.value,target=index+delta;if(index<0||target<0||target>=rows.value.length||orderSaving.value)return;const next=[...rows.value];const [row]=next.splice(index,1);next.splice(target,0,row);rows.value=next.map((item,position)=>({...item,position:position+1,displayOrder:position+1}));selectedOrderId.value=row.id;nextTick(()=>{gridApi.value?.refreshCells?.({force:true});gridApi.value?.ensureIndexVisible?.(target,"middle");});}
function clearKeyboardSelection(){selectedOrderId.value=null;keyboardOriginal.value=[];nextTick(refreshOrderCells);}
function acceptKeyboardPosition(){if(!selectedRow.value)return;clearKeyboardSelection();toast.success("Posición aceptada. Usa Guardar orden para conservarla.");}
function cancelKeyboardPosition(){if(!selectedRow.value)return;const byId=new Map(rows.value.map(row=>[row.id,row]));const restored=keyboardOriginal.value.map(id=>byId.get(id)).filter(Boolean);if(restored.length===rows.value.length)rows.value=restored.map((row,position)=>({...row,position:position+1,displayOrder:position+1}));clearKeyboardSelection();toast.success("Movimiento cancelado.");}
function handleKeyboardOrder(event){if(!selectedRow.value||orderSaving.value||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;const target=event.target;if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target?.isContentEditable)return;if(event.key==="ArrowUp"){event.preventDefault();event.stopPropagation();moveSelected(-1);}else if(event.key==="ArrowDown"){event.preventDefault();event.stopPropagation();moveSelected(1);}else if(event.key==="Enter"){event.preventDefault();event.stopPropagation();acceptKeyboardPosition();}else if(event.key==="Escape"){event.preventDefault();event.stopPropagation();cancelKeyboardPosition();}}
async function saveOrder(){if(!orderDirty.value||orderSaving.value)return;orderSaving.value=true;try{await reorderTypePayments(rows.value.map(row=>row.id));orderOriginal.value=orderSnapshot();toast.success("Orden de formas de pago guardado correctamente.");}catch(error){toast.error(getTypePaymentErrorMessage(error,"No fue posible guardar el orden."));await loadRows();}finally{orderSaving.value=false;}}
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
    [rows.value,currencyCatalog.value]=await Promise.all([getTypePayments(),getActiveCurrencies()]);
    rows.value=rows.value.map((row,position)=>({...row,position:position+1}));
    orderOriginal.value=orderSnapshot();selectedOrderId.value=null;
    return true;
  } catch {
    return false;
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

function normalizeTypePaymentDescriptionKey(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

function hasDuplicateTypePaymentDescription(payload) {
  const key = normalizeTypePaymentDescriptionKey(payload?.values?.description);
  if (key === "") return false;
  const currentId = payload?.mode === "edit" ? payload?.record?.id : null;
  return rows.value.some((row) =>
    row.id !== currentId && normalizeTypePaymentDescriptionKey(row.description) === key,
  );
}

async function saveForm(payload) {
  if (saving.value) return;
  if (hasDuplicateTypePaymentDescription(payload)) {
    formDialog.value?.setError("Ya existe una forma de pago con la descripcion indicada.");
    return;
  }
  saving.value = true;
  formDialog.value?.clearError();
  try {
    let saved;
    if (payload.mode === "create") {
      const created = await createTypePayment(payload.values);
      if (!Number.isInteger(created?.id) || created.id <= 0) {
        throw new Error("TYPEPAYMENT_CREATE_RESPONSE_INVALID");
      }
      saved = created;
    } else {
      saved = await updateTypePayment(payload.record.id, { ...payload.values });
    }
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
    [rows.value,currencyCatalog.value]=await Promise.all([getTypePayments(),getActiveCurrencies()]);
    rows.value=rows.value.map((row,position)=>({...row,position:position+1}));
    orderOriginal.value=orderSnapshot();selectedOrderId.value=null;
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
  globalThis.addEventListener("keydown", handleKeyboardOrder, { capture: true });
  loadRows();
});
onBeforeUnmount(() => {
  globalThis.removeEventListener("keydown", handleKeyboardOrder, { capture: true });
});
</script>

<style scoped>.type-payment-grid :deep(.type-payment-order-select-header .ag-header-cell-label),.type-payment-grid :deep(.type-payment-center-header .ag-header-cell-label){justify-content:center}
.type-payment-grid :deep(.type-payment-order-select-cell){display:flex;align-items:center;justify-content:center;padding:0!important}
.type-payment-grid :deep(.type-payment-center-cell){display:flex;align-items:center;justify-content:center;text-align:center}
.type-payment-grid :deep(.type-payment-order-selected-cell){background:var(--bio-nexus-color-info-soft)!important}
.type-payment-grid :deep(.type-payment-order-selected-cell[col-id="order-select"]){box-shadow:inset 5px 0 0 var(--bio-nexus-color-accent)!important}
.type-payment-grid :deep(.type-payment-order-selected-cell .type-payment-position-number){border:2px solid var(--bio-nexus-color-primary);background:var(--bio-nexus-color-primary);color:#fff;transform:scale(1.06)}
.type-payment-grid :deep(.type-payment-order-selected-cell[col-id="description"]){padding-right:225px;font-weight:700}
.type-payment-grid :deep(.type-payment-order-selected-cell[col-id="description"]::after){position:absolute;top:5px;right:12px;content:"SELECCIONADO · ↑ ↓ · ENTER · ESC";color:var(--bio-nexus-color-primary);font-size:9px;font-weight:800;letter-spacing:.04em;white-space:nowrap;pointer-events:none}
.type-payment-grid :deep(.type-payment-position-cell){display:flex;align-items:center;justify-content:center;text-align:center}
.type-payment-grid :deep(.type-payment-position-number){box-sizing:border-box;display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--bio-nexus-color-border-strong);border-radius:50%;background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-text-secondary);font-size:12px;font-weight:700;font-variant-numeric:tabular-nums;transition:background-color .15s ease,border-color .15s ease,color .15s ease,transform .15s ease}



.type-payment-grid-actions{display:flex;align-items:center;gap:8px}.type-payment-order-button{width:38px;height:38px;border:1px solid var(--bio-nexus-color-border);border-radius:50%;background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-primary);font-weight:700}.type-payment-order-button:disabled{opacity:.32}
.type-payment-page { min-width: 0; }
.type-payment-grid :deep(.bio-nexus-grid-actions-header .ag-header-cell-label),
.type-payment-grid :deep(.bio-nexus-grid-actions-cell) { justify-content: center; }
.type-payment-grid :deep(.ag-pinned-right-header),
.type-payment-grid :deep(.ag-pinned-right-cols-container) {
  border-left: 1px solid var(--bio-nexus-color-border-strong);
  box-shadow: calc(var(--bio-nexus-space-1) * -1) 0 var(--bio-nexus-space-3) var(--bio-nexus-shadow-panel-soft);
}
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
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: 999px;
  background: var(--bio-nexus-color-surface-muted);
  transition: background-color 160ms ease, border-color 160ms ease;
}
.type-payment-grid :deep(.type-payment-dollar-switch.is-on) {
  border-color: var(--bio-nexus-color-success, #18836f);
  background: var(--bio-nexus-color-success, #18836f);
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
  outline: 2px solid var(--bio-nexus-color-primary, #26789f);
  outline-offset: 3px;
  border-radius: 999px;
}
.type-payment-context-menu {
  position: fixed;
  z-index: 1200;
  display: grid;
  min-width: 190px;
  padding: 6px;
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: 10px;
  background: var(--bio-nexus-color-surface);
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
  color: var(--bio-nexus-color-text);
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.type-payment-context-menu button:hover,
.type-payment-context-menu button:focus-visible {
  background: var(--bio-nexus-color-surface-muted);
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
  outline: 2px solid var(--bio-nexus-color-primary, #26789f);
  outline-offset: 3px;
  border-radius: 999px;
}
.type-payment-grid :deep(.type-payment-toggle) {
  display: inline-flex;
  width: 34px;
  height: 18px;
  padding: 2px;
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: 999px;
  background: var(--bio-nexus-color-surface-muted);
}
.type-payment-grid :deep(.type-payment-toggle.is-on) {
  border-color: var(--bio-nexus-color-success, #18836f);
  background: var(--bio-nexus-color-success, #18836f);
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
  border: 1px solid var(--bio-nexus-color-border-strong);
  border-radius: 10px;
  background: var(--bio-nexus-color-surface);
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
  color: var(--bio-nexus-color-text);
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.type-payment-context-menu button:hover,
.type-payment-context-menu button:focus-visible {
  background: var(--bio-nexus-color-surface-muted);
  outline: none;
}


</style>
