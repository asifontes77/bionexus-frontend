<template>
  <section class="document-definitions-page">
    <BioNexusFormErrors :errors="generalError ? ['No fue posible procesar los comprobantes.', generalError] : []" />
    <section class="bio-nexus-administrative-directory">
      <BioNexusDataGrid class="document-definitions-grid" :row-data="gridRows" :column-defs="columnDefs" :default-col-def="defaultColDef" :components="gridComponents" :get-row-id="getRowId" :quick-filter-text="searchText" :search-enabled="true" v-model:search-model-value="searchText" search-placeholder="Buscar comprobante" :refresh-enabled="true" :refreshing="loading" :refresh-disabled="saving" :page-size="10" :page-size-selector="[10,20,50,100]" :min-grid-height="300" :max-grid-height="560" empty-text="No existen comprobantes que coincidan con la búsqueda." @refresh="load" @row-context-menu="openContextMenu">
        <template #actions><BioNexusActionButton v-if="canCreate" icon="add" icon-only shape="rounded" size="md" variant="primary" label="Nuevo comprobante" :disabled="loading||saving" @click="openCreate" /></template>
      </BioNexusDataGrid>
      <BioNexusContextMenu ref="contextMenu" :open="contextState.open" :x="contextState.x" :y="contextState.y" :items="contextItems" @close="closeContextMenu" @select="runContextAction" />
    </section>
    <DocumentDefinitionDialog ref="entryDialog" :saving="saving" :can-create="canCreate" :can-update="canUpdate" @submit="save" />
    <DocumentDefinitionStateDialog ref="stateDialog" :saving="saving" @confirm="confirmStateChange" />
    <DocumentDefinitionPreviewDialog ref="previewDialog" />
    <BioNexusConfirmDialog ref="deleteDialog" />
  </section>
</template>
<script setup>
import { computed,nextTick,onMounted,ref } from "vue";
import { useRouter } from "vue-router";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusGridActionsCell from "@/components/grid/BioNexusGridActionsCell.vue";
import BioNexusGridToggleCell from "@/components/grid/BioNexusGridToggleCell.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusContextMenu from "@/components/ui/BioNexusContextMenu.vue";
import BioNexusFormErrors from "@/components/ui/BioNexusFormErrors.vue";
import BioNexusConfirmDialog from "@/components/ui/BioNexusConfirmDialog.vue";
import DocumentDefinitionDialog from "@/components/documents/DocumentDefinitionDialog.vue";
import DocumentDefinitionStateDialog from "@/components/documents/DocumentDefinitionStateDialog.vue";
import DocumentDefinitionPreviewDialog from "@/components/documents/DocumentDefinitionPreviewDialog.vue";
import { activateDocumentDefinition,changeDocumentDefinitionStatus,createDocumentDefinition,deleteDocumentDefinition,duplicateDocumentDefinition,listDocumentDefinitions,updateDocumentDefinition } from "@/services/documentDefinitionsService";
import { getLaboratory } from "@/services/laboratoryService";
import { useAuthorizationStore } from "@/stores/authorization";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
const router=useRouter(),authorization=useAuthorizationStore(),toast=useBioNexusToast();
const definitions=ref([]),loading=ref(false),saving=ref(false),generalError=ref(""),laboratoryId=ref(1),searchText=ref(""),contextMenu=ref(null),contextState=ref({open:false,x:0,y:0,row:null}),entryDialog=ref(null),stateDialog=ref(null),previewDialog=ref(null),deleteDialog=ref(null);
const canCreate=computed(()=>authorization.hasPermission("document-definitions.create"));
const canUpdate=computed(()=>authorization.hasPermission("document-definitions.update"));
const canActivate=computed(()=>authorization.hasPermission("document-definitions.activate"));
const documentTypeLabels=Object.freeze({"patient-receipt":"Comprobante del paciente"});
const defaultColDef=Object.freeze({sortable:true,filter:true,resizable:true,suppressHeaderMenuButton:true});
const gridComponents=Object.freeze({BioNexusGridActionsCell,BioNexusGridToggleCell});
const gridRows=computed(()=>definitions.value.map(row=>({...row,documentTypeLabel:documentTypeLabels[row.documentType]??row.documentType,updatedAtLabel:formatDateTime(row.updatedAt),statusLabel:row.isActive?"Activo":"Inactivo",searchValue:[row.name,documentTypeLabels[row.documentType]??row.documentType,row.description,row.isActive?"Activo":"Inactivo",formatDateTime(row.updatedAt)].join(" ")})));
const actions=computed(()=>[
  {key:"preview",label:"Vista previa",icon:"visibility",onClick:openPreview},
  {key:"edit-design",label:"Editar diseño",icon:"design_services",visible:()=>canUpdate.value,disabled:()=>saving.value,onClick:editDesign},
  {key:"edit",label:"Editar datos",icon:"edit",visible:()=>canUpdate.value,disabled:()=>saving.value,onClick:openEdit},
  {key:"duplicate",label:"Duplicar comprobante",icon:"content_copy",visible:()=>canCreate.value,disabled:()=>saving.value,onClick:duplicateDefinition},
  {key:"delete",label:"Eliminar comprobante",icon:"delete",variant:"danger",visible:()=>canUpdate.value,disabled:row=>saving.value||Boolean(row?.isActive),disabledTitle:row=>row?.isActive?"El comprobante activo no puede eliminarse.":"",onClick:openDelete},
]);
const columnDefs=computed(()=>[
  {colId:"searchValue",valueGetter:({data})=>data?.searchValue??"",hide:true,suppressColumnsToolPanel:true,filter:false,sortable:false},
  {field:"name",headerName:"Nombre",minWidth:230,flex:1.15,cellClass:"bio-nexus-grid-strong-cell"},
  {field:"documentTypeLabel",headerName:"Tipo",minWidth:220,flex:1},
  {field:"description",headerName:"Descripción",minWidth:280,flex:1.5,valueFormatter:({value})=>value||"Sin descripción",cellClass:"bio-nexus-grid-muted-cell"},
  {field:"isActive",headerName:"Estado",width:150,minWidth:140,maxWidth:165,filter:BioNexusOptionFilter,filterParams:{options:[{value:true,label:"Activo"},{value:false,label:"Inactivo"}]},headerClass:"bio-nexus-grid-centered-header",cellClass:"bio-nexus-grid-centered-cell",cellRenderer:BioNexusGridToggleCell,cellRendererParams:{onLabel:"Activo",offLabel:"Inactivo",ariaLabel:"Estado del comprobante",disabled:()=>!canActivate.value||saving.value,onToggle:row=>openStateDialog(row)}},
  {field:"updatedAtLabel",headerName:"Última actualización",width:205,minWidth:195,maxWidth:220,headerClass:"bio-nexus-grid-centered-header",cellClass:"bio-nexus-grid-centered-cell",filter:"agTextColumnFilter"},
  {colId:"actions",headerName:"Acciones",width:248,minWidth:248,maxWidth:248,pinned:"right",lockPinned:true,suppressMovable:true,sortable:false,filter:false,resizable:false,suppressHeaderMenuButton:true,headerClass:"bio-nexus-grid-actions-header",cellClass:"bio-nexus-grid-actions-cell",cellRenderer:BioNexusGridActionsCell,cellRendererParams:{actions:actions.value}},
]);
const contextItems=computed(()=>{const row=contextState.value.row;if(!row)return[];return[
  {key:"preview",label:"Vista previa",icon:"view",action:()=>openPreview(row)},
  {key:"edit-design",label:"Editar diseño",icon:"edit",visible:canUpdate.value,disabled:saving.value,action:()=>editDesign(row)},
  {key:"edit",label:"Editar datos",icon:"edit",visible:canUpdate.value,disabled:saving.value,action:()=>openEdit(row)},
  {key:"duplicate",label:"Duplicar comprobante",icon:"content_copy",visible:canCreate.value,disabled:saving.value,action:()=>duplicateDefinition(row)},
  {key:"delete",label:"Eliminar comprobante",icon:"delete",variant:"danger",danger:true,visible:canUpdate.value,disabled:saving.value||row.isActive,disabledTitle:row.isActive?"El comprobante activo no puede eliminarse.":"",action:()=>openDelete(row)},
  row.isActive
    ? {key:"deactivate",label:"Inactivar comprobante",icon:"deactivate",variant:"danger",danger:true,visible:canActivate.value,disabled:saving.value,action:()=>openStateDialog(row)}
    : {key:"activate",label:"Activar comprobante",icon:"activate",visible:canActivate.value,disabled:saving.value,action:()=>openStateDialog(row)},
];});
function getRowId({data}){return String(data.id)}
function formatDateTime(value){if(!value)return"Sin actualización";const date=new Date(value);if(Number.isNaN(date.getTime()))return String(value);return new Intl.DateTimeFormat("es-VE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}).format(date)}
function openCreate(){if(canCreate.value&&!saving.value)entryDialog.value?.openCreate()}
function openEdit(row){if(canUpdate.value&&!saving.value&&row)entryDialog.value?.openEdit(row)}
function openPreview(row){if(row)previewDialog.value?.open(row)}
function editDesign(row){if(row)router.push({name:"configuration-document-edit",params:{documentId:row.id}})}
function openStateDialog(row){if(canActivate.value&&!saving.value&&row){generalError.value="";stateDialog.value?.clearError();stateDialog.value?.open(row)}}
async function duplicateDefinition(row){if(!canCreate.value||saving.value||!row)return;saving.value=true;generalError.value="";try{const copy=await duplicateDocumentDefinition(row.id);if(!copy)throw new Error("El Backend no devolvió el comprobante duplicado.");replaceRow(copy);toast.success("Comprobante duplicado como "+copy.name+".");editDesign(copy)}catch(error){const message=error?.data?.message||error?.message||"No fue posible duplicar el comprobante.";generalError.value=message==="DOCUMENT_DEFINITION_COPY_NAME_UNAVAILABLE"?"No fue posible generar un nombre disponible para la copia.":message;toast.error(generalError.value)}finally{saving.value=false}}
async function openDelete(row){if(!canUpdate.value||saving.value||!row||row.isActive)return;const confirmed=await deleteDialog.value?.ask({kicker:"Confirmación",title:"Eliminar comprobante",message:`Se eliminará ${row.name} y su diseño asociado. Esta acción no se puede deshacer.`,icon:"delete",variant:"danger",confirmIcon:"delete",confirmText:"Sí, eliminar comprobante",cancelText:"Cancelar"});if(!confirmed)return;saving.value=true;generalError.value="";try{await deleteDocumentDefinition(row.id);definitions.value=definitions.value.filter(item=>item.id!==row.id);toast.success("Comprobante eliminado correctamente.")}catch(error){const message=error?.data?.message||error?.message||"No fue posible eliminar el comprobante.";generalError.value=message==="DOCUMENT_DEFINITION_ACTIVE_CANNOT_BE_DELETED"?"El comprobante activo no puede eliminarse. Activa primero otro comprobante.":message;toast.error(generalError.value)}finally{saving.value=false}}
async function openContextMenu({event,row}){if(!event||!row)return;contextState.value={open:true,x:event.clientX,y:event.clientY,row};await nextTick();contextMenu.value?.positionMenu?.()}
function closeContextMenu(){contextState.value={open:false,x:0,y:0,row:null}}
async function runContextAction(item){const action=item?.action;closeContextMenu();if(typeof action==="function")await action()}
function synchronizeDefinitionState(saved,targetState){
  if(!saved)return;
  definitions.value=definitions.value.map(item=>{
    if(item.id===saved.id)return {...item,...saved,isActive:targetState};
    if(targetState&&item.laboratoryId===saved.laboratoryId&&item.documentType===saved.documentType)return {...item,isActive:false};
    return item;
  });
}function replaceRow(saved){const next=definitions.value.map(row=>row.id===saved.id?saved:row);if(!next.some(row=>row.id===saved.id))next.push(saved);definitions.value=next.sort((a,b)=>a.name.localeCompare(b.name,"es",{sensitivity:"base"}))}
async function load(){if(loading.value||saving.value)return;loading.value=true;generalError.value="";try{const laboratory=await getLaboratory();laboratoryId.value=Number(laboratory?.id||1);definitions.value=await listDocumentDefinitions(laboratoryId.value)}catch(error){definitions.value=[];generalError.value=error?.message||"No fue posible cargar los comprobantes.";toast.error(generalError.value)}finally{loading.value=false}}
async function save({mode,record,values}){if(saving.value)return;saving.value=true;entryDialog.value?.clearError();try{const saved=mode==="edit"?await updateDocumentDefinition(record.id,values):await createDocumentDefinition({...values,laboratoryId:laboratoryId.value});if(!saved)throw new Error("El Backend no devolvió un comprobante válido.");replaceRow(saved);entryDialog.value?.markSaved(saved,true);toast.success(mode==="edit"?"Comprobante actualizado.":"Comprobante creado.");if(mode!=="edit")editDesign(saved)}catch(error){entryDialog.value?.setError(error?.message||"No fue posible guardar el comprobante.")}finally{saving.value=false}}
async function confirmStateChange(row){
  if(!row||saving.value)return;
  const targetState=!row.isActive;
  if(!targetState){
    const anotherActive=definitions.value.some(item=>item.id!==row.id&&item.laboratoryId===row.laboratoryId&&item.documentType===row.documentType&&item.isActive);
    if(!anotherActive){
      stateDialog.value?.setError("No se puede inactivar el último comprobante activo. Activa otro comprobante antes de continuar.");
      return;
    }
  }
  saving.value=true;
  stateDialog.value?.clearError();
  try{
    const saved=targetState?await activateDocumentDefinition(row.id):await changeDocumentDefinitionStatus(row.id,false);
    synchronizeDefinitionState(saved,targetState);
    stateDialog.value?.close();
    toast.success(targetState?"Comprobante activado.":"Comprobante inactivado.");
  }catch(error){
    const message=error?.data?.message||error?.message||"No fue posible cambiar el estado del comprobante.";
    stateDialog.value?.setError(message==="DOCUMENT_DEFINITION_LAST_ACTIVE_CANNOT_BE_DEACTIVATED"?"No se puede inactivar el último comprobante activo. Activa otro comprobante antes de continuar.":message);
  }finally{saving.value=false}
}
onMounted(load);
</script>
<style scoped>
.document-definitions-page,.document-definitions-grid{min-width:0}.document-definitions-grid{width:100%}.document-definitions-page :deep(.bio-nexus-grid-strong-cell){font-weight:var(--bio-nexus-font-weight-bold)}.document-definitions-page :deep(.bio-nexus-grid-muted-cell){color:var(--bio-nexus-color-text-muted)}.document-definitions-page :deep(.bio-nexus-grid-centered-header .ag-header-cell-label),.document-definitions-page :deep(.bio-nexus-grid-actions-header .ag-header-cell-label),.document-definitions-page :deep(.bio-nexus-grid-centered-cell),.document-definitions-page :deep(.bio-nexus-grid-actions-cell){justify-content:center;text-align:center}.document-definitions-page :deep(.document-status-cell.active){color:#047857;font-weight:700}.document-definitions-page :deep(.document-status-cell.inactive){color:#b42318;font-weight:700}.document-definitions-grid :deep(.ag-pinned-right-header),.document-definitions-grid :deep(.ag-pinned-right-cols-container){border-left:1px solid var(--bio-nexus-color-border-strong);box-shadow:calc(var(--bio-nexus-space-1) * -1) 0 var(--bio-nexus-space-3) var(--bio-nexus-shadow-panel-soft)}
</style>
