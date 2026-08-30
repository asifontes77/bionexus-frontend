<template>
  <section class="identity-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert"><strong>No fue posible cargar Identidad.</strong><span>{{ loadError }}</span></div>
    <div class="identity-toolbar">
      <p>Los datos guardados se utilizan en documentos, reportes y comunicaciones del laboratorio.</p>
      <div class="identity-actions">
        <BioNexusActionButton v-if="dirty" variant="secondary" :disabled="saving" @click="discard">Descartar</BioNexusActionButton>
        <BioNexusActionButton v-if="canUpdate" variant="primary" :loading="saving" :disabled="loading || !dirty" @click="save">Guardar cambios</BioNexusActionButton>
      </div>
    </div>
    <div v-if="loading" class="bio-nexus-empty-state">Cargando identidad...</div>
    <template v-else-if="laboratory">
      <div class="identity-layout">
        <LaboratoryLogoPanel class="identity-logo" :model="laboratory" :errors="identityErrors" :disabled="!canUpdate || saving" @upload="uploadLogo" />
        <LaboratoryGeneralPanel class="identity-data" :model="laboratory" :errors="identityErrors" :disabled="!canUpdate || saving" />
      </div>
    </template>
  </section>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import LaboratoryGeneralPanel from '@/components/laboratory/LaboratoryGeneralPanel.vue'
import LaboratoryLogoPanel from '@/components/laboratory/LaboratoryLogoPanel.vue'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import { validateLaboratoryIdentity } from '@/models/laboratory'
import { getLaboratory, getLaboratoryErrorMessage, updateLaboratory, uploadLaboratoryLogo } from '@/services/laboratoryService'
import { useAuthorizationStore } from '@/stores/authorization'
const authorization=useAuthorizationStore()
const toast=useBioNexusToast()
const laboratory=ref(null)
const original=ref('')
const loading=ref(false)
const saving=ref(false)
const loadError=ref('')
const identityErrors=ref({})
const canUpdate=computed(()=>authorization.hasPermission('laboratory.update'))
const dirty=computed(()=>laboratory.value!==null&&JSON.stringify(laboratory.value)!==original.value)
function snapshot(){original.value=JSON.stringify(laboratory.value)}
function discard(){if(!original.value||saving.value)return;laboratory.value=JSON.parse(original.value);identityErrors.value={};toast.info('Los cambios pendientes fueron descartados.')}
async function load(){loading.value=true;loadError.value='';try{laboratory.value=await getLaboratory();snapshot()}catch(error){loadError.value=getLaboratoryErrorMessage(error,'No fue posible cargar la identidad.');toast.error(loadError.value)}finally{loading.value=false}}
async function save(){if(!dirty.value||saving.value)return;identityErrors.value=validateLaboratoryIdentity(laboratory.value);if(Object.keys(identityErrors.value).length){toast.error('Revise los campos señalados antes de guardar.');return}saving.value=true;try{laboratory.value=await updateLaboratory(laboratory.value.id,laboratory.value);snapshot();identityErrors.value={};toast.success('La identidad del laboratorio fue actualizada.')}catch(error){toast.error(getLaboratoryErrorMessage(error,'No fue posible guardar la identidad.'))}finally{saving.value=false}}
async function uploadLogo(file){if(!authorization.hasPermission('laboratory.upload-logo')){toast.error('La cuenta no tiene permiso para actualizar el logo.');return}saving.value=true;try{laboratory.value=await uploadLaboratoryLogo(file);snapshot();toast.success('El logo fue actualizado.')}catch(error){toast.error(getLaboratoryErrorMessage(error,'No fue posible actualizar el logo.'))}finally{saving.value=false}}
onMounted(load)
</script>
<style scoped>
.identity-page{display:grid;gap:var(--bio-nexus-space-4);min-width:0}.identity-toolbar{position:sticky;z-index:20;top:calc(var(--bio-nexus-topbar-height) + var(--bio-nexus-space-2));display:flex;align-items:center;justify-content:space-between;gap:var(--bio-nexus-space-3);padding:10px 12px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface);box-shadow:0 7px 16px rgb(34 59 87 / 8%)}.identity-toolbar p{margin:0;color:var(--bio-nexus-color-text-secondary);font-size:13px}.identity-actions{display:flex;flex:0 0 auto;gap:var(--bio-nexus-space-2)}.identity-layout{display:grid;grid-template-columns:minmax(300px,360px) minmax(0,1fr);gap:var(--bio-nexus-space-4);align-items:start}.identity-logo{position:sticky;top:calc(var(--bio-nexus-topbar-height) + 82px);min-width:0}.identity-data{min-width:0}@media(max-width:980px){.identity-layout{grid-template-columns:1fr}.identity-logo{position:static}}@media(max-width:720px){.identity-toolbar{align-items:stretch;flex-direction:column}.identity-actions{justify-content:flex-end}}
</style>
