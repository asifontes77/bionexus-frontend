<template>
  <BioNexusDialog ref="dialog" title="Eliminar laboratorio" :subtitle="laboratoryName" size="compact" :prevent-close="saving" @close="reset">
    <form class="platform-delete-content" @submit.prevent="remove">
      <p class="platform-delete-warning">La eliminación solo se completará si el servidor confirma que el laboratorio no tiene dependencias protegidas y que su esquema puede borrarse con seguridad. No se eliminan registros clínicos ni de auditoría.</p>
      <p v-if="error" class="platform-delete-error" role="alert">{{ error }}</p>
      <BioNexusFormField label="Contraseña del administrador de plataforma" field-id="platform-delete-password" required>
        <input id="platform-delete-password" v-model="password" class="bio-nexus-field" type="password" autocomplete="current-password" required :disabled="saving" />
      </BioNexusFormField>
      <ul v-if="dependencies.length" class="platform-delete-dependencies">
        <li v-for="dependency in dependencies" :key="dependency.table">{{ dependency.table }}: {{ dependency.count }}</li>
      </ul>
    </form>
    <template #footer>
      <BioNexusActionButton label="Cancelar" icon="close" variant="secondary" :disabled="saving" @click="dialog?.close()" />
      <BioNexusActionButton label="Eliminar definitivamente" icon="delete_forever" variant="danger" type="submit" :loading="saving" @click="remove" />
    </template>
  </BioNexusDialog>
</template>

<script setup>
import { ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import { deletePlatformLaboratory } from '@/services/platformService'

const emit = defineEmits(['deleted'])
const dialog = ref(null)
const laboratoryId = ref(null)
const laboratoryName = ref('')
const password = ref('')
const saving = ref(false)
const error = ref('')
const dependencies = ref([])

function errorMessage(cause) {
  const code = cause?.data?.code || cause?.code
  const rows = cause?.data?.dependencies
  if (code === 'PLATFORM_LABORATORY_DELETION_BLOCKED') {
    dependencies.value = Array.isArray(rows) ? rows : []
    return dependencies.value.length
      ? 'No se puede eliminar este laboratorio: el servidor encontró dependencias protegidas. No se borró ningún dato.'
      : 'No se puede eliminar este laboratorio porque tiene dependencias protegidas. No se borró ningún dato.'
  }
  if (code === 'PLATFORM_LABORATORY_DELETION_SCHEMA_UNSAFE') {
    dependencies.value = []
    return 'No se puede demostrar que el esquema de este laboratorio sea seguro para eliminar. No se borró ningún dato.'
  }
  return cause?.message || 'No fue posible eliminar el laboratorio.'
}

async function open(laboratory) {
  laboratoryId.value = laboratory.id
  laboratoryName.value = laboratory.name || ''
  password.value = ''
  error.value = ''
  dependencies.value = []
  await dialog.value?.open()
}

async function remove() {
  if (saving.value || !password.value || !laboratoryId.value) return
  saving.value = true
  error.value = ''
  dependencies.value = []
  try {
    await deletePlatformLaboratory(laboratoryId.value, password.value)
    emit('deleted', laboratoryId.value)
    dialog.value?.close()
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    saving.value = false
  }
}

function reset() {
  laboratoryId.value = null
  laboratoryName.value = ''
  password.value = ''
  error.value = ''
  dependencies.value = []
}

defineExpose({ open })
</script>

<style scoped>
.platform-delete-content{display:grid;gap:14px;padding:16px}.platform-delete-warning{margin:0;color:var(--bio-nexus-color-text-primary);line-height:1.5}.platform-delete-error{margin:0;padding:12px;border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-danger-soft);color:var(--bio-nexus-color-danger);overflow-wrap:anywhere}.platform-delete-dependencies{display:grid;gap:4px;margin:0;padding:10px 10px 10px 30px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);color:var(--bio-nexus-color-text-primary)}
</style>
