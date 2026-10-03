<template>
  <BioNexusDialog ref="dialog" size="standard" :prevent-close="saving || dirty" :kicker="mode === 'create' ? 'Nuevo registro' : 'Editar registro'" :title="mode === 'create' ? 'Crear moneda' : 'Editar moneda'" @before-close="requestClose" @close="reset">
    <section class="currency-form-content">
      <BioNexusFormErrors :errors="errorMessage" />

      <BioNexusSectionPanel title="Información de la moneda" icon="payments" description="Define la identificación, presentación y precisión utilizada para los importes." variant="accent">
        <div class="currency-form">
          <BioNexusFormField label="Moneda" field-id="currency-code" :error="errors.code" help="Selecciona la moneda oficial que identificará los importes." required>
            <BioNexusSearchableSelect v-if="mode === 'create'" id="currency-code" ref="firstInput" v-model="draft.code" :options="currencyOptions" value-key="code" label-key="label" placeholder="Seleccione una moneda" search-placeholder="Buscar moneda..." empty-text="Sin monedas coincidentes" @change="selectCurrency" />
            <input v-else id="currency-code" ref="firstInput" :value="identity" class="bio-nexus-field readonly" readonly>
          </BioNexusFormField>

          <BioNexusFormField label="Nombre" field-id="currency-name" :error="errors.name" :help="draft.name.length + ' de 80 caracteres'" required>
            <input id="currency-name" v-model="draft.name" class="bio-nexus-field" maxlength="80" @input="syncDirty">
          </BioNexusFormField>

          <BioNexusFormField label="Símbolo" field-id="currency-symbol" :error="errors.symbol" :help="draft.symbol.length + ' de 12 caracteres'" required>
            <input id="currency-symbol" v-model="draft.symbol" class="bio-nexus-field" maxlength="12" @input="syncDirty">
          </BioNexusFormField>

          <BioNexusFormField label="Posición del símbolo" field-id="currency-position">
            <BioNexusSearchableSelect id="currency-position" v-model="draft.symbolPosition" :options="symbolPositionOptions" placeholder="Seleccione la posición" search-placeholder="Buscar posición..." @change="syncDirty" />
          </BioNexusFormField>

          <BioNexusFormField label="Decimales" field-id="currency-decimals" :error="errors.decimals" help="Cantidad de decimales mostrados, entre 0 y 6.">
            <input id="currency-decimals" v-model.number="draft.decimalPlaces" class="bio-nexus-field" type="number" min="0" max="6" @input="syncDirty">
          </BioNexusFormField>

          <div class="currency-preview" aria-live="polite">
            <span>Vista previa</span>
            <strong>{{ preview }}</strong>
          </div>
        </div>
      </BioNexusSectionPanel>
    </section>

    <template #footer>
      <BioNexusActionButton variant="secondary" icon="cancel" :disabled="saving" @click="requestClose">Cancelar</BioNexusActionButton>
      <BioNexusActionButton variant="primary" :icon="mode === 'create' ? 'create' : 'save'" :loading="saving" :disabled="submitDisabled" @click="submit">{{ mode === 'create' ? 'Crear' : 'Guardar' }}</BioNexusActionButton>
    </template>
  </BioNexusDialog>
  <BioNexusConfirmDialog ref="discardDialog" />
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusConfirmDialog from '@/components/ui/BioNexusConfirmDialog.vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusFormErrors from '@/components/ui/BioNexusFormErrors.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusSectionPanel from '@/components/ui/BioNexusSectionPanel.vue'
import BioNexusSearchableSelect from '@/components/ui/BioNexusSearchableSelect.vue'

const props = defineProps({ saving: Boolean, canCreate: Boolean, canUpdate: Boolean })
const emit = defineEmits(['submit'])
const dialog = ref(null)
const discardDialog = ref(null)
const firstInput = ref(null)
const mode = ref('create')
const current = ref(null)
const attempted = ref(false)
const errorMessage = ref('')
const original = ref('')
const dirty = ref(false)
const draft = reactive({ code: '', name: '', symbol: '', symbolPosition: 'before', decimalPlaces: 2 })
const options = [
  { code: 'VES', name: 'Bolívar venezolano', symbol: 'Bs.' },
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Libra esterlina', symbol: '£' },
  { code: 'COP', name: 'Peso colombiano', symbol: '$' },
  { code: 'BRL', name: 'Real brasileño', symbol: 'R$' },
  { code: 'MXN', name: 'Peso mexicano', symbol: '$' },
  { code: 'ARS', name: 'Peso argentino', symbol: '$' },
  { code: 'CLP', name: 'Peso chileno', symbol: '$' },
  { code: 'PEN', name: 'Sol peruano', symbol: 'S/' }
]
const currencyOptions = computed(() => options.map(option => ({ ...option, label: `${option.name} (${option.code})` })))
const symbolPositionOptions = Object.freeze([
  { value: 'before', label: 'Antes del monto' },
  { value: 'after', label: 'Después del monto' }
])

const values = computed(() => ({
  code: String(draft.code || '').trim().toUpperCase(),
  name: String(draft.name || '').trim(),
  symbol: String(draft.symbol || '').trim(),
  symbolPosition: draft.symbolPosition,
  decimalPlaces: Number(draft.decimalPlaces)
}))
const identity = computed(() => `${current.value?.name || draft.name} (${current.value?.code || draft.code})`)
const preview = computed(() => draft.symbolPosition === 'after' ? `1.250,00 ${draft.symbol}` : `${draft.symbol} 1.250,00`)
const isValid = computed(() => /^[A-Z]{3}$/.test(values.value.code) && Boolean(values.value.name) && Boolean(values.value.symbol) && Number.isInteger(values.value.decimalPlaces) && values.value.decimalPlaces >= 0 && values.value.decimalPlaces <= 6)
const errors = computed(() => attempted.value ? {
  code: /^[A-Z]{3}$/.test(values.value.code) ? '' : 'Selecciona una moneda.',
  name: values.value.name ? '' : 'Ingresa el nombre de la moneda.',
  symbol: values.value.symbol ? '' : 'Ingresa el símbolo de la moneda.',
  decimals: Number.isInteger(values.value.decimalPlaces) && values.value.decimalPlaces >= 0 && values.value.decimalPlaces <= 6 ? '' : 'Los decimales deben estar entre 0 y 6.'
} : { code: '', name: '', symbol: '', decimals: '' })
const submitDisabled = computed(() => props.saving || !dirty.value || !isValid.value || (mode.value === 'create' ? !props.canCreate : !props.canUpdate))

function signature() { return JSON.stringify(values.value) }
function clearGeneralError() { errorMessage.value = '' }
function syncDirty() { clearGeneralError(); dirty.value = signature() !== original.value }
function assign(row) { Object.assign(draft, { code: row?.code || '', name: row?.name || '', symbol: row?.symbol || '', symbolPosition: row?.symbolPosition || 'before', decimalPlaces: Number(row?.decimalPlaces ?? 2) }) }
function selectCurrency(selected) { const item = selected?.code ? selected : options.find(option => option.code === draft.code); if (item) { draft.name = item.name; draft.symbol = item.symbol } syncDirty() }
async function show() { original.value = signature(); dirty.value = false; await dialog.value?.open(); await nextTick(); original.value = signature(); dirty.value = false; firstInput.value?.focus() }
async function openCreate() { mode.value = 'create'; current.value = null; assign(null); attempted.value = false; errorMessage.value = ''; await show() }
async function openEdit(row) { mode.value = 'edit'; current.value = row; assign(row); attempted.value = false; errorMessage.value = ''; await show() }
function submit() { attempted.value = true; if (Object.values(errors.value).some(Boolean) || submitDisabled.value) return; emit('submit', { mode: mode.value, record: current.value, values: values.value }) }
async function requestClose() { if (props.saving) return; if (dirty.value) { const confirmed = await discardDialog.value?.ask({ kicker: 'Confirmación', title: 'Descartar cambios', message: 'Hay cambios sin guardar. ¿Deseas salir y descartarlos?', icon: 'warning', variant: 'danger', confirmIcon: 'delete', confirmText: 'Sí, salir y descartar cambios', cancelText: 'Cancelar' }); if (!confirmed) return } dialog.value?.close() }
function close() { dialog.value?.close() }
function reset() { attempted.value = false; dirty.value = false; errorMessage.value = '' }
function setError(value) { errorMessage.value = String(value || '') }
function clearError() { errorMessage.value = '' }
defineExpose({ openCreate, openEdit, close, setError, clearError })
</script>

<style scoped>
.currency-form-content { display: grid; gap: var(--bio-nexus-space-4); }
.currency-form { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--bio-nexus-space-3); align-items: start; font: 400 13px var(--bio-nexus-font-family, Inter, Roboto, Arial, sans-serif); }
.readonly { background: var(--bio-nexus-color-surface-soft); cursor: not-allowed; }
.currency-preview { display: grid; gap: 2px; align-self: start; padding: 8px 12px; border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-sm); background: var(--bio-nexus-color-surface-soft); }
.currency-preview span { color: var(--bio-nexus-color-text-muted); font-size: 11px; }
@media (max-width: 620px) { .currency-form { grid-template-columns: 1fr; } }
</style>
