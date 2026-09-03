import { apiRequest } from "@/api/apiClient";
import { normalizeGerm, normalizeGerms, normalizeGermChanges, normalizeGermPayload } from "@/models/germs";

const GERMS_PATH = "/api/list-germs";

export async function getGerms() {
  return normalizeGerms(await apiRequest(GERMS_PATH));
}

export async function createGerm(values) {
  return normalizeGerm(await apiRequest(GERMS_PATH, { method: "POST", body: normalizeGermPayload(values) }));
}

export async function updateGerm(id, changes) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("GERM_ID_INVALID");
  return normalizeGerm(await apiRequest(GERMS_PATH + "/" + id, { method: "PATCH", body: normalizeGermChanges(changes) }));
}

export function germError(error, fallback) {
  const messages = {
    GERM_ID_INVALID: "El identificador no es valido.",
    GERM_NOT_FOUND: "El germen ya no existe.",
    GERM_GERMEN_REQUIRED: "El nombre del germen es obligatorio.",
    GERM_GERMEN_TOO_LONG: "El nombre admite hasta 50 caracteres.",
    GERM_GERMEN_ALREADY_EXISTS: "Ya existe un germen con ese nombre.",
    GERM_UPDATE_REQUIRED: "No existen cambios para guardar.",
    GERM_FIELD_UNKNOWN: "Existen campos no permitidos.",
    GERM_ANNULLED_INVALID: "El estado indicado no es valido.",
    GERM_PERMISSION_REQUIRED: "La cuenta no tiene permiso para realizar esta operacion."
  };
  return messages[error?.message] || error?.message || fallback;
}