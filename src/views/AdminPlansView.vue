<template>
  <section class="admin-billing-page" aria-labelledby="admin-plans-title">
    <header class="admin-billing-heading">
      <div>
        <p class="admin-billing-eyebrow">ADMINISTRACIÓN DE PLATAFORMA</p>
        <h1 id="admin-plans-title">Planes comerciales</h1>
      </div>
      <BioNexusActionButton label="Nuevo plan" icon="add" variant="primary" :disabled="saving" @click="startCreate" />
    </header>

    <p v-if="error" class="admin-billing-error" role="alert">{{ error }}</p>
    <p v-if="notice" class="admin-billing-notice" role="status">{{ notice }}</p>
    <p v-if="loading" class="admin-billing-status" role="status">Cargando planes…</p>

    <div class="admin-plans-layout">
      <form class="admin-billing-card admin-plan-form" @submit.prevent="savePlan">
        <div class="admin-billing-card-heading">
          <div>
            <h2>{{ editingPlanId ? 'Editar plan' : 'Crear plan' }}</h2>
            <p>Configura precio, periodicidad, días de gracia y beneficios del plan.</p>
          </div>
        </div>

        <div class="admin-billing-fields">
          <label class="admin-billing-field">
            <span>Código</span>
            <input v-model.trim="form.code" class="bio-nexus-field" maxlength="80" required :disabled="saving" />
          </label>
          <label class="admin-billing-field">
            <span>Nombre</span>
            <input v-model.trim="form.name" class="bio-nexus-field" maxlength="120" required :disabled="saving" />
          </label>
          <label class="admin-billing-field admin-billing-field-wide">
            <span>Descripción (opcional)</span>
            <textarea v-model.trim="form.description" class="bio-nexus-field" rows="2" maxlength="1000" :disabled="saving" />
          </label>
          <label class="admin-billing-field">
            <span>Precio</span>
            <input v-model.number="form.price" class="bio-nexus-field" type="number" min="0" step="0.01" required :disabled="saving" />
          </label>
          <label class="admin-billing-field">
            <span>Moneda (3 letras)</span>
            <input v-model.trim="form.currency" class="bio-nexus-field" maxlength="3" placeholder="USD" required :disabled="saving" @input="normalizeCurrency" />
          </label>
          <label class="admin-billing-field">
            <span>Periodicidad</span>
            <select v-model="form.billingInterval" class="bio-nexus-field" :disabled="saving">
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </label>
          <label class="admin-billing-field">
            <span>Días de gracia</span>
            <input v-model.number="form.gracePeriodDays" class="bio-nexus-field" type="number" min="0" step="1" required :disabled="saving" />
          </label>
          <label class="admin-billing-field admin-billing-field-wide">
            <span>Límites y beneficios (objeto JSON)</span>
            <textarea v-model="limitsBenefitsText" class="bio-nexus-field admin-json-field" rows="5" spellcheck="false" :disabled="saving" />
          </label>
          <label class="admin-billing-checkbox">
            <input v-model="form.isActive" type="checkbox" :disabled="saving" />
            <span>Plan activo y disponible para suscripciones</span>
          </label>
        </div>

        <div class="admin-billing-form-actions">
          <BioNexusActionButton v-if="editingPlanId" label="Cancelar edición" variant="secondary" :disabled="saving" @click="startCreate" />
          <BioNexusActionButton type="submit" :label="editingPlanId ? 'Guardar cambios' : 'Crear plan'" icon="save" variant="primary" :loading="saving" />
        </div>
      </form>

      <section class="admin-billing-card admin-plan-list" aria-labelledby="admin-plan-list-title">
        <div class="admin-billing-card-heading">
          <div>
            <h2 id="admin-plan-list-title">Planes registrados</h2>
            <p>{{ plans.length }} {{ plans.length === 1 ? 'plan' : 'planes' }}</p>
          </div>
          <BioNexusActionButton label="Actualizar" icon="refresh" variant="secondary" size="sm" :disabled="loading || saving" @click="loadPlans" />
        </div>
        <p v-if="!loading && plans.length === 0" class="admin-billing-empty">Todavía no hay planes comerciales.</p>
        <div v-else class="admin-plan-cards">
          <article v-for="plan in plans" :key="plan.planId" class="admin-plan-row">
            <div class="admin-plan-main">
              <div class="admin-plan-title">
                <h3>{{ plan.name }}</h3>
                <span :class="['admin-plan-status', { 'admin-plan-status-inactive': plan.isActive === false }]">
                  {{ plan.isActive === false ? 'Inactivo' : 'Activo' }}
                </span>
              </div>
              <p class="admin-plan-code">{{ plan.code }}</p>
              <p v-if="plan.description" class="admin-plan-description">{{ plan.description }}</p>
              <p class="admin-plan-meta">
                {{ formatPrice(plan.price, plan.currency) }} · {{ intervalLabel(plan.billingInterval) }}
                · {{ plan.gracePeriodDays }} días de gracia
              </p>
            </div>
            <BioNexusActionButton label="Editar" icon="edit" variant="secondary" size="sm" :disabled="saving" @click="editPlan(plan)" />
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import BioNexusActionButton from '@/components/ui/BioNexusActionButton.vue'
import { createPlatformPlan, getPlatformPlans, updatePlatformPlan } from '@/services/platformBillingService'

const blankForm = () => ({
  code: '',
  name: '',
  description: '',
  price: 0,
  currency: '',
  billingInterval: 'monthly',
  gracePeriodDays: 0,
  isActive: true,
})

const plans = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const editingPlanId = ref('')
const form = reactive(blankForm())
const limitsBenefitsText = ref('{}')

function startCreate() {
  editingPlanId.value = ''
  Object.assign(form, blankForm())
  limitsBenefitsText.value = '{}'
  error.value = ''
  notice.value = ''
}

function normalizeCurrency() {
  form.currency = form.currency.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
}

function editPlan(plan) {
  editingPlanId.value = String(plan.planId)
  Object.assign(form, {
    code: plan.code,
    name: plan.name,
    description: plan.description || '',
    price: Number(plan.price),
    currency: plan.currency,
    billingInterval: plan.billingInterval,
    gracePeriodDays: Number(plan.gracePeriodDays),
    isActive: plan.isActive !== false,
  })
  limitsBenefitsText.value = JSON.stringify(plan.limitsBenefits ?? {}, null, 2)
  error.value = ''
  notice.value = ''
}

function parseLimitsBenefits() {
  let value
  try {
    value = JSON.parse(limitsBenefitsText.value)
  } catch {
    throw new Error('Límites y beneficios debe ser un objeto JSON válido.')
  }
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    throw new Error('Límites y beneficios debe ser un objeto JSON.')
  }
  return value
}

function validateForm() {
  if (!form.code || !form.name) throw new Error('Indica el código y el nombre del plan.')
  if (!Number.isFinite(form.price) || form.price < 0) throw new Error('El precio debe ser un número igual o mayor que cero.')
  if (!/^[A-Z]{3}$/.test(form.currency)) throw new Error('La moneda debe tener exactamente tres letras mayúsculas.')
  if (!['monthly', 'yearly'].includes(form.billingInterval)) throw new Error('Selecciona una periodicidad válida.')
  if (!Number.isInteger(form.gracePeriodDays) || form.gracePeriodDays < 0) throw new Error('Los días de gracia deben ser un entero igual o mayor que cero.')
  return parseLimitsBenefits()
}

async function loadPlans() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    plans.value = await getPlatformPlans()
  } catch (cause) {
    plans.value = []
    error.value = cause?.message || 'No fue posible consultar los planes.'
  } finally {
    loading.value = false
  }
}

async function savePlan() {
  if (saving.value) return
  error.value = ''
  let limitsBenefits
  try {
    limitsBenefits = validateForm()
  } catch (cause) {
    error.value = cause.message
    return
  }

  const payload = {
    code: form.code,
    name: form.name,
    description: form.description,
    price: form.price,
    currency: form.currency,
    billingInterval: form.billingInterval,
    gracePeriodDays: form.gracePeriodDays,
    limitsBenefits,
    isActive: form.isActive,
  }
  const successMessage = editingPlanId.value ? 'Plan actualizado correctamente.' : 'Plan creado correctamente.'
  saving.value = true
  try {
    if (editingPlanId.value) await updatePlatformPlan(editingPlanId.value, payload)
    else await createPlatformPlan(payload)
    startCreate()
    notice.value = successMessage
    await loadPlans()
  } catch (cause) {
    error.value = cause?.message || 'No fue posible guardar el plan.'
  } finally {
    saving.value = false
  }
}

function formatPrice(price, currency) {
  const value = Number(price)
  return Number.isFinite(value) ? `${value.toLocaleString('es')} ${currency || ''}`.trim() : 'Precio no disponible'
}

function intervalLabel(value) {
  return value === 'yearly' ? 'Anual' : 'Mensual'
}

onMounted(loadPlans)
</script>

<style scoped>
.admin-billing-page { display: grid; gap: 20px; }
.admin-billing-heading, .admin-billing-card-heading, .admin-plan-row, .admin-plan-title, .admin-billing-form-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.admin-billing-heading h1 { margin: 4px 0 0; color: var(--bio-nexus-color-text-primary); font-size: clamp(26px, 4vw, 34px); }
.admin-billing-eyebrow { margin: 0; color: var(--bio-nexus-color-primary-strong); font-size: 11px; font-weight: 800; letter-spacing: .1em; }
.admin-billing-card { min-width: 0; padding: 20px; border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-lg); background: var(--bio-nexus-color-surface); box-shadow: 0 8px 24px rgb(21 55 87 / 5%); }
.admin-billing-card-heading h2 { margin: 0; color: var(--bio-nexus-color-text-primary); font-size: 18px; }
.admin-billing-card-heading p { margin: 5px 0 0; color: var(--bio-nexus-color-text-muted); font-size: 13px; }
.admin-plans-layout { display: grid; grid-template-columns: minmax(320px, .9fr) minmax(0, 1.1fr); align-items: start; gap: 16px; }
.admin-plan-form { display: grid; gap: 16px; }
.admin-billing-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
.admin-billing-field { display: grid; gap: 6px; min-width: 0; color: var(--bio-nexus-color-text-primary); font-size: 13px; font-weight: 650; }
.admin-billing-field-wide { grid-column: 1 / -1; }
.admin-json-field { font-family: ui-monospace, Consolas, monospace; font-size: 12px; }
.admin-billing-checkbox { display: flex; align-items: center; gap: 8px; grid-column: 1 / -1; color: var(--bio-nexus-color-text-primary); font-size: 13px; }
.admin-billing-checkbox input { accent-color: var(--bio-nexus-color-primary); }
.admin-billing-form-actions { justify-content: flex-end; flex-wrap: wrap; }
.admin-plan-list { display: grid; gap: 14px; }
.admin-plan-cards { display: grid; gap: 10px; }
.admin-plan-row { align-items: flex-start; padding: 13px; border: 1px solid var(--bio-nexus-color-border); border-radius: var(--bio-nexus-radius-md); }
.admin-plan-main { display: grid; min-width: 0; gap: 5px; }
.admin-plan-title { justify-content: flex-start; flex-wrap: wrap; }
.admin-plan-title h3 { margin: 0; color: var(--bio-nexus-color-text-primary); font-size: 15px; }
.admin-plan-code, .admin-plan-description, .admin-plan-meta { margin: 0; overflow-wrap: anywhere; }
.admin-plan-code { color: var(--bio-nexus-color-text-muted); font-size: 12px; }
.admin-plan-description, .admin-plan-meta { color: var(--bio-nexus-color-text-muted-strong); font-size: 12px; }
.admin-plan-status, .admin-billing-status { color: var(--bio-nexus-color-success, #16794b); font-size: 11px; font-weight: 700; }
.admin-plan-status { padding: 4px 8px; border-radius: 999px; background: var(--bio-nexus-color-success-soft, #e8f5ee); }
.admin-plan-status-inactive { color: var(--bio-nexus-color-text-muted); background: var(--bio-nexus-color-surface-muted); }
.admin-billing-error { margin: 0; padding: 12px 14px; border-radius: var(--bio-nexus-radius-md); color: var(--bio-nexus-color-danger); background: var(--bio-nexus-color-danger-soft); overflow-wrap: anywhere; }
.admin-billing-notice { margin: 0; padding: 12px 14px; border-radius: var(--bio-nexus-radius-md); color: var(--bio-nexus-color-primary-strong); background: var(--bio-nexus-color-primary-soft); }
.admin-billing-empty { margin: 0; padding: 18px; border-radius: var(--bio-nexus-radius-md); color: var(--bio-nexus-color-text-muted); background: var(--bio-nexus-color-surface-muted); text-align: center; }
@media (max-width: 900px) { .admin-plans-layout { grid-template-columns: 1fr; } }
@media (max-width: 560px) {
  .admin-billing-heading, .admin-plan-row { align-items: flex-start; flex-direction: column; }
  .admin-billing-fields { grid-template-columns: 1fr; }
  .admin-billing-field-wide, .admin-billing-checkbox { grid-column: auto; }
}
</style>
