<template>
  <BioNexusDialog ref="dialog" :title="editing ? 'Editar laboratorio' : 'Configuración del laboratorio'" :subtitle="laboratory?.name || ''" size="wide" :prevent-close="saving || dirty" @before-close="requestClose" @close="reset">
    <section class="platform-dialog-content">
      <BioNexusFormErrors :errors="error" />
      <p v-if="loading" class="platform-dialog-muted" role="status">Cargando configuración...</p>
      <template v-else-if="laboratory">
        <BioNexusSectionPanel title="Accesos" icon="link" description="Direcciones disponibles para ingresar al laboratorio." variant="soft" compact>
          <div class="platform-access"><p><strong>Desarrollo</strong><a :href="accessUrls.development" target="_blank" rel="noopener noreferrer">{{ accessUrls.development }}</a></p><p><strong>Canónico</strong><a :href="accessUrls.canonical" target="_blank" rel="noopener noreferrer">{{ accessUrls.canonical }}</a></p></div>
        </BioNexusSectionPanel>
        <BioNexusSectionPanel title="Identificación y contacto" icon="domain" description="Información general y medios de contacto del laboratorio." variant="accent">
          <div class="platform-detail-grid">
            <BioNexusFormField label="Modo de servicio" field-id="platform-lab-mode"><input id="platform-lab-mode" class="bio-nexus-field" :value="laboratory.service_mode || '—'" disabled /></BioNexusFormField>
            <BioNexusFormField label="RIF" field-id="platform-lab-rif" :help="editing ? `${form.rif.length} de 20 caracteres` : ''"><input id="platform-lab-rif" v-model.trim="form.rif" class="bio-nexus-field" :disabled="!editing" maxlength="20" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Nombre" field-id="platform-lab-name" required :error="fieldErrors.name" :help="editing && !fieldErrors.name ? `${form.name.length} de 50 caracteres` : ''"><input id="platform-lab-name" v-model.trim="form.name" class="bio-nexus-field" :disabled="!editing" maxlength="50" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Razón social" field-id="platform-lab-business-name" :help="editing ? `${form.business_name.length} de 100 caracteres` : ''"><input id="platform-lab-business-name" v-model.trim="form.business_name" class="bio-nexus-field" :disabled="!editing" maxlength="100" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Dirección" field-id="platform-lab-address" :help="editing ? `${form.address.length} de 200 caracteres` : ''"><input id="platform-lab-address" v-model.trim="form.address" class="bio-nexus-field" :disabled="!editing" maxlength="200" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Teléfono" field-id="platform-lab-phone" :help="editing ? `${form.phone_1.length} de 20 caracteres` : ''"><input id="platform-lab-phone" v-model.trim="form.phone_1" class="bio-nexus-field" :disabled="!editing" maxlength="20" placeholder="(+58) 424 123-4567" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Correo" field-id="platform-lab-email" :help="editing ? `${form.email.length} de 100 caracteres` : ''"><input id="platform-lab-email" v-model.trim="form.email" class="bio-nexus-field" :disabled="!editing" maxlength="100" @input="syncDirty" /></BioNexusFormField>
            <BioNexusCheckbox v-model="form.is_active" class="platform-active-toggle" label="Laboratorio activo" :disabled="!editing" @change="syncDirty" />
            <BioNexusFormField v-if="editing" class="platform-notes-field" label="Notas comerciales" field-id="platform-lab-commercial-notes" :help="`${form.commercial_notes.length} de 2000 caracteres`"><textarea id="platform-lab-commercial-notes" v-model.trim="form.commercial_notes" class="bio-nexus-field" rows="3" maxlength="2000" @input="syncDirty" /></BioNexusFormField>
            <p v-else-if="laboratory.commercial_notes" class="platform-notes">{{ laboratory.commercial_notes }}</p>
          </div>
        </BioNexusSectionPanel>
        <BioNexusSectionPanel title="Suscripción" icon="workspace_premium" description="Información comercial administrada por el flujo de suscripción." variant="soft" compact>
          <div class="platform-detail-grid">
            <BioNexusFormField label="Código de plan comercial" field-id="platform-lab-plan"><input id="platform-lab-plan" class="bio-nexus-field" :value="form.plan_code || '—'" disabled /></BioNexusFormField>
            <BioNexusFormField label="Estado de suscripción" field-id="platform-lab-subscription-status"><input id="platform-lab-subscription-status" class="bio-nexus-field" :value="form.subscription_status || '—'" disabled /></BioNexusFormField>
            <BioNexusFormField label="Fecha de registro / inicio" field-id="platform-lab-service-start"><input id="platform-lab-service-start" class="bio-nexus-field" :value="form.service_starts_at || '—'" disabled /></BioNexusFormField>
            <BioNexusFormField v-if="form.subscription_status !== 'perpetual_free'" label="Fecha de expiración" field-id="platform-lab-service-expiry"><input id="platform-lab-service-expiry" class="bio-nexus-field" :value="form.service_expires_at || '—'" disabled /></BioNexusFormField>
            <BioNexusFormField v-if="form.subscription_status !== 'perpetual_free' && laboratory.grace_until" label="Fin del período de gracia" field-id="platform-lab-grace-until"><input id="platform-lab-grace-until" class="bio-nexus-field" :value="form.grace_until" disabled /></BioNexusFormField>
            <BioNexusFormField v-if="form.subscription_status === 'perpetual_free'" class="platform-notes-field" label="Motivo de vigencia indefinida" field-id="platform-lab-perpetual-reason"><textarea id="platform-lab-perpetual-reason" class="bio-nexus-field" :value="form.perpetual_free_reason" rows="3" disabled /></BioNexusFormField>
            <BioNexusFormField v-if="!editing && laboratory.perpetual_free_granted_at" label="Concedida por / fecha" field-id="platform-lab-perpetual-audit"><input id="platform-lab-perpetual-audit" class="bio-nexus-field" :value="`${laboratory.perpetual_free_granted_by || '—'} / ${formatDate(laboratory.perpetual_free_granted_at)}`" disabled /></BioNexusFormField>
          </div>
        </BioNexusSectionPanel>
      </template>
    </section>
    <template #footer><BioNexusActionButton label="Cerrar" icon="close" variant="secondary" :disabled="saving" @click="requestClose" /><BioNexusActionButton v-if="!editing && laboratory" label="Editar" icon="edit" variant="primary" @click="startEditing" /><BioNexusActionButton v-else-if="editing" label="Guardar cambios" icon="save" variant="primary" :loading="saving" :disabled="!dirty" @click="save" /></template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>
<script setup>
import { computed,reactive,ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusCheckbox from '@/components/ui/BioNexusCheckbox.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
import { buildTenantAccessUrls } from '@/logic/tenantAccess'
import { getPlatformLaboratory,updatePlatformLaboratory } from '@/services/platformService'
const emit=defineEmits(['updated']),dialog=ref(null),discardDialog=ref(null),loading=ref(false),saving=ref(false),editing=ref(false),error=ref(''),laboratory=ref(null),original=ref(''),dirty=ref(false),fieldErrors=reactive({name:''}),form=reactive({})
const accessUrls=computed(()=>buildTenantAccessUrls(laboratory.value?.access?.slug||laboratory.value?.laboratory?.access_slug||laboratory.value?.access_slug)),signature=computed(()=>JSON.stringify({rif:form.rif||'',name:form.name||'',business_name:form.business_name||'',address:form.address||'',phone_1:form.phone_1||'',email:form.email||'',is_active:Boolean(form.is_active),commercial_notes:form.commercial_notes||''}))
function dateInput(value){if(!value)return'';const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toISOString().slice(0,10)}function formatDate(value){if(!value)return'—';const date=new Date(value);return Number.isNaN(date.getTime())?String(value):date.toLocaleString('es')}
function normalizeDetail(result){const data=result?.laboratory||result;laboratory.value={...data,access:result?.access||data?.access};Object.assign(form,{rif:data?.rif||'',name:data?.name||'',business_name:data?.business_name||data?.businessName||'',address:data?.address||'',phone_1:data?.phone_1||data?.phone||'',email:data?.email||'',plan_code:data?.plan_code||'',subscription_status:data?.subscription_status||'',service_starts_at:dateInput(data?.service_starts_at),service_expires_at:dateInput(data?.service_expires_at),grace_until:data?.subscription_status==='perpetual_free'?'':dateInput(data?.grace_until),perpetual_free_reason:data?.perpetual_free_reason||'',commercial_notes:data?.commercial_notes||'',is_active:data?.is_active===true});original.value=signature.value;dirty.value=false}
async function open(laboratoryId,startEditing=false){error.value='';editing.value=startEditing;laboratory.value=null;loading.value=true;await dialog.value?.open();try{normalizeDetail(await getPlatformLaboratory(laboratoryId))}catch(cause){error.value=cause?.message||'No fue posible consultar el laboratorio.'}finally{loading.value=false}}
function startEditing(){editing.value=true;original.value=signature.value;dirty.value=false}function syncDirty(){fieldErrors.name='';error.value='';dirty.value=signature.value!==original.value}
async function save(){if(saving.value||!laboratory.value)return;error.value='';fieldErrors.name='';if(!form.name.trim()){fieldErrors.name='El nombre del laboratorio es obligatorio.';return}saving.value=true;try{const updated=await updatePlatformLaboratory(laboratory.value.id,{rif:form.rif,name:form.name,business_name:form.business_name,address:form.address,phone_1:form.phone_1,email:form.email,is_active:form.is_active,commercial_notes:form.commercial_notes});normalizeDetail({...updated,access:laboratory.value.access});editing.value=false;emit('updated',laboratory.value)}catch(cause){error.value=cause?.message||'No fue posible guardar los cambios.'}finally{saving.value=false}}
async function requestClose(){if(saving.value)return;if(dirty.value){const confirmed=await discardDialog.value?.ask({kicker:'Confirmación',title:'Descartar cambios',message:'Hay cambios sin guardar. ¿Deseas salir y descartarlos?',icon:'warning',variant:'danger',confirmIcon:'delete',confirmText:'Sí, salir y descartar cambios',cancelText:'Cancelar'});if(!confirmed)return}dialog.value?.close()}
function reset(){error.value='';editing.value=false;laboratory.value=null;original.value='';dirty.value=false;fieldErrors.name='';Object.keys(form).forEach(key=>delete form[key])}defineExpose({open})
</script>
<style scoped>
.platform-dialog-content{display:grid;gap:var(--bio-nexus-space-4);padding:var(--bio-nexus-space-4);font-family:var(--bio-nexus-font-family)}.platform-dialog-muted{margin:0;color:var(--bio-nexus-color-text-muted)}.platform-access{display:grid;gap:var(--bio-nexus-space-2)}.platform-access p{display:grid;grid-template-columns:100px minmax(0,1fr);gap:var(--bio-nexus-space-2);margin:0;overflow-wrap:anywhere}.platform-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3);align-items:start}.platform-active-toggle,.platform-notes-field,.platform-notes{grid-column:1/-1}.platform-notes{margin:0;color:var(--bio-nexus-color-text-muted);white-space:pre-wrap}@media(max-width:720px){.platform-detail-grid{grid-template-columns:1fr}.platform-access p{grid-template-columns:1fr}}
</style>
