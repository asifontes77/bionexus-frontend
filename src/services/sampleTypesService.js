import { apiRequest } from '@/api/apiClient'
import { normalizeSampleType, normalizeSampleTypes, normalizeSampleTypePayload } from '@/models/sampleTypes'

const SAMPLE_TYPES_PATH = '/api/Sampletype'

export async function getSampleTypes() {
  return normalizeSampleTypes(await apiRequest(SAMPLE_TYPES_PATH))
}

export async function createSampleType(values) {
  return normalizeSampleType(await apiRequest(SAMPLE_TYPES_PATH, { method: 'POST', body: normalizeSampleTypePayload(values) }))
}

export async function updateSampleType(id, values) {
  if (!Number.isInteger(id) || id <= 0) throw new Error('SAMPLE_TYPE_ID_INVALID')
  return normalizeSampleType(await apiRequest(`${SAMPLE_TYPES_PATH}/${id}`, { method: 'PATCH', body: normalizeSampleTypePayload(values) }))
}

export function sampleTypeError(error, fallback) {
  const messages = {
    SAMPLE_TYPE_ID_INVALID: 'El identificador no es valido.',
    SAMPLE_TYPE_NOT_FOUND: 'El tipo de muestra ya no existe.',
    SAMPLE_TYPE_DESCRIPTION_REQUIRED: 'La descripcion es obligatoria.',
    SAMPLE_TYPE_DESCRIPTION_TOO_LONG: 'La descripcion admite hasta 50 caracteres.',
    SAMPLE_TYPE_DESCRIPTION_ALREADY_EXISTS: 'Ya existe un tipo de muestra con esa descripcion.',
    SAMPLE_TYPE_UPDATE_REQUIRED: 'No existen cambios para guardar.',
    SAMPLE_TYPE_FIELD_UNKNOWN: 'Existen campos no permitidos.',
    SAMPLE_TYPE_PERMISSION_REQUIRED: 'La cuenta no tiene permiso para realizar esta operacion.'
  }
  return messages[error?.message] || error?.message || fallback
}
