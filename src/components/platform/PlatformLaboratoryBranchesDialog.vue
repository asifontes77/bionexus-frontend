<template>
  <BioNexusDialog ref="dialog" title="Sucursales" :subtitle="laboratoryName" size="standard" :prevent-close="saving" @close="reset">
    <div class="platform-dialog-content">
      <p v-if="error" class="platform-dialog-error" role="alert">{{ error }}</p>
      <p v-if="loading" class="platform-dialog-muted" role="status">Cargando sucursales…</p>
      <template v-else>
        <form class="platform-branch-form" @submit.prevent="addBranch">
          <BioNexusFormField label="Código" field-id="platform-branch-code" required>
            <input id="platform-branch-code" v-model.trim="form.code" class="bio-nexus-field" maxlength="30" required :disabled="saving" />
          </BioNexusFormField>
          <BioNexusFormField label="Nombre" field-id="platform-branch-name" required>
            <input id="platform-branch-name" v-model.trim="form.name" class="bio-nexus-field" maxlength="100" required :disabled="saving" />
          </BioNexusFormField>
          <BioNexusFormField label="Dirección" field-id="platform-branch-address">
            <input id="platform-branch-address" v-model.trim="form.address" class="bio-nexus-field" maxlength="200" :disabled="saving" />
          </BioNexusFormField>
          <BioNexusFormField label="Teléfono" field-id="platform-branch-phone">
            <input id="platform-branch-phone" v-model.trim="form.phone" class="bio-nexus-field" maxlength="30" :disabled="saving" />
          </BioNexusFormField>
          <BioNexusFormField label="Correo" field-id="platform-branch-email">
            <input id="platform-branch-email" v-model.trim="form.email" class="bio-nexus-field" type="email" maxlength="120" :disabled="saving" />
          </BioNexusFormField>
          <BioNexusFormField label="Orden de visualización" field-id="platform-branch-order">
            <input id="platform-branch-order" v-model.number="form.displayOrder" class="bio-nexus-field" type="number" min="0" :disabled="saving" />
          </BioNexusFormField>
          <BioNexusActionButton class="platform-branch-add" label="Agregar sucursal" icon="add" variant="primary" type="submit" :disabled="saving || !form.code || !form.name" :loading="savingAction === 'add'" />
        </form>
        <ul v-if="branches.length" class="platform-branch-list">
          <li v-for="branch in branches" :key="branch.id">
            <span><strong>{{ branch.name || branch.code }}</strong><small>{{ branch.code }}{{ isMain(branch) ? ' · Principal' : '' }}</small></span>
            <BioNexusActionButton v-if="!isMain(branch)" :label="`Quitar sucursal ${branch.name || branch.code}`" icon="delete" variant="danger" size="sm" :disabled="saving" @click="confirmRemove(branch)" />
          </li>
        </ul>
        <p v-else class="platform-dialog-muted">No hay sucursales registradas.</p>
      </template>
    </div>
    <template #footer><BioNexusActionButton label="Cerrar" icon="close" variant="secondary" :disabled="saving" @click="dialog?.close()" /></template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="confirmDialog" />
</template>

<script setup>
import { reactive, ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import {
  createPlatformLaboratoryBranch,
  getPlatformLaboratoryBranches,
  removePlatformLaboratoryBranch,
} from '@/services/platformService'

const emit = defineEmits(['changed'])
const dialog = ref(null)
const confirmDialog = ref(null)
const laboratoryId = ref(null)
const laboratoryName = ref('')
const branches = ref([])
const loading = ref(false)
const saving = ref(false)
const savingAction = ref('')
const error = ref('')
const emptyForm = () => ({ code: '', name: '', address: '', phone: '', email: '', displayOrder: 0 })
const form = reactive(emptyForm())

function isMain(branch) {
  return branch.isMain === true || branch.is_main === true
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const result = await getPlatformLaboratoryBranches(laboratoryId.value)
    branches.value = Array.isArray(result) ? result : Array.isArray(result?.branches) ? result.branches : []
  } catch (cause) {
    error.value = cause?.message || 'No fue posible consultar las sucursales.'
  } finally {
    loading.value = false
  }
}

async function open(laboratory) {
  laboratoryId.value = laboratory.id
  laboratoryName.value = laboratory.name || ''
  Object.assign(form, emptyForm())
  error.value = ''
  await dialog.value?.open()
  await load()
}

async function addBranch() {
  if (saving.value || !form.code || !form.name) return
  saving.value = true
  savingAction.value = 'add'
  error.value = ''
  try {
    await createPlatformLaboratoryBranch(laboratoryId.value, {
      code: form.code,
      name: form.name,
      address: form.address || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      displayOrder: Number.isFinite(form.displayOrder) ? form.displayOrder : 0,
    })
    Object.assign(form, emptyForm())
    await load()
    emit('changed')
  } catch (cause) {
    error.value = cause?.message || 'No fue posible agregar la sucursal.'
  } finally {
    saving.value = false
    savingAction.value = ''
  }
}

async function confirmRemove(branch) {
  if (isMain(branch)) return
  const confirmed = await confirmDialog.value?.ask({
    title: 'Quitar sucursal',
    message: `¿Deseas quitar la sucursal ${branch.name || branch.code}?`,
    detail: 'No se puede quitar la sucursal principal ni una sucursal con registros asociados.',
    confirmText: 'Quitar sucursal',
    confirmIcon: 'delete',
    variant: 'danger',
  })
  if (!confirmed || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await removePlatformLaboratoryBranch(laboratoryId.value, branch.id)
    await load()
    emit('changed')
  } catch (cause) {
    error.value = cause?.message || 'No fue posible quitar la sucursal.'
  } finally {
    saving.value = false
  }
}

function reset() {
  laboratoryId.value = null
  laboratoryName.value = ''
  branches.value = []
  Object.assign(form, emptyForm())
  error.value = ''
}

defineExpose({ open })
</script>

<style scoped>
.platform-dialog-content{display:grid;gap:14px;padding:16px}.platform-dialog-error{margin:0;padding:12px;border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-danger-soft);color:var(--bio-nexus-color-danger);overflow-wrap:anywhere}.platform-dialog-muted{margin:0;color:var(--bio-nexus-color-text-muted)}.platform-branch-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:end}.platform-branch-add{grid-column:1/-1;justify-self:end}.platform-branch-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.platform-branch-list li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md)}.platform-branch-list li span{display:grid;gap:3px}.platform-branch-list small{color:var(--bio-nexus-color-text-muted)}@media(max-width:520px){.platform-branch-form{grid-template-columns:1fr}.platform-branch-add{grid-column:auto}}
</style>
