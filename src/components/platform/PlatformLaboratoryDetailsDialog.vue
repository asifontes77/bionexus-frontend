<template>
  <BioNexusDialog
    ref="dialog"
    :title="editing ? 'Editar laboratorio' : 'Configuración del laboratorio'"
    :subtitle="laboratory?.name || ''"
    size="wide"
    :prevent-close="saving"
    @close="reset"
  >
    <div class="platform-dialog-content">
      <p v-if="error" class="platform-dialog-error" role="alert">{{ error }}</p>
      <p v-if="loading" class="platform-dialog-muted" role="status">Cargando configuración…</p>
      <template v-else-if="laboratory">
        <section class="platform-access" aria-label="Accesos del laboratorio">
          <h3>Accesos</h3>
          <p>
            Acceso de desarrollo:
            <a :href="accessUrls.development" target="_blank" rel="noopener noreferrer">{{ accessUrls.development }}</a>
          </p>
          <p>
            Acceso canónico:
            <a :href="accessUrls.canonical" target="_blank" rel="noopener noreferrer">{{ accessUrls.canonical }}</a>
          </p>
        </section>

        <section class="platform-detail-grid">
          <BioNexusFormField label="Modo de servicio" field-id="platform-lab-mode">
            <input id="platform-lab-mode" class="bio-nexus-field" :value="laboratory.service_mode || '—'" disabled />
          </BioNexusFormField>
          <BioNexusFormField label="RIF" field-id="platform-lab-rif">
            <input id="platform-lab-rif" v-model.trim="form.rif" class="bio-nexus-field" :disabled="!editing" maxlength="20" />
          </BioNexusFormField>
          <BioNexusFormField label="Nombre" field-id="platform-lab-name" required>
            <input id="platform-lab-name" v-model.trim="form.name" class="bio-nexus-field" :disabled="!editing" maxlength="50" />
          </BioNexusFormField>
          <BioNexusFormField label="Razón social" field-id="platform-lab-business-name">
            <input id="platform-lab-business-name" v-model.trim="form.business_name" class="bio-nexus-field" :disabled="!editing" maxlength="100" />
          </BioNexusFormField>
          <BioNexusFormField label="Dirección" field-id="platform-lab-address">
            <input id="platform-lab-address" v-model.trim="form.address" class="bio-nexus-field" :disabled="!editing" maxlength="200" />
          </BioNexusFormField>
          <BioNexusFormField label="Teléfono" field-id="platform-lab-phone">
            <input id="platform-lab-phone" v-model.trim="form.phone_1" class="bio-nexus-field" :disabled="!editing" maxlength="20" />
          </BioNexusFormField>
          <BioNexusFormField label="Correo" field-id="platform-lab-email">
            <input id="platform-lab-email" v-model.trim="form.email" class="bio-nexus-field" :disabled="!editing" maxlength="100" />
          </BioNexusFormField>
          <BioNexusFormField label="Código del plan" field-id="platform-lab-plan">
            <input id="platform-lab-plan" v-model.trim="form.plan_code" class="bio-nexus-field" :disabled="!editing" maxlength="80" />
          </BioNexusFormField>
          <BioNexusFormField label="Estado de suscripción" field-id="platform-lab-subscription-status">
            <select id="platform-lab-subscription-status" v-model="form.subscription_status" class="bio-nexus-field" :disabled="!editing" @change="handleSubscriptionStatusChange">
              <option v-if="!subscriptionStatuses.includes(form.subscription_status)" :value="form.subscription_status">{{ form.subscription_status }}</option>
              <option v-for="status in subscriptionStatuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </BioNexusFormField>
          <BioNexusFormField label="Fecha de registro / inicio" field-id="platform-lab-service-start">
            <input id="platform-lab-service-start" v-model="form.service_starts_at" class="bio-nexus-field" type="date" :disabled="!editing" />
          </BioNexusFormField>
          <BioNexusFormField v-if="form.subscription_status !== 'perpetual_free'" label="Fecha de expiración" field-id="platform-lab-service-expiry">
            <input id="platform-lab-service-expiry" v-model="form.service_expires_at" class="bio-nexus-field" type="date" :disabled="!editing" />
          </BioNexusFormField>
          <BioNexusFormField v-if="form.subscription_status !== 'perpetual_free' && (editing || laboratory.grace_until)" label="Fin del periodo de gracia (opcional)" field-id="platform-lab-grace-until">
            <input id="platform-lab-grace-until" v-model="form.grace_until" class="bio-nexus-field" type="date" :disabled="!editing" />
          </BioNexusFormField>
          <BioNexusFormField v-if="form.subscription_status === 'perpetual_free'" label="Motivo de vigencia indefinida" field-id="platform-lab-perpetual-reason" :required="editing">
            <textarea id="platform-lab-perpetual-reason" v-model.trim="form.perpetual_free_reason" class="bio-nexus-field" rows="3" maxlength="500" :disabled="!editing" />
          </BioNexusFormField>
          <BioNexusFormField v-if="!editing && laboratory.perpetual_free_granted_at" label="Concedida por / fecha" field-id="platform-lab-perpetual-audit">
            <input id="platform-lab-perpetual-audit" class="bio-nexus-field" :value="`${laboratory.perpetual_free_granted_by || '—'} / ${formatDate(laboratory.perpetual_free_granted_at)}`" disabled />
          </BioNexusFormField>
          <label class="platform-active-toggle">
            <input v-model="form.is_active" type="checkbox" :disabled="!editing" />
            Laboratorio activo
          </label>
          <BioNexusFormField v-if="editing" label="Notas comerciales" field-id="platform-lab-commercial-notes" class="platform-notes-field">
            <textarea id="platform-lab-commercial-notes" v-model.trim="form.commercial_notes" class="bio-nexus-field" rows="3" maxlength="2000" />
          </BioNexusFormField>
          <p v-else-if="laboratory.commercial_notes" class="platform-notes">{{ laboratory.commercial_notes }}</p>
        </section>
      </template>
    </div>
    <template #footer>
      <BioNexusActionButton label="Cerrar" icon="close" variant="secondary" :disabled="saving" @click="dialog?.close()" />
      <BioNexusActionButton v-if="!editing && laboratory" label="Editar" icon="edit" variant="primary" @click="editing = true" />
      <BioNexusActionButton v-else-if="editing" label="Guardar cambios" icon="save" variant="primary" :loading="saving" @click="save" />
    </template>
  </BioNexusDialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import BioNexusDialog from '@/components/ui/BioNexusDialog.vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import BioNexusFormField from '@/components/ui/BioNexusFormField.vue'
import { buildTenantAccessUrls } from '@/logic/tenantAccess'
import { getPlatformLaboratory, updatePlatformLaboratory } from '@/services/platformService'

const emit = defineEmits(['updated'])
const dialog = ref(null)
const loading = ref(false)
const saving = ref(false)
const editing = ref(false)
const error = ref('')
const laboratory = ref(null)
const form = reactive({})
const subscriptionStatuses = ['trial', 'active', 'grace', 'suspended', 'cancelled', 'perpetual_free']
const accessUrls = computed(() => buildTenantAccessUrls(
  laboratory.value?.access?.slug || laboratory.value?.laboratory?.access_slug || laboratory.value?.access_slug,
))

function dateInput(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('es')
}

function normalizeDetail(result) {
  const data = result?.laboratory || result
  laboratory.value = { ...data, access: result?.access || data?.access }
  Object.assign(form, {
    rif: data?.rif || '',
    name: data?.name || '',
    business_name: data?.business_name || data?.businessName || '',
    address: data?.address || '',
    phone_1: data?.phone_1 || data?.phone || '',
    email: data?.email || '',
    plan_code: data?.plan_code || '',
    subscription_status: data?.subscription_status || '',
    service_starts_at: dateInput(data?.service_starts_at),
    service_expires_at: dateInput(data?.service_expires_at),
    grace_until: data?.subscription_status === 'perpetual_free' ? '' : dateInput(data?.grace_until),
    perpetual_free_reason: data?.perpetual_free_reason || '',
    commercial_notes: data?.commercial_notes || '',
    is_active: data?.is_active === true,
  })
}

function handleSubscriptionStatusChange() {
  if (form.subscription_status === 'perpetual_free') form.grace_until = ''
}

async function open(laboratoryId, startEditing = false) {
  error.value = ''
  editing.value = startEditing
  laboratory.value = null
  loading.value = true
  await dialog.value?.open()
  try {
    normalizeDetail(await getPlatformLaboratory(laboratoryId))
  } catch (cause) {
    error.value = cause?.message || 'No fue posible consultar el laboratorio.'
  } finally {
    loading.value = false
  }
}

async function save() {
  if (saving.value || !laboratory.value) return
  error.value = ''
  if (!form.name.trim()) {
    error.value = 'El nombre del laboratorio es obligatorio.'
    return
  }
  if (['trial', 'active', 'grace'].includes(form.subscription_status)) {
    if (!form.service_starts_at || !form.service_expires_at) {
      error.value = 'Indique fecha de inicio y expiración para trial, active o grace.'
      return
    }
    if (form.service_expires_at < form.service_starts_at) {
      error.value = 'La expiración no puede ser anterior a la fecha de inicio.'
      return
    }
  }
  if (form.subscription_status === 'grace') {
    if (!form.grace_until) {
      error.value = 'Indique la fecha de fin del periodo de gracia.'
      return
    }
    if (form.grace_until <= form.service_expires_at) {
      error.value = 'El fin del periodo de gracia debe ser posterior a la fecha de expiración.'
      return
    }
  }
  if (form.subscription_status === 'perpetual_free' && !form.perpetual_free_reason.trim()) {
    error.value = 'El motivo es obligatorio para la vigencia indefinida.'
    return
  }

  const toUtc = value => value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null
  saving.value = true
  try {
    const updated = await updatePlatformLaboratory(laboratory.value.id, {
      rif: form.rif,
      name: form.name,
      business_name: form.business_name,
      address: form.address,
      phone_1: form.phone_1,
      email: form.email,
      is_active: form.is_active,
      plan_code: form.plan_code,
      subscription_status: form.subscription_status,
      service_starts_at: toUtc(form.service_starts_at),
      service_expires_at: form.subscription_status === 'perpetual_free' ? null : toUtc(form.service_expires_at),
      grace_until: form.subscription_status === 'perpetual_free' ? null : toUtc(form.grace_until),
      perpetual_free_reason: form.subscription_status === 'perpetual_free' ? form.perpetual_free_reason : null,
      commercial_notes: form.commercial_notes,
    })
    normalizeDetail({ ...updated, access: laboratory.value.access })
    editing.value = false
    emit('updated', laboratory.value)
  } catch (cause) {
    error.value = cause?.message || 'No fue posible guardar los cambios.'
  } finally {
    saving.value = false
  }
}

function reset() {
  error.value = ''
  editing.value = false
  laboratory.value = null
  Object.keys(form).forEach(key => delete form[key])
}

defineExpose({ open })
</script>

<style scoped>
.platform-dialog-content{display:grid;gap:16px;padding:16px}.platform-dialog-error{margin:0;padding:12px;border-radius:var(--bio-nexus-radius-md);background:var(--bio-nexus-color-danger-soft);color:var(--bio-nexus-color-danger)}.platform-dialog-muted{margin:0;color:var(--bio-nexus-color-text-muted)}.platform-access{display:grid;gap:6px;padding:12px;border:1px solid var(--bio-nexus-color-border);border-radius:var(--bio-nexus-radius-md);overflow-wrap:anywhere}.platform-access h3,.platform-access p{margin:0}.platform-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}.platform-active-toggle{display:flex;align-items:center;gap:8px;min-height:44px;color:var(--bio-nexus-color-text-primary)}.platform-notes-field,.platform-notes{grid-column:1/-1}.platform-notes{margin:0;color:var(--bio-nexus-color-text-muted);white-space:pre-wrap}@media(max-width:720px){.platform-detail-grid{grid-template-columns:1fr}}
</style>
