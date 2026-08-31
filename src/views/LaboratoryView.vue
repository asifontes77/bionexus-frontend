<template>
  <section class="laboratory-page">
    <div v-if="loadError" class="bio-nexus-message bio-nexus-message-error" role="alert">
      <strong>No fue posible cargar Laboratorio.</strong>
      <span>{{ loadError }}</span>
    </div>

    <div v-if="!isCommunicationsRoute" class="laboratory-navigation">
      <BioNexusTabs v-model="activeTab" :tabs="tabs" aria-label="Secciones de Laboratorio" id-prefix="laboratory" />
      <div class="laboratory-actions">
        <BioNexusActionButton v-if="dirty" variant="secondary" :disabled="saving" @click="discard">Descartar</BioNexusActionButton>
        <BioNexusActionButton v-if="canUpdate" variant="primary" :loading="saving" :disabled="loading || !dirty" @click="save">Guardar cambios</BioNexusActionButton>
      </div>
    </div>

    <div v-if="loading" class="bio-nexus-empty-state">Cargando configuración...</div>
    <template v-else-if="laboratory">
      <LaboratoryLogoPanel v-if="!isCommunicationsRoute" v-show="activeTab === 'logo'" id="laboratory-panel-logo" role="tabpanel" aria-labelledby="laboratory-tab-logo" :model="laboratory" :errors="identityErrors" :disabled="!canUpdate || saving" @upload="uploadLogo" />
      <LaboratoryGeneralPanel v-if="!isCommunicationsRoute" v-show="activeTab === 'general'" id="laboratory-panel-general" role="tabpanel" aria-labelledby="laboratory-tab-general" :model="laboratory" :errors="identityErrors" :disabled="!canUpdate || saving" />
      <LaboratoryBillingPanel v-if="!isCommunicationsRoute" v-show="activeTab === 'billing'" id="laboratory-panel-billing" role="tabpanel" aria-labelledby="laboratory-tab-billing" :model="laboratory" :disabled="!canUpdate || saving" />
      <LaboratoryEmailPanel v-if="isCommunicationsRoute || activeTab === 'email'" v-show="isCommunicationsRoute || activeTab === 'email'" id="laboratory-panel-email" role="tabpanel" aria-labelledby="laboratory-tab-email" :model="laboratory" :errors="emailErrors" :disabled="!canUpdate || saving || testingEmail" :testing="testingEmail" :saving="saving" :dirty="dirty" :can-update="canUpdate" @discard="discard" @save="save" @test-connection="testConnection" />
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusTabs from '@/components/ui/BioNexusTabs.vue'
import LaboratoryBillingPanel from '@/components/laboratory/LaboratoryBillingPanel.vue'
import LaboratoryEmailPanel from '@/components/laboratory/LaboratoryEmailPanel.vue'
import LaboratoryGeneralPanel from '@/components/laboratory/LaboratoryGeneralPanel.vue'
import LaboratoryLogoPanel from '@/components/laboratory/LaboratoryLogoPanel.vue'
import { useBioNexusToast } from '@/composables/useBioNexusToast'
import { validateLaboratoryEmail, validateLaboratoryIdentity } from '@/models/laboratory'
import { getLaboratory, getLaboratoryErrorMessage, testLaboratoryEmailConnection, updateLaboratory, uploadLaboratoryLogo } from '@/services/laboratoryService'
import { useAuthorizationStore } from '@/stores/authorization'

const route = useRoute()
const authorization = useAuthorizationStore()
const toast = useBioNexusToast()
const laboratory = ref(null)
const original = ref('')
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')
const identityErrors = ref({})
const emailErrors = ref({})
const testingEmail = ref(false)
const activeTab = ref(typeof route.query.tab === 'string' ? route.query.tab : (typeof route.meta.initialTab === 'string' ? route.meta.initialTab : 'general'))
const tabs = Object.freeze([
  { key: 'logo', label: 'Logo' },
  { key: 'general', label: 'General' },
  { key: 'billing', label: 'Factura / Toma de muestra' },
  { key: 'email', label: 'Envío por correo' }
])
const canUpdate = computed(() => authorization.hasPermission('laboratory.update'))
const isCommunicationsRoute = computed(() => route.name === 'configuration-laboratory-communications')
const dirty = computed(() => laboratory.value !== null && JSON.stringify(laboratory.value) !== original.value)

function snapshot() { original.value = JSON.stringify(laboratory.value) }
function discard() {
  if (!original.value || saving.value) return
  laboratory.value = JSON.parse(original.value)
  identityErrors.value = {}
  emailErrors.value = {}
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
  identityErrors.value = validateLaboratoryIdentity(laboratory.value)
  emailErrors.value = validateLaboratoryEmail(laboratory.value.sendEmail)
  if (Object.keys(emailErrors.value).length) { activeTab.value = 'email'; toast.error('Revise la configuraci\u00f3n de correo antes de guardar.'); return }
  const errors = Object.values(identityErrors.value)
  if (errors.length) { activeTab.value = errors.some((_, index) => Object.keys(identityErrors.value)[index].startsWith('max_')) ? 'logo' : 'general'; toast.error('Revise los campos señalados antes de guardar.'); return }
  saving.value = true
  try {
    laboratory.value = await updateLaboratory(laboratory.value.id, laboratory.value)
    snapshot()
    identityErrors.value = {}
    toast.success('La configuración fue actualizada.')
  } catch (error) { toast.error(getLaboratoryErrorMessage(error, 'No fue posible guardar.')) }
  finally { saving.value = false }
}
async function testConnection() {
  if (!laboratory.value || testingEmail.value) return
  emailErrors.value = validateLaboratoryEmail(laboratory.value.sendEmail)
  if (Object.keys(emailErrors.value).length) { toast.error('Revise la configuraci\u00f3n de correo antes de probar.'); return }
  testingEmail.value = true
  try {
    const result = await testLaboratoryEmailConnection(laboratory.value.id, laboratory.value.sendEmail)
    toast.success(result?.mode === 'gmail' ? 'Conexi\u00f3n con Gmail verificada.' : 'Conexi\u00f3n SMTP verificada.')
  } catch (error) { toast.error(getLaboratoryErrorMessage(error, 'No fue posible verificar la conexi\u00f3n.')) }
  finally { testingEmail.value = false }
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
watch(() => [route.name, route.query.tab, route.meta.initialTab], ([, queryTab, initialTab]) => {
  activeTab.value = typeof queryTab === 'string' ? queryTab : (typeof initialTab === 'string' ? initialTab : 'general')
}, { immediate: true })
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
