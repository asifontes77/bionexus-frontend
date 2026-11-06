<template>
  <section class="admin-payments-page" aria-labelledby="admin-payments-title">
    <BioNexusAdminPageHeader title-id="admin-payments-title" eyebrow="Administración de plataforma" title="Pagos manuales" description="Registra pagos y períodos de servicio para cada laboratorio." icon="payments">
      <template #actions>
        <BioNexusFormField class="admin-payment-laboratory" label="Laboratorio" field-id="admin-payment-laboratory">
          <BioNexusSearchableSelect id="admin-payment-laboratory" v-model="selectedLaboratoryId" :options="laboratoryOptions" :disabled="loadingLaboratories || saving || Boolean(downloadingPaymentId)" placeholder="Seleccionar laboratorio" search-placeholder="Buscar laboratorio..." empty-text="Sin laboratorios coincidentes" @update:model-value="changeLaboratory" />
        </BioNexusFormField>
      </template>
    </BioNexusAdminPageHeader>
    <div v-if="error" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ error }}</div>
    <section class="bio-nexus-administrative-directory admin-payments-directory" aria-label="Historial de pagos">
      <BioNexusDataGrid class="admin-payments-grid" :row-data="payments" :column-defs="columnDefs" :default-col-def="defaultColDef" :components="gridComponents" :get-row-id="getRowId" search-enabled v-model:search-model-value="search" search-placeholder="Buscar pago" refresh-enabled :refreshing="loadingPayments" :refresh-disabled="saving || !selectedLaboratoryId" :page-size="10" :page-size-selector="[10,20,50,100]" :min-grid-height="320" :max-grid-height="600" :empty-text="selectedLaboratoryId ? 'No hay pagos registrados para este laboratorio.' : 'Selecciona un laboratorio para consultar pagos.'" @refresh="loadPayments">
        <template #actions><BioNexusActionButton icon="add" icon-only shape="rounded" size="md" variant="primary" label="Registrar pago" :disabled="!selectedLaboratoryId || loadingPayments || saving" @click="paymentDialog?.open(selectedLaboratory)" /></template>
      </BioNexusDataGrid>
    </section>
    <PlatformPaymentFormDialog ref="paymentDialog" :saving="saving" @submit="savePayment" />
  </section>
</template>
<script setup>
import { computed,onMounted,ref } from 'vue'
import BioNexusAdminPageHeader from '@/components/ui/BioNexusAdminPageHeader.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusSearchableSelect from '@/components/ui/BioNexusSearchableSelect.vue'
import BioNexusDataGrid from '@/components/grid/BioNexusDataGrid.vue'
import BioNexusGridActionsCell from '@/components/grid/BioNexusGridActionsCell.vue'
import PlatformPaymentFormDialog from '@/components/platform/PlatformPaymentFormDialog.vue'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import { getPlatformLaboratories } from '@/services/platformService'
import { createPlatformLaboratoryPayment,downloadPlatformLaboratoryPaymentProof,getPlatformLaboratoryPayments } from '@/services/platformBillingService'
const toast=useBioNexusToast(),laboratories=ref([]),payments=ref([]),selectedLaboratoryId=ref(''),loadingLaboratories=ref(false),loadingPayments=ref(false),saving=ref(false),downloadingPaymentId=ref(''),error=ref(''),search=ref(''),paymentDialog=ref(null);let paymentRequestSequence=0
const laboratoryOptions=computed(()=>laboratories.value.map(item=>({value:String(item.id),label:`${item.name} · ${item.rif}`}))),selectedLaboratory=computed(()=>laboratories.value.find(item=>String(item.id)===String(selectedLaboratoryId.value))||null)
const defaultColDef=Object.freeze({sortable:true,filter:true,resizable:true,suppressHeaderMenuButton:true}),gridComponents=Object.freeze({BioNexusGridActionsCell})
const columnDefs=computed(()=>[
 {field:'paidAt',headerName:'Fecha',width:135,valueFormatter:({value})=>formatDate(value)},
 {field:'amount',headerName:'Monto',width:150,type:'numericColumn',valueFormatter:({data})=>formatAmount(data?.amount,data?.currency)},
 {field:'method',headerName:'Método',minWidth:170,flex:1},
 {field:'reference',headerName:'Referencia',minWidth:180,flex:1,valueFormatter:({value})=>value||'—'},
 {field:'periodStart',headerName:'Inicio',width:135,valueFormatter:({value})=>formatDate(value)},
 {field:'periodEnd',headerName:'Fin',width:135,valueFormatter:({value})=>formatDate(value)},
 {colId:'actions',headerName:'Acciones',width:86,minWidth:86,maxWidth:86,pinned:'right',lockPinned:true,suppressMovable:true,sortable:false,filter:false,resizable:false,suppressHeaderMenuButton:true,headerClass:'bio-nexus-grid-actions-header',cellClass:'bio-nexus-grid-actions-cell',cellRenderer:'BioNexusGridActionsCell',cellRendererParams:{actions:[{key:'download',label:'Descargar comprobante',icon:'download',visible:row=>row.hasProof===true,disabled:row=>downloadingPaymentId.value===String(row.paymentId),onClick:downloadProof}]}}
])
function getRowId({data}){return String(data.paymentId)}
function comparePayments(a,b){return String(b.paidAt||'').localeCompare(String(a.paidAt||''))}
async function loadLaboratories(){loadingLaboratories.value=true;error.value='';try{const result=await getPlatformLaboratories();if(!Array.isArray(result))throw new Error('El servidor devolvió una lista de laboratorios no válida.');laboratories.value=result;if(result.length){selectedLaboratoryId.value=String(result[0].id);await loadPayments()}}catch(cause){error.value=cause?.message||'No fue posible consultar los laboratorios.';toast.error(error.value)}finally{loadingLaboratories.value=false}}
function changeLaboratory(){payments.value=[];loadPayments()}
async function loadPayments(){if(!selectedLaboratoryId.value||loadingPayments.value)return;const laboratoryId=selectedLaboratoryId.value,sequence=++paymentRequestSequence;loadingPayments.value=true;error.value='';try{const result=await getPlatformLaboratoryPayments(laboratoryId);if(sequence===paymentRequestSequence&&selectedLaboratoryId.value===laboratoryId)payments.value=result.sort(comparePayments)}catch(cause){if(sequence===paymentRequestSequence){payments.value=[];error.value=cause?.message||'No fue posible consultar los pagos.';toast.error(error.value)}}finally{if(sequence===paymentRequestSequence)loadingPayments.value=false}}
async function savePayment(payload){if(saving.value||!selectedLaboratoryId.value)return;saving.value=true;paymentDialog.value?.clearError();try{const saved=await createPlatformLaboratoryPayment(selectedLaboratoryId.value,payload.values,payload.proof);payments.value=[saved,...payments.value.filter(item=>String(item.paymentId)!==String(saved.paymentId))].sort(comparePayments);paymentDialog.value?.markSavedAndClose();toast.success('Pago registrado; el período del servicio se actualizó.')}catch(cause){paymentDialog.value?.setError(cause?.message||'No fue posible registrar el pago.')}finally{saving.value=false}}
async function downloadProof(payment){const paymentId=String(payment.paymentId);downloadingPaymentId.value=paymentId;error.value='';try{const blob=await downloadPlatformLaboratoryPaymentProof(selectedLaboratoryId.value,payment.paymentId),extension=({'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg','image/webp':'webp'})[blob.type]||'bin',url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`comprobante-${paymentId.replace(/[^A-Za-z0-9._-]/g,'_')}.${extension}`;document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(cause){error.value=cause?.message||'No fue posible descargar el comprobante privado.';toast.error(error.value)}finally{downloadingPaymentId.value=''}}
function formatAmount(amount,currency){const value=Number(amount);return Number.isFinite(value)?`${value.toLocaleString('es')} ${currency||''}`.trim():'—'}function formatDate(value){if(!value)return'—';const date=new Date(value);return Number.isNaN(date.getTime())?String(value):date.toLocaleDateString('es')}
onMounted(loadLaboratories)
</script>
<style scoped>
.admin-payments-page {
  display:grid;
  gap:var(--bio-nexus-space-5);
  min-width:0;
  font-family:var(--bio-nexus-font-family);
  color:var(--bio-nexus-color-text)
}
.admin-payment-laboratory {
  width:min(390px,44vw)
}
.admin-payments-directory,.admin-payments-grid {
  min-width:0;
  width:100%
}
.admin-payments-page :deep(.ag-pinned-right-header),.admin-payments-page :deep(.ag-pinned-right-cols-container) {
  border-left:1px solid var(--bio-nexus-color-border-strong)
}
@media(max-width:820px) {
  .admin-payment-laboratory {
    width:100%
  }
}
</style>
