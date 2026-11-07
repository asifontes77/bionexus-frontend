<template>
  <section class="admin-plans-page" aria-labelledby="admin-plans-title">
    <BioNexusAdminPageHeader title-id="admin-plans-title" eyebrow="Administración de plataforma" title="Planes comerciales" description="Configura precios, periodicidad, días de gracia y beneficios disponibles." icon="workspace_premium" />
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ loadError }}</div>
    <section class="bio-nexus-administrative-directory admin-plans-directory" aria-label="Planes registrados">
      <BioNexusDataGrid
        class="admin-plans-grid"
        :row-data="rows"
        :column-defs="columnDefs"
        :default-col-def="defaultColDef"
        :components="gridComponents"
        :get-row-id="getRowId"
        :search-enabled="true"
        v-model:search-model-value="search"
        search-placeholder="Buscar plan"
        :refresh-enabled="true"
        :refreshing="loading"
        :refresh-disabled="saving"
        :page-size="10"
        :page-size-selector="[10, 20, 50, 100]"
        :min-grid-height="320"
        :max-grid-height="600"
        empty-text="No existen planes comerciales que coincidan con los filtros."
        @refresh="loadPlans"
      >
        <template #actions>
          <BioNexusActionButton icon="add" icon-only shape="rounded" size="md" variant="primary" label="Nuevo plan" :disabled="loading || saving" @click="formDialog?.openCreate()" />
        </template>
      </BioNexusDataGrid>
    </section>
    <PlatformPlanFormDialog ref="formDialog" :saving="saving" @submit="saveForm" />
    <PlatformPlanDetailDialog ref="detailDialog" />
    <BioNexusStateDialog ref="stateDialog" :saving="saving" @confirm="confirmStatus" />
  </section>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import BioNexusAdminPageHeader from '@/components/ui/BioNexusAdminPageHeader.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusStateDialog from '@/components/ui/BioNexusStateDialog.vue'
import BioNexusDataGrid from '@/components/grid/BioNexusDataGrid.vue'
import BioNexusGridActionsCell from '@/components/grid/BioNexusGridActionsCell.vue'
import BioNexusGridToggleCell from '@/components/grid/BioNexusGridToggleCell.vue'
import BioNexusOptionFilter from '@/components/grid/BioNexusOptionFilter.vue'
import PlatformPlanFormDialog from '@/components/platform/PlatformPlanFormDialog.vue'
import PlatformPlanDetailDialog from '@/components/platform/PlatformPlanDetailDialog.vue'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import { createPlatformPlan, getPlatformPlans, updatePlatformPlan } from '@/services/platformBillingService'
const toast=useBioNexusToast(),rows=ref([]),loading=ref(false),saving=ref(false),loadError=ref(''),search=ref(''),formDialog=ref(null),detailDialog=ref(null),stateDialog=ref(null)
const defaultColDef=Object.freeze({sortable:true,filter:true,resizable:true,suppressHeaderMenuButton:true})
const gridComponents=Object.freeze({BioNexusGridActionsCell,BioNexusGridToggleCell})
const columnDefs=computed(()=>[
  {field:'code',headerName:'Código',minWidth:150,width:170,pinned:'left',lockPinned:true,suppressMovable:true},
  {field:'name',headerName:'Nombre',minWidth:220,flex:1},
  {field:'description',headerName:'Descripción',minWidth:260,flex:1.3,valueFormatter:({value})=>value||'—'},
  {field:'price',headerName:'Precio',width:145,type:'numericColumn',valueFormatter:({data})=>formatPrice(data?.price,data?.currency)},
  {field:'planType',headerName:'Tipo',width:120,valueFormatter:({value})=>value==='trial'?'Trial':'Pago'},
  {colId:'duration',headerName:'Duración',width:145,valueGetter:({data})=>formatDuration(data)},
  {field:'gracePeriodDays',headerName:'Gracia',width:115,type:'numericColumn',valueFormatter:({value})=>`${Number(value)||0} días`},
  {field:'isActive',headerName:'Estado',width:170,headerClass:'admin-plans-center-header',cellClass:'admin-plans-center-cell',filter:BioNexusOptionFilter,filterParams:{options:[{value:true,label:'Activo'},{value:false,label:'Desactivado'}]},cellRenderer:'BioNexusGridToggleCell',cellRendererParams:{onLabel:'Activo',offLabel:'Desactivado',ariaLabel:'Estado',disabled:()=>saving.value,onToggle:requestStatus}},
  {colId:'actions',headerName:'Acciones',width:110,minWidth:110,maxWidth:110,pinned:'right',lockPinned:true,suppressMovable:true,sortable:false,filter:false,resizable:false,suppressHeaderMenuButton:true,headerClass:'bio-nexus-grid-actions-header',cellClass:'bio-nexus-grid-actions-cell',cellRenderer:'BioNexusGridActionsCell',cellRendererParams:{actions:[{key:'view',label:'Ver',icon:'visibility',onClick:row=>detailDialog.value?.open(row)},{key:'edit',label:'Editar',icon:'edit',disabled:()=>saving.value,onClick:row=>formDialog.value?.openEdit(row)}]}}
])
function getRowId({data}){return String(data.planId)}
function comparePlans(a,b){return String(a.name||'').localeCompare(String(b.name||''),'es',{sensitivity:'base'})||String(a.code||'').localeCompare(String(b.code||''),'es')}
function replaceRow(saved){const next=rows.value.filter(row=>String(row.planId)!==String(saved.planId));next.push(saved);rows.value=next.sort(comparePlans)}
function formatPrice(price,currency){const value=Number(price);return Number.isFinite(value)?`${value.toLocaleString('es')} ${currency||''}`.trim():'—'}
function formatDuration(plan){const count=Number(plan?.intervalCount)||0;const units={day:'día',month:'mes',year:'año'};const unit=units[plan?.intervalUnit]||'unidad';return `${count} ${unit}${count===1?'':'s'}`}
async function loadPlans(){if(loading.value||saving.value)return;loading.value=true;loadError.value='';try{rows.value=(await getPlatformPlans()).sort(comparePlans)}catch(error){rows.value=[];loadError.value=error?.message||'No fue posible consultar los planes.';toast.error(loadError.value)}finally{loading.value=false}}
async function saveForm(payload){if(saving.value)return;saving.value=true;formDialog.value?.clearError();try{const saved=payload.mode==='create'?await createPlatformPlan(payload.values):await updatePlatformPlan(payload.record.planId,payload.values);replaceRow(saved);formDialog.value?.markSavedAndClose();toast.success(payload.mode==='create'?'Plan creado correctamente.':'Plan actualizado correctamente.')}catch(error){formDialog.value?.setError(error?.message||'No fue posible guardar el plan.')}finally{saving.value=false}}
function requestStatus(row){if(!row||saving.value)return;stateDialog.value?.open(row,{kicker:'Estado del plan',label:item=>item.name,isInactive:item=>item.isActive===false,activateTitle:'Activar plan',deactivateTitle:'Desactivar plan',activateMessage:'El plan volverá a estar disponible para nuevas suscripciones.',deactivateMessage:'El plan permanecerá visible, pero no estará disponible para nuevas suscripciones.',dangerOnDeactivate:true})}
async function confirmStatus(row){if(!row||saving.value)return;saving.value=true;stateDialog.value?.clearError();try{const saved=await updatePlatformPlan(row.planId,{code:row.code,name:row.name,description:row.description||'',price:Number(row.price),currency:row.currency,planType:row.planType,intervalUnit:row.intervalUnit,intervalCount:Number(row.intervalCount),gracePeriodDays:Number(row.gracePeriodDays),isActive:row.isActive===false});replaceRow(saved);stateDialog.value?.close();toast.success(row.isActive===false?'Plan activado correctamente.':'Plan desactivado correctamente.')}catch(error){stateDialog.value?.setError(error?.message||'No fue posible cambiar el estado del plan.')}finally{saving.value=false}}
onMounted(loadPlans)
</script>
<style scoped>
.admin-plans-page{display:grid;gap:var(--bio-nexus-space-5);min-width:0;font-family:var(--bio-nexus-font-family);color:var(--bio-nexus-color-text)}
.admin-plans-grid{min-width:0;width:100%}
.admin-plans-page :deep(.admin-plans-center-cell),.admin-plans-page :deep(.admin-plans-center-header .ag-header-cell-label){justify-content:center}
.admin-plans-page :deep(.ag-pinned-right-header),.admin-plans-page :deep(.ag-pinned-right-cols-container){border-left:1px solid var(--bio-nexus-color-border-strong)}

.admin-plans-directory { min-width: 0; }
</style>
