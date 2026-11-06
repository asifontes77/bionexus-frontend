<template>
  <BioNexusDialog ref="dialog" title="Suscripción del laboratorio" :subtitle="laboratoryName" size="wide" :prevent-close="saving || dirty" @before-close="requestClose" @close="reset">
    <section class="platform-subscription-content">
      <BioNexusFormErrors :errors="error" />
      <p v-if="loading" class="platform-dialog-muted" role="status">Cargando suscripción y planes...</p>
      <template v-else>
        <BioNexusSectionPanel v-if="subscription" title="Estado actual" icon="monitoring" description="Resumen del plan, vigencia y estado comercial vigente." variant="soft" compact>
          <div class="platform-subscription-heading">
            <div><p class="platform-subscription-eyebrow">Plan comercial</p><h3>{{ subscription.planName || subscription.planCode || 'Sin plan comercial' }}</h3></div>
            <span class="platform-subscription-status">{{ subscription.status }}</span>
          </div>
          <dl class="platform-subscription-details">
            <div><dt>Código</dt><dd>{{ subscription.planCode || '—' }}</dd></div>
            <div><dt>Precio del plan</dt><dd>{{ subscription.planPrice === null || subscription.planPrice === undefined ? '—' : `${subscription.planPrice} ${subscription.planCurrency || ''}` }}</dd></div>
            <div><dt>Periodicidad</dt><dd>{{ subscription.billingInterval || '—' }}</dd></div>
            <div><dt>Período</dt><dd>{{ formatDate(subscription.startsAt) }} – {{ formatDate(subscription.expiresAt) }}</dd></div>
            <div><dt>Días de gracia del plan</dt><dd>{{ snapshotGraceDays }}</dd></div>
            <div><dt>Fin de gracia</dt><dd>{{ formatDate(subscription.graceUntil) }}</dd></div>
            <div v-if="subscription.planDescription"><dt>Descripción</dt><dd>{{ subscription.planDescription }}</dd></div>
            <div v-if="subscription.statusReason"><dt>Motivo del estado</dt><dd>{{ subscription.statusReason }}</dd></div>
            <div v-if="subscription.suspensionReason"><dt>Motivo de suspensión</dt><dd>{{ subscription.suspensionReason }}</dd></div>
          </dl>
          <pre v-if="subscription.limitsBenefits" class="platform-subscription-benefits">{{ JSON.stringify(subscription.limitsBenefits, null, 2) }}</pre>
        </BioNexusSectionPanel>
        <p v-else class="platform-dialog-muted">Este laboratorio todavía no tiene una suscripción asignada.</p>

        <BioNexusSectionPanel :title="subscription ? 'Asignar plan y período' : 'Asignar primera suscripción'" icon="workspace_premium" description="Define el plan, estado inicial y período comercial del laboratorio." variant="accent">
          <form class="platform-subscription-form" @submit.prevent="saveSubscription">
            <div class="platform-subscription-fields">
              <BioNexusFormField v-if="form.status !== 'perpetual_free'" label="Plan comercial" field-id="platform-subscription-plan" required :error="fieldErrors.planCode">
                <select id="platform-subscription-plan" v-model="form.planCode" class="bio-nexus-field" :disabled="saving || plans.length === 0" required @change="syncDirty"><option value="" disabled>Seleccionar plan activo</option><option v-for="plan in selectablePlans" :key="plan.planId" :value="plan.code">{{ plan.name }} · {{ plan.code }}</option></select>
              </BioNexusFormField>
              <BioNexusFormField label="Estado de suscripción" field-id="platform-subscription-status" required :error="fieldErrors.status">
                <select id="platform-subscription-status" v-model="form.status" class="bio-nexus-field" :disabled="saving" required @change="syncDirty"><option value="" disabled>Seleccionar estado inicial</option><option value="trial">Prueba (trial)</option><option value="active">Activo (active)</option><option value="perpetual_free">Vigencia indefinida (perpetual_free)</option></select>
              </BioNexusFormField>
              <BioNexusFormField label="Inicio del período" field-id="platform-subscription-start" required :error="fieldErrors.startsAt"><input id="platform-subscription-start" v-model="form.startsAt" class="bio-nexus-field" type="date" :disabled="saving" required @change="syncDirty" /></BioNexusFormField>
              <BioNexusFormField v-if="form.status !== 'perpetual_free'" label="Fin del período" field-id="platform-subscription-expiry" required :error="fieldErrors.expiresAt"><input id="platform-subscription-expiry" v-model="form.expiresAt" class="bio-nexus-field" type="date" :disabled="saving" required @change="syncDirty" /></BioNexusFormField>
              <BioNexusFormField v-if="form.status === 'perpetual_free'" class="platform-subscription-wide" label="Motivo de vigencia indefinida" field-id="platform-subscription-free-reason" required :error="fieldErrors.perpetualFreeReason" :help="`${form.perpetualFreeReason.length} de 500 caracteres`"><textarea id="platform-subscription-free-reason" v-model.trim="form.perpetualFreeReason" class="bio-nexus-field" rows="3" maxlength="500" :disabled="saving" required @input="syncDirty" /></BioNexusFormField>
            </div>
            <div class="platform-subscription-actions"><BioNexusActionButton type="submit" label="Guardar suscripción" icon="save" variant="primary" :loading="saving" :disabled="form.status !== 'perpetual_free' && plans.length === 0" /></div>
          </form>
        </BioNexusSectionPanel>

        <BioNexusSectionPanel v-if="subscription" title="Estado operativo" icon="sync_alt" description="Actualiza el estado comercial y registra el motivo cuando sea obligatorio." variant="soft" compact>
          <form class="platform-subscription-form" @submit.prevent="saveStatus">
            <div class="platform-subscription-fields">
              <BioNexusFormField label="Nuevo estado" field-id="platform-subscription-next-status" required :error="statusErrors.status"><select id="platform-subscription-next-status" v-model="statusForm.status" class="bio-nexus-field" :disabled="saving" required @change="syncDirty"><option value="" disabled>Seleccionar estado</option><option v-for="status in operationalStatuses" :key="status" :value="status">{{ status }}</option></select></BioNexusFormField>
              <BioNexusFormField v-if="['suspended', 'cancelled'].includes(statusForm.status)" label="Motivo" field-id="platform-subscription-status-reason" required :error="statusErrors.reason" :help="`${statusForm.reason.length} de 500 caracteres`"><textarea id="platform-subscription-status-reason" v-model.trim="statusForm.reason" class="bio-nexus-field" rows="2" maxlength="500" :disabled="saving" required @input="syncDirty" /></BioNexusFormField>
            </div>
            <div class="platform-subscription-actions"><BioNexusActionButton type="submit" label="Actualizar estado" icon="sync" variant="secondary" :loading="saving" /></div>
          </form>
        </BioNexusSectionPanel>
        <p v-if="plans.length === 0" class="platform-dialog-muted">No hay planes activos disponibles. Crea o activa un plan antes de asignar una suscripción.</p>
      </template>
    </section>
    <template #footer><BioNexusActionButton label="Cerrar" icon="close" variant="secondary" :disabled="saving" @click="requestClose" /></template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>
<script setup>
import { computed,reactive,ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
import { createPlatformLaboratorySubscription,getPlatformLaboratorySubscription,getPlatformPlans,updatePlatformLaboratorySubscriptionStatus } from '@/services/platformBillingService'
const emit=defineEmits(['updated']),dialog=ref(null),discardDialog=ref(null),laboratoryId=ref(''),laboratoryName=ref(''),plans=ref([]),subscription=ref(null),loading=ref(false),saving=ref(false),error=ref(''),original=ref(''),dirty=ref(false),form=reactive({planCode:'',status:'',startsAt:todayLocal(),expiresAt:'',perpetualFreeReason:''}),statusForm=reactive({status:'',reason:''}),fieldErrors=reactive({planCode:'',status:'',startsAt:'',expiresAt:'',perpetualFreeReason:''}),statusErrors=reactive({status:'',reason:''})
const operationalStatuses=['trial','active','grace','suspended','cancelled'],selectablePlans=computed(()=>plans.value.filter(plan=>plan.isActive!==false)),snapshotGraceDays=computed(()=>Number.isInteger(subscription.value?.gracePeriodDays)?`${subscription.value.gracePeriodDays} días`:'—'),signature=computed(()=>JSON.stringify({form:{...form},statusForm:{...statusForm}}))
function todayLocal(){const date=new Date();return`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}function dateInput(value){if(!value)return'';const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toISOString().slice(0,10)}function toUtcDate(value){return value?new Date(`${value}T00:00:00.000Z`).toISOString():null}function formatDate(value){if(!value)return'—';const date=new Date(value);return Number.isNaN(date.getTime())?String(value):date.toLocaleDateString('es')}
function clearErrors(){error.value='';Object.keys(fieldErrors).forEach(key=>fieldErrors[key]='');Object.keys(statusErrors).forEach(key=>statusErrors[key]='')}function syncDirty(){clearErrors();dirty.value=signature.value!==original.value}
async function load(){loading.value=true;clearErrors();try{const[availablePlans,currentSubscription]=await Promise.all([getPlatformPlans(),getPlatformLaboratorySubscription(laboratoryId.value)]);plans.value=availablePlans;subscription.value=currentSubscription;const current=subscription.value;Object.assign(form,{planCode:current?.planCode||'',status:['trial','active','perpetual_free'].includes(current?.status)?current.status:'',startsAt:dateInput(current?.startsAt)||todayLocal(),expiresAt:dateInput(current?.expiresAt),perpetualFreeReason:current?.perpetualFreeReason||''});Object.assign(statusForm,{status:'',reason:''});original.value=signature.value;dirty.value=false}catch(cause){plans.value=[];subscription.value=null;error.value=cause?.message||'No fue posible consultar la suscripción.'}finally{loading.value=false}}
async function open(laboratory){laboratoryId.value=String(laboratory.id);laboratoryName.value=laboratory.name||'';await dialog.value?.open();await load()}
function validateSubscription(){clearErrors();if(!['trial','active','perpetual_free'].includes(form.status))fieldErrors.status='Selecciona un estado inicial válido.';if(form.status!=='perpetual_free'&&!form.planCode)fieldErrors.planCode='Selecciona un plan comercial.';if(!form.startsAt)fieldErrors.startsAt='Indica el inicio del período.';if(form.status!=='perpetual_free'&&!form.expiresAt)fieldErrors.expiresAt='Indica el fin del período.';if(form.status!=='perpetual_free'&&form.startsAt&&form.expiresAt<form.startsAt)fieldErrors.expiresAt='El fin del período no puede ser anterior a su inicio.';if(form.status==='perpetual_free'&&!form.perpetualFreeReason.trim())fieldErrors.perpetualFreeReason='Indica el motivo de la vigencia indefinida.';return!Object.values(fieldErrors).some(Boolean)}
async function saveSubscription(){if(saving.value||!validateSubscription())return;const payload={status:form.status,startsAt:toUtcDate(form.startsAt),...(form.status!=='perpetual_free'?{planCode:form.planCode,expiresAt:toUtcDate(form.expiresAt)}:{}),...(form.status==='perpetual_free'?{perpetualFreeReason:form.perpetualFreeReason.trim()}: {})};saving.value=true;try{await createPlatformLaboratorySubscription(laboratoryId.value,payload);await load();emit('updated',laboratoryId.value)}catch(cause){error.value=cause?.message||'No fue posible guardar la suscripción.'}finally{saving.value=false}}
function validateStatus(){clearErrors();if(!operationalStatuses.includes(statusForm.status))statusErrors.status='Selecciona un estado operativo válido.';if(['suspended','cancelled'].includes(statusForm.status)&&!statusForm.reason.trim())statusErrors.reason='El motivo es obligatorio para suspender o cancelar la suscripción.';return!Object.values(statusErrors).some(Boolean)}
async function saveStatus(){if(saving.value||!subscription.value||!validateStatus())return;const payload={status:statusForm.status,...(statusForm.reason.trim()?{reason:statusForm.reason.trim()}: {})};saving.value=true;try{await updatePlatformLaboratorySubscriptionStatus(laboratoryId.value,payload);await load();emit('updated',laboratoryId.value)}catch(cause){error.value=cause?.message||'No fue posible cambiar el estado de la suscripción.'}finally{saving.value=false}}
async function requestClose(){if(saving.value)return;if(dirty.value){const confirmed=await discardDialog.value?.ask({kicker:'Confirmación',title:'Descartar cambios',message:'Hay cambios sin guardar. ¿Deseas salir y descartarlos?',icon:'warning',variant:'danger',confirmIcon:'delete',confirmText:'Sí, salir y descartar cambios',cancelText:'Cancelar'});if(!confirmed)return}dialog.value?.close()}
function reset(){laboratoryId.value='';laboratoryName.value='';plans.value=[];subscription.value=null;Object.assign(form,{planCode:'',status:'',startsAt:todayLocal(),expiresAt:'',perpetualFreeReason:''});Object.assign(statusForm,{status:'',reason:''});original.value='';dirty.value=false;clearErrors()}defineExpose({open})
</script>
<style scoped>
.platform-subscription-content{display:grid;gap:var(--bio-nexus-space-4);padding:var(--bio-nexus-space-4);font-family:var(--bio-nexus-font-family)}.platform-dialog-muted{margin:0;color:var(--bio-nexus-color-text-muted)}.platform-subscription-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--bio-nexus-space-3)}.platform-subscription-heading h3{margin:0;color:var(--bio-nexus-color-text);font-size:var(--bio-nexus-font-size-lg)}.platform-subscription-eyebrow{margin:0 0 var(--bio-nexus-space-1);color:var(--bio-nexus-color-primary-strong);font-size:var(--bio-nexus-font-size-sm);font-weight:var(--bio-nexus-font-weight-bold);letter-spacing:.08em;text-transform:uppercase}.platform-subscription-status{padding:5px 9px;border-radius:999px;color:var(--bio-nexus-color-primary-strong);background:var(--bio-nexus-color-surface-soft);font-size:var(--bio-nexus-font-size-sm);font-weight:var(--bio-nexus-font-weight-bold)}.platform-subscription-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3);margin:var(--bio-nexus-space-3) 0 0}.platform-subscription-details div{display:grid;gap:3px}.platform-subscription-details dt{color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-sm)}.platform-subscription-details dd{margin:0;color:var(--bio-nexus-color-text);font-size:var(--bio-nexus-font-size-md);font-weight:var(--bio-nexus-font-weight-medium);overflow-wrap:anywhere}.platform-subscription-benefits{max-height:180px;margin:var(--bio-nexus-space-3) 0 0;padding:var(--bio-nexus-space-3);overflow:auto;border-radius:var(--bio-nexus-radius-md);color:var(--bio-nexus-color-text-muted-strong);background:var(--bio-nexus-color-surface-muted);font-size:var(--bio-nexus-font-size-sm);white-space:pre-wrap;overflow-wrap:anywhere}.platform-subscription-form{display:grid;gap:var(--bio-nexus-space-3)}.platform-subscription-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3);align-items:start}.platform-subscription-wide{grid-column:1/-1}.platform-subscription-actions{display:flex;justify-content:flex-end}@media(max-width:620px){.platform-subscription-details,.platform-subscription-fields{grid-template-columns:1fr}.platform-subscription-wide{grid-column:auto}.platform-subscription-heading{flex-direction:column}}
</style>
