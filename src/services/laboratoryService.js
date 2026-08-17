import { apiRequest } from '@/api/apiClient'

export function updateLaboratoryLicense(license) {
  const normalizedLicense = license.trim()

  if (normalizedLicense === '') {
    throw new Error('La licencia es requerida.')
  }

  return apiRequest('/api/license/activate', {
    auth: false,
    method: 'PATCH',
    body: {
      license: normalizedLicense
    }
  })
}
