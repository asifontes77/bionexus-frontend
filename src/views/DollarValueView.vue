<template>
  <section class="dollar-value-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert"><strong>No fue posible cargar la cotización.</strong><span>{{ loadError }}</span></div>

    <BioNexusSectionPanel
      class="dollar-value-history-panel"
      variant="accent"
      title="Historial de cotizaciones"
      icon="history"
      description="Consulta la trazabilidad de las publicaciones automáticas y manuales."
    >
      <template #actions>
        <BioNexusActionButton icon="history" variant="secondary" @click="openHistory">Ver historial</BioNexusActionButton>
      </template>
    </BioNexusSectionPanel>

    <BioNexusSectionPanel title="Actualización automática" icon="schedule" description="Consulta primero el BCV de lunes a viernes y utiliza DolarApi únicamente como respaldo." variant="accent">
      <template #actions><span class="automation-status" :class="{ 'automation-status-active': Boolean(automation.enabled) }">{{ automation.enabled ? "Activa" : "Desactivada" }}</span></template>
      <div class="automation-content">
        <div class="automation-controls">
          <BioNexusCheckbox :model-value="Boolean(automation.enabled)" label="Actualizar automáticamente" :disabled="!canUpdate || automationSaving" @update:model-value="automation.enabled = Boolean($event)" />
          <BioNexusFormField class="automation-time-field" label="Hora" field-id="automation-time"><input id="automation-time" v-model="automation.run_time" class="bio-nexus-field" type="time" :disabled="!canUpdate || automationSaving"></BioNexusFormField>
          <span class="automation-zone"><b>Zona:</b> {{ automation.time_zone || "America/Caracas" }}</span>
        </div>
        <div v-if="canUpdate" class="automation-actions"><BioNexusActionButton icon="play_circle" variant="secondary" :loading="automationRunning" :disabled="automationSaving" @click="runAutomation">Ejecutar ahora</BioNexusActionButton><BioNexusActionButton icon="save" variant="primary" :loading="automationSaving" :disabled="automationRunning || !automationDirty" @click="saveAutomation">Guardar configuración</BioNexusActionButton></div>
      </div>
    </BioNexusSectionPanel>

    <BioNexusSectionPanel title="Publicación manual" icon="publish" description="Registra manualmente una nueva cotización." variant="accent">
      <div class="manual-content">
        <div class="current-value"><span>Valor vigente</span><strong>{{ current ? formatAmount(current.value) : "Sin registro" }}</strong><small v-if="current">Fuente: {{ current.updateMethod === "MANUAL" ? "Publicación manual" : sourceLabels[current.source] || sourceLabels.UNKNOWN }}</small><small v-if="current">Actualizado el: {{ formatDate(current.registeredAt) }}</small><small v-if="current">Vigente desde: {{ formatEffectiveDate(current.date) }}</small><small v-else>No existe una cotización registrada.</small></div>
        <form v-if="canUpdate" class="publish-form" @submit.prevent="publish">
          <BioNexusFormField label="Nuevo valor" field-id="dollar-value-input" :error="valueError" required><BioNexusNumericInput id="dollar-value-input" v-model="draftValue" :decimals="2" :min="0" :disabled="saving" :invalid="Boolean(valueError)" @input="clearPublishErrors" /></BioNexusFormField>
          <BioNexusActionButton icon="publish" type="submit" variant="primary" :loading="saving" :disabled="loading || !manualDirty">Publicar valor</BioNexusActionButton>
        </form>
      </div>
    </BioNexusSectionPanel>

    <BioNexusDialog ref="historyDialog" size="wide" body-class="dollar-value-history-dialog-body" kicker="Trazabilidad" title="Historial de cotizaciones">
      <BioNexusDataGrid class="dollar-value-grid" :row-data="history" :column-defs="columnDefs" :default-col-def="defaultColDef" :get-row-id="getRowId" :quick-filter-text="searchText" :search-enabled="true" v-model:search-model-value="searchText" search-placeholder="Buscar en el historial" :refresh-enabled="true" :refreshing="loading" :refresh-disabled="saving" :page-size="10" :page-size-selector="[10,20,50,100]" :min-grid-height="360" :max-grid-height="560" empty-text="No existen cotizaciones registradas." @refresh="load" />
      <template #footer><BioNexusActionButton variant="secondary" icon="close" @click="closeHistory">Cerrar</BioNexusActionButton></template>
    </BioNexusDialog>
  </section>
</template>
<script setup>
import { computed, onMounted, ref } from "vue";
import BioNexusActionButton from "@/components/ui/BioNexusActionButton.vue";
import BioNexusCheckbox from "@/components/ui/BioNexusCheckbox.vue";
import BioNexusDataGrid from "@/components/grid/BioNexusDataGrid.vue";
import BioNexusOptionFilter from "@/components/grid/BioNexusOptionFilter.vue";
import BioNexusDialog from "@/components/ui/BioNexusDialog.vue";
import BioNexusFormField from "@/components/ui/BioNexusFormField.vue";
import BioNexusNumericInput from "@/components/ui/BioNexusNumericInput.vue";
import BioNexusSectionPanel from "@/components/ui/BioNexusSectionPanel.vue";
import { useBioNexusToast } from "@/composables/useBioNexusToast";
import { dollarValueError, getCurrentDollarValue, getDollarValueAutomation, getDollarValueHistory, publishDollarValue, runDollarValueAutomation, saveDollarValueAutomation } from "@/services/dollarValueService";
import { useAuthorizationStore } from "@/stores/authorization";
import { useRegionalSettingsStore } from "@/stores/regionalSettings";
import { formatRegionalAmount, formatRegionalDateTime, formatRegionalFunctionalDate } from "@/services/regionalFormatter";
const authorizationStore=useAuthorizationStore(),regionalSettingsStore=useRegionalSettingsStore(),toast=useBioNexusToast();
const current=ref(null),history=ref([]),draftValue=ref(0),searchText=ref(""),loading=ref(false),saving=ref(false),loadError=ref(""),publishAttempted=ref(false),historyDialog=ref(null);
const automation=ref({enabled:false,run_time:"18:00",time_zone:"America/Caracas"}),automationInitial=ref({enabled:false,run_time:"18:00"}),automationSaving=ref(false),automationRunning=ref(false);
const canUpdate=computed(()=>authorizationStore.hasPermission("dollar-value.update"));
const valueError=computed(()=>publishAttempted.value&&Number(draftValue.value)<=0?"Indica un valor mayor que cero.":"");
const automationDirty=computed(()=>Boolean(automation.value.enabled)!==Boolean(automationInitial.value.enabled)||String(automation.value.run_time||"")!==String(automationInitial.value.run_time||""));
const manualDirty=computed(()=>Number(draftValue.value)>0&&(!current.value||Math.round(Number(draftValue.value)*100)!==Math.round(Number(current.value.value)*100)));
const defaultColDef=Object.freeze({sortable:true,filter:true,resizable:true,suppressHeaderMenuButton:true});
const sourceLabels=Object.freeze({BCV:"BCV",DOLAR_API:"DolarApi",OTHER:"Otra fuente",UNKNOWN:"No identificada"});
const methodLabels=Object.freeze({AUTOMATIC:"Automática",MANUAL:"Manual",UNKNOWN:"No identificada"});
const columnDefs=computed(()=>[
 {field:"registeredAt",headerName:"Actualizado el",minWidth:220,flex:1,filter:"agDateColumnFilter",valueFormatter:({value})=>formatDate(value)},
 {field:"date",headerName:"Vigente desde",minWidth:180,flex:.8,valueFormatter:({value})=>formatEffectiveDate(value)},
 {field:"value",headerName:"Valor",width:190,minWidth:160,filter:"agNumberColumnFilter",headerClass:"dollar-value-number-header",cellClass:"dollar-value-number-cell",valueFormatter:({value})=>formatAmount(value)},
 {field:"source",headerName:"Fuente",minWidth:160,flex:.7,filter:BioNexusOptionFilter,filterParams:{getValue:node=>node.data?.updateMethod==="MANUAL"?"MANUAL":node.data?.source||"UNKNOWN",options:[{value:"BCV",label:"BCV"},{value:"DOLAR_API",label:"DolarApi"},{value:"MANUAL",label:"Publicación manual"},{value:"OTHER",label:"Otra fuente"},{value:"UNKNOWN",label:"No identificada"}]},valueFormatter:({value,data})=>data?.updateMethod==="MANUAL"?"Publicación manual":sourceLabels[value]||sourceLabels.UNKNOWN},
 {field:"updateMethod",headerName:"Forma",minWidth:170,flex:.7,filter:BioNexusOptionFilter,filterParams:{options:[{value:"AUTOMATIC",label:"Automática"},{value:"MANUAL",label:"Manual"},{value:"UNKNOWN",label:"No identificada"}]},valueFormatter:({value})=>methodLabels[value]||methodLabels.UNKNOWN}
]);
function getRowId({data}){return String(data.id)} function formatAmount(value){return formatRegionalAmount(value,regionalSettingsStore.settings)} function formatDate(value){return formatRegionalDateTime(value,regionalSettingsStore.settings)} function formatEffectiveDate(value){return value?formatRegionalFunctionalDate(value,regionalSettingsStore.settings):"No disponible"}
function clearPublishErrors(){publishAttempted.value=false} function openHistory(){searchText.value="";historyDialog.value?.open()} function closeHistory(){historyDialog.value?.close()}
async function load(){if(loading.value||saving.value)return;loading.value=true;loadError.value="";try{const [active,rows,automatic]=await Promise.allSettled([getCurrentDollarValue(),getDollarValueHistory(),getDollarValueAutomation()]);current.value=active.status==="fulfilled"?active.value:null;history.value=rows.status==="fulfilled"?rows.value:[];if(automatic.status==="fulfilled"){automation.value=automatic.value;automationInitial.value={enabled:Boolean(automatic.value.enabled),run_time:String(automatic.value.run_time||"")};}if(active.status==="rejected"&&rows.status==="rejected")throw active.reason}catch(error){loadError.value=dollarValueError(error,"No fue posible consultar el valor del dólar.");toast.error(loadError.value)}finally{loading.value=false}}
async function saveAutomation(){if(automationSaving.value)return;automationSaving.value=true;try{automation.value=await saveDollarValueAutomation({enabled:Boolean(automation.value.enabled),run_time:automation.value.run_time});automationInitial.value={enabled:Boolean(automation.value.enabled),run_time:String(automation.value.run_time||"")};toast.success("Configuración automática guardada correctamente.")}catch(error){toast.error(dollarValueError(error,"No fue posible guardar la automatización."))}finally{automationSaving.value=false}}
async function runAutomation(){if(automationRunning.value)return;automationRunning.value=true;try{const result=await runDollarValueAutomation();if(result?.status==="FAILED")throw new Error(result.error||"La consulta automática falló.");toast.success(result?.status==="UNCHANGED"?"La cotización vigente no cambió.":"Cotización automática actualizada.");await load()}catch(error){toast.error(dollarValueError(error,"No fue posible ejecutar la actualización automática."))}finally{automationRunning.value=false}}
async function publish(){if(saving.value)return;publishAttempted.value=true;if(valueError.value)return;saving.value=true;try{const saved=await publishDollarValue(draftValue.value);if(!saved)throw new Error("El Backend no devolvió una cotización válida.");draftValue.value=0;publishAttempted.value=false;toast.success("Valor del dólar publicado correctamente.");saving.value=false;await load()}catch(error){toast.error(dollarValueError(error,"No fue posible publicar el valor del dólar."))}finally{saving.value=false}}
onMounted(load);
</script>
<style scoped>
.dollar-value-page{display:grid;gap:var(--bio-nexus-space-4);min-width:0}.automation-content,.manual-content{display:flex;align-items:end;justify-content:space-between;gap:var(--bio-nexus-space-4)}.automation-controls,.automation-actions,.publish-form{display:flex;align-items:center;gap:var(--bio-nexus-space-3)}.automation-time-field{width:148px}.automation-zone{padding-bottom:0;color:var(--bio-nexus-color-text-secondary);font-size:var(--bio-nexus-font-size-sm)}.automation-status{padding:3px 9px;border-radius:999px;background:var(--bio-nexus-color-surface-muted);color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs);font-weight:var(--bio-nexus-font-weight-bold)}.automation-status-active{background:color-mix(in srgb,var(--bio-nexus-color-success) 12%,transparent);color:var(--bio-nexus-color-success)}.current-value{display:grid;gap:var(--bio-nexus-space-1)}.current-value span{color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-xs);font-weight:var(--bio-nexus-font-weight-bold);text-transform:uppercase}.current-value strong{color:var(--bio-nexus-color-primary-strong);font-size:2rem;font-variant-numeric:tabular-nums;line-height:1.1}.current-value small{color:var(--bio-nexus-color-text-secondary)}.publish-form{display:grid;grid-template-columns:minmax(220px,260px) auto}.dollar-value-grid{width:100%;min-width:0}.dollar-value-grid :deep(.dollar-value-number-header .ag-header-cell-label){justify-content:flex-end}.dollar-value-grid :deep(.dollar-value-number-cell){justify-content:flex-end;font-variant-numeric:tabular-nums;text-align:right}:global(.dollar-value-history-dialog-body){padding:var(--bio-nexus-space-3);overflow-y:auto!important;overflow-x:hidden!important;max-height:min(72vh,720px);overscroll-behavior:contain;scrollbar-gutter:stable}@media(max-width:860px){.automation-content,.manual-content{align-items:stretch;flex-direction:column}.automation-controls,.automation-actions{flex-wrap:wrap}.publish-form{grid-template-columns:1fr}.automation-actions{justify-content:flex-end}}
:global(.dollar-value-history-panel){overflow:hidden}:global(.dollar-value-history-panel > :last-child){display:none!important;height:0!important;min-height:0!important;padding:0!important;margin:0!important;border:0!important;overflow:hidden!important}:global(.dollar-value-history-panel > :first-child){min-height:auto!important}
</style>
