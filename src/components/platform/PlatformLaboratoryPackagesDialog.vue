<template>
  <BioNexusDialog ref="dialog" title="Paquetes instalados" :subtitle="laboratoryName" size="standard" :prevent-close="saving || dirty" @before-close="requestClose" @close="reset">
    <section class="platform-packages-content">
      <BioNexusFormErrors :errors="error" />
      <p v-if="loading" class="platform-dialog-muted" role="status">Cargando paquetes...</p>
      <template v-else>
        <BioNexusSectionPanel title="Agregar paquete" icon="add_box" description="Instala un paquete adicional disponible para este laboratorio." variant="accent" compact>
          <div class="platform-install-row">
            <BioNexusFormField label="Paquete disponible" field-id="platform-package-to-add">
              <select id="platform-package-to-add" v-model="selectedCode" class="bio-nexus-field" :disabled="saving || availablePackages.length === 0" @change="syncDirty">
                <option value="">Seleccionar paquete disponible</option>
                <option v-for="item in availablePackages" :key="item.code" :value="item.code">{{ item.code }}</option>
              </select>
            </BioNexusFormField>
            <BioNexusActionButton label="Agregar" icon="add" variant="primary" :disabled="!selectedCode || saving" :loading="savingAction === 'install'" @click="install" />
          </div>
          <p v-if="availablePackages.length === 0" class="platform-dialog-muted">No hay paquetes adicionales disponibles.</p>
        </BioNexusSectionPanel>

        <BioNexusSectionPanel title="Paquetes instalados" icon="inventory_2" description="Consulta la versión instalada y retira paquetes cuando el servidor lo permita." variant="soft" compact>
          <ul v-if="installedPackages.length" class="platform-package-list">
            <li v-for="item in installedPackages" :key="item.packageCode">
              <span><strong>{{ item.packageCode }}</strong><small>{{ item.installedVersion || 'Versión no informada' }} · {{ item.installationStatus || 'Estado no informado' }}</small></span>
              <BioNexusActionButton :label="`Quitar ${item.packageCode}`" icon="delete" variant="danger" size="sm" :disabled="saving" @click="confirmRemove(item)" />
            </li>
          </ul>
          <p v-else class="platform-dialog-muted">No hay paquetes instalados.</p>
        </BioNexusSectionPanel>
      </template>
    </section>
    <template #footer><BioNexusActionButton label="Cerrar" icon="close" variant="secondary" :disabled="saving" @click="requestClose" /></template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="confirmDialog" />
</template>
<script setup>
import { computed,ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
import { getPlatformLaboratoryPackages,installPlatformLaboratoryPackage,removePlatformLaboratoryPackage } from '@/services/platformService'
const emit=defineEmits(['changed']),dialog=ref(null),confirmDialog=ref(null),laboratoryId=ref(null),laboratoryName=ref(''),installedPackages=ref([]),availablePackages=ref([]),selectedCode=ref(''),loading=ref(false),saving=ref(false),savingAction=ref(''),error=ref(''),originalSelection=ref('')
const dirty=computed(()=>selectedCode.value!==originalSelection.value)
async function load(){loading.value=true;error.value='';try{const result=await getPlatformLaboratoryPackages(laboratoryId.value);installedPackages.value=Array.isArray(result?.installed)?result.installed:[];availablePackages.value=Array.isArray(result?.available)?result.available:[]}catch(cause){error.value=cause?.message||'No fue posible consultar los paquetes.'}finally{loading.value=false}}
async function open(laboratory){laboratoryId.value=laboratory.id;laboratoryName.value=laboratory.name||'';selectedCode.value='';originalSelection.value='';error.value='';await dialog.value?.open();await load()}
function syncDirty(){error.value=''}
async function install(){if(!selectedCode.value||saving.value)return;saving.value=true;savingAction.value='install';error.value='';try{await installPlatformLaboratoryPackage(laboratoryId.value,selectedCode.value);selectedCode.value='';originalSelection.value='';await load();emit('changed')}catch(cause){error.value=cause?.message||'No fue posible instalar el paquete.'}finally{saving.value=false;savingAction.value=''}}
async function confirmRemove(item){const confirmed=await confirmDialog.value?.ask({kicker:'Confirmación',title:'Quitar paquete',message:`¿Deseas quitar el paquete ${item.packageCode}?`,detail:'El servidor verificará dependencias y datos antes de desinstalarlo.',confirmText:'Quitar paquete',confirmIcon:'delete',cancelText:'Cancelar',variant:'danger'});if(!confirmed||saving.value)return;saving.value=true;error.value='';try{await removePlatformLaboratoryPackage(laboratoryId.value,item.packageCode);await load();emit('changed')}catch(cause){error.value=cause?.message||'No fue posible quitar el paquete.'}finally{saving.value=false}}
async function requestClose(){if(saving.value)return;if(dirty.value){const confirmed=await confirmDialog.value?.ask({kicker:'Confirmación',title:'Descartar selección',message:'Hay una selección sin aplicar. ¿Deseas salir y descartarla?',icon:'warning',variant:'danger',confirmIcon:'delete',confirmText:'Sí, salir y descartar',cancelText:'Cancelar'});if(!confirmed)return}dialog.value?.close()}
function reset(){laboratoryId.value=null;laboratoryName.value='';installedPackages.value=[];availablePackages.value=[];selectedCode.value='';originalSelection.value='';error.value=''}defineExpose({open})
</script>
<style scoped>
.platform-packages-content{display:grid;gap:var(--bio-nexus-space-4);padding:var(--bio-nexus-space-4);font-family:var(--bio-nexus-font-family)}.platform-dialog-muted{margin:0;color:var(--bio-nexus-color-text-muted)}.platform-install-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--bio-nexus-space-3);align-items:end}.platform-package-list{display:grid;gap:var(--bio-nexus-space-2);margin:0;padding:0;list-style:none}.platform-package-list li{display:flex;align-items:center;justify-content:space-between;gap:var(--bio-nexus-space-3);padding:var(--bio-nexus-space-3);border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface)}.platform-package-list li span{display:grid;gap:3px;min-width:0}.platform-package-list strong{color:var(--bio-nexus-color-text);font-size:var(--bio-nexus-font-size-md)}.platform-package-list small{color:var(--bio-nexus-color-text-muted);font-size:var(--bio-nexus-font-size-sm)}@media(max-width:520px){.platform-install-row{grid-template-columns:1fr}.platform-package-list li{align-items:flex-start;flex-direction:column}}
</style>
