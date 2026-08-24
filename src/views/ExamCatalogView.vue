<template>
  <section class="exam-catalog-page">
    <ExamGlobalSearch ref="globalSearch" v-model="globalSearchText" @select="locateGlobalResult" />
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error"><strong>No fue posible cargar el catalogo.</strong><span>{{ loadError }}</span></div>
    <section class="exam-catalog-layout" :class="{ 'groups-collapsed': groupsCollapsed }">
      <aside v-if="!groupsCollapsed" class="exam-group-panel">
        <header><div><p>Catálogo</p><h3>Grupos de exámenes</h3></div><div class="group-header-actions"><button type="button" class="panel-collapse panel-edge-toggle" title="Ocultar grupos" aria-label="Ocultar grupos" @click="groupsCollapsed=true"><BioNexusIcon name="chevron_left" :size="20" /></button><button v-if="canCreate" class="bio-nexus-action bio-nexus-action-primary" :disabled="saving" @click="groupDialog?.openCreate()"><BioNexusActionIcon action="create" />Nuevo grupo</button></div></header>
        <BioNexusFormField label="Buscar grupo" field-id="exam-group-search"><input id="exam-group-search" v-model="groupSearch" class="bio-nexus-field" type="search" /></BioNexusFormField>
        <div v-if="loadingGroups" class="bio-nexus-empty-state">Cargando grupos...</div>
        <ul v-else class="exam-group-list"><li v-for="group in filteredGroups" :key="group.id" @contextmenu.prevent.stop="openGroupContextMenu($event,group)"><button type="button" :class="{selected:selectedGroup?.id===group.id,inactive:group.annulled}" @click="selectGroup(group)"><span><strong>{{ group.description }}</strong><small>{{ group.its_exam ? 'Análisis clínico' : 'Grupo auxiliar' }}</small></span><em>{{ group.annulled ? 'Inactivo' : 'Activo' }}</em></button><button v-if="canUpdate" class="exam-group-edit" title="Editar grupo" @click="groupDialog?.openEdit(group)"><BioNexusIcon name="edit" :size="18" /></button></li></ul>
        <div v-if="selectedGroup" class="exam-group-actions"><button v-if="canChangeStatus" class="bio-nexus-action bio-nexus-action-secondary" @click="stateDialog?.open(selectedGroup,'grupo')">{{ selectedGroup.annulled ? 'Activar grupo' : 'Inactivar grupo' }}</button></div>
      </aside>
      <button v-else type="button" class="panel-expand panel-edge-toggle" title="Mostrar grupos" aria-label="Mostrar grupos" @click="groupsCollapsed=false"><BioNexusIcon name="chevron_right" :size="21" /><span>Grupos</span></button>
      <main class="exam-grid-panel">
        <header class="exam-grid-heading"><div><p>Exámenes del grupo</p><h3>{{ selectedGroupTitle }}</h3></div></header>
        <div v-if="!selectedGroup" class="bio-nexus-empty-state">Seleccióna un grupo para consultar sus exámenes.</div>
        <BioNexusDataGrid v-else :row-data="gridRows" :column-defs="columnDefs" :default-col-def="defaultColDef" :components="gridComponents" :get-row-id="getRowId" :row-selection="rowSelection" :search-enabled="true" v-model:search-model-value="examSearch" search-placeholder="Buscar examen" :refresh-enabled="true" :refreshing="loadingExams" :refresh-disabled="saving" :page-size="10" :page-size-selector="[10,20,50,100]" :min-grid-height="360" :max-grid-height="620" @refresh="loadExams" @row-context-menu="openExamContextMenu" @grid-ready="rememberGrid">
          <template #stats><span v-if="selectedRows.length" class="exam-selection-count">{{ selectedRows.length }} seleccionado(s)</span></template>
          <template #actions><button v-if="canCreate" class="bio-nexus-action bio-nexus-action-primary" :disabled="saving||selectedGroup.annulled" @click="examDialog?.openCreate()"><BioNexusActionIcon action="create" />Nuevo examen</button></template>
        </BioNexusDataGrid>
      </main>
    </section>
    <BioNexusContextMenu ref="contextMenu" :open="contextMenuState.open" :x="contextMenuState.x" :y="contextMenuState.y" :items="contextMenuItems" @close="closeContextMenu" @select="runContextAction" />
    <ExamGroupDialog ref="groupDialog" :saving="saving" :can-create="canCreate" :can-update="canUpdate" @submit="saveGroup" />
    <ExamDialog ref="examDialog" :saving="saving" :can-create="canCreate" :can-update="canUpdate" :taxes="taxes" :group="selectedGroup" @submit="saveExam" />
    <ExamStateDialog ref="stateDialog" :saving="saving" @confirm="saveState" /><ExamDetailDialog ref="detailDialog" :taxes="taxes" /><ExamWorksheetDialog ref="worksheetDialog" :saving="saving" :can-update="canUpdate" @save="saveWorksheet" /><ExamResultDesignerDialog ref="resultDesignerDialog" />
  </section>
</template>
<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusGridActionsCell from "@/components/grid/BioNexusGridActionsCell.vue";
import BioNexusGridToggleCell from "@/components/grid/BioNexusGridToggleCell.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import BioNexusContextMenu from "@/components/ui/BioNexusContextMenu.vue";
import BioNexusActionIcon from "@/components/ui/BioNexusActionIcon.vue";
import BioNexusIcon from "@/components/ui/BioNexusIcon.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import ExamGlobalSearch from "@/components/examcatalog/ExamGlobalSearch.vue";
import ExamGroupDialog from "@/components/examcatalog/ExamGroupDialog.vue";
import ExamDialog from "@/components/examcatalog/ExamDialog.vue";
import ExamStateDialog from "@/components/examcatalog/ExamStateDialog.vue";import ExamDetailDialog from "@/components/examcatalog/ExamDetailDialog.vue";import ExamWorksheetDialog from "@/components/examcatalog/ExamWorksheetDialog.vue";import ExamResultDesignerDialog from "@/components/examcatalog/ExamResultDesignerDialog.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { bulkUpdateExams, createExam, createExamGroup, examCatalogError, getExam, getExamGroups, getExamsByGroup, getTaxes, updateExam, updateExamGroup } from "@/services/examCatalogService";
import { useAuthorizationStore } from "@/stores/authorization";
const auth=useAuthorizationStore(),toast=useBioNexusToast();
const groups=ref([]),exams=ref([]),taxes=ref([]),selectedGroup=ref(null),selectedRows=ref([]),loadingGroups=ref(false),loadingExams=ref(false),saving=ref(false),loadError=ref(""),groupSearch=ref(""),examSearch=ref(""),globalSearchText=ref(""),groupsCollapsed=ref(false),groupDialog=ref(null),examDialog=ref(null),stateDialog=ref(null),detailDialog=ref(null),worksheetDialog=ref(null),resultDesignerDialog=ref(null),globalSearch=ref(null),contextMenu=ref(null),gridApi=ref(null),contextMenuState=ref({open:false,x:0,y:0,type:"",row:null});
const canCreate=computed(()=>auth.hasPermission("exam-catalog.create")),canUpdate=computed(()=>auth.hasPermission("exam-catalog.update")),canChangeStatus=computed(()=>auth.hasPermission("exam-catalog.change-status"));
const selectedGroupTitle=computed(()=>selectedGroup.value?`${selectedGroup.value.description} (${exams.value.length} ${exams.value.length===1?'examen':'exámenes'})`:"Seleccióna un grupo");
const filteredGroups=computed(()=>{const q=groupSearch.value.trim().toLowerCase();return q?groups.value.filter(g=>g.description.toLowerCase().includes(q)):groups.value});
const gridRows=computed(()=>{const q=examSearch.value.trim().toLowerCase();return exams.value.filter(x=>!q||[x.description,x.abbreviation,x.special_test?"especial":"",x.annulled?"inactivo":"activo"].some(v=>String(v).toLowerCase().includes(q))).map(x=>({...x,isActive:!x.annulled,isSpecial:Boolean(x.special_test)}))});
const defaultColDef=Object.freeze({sortable:true,filter:true,resizable:true,suppressHeaderMenuButton:true});
const gridComponents=Object.freeze({BioNexusGridActionsCell,BioNexusGridToggleCell});
const rowSelection=Object.freeze({mode:"multiRow",enableClickSelection:true,checkboxes:true,headerCheckbox:true,selectAll:"filtered"});
const money=p=>({field:p,headerName:"Precio "+p.slice(-1),width:125,type:"numericColumn",cellClass:"exam-price-cell",headerClass:"exam-price-header",valueFormatter:x=>Number(x.value||0).toFixed(2)});
const columnDefs=computed(()=>[
  {field:"description",headerName:"Descripción",minWidth:280,width:330,pinned:"left",lockPinned:true,suppressMovable:true,checkboxSelection:true,headerCheckboxSelection:true,cellClass:"exam-description-pinned"},
  {field:"abbreviation",headerName:"Abreviatura",width:130},
  {field:"isSpecial",headerName:"Prueba especial",width:170,cellClass:"exam-toggle-cell",headerClass:"exam-toggle-header",filter:BioNexusOptionFilter,filterParams:{options:[{value:true,label:"Si"},{value:false,label:"No"}]},cellRenderer:"BioNexusGridToggleCell",cellRendererParams:{onLabel:"Si",offLabel:"No",ariaLabel:"Prueba especial",disabled:()=>!canUpdate.value||saving.value,onToggle:row=>toggleSpecial(row)}},
  money("cost1"),money("cost2"),money("cost3"),money("cost4"),money("cost5"),money("cost6"),
  {field:"isActive",headerName:"Estado",width:155,cellClass:"exam-toggle-cell",headerClass:"exam-toggle-header",filter:BioNexusOptionFilter,filterParams:{options:[{value:true,label:"Activo"},{value:false,label:"Inactivo"}]},cellRenderer:"BioNexusGridToggleCell",cellRendererParams:{onLabel:"Activo",offLabel:"Inactivo",disabled:()=>!canChangeStatus.value||saving.value,onToggle:row=>stateDialog.value?.open(row,"examen")}},
  {colId:"actions",headerName:"Acciones",width:196,minWidth:196,maxWidth:196,pinned:"right",lockPinned:true,suppressMovable:true,sortable:false,filter:false,resizable:false,cellRenderer:"BioNexusGridActionsCell",cellRendererParams:{actions:[{key:"view",label:"Ver",icon:"visibility",onClick:row=>detailDialog.value?.show(row,selectedGroup.value)},{key:"worksheet",label:"Hoja de trabajo",icon:"description",visible:()=>canUpdate.value,onClick:row=>openWorksheet(row)},{key:"result-designer",label:"Diseñador de resultado",icon:"dashboard_customize",visible:()=>canUpdate.value,onClick:row=>openResultDesigner(row)},{key:"edit",label:"Editar",visible:()=>canUpdate.value,disabled:()=>saving.value,onClick:row=>examDialog.value?.openEdit(row)}]}}
]);
const contextMenuItems=computed(()=>{const state=contextMenuState.value,row=state.row;if(!row)return[];if(state.type==="grupo")return[{key:"edit",icon:"edit",label:"Editar grupo",visible:canUpdate.value,action:()=>groupDialog.value?.openEdit(row)},{key:"state",icon:row.annulled?"activate":"deactivate",label:row.annulled?"Activar grupo":"Inactivar grupo",visible:canChangeStatus.value,action:()=>stateDialog.value?.open(row,"grupo")}];const rows=selectedRows.value.length?selectedRows.value:[row],ids=rows.map(item=>item.id),hasActive=rows.some(item=>item.annulled!==true),hasInactive=rows.some(item=>item.annulled===true),hasSpecial=rows.some(item=>Boolean(item.special_test)),hasRegular=rows.some(item=>!Boolean(item.special_test));return[{key:"view",icon:"visibility",label:"Ver examen",visible:ids.length===1,action:()=>detailDialog.value?.show(rows[0],selectedGroup.value)},{key:"worksheet",icon:"description",label:"Hoja de trabajo",visible:canUpdate.value&&ids.length===1,action:()=>openWorksheet(rows[0])},{key:"result-designer",icon:"dashboard_customize",label:"Diseñador de resultado",visible:canUpdate.value&&ids.length===1,action:()=>openResultDesigner(rows[0])},{key:"edit",icon:"edit",label:"Editar examen",visible:canUpdate.value&&ids.length===1,action:()=>examDialog.value?.openEdit(rows[0])},{key:"activate",icon:"activate",label:ids.length===1?"Activar examen":`Activar ${ids.length} seleccionado(s)`,visible:canChangeStatus.value&&hasInactive,action:()=>runBulk(ids,{annulled:false})},{key:"deactivate",icon:"deactivate",label:ids.length===1?"Inactivar examen":`Inactivar ${ids.length} seleccionado(s)`,visible:canChangeStatus.value&&hasActive,action:()=>runBulk(ids,{annulled:true})},{key:"special-on",icon:"activate",label:ids.length===1?"Marcar como prueba especial":"Marcar seleccionados como prueba especial",visible:canUpdate.value&&hasRegular,action:()=>runBulk(ids,{special_test:true})},{key:"special-off",icon:"deactivate",label:ids.length===1?"Quitar prueba especial":"Quitar prueba especial a seleccionados",visible:canUpdate.value&&hasSpecial,action:()=>runBulk(ids,{special_test:false})}]});
function getRowId({data}){return String(data.id)}
function rememberGrid(event){gridApi.value=event?.api??null;event?.api?.addEventListener?.("selectionChanged",()=>{selectedRows.value=event.api.getSelectedRows?.()??[]})}
async function selectGroup(group){selectedGroup.value=group;selectedRows.value=[];await loadExams()}
async function loadGroups(){loadingGroups.value=true;loadError.value="";try{groups.value=await getExamGroups();const current=selectedGroup.value?groups.value.find(x=>x.id===selectedGroup.value.id):null;selectedGroup.value=current||groups.value[0]||null;if(selectedGroup.value)await loadExams()}catch(e){loadError.value=examCatalogError(e,"No fue posible consultar los grupos.");toast.error(loadError.value)}finally{loadingGroups.value=false}}
async function loadExams(){if(!selectedGroup.value)return;loadingExams.value=true;selectedRows.value=[];try{exams.value=await getExamsByGroup(selectedGroup.value.id)}catch(e){exams.value=[];toast.error(examCatalogError(e,"No fue posible consultar los exámenes."))}finally{loadingExams.value=false}}
function replaceGroup(row){groups.value=groups.value.map(x=>x.id===row.id?row:x);if(!groups.value.some(x=>x.id===row.id))groups.value.push(row);groups.value.sort((a,b)=>a.position-b.position);if(selectedGroup.value?.id===row.id)selectedGroup.value=row}
function replaceExam(row){exams.value=exams.value.map(x=>x.id===row.id?row:x);if(!exams.value.some(x=>x.id===row.id))exams.value.push(row);exams.value.sort((a,b)=>a.description.localeCompare(b.description))}
async function toggleSpecial(row){if(!canUpdate.value||saving.value)return;const previous=Boolean(row.special_test);row.special_test=!previous;row.isSpecial=!previous;gridApi.value?.refreshCells?.({force:true});try{const saved=await updateExam(row.id,{special_test:!previous});replaceExam(saved);toast.success(saved.special_test?"Marcado como prueba especial.":"Prueba especial desmarcada.")}catch(e){row.special_test=previous;row.isSpecial=previous;gridApi.value?.refreshCells?.({force:true});toast.error(examCatalogError(e,"No fue posible cambiar Prueba especial."))}}
async function runBulk(ids,changes){if(saving.value||ids.length===0)return;saving.value=true;try{const result=await bulkUpdateExams(ids,changes);await loadExams();toast.success(`${result.updated} examen(es) actualizado(s).`)}catch(e){toast.error(examCatalogError(e,"No fue posible aplicar el cambio masivo."))}finally{saving.value=false}}
async function openGroupContextMenu(event,row){contextMenuState.value={open:true,x:event.clientX,y:event.clientY,type:"grupo",row};await nextTick();contextMenu.value?.positionMenu?.()}
async function openExamContextMenu({event,row}){if(!event||!row)return;const api=gridApi.value,current=api?.getSelectedRows?.()??[];if(!current.some(item=>item.id===row.id)){api?.deselectAll?.();api?.getRowNode?.(String(row.id))?.setSelected?.(true);selectedRows.value=[row]}else selectedRows.value=current;contextMenuState.value={open:true,x:event.clientX,y:event.clientY,type:"examen",row};await nextTick();contextMenu.value?.positionMenu?.()}
function closeContextMenu(){contextMenuState.value={open:false,x:0,y:0,type:"",row:null}}
async function runContextAction(item){const action=item?.action;closeContextMenu();if(typeof action==="function")await action()}
async function locateGlobalResult(result){const group=groups.value.find(item=>item.id===result.group_id);if(!group){toast.error("El grupo del examen ya no esta disponible.");return}examSearch.value="";selectedGroup.value=group;await loadExams();await nextTick();const index=exams.value.findIndex(item=>item.id===result.id);if(index<0){toast.error("El examen ya no esta disponible.");return}const api=gridApi.value;if(api){api.paginationGoToPage?.(Math.floor(index/10));api.ensureIndexVisible?.(index,"middle");const node=api.getRowNode?.(String(result.id));if(node){node.setSelected?.(true,true);api.flashCells?.({rowNodes:[node],flashDuration:1400,fadeDuration:900})}}globalSearch.value?.clear();toast.success(`Examen ubicado en ${group.description}.`)}
async function saveGroup(p){saving.value=true;groupDialog.value?.clearError();try{const row=p.mode==="create"?await createExamGroup(p.values):await updateExamGroup(p.record.id,p.values);replaceGroup(row);groupDialog.value?.close();if(p.mode==="create")await selectGroup(row);toast.success(p.mode==="create"?"Grupo creado correctamente.":"Grupo actualizado correctamente.")}catch(e){groupDialog.value?.setError(examCatalogError(e,"No fue posible guardar el grupo."))}finally{saving.value=false}}
async function saveExam(p){saving.value=true;examDialog.value?.clearError();try{const row=p.mode==="create"?await createExam(p.values):await updateExam(p.record.id,p.values);replaceExam(row);examDialog.value?.close();toast.success(p.mode==="create"?"Examen creado correctamente.":"Examen actualizado correctamente.")}catch(e){examDialog.value?.setError(examCatalogError(e,"No fue posible guardar el examen."))}finally{saving.value=false}}
async function openWorksheet(row){if(!canUpdate.value||saving.value)return;try{const full=await getExam(row.id);worksheetDialog.value?.open(full)}catch(e){toast.error(examCatalogError(e,"No fue posible consultar la Hoja de trabajo."))}}async function openResultDesigner(row){if(!canUpdate.value||saving.value)return;try{const full=await getExam(row.id);resultDesignerDialog.value?.open(full)}catch(e){toast.error(examCatalogError(e,"No fue posible consultar el Formato de resultado."))}}
async function saveWorksheet(payload){if(!payload?.record||saving.value)return;saving.value=true;worksheetDialog.value?.setError("");try{const saved=await updateExam(payload.record.id,{work_sheet:payload.work_sheet});replaceExam(saved);worksheetDialog.value?.markSaved(saved);toast.success("Hoja de trabajo guardada correctamente.")}catch(e){worksheetDialog.value?.setError(examCatalogError(e,"No fue posible guardar la Hoja de trabajo."))}finally{saving.value=false}}async function saveState(row,label){saving.value=true;stateDialog.value?.clearError();try{const saved=label==="grupo"?await updateExamGroup(row.id,{annulled:!row.annulled}):await updateExam(row.id,{annulled:!row.annulled});if(label==="grupo")replaceGroup(saved);else replaceExam(saved);stateDialog.value?.close();toast.success(saved.annulled?"Registro inactivado correctamente.":"Registro activado correctamente.")}catch(e){stateDialog.value?.setError(examCatalogError(e,"No fue posible cambiar el estado."))}finally{saving.value=false}}
onMounted(async()=>{try{taxes.value=await getTaxes()}catch{taxes.value=[]}await loadGroups()});
</script>
<style scoped>
.exam-catalog-page{min-width:0}.exam-catalog-layout{display:grid;grid-template-columns:minmax(260px,320px) minmax(0,1fr);gap:var(--bio-nexus-space-4)}.exam-catalog-layout.groups-collapsed{grid-template-columns:42px minmax(0,1fr)}.exam-group-panel,.exam-grid-panel{min-width:0;padding:var(--bio-nexus-space-4);border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);box-shadow:var(--bio-nexus-shadow-sm)}.exam-group-panel>header,.exam-grid-heading{display:flex;justify-content:space-between;gap:var(--bio-nexus-space-3);align-items:center;margin-bottom:var(--bio-nexus-space-3)}header p{margin:0;color:var(--bio-nexus-color-accent);font-size:var(--bio-nexus-font-size-xs);font-weight:800;text-transform:uppercase}header h3{margin:2px 0 0;color:var(--bio-nexus-color-primary-strong)}.group-header-actions{display:flex;align-items:center;gap:8px}.panel-collapse,.panel-expand{display:grid;place-items:center;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);color:var(--bio-nexus-color-primary);cursor:pointer}.panel-collapse{width:36px;height:36px}.panel-expand{align-self:start;gap:4px;width:42px;min-height:128px;padding:8px 0}.panel-expand span{writing-mode:vertical-rl;transform:rotate(180deg);font-size:var(--bio-nexus-font-size-xs);font-weight:700}.exam-group-list{display:grid;gap:6px;max-height:540px;margin:var(--bio-nexus-space-3) 0 0;padding:0;overflow:auto;list-style:none}.exam-group-list li{display:grid;grid-template-columns:minmax(0,1fr) 34px;gap:4px}.exam-group-list li>button:first-child{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;padding:10px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface-soft);text-align:left;cursor:pointer}.exam-group-list button.selected{border-color:var(--bio-nexus-color-primary);box-shadow:inset 3px 0 0 var(--bio-nexus-color-accent)}.exam-group-list button.inactive{opacity:.65}.exam-group-list span{display:grid;min-width:0}.exam-group-list strong,.exam-group-list small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.exam-group-list small{color:var(--bio-nexus-color-text-muted)}.exam-group-list em{font-size:11px;font-style:normal;color:var(--bio-nexus-color-text-muted)}.exam-group-edit{display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:var(--bio-nexus-color-primary);cursor:pointer}.exam-group-actions{display:flex;margin-top:var(--bio-nexus-space-3)}.exam-catalog-page :deep(.ag-pinned-left-header),.exam-catalog-page :deep(.ag-pinned-left-cols-container){border-right:1px solid var(--bio-nexus-color-border-strong);box-shadow:4px 0 12px rgb(13 36 58 / 10%)}.exam-catalog-page :deep(.exam-description-pinned){font-weight:500}.exam-catalog-page :deep(.exam-price-cell){justify-content:flex-end;text-align:right;font-variant-numeric:tabular-nums}.exam-catalog-page :deep(.exam-price-header .ag-header-cell-label){justify-content:flex-end}.exam-catalog-page :deep(.exam-price-header .ag-header-cell-text){text-align:right;width:100%}.exam-catalog-page :deep(.exam-toggle-cell){display:flex;align-items:center;justify-content:center;text-align:center}.exam-catalog-page :deep(.exam-toggle-header .ag-header-cell-label){justify-content:center}.exam-catalog-page :deep(.exam-toggle-header .ag-header-cell-text){text-align:center;width:100%}.exam-selection-count{display:inline-flex;align-items:center;align-self:center;min-height:38px;margin:0;color:var(--bio-nexus-color-text-secondary);font-family:var(--bio-nexus-font-family);font-size:var(--bio-nexus-font-size-sm);font-weight:600;line-height:1.2;white-space:nowrap}.exam-catalog-page :deep(.ag-row.ag-row-selected){background:var(--bio-nexus-color-info-soft)!important;box-shadow:inset 3px 0 0 var(--bio-nexus-color-accent)}@media(max-width:980px){.exam-catalog-layout,.exam-catalog-layout.groups-collapsed{grid-template-columns:1fr}.panel-expand{width:100%;min-height:38px;grid-auto-flow:column;justify-content:center}.panel-expand span{writing-mode:horizontal-tb;transform:none}.exam-group-list{max-height:280px}}









/* BIO NEXUS EXAM GROUPS COLLAPSED COMPACT V15 START */
section:has(.panel-collapse.panel-edge-toggle),
aside:has(.panel-collapse.panel-edge-toggle) {
  position: relative;
  overflow: visible;
}

:is(header, .panel-header, .catalog-header):has(> .panel-collapse.panel-edge-toggle) {
  position: static;
}

.panel-collapse.panel-edge-toggle {
  position: absolute !important;
  top: 0 !important;
  right: -14px !important;
  z-index: 12 !important;
  display: grid !important;
  place-items: center !important;
  box-sizing: border-box !important;
  width: 28px !important;
  min-width: 28px !important;
  max-width: 28px !important;
  height: 38px !important;
  min-height: 38px !important;
  max-height: 38px !important;
  padding: 0 !important;
  margin: 0 !important;
  transform: none !important;
  border: 1px solid var(--bio-nexus-color-border-strong) !important;
  border-radius: 8px !important;
  background: var(--bio-nexus-color-surface) !important;
  color: var(--bio-nexus-color-primary) !important;
  box-shadow: var(--bio-nexus-shadow-sm) !important;
}

.panel-collapse.panel-edge-toggle svg {
  width: 18px !important;
  height: 18px !important;
}

/* Estado cerrado: carril exacto del boton y sin separacion desperdiciada. */
.exam-catalog-layout:has(> .panel-expand.panel-edge-toggle),
.exam-catalog-grid:has(> .panel-expand.panel-edge-toggle),
.catalog-layout:has(> .panel-expand.panel-edge-toggle) {
  grid-template-columns: 28px minmax(0, 1fr) !important;
  column-gap: 0 !important;
  gap: 0 !important;
}

.panel-expand.panel-edge-toggle {
  display: grid !important;
  place-items: center !important;
  align-self: start !important;
  box-sizing: border-box !important;
  width: 28px !important;
  min-width: 28px !important;
  max-width: 28px !important;
  height: 38px !important;
  min-height: 38px !important;
  max-height: 38px !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: visible !important;
  border: 1px solid var(--bio-nexus-color-border-strong) !important;
  border-left: 0 !important;
  border-radius: 0 8px 8px 0 !important;
  background: var(--bio-nexus-color-surface) !important;
  color: var(--bio-nexus-color-primary) !important;
  box-shadow: var(--bio-nexus-shadow-sm) !important;
  font-size: 0 !important;
}

.panel-expand.panel-edge-toggle > * {
  display: none !important;
}

/* Chevron dibujado con bordes, sin caracteres que puedan corromperse por codificacion. */
.panel-expand.panel-edge-toggle::after {
  content: "" !important;
  display: block !important;
  box-sizing: border-box !important;
  width: 9px !important;
  height: 9px !important;
  margin-left: -3px !important;
  border-top: 2px solid currentColor !important;
  border-right: 2px solid currentColor !important;
  transform: rotate(45deg) !important;
}
/* BIO NEXUS EXAM GROUPS COLLAPSED COMPACT V15 END */</style>
