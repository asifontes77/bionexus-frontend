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
    LABORATORY_ID_INVALID: 'El identificador del laboratorio no es válido.',
    LABORATORY_NOT_FOUND: 'No se encontró la configuración del laboratorio.',
    LABORATORY_UPDATE_REQUIRED: 'No existen cambios para guardar.',
    LABORATORY_LICENSE_READ_ONLY: 'La licencia no puede modificarse desde esta pantalla.',
    LABORATORY_FIELD_UNKNOWN: 'La solicitud contiene campos no permitidos.',
    LABORATORY_TEXT_INVALID: 'Uno de los textos supera la longitud permitida.',
    LABORATORY_BOOLEAN_INVALID: 'Una opción contiene un valor no válido.',
    LABORATORY_INTEGER_INVALID: 'Un valor numérico no es válido.',
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