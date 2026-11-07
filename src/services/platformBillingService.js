import { adminApiDownload, adminApiRequest } from '@/api/adminApiClient'

const platformPath = '/api/platform'
const laboratoryPath = laboratoryId =>
  `${platformPath}/laboratories/${encodeURIComponent(laboratoryId)}`

function unwrapList(result, key, label) {
  if (!Array.isArray(result?.[key])) {
    throw new Error(`El servidor devolvió una respuesta de ${label} no válida.`)
  }
  return result[key]
}

function unwrapObject(result, key, label) {
  if (!result?.[key] || typeof result[key] !== 'object' || Array.isArray(result[key])) {
    throw new Error(`El servidor devolvió una respuesta de ${label} no válida.`)
  }
  return result[key]
}

const normalizePlanPayload = payload => ({
  code: payload.code,
  name: payload.name,
  description: payload.description,
  price: payload.price,
  currency: payload.currency,
  planType: payload.planType,
  intervalUnit: payload.intervalUnit,
  intervalCount: payload.intervalCount,
  gracePeriodDays: payload.gracePeriodDays,
  isActive: payload.isActive,
})
export const getPlatformPlans = async () =>
  unwrapList(await adminApiRequest(`${platformPath}/plans`), 'plans', 'planes')

export const createPlatformPlan = async payload =>
  unwrapObject(await adminApiRequest(`${platformPath}/plans`, { method: 'POST', body: normalizePlanPayload(payload) }), 'plan', 'plan')

export const updatePlatformPlan = async (planId, payload) =>
  unwrapObject(
    await adminApiRequest(`${platformPath}/plans/${encodeURIComponent(planId)}`, {
      method: 'PATCH',
      body: normalizePlanPayload(payload),
    }),
    'plan',
    'plan',
  )

export const getPlatformLaboratorySubscription = async laboratoryId =>
  unwrapObject(
    await adminApiRequest(`${laboratoryPath(laboratoryId)}/subscription`),
    'subscription',
    'suscripción',
  )

export const createPlatformLaboratorySubscription = async (laboratoryId, payload) =>
  unwrapObject(
    await adminApiRequest(`${laboratoryPath(laboratoryId)}/subscription`, {
      method: 'POST',
      body: payload,
    }),
    'subscription',
    'suscripción',
  )

export const updatePlatformLaboratorySubscriptionStatus = async (laboratoryId, payload) => {
  const result = await adminApiRequest(`${laboratoryPath(laboratoryId)}/subscription/status`, {
    method: 'PATCH',
    body: payload,
  })
  if (
    result?.subscriptionId == null
    || result?.laboratoryId == null
    || typeof result?.status !== 'string'
  ) {
    throw new Error('El servidor devolvió una respuesta de estado de suscripción no válida.')
  }
  return result
}

export const getPlatformLaboratoryPayments = async laboratoryId =>
  unwrapList(
    await adminApiRequest(`${laboratoryPath(laboratoryId)}/payments`),
    'payments',
    'pagos',
  )

export const createPlatformLaboratoryPayment = async (laboratoryId, payment, proof) => {
  const body = new FormData()
  body.append('payment', JSON.stringify(payment))
  if (proof) body.append('proof', proof)
  return unwrapObject(
    await adminApiRequest(`${laboratoryPath(laboratoryId)}/payments`, {
      method: 'POST',
      body,
    }),
    'payment',
    'pago',
  )
}

export const downloadPlatformLaboratoryPaymentProof = (laboratoryId, paymentId) =>
  adminApiDownload(
    `${laboratoryPath(laboratoryId)}/payments/${encodeURIComponent(paymentId)}/proof`,
  )
