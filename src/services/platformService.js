import { adminApiRequest } from '@/api/adminApiClient'

const laboratoryPath = laboratoryId =>
  `/api/platform/laboratories/${encodeURIComponent(laboratoryId)}`

export const getPlatformLaboratories = () => adminApiRequest('/api/platform/laboratories')
export const getPlatformModules = () => adminApiRequest('/api/platform/modules')

export const getPlatformLaboratory = laboratoryId =>
  adminApiRequest(laboratoryPath(laboratoryId))

export const updatePlatformLaboratory = (laboratoryId, payload) =>
  adminApiRequest(laboratoryPath(laboratoryId), {
    method: 'PATCH',
    body: payload
  })

export const getPlatformLaboratoryPackages = laboratoryId =>
  adminApiRequest(`${laboratoryPath(laboratoryId)}/packages`)

export const installPlatformLaboratoryPackage = (laboratoryId, packageCode) =>
  adminApiRequest(`${laboratoryPath(laboratoryId)}/packages`, {
    method: 'POST',
    body: { packageCode }
  })

export const removePlatformLaboratoryPackage = (laboratoryId, packageCode) =>
  adminApiRequest(`${laboratoryPath(laboratoryId)}/packages/${encodeURIComponent(packageCode)}`, {
    method: 'DELETE'
  })

export const getPlatformLaboratoryBranches = laboratoryId =>
  adminApiRequest(`${laboratoryPath(laboratoryId)}/branches`)

export const createPlatformLaboratoryBranch = (laboratoryId, payload) =>
  adminApiRequest(`${laboratoryPath(laboratoryId)}/branches`, {
    method: 'POST',
    body: payload
  })

export const removePlatformLaboratoryBranch = (laboratoryId, branchId) =>
  adminApiRequest(`${laboratoryPath(laboratoryId)}/branches/${encodeURIComponent(branchId)}`, {
    method: 'DELETE'
  })

export const deletePlatformLaboratory = (laboratoryId, password) =>
  adminApiRequest(laboratoryPath(laboratoryId), {
    method: 'DELETE',
    body: { password }
  })

export const createPlatformLaboratory = payload => {
  const {
    accessSlug,
    planCode,
    subscriptionStatus,
    serviceStartsAt,
    serviceExpiresAt,
    perpetualFreeReason,
    ...fields
  } = payload
  delete fields.branchCode
  return adminApiRequest('/api/platform/laboratories', {
    method: 'POST',
    body: {
      ...fields,
      access_slug: accessSlug,
      plan_code: planCode,
      subscription_status: subscriptionStatus,
      service_starts_at: serviceStartsAt,
      service_expires_at: serviceExpiresAt,
      ...(perpetualFreeReason ? { perpetual_free_reason: perpetualFreeReason } : {})
    }
  })
}
