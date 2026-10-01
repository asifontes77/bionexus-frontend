<template>
  <section class="application-settings-page">
    <BioNexusFormErrors :errors="formErrors" />

    <div class="application-settings-navigation">
      <BioNexusTabs v-model="activeTab" :tabs="tabs" aria-label="Secciones de Configuración de la aplicación" id-prefix="application-settings" />
      <div class="application-settings-actions">
        <BioNexusActionButton v-if="dirty" icon="undo" variant="secondary" :disabled="saving" @click="requestDiscard">Descartar cambios</BioNexusActionButton>
        <BioNexusActionButton v-if="canUpdate" icon="save" variant="primary" :loading="saving" :disabled="loading || !dirty || hasLocalErrors" @click="save">Guardar cambios</BioNexusActionButton>
      </div>
    </div>

    <div v-if="loading" class="bio-nexus-empty-state">Cargando configuración...</div>
    <ApplicationSettingsPanel v-else-if="settings" :model="settings" :currencies="currencies" :active-tab="activeTab" :disabled="!canUpdate || saving" :show-errors="showErrors" />
    <BioNexusConfirmDialog ref="confirmDialog" />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import ApplicationSettingsPanel from '@/components/application-settings/ApplicationSettingsPanel.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import BioNexusTabs from '@/components/ui/BioNexusTabs.vue'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import { validateApplicationSettings } from '@/models/applicationSettings'
import { getApplicationSettings, getApplicationSettingsErrorMessage, updateApplicationSettings } from '@/services/applicationSettingsService'
import { getActiveCurrencies } from '@/services/currencyService'
import { useAuthorizationStore } from '@/stores/authorization'

const route=useRoute(),authorization=useAuthorizationStore(),toast=useBioNexusToast()
const settings=ref(null),currencies=ref([]),original=ref(''),loading=ref(false),saving=ref(false),formErrors=ref([]),showErrors=ref(false),confirmDialog=ref(null)
const activeTab=ref(typeof route.query.tab==='string'?route.query.tab:'regional')
const tabs=Object.freeze([{key:'regional',label:'Formatos regionales'},{key:'session',label:'Sesión'},{key:'printer',label:'Impresora'}])
const canUpdate=computed(()=>authorization.hasPermission('application-settings.update'))
const dirty=computed(()=>settings.value!==null&&JSON.stringify(settings.value)!==original.value)
const localErrors=computed(()=>settings.value?validateApplicationSettings(settings.value):[])
const hasLocalErrors=computed(()=>localErrors.value.length>0)
function snapshot(){original.value=JSON.stringify(settings.value)}
function clearGeneralError(){if(formErrors.value.length)formErrors.value=[]}
async function load(){loading.value=true;formErrors.value=[];try{[settings.value,currencies.value]=await Promise.all([getApplicationSettings(),getActiveCurrencies()]);snapshot()}catch(error){formErrors.value=[getApplicationSettingsErrorMessage(error,'No fue posible cargar la configuración.')]}finally{loading.value=false}}
function discard(){if(!original.value||saving.value)return;settings.value=JSON.parse(original.value);showErrors.value=false;formErrors.value=[];toast.info('Los cambios pendientes fueron descartados.')}
async function requestDiscard(){if(await confirmDialog.value?.ask({kicker:'Cambios pendientes',title:'Descartar cambios',message:'Se perderán los cambios realizados en las tres pestañas.',detail:'Esta acción no se puede deshacer.',icon:'delete',confirmIcon:'delete',confirmText:'Sí, descartar cambios',cancelText:'Continuar editando',variant:'danger'}))discard()}
async function confirmLeave(){return await confirmDialog.value?.ask({kicker:'Cambios sin guardar',title:'Salir de Configuración',message:'Hay cambios sin guardar. ¿Deseas salir y descartarlos?',icon:'delete',confirmIcon:'delete',confirmText:'Sí, salir y descartar cambios',cancelText:'Continuar editando',variant:'danger'})}
async function save(){if(!dirty.value||saving.value)return;showErrors.value=true;formErrors.value=[];if(hasLocalErrors.value)return;saving.value=true;try{settings.value=await updateApplicationSettings(settings.value);snapshot();showErrors.value=false;globalThis.dispatchEvent(new CustomEvent('bio-nexus:session-policy-local',{detail:settings.value}));globalThis.dispatchEvent(new CustomEvent('bio-nexus:regional-settings-local',{detail:settings.value}));toast.success('La configuración de la aplicación fue actualizada.')}catch(error){formErrors.value=[getApplicationSettingsErrorMessage(error,'No fue posible guardar la configuración.')]}finally{saving.value=false}}
function beforeUnload(event){if(!dirty.value)return;event.preventDefault();event.returnValue=''}
watch(settings,clearGeneralError,{deep:true})
watch(()=>route.query.tab,value=>{if(typeof value==='string')activeTab.value=value})
onBeforeRouteLeave(async()=>!dirty.value||await confirmLeave())
onMounted(()=>{globalThis.addEventListener('beforeunload',beforeUnload);load()})
onBeforeUnmount(()=>globalThis.removeEventListener('beforeunload',beforeUnload))
</script>

<style scoped>
.application-settings-page{display:grid;gap:var(--bio-nexus-space-4);min-width:0}.application-settings-navigation{position:sticky;z-index:20;top:calc(var(--bio-nexus-topbar-height) + var(--bio-nexus-space-2));display:flex;align-items:center;justify-content:space-between;gap:var(--bio-nexus-space-3);padding:var(--bio-nexus-space-1);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-background);box-shadow:0 8px 16px rgb(34 59 87 / 8%)}.application-settings-navigation :deep(.bio-nexus-tabs){flex:1;min-width:0}.application-settings-actions{display:flex;flex:0 0 auto;align-items:center;gap:var(--bio-nexus-space-2)}@media(max-width:720px){.application-settings-navigation{top:calc(var(--bio-nexus-topbar-height) + var(--bio-nexus-space-1));align-items:stretch;flex-direction:column}.application-settings-actions{justify-content:flex-end;flex-wrap:wrap}}
</style>