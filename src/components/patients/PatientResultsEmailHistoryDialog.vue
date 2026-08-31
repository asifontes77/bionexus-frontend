<template>
  <BioNexusDialog ref="dialog" size="wide" kicker="Trazabilidad" title="Historial de env&#237;os de resultados">
    <section class="history-dialog-body">
      <div v-if="loading" class="bio-nexus-message">Consultando historial...</div>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
      <BioNexusDataGrid v-else :row-data="rows" :column-defs="columns" :components="components" :min-grid-height="340" :max-grid-height="560" :search-enabled="true" v-model:search-model-value="search" :quick-filter-text="search" :export-options="false" empty-text="No existen intentos en el rango consultado." />
    </section>
    <template #footer><button type="button" class="bio-nexus-action bio-nexus-action-secondary" @click="close">Cerrar</button></template>
  </BioNexusDialog>
</template>
<script setup>
import { ref } from "vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import { getPatientResultsEmailHistory } from "@/services/patientResultsEmailService";
const dialog=ref(null), rows=ref([]), loading=ref(false), errorMessage=ref(""), search=ref("");
const components={ BioNexusOptionFilter };
const columns=[
 {field:"requestedAt",headerName:"Solicitado",valueFormatter:({value})=>formatDateTime(value),minWidth:165},
 {field:"patientPosition",headerName:"Nro. ingreso",minWidth:120},
 {field:"patientName",headerName:"Paciente",minWidth:190,flex:1},
 {field:"recipientEmail",headerName:"Destinatario",minWidth:200,flex:1},
 {field:"deliveryType",headerName:"Tipo",valueFormatter:({value})=>value==="resend"?"Reenv&#237;o":"Env&#237;o",filter:BioNexusOptionFilter,filterParams:{options:[{value:"send",label:"Env&#237;o"},{value:"resend",label:"Reenv&#237;o"}]},minWidth:115},
 {field:"status",headerName:"Resultado",valueFormatter:({value})=>({started:"En proceso",success:"Exitoso",failed:"Fallido"}[value]||value),filter:BioNexusOptionFilter,filterParams:{options:[{value:"started",label:"En proceso"},{value:"success",label:"Exitoso"},{value:"failed",label:"Fallido"}]},minWidth:125},
 {field:"requestedByName",headerName:"Solicitado por",minWidth:160},
 {field:"completedByName",headerName:"Completado por",minWidth:160},
 {field:"pdfSizeBytes",headerName:"PDF bytes",minWidth:110},
 {field:"errorCode",headerName:"Error",minWidth:180,flex:1},
];
function formatDateTime(value){if(!value)return "";const date=new Date(value);return Number.isNaN(date.getTime())?String(value):date.toLocaleString("es-VE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true});}
async function open(dateFrom,dateTo){dialog.value?.open();loading.value=true;errorMessage.value="";try{rows.value=await getPatientResultsEmailHistory(dateFrom,dateTo);}catch{rows.value=[];errorMessage.value="No fue posible consultar el historial.";}finally{loading.value=false;}}
function close(){dialog.value?.close();}
defineExpose({open});
</script>
<style scoped>.history-dialog-body{min-width:0}.history-dialog-body :deep(.bio-nexus-data-grid){width:min(1180px,82vw)}</style>
