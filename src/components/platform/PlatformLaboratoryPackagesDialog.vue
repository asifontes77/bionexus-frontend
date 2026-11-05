<template>
  <BioNexusDialog ref="dialog" title="Paquetes instalados" :subtitle="laboratoryName" size="standard" :prevent-close="saving" @close="reset">
    <div class="platform-dialog-content">
      <p v-if="error" class="platform-dialog-error" role="alert">{{ error }}</p>
      <p v-if="loading" class="platform-dialog-muted" role="status">Cargando paquetes…</p>
      <template v-else>
        <div class="platform-install-row">
          <label for="platform-package-to-add">Agregar paquete</label>
          <select id="platform-package-to-add" v-model="selectedCode" class="bio-nexus-field" :disabled="saving || availablePackages.length === 0">
            <option value="">Seleccionar paquete disponible</option>
            <option v-for="item in availablePackages" :key="item.code" :value="item.code">{{ item.code }}</option>
          </select>
          <BioNexusActionButton label="Agregar" icon="add" variant="primary" :disabled="!selectedCode || saving" :loading="savingAction === 'install'" @click="install" />
        </div>
        <p v-if="availablePackages.length === 0" class="platform-dialog-muted">No hay paquetes adicionales disponibles.</p>
        <ul v-if="installedPackages.length" class="platform-package-list">
          <li v-for="item in installedPackages" :key="item.packageCode">
            <span><strong>{{ item.packageCode }}</strong><small>{{ item.installedVersion || 'Versión no informada' }} · {{ item.installationStatus || 'Estado no informado' }}</small></span>
            <BioNexusActionButton :label="`Quitar ${item.packageCode}`" icon="delete" variant="danger" size="sm" :disabled="saving" @click="confirmRemove(item)" />
          </li>
        </ul>
        <p v-else class="platform-dialog-muted">No hay paquetes instalados.</p>
      </template>
    </div>
    <template #footer><BioNexusActionButton label="Cerrar" icon="close" variant="secondary" :disabled="saving" @click="dialog?.close()" /></template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="confirmDialog" />
</template>

<script setup>
import { ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import {
  getPlatformLaboratoryPackages,
  installPlatformLaboratoryPackage,
  removePlatformLaboratoryPackage,
} from '@/services/platformService'

const emit = defineEmits(['changed'])
const dialog = ref(null)
const confirmDialog = ref(null)
const laboratoryId = ref(null)
const laboratoryName = ref('')
const installedPackages = ref([])
const availablePackages = ref([])
const selectedCode = ref('')
const loading = ref(false)
const saving = ref(false)
const savingAction = ref('')
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const result = await getPlatformLaboratoryPackages(laboratoryId.value)
    installedPackages.value = Array.isArray(result?.installed) ? result.installed : []
    availablePackages.value = Array.isArray(result?.available) ? result.available : []
  } catch (cause) {
    error.value = cause?.message || 'No fue posible consultar los paquetes.'
  } finally {
    loading.value = false
  }
}

async function open(laboratory) {
  laboratoryId.value = laboratory.id
  laboratoryName.value = laboratory.name || ''
  selectedCode.value = ''
  error.value = ''
  await dialog.value?.open()
  await load()
}

async function install() {
  if (!selectedCode.value || saving.value) return
  saving.value = true
  savingAction.value = 'install'
  error.value = ''
  try {
    await installPlatformLaboratoryPackage(laboratoryId.value, selectedCode.value)
    selectedCode.value = ''
    await load()
    emit('changed')
  } catch (cause) {
    error.value = cause?.message || 'No fue posible instalar el paquete.'
  } finally {
    saving.value = false
    savingAction.value = ''
  }
}

async function confirmRemove(item) {
  const confirmed = await confirmDialog.value?.ask({
    title: 'Quitar paquete',
    message: `¿Deseas quitar el paquete ${item.packageCode}?`,
    detail: 'El servidor verificará dependencias y datos antes de desinstalarlo.',
    confirmText: 'Quitar paquete',
    confirmIcon: 'delete',
    variant: 'danger',
  })
  if (!confirmed || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await removePlatformLaboratoryPackage(laboratoryId.value, item.packageCode)
    await load()
    emit('changed')
  } catch (cause) {
    error.value = cause?.message || 'No fue posible quitar el paquete.'
  } finally {
    saving.value = false
  }
}

function reset() {
  laboratoryId.value = null
  laboratoryName.value = ''
  installedPackages.value = []
  availablePackages.value = []
  selectedCode.value = ''
  error.value = ''
}

defineExpose({ open })
</script>

<style scoped>
.platform-dialog-content{display:grid;gap:14px;padding:16px}.platform-dialog-error{margin:0;padding:12px;border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-danger-soft);color:var(--bio-nexus-color-danger);overflow-wrap:anywhere}.platform-dialog-muted{margin:0;color:var(--bio-nexus-color-text-muted)}.platform-install-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end}.platform-install-row label{grid-column:1/-1;color:var(--bio-nexus-color-text-primary);font-weight:600}.platform-package-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.platform-package-list li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md)}.platform-package-list li span{display:grid;gap:3px;min-width:0}.platform-package-list small{color:var(--bio-nexus-color-text-muted)}@media(max-width:520px){.platform-install-row{grid-template-columns:1fr}.platform-install-row label{grid-column:auto}.platform-package-list li{align-items:flex-start;flex-direction:column}}
</style>
