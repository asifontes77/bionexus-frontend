<template>
  <BioNexusDialog ref="dialog" size="wide" :prevent-close="saving || dirty" :kicker="mode==='create'?'Nuevo registro':'Editar registro'" :title="mode==='create'?'Crear plan comercial':'Editar plan comercial'" @before-close="requestClose" @close="reset">
    <section class="plan-dialog-body">
      <BioNexusFormErrors :errors="errorMessage" />
      <BioNexusSectionPanel title="Información comercial" icon="workspace_premium" description="Define la identificación, el precio y la periodicidad del plan." variant="accent">
        <div class="plan-fields">
          <BioNexusFormField label="Código" field-id="plan-code" required :error="fieldErrors.code" :help="`${draft.code.length} de 80 caracteres`"><input id="plan-code" ref="firstInput" v-model.trim="draft.code" class="bio-nexus-field" maxlength="80" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
          <BioNexusFormField label="Nombre" field-id="plan-name" required :error="fieldErrors.name" :help="`${draft.name.length} de 120 caracteres`"><input id="plan-name" v-model.trim="draft.name" class="bio-nexus-field" maxlength="120" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
          <BioNexusFormField class="wide" label="Descripción" field-id="plan-description" :help="`${draft.description.length} de 1000 caracteres`"><textarea id="plan-description" v-model.trim="draft.description" class="bio-nexus-field" rows="3" maxlength="1000" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
          <BioNexusFormField label="Precio" field-id="plan-price" required :error="fieldErrors.price"><BioNexusNumericInput id="plan-price" v-model="draft.price" :decimals="2" :min="0" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
          <BioNexusFormField label="Moneda" field-id="plan-currency" required :error="fieldErrors.currency" :help="`${draft.currency.length} de 3 caracteres`"><input id="plan-currency" v-model.trim="draft.currency" class="bio-nexus-field" maxlength="3" placeholder="USD" :disabled="saving" @input="normalizeCurrency" /></BioNexusFormField>
          <BioNexusFormField label="Periodicidad" field-id="plan-interval" required><select id="plan-interval" v-model="draft.billingInterval" class="bio-nexus-field" :disabled="saving" @change="syncDirty"><option value="monthly">Mensual</option><option value="yearly">Anual</option></select></BioNexusFormField>
          <BioNexusFormField label="Días de gracia" field-id="plan-grace" required :error="fieldErrors.grace"><BioNexusNumericInput id="plan-grace" v-model="draft.gracePeriodDays" :decimals="0" :min="0" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
        </div>
      </BioNexusSectionPanel>
      <BioNexusSectionPanel title="Límites y beneficios" icon="tune" description="Conserva la configuración adicional del plan como un objeto JSON válido." variant="accent" compact><BioNexusFormField label="Configuración JSON" field-id="plan-benefits" :error="fieldErrors.benefits"><textarea id="plan-benefits" v-model="limitsBenefitsText" class="bio-nexus-field plan-json" rows="7" spellcheck="false" :disabled="saving" @input="syncDirty" /></BioNexusFormField></BioNexusSectionPanel>
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
import BioNexusNumericInput from '@/components/ui/BioNexusNumericInput.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
const props=defineProps({saving:Boolean}),emit=defineEmits(['submit']),dialog=ref(null),discardDialog=ref(null),firstInput=ref(null),mode=ref('create'),current=ref(null),errorMessage=ref(''),original=ref(''),dirty=ref(false),attempted=ref(false),limitsBenefitsText=ref('{}'),fieldErrors=reactive({code:'',name:'',price:'',currency:'',grace:'',benefits:''}),draft=reactive(blank())
function blank(){return{code:'',name:'',description:'',price:0,currency:'USD',billingInterval:'monthly',gracePeriodDays:0,isActive:true}}
const values=computed(()=>({code:draft.code.trim(),name:draft.name.trim(),description:draft.description.trim(),price:Number(draft.price),currency:draft.currency.trim(),billingInterval:draft.billingInterval,gracePeriodDays:Number(draft.gracePeriodDays),limitsBenefits:parseBenefits(false),isActive:Boolean(draft.isActive)}))
const signature=computed(()=>JSON.stringify({...values.value,limitsBenefitsText:limitsBenefitsText.value})),submitDisabled=computed(()=>props.saving||!dirty.value||!draft.code.trim()||!draft.name.trim()||!draft.currency.trim())
function assign(row){Object.assign(draft,row?{code:row.code||'',name:row.name||'',description:row.description||'',price:Number(row.price)||0,currency:row.currency||'USD',billingInterval:row.billingInterval||'monthly',gracePeriodDays:Number(row.gracePeriodDays)||0,isActive:row.isActive!==false}:blank());limitsBenefitsText.value=JSON.stringify(row?.limitsBenefits??{},null,2)}
function clearErrors(){Object.keys(fieldErrors).forEach(key=>fieldErrors[key]='');errorMessage.value=''}
async function show(){await dialog.value?.open();await nextTick();original.value=signature.value;dirty.value=false;firstInput.value?.focus()}
async function openCreate(){mode.value='create';current.value=null;assign(null);clearErrors();attempted.value=false;original.value='';await show()}
async function openEdit(row){mode.value='edit';current.value=row;assign(row);clearErrors();attempted.value=false;original.value='';await show()}
function normalizeCurrency(){draft.currency=draft.currency.toUpperCase().replace(/[^A-Z]/g,'').slice(0,3);syncDirty()}
function syncDirty(){clearErrors();dirty.value=signature.value!==original.value}
function parseBenefits(report=true){try{const value=JSON.parse(limitsBenefitsText.value);if(value===null||Array.isArray(value)||typeof value!=='object')throw new Error();return value}catch{if(report)fieldErrors.benefits='Límites y beneficios debe ser un objeto JSON válido.';return{}}}
function validate(){clearErrors();if(!draft.code.trim())fieldErrors.code='El código es obligatorio.';if(!draft.name.trim())fieldErrors.name='El nombre es obligatorio.';if(!Number.isFinite(Number(draft.price))||Number(draft.price)<0)fieldErrors.price='El precio debe ser igual o mayor que cero.';if(!/^[A-Z]{3}$/.test(draft.currency))fieldErrors.currency='La moneda debe tener exactamente tres letras mayúsculas.';if(!Number.isInteger(Number(draft.gracePeriodDays))||Number(draft.gracePeriodDays)<0)fieldErrors.grace='Los días de gracia deben ser un entero igual o mayor que cero.';parseBenefits(true);return !Object.values(fieldErrors).some(Boolean)}
function submit(){attempted.value=true;if(!validate()||submitDisabled.value)return;emit('submit',{mode:mode.value,record:current.value,values:values.value})}
async function requestClose(){if(props.saving)return;if(dirty.value){const ok=await discardDialog.value?.ask({kicker:'Confirmación',title:'Descartar cambios',message:'Hay cambios sin guardar. ¿Deseas salir y descartarlos?',icon:'warning',variant:'danger',confirmIcon:'delete',confirmText:'Sí, salir y descartar cambios',cancelText:'Cancelar'});if(!ok)return}dialog.value?.close()}
function markSavedAndClose(){original.value=signature.value;dirty.value=false;dialog.value?.close()}
function reset(){attempted.value=false;dirty.value=false;original.value='';clearErrors()}
defineExpose({openCreate,openEdit,markSavedAndClose,setError:value=>errorMessage.value=String(value||''),clearError:()=>errorMessage.value=''})
</script>
<style scoped>
.plan-dialog-body{display:grid;gap:var(--bio-nexus-space-4);font-family:var(--bio-nexus-font-family)}.plan-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3)}.wide{grid-column:1/-1}.plan-json{font-family:ui-monospace,Consolas,monospace;font-size:var(--bio-nexus-font-size-sm)}@media(max-width:700px){.plan-fields{grid-template-columns:1fr}.wide{grid-column:auto}}
</style>
