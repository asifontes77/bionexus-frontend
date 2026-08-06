import { apiRequest } from '@/api/apiClient'

const DEFAULT_LABORATORY_ID = 1

export function updateLaboratoryLicense(license) {
  const normalizedLicense = license.trim()

  if (normalizedLicense === '') {
    throw new Error('La licencia es requerida.')
  }

  return apiRequest(`/api/laboratory/${DEFAULT_LABORATORY_ID}`, {
    auth: false,
    method: 'PATCH',
    body: {
      license: normalizedLicense
    }
  })
}
