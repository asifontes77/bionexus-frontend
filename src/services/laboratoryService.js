import { apiRequest } from '@/api/apiClient'
import { normalizeLaboratory, normalizeLaboratoryChanges } from '@/models/laboratory'

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


export async function getLaboratory() {
  return normalizeLaboratory(await apiRequest('/api/laboratory/1'));
}

export async function updateLaboratory(id, changes) {
  if (!Number.isInteger(id) || id <= 0) throw new Error('LABORATORY_ID_INVALID');
  return normalizeLaboratory(await apiRequest(`/api/laboratory/${id}`, { method: 'PATCH', body: normalizeLaboratoryChanges(changes) }));
}

export async function uploadLaboratoryLogo(file) {
  if (typeof File === 'undefined' || !(file instanceof File)) throw new Error('LABORATORY_LOGO_REQUIRED');
  const body = new FormData();
  body.append('file', file);
  return normalizeLaboratory(await apiRequest('/api/laboratory/upload', { method: 'POST', body, preserveBody: true }));
}

export function getLaboratoryErrorMessage(error, fallback) {
  const messages = {
    LABORATORY_ID_INVALID: 'El identificador del laboratorio no es vÃ¡lido.',
    LABORATORY_NOT_FOUND: 'No se encontrÃ³ la configuraciÃ³n del laboratorio.',
    LABORATORY_UPDATE_REQUIRED: 'No existen cambios para guardar.',
    LABORATORY_LICENSE_READ_ONLY: 'La licencia no puede modificarse desde esta pantalla.',
    LABORATORY_FIELD_UNKNOWN: 'La solicitud contiene campos no permitidos.',
    LABORATORY_TEXT_INVALID: 'Uno de los textos supera la longitud permitida.',
    LABORATORY_BOOLEAN_INVALID: 'Una opciÃ³n contiene un valor no vÃ¡lido.',
    LABORATORY_INTEGER_INVALID: 'Un valor numÃ©rico no es vÃ¡lido.',
    LABORATORY_LOGO_REQUIRED: 'Seleccione una imagen para el logo.',
    LABORATORY_LOGO_TYPE_INVALID: 'Use una imagen PNG, JPEG o WebP.',
    BIO_NEXUS_REQUEST_TIMEOUT: 'La solicitud tardÃ³ demasiado.'
  };
  return messages[error?.message] || error?.message || fallback;
}
