import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const service = readFileSync('src/services/platformBillingService.js', 'utf8')
const adminApi = readFileSync('src/api/adminApiClient.js', 'utf8')
const plansView = readFileSync('src/views/AdminPlansView.vue', 'utf8')
const paymentsView = readFileSync('src/views/AdminPaymentsView.vue', 'utf8')
const provisioning = readFileSync('src/components/platform/PlatformLaboratoryDialog.vue', 'utf8')
const platformService = readFileSync('src/services/platformService.js', 'utf8')
const subscriptionDialog = readFileSync('src/components/platform/PlatformLaboratorySubscriptionDialog.vue', 'utf8')
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

  it('envía planes con periodicidad, días de gracia y límites/beneficios como objeto', () => {
    for (const field of ['code:', 'name:', 'price:', 'currency:', 'billingInterval:', 'gracePeriodDays:', 'limitsBenefits,', 'isActive:']) {
      assert.ok(plansView.includes(field), field)
    }
    assert.match(plansView, /JSON\.parse\(limitsBenefitsText\.value\)/)
    assert.match(plansView, /Array\.isArray\(value\)/)
    assert.match(plansView, /plan\.planId/)
  })

  it('mantiene el lifecycle comercial fuera del PATCH del laboratorio y cubre alta y reasignación', () => {
    assert.match(provisioning, /getPlatformPlans/)
    assert.match(provisioning, /activePlans/)
    assert.match(provisioning, /form\.subscriptionStatus!=='perpetual_free'&&!activePlans\.value\.some/)
    assert.match(platformService, /\.\.\.\(planCode \? \{ plan_code: planCode \} : \{\}\)/)
    assert.match(platformService, /subscription_status: subscriptionStatus/)
    assert.ok(provisioning.includes("planCode:form.subscriptionStatus==='perpetual_free'?'':form.planCode"))
    assert.match(subscriptionDialog, /planCode: form\.planCode/)
    assert.match(subscriptionDialog, /form\.status !== 'perpetual_free' \? \{ planCode: form\.planCode/)
    assert.match(subscriptionDialog, /perpetualFreeReason: form\.perpetualFreeReason/)
    assert.match(subscriptionDialog, /subscription\.planName/)
    assert.match(subscriptionDialog, /subscription\.planPrice/)
    assert.match(subscriptionDialog, /subscription\.limitsBenefits/)
    assert.match(service, /\/subscription\/status/)
    assert.match(subscriptionDialog, /'suspended', 'cancelled'/)
  })

  it('registra pago multipart con idempotencia y limita comprobantes opcionales', () => {
    assert.match(service, /body\.append\('payment', JSON\.stringify\(payment\)\)/)
    assert.match(service, /body\.append\('proof', proof\)/)
    assert.match(adminApi, /options\.body instanceof FormData/)
    assert.match(adminApi, /headers\.delete\('Content-Type'\)/)
    assert.match(paymentsView, /idempotencyKey/)
    assert.match(paymentsView, /paidAt:/)
    assert.match(paymentsView, /periodStart:/)
    assert.match(paymentsView, /periodEnd:/)
    assert.match(paymentsView, /payment\.paymentId/)
    assert.match(paymentsView, /MAX_PROOF_SIZE = 10 \* 1024 \* 1024/)
    assert.match(paymentsView, /image\/png.*image\/jpeg.*image\/webp.*application\/pdf/)
    assert.match(paymentsView, /payment\.hasProof === true/)
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
