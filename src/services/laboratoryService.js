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

export async function testLaboratoryEmailConnection(id, sendEmail) {
  if (!Number.isInteger(id) || id <= 0) throw new Error('LABORATORY_ID_INVALID');
  return apiRequest(`/api/laboratory/${id}/email/test-connection`, { method: 'POST', body: { sendEmail } });
}

export async function uploadLaboratoryLogo(file, laboratoryId = 1) {
  if (!Number.isInteger(laboratoryId) || laboratoryId <= 0) throw new Error('LABORATORY_ID_INVALID');
  if (typeof File === 'undefined' || !(file instanceof File)) throw new Error('LABORATORY_LOGO_REQUIRED');
  const body = new FormData();
  body.append('file', file);
  return normalizeLaboratory(await apiRequest(`/api/laboratory/${laboratoryId}/upload`, { method: 'POST', body, preserveBody: true }));
}

export function getLaboratoryErrorMessage(error, fallback) {
  const messages = {
    LABORATORY_ID_INVALID: 'El identificador del laboratorio no es válido.',
    LABORATORY_NOT_FOUND: 'No se encontró la configuración del laboratorio.',
    LABORATORY_UPDATE_REQUIRED: 'No existen cambios para guardar.',
    LABORATORY_LICENSE_READ_ONLY: 'La licencia no puede modificarse desde esta pantalla.',
    LABORATORY_FIELD_UNKNOWN: 'La solicitud contiene campos no permitidos.',
    LABORATORY_TEXT_INVALID: 'Uno de los textos supera la longitud permitida.',
    LABORATORY_BOOLEAN_INVALID: 'Una opción contiene un valor no válido.',
    LABORATORY_INTEGER_INVALID: 'Un valor numérico no es válido.',
    LABORATORY_EMAIL_INVALID: 'Ingrese un correo válido.',
    LABORATORY_URL_INVALID: 'Ingrese una URL completa que comience con http:// o https://.',
    LABORATORY_RIF_INVALID: 'Ingrese un RIF válido.',
    LABORATORY_PHONE_INVALID: 'Ingrese un teléfono válido.',
    LABORATORY_PHONE_MASK_INVALID: 'La máscara telefónica debe contener marcadores #.',
    LABORATORY_LOGO_DIMENSION_INVALID: 'Las dimensiones del logo deben estar entre 0 y 200 px.',
    LABORATORY_QR_INVALID: 'La configuración QR no es válida.',
    LABORATORY_QR_FIELD_UNKNOWN: 'La configuración QR contiene campos no permitidos.',
    LABORATORY_QR_ACTIVE_INVALID: 'El estado del QR no es válido.',
    LABORATORY_QR_TEXT_INVALID: 'Un texto del QR supera la longitud permitida.',
    LABORATORY_QR_EMAIL_INVALID: 'Ingrese un correo de contacto válido.',
    LABORATORY_QR_PHONE_INVALID: 'Ingrese un teléfono de contacto válido.',
    LABORATORY_EMAIL_SETTINGS_REQUIRED: 'Complete la configuraciÃ³n de correo.',
    LABORATORY_EMAIL_SETTINGS_INVALID: 'La configuraciÃ³n de correo no es vÃ¡lida.',
    LABORATORY_EMAIL_USER_REQUIRED: 'El usuario SMTP es obligatorio.',
    LABORATORY_EMAIL_FROM_INVALID: 'Ingrese un remitente vÃ¡lido.',
    LABORATORY_EMAIL_HOST_REQUIRED: 'El host SMTP es obligatorio.',
    LABORATORY_EMAIL_PORT_INVALID: 'Ingrese un puerto SMTP vÃ¡lido.',
    LABORATORY_EMAIL_PASSWORD_REQUIRED: 'Escriba la contraseÃ±a para probar la conexiÃ³n.',
    LABORATORY_EMAIL_CONNECTION_FAILED: 'No fue posible verificar la conexiÃ³n. Revise servidor, puerto y credenciales.',
    LABORATORY_LOGO_REQUIRED: 'Seleccione una imagen para el logo.',
    LABORATORY_LOGO_TYPE_INVALID: 'Use una imagen PNG, JPEG o WebP.',
    BIO_NEXUS_REQUEST_TIMEOUT: 'La solicitud tardó demasiado.'
  };
  return messages[error?.message] || error?.message || fallback;
}

export async function getLaboratoryTaxes() { const value = await apiRequest("/api/tax"); return Array.isArray(value) ? value.map(normalizeTax) : []; }
export async function createLaboratoryTax(value) { return normalizeTax(await apiRequest("/api/tax", { method: "POST", body: taxChanges(value) })); }
export async function updateLaboratoryTax(id, value) { if (!Number.isInteger(id) || id <= 0) throw new Error("TAX_ID_INVALID"); return normalizeTax(await apiRequest("/api/tax/" + id, { method: "PATCH", body: taxChanges(value) })); }
export async function deleteLaboratoryTax(id) { if (!Number.isInteger(id) || id <= 0) throw new Error("TAX_ID_INVALID"); return apiRequest("/api/tax/" + id, { method: "DELETE" }); }
function normalizeTax(value) { const source = value && typeof value === "object" ? value : {}; return { ...source, id: Number.isInteger(Number(source.id)) ? Number(source.id) : -1, description: String(source.description || ""), value: Number(source.value || 0), only_dollars: Boolean(source.only_dollars), always_subtotal: Boolean(source.always_subtotal), hide: Boolean(source.hide) }; }
function taxChanges(value) { const result = normalizeTax(value); delete result.id; delete result.localKey; return result; }
