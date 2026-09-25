<template>
  <section class="tariffs-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error">{{ loadError }}</div>
    <BioNexusDataGrid :row-data="rows" :column-defs="columnDefs" :default-col-def="defaultColDef" :components="gridComponents" :get-row-id="({data}) => String(data.id)" :search-enabled="true" v-model:search-model-value="search" search-placeholder="Buscar tarifa" :refresh-enabled="true" :refreshing="loading" :page-size="10" :page-size-selector="[10,20,50]" :min-grid-height="360" :max-grid-height="620" @refresh="load" @row-context-menu="openContextMenu" @grid-ready="rememberGrid">
      <template #actions>
        <div class="tariff-grid-actions" aria-label="Acciones de ordenamiento">
          <BioNexusActionButton icon="arrow_upward" icon-only shape="circle" size="md" variant="secondary" label="Subir tarifa" :disabled="!selectedRow || selectedIndex <= 0 || orderSaving" @click="moveSelected(-1)" />
          <BioNexusActionButton icon="arrow_downward" icon-only shape="circle" size="md" variant="secondary" label="Bajar tarifa" :disabled="!selectedRow || selectedIndex < 0 || selectedIndex >= tariffs.length - 1 || orderSaving" @click="moveSelected(1)" />
          <BioNexusActionButton variant="secondary" icon="save" :loading="orderSaving" :disabled="!orderDirty || orderSaving" @click="saveOrder">Guardar orden</BioNexusActionButton>
          <BioNexusActionButton v-if="canCreate" icon="add" icon-only shape="rounded" size="md" variant="primary" label="Nueva tarifa" @click="openCreate" />
        </div>
      </template>
    </BioNexusDataGrid>

    <BioNexusContextMenu ref="contextMenu" :open="menu.open" :x="menu.x" :y="menu.y" :items="menuItems" @close="closeMenu" @select="runMenuAction" />

    <BioNexusDialog ref="formDialog" kicker="ADMINISTRAR TARIFA" :title="dialog.mode === 'create' ? 'Nueva tarifa' : 'Editar tarifa'" size="standard" :prevent-close="saving || hasChanges" @before-close="requestCloseDialog" @close="resetFormDialog">
      <form id="tariff-form" class="tariff-form" @submit.prevent="submit">
        <BioNexusFormErrors :errors="dialog.error" />
        <BioNexusSectionPanel title="Información de la tarifa" icon="sell" description="Define el nombre y la descripción de la tarifa." variant="accent">
          <BioNexusFormField label="Nombre" field-id="tariff-name" required :error="fieldErrors.name" :help="`${draft.name.length} de 100 caracteres`"><input id="tariff-name" v-model.trim="draft.name" class="bio-nexus-field" maxlength="100" autocomplete="off" autofocus @input="clearFieldError('name')" /></BioNexusFormField>
          <BioNexusFormField class="span-all" label="Descripción" field-id="tariff-description" :help="`${draft.description.length} de 250 caracteres`"><textarea id="tariff-description" v-model.trim="draft.description" class="bio-nexus-field tariff-description" maxlength="250" @input="clearGeneralError"></textarea></BioNexusFormField>
        </BioNexusSectionPanel>
      </form>
      <template #footer><BioNexusActionButton variant="secondary" icon="cancel" :disabled="saving" @click="requestCloseDialog">Cancelar</BioNexusActionButton><BioNexusActionButton type="submit" variant="primary" :icon="dialog.mode === 'create' ? 'create' : 'save'" form="tariff-form" :loading="saving" :disabled="tariffSubmitDisabled">{{ dialog.mode === 'create' ? 'Crear' : 'Guardar' }}</BioNexusActionButton></template>
    </BioNexusDialog>

    <BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="confirmStatus" /><BioNexusConfirmDialog ref="discardDialog" />
  </section>
</template>
<script setup>
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusGridToggleCell from "@/components/grid/BioNexusGridToggleCell.vue";
import BioNexusGridActionsCell from "@/components/grid/BioNexusGridActionsCell.vue";
import TariffOrderSelectCell from "@/components/tariffs/TariffOrderSelectCell.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import BioNexusContextMenu from "@/components/ui/BioNexusContextMenu.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";
import BioNexusStateDialog from "@/components/ui/BioNexusStateDialog.vue";
import { useAuthorizationStore } from "@/stores/authorization";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { changeTariffStatus, createTariff, getTariffs, reorderTariffs, setDefaultTariff, tariffError, updateTariff } from "@/services/tariffService";

const auth = useAuthorizationStore(), toast = useBioNexusToast();
const tariffs = ref([]), loading = ref(false), saving = ref(false), orderSaving = ref(false), loadError = ref(""), search = ref(""), contextMenu = ref(null), formDialog = ref(null), stateDialog = ref(null), discardDialog = ref(null), selectedOrderId = ref(null), orderOriginal = ref(""), keyboardOriginal = ref([]), gridApi = ref(null);
const menu = reactive({ open:false, x:0, y:0, row:null });
const dialog = reactive({ open:false, mode:"create", record:null, error:"" });
const fieldErrors = reactive({ name:"" });
const draft = reactive({ code:"", name:"", description:"" });
const originalDraft = ref("");
const canCreate = computed(() => auth.hasPermission("tariffs.create"));
const canUpdate = computed(() => auth.hasPermission("tariffs.update"));
const canChangeStatus = computed(() => auth.hasPermission("tariffs.update"));
const canSetDefault = computed(() => auth.hasPermission("tariffs.update"));
const rows = computed(() => { const q=search.value.trim().toLowerCase(); return tariffs.value.filter(x => !q || [x.code,x.name,x.description,x.isDefault?'predeterminada':'',x.isActive?'activa':'desactivada'].some(v => String(v||'').toLowerCase().includes(q))); });
const activeCount = computed(() => tariffs.value.filter(x => x.isActive).length);
const draftSignature = computed(() => JSON.stringify({name:draft.name.trim(),description:draft.description.trim()}));
const hasChanges = computed(() => draftSignature.value !== originalDraft.value);
const tariffFormValid = computed(() => draft.name.trim() !== "");
const tariffSubmitDisabled = computed(() => dialog.mode === "create" ? saving.value || !canCreate.value || !tariffFormValid.value : saving.value || !canUpdate.value || !tariffFormValid.value || !hasChanges.value);
const selectedRow = computed(() => tariffs.value.find(row => row.id === selectedOrderId.value) || null);
const selectedIndex = computed(() => selectedRow.value ? tariffs.value.findIndex(row => row.id === selectedRow.value.id) : -1);
const orderSnapshot = () => JSON.stringify(tariffs.value.map(row => row.id));
const orderDirty = computed(() => orderSnapshot() !== orderOriginal.value);
const defaultColDef = Object.freeze({ sortable:true, filter:true, resizable:true, suppressHeaderMenuButton:true, cellClassRules:{ "tariff-order-selected-cell": params => Number(params?.data?.id) === Number(selectedOrderId.value) } });
const gridComponents = Object.freeze({ BioNexusGridActionsCell, BioNexusGridToggleCell, TariffOrderSelectCell });
const columnDefs = computed(() => [
  { colId:"order-select", headerName:"Orden", width:72, minWidth:72, maxWidth:72, suppressMovable:true, sortable:false, filter:false, resizable:false, headerClass:"tariff-order-select-header", cellClass:"tariff-order-select-cell", cellRenderer:"TariffOrderSelectCell", cellRendererParams:{isSelected:row=>row.id===selectedOrderId.value,onSelect:selectForOrder} },
  { field:"position", headerName:"Posición", width:120, type:"numericColumn", headerClass:"tariff-center-header", cellClass:"tariff-center-cell tariff-position-cell", cellRenderer:params=>`<span class="tariff-position-number">${params.value}</span>` },
  { field:"name", headerName:"Nombre", minWidth:260, flex:1 },
  { field:"configuredPriceCount", headerName:"Registros de precio", width:190, type:"numericColumn", headerClass:"tariff-center-header", cellClass:"tariff-center-cell" },
  { field:"isDefault", headerName:"Predeterminada", width:185, headerClass:"tariff-center-header", cellClass:"tariff-center-cell", filter:BioNexusOptionFilter, filterParams:{options:[{value:true,label:"Sí"},{value:false,label:"No"}]}, cellRenderer:"BioNexusGridToggleCell", cellRendererParams:{onLabel:"Sí",offLabel:"No",ariaLabel:"Predeterminada",disabled:row=>!canSetDefault.value||saving.value||row.isDefault||!row.isActive,onToggle:(row,next)=>{if(next)makeDefault(row);}} },
  { field:"isActive", headerName:"Estado", width:175, headerClass:"tariff-center-header", cellClass:"tariff-center-cell", filter:BioNexusOptionFilter, filterParams:{options:[{value:true,label:"Activa"},{value:false,label:"Desactivada"}]}, cellRenderer:"BioNexusGridToggleCell", cellRendererParams:{onLabel:"Activa",offLabel:"Desactivada",ariaLabel:"Estado",disabled:()=>!canChangeStatus.value||saving.value,onToggle:requestStatus} },
  { colId:"actions", headerName:"Acciones", width:110, minWidth:110, maxWidth:110, suppressMovable:true, sortable:false, filter:false, resizable:false, headerClass:"bio-nexus-grid-actions-header", cellClass:"bio-nexus-grid-actions-cell", cellRenderer:"BioNexusGridActionsCell", cellRendererParams:{actions:[{key:"edit",label:"Editar",visible:()=>canUpdate.value,disabled:()=>saving.value,onClick:openEdit}]}}
]);
const menuItems = computed(() => { const row=menu.row; if(!row)return []; return [
  { key:"edit", icon:"edit", label:"Editar tarifa", visible:canUpdate.value, disabled:saving.value, action:()=>openEdit(row) },
  { key:"default", icon:"star", label:row.isDefault?"Tarifa predeterminada":"Definir como predeterminada", visible:canSetDefault.value, disabled:saving.value||row.isDefault||!row.isActive, action:()=>makeDefault(row) },
  { key:"status", icon:row.isActive?"deactivate":"activate", label:row.isActive?"Desactivar tarifa":"Activar tarifa", variant:row.isActive?"danger":"default", visible:canChangeStatus.value, disabled:saving.value, action:()=>requestStatus(row) },
]; });
function resetDraft(){Object.assign(draft,{code:"",name:"",description:""});Object.assign(fieldErrors,{name:""});originalDraft.value="";}
function openCreate(){resetDraft();Object.assign(dialog,{open:true,mode:"create",record:null,error:""});originalDraft.value=draftSignature.value;formDialog.value?.open();}
function openEdit(row){Object.assign(draft,{code:row.code,name:row.name,description:row.description||""});Object.assign(dialog,{open:true,mode:"edit",record:row,error:""});formDialog.value?.open();nextTick(()=>{originalDraft.value=draftSignature.value;});}
async function requestCloseDialog(){if(saving.value)return;if(hasChanges.value){const confirmed=await discardDialog.value?.ask({kicker:"Confirmación",title:"Descartar cambios",message:"Hay cambios sin guardar. ¿Deseas salir y descartarlos?",icon:"warning",variant:"danger",confirmIcon:"delete",confirmText:"Sí, salir y descartar cambios",cancelText:"Cancelar"});if(!confirmed)return;}formDialog.value?.close();}
function resetFormDialog(){Object.assign(dialog,{open:false,record:null,error:""});Object.assign(fieldErrors,{name:"",position:""});originalDraft.value="";}
async function load(){loading.value=true;loadError.value="";try{tariffs.value=(await getTariffs()).map(row=>({...row,isDefault:Boolean(row.isDefault),isActive:Boolean(row.isActive),configuredPriceCount:Number(row.configuredPriceCount)||0}));orderOriginal.value=orderSnapshot();selectedOrderId.value=null;}catch(e){loadError.value=tariffError(e,"No fue posible consultar las tarifas.");toast.error(loadError.value);}finally{loading.value=false;}}
function clearFieldError(field){if(Object.prototype.hasOwnProperty.call(fieldErrors,field))fieldErrors[field]="";dialog.error="";}
function clearGeneralError(){dialog.error="";}
function validateFields(){Object.assign(fieldErrors,{name:""});if(!draft.name.trim())fieldErrors.name="El nombre es obligatorio.";return !fieldErrors.name;}
function createTechnicalCode(){return "TARIFF_"+Date.now().toString(36).toUpperCase();}
async function submit(){dialog.error="";if(dialog.mode==="edit"&&!hasChanges.value)return;if(!validateFields())return;saving.value=true;try{const values={name:draft.name.trim(),description:draft.description.trim()||null};if(dialog.mode==="create")await createTariff({...values,code:createTechnicalCode()});else await updateTariff(dialog.record.id,values);formDialog.value?.close();await load();toast.success(dialog.mode==="create"?"Tarifa creada correctamente.":"Tarifa actualizada correctamente.");}catch(e){dialog.error=tariffError(e);}finally{saving.value=false;}}
async function makeDefault(row){if(!row||row.isDefault||!row.isActive||saving.value)return;saving.value=true;closeMenu();try{await setDefaultTariff(row.id);await load();toast.success("Tarifa predeterminada actualizada.");}catch(e){toast.error(tariffError(e));}finally{saving.value=false;}}
function requestStatus(row){if(!row||saving.value)return;closeMenu();stateDialog.value?.open(row,{kicker:"Estado de la tarifa",label:item=>item.name,isInactive:item=>!item.isActive,activateTitle:"Activar tarifa",deactivateTitle:"Desactivar tarifa",activateMessage:"La tarifa volverá a estar disponible para nuevas operaciones.",deactivateMessage:"La tarifa dejará de estar disponible para nuevas operaciones.",deactivateWarning:item=>item.isDefault?"La tarifa predeterminada no puede desactivarse. Define primero otra tarifa predeterminada.":"",deactivateBlocked:item=>Boolean(item.isDefault),dangerOnDeactivate:true});}
async function confirmStatus(row){if(!row||saving.value)return;saving.value=true;stateDialog.value?.clearError();try{await changeTariffStatus(row.id,!row.isActive);stateDialog.value?.close();await load();toast.success(row.isActive?"Tarifa desactivada.":"Tarifa activada.");}catch(e){stateDialog.value?.setError(tariffError(e));}finally{saving.value=false;}}
function rememberGrid(event){gridApi.value=event?.api??null;}
function refreshOrderCells(){gridApi.value?.refreshCells?.({force:true});}
function selectForOrder(row,checked){if(!row)return;if(checked){selectedOrderId.value=row.id;keyboardOriginal.value=tariffs.value.map(item=>item.id);}else if(selectedOrderId.value===row.id){selectedOrderId.value=null;keyboardOriginal.value=[];}nextTick(refreshOrderCells);}
function moveSelected(delta){const index=selectedIndex.value,target=index+delta;if(index<0||target<0||target>=tariffs.value.length||orderSaving.value)return;const next=[...tariffs.value];const [row]=next.splice(index,1);next.splice(target,0,row);tariffs.value=next.map((item,position)=>({...item,position:position+1}));selectedOrderId.value=row.id;nextTick(()=>{gridApi.value?.refreshCells?.({force:true});gridApi.value?.ensureIndexVisible?.(target,"middle");});}
function clearKeyboardSelection(){selectedOrderId.value=null;keyboardOriginal.value=[];nextTick(refreshOrderCells);}
function acceptKeyboardPosition(){if(!selectedRow.value)return;clearKeyboardSelection();toast.success("Posición aceptada. Usa Guardar orden para conservarla.");}
function cancelKeyboardPosition(){if(!selectedRow.value)return;const byId=new Map(tariffs.value.map(row=>[row.id,row]));const restored=keyboardOriginal.value.map(id=>byId.get(id)).filter(Boolean);if(restored.length===tariffs.value.length)tariffs.value=restored.map((row,position)=>({...row,position:position+1}));clearKeyboardSelection();toast.success("Movimiento cancelado.");}
function handleKeyboardOrder(event){if(!selectedRow.value||orderSaving.value||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;const target=event.target;if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target?.isContentEditable)return;if(event.key==="ArrowUp"){event.preventDefault();event.stopPropagation();moveSelected(-1);}else if(event.key==="ArrowDown"){event.preventDefault();event.stopPropagation();moveSelected(1);}else if(event.key==="Enter"){event.preventDefault();event.stopPropagation();acceptKeyboardPosition();}else if(event.key==="Escape"){event.preventDefault();event.stopPropagation();cancelKeyboardPosition();}}
async function saveOrder(){if(!orderDirty.value||orderSaving.value)return;orderSaving.value=true;try{await reorderTariffs(tariffs.value.map(row=>row.id));orderOriginal.value=orderSnapshot();toast.success("Orden de tarifas guardado correctamente.");}catch(e){toast.error(tariffError(e,"No fue posible guardar el orden."));await load();}finally{orderSaving.value=false;}}
async function openContextMenu({event,row}){event?.preventDefault?.();event?.stopPropagation?.();Object.assign(menu,{open:true,x:event.clientX,y:event.clientY,row});await nextTick();contextMenu.value?.positionMenu?.();}
function closeMenu(){Object.assign(menu,{open:false,x:0,y:0,row:null});}
async function runMenuAction(item){const action=item?.action;closeMenu();if(typeof action==="function")await action();}
onMounted(()=>{globalThis.addEventListener("keydown",handleKeyboardOrder,{capture:true});load();});
onBeforeUnmount(()=>globalThis.removeEventListener("keydown",handleKeyboardOrder,{capture:true}));
</script>
<style scoped>
.tariffs-page { min-width: 0; }
.tariff-form { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--bio-nexus-space-3); }
.tariff-form .bio-nexus-section-panel-body { display: grid; gap: var(--bio-nexus-space-4); }
.tariff-form .span-all { grid-column: 1 / -1; }
.tariff-description { min-height: 88px; resize: vertical; }
.tariff-grid-actions { display: flex; align-items: center; gap: var(--bio-nexus-space-2); }
.tariff-order-check { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; margin: 0; cursor: pointer; }
.tariff-order-check .ag-checkbox { display: inline-flex; align-items: center; justify-content: center; margin: 0; }
.tariff-order-check .ag-checkbox-input-wrapper { cursor: pointer; }
.tariffs-page :deep(.tariff-order-select-header .ag-header-cell-label),
.tariffs-page :deep(.tariff-center-header .ag-header-cell-label),
.tariffs-page :deep(.bio-nexus-grid-actions-header .ag-header-cell-label) { justify-content: center; }
.tariffs-page :deep(.tariff-order-select-cell) { display: flex; align-items: center; justify-content: center; padding: 0 !important; }
.tariffs-page :deep(.tariff-center-cell),
.tariffs-page :deep(.bio-nexus-grid-actions-cell),
.tariffs-page :deep(.tariff-position-cell) { display: flex; align-items: center; justify-content: center; text-align: center; }
.tariffs-page :deep(.tariff-order-selected-cell) { background: var(--bio-nexus-color-info-soft) !important; }
.tariffs-page :deep(.tariff-order-selected-cell[col-id="order-select"]) { box-shadow: inset 5px 0 0 var(--bio-nexus-color-accent) !important; }
.tariffs-page :deep(.tariff-order-selected-cell .tariff-position-number) { border-color: var(--bio-nexus-color-primary); background: var(--bio-nexus-color-primary); color: var(--bio-nexus-color-text-inverse); transform: scale(1.06); }
.tariffs-page :deep(.tariff-order-selected-cell[col-id="name"]) { padding-right: 215px; overflow: hidden; font-weight: var(--bio-nexus-font-weight-bold); text-overflow: ellipsis; white-space: nowrap; }
.tariffs-page :deep(.tariff-order-selected-cell[col-id="name"]::after) { position: absolute; top: 5px; right: 12px; content: "SELECCIONADO · ↑ ↓ · ENTER · ESC"; color: var(--bio-nexus-color-primary); font-size: 8px; font-weight: var(--bio-nexus-font-weight-heavy); letter-spacing: .035em; line-height: 1; white-space: nowrap; pointer-events: none; }
.tariffs-page :deep(.tariff-position-number) { box-sizing: border-box; display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--bio-nexus-color-border-strong); border-radius: 50%; background: var(--bio-nexus-color-surface); color: var(--bio-nexus-color-text-secondary); font-size: var(--bio-nexus-font-size-xs); font-weight: var(--bio-nexus-font-weight-bold); font-variant-numeric: tabular-nums; transition: background-color .15s ease, border-color .15s ease, color .15s ease, transform .15s ease; }
@media (max-width: 1250px) {
  .tariffs-page :deep(.tariff-order-selected-cell[col-id="name"]) { padding-right: var(--bio-nexus-space-3); }
  .tariffs-page :deep(.tariff-order-selected-cell[col-id="name"]::after) { display: none; }
}
@media (max-width: 760px) {
  .tariff-form { grid-template-columns: 1fr; }
  .tariff-form .span-all { grid-column: auto; }
  .tariff-grid-actions { flex-wrap: wrap; }
}
</style>
