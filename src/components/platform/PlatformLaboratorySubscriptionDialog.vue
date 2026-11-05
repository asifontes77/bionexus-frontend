<template>
  <BioNexusDialog ref="dialog" title="Suscripción del laboratorio" :subtitle="laboratoryName" size="wide" :prevent-close="saving">
    <div class="platform-dialog-content">
      <p v-if="error" class="platform-dialog-error" role="alert">{{ error }}</p>
      <p v-if="loading" class="platform-dialog-muted" role="status">Cargando suscripción y planes…</p>

      <template v-else>
        <section v-if="subscription" class="platform-subscription-snapshot" aria-labelledby="platform-subscription-snapshot-title">
          <div class="platform-subscription-heading">
            <div>
              <p class="platform-subscription-eyebrow">ESTADO ACTUAL</p>
              <h3 id="platform-subscription-snapshot-title">{{ subscription.planName || subscription.planCode || 'Sin plan comercial' }}</h3>
            </div>
            <span class="platform-subscription-status">{{ subscription.status }}</span>
          </div>
          <dl class="platform-subscription-details">
            <div><dt>Código</dt><dd>{{ subscription.planCode || '—' }}</dd></div>
            <div><dt>Precio del plan</dt><dd>{{ subscription.planPrice === null || subscription.planPrice === undefined ? '—' : `${subscription.planPrice} ${subscription.planCurrency || ''}` }}</dd></div>
            <div><dt>Periodicidad</dt><dd>{{ subscription.billingInterval || '—' }}</dd></div>
            <div><dt>Período</dt><dd>{{ formatDate(subscription.startsAt) }} – {{ formatDate(subscription.expiresAt) }}</dd></div>
            <div><dt>Días de gracia del plan</dt><dd>{{ snapshotGraceDays }}</dd></div>
            <div><dt>Fin de gracia</dt><dd>{{ formatDate(subscription.graceUntil) }}</dd></div>
            <div v-if="subscription.planDescription"><dt>Descripción</dt><dd>{{ subscription.planDescription }}</dd></div>
            <div v-if="subscription.statusReason"><dt>Motivo del estado</dt><dd>{{ subscription.statusReason }}</dd></div>
            <div v-if="subscription.suspensionReason"><dt>Motivo de suspensión</dt><dd>{{ subscription.suspensionReason }}</dd></div>
          </dl>
          <pre v-if="subscription.limitsBenefits" class="platform-subscription-benefits">{{ JSON.stringify(subscription.limitsBenefits, null, 2) }}</pre>
        </section>
        <p v-else class="platform-dialog-muted">Este laboratorio todavía no tiene una suscripción asignada.</p>

        <form class="platform-subscription-form" @submit.prevent="saveSubscription">
          <h3>{{ subscription ? 'Asignar plan y período' : 'Asignar primera suscripción' }}</h3>
          <div class="platform-subscription-fields">
            <BioNexusFormField v-if="form.status !== 'perpetual_free'" label="Plan comercial" field-id="platform-subscription-plan" required :error="fieldError">
              <select id="platform-subscription-plan" v-model="form.planCode" class="bio-nexus-field" :disabled="saving || plans.length === 0" required>
                <option value="" disabled>Seleccionar plan activo</option>
                <option v-for="plan in selectablePlans" :key="plan.planId" :value="plan.code">
                  {{ plan.name }} · {{ plan.code }}
                </option>
              </select>
            </BioNexusFormField>
            <BioNexusFormField label="Estado de suscripción" field-id="platform-subscription-status" required>
              <select id="platform-subscription-status" v-model="form.status" class="bio-nexus-field" :disabled="saving" required>
                <option value="" disabled>Seleccionar estado inicial</option>
                <option value="trial">Prueba (trial)</option>
                <option value="active">Activo (active)</option>
                <option value="perpetual_free">Vigencia indefinida (perpetual_free)</option>
              </select>
            </BioNexusFormField>
            <BioNexusFormField label="Inicio del período" field-id="platform-subscription-start" required>
              <input id="platform-subscription-start" v-model="form.startsAt" class="bio-nexus-field" type="date" :disabled="saving" required />
            </BioNexusFormField>
            <BioNexusFormField v-if="form.status !== 'perpetual_free'" label="Fin del período" field-id="platform-subscription-expiry" required>
              <input id="platform-subscription-expiry" v-model="form.expiresAt" class="bio-nexus-field" type="date" :disabled="saving" required />
            </BioNexusFormField>
            <BioNexusFormField v-if="form.status === 'perpetual_free'" label="Motivo de vigencia indefinida" field-id="platform-subscription-free-reason" required>
              <textarea id="platform-subscription-free-reason" v-model.trim="form.perpetualFreeReason" class="bio-nexus-field" rows="3" maxlength="500" :disabled="saving" required />
            </BioNexusFormField>
          </div>
          <div class="platform-subscription-actions">
            <BioNexusActionButton type="submit" label="Guardar suscripción" icon="save" variant="primary" :loading="saving" :disabled="form.status !== 'perpetual_free' && plans.length === 0" />
          </div>
        </form>

        <form v-if="subscription" class="platform-subscription-form" @submit.prevent="saveStatus">
          <h3>Cambiar estado operativo</h3>
          <div class="platform-subscription-fields">
            <BioNexusFormField label="Nuevo estado" field-id="platform-subscription-next-status" required>
              <select id="platform-subscription-next-status" v-model="statusForm.status" class="bio-nexus-field" :disabled="saving" required>
                <option value="" disabled>Seleccionar estado</option>
                <option v-for="status in operationalStatuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </BioNexusFormField>
            <BioNexusFormField v-if="['suspended', 'cancelled'].includes(statusForm.status)" label="Motivo" field-id="platform-subscription-status-reason" required>
              <textarea id="platform-subscription-status-reason" v-model.trim="statusForm.reason" class="bio-nexus-field" rows="2" maxlength="500" :disabled="saving" required />
            </BioNexusFormField>
          </div>
          <div class="platform-subscription-actions">
            <BioNexusActionButton type="submit" label="Actualizar estado" icon="sync" variant="secondary" :loading="saving" />
          </div>
        </form>

        <p v-if="plans.length === 0" class="platform-dialog-muted">No hay planes activos disponibles. Crea o activa un plan antes de asignar una suscripción.</p>
      </template>
    </div>
    <template #footer>
      <BioNexusActionButton label="Cerrar" icon="close" variant="secondary" :disabled="saving" @click="dialog?.close()" />
    </template>
  </BioNexusDialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import {
  createPlatformLaboratorySubscription,
  getPlatformLaboratorySubscription,
  getPlatformPlans,
  updatePlatformLaboratorySubscriptionStatus,
} from '@/services/platformBillingService'

const emit = defineEmits(['updated'])
const dialog = ref(null)
const laboratoryId = ref('')
const laboratoryName = ref('')
const plans = ref([])
const subscription = ref(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const fieldError = ref('')
const form = reactive({ planCode: '', status: '', startsAt: todayLocal(), expiresAt: '', perpetualFreeReason: '' })
const statusForm = reactive({ status: '', reason: '' })
const operationalStatuses = ['trial', 'active', 'grace', 'suspended', 'cancelled']
const selectablePlans = computed(() => plans.value.filter(plan => plan.isActive !== false))
const snapshotGraceDays = computed(() => {
  const value = subscription.value?.gracePeriodDays
  return Number.isInteger(value) ? `${value} días` : '—'
})

function todayLocal() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function toUtcDate(value) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es')
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [availablePlans, currentSubscription] = await Promise.all([
      getPlatformPlans(),
      getPlatformLaboratorySubscription(laboratoryId.value),
    ])
    plans.value = availablePlans
    subscription.value = currentSubscription
    const current = subscription.value
    Object.assign(form, {
      planCode: current?.planCode || '',
      status: ['trial', 'active', 'perpetual_free'].includes(current?.status) ? current.status : '',
      startsAt: dateInput(current?.startsAt) || todayLocal(),
      expiresAt: dateInput(current?.expiresAt),
      perpetualFreeReason: current?.perpetualFreeReason || '',
    })
    Object.assign(statusForm, { status: '', reason: '' })
    fieldError.value = ''
  } catch (cause) {
    plans.value = []
    subscription.value = null
    error.value = cause?.message || 'No fue posible consultar la suscripción.'
  } finally {
    loading.value = false
  }
}

async function open(laboratory) {
  laboratoryId.value = String(laboratory.id)
  laboratoryName.value = laboratory.name || ''
  await dialog.value?.open()
  await load()
}

async function saveSubscription() {
  if (saving.value) return
  fieldError.value = ''
  error.value = ''
  if (!['trial', 'active', 'perpetual_free'].includes(form.status)) {
    error.value = 'Selecciona un estado inicial válido.'
    return
  }
  if (form.status !== 'perpetual_free' && !form.planCode) {
    fieldError.value = 'Selecciona un plan comercial.'
    return
  }
  if (!form.startsAt) {
    error.value = 'Indica el inicio del período.'
    return
  }
  if (form.status !== 'perpetual_free' && !form.expiresAt) {
    error.value = 'Indica el fin del período.'
    return
  }
  if (form.status !== 'perpetual_free' && form.expiresAt < form.startsAt) {
    error.value = 'El fin del período no puede ser anterior a su inicio.'
    return
  }
  if (form.status === 'perpetual_free' && !form.perpetualFreeReason) {
    error.value = 'Indica el motivo de la vigencia indefinida.'
    return
  }
  const payload = {
    status: form.status,
    startsAt: toUtcDate(form.startsAt),
    ...(form.status !== 'perpetual_free' ? { planCode: form.planCode, expiresAt: toUtcDate(form.expiresAt) } : {}),
    ...(form.status === 'perpetual_free' ? { perpetualFreeReason: form.perpetualFreeReason } : {}),
  }
  saving.value = true
  try {
    await createPlatformLaboratorySubscription(laboratoryId.value, payload)
    await load()
    emit('updated', laboratoryId.value)
  } catch (cause) {
    error.value = cause?.message || 'No fue posible guardar la suscripción.'
  } finally {
    saving.value = false
  }
}

async function saveStatus() {
  if (saving.value || !subscription.value) return
  error.value = ''
  if (!operationalStatuses.includes(statusForm.status)) {
    error.value = 'Selecciona un estado operativo válido.'
    return
  }
  if (['suspended', 'cancelled'].includes(statusForm.status) && !statusForm.reason.trim()) {
    error.value = 'El motivo es obligatorio para suspender o cancelar la suscripción.'
    return
  }
  const payload = {
    status: statusForm.status,
    ...(statusForm.reason.trim() ? { reason: statusForm.reason.trim() } : {}),
  }
  saving.value = true
  try {
    await updatePlatformLaboratorySubscriptionStatus(laboratoryId.value, payload)
    await load()
    emit('updated', laboratoryId.value)
  } catch (cause) {
    error.value = cause?.message || 'No fue posible cambiar el estado de la suscripción.'
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.platform-dialog-content{display:grid;gap:16px;padding:16px}.platform-dialog-error{margin:0;padding:12px;border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-danger-soft);color:var(--bio-nexus-color-danger)}.platform-dialog-muted{margin:0;color:var(--bio-nexus-color-text-muted)}.platform-subscription-snapshot,.platform-subscription-form{display:grid;gap:14px;padding:16px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-surface)}.platform-subscription-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.platform-subscription-heading h3,.platform-subscription-form h3{margin:0;color:var(--bio-nexus-color-text-primary);font-size:17px}.platform-subscription-eyebrow{margin:0 0 5px;color:var(--bio-nexus-color-primary-strong);font-size:10px;font-weight:800;letter-spacing:.1em}.platform-subscription-status{padding:5px 9px;border-radius:999px;color:var(--bio-nexus-color-primary-strong);background:var(--bio-nexus-color-primary-soft);font-size:11px;font-weight:700}.platform-subscription-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0}.platform-subscription-details div{display:grid;gap:3px}.platform-subscription-details dt{color:var(--bio-nexus-color-text-muted);font-size:11px}.platform-subscription-details dd{margin:0;color:var(--bio-nexus-color-text-primary);font-size:13px;font-weight:600;overflow-wrap:anywhere}.platform-subscription-benefits{max-height:180px;margin:0;padding:10px;overflow:auto;border-radius:var(--bio-nexus-radius-sm);color:var(--bio-nexus-color-text-muted-strong);background:var(--bio-nexus-color-surface-muted);font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere}.platform-subscription-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}.platform-subscription-actions{display:flex;justify-content:flex-end}.platform-subscription-form h3{font-size:15px}@media(max-width:620px){.platform-subscription-details,.platform-subscription-fields{grid-template-columns:1fr}}
</style>
