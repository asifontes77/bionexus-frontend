<template>
  <BioNexusDialog ref="dialog" title="Eliminar laboratorio" :subtitle="laboratoryName" size="compact" :prevent-close="saving || dirty" @before-close="requestClose" @close="reset">
    <section class="platform-delete-content">
      <BioNexusFormErrors :errors="error" />
      <BioNexusSectionPanel title="Operación irreversible" icon="warning" description="El servidor validará dependencias protegidas y la seguridad del esquema antes de eliminar." variant="danger" compact>
        <p class="platform-delete-warning">La eliminación solo se completará si el servidor confirma que el laboratorio no tiene dependencias protegidas y que su esquema puede borrarse con seguridad. No se eliminan registros clínicos ni de auditoría.</p>
      </BioNexusSectionPanel>

      <BioNexusSectionPanel title="Confirmación de identidad" icon="password" description="Confirma la operación con la contraseña actual del administrador de plataforma." variant="soft" compact>
        <BioNexusFormField label="Contraseña del administrador de plataforma" field-id="platform-delete-password" required :error="fieldErrors.password">
          <input id="platform-delete-password" ref="passwordInput" v-model="password" class="bio-nexus-field" type="password" autocomplete="current-password" required :disabled="saving" @input="syncDirty" />
        </BioNexusFormField>
      </BioNexusSectionPanel>

      <BioNexusSectionPanel v-if="dependencies.length" title="Dependencias protegidas" icon="shield_lock" description="El servidor bloqueó la eliminación porque encontró datos o relaciones protegidas." variant="danger" compact>
        <ul class="platform-delete-dependencies"><li v-for="dependency in dependencies" :key="dependency.table"><strong>{{ dependency.table }}</strong><span>{{ dependency.count }}</span></li></ul>
      </BioNexusSectionPanel>
    </section>
    <template #footer>
      <BioNexusActionButton label="Cancelar" icon="close" variant="secondary" :disabled="saving" @click="requestClose" />
      <BioNexusActionButton label="Eliminar definitivamente" icon="delete_forever" variant="danger" :loading="saving" :disabled="saving || !password" @click="remove" />
    </template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>
<script setup>
import { computed,nextTick,reactive,ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
import { deletePlatformLaboratory } from '@/services/platformService'
const emit=defineEmits(['deleted']),dialog=ref(null),discardDialog=ref(null),passwordInput=ref(null),laboratoryId=ref(null),laboratoryName=ref(''),password=ref(''),saving=ref(false),error=ref(''),dependencies=ref([]),original=ref(''),fieldErrors=reactive({password:''})
const dirty=computed(()=>password.value!==original.value)
function clearErrors(){error.value='';fieldErrors.password=''}
function errorMessage(cause){const code=cause?.data?.code||cause?.code,rows=cause?.data?.dependencies;if(code==='PLATFORM_LABORATORY_DELETION_BLOCKED'){dependencies.value=Array.isArray(rows)?rows:[];return dependencies.value.length?'No se puede eliminar este laboratorio: el servidor encontró dependencias protegidas. No se borrará ningún dato.':'No se puede eliminar este laboratorio porque tiene dependencias protegidas. No se borrará ningún dato.'}if(code==='PLATFORM_LABORATORY_DELETION_SCHEMA_UNSAFE'){dependencies.value=[];return'No se puede demostrar que el esquema de este laboratorio sea seguro para eliminar. No se borrará ningún dato.'}return cause?.message||'No fue posible eliminar el laboratorio.'}
async function open(laboratory){laboratoryId.value=laboratory.id;laboratoryName.value=laboratory.name||'';password.value='';original.value='';dependencies.value=[];clearErrors();await dialog.value?.open();await nextTick();passwordInput.value?.focus()}
function syncDirty(){clearErrors();dependencies.value=[]}
async function remove(){clearErrors();dependencies.value=[];if(!password.value){fieldErrors.password='Ingresa la contraseña del administrador de plataforma.';return}if(saving.value||!laboratoryId.value)return;saving.value=true;try{await deletePlatformLaboratory(laboratoryId.value,password.value);original.value=password.value;emit('deleted',laboratoryId.value);dialog.value?.close()}catch(cause){error.value=errorMessage(cause)}finally{saving.value=false}}
async function requestClose(){if(saving.value)return;if(dirty.value){const confirmed=await discardDialog.value?.ask({kicker:'Confirmación',title:'Cancelar eliminación',message:'La contraseña ingresada se descartará. ¿Deseas salir?',icon:'warning',variant:'danger',confirmIcon:'delete',confirmText:'Sí, salir y descartar',cancelText:'Continuar aquí'});if(!confirmed)return}dialog.value?.close()}
function reset(){laboratoryId.value=null;laboratoryName.value='';password.value='';original.value='';dependencies.value=[];clearErrors()}defineExpose({open})
</script>
<style scoped>
.platform-delete-content{display:grid;gap:var(--bio-nexus-space-4);padding:var(--bio-nexus-space-4);font-family:var(--bio-nexus-font-family)}.platform-delete-warning{margin:0;color:var(--bio-nexus-color-text);font-size:var(--bio-nexus-font-size-md);line-height:1.55}.platform-delete-dependencies{display:grid;gap:var(--bio-nexus-space-2);margin:0;padding:0;list-style:none}.platform-delete-dependencies li{display:flex;align-items:center;justify-content:space-between;gap:var(--bio-nexus-space-3);padding:var(--bio-nexus-space-2) var(--bio-nexus-space-3);border:1px solid var(--bio-nexus-color-danger-border);border-radius:var(--bio-nexus-radius-md);color:var(--bio-nexus-color-text);background:var(--bio-nexus-color-danger-soft)}.platform-delete-dependencies span{font-weight:var(--bio-nexus-font-weight-bold)}
</style>
