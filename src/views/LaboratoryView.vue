<template>
  <section class="laboratory-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert">
      <strong>No fue posible cargar Laboratorio.</strong>
      <span>{{ loadError }}</span>
    </div>

    <div class="laboratory-navigation">
      <BioNexusTabs v-model="activeTab" :tabs="tabs" aria-label="Secciones de Laboratorio" id-prefix="laboratory" />
      <div class="laboratory-actions">
        <BioNexusActionButton v-if="dirty" variant="secondary" :disabled="saving" @click="discard">Descartar</BioNexusActionButton>
        <BioNexusActionButton v-if="canUpdate" variant="primary" :loading="saving" :disabled="loading || !dirty" @click="save">Guardar cambios</BioNexusActionButton>
      </div>
    </div>

    <div v-if="loading" class="bio-nexus-empty-state">Cargando configuración...</div>
    <template v-else-if="laboratory">
      <LaboratoryLogoPanel v-show="activeTab === 'logo'" id="laboratory-panel-logo" role="tabpanel" aria-labelledby="laboratory-tab-logo" :model="laboratory" :disabled="!canUpdate || saving" @upload="uploadLogo" />
      <LaboratoryGeneralPanel v-show="activeTab === 'general'" id="laboratory-panel-general" role="tabpanel" aria-labelledby="laboratory-tab-general" :model="laboratory" :disabled="!canUpdate || saving" />
      <LaboratoryBillingPanel v-show="activeTab === 'billing'" id="laboratory-panel-billing" role="tabpanel" aria-labelledby="laboratory-tab-billing" :model="laboratory" :disabled="!canUpdate || saving" />
      <LaboratoryEmailPanel v-show="activeTab === 'email'" id="laboratory-panel-email" role="tabpanel" aria-labelledby="laboratory-tab-email" :model="laboratory" :disabled="!canUpdate || saving" />
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusTabs from '@/components/ui/BioNexusTabs.vue'
import LaboratoryBillingPanel from '@/components/laboratory/LaboratoryBillingPanel.vue'
import LaboratoryEmailPanel from '@/components/laboratory/LaboratoryEmailPanel.vue'
import LaboratoryGeneralPanel from '@/components/laboratory/LaboratoryGeneralPanel.vue'
import LaboratoryLogoPanel from '@/components/laboratory/LaboratoryLogoPanel.vue'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import { validateLaboratoryRequired } from '@/models/laboratory'
import { getLaboratory, getLaboratoryErrorMessage, updateLaboratory, uploadLaboratoryLogo } from '@/services/laboratoryService'
import { useAuthorizationStore } from '@/stores/authorization'

const authorization = useAuthorizationStore()
const toast = useBioNexusToast()
const laboratory = ref(null)
const original = ref('')
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const activeTab = ref('general')
const tabs = Object.freeze([
  { key: 'logo', label: 'Logo' },
  { key: 'general', label: 'General' },
  { key: 'billing', label: 'Factura / Toma de muestra' },
  { key: 'email', label: 'Envío por correo' }
])
const canUpdate = computed(() => authorization.hasPermission('laboratory.update'))
const dirty = computed(() => laboratory.value !== null && JSON.stringify(laboratory.value) !== original.value)

function snapshot() { original.value = JSON.stringify(laboratory.value) }
function discard() {
  if (!original.value || saving.value) return
  laboratory.value = JSON.parse(original.value)
  toast.info('Los cambios pendientes fueron descartados.')
}
async function load() {
  loading.value = true
  loadError.value = ''
  try { laboratory.value = await getLaboratory(); snapshot() }
  catch (error) {
    loadError.value = getLaboratoryErrorMessage(error, 'No fue posible cargar la configuración.')
    toast.error(loadError.value)
  } finally { loading.value = false }
}
async function save() {
  if (!dirty.value || saving.value) return
  const errors = validateLaboratoryRequired(laboratory.value)
  if (errors.length) { toast.error(errors.join(' ')); return }
  saving.value = true
  try {
    laboratory.value = await updateLaboratory(laboratory.value.id, laboratory.value)
    snapshot()
    toast.success('La configuración fue actualizada.')
  } catch (error) { toast.error(getLaboratoryErrorMessage(error, 'No fue posible guardar.')) }
  finally { saving.value = false }
}
async function uploadLogo(file) {
  if (!authorization.hasPermission('laboratory.upload-logo')) {
    toast.error('La cuenta no tiene permiso para actualizar el logo.')
    return
  }
  saving.value = true
  try {
    laboratory.value = await uploadLaboratoryLogo(file)
    snapshot()
    toast.success('El logo fue actualizado.')
  } catch (error) { toast.error(getLaboratoryErrorMessage(error, 'No fue posible actualizar el logo.')) }
  finally { saving.value = false }
}
onMounted(load)
</script>

<style scoped>
.laboratory-page {
  display: grid;
  gap: var(--bio-nexus-space-4);
  min-width: 0;
}

.laboratory-navigation {
  position: sticky;
  z-index: 20;
  top: calc(var(--bio-nexus-topbar-height) + var(--bio-nexus-space-2));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--bio-nexus-space-3);
  padding: var(--bio-nexus-space-1);
  border-radius: var(--bio-nexus-radius-md);
  background: var(--bio-nexus-color-background);
  box-shadow: 0 8px 16px rgb(34 59 87 / 8%);
}

.laboratory-navigation :deep(.bio-nexus-tabs) {
  flex: 1;
  min-width: 0;
}

.laboratory-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--bio-nexus-space-2);
}

@media (max-width: 720px) {
  .laboratory-navigation {
    top: calc(var(--bio-nexus-topbar-height) + var(--bio-nexus-space-1));
    align-items: stretch;
    flex-direction: column;
  }

  .laboratory-actions {
    justify-content: flex-end;
  }
}
</style>
