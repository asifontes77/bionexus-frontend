<template>
  <section class="worksheet-groups-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert"><strong>No fue posible cargar los grupos.</strong><span>{{ loadError }}</span></div>
    <section class="bio-nexus-administrative-directory">
      <BioNexusDataGrid class="worksheet-groups-grid" :row-data="rows" :column-defs="columnDefs" :default-col-def="defaultColDef" :components="gridComponents" :get-row-id="getRowId" :quick-filter-text="searchText" :search-enabled="true" v-model:search-model-value="searchText" search-placeholder="Buscar grupo" :refresh-enabled="true" :refreshing="loading" :refresh-disabled="saving" :page-size="10" :page-size-selector="[10,20,50,100]" :min-grid-height="300" :max-grid-height="560" empty-text="No existen grupos de hojas de trabajo." @refresh="loadRows" @row-context-menu="openContextMenu">
        <template #actions><button v-if="canCreate" class="bio-nexus-action bio-nexus-action-primary" :disabled="loading || saving" @click="formDialog?.openCreate()"><BioNexusActionIcon action="create" />Nuevo grupo</button></template>
      </BioNexusDataGrid>
      <BioNexusContextMenu ref="contextMenu" :open="contextState.open" :x="contextState.x" :y="contextState.y" :items="contextItems" @close="closeContextMenu" @select="runContextAction" />
    </section>
    <WorksheetGroupDialog ref="formDialog" :saving="saving" :can-create="canCreate" :can-update="canUpdate" :can-manage-items="canManageItems" :exams="exams" @submit="saveForm" />
    <WorksheetStateDialog ref="stateDialog" :saving="saving" @confirm="saveState" />
  </section>
</template>
<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import BioNexusDataGrid from '@/components/grid/BioNexusDataGrid.vue'
import BioNexusGridActionsCell from '@/components/grid/BioNexusGridActionsCell.vue'
import BioNexusGridToggleCell from '@/components/grid/BioNexusGridToggleCell.vue'
import BioNexusOptionFilter from '@/components/grid/BioNexusOptionFilter.vue'
import BioNexusActionIcon from '@/components/ui/BioNexusActionIcon.vue'
import BioNexusContextMenu from '@/components/ui/BioNexusContextMenu.vue'
import WorksheetGroupDialog from '@/components/worksheetgroups/WorksheetGroupDialog.vue'
import WorksheetStateDialog from '@/components/worksheetgroups/WorksheetStateDialog.vue'
import { getExamGroups, getExamsByGroup } from '@/services/examCatalogService'
import { createWorksheetGroup, createWorksheetItem, deleteWorksheetItem, getWorksheetGroup, getWorksheetGroups, updateWorksheetGroup, updateWorksheetItem, worksheetGroupsError } from '@/services/worksheetGroupsService'
import { useAuthorizationStore } from '@/stores/authorization'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
const authorization=useAuthorizationStore(),toast=useBioNexusToast(),rows=ref([]),exams=ref([]),loading=ref(false),saving=ref(false),loadError=ref(''),searchText=ref(''),formDialog=ref(null),stateDialog=ref(null),contextMenu=ref(null),contextState=ref({open:false,x:0,y:0,row:null})
const canCreate=computed(()=>authorization.hasPermission('worksheet-groups.create')),canUpdate=computed(()=>authorization.hasPermission('worksheet-groups.update')),canState=computed(()=>authorization.hasPermission('worksheet-groups.change-status')),canItemCreate=computed(()=>authorization.hasPermission('worksheet-group-items.create')),canItemUpdate=computed(()=>authorization.hasPermission('worksheet-group-items.update')),canItemDelete=computed(()=>authorization.hasPermission('worksheet-group-items.delete')),canManageItems=computed(()=>canItemCreate.value||canItemUpdate.value||canItemDelete.value)
const defaultColDef=Object.freeze({sortable:true,filter:true,resizable:true,suppressHeaderMenuButton:true}),gridComponents=Object.freeze({BioNexusGridActionsCell,BioNexusGridToggleCell})
const actions=[{key:'edit',label:'Editar',icon:'edit',visible:()=>canUpdate.value||canManageItems.value,disabled:()=>saving.value,onClick:openEdit}]
const columnDefs=computed(()=>[
  {field: "description", headerName: "Descripción",minWidth:240,flex:1,filter:'agTextColumnFilter'},
  {field:'details',headerName:'Detalles',minWidth:280,flex:1.2,filter:'agTextColumnFilter'},
  {field: "itemCount", headerName: "Exámenes",width:125,headerClass:'worksheet-center-header',cellClass:'worksheet-center'},
  {
    field:'isActive',
    headerName:'Estado',
    width:160,
    minWidth:150,
    maxWidth:180,
    filter:BioNexusOptionFilter,
    filterParams:{options:[{value:true,label:'Activo'},{value:false,label:'Inactivo'}]},
    headerClass:'bio-nexus-grid-toggle-header',
    cellClass:'bio-nexus-grid-toggle-cell',
    cellRenderer:BioNexusGridToggleCell,
    cellRendererParams:{
      onLabel:'Activo',
      offLabel:'Inactivo',
      ariaLabel:'Estado',
      disabled:()=>!canState.value||saving.value,
      onToggle:row=>stateDialog.value?.open(row),
    },
  },
  {
    colId:'actions',
    headerName:'Acciones',
    width:110,
    minWidth:110,
    maxWidth:110,
    flex:0,
    pinned:'right',
    lockPinned:true,
    suppressMovable:true,
    sortable:false,
    filter:false,
    resizable:false,
    suppressHeaderMenuButton:true,
    headerClass:'bio-nexus-grid-actions-header',
    cellClass:'bio-nexus-grid-actions-cell',
    cellRenderer:BioNexusGridActionsCell,
    cellRendererParams:{actions:[{key:'edit',label:'Editar',icon:'edit',visible:()=>canUpdate.value||canManageItems.value,disabled:()=>saving.value,onClick:openEdit}]},
  },
])
const contextItems=computed(()=>{const row=contextState.value.row;if(!row)return[];return[{key:'edit',label:'Editar',icon:'edit',visible:canUpdate.value||canManageItems.value,disabled:saving.value,action:()=>openEdit(row)},{key:'state',label:row.annulled?'Activar grupo':'Inactivar grupo',icon:row.annulled?'activate':'deactivate',visible:canState.value,disabled:saving.value,action:()=>stateDialog.value?.open(row)}]})
function present(row){return{...row,itemCount:row.grouphtitems?.length||0,isActive:!row.annulled}}
function getRowId({data}){return String(data.id)}
async function loadRows(){if(loading.value||saving.value)return;loading.value=true;loadError.value='';try{const[groups,catalogGroups]=await Promise.all([getWorksheetGroups(),getExamGroups()]);const full=await Promise.all(groups.map(group=>getWorksheetGroup(group.id)));rows.value=full.map(present).sort((a,b)=>a.description.localeCompare(b.description,'es'));exams.value=(await Promise.all(catalogGroups.map(group=>getExamsByGroup(group.id)))).flat().sort((a,b)=>a.description.localeCompare(b.description,'es'))}catch(error){rows.value=[];loadError.value=worksheetGroupsError(error,'No fue posible consultar los grupos.');toast.error(loadError.value)}finally{loading.value=false}}
async function openEdit(row){const full=await getWorksheetGroup(row.id);formDialog.value?.openEdit(full)}
async function reconcile(groupId,original,next){const byExam=new Map(original.map(item=>[item.examId,item])),wanted=new Map(next.map(item=>[item.examId,item]));for(const item of original)if(!wanted.has(item.examId)){if(!canItemDelete.value)throw new Error('WORKSHEET_GROUP_PERMISSION_REQUIRED');await deleteWorksheetItem(item.id)}for(const item of next){const existing=byExam.get(item.examId);const values={groupHtId:groupId,examId:item.examId,description:item.description};if(!existing){if(!canItemCreate.value)throw new Error('WORKSHEET_GROUP_PERMISSION_REQUIRED');await createWorksheetItem(values)}else if(existing.description!==item.description){if(!canItemUpdate.value)throw new Error('WORKSHEET_GROUP_PERMISSION_REQUIRED');await updateWorksheetItem(existing.id,values)}}}
async function saveForm(payload){if(saving.value)return;saving.value=true;formDialog.value?.clearError();try{const group=payload.mode==='create'?await createWorksheetGroup({...payload.group,annulled:false}):await updateWorksheetGroup(payload.record.id,payload.group);await reconcile(group.id,payload.originalItems,payload.items);formDialog.value?.close();toast.success(payload.mode==='create'?'Grupo creado correctamente.':'Grupo actualizado correctamente.');await loadRows()}catch(error){formDialog.value?.setError(worksheetGroupsError(error,'No fue posible guardar el grupo.'))}finally{saving.value=false}}
async function saveState(row){saving.value=true;stateDialog.value?.clearError();try{await updateWorksheetGroup(row.id,{annulled:!row.annulled});stateDialog.value?.close();toast.success(row.annulled?'Grupo activado.':'Grupo inactivado.');await loadRows()}catch(error){stateDialog.value?.setError(worksheetGroupsError(error,'No fue posible cambiar el estado.'))}finally{saving.value=false}}
async function openContextMenu({event,row}){if(!event||!row)return;contextState.value={open:true,x:event.clientX,y:event.clientY,row};await nextTick();contextMenu.value?.positionMenu?.()}
function closeContextMenu(){contextState.value={open:false,x:0,y:0,row:null}}async function runContextAction(item){const action=item?.action;closeContextMenu();if(typeof action==='function')await action()}
onMounted(loadRows)
</script>
<style scoped>.worksheet-groups-page,.worksheet-groups-grid{min-width:0}.worksheet-groups-grid{width:100%}.worksheet-groups-grid :deep(.worksheet-center),.worksheet-groups-grid :deep(.worksheet-center-header .ag-header-cell-label),.worksheet-groups-grid :deep(.bio-nexus-grid-actions-cell),.worksheet-groups-grid :deep(.bio-nexus-grid-actions-header .ag-header-cell-label){justify-content:center}</style>
