<template>
  <BioNexusDialog ref="dialog" size="standard" :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'" :title="mode === 'create' ? 'Crear tipo de muestra' : 'Editar tipo de muestra'" @close="reset">
    <section class="sample-type-form">
      <BioNexusFormField label="Descripcion" field-id="sample-type-description" :error="descriptionError" :help="`${draft.description.length} de 50 caracteres`" required>
        <input id="sample-type-description" ref="firstInput" v-model="draft.description" class="bio-nexus-field" maxlength="50" autocomplete="off">
      </BioNexusFormField>
      <div v-if="errorMessage" class="bio-nexus-message bio-nexus-message-error" role="alert">{{ errorMessage }}</div>
    </section>
    <template #footer>
      <button class="bio-nexus-action bio-nexus-action-secondary" :disabled="saving" @click="close"><BioNexusActionIcon action="cancel" />Cancelar</button>
      <button class="bio-nexus-action bio-nexus-action-primary" :disabled="saveDisabled" :aria-disabled="String(saveDisabled)" :class="{ 'sample-type-save-disabled': saveDisabled }" @click="submit"><BioNexusActionIcon action="save" />{{ saving ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar' }}</button>
    </template>
  </BioNexusDialog>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusActionIcon from '@/components/ui/BioNexusActionIcon.vue'

const props = defineProps({ saving: Boolean, canCreate: Boolean, canUpdate: Boolean })
const emit = defineEmits(['submit'])
const dialog = ref(null)
const firstInput = ref(null)
const mode = ref('create')
const current = ref(null)
const attempted = ref(false)
const errorMessage = ref('')
const originalDescription = ref('')
const draft = reactive({ description: '' })
const normalizedDescription = computed(() => draft.description.trim())
const hasChanges = computed(() => mode.value === 'edit' && normalizedDescription.value !== originalDescription.value)
const descriptionError = computed(() => attempted.value && normalizedDescription.value === '' ? 'La descripcion es obligatoria.' : '')
const saveDisabled = computed(() => {
  if (props.saving) return true
  if (mode.value === 'create') return !props.canCreate
  return !props.canUpdate || !hasChanges.value
})

async function show() { await dialog.value?.open(); await nextTick(); firstInput.value?.focus() }
async function openCreate() {
  mode.value = 'create'
  current.value = null
  originalDescription.value = ''
  draft.description = ''
  attempted.value = false
  errorMessage.value = ''
  await show()
}
async function openEdit(row) {
  const initial = typeof row?.description === 'string' ? row.description.trim() : ''
  mode.value = 'edit'
  current.value = row
  originalDescription.value = initial
  draft.description = initial
  attempted.value = false
  errorMessage.value = ''
  await show()
}
function submit() {
  attempted.value = true
  if (normalizedDescription.value === '' || saveDisabled.value) return
  emit('submit', { mode: mode.value, record: current.value, values: { description: normalizedDescription.value } })
}
function close() { dialog.value?.close() }
function reset() { attempted.value = false; errorMessage.value = '' }
function setError(value) { errorMessage.value = String(value || '') }
function clearError() { errorMessage.value = '' }
defineExpose({ openCreate, openEdit, close, setError, clearError })
</script>

<style scoped>
.sample-type-form { display: grid; gap: var(--bio-nexus-space-3); }

.bio-nexus-action.sample-type-save-disabled,
.bio-nexus-action.sample-type-save-disabled:hover,
.bio-nexus-action.sample-type-save-disabled:focus,
.bio-nexus-action.sample-type-save-disabled:active,
.bio-nexus-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  filter: grayscale(0.35) saturate(0.45);
  box-shadow: none;
  pointer-events: none;
}
</style>
