<template>
  <section class="admin-billing-page" aria-labelledby="admin-payments-title">
    <header class="admin-billing-heading admin-payments-heading">
      <div>
        <p class="admin-billing-eyebrow">ADMINISTRACIÓN DE PLATAFORMA</p>
        <h1 id="admin-payments-title">Pagos manuales</h1>
        <p>Registra pagos y períodos de servicio para cada laboratorio.</p>
      </div>
      <label class="admin-billing-field admin-payment-laboratory">
        <span>Laboratorio</span>
        <select v-model="selectedLaboratoryId" class="bio-nexus-field" :disabled="loadingLaboratories || saving || Boolean(downloadingPaymentId) || laboratories.length === 0" @change="changeLaboratory">
          <option value="" disabled>Seleccionar laboratorio</option>
          <option v-for="laboratory in laboratories" :key="laboratory.id" :value="String(laboratory.id)">
            {{ laboratory.name }} · {{ laboratory.rif }}
          </option>
        </select>
      </label>
    </header>

    <p v-if="error" class="admin-billing-error" role="alert">{{ error }}</p>
    <p v-if="proofError" class="admin-billing-error" role="alert">{{ proofError }}</p>
    <p v-if="notice" class="admin-billing-notice" role="status">{{ notice }}</p>

    <div v-if="selectedLaboratoryId" class="admin-payments-layout">
      <form class="admin-billing-card admin-payment-form" @submit.prevent="savePayment">
        <div class="admin-billing-card-heading">
          <div>
            <h2>Registrar pago</h2>
            <p>El registro del pago activa o renueva el período indicado.</p>
          </div>
        </div>

        <div class="admin-billing-fields">
          <label class="admin-billing-field">
            <span>Fecha de pago</span>
            <input v-model="form.paidAt" class="bio-nexus-field" type="date" required :disabled="saving" />
          </label>
          <label class="admin-billing-field">
            <span>Monto</span>
            <input v-model.number="form.amount" class="bio-nexus-field" type="number" min="0.01" step="0.01" required :disabled="saving" />
          </label>
          <label class="admin-billing-field">
            <span>Moneda (3 letras)</span>
            <input v-model.trim="form.currency" class="bio-nexus-field" maxlength="3" placeholder="USD" required :disabled="saving" @input="normalizeCurrency" />
          </label>
          <label class="admin-billing-field">
            <span>Método de pago</span>
            <input v-model.trim="form.method" class="bio-nexus-field" maxlength="100" required :disabled="saving" />
          </label>
          <label class="admin-billing-field admin-billing-field-wide">
            <span>Referencia (opcional)</span>
            <input v-model.trim="form.reference" class="bio-nexus-field" maxlength="200" :disabled="saving" />
          </label>
          <label class="admin-billing-field">
            <span>Inicio del período</span>
            <input v-model="form.periodStart" class="bio-nexus-field" type="date" required :disabled="saving" />
          </label>
          <label class="admin-billing-field">
            <span>Fin del período</span>
            <input v-model="form.periodEnd" class="bio-nexus-field" type="date" required :disabled="saving" />
          </label>
          <label class="admin-billing-field admin-billing-field-wide">
            <span>Comprobante opcional (PNG, JPEG, WebP o PDF; máximo 10 MiB)</span>
            <input
              class="bio-nexus-field admin-proof-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              :disabled="saving"
              @change="selectProof"
            />
            <small v-if="proof">{{ proof.name }} · {{ formatFileSize(proof.size) }}</small>
          </label>
        </div>

        <div class="admin-billing-form-actions">
          <BioNexusActionButton type="submit" label="Registrar pago" icon="payments" variant="primary" :loading="saving" :disabled="loadingPayments" />
        </div>
      </form>

      <section class="admin-billing-card admin-payment-list" aria-labelledby="admin-payment-list-title">
        <div class="admin-billing-card-heading">
          <div>
            <h2 id="admin-payment-list-title">Historial de pagos</h2>
            <p v-if="!loadingPayments">{{ payments.length }} {{ payments.length === 1 ? 'pago' : 'pagos' }}</p>
            <p v-else role="status">Cargando pagos…</p>
          </div>
          <BioNexusActionButton label="Actualizar" icon="refresh" variant="secondary" size="sm" :disabled="loadingPayments || saving" @click="loadPayments" />
        </div>
        <p v-if="!loadingPayments && payments.length === 0" class="admin-billing-empty">No hay pagos registrados para este laboratorio.</p>
        <div v-else class="admin-payment-list-items">
          <article v-for="payment in payments" :key="payment.paymentId" class="admin-payment-row">
            <div class="admin-payment-row-main">
              <strong>{{ formatAmount(payment.amount, payment.currency) }}</strong>
              <span>{{ payment.method }} · {{ formatDate(payment.paidAt) }}</span>
              <small>Período: {{ formatDate(payment.periodStart) }} – {{ formatDate(payment.periodEnd) }}</small>
              <small v-if="payment.reference">Referencia: {{ payment.reference }}</small>
            </div>
            <BioNexusActionButton
              v-if="payment.hasProof === true"
              label="Descargar comprobante"
              icon="download"
              variant="secondary"
              size="sm"
              :disabled="downloadingPaymentId === String(payment.id)"
              :loading="downloadingPaymentId === String(payment.id)"
              @click="downloadProof(payment)"
            />
          </article>
        </div>
      </section>
    </div>
    <p v-else-if="!loadingLaboratories" class="admin-billing-empty">Registra o selecciona un laboratorio para consultar pagos.</p>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import { getPlatformLaboratories } from '@/services/platformService'
import {
  createPlatformLaboratoryPayment,
  downloadPlatformLaboratoryPaymentProof,
  getPlatformLaboratoryPayments,
} from '@/services/platformBillingService'

const MAX_PROOF_SIZE = 10 * 1024 * 1024
const ALLOWED_PROOF_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
const laboratories = ref([])
const payments = ref([])
const selectedLaboratoryId = ref('')
const loadingLaboratories = ref(false)
const loadingPayments = ref(false)
const saving = ref(false)
const downloadingPaymentId = ref('')
const error = ref('')
const proofError = ref('')
const notice = ref('')
const proof = ref(null)
const form = reactive({
  paidAt: todayLocal(),
  amount: '',
  currency: '',
  method: '',
  reference: '',
  periodStart: todayLocal(),
  periodEnd: todayLocal(),
})
let idempotencyKey = ''
let idempotencySignature = ''
let paymentRequestSequence = 0

function todayLocal() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function toUtcDate(value) {
  return new Date(`${value}T00:00:00.000Z`).toISOString()
}

function createIdempotencyKey() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('El navegador no puede generar una clave segura para el registro del pago.')
  }
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return [...bytes].map((byte, index) => `${[4, 6, 8, 10].includes(index) ? '-' : ''}${byte.toString(16).padStart(2, '0')}`).join('')
}

function normalizeCurrency() {
  form.currency = form.currency.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
}

function changeLaboratory() {
  notice.value = ''
  payments.value = []
  loadPayments()
}

function selectProof(event) {
  proofError.value = ''
  const selected = event.target.files?.[0] || null
  if (!selected) {
    proof.value = null
    return
  }
  if (!ALLOWED_PROOF_TYPES.has(selected.type)) {
    event.target.value = ''
    proof.value = null
    proofError.value = 'El comprobante debe ser PNG, JPEG, WebP o PDF.'
    return
  }
  if (selected.size > MAX_PROOF_SIZE) {
    event.target.value = ''
    proof.value = null
    proofError.value = 'El comprobante no puede superar 10 MiB.'
    return
  }
  proof.value = selected
}

async function loadLaboratories() {
  loadingLaboratories.value = true
  error.value = ''
  try {
    const result = await getPlatformLaboratories()
    if (!Array.isArray(result)) throw new Error('El servidor devolvió una lista de laboratorios no válida.')
    laboratories.value = result
    if (result.length) {
      selectedLaboratoryId.value = String(result[0].id)
      await loadPayments()
    }
  } catch (cause) {
    error.value = cause?.message || 'No fue posible consultar los laboratorios.'
  } finally {
    loadingLaboratories.value = false
  }
}

async function loadPayments() {
  if (!selectedLaboratoryId.value) return
  const laboratoryId = selectedLaboratoryId.value
  const requestSequence = ++paymentRequestSequence
  loadingPayments.value = true
  error.value = ''
  try {
    const result = await getPlatformLaboratoryPayments(laboratoryId)
    if (requestSequence === paymentRequestSequence && selectedLaboratoryId.value === laboratoryId) {
      payments.value = result
    }
  } catch (cause) {
    if (requestSequence === paymentRequestSequence) {
      payments.value = []
      error.value = cause?.message || 'No fue posible consultar los pagos.'
    }
  } finally {
    if (requestSequence === paymentRequestSequence) loadingPayments.value = false
  }
}

async function savePayment() {
  if (saving.value || !selectedLaboratoryId.value) return
  error.value = ''
  proofError.value = ''
  notice.value = ''
  if (!form.paidAt || !form.periodStart || !form.periodEnd) {
    error.value = 'Indica la fecha de pago y el período del servicio.'
    return
  }
  if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
    error.value = 'El monto debe ser mayor que cero.'
    return
  }
  if (!/^[A-Z]{3}$/.test(form.currency)) {
    error.value = 'La moneda debe tener exactamente tres letras mayúsculas.'
    return
  }
  if (!form.method) {
    error.value = 'Indica el método de pago.'
    return
  }
  if (form.periodEnd < form.periodStart) {
    error.value = 'El fin del período no puede ser anterior a su inicio.'
    return
  }

  try {
    if (!idempotencyKey) idempotencyKey = createIdempotencyKey()
  } catch (cause) {
    error.value = cause.message
    return
  }

  const payload = {
    paidAt: toUtcDate(form.paidAt),
    amount: Number(form.amount),
    currency: form.currency,
    method: form.method,
    ...(form.reference ? { reference: form.reference } : {}),
    periodStart: toUtcDate(form.periodStart),
    periodEnd: toUtcDate(form.periodEnd),
  }
  const requestSignature = JSON.stringify({
    laboratoryId: selectedLaboratoryId.value,
    payment: payload,
    proof: proof.value ? { name: proof.value.name, size: proof.value.size, type: proof.value.type, lastModified: proof.value.lastModified } : null,
  })
  if (!idempotencyKey || requestSignature !== idempotencySignature) {
    try {
      idempotencyKey = createIdempotencyKey()
      idempotencySignature = requestSignature
    } catch (cause) {
      error.value = cause.message
      return
    }
  }
  payload.idempotencyKey = idempotencyKey
  saving.value = true
  try {
    await createPlatformLaboratoryPayment(selectedLaboratoryId.value, payload, proof.value)
    idempotencyKey = ''
    idempotencySignature = ''
    proof.value = null
    const fileInput = document.querySelector('.admin-proof-input')
    if (fileInput) fileInput.value = ''
    form.amount = ''
    form.reference = ''
    notice.value = 'Pago registrado; el período del servicio se actualizó.'
    await loadPayments()
  } catch (cause) {
    error.value = cause?.message || 'No fue posible registrar el pago.'
  } finally {
    saving.value = false
  }
}

async function downloadProof(payment) {
  const paymentId = String(payment.paymentId)
  downloadingPaymentId.value = paymentId
  error.value = ''
  try {
    const blob = await downloadPlatformLaboratoryPaymentProof(selectedLaboratoryId.value, payment.id)
    const extension = ({ 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[blob.type] || 'bin'
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comprobante-${paymentId.replace(/[^A-Za-z0-9._-]/g, '_')}.${extension}`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (cause) {
    error.value = cause?.message || 'No fue posible descargar el comprobante privado.'
  } finally {
    downloadingPaymentId.value = ''
  }
}

function formatAmount(amount, currency) {
  const value = Number(amount)
  return Number.isFinite(value) ? `${value.toLocaleString('es')} ${currency || ''}`.trim() : 'Monto no disponible'
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es')
}

function formatFileSize(size) {
  return `${(size / (1024 * 1024)).toFixed(2)} MiB`
}

onMounted(loadLaboratories)
</script>

<style scoped>
.admin-billing-page { display: grid; gap: 20px; }
.admin-billing-heading, .admin-billing-card-heading, .admin-payment-row, .admin-billing-form-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.admin-billing-heading h1 { margin: 4px 0 0; color: var(--bio-nexus-color-text-primary); font-size: clamp(26px, 4vw, 34px); }
.admin-billing-heading > div > p:last-child { margin: 7px 0 0; color: var(--bio-nexus-color-text-muted); }
.admin-billing-eyebrow { margin: 0; color: var(--bio-nexus-color-primary-strong); font-size: 11px; font-weight: 800; letter-spacing: .1em; }
.admin-billing-card { min-width: 0; padding: 20px; border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-lg); background: var(--bio-nexus-color-surface); box-shadow: 0 8px 24px rgb(21 55 87 / 5%); }
.admin-billing-card-heading h2 { margin: 0; color: var(--bio-nexus-color-text-primary); font-size: 18px; }
.admin-billing-card-heading p { margin: 5px 0 0; color: var(--bio-nexus-color-text-muted); font-size: 13px; }
.admin-payment-laboratory { width: min(390px, 44vw); }
.admin-payments-layout { display: grid; grid-template-columns: minmax(320px, .9fr) minmax(0, 1.1fr); align-items: start; gap: 16px; }
.admin-payment-form, .admin-payment-list { display: grid; gap: 16px; }
.admin-billing-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
.admin-billing-field { display: grid; gap: 6px; min-width: 0; color: var(--bio-nexus-color-text-primary); font-size: 13px; font-weight: 650; }
.admin-billing-field-wide { grid-column: 1 / -1; }
.admin-billing-field small { color: var(--bio-nexus-color-text-muted); font-weight: 400; overflow-wrap: anywhere; }
.admin-proof-input { min-width: 0; }
.admin-billing-form-actions { justify-content: flex-end; flex-wrap: wrap; }
.admin-payment-list-items { display: grid; gap: 10px; }
.admin-payment-row { align-items: flex-start; padding: 13px; border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); }
.admin-payment-row-main { display: grid; min-width: 0; gap: 5px; }
.admin-payment-row-main strong { color: var(--bio-nexus-color-text-primary); }
.admin-payment-row-main span, .admin-payment-row-main small { color: var(--bio-nexus-color-text-muted); font-size: 12px; overflow-wrap: anywhere; }
.admin-billing-error { margin: 0; padding: 12px 14px; border-radius: var(--bio-nexus-radius-md); color: var(--bio-nexus-color-danger); background: var(--bio-nexus-color-danger-soft); overflow-wrap: anywhere; }
.admin-billing-notice { margin: 0; padding: 12px 14px; border-radius: var(--bio-nexus-radius-md); color: var(--bio-nexus-color-primary-strong); background: var(--bio-nexus-color-primary-soft); }
.admin-billing-empty { margin: 0; padding: 18px; border-radius: var(--bio-nexus-radius-md); color: var(--bio-nexus-color-text-muted); background: var(--bio-nexus-color-surface-muted); text-align: center; }
@media (max-width: 900px) { .admin-payments-layout { grid-template-columns: 1fr; } }
@media (max-width: 620px) {
  .admin-payments-heading, .admin-payment-row { align-items: flex-start; flex-direction: column; }
  .admin-payment-laboratory { width: 100%; }
  .admin-billing-fields { grid-template-columns: 1fr; }
  .admin-billing-field-wide { grid-column: auto; }
}
</style>
