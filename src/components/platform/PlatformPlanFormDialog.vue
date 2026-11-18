<template>
  <BioNexusDialog ref="dialog" size="wide" :prevent-close="saving || dirty" :kicker="mode==='create'?'Nuevo registro':'Editar registro'" :title="mode==='create'?'Crear plan comercial':'Editar plan comercial'" @before-close="requestClose" @close="reset">
    <section class="plan-dialog-body">
      <BioNexusFormErrors :errors="errorMessage" />
      <BioNexusSectionPanel title="Información comercial" icon="workspace_premium" description="Define el tipo, la duración, el precio y la gracia del plan." variant="accent">
        <div class="plan-fields">
          <BioNexusFormField label="Código" field-id="plan-code" required :error="fieldErrors.code" :help="`${draft.code.length} de 80 caracteres`"><input id="plan-code" ref="firstInput" v-model.trim="draft.code" class="bio-nexus-field" maxlength="80" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
          <BioNexusFormField label="Nombre" field-id="plan-name" required :error="fieldErrors.name" :help="`${draft.name.length} de 120 caracteres`"><input id="plan-name" v-model.trim="draft.name" class="bio-nexus-field" maxlength="120" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
          <BioNexusFormField class="wide" label="Descripción" field-id="plan-description" :help="`${draft.description.length} de 1000 caracteres`"><textarea id="plan-description" v-model.trim="draft.description" class="bio-nexus-field" rows="3" maxlength="1000" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
          <BioNexusFormField label="Tipo de plan" field-id="plan-type" required :error="fieldErrors.planType"><select id="plan-type" v-model="draft.planType" class="bio-nexus-field" :disabled="saving" @change="syncDirty"><option value="trial">Trial</option><option value="paid">Pago</option></select></BioNexusFormField>
          <BioNexusFormField label="Cantidad" field-id="plan-interval-count" required :error="fieldErrors.intervalCount" help="Entero mayor que cero."><BioNexusNumericInput id="plan-interval-count" v-model="draft.intervalCount" :decimals="0" :min="1" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
          <BioNexusFormField label="Unidad de duración" field-id="plan-interval-unit" required :error="fieldErrors.intervalUnit"><select id="plan-interval-unit" v-model="draft.intervalUnit" class="bio-nexus-field" :disabled="saving" @change="syncDirty"><option value="day">Día(s)</option><option value="month">Mes(es)</option><option value="year">Año(s)</option></select></BioNexusFormField>
          <BioNexusFormField label="Precio" field-id="plan-price" required :error="fieldErrors.price"><BioNexusNumericInput id="plan-price" v-model="draft.price" :decimals="2" :min="0" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
          <BioNexusFormField label="Moneda" field-id="plan-currency" required :error="fieldErrors.currency"><BioNexusSearchableSelect id="plan-currency" v-model="draft.currency" :options="currencyOptions" value-key="value" label-key="label" placeholder="Selecciona una moneda" search-placeholder="Buscar moneda..." empty-text="Sin monedas globales activas" :disabled="saving" @change="syncDirty" /></BioNexusFormField>
          <BioNexusFormField label="Días de gracia" field-id="plan-grace" required :error="fieldErrors.grace"><BioNexusNumericInput id="plan-grace" v-model="draft.gracePeriodDays" :decimals="0" :min="0" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
        </div>
        <p class="plan-contract-note">La vigencia se calcula automáticamente en el Backend según la cantidad y la unidad seleccionadas.</p>
      </BioNexusSectionPanel>
      <BioNexusSectionPanel title="Disponibilidad" icon="toggle_on" description="Controla si el plan puede asignarse a nuevas suscripciones." variant="soft" compact><BioNexusCheckbox v-model="draft.isActive" label="Plan activo y disponible para suscripciones" :disabled="saving" @change="syncDirty" /></BioNexusSectionPanel>
    </section>
    <template #footer><BioNexusActionButton variant="secondary" icon="cancel" :disabled="saving" @click="requestClose">Cancelar</BioNexusActionButton><BioNexusActionButton variant="primary" :icon="mode==='create'?'create':'save'" :loading="saving" :disabled="submitDisabled" @click="submit">{{ mode==='create'?'Crear':'Guardar' }}</BioNexusActionButton></template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>
<script setup>
import { computed,nextTick,reactive,ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusCheckbox from '@/components/ui/BioNexusCheckbox.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusSearchableSelect from '@/components/ui/BioNexusSearchableSelect.vue'
import BioNexusNumericInput from '@/components/ui/BioNexusNumericInput.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
const props=defineProps({saving:Boolean,currencyOptions:{type:Array,default:()=>[]}}),emit=defineEmits(['submit']),dialog=ref(null),discardDialog=ref(null),firstInput=ref(null),mode=ref('create'),current=ref(null),errorMessage=ref(''),original=ref(''),dirty=ref(false),attempted=ref(false),fieldErrors=reactive({code:'',name:'',price:'',currency:'',planType:'',intervalUnit:'',intervalCount:'',grace:''}),draft=reactive(blank())
function blank(){return{code:'',name:'',description:'',price:0,currency:'USD',planType:'paid',intervalUnit:'month',intervalCount:1,gracePeriodDays:0,isActive:true}}
const values=computed(()=>({code:draft.code.trim(),name:draft.name.trim(),description:draft.description.trim(),price:Number(draft.price),currency:draft.currency.trim(),planType:draft.planType,intervalUnit:draft.intervalUnit,intervalCount:Number(draft.intervalCount),gracePeriodDays:Number(draft.gracePeriodDays),isActive:Boolean(draft.isActive)}))
const signature=computed(()=>JSON.stringify(values.value)),submitDisabled=computed(()=>props.saving||!dirty.value||!draft.code.trim()||!draft.name.trim()||!draft.currency.trim())
function assign(row){Object.assign(draft,row?{code:row.code||'',name:row.name||'',description:row.description||'',price:Number(row.price)||0,currency:row.currency||'USD',planType:row.planType||'paid',intervalUnit:row.intervalUnit||'month',intervalCount:Number(row.intervalCount)||1,gracePeriodDays:Number(row.gracePeriodDays)||0,isActive:row.isActive!==false}:blank())}
function clearErrors(){Object.keys(fieldErrors).forEach(key=>fieldErrors[key]='');errorMessage.value=''}
async function show(){await dialog.value?.open();await nextTick();original.value=signature.value;dirty.value=false;firstInput.value?.focus()}
async function openCreate(){mode.value='create';current.value=null;assign(null);clearErrors();attempted.value=false;original.value='';await show()}
async function openEdit(row){mode.value='edit';current.value=row;assign(row);clearErrors();attempted.value=false;original.value='';await show()}
function normalizeCurrency(){draft.currency=draft.currency.toUpperCase().replace(/[^A-Z]/g,'').slice(0,3);syncDirty()}
function syncDirty(){clearErrors();dirty.value=signature.value!==original.value}
function validate(){clearErrors();if(!draft.code.trim())fieldErrors.code='El código es obligatorio.';if(!draft.name.trim())fieldErrors.name='El nombre es obligatorio.';if(!Number.isFinite(Number(draft.price))||Number(draft.price)<0)fieldErrors.price='El precio debe ser igual o mayor que cero.';if(!props.currencyOptions.some(option=>option.value===draft.currency))fieldErrors.currency='Selecciona una moneda activa.';if(!['trial','paid'].includes(draft.planType))fieldErrors.planType='Selecciona Trial o Pago.';if(!['day','month','year'].includes(draft.intervalUnit))fieldErrors.intervalUnit='Selecciona una unidad válida.';if(!Number.isSafeInteger(Number(draft.intervalCount))||Number(draft.intervalCount)<=0)fieldErrors.intervalCount='La cantidad debe ser un entero mayor que cero.';if(!Number.isInteger(Number(draft.gracePeriodDays))||Number(draft.gracePeriodDays)<0)fieldErrors.grace='Los días de gracia deben ser un entero igual o mayor que cero.';return !Object.values(fieldErrors).some(Boolean)}
function submit(){attempted.value=true;if(!validate()||submitDisabled.value)return;emit('submit',{mode:mode.value,record:current.value,values:values.value})}
async function requestClose(){if(props.saving)return;if(dirty.value){const ok=await discardDialog.value?.ask({kicker:'Confirmación',title:'Descartar cambios',message:'Hay cambios sin guardar. ¿Deseas salir y descartarlos?',icon:'warning',variant:'danger',confirmIcon:'delete',confirmText:'Sí, salir y descartar cambios',cancelText:'Cancelar'});if(!ok)return}dialog.value?.close()}
function markSavedAndClose(){original.value=signature.value;dirty.value=false;dialog.value?.close()}
function reset(){attempted.value=false;dirty.value=false;original.value='';clearErrors()}
defineExpose({openCreate,openEdit,markSavedAndClose,setError:value=>errorMessage.value=String(value||''),clearError:()=>errorMessage.value=''})
</script>
<style scoped>
.plan-dialog-body{display:grid;gap:var(--bio-nexus-space-4);font-family:var(--bio-nexus-font-family)}.plan-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3)}.wide{grid-column:1/-1}.plan-contract-note{grid-column:1/-1;margin:var(--bio-nexus-space-2) 0 0;color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-sm)}@media(max-width:700px){.plan-fields{grid-template-columns:1fr}.wide{grid-column:auto}}
</style>
