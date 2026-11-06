import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const service = readFileSync('src/services/platformBillingService.js', 'utf8')
const adminApi = readFileSync('src/api/adminApiClient.js', 'utf8')
const plansView = readFileSync('src/views/AdminPlansView.vue', 'utf8')
const planFormDialog = readFileSync('src/components/platform/PlatformPlanFormDialog.vue', 'utf8')
const planDetailDialog = readFileSync('src/components/platform/PlatformPlanDetailDialog.vue', 'utf8')
const paymentsView = readFileSync('src/views/AdminPaymentsView.vue', 'utf8')
const paymentFormDialog = readFileSync('src/components/platform/PlatformPaymentFormDialog.vue', 'utf8')
const provisioning = readFileSync('src/components/platform/PlatformLaboratoryDialog.vue', 'utf8')
const platformService = readFileSync('src/services/platformService.js', 'utf8')
const subscriptionDialog = readFileSync('src/components/platform/PlatformLaboratorySubscriptionDialog.vue', 'utf8')
const laboratoriesView = readFileSync('src/views/PlatformLaboratoriesView.vue', 'utf8')
const router = readFileSync('src/router/index.js', 'utf8')

describe('Contratos de planes, suscripciones y pagos de plataforma', () => {
  it('usa prefijo /api y los wrappers contractuales para planes y pagos', () => {
    assert.match(service, /const platformPath = '\/api\/platform'/)
    assert.match(service, /`\/api\/platform\/plans`|`\$\{platformPath\}\/plans`/)
    assert.match(service, /'plans', 'planes'/)
    assert.match(service, /'payments',\s*'pagos'/)
    assert.match(service, /'plan', 'plan'/)
    assert.match(service, /'payment',\s*'pago'/)
    assert.match(service, /plans\/\$\{encodeURIComponent\(planId\)\}/)
  })

  it('presenta planes en grid y usa dialogs compartidos para crear, ver, editar y cambiar estado', () => {
    assert.match(plansView, /BioNexusDataGrid/)
    assert.match(plansView, /BioNexusGridActionsCell/)
    assert.match(plansView, /BioNexusGridToggleCell/)
    assert.match(plansView, /BioNexusStateDialog/)
    assert.match(plansView, /key:'view'/)
    assert.match(plansView, /key:'edit'/)
    assert.match(planFormDialog, /BioNexusDialog/)
    assert.match(planFormDialog, /BioNexusSectionPanel/)
    assert.match(planFormDialog, /BioNexusConfirmDialog/)
    assert.match(planDetailDialog, /BioNexusSectionPanel/)
  })
  it('envía planes con periodicidad, días de gracia y límites/beneficios como objeto', () => {
    for (const field of [
      'code:draft.code.trim()',
      'name:draft.name.trim()',
      'price:Number(draft.price)',
      'currency:draft.currency.trim()',
      'billingInterval:draft.billingInterval',
      'gracePeriodDays:Number(draft.gracePeriodDays)',
      'limitsBenefits:parseBenefits(false)',
      'isActive:Boolean(draft.isActive)',
    ]) {
      assert.ok(planFormDialog.includes(field), field)
    }
    assert.match(planFormDialog, /JSON\.parse\(limitsBenefitsText\.value\)/)
    assert.match(planFormDialog, /Array\.isArray\(value\)/)
    assert.match(plansView, /createPlatformPlan\(payload\.values\)/)
    assert.match(plansView, /updatePlatformPlan\(payload\.record\.planId,payload\.values\)/)
  })

  it('mantiene el lifecycle comercial fuera del PATCH del laboratorio y cubre alta y reasignación', () => {
    assert.doesNotMatch(laboratoriesView, /planCode\s*:/)
    assert.doesNotMatch(laboratoriesView, /subscriptionStatus\s*:/)
    assert.doesNotMatch(laboratoriesView, /serviceStartsAt\s*:/)
    assert.doesNotMatch(laboratoriesView, /serviceExpiresAt\s*:/)
    assert.match(subscriptionDialog, /createPlatformLaboratorySubscription/)
    assert.match(subscriptionDialog, /updatePlatformLaboratorySubscriptionStatus/)
    assert.ok(subscriptionDialog.includes('status:form.status'))
    assert.ok(subscriptionDialog.includes('startsAt:toUtcDate(form.startsAt)'))
    assert.ok(subscriptionDialog.includes('planCode:form.planCode'))
    assert.ok(subscriptionDialog.includes('expiresAt:toUtcDate(form.expiresAt)'))
    assert.ok(subscriptionDialog.includes('perpetualFreeReason:form.perpetualFreeReason.trim()'))
    for (const status of ['trial', 'active', 'grace', 'suspended', 'cancelled']) {
      assert.ok(subscriptionDialog.includes(`'${status}'`), status)
    }
  })

  it('presenta pagos en grid y registra mediante dialog protegido', () => {
    assert.match(paymentsView, /BioNexusDataGrid/)
    assert.match(paymentsView, /BioNexusGridActionsCell/)
    assert.match(paymentsView, /BioNexusSearchableSelect/)
    assert.match(paymentsView, /PlatformPaymentFormDialog/)
    assert.match(paymentFormDialog, /BioNexusDialog/)
    assert.match(paymentFormDialog, /BioNexusSectionPanel/)
    assert.match(paymentFormDialog, /BioNexusConfirmDialog/)
  })
  it('registra pago multipart con idempotencia y limita comprobantes opcionales', () => {
    assert.match(paymentFormDialog, /idempotencyKey/)
    assert.match(paymentFormDialog, /createIdempotencyKey/)
    assert.match(paymentFormDialog, /paidAt:toUtcDate/)
    assert.match(paymentFormDialog, /periodStart:toUtcDate/)
    assert.match(paymentFormDialog, /periodEnd:toUtcDate/)
    assert.match(paymentFormDialog, /MAX_PROOF_SIZE=10\*1024\*1024/)
    for (const mediaType of ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']) {
      assert.ok(paymentFormDialog.includes(mediaType), mediaType)
    }
    assert.match(paymentsView, /createPlatformLaboratoryPayment\(selectedLaboratoryId\.value,payload\.values,payload\.proof\)/)
    assert.match(paymentsView, /downloadPlatformLaboratoryPaymentProof\(selectedLaboratoryId\.value,payment\.paymentId\)/)
  })

  it('descarga comprobantes solo por ruta autenticada y no publica referencias', () => {
    assert.match(service, /adminApiDownload/)
    assert.match(service, /payments\/\$\{encodeURIComponent\(paymentId\)\}\/proof/)
    assert.match(adminApi, /Authorization.*Bearer \$\{token\}/)
    assert.match(adminApi, /return response\.blob\(\)/)
    assert.doesNotMatch(paymentsView, /public\/|publicUrl|proofStorageKey/)
  })

  it('registra planes y pagos solo bajo rutas protegidas de administrador', () => {
    assert.match(router, /path: "plans"[\s\S]*?name: "admin-plans"/)
    assert.match(router, /path: "payments"[\s\S]*?name: "admin-payments"/)
    assert.match(router, /meta: \{ requiresAdminAuth: true, title: "Planes comerciales" \}/)
    assert.match(router, /meta: \{ requiresAdminAuth: true, title: "Pagos manuales" \}/)
  })
})
