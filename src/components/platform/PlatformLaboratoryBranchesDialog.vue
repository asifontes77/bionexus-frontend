<template>
  <BioNexusDialog ref="dialog" title="Sucursales" :subtitle="laboratoryName" size="wide" :prevent-close="saving || dirty" @before-close="requestClose" @close="reset">
    <section class="platform-branches-content">
      <BioNexusFormErrors :errors="error" />
      <p v-if="loading" class="platform-dialog-muted" role="status">Cargando sucursales...</p>
      <template v-else>
        <BioNexusSectionPanel title="Agregar sucursal" icon="add_business" description="Registra una sucursal adicional para el laboratorio." variant="accent">
          <form class="platform-branch-form" @submit.prevent="addBranch">
            <BioNexusFormField label="Código" field-id="platform-branch-code" required :error="fieldErrors.code" :help="!fieldErrors.code ? `${form.code.length} de 30 caracteres` : ''"><input id="platform-branch-code" v-model.trim="form.code" class="bio-nexus-field" maxlength="30" required :disabled="saving" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Nombre" field-id="platform-branch-name" required :error="fieldErrors.name" :help="!fieldErrors.name ? `${form.name.length} de 100 caracteres` : ''"><input id="platform-branch-name" v-model.trim="form.name" class="bio-nexus-field" maxlength="100" required :disabled="saving" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Dirección" field-id="platform-branch-address" :help="`${form.address.length} de 200 caracteres`"><input id="platform-branch-address" v-model.trim="form.address" class="bio-nexus-field" maxlength="200" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Teléfono" field-id="platform-branch-phone" :help="`${form.phone.length} de 30 caracteres`"><input id="platform-branch-phone" v-model.trim="form.phone" class="bio-nexus-field" maxlength="30" placeholder="(+58) 424 123-4567" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Correo" field-id="platform-branch-email" :error="fieldErrors.email" :help="!fieldErrors.email ? `${form.email.length} de 120 caracteres` : ''"><input id="platform-branch-email" v-model.trim="form.email" class="bio-nexus-field" type="email" maxlength="120" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
            <BioNexusFormField label="Orden de visualización" field-id="platform-branch-order"><BioNexusNumericInput id="platform-branch-order" v-model="form.displayOrder" :decimals="0" :min="0" :disabled="saving" @input="syncDirty" /></BioNexusFormField>
            <div class="platform-branch-actions"><BioNexusActionButton label="Agregar sucursal" icon="add" variant="primary" type="submit" :disabled="saving || !dirty" :loading="savingAction === 'add'" /></div>
          </form>
        </BioNexusSectionPanel>

        <BioNexusSectionPanel title="Sucursales registradas" icon="account_tree" description="La sucursal principal permanece protegida; las demás pueden retirarse si no tienen registros asociados." variant="soft" compact>
          <ul v-if="branches.length" class="platform-branch-list">
            <li v-for="branch in branches" :key="branch.id">
              <span><strong>{{ branch.name || branch.code }}</strong><small>{{ branch.code }}{{ isMain(branch) ? ' · Principal' : '' }}</small></span>
              <BioNexusActionButton v-if="!isMain(branch)" :label="`Quitar sucursal ${branch.name || branch.code}`" icon="delete" variant="danger" size="sm" :disabled="saving" @click="confirmRemove(branch)" />
            </li>
          </ul>
          <p v-else class="platform-dialog-muted">No hay sucursales registradas.</p>
        </BioNexusSectionPanel>
      </template>
    </section>
    <template #footer><BioNexusActionButton label="Cerrar" icon="close" variant="secondary" :disabled="saving" @click="requestClose" /></template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="confirmDialog" />
</template>
<script setup>
import { computed,reactive,ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusNumericInput from '@/components/ui/BioNexusNumericInput.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
import { createPlatformLaboratoryBranch,getPlatformLaboratoryBranches,removePlatformLaboratoryBranch } from '@/services/platformService'
const emit=defineEmits(['changed']),dialog=ref(null),confirmDialog=ref(null),laboratoryId=ref(null),laboratoryName=ref(''),branches=ref([]),loading=ref(false),saving=ref(false),savingAction=ref(''),error=ref(''),original=ref(''),fieldErrors=reactive({code:'',name:'',email:''}),emptyForm=()=>({code:'',name:'',address:'',phone:'',email:'',displayOrder:0}),form=reactive(emptyForm())
const signature=computed(()=>JSON.stringify({code:form.code,name:form.name,address:form.address,phone:form.phone,email:form.email,displayOrder:Number(form.displayOrder)||0})),dirty=computed(()=>signature.value!==original.value)
function isMain(branch){return branch.isMain===true||branch.is_main===true}
function clearErrors(){error.value='';Object.keys(fieldErrors).forEach(key=>fieldErrors[key]='')}function syncDirty(){clearErrors()}
async function load(){loading.value=true;error.value='';try{const result=await getPlatformLaboratoryBranches(laboratoryId.value);branches.value=Array.isArray(result)?result:Array.isArray(result?.branches)?result.branches:[]}catch(cause){error.value=cause?.message||'No fue posible consultar las sucursales.'}finally{loading.value=false}}
async function open(laboratory){laboratoryId.value=laboratory.id;laboratoryName.value=laboratory.name||'';Object.assign(form,emptyForm());clearErrors();original.value=signature.value;await dialog.value?.open();await load()}
function validate(){clearErrors();if(!form.code.trim())fieldErrors.code='El código es obligatorio.';if(!form.name.trim())fieldErrors.name='El nombre es obligatorio.';if(form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))fieldErrors.email='Ingresa un correo válido.';return!Object.values(fieldErrors).some(Boolean)}
async function addBranch(){if(saving.value||!dirty.value||!validate())return;saving.value=true;savingAction.value='add';try{await createPlatformLaboratoryBranch(laboratoryId.value,{code:form.code,name:form.name,address:form.address||undefined,phone:form.phone||undefined,email:form.email||undefined,displayOrder:Number.isFinite(Number(form.displayOrder))?Number(form.displayOrder):0});Object.assign(form,emptyForm());original.value=signature.value;await load();emit('changed')}catch(cause){error.value=cause?.message||'No fue posible agregar la sucursal.'}finally{saving.value=false;savingAction.value=''}}
async function confirmRemove(branch){if(isMain(branch))return;const confirmed=await confirmDialog.value?.ask({kicker:'Confirmación',title:'Quitar sucursal',message:`¿Deseas quitar la sucursal ${branch.name||branch.code}?`,detail:'No se puede quitar la sucursal principal ni una sucursal con registros asociados.',confirmText:'Quitar sucursal',confirmIcon:'delete',cancelText:'Cancelar',variant:'danger'});if(!confirmed||saving.value)return;saving.value=true;error.value='';try{await removePlatformLaboratoryBranch(laboratoryId.value,branch.id);await load();emit('changed')}catch(cause){error.value=cause?.message||'No fue posible quitar la sucursal.'}finally{saving.value=false}}
async function requestClose(){if(saving.value)return;if(dirty.value){const confirmed=await confirmDialog.value?.ask({kicker:'Confirmación',title:'Descartar sucursal',message:'Hay datos de una sucursal sin guardar. ¿Deseas salir y descartarlos?',icon:'warning',variant:'danger',confirmIcon:'delete',confirmText:'Sí, salir y descartar',cancelText:'Cancelar'});if(!confirmed)return}dialog.value?.close()}
function reset(){laboratoryId.value=null;laboratoryName.value='';branches.value=[];Object.assign(form,emptyForm());original.value='';clearErrors()}defineExpose({open})
</script>
<style scoped>
.platform-branches-content{display:grid;gap:var(--bio-nexus-space-4);padding:var(--bio-nexus-space-4);font-family:var(--bio-nexus-font-family)}.platform-dialog-muted{margin:0;color:var(--bio-nexus-color-text-muted)}.platform-branch-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--bio-nexus-space-3);align-items:start}.platform-branch-actions{display:flex;grid-column:1/-1;justify-content:flex-end}.platform-branch-list{display:grid;gap:var(--bio-nexus-space-2);margin:0;padding:0;list-style:none}.platform-branch-list li{display:flex;align-items:center;justify-content:space-between;gap:var(--bio-nexus-space-3);padding:var(--bio-nexus-space-3);border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface)}.platform-branch-list li span{display:grid;gap:3px;min-width:0}.platform-branch-list strong{color:var(--bio-nexus-color-text);font-size:var(--bio-nexus-font-size-md)}.platform-branch-list small{color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-sm)}@media(max-width:620px){.platform-branch-form{grid-template-columns:1fr}.platform-branch-actions{grid-column:auto}.platform-branch-list li{align-items:flex-start;flex-direction:column}}
</style>
