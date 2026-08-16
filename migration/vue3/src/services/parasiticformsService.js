import { apiRequest } from "@/api/apiClient";
import {
  normalizeParasiticform,
  normalizeParasiticformChanges,
  normalizeParasiticformDescription,
  normalizeParasiticforms,
} from "@/models/parasiticforms";

export async function getParasiticforms() {
  const response = await apiRequest("/api/parasiticforms");

  return normalizeParasiticforms(response);
}

export async function createParasiticform(description) {
  const response = await apiRequest("/api/parasiticforms", {
    method: "POST",
    body: {
      description: normalizeParasiticformDescription(description),
    },
  });

  return normalizeParasiticform(response);
}

export async function updateParasiticform(parasiticformId, changes) {
  if (!Number.isInteger(parasiticformId) || parasiticformId <= 0) {
    throw new Error("PARASITICFORM_ID_INVALID");
  }

  const response = await apiRequest(`/api/parasiticforms/${parasiticformId}`, {
    method: "PATCH",
    body: normalizeParasiticformChanges(changes),
  });

  return normalizeParasiticform(response);
}

export function getParasiticformErrorMessage(error, fallbackMessage) {
  const backendMessage =
    typeof error?.message === "string" ? error.message : "";

  const messages = {
    PARASITICFORM_ID_INVALID:
      "El identificador de la forma parasitaria no es válido.",
    PARASITICFORM_NOT_FOUND: "La forma parasitaria seleccionada ya no existe.",
    PARASITICFORM_DESCRIPTION_ALREADY_EXISTS:
      "Ya existe una forma parasitaria con esta descripci\u00f3n.",
    PARASITICFORM_DESCRIPTION_REQUIRED: "La descripción es obligatoria.",
    PARASITICFORM_DESCRIPTION_TOO_LONG:
      "La descripción no puede superar los 50 caracteres.",
    PARASITICFORM_ANNULLED_INVALID:
      "El estado de la forma parasitaria no es válido.",
    PARASITICFORM_UPDATE_REQUIRED: "No existen cambios para guardar.",
    PARASITICFORM_PERMISSION_REQUIRED:
      "La cuenta actual no tiene autorización para realizar todos los cambios solicitados.",
    AUTHORIZATION_CONTEXT_UNAVAILABLE:
      "No fue posible determinar la autorización de la cuenta actual.",
  };

  return messages[backendMessage] || backendMessage || fallbackMessage;
}
