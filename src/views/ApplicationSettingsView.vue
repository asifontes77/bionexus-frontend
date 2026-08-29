<template>
  <section class="application-settings-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert">
      <strong>No fue posible cargar la configuración.</strong>
      <span>{{ loadError }}</span>
    </div>

    <div class="application-settings-navigation">
      <BioNexusTabs v-model="activeTab" :tabs="tabs" aria-label="Secciones de Configuración de la aplicación" id-prefix="application-settings" />
      <div class="application-settings-actions">
        <BioNexusActionButton v-if="dirty" variant="secondary" :disabled="saving" @click="discard">Descartar</BioNexusActionButton>
        <BioNexusActionButton v-if="canUpdate" variant="primary" :loading="saving" :disabled="loading || !dirty" @click="save">Guardar cambios</BioNexusActionButton>
      </div>
    </div>

    <div v-if="loading" class="bio-nexus-empty-state">Cargando configuración...</div>
    <ApplicationSettingsPanel v-else-if="settings" :model="settings" :active-tab="activeTab" :disabled="!canUpdate || saving" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ApplicationSettingsPanel from '@/components/application-settings/ApplicationSettingsPanel.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusTabs from '@/components/ui/BioNexusTabs.vue'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import { validateApplicationSettings } from '@/models/applicationSettings'
import { getApplicationSettings, getApplicationSettingsErrorMessage, updateApplicationSettings } from '@/services/applicationSettingsService'
import { useAuthorizationStore } from '@/stores/authorization'

const authorization = useAuthorizationStore()
const toast = useBioNexusToast()
const settings = ref(null)
const original = ref('')
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const activeTab = ref('formats')
const tabs = Object.freeze([
  { key: 'formats', label: 'Formatos' },
  { key: 'session', label: 'Sesión' },
  { key: 'printer', label: 'Impresora' }
])
const canUpdate = computed(() => authorization.hasPermission('application-settings.update'))
const dirty = computed(() => settings.value !== null && JSON.stringify(settings.value) !== original.value)

function snapshot() { original.value = JSON.stringify(settings.value) }
async function load() {
  loading.value = true
  loadError.value = ''
  try { settings.value = await getApplicationSettings(); snapshot() }
  catch (error) {
    loadError.value = getApplicationSettingsErrorMessage(error, 'No fue posible cargar la configuración.')
    toast.error(loadError.value)
  } finally { loading.value = false }
}
function discard() {
  if (!original.value || saving.value) return
  settings.value = JSON.parse(original.value)
  toast.info('Los cambios pendientes fueron descartados.')
}
async function save() {
  if (!dirty.value || saving.value) return
  const errors = validateApplicationSettings(settings.value)
  if (errors.length) { toast.error(errors.join(' ')); return }
  saving.value = true
  try {
    settings.value = await updateApplicationSettings(settings.value)
    snapshot()
    globalThis.dispatchEvent(new CustomEvent('bio-nexus:session-policy-local', { detail: settings.value }))
    toast.success('La configuración de la aplicación fue actualizada.')
  } catch (error) { toast.error(getApplicationSettingsErrorMessage(error, 'No fue posible guardar la configuración.')) }
  finally { saving.value = false }
}
onMounted(load)
</script>

<style scoped>
.application-settings-page { display: grid; gap: var(--bio-nexus-space-4); min-width: 0; }
.application-settings-navigation { position: sticky; z-index: 20; top: calc(var(--bio-nexus-topbar-height) + var(--bio-nexus-space-2)); display: flex; align-items: center; justify-content: space-between; gap: var(--bio-nexus-space-3); padding: var(--bio-nexus-space-1); border-radius: var(--bio-nexus-radius-md); background: var(--bio-nexus-color-background); box-shadow: 0 8px 16px rgb(34 59 87 / 8%); }
.application-settings-navigation :deep(.bio-nexus-tabs) { flex: 1; min-width: 0; }
.application-settings-actions { display: flex; flex: 0 0 auto; align-items: center; gap: var(--bio-nexus-space-2); }
@media (max-width: 720px) {
  .application-settings-navigation { top: calc(var(--bio-nexus-topbar-height) + var(--bio-nexus-space-1)); align-items: stretch; flex-direction: column; }
  .application-settings-actions { justify-content: flex-end; }
}
</style>
