import { apiRequest } from "@/api/apiClient";
import {
  normalizeTypePayment,
  normalizeTypePaymentChanges,
  normalizeTypePaymentDescription,
  normalizeTypePayments,
} from "@/models/typePayment";

export async function getTypePayments() {
  const response = await apiRequest("/api/Typepayment");

  return normalizeTypePayments(response);
}

export async function createTypePayment(description) {
  const response = await apiRequest("/api/Typepayment", {
    method: "POST",
    body: {
      description: normalizeTypePaymentDescription(description),
    },
  });

  return normalizeTypePayment(response);
}

export async function updateTypePayment(typePaymentId, changes) {
  if (!Number.isInteger(typePaymentId) || typePaymentId <= 0) {
    throw new Error("TYPEPAYMENT_ID_INVALID");
  }

  const response = await apiRequest(`/api/Typepayment/${typePaymentId}`, {
    method: "PATCH",
    body: normalizeTypePaymentChanges(changes),
  });

  return normalizeTypePayment(response);
}

export function getTypePaymentErrorMessage(error, fallbackMessage) {
  const backendMessage =
    typeof error?.message === "string" ? error.message : "";

  const messages = {
    TYPEPAYMENT_ID_INVALID:
      "El identificador de la forma parasitaria no es vÃƒÂ¡lido.",
    TYPEPAYMENT_NOT_FOUND: "La forma parasitaria seleccionada ya no existe.",
    TYPEPAYMENT_DESCRIPTION_REQUIRED: "La descripciÃƒÂ³n es obligatoria.",
    TYPEPAYMENT_DESCRIPTION_TOO_LONG:
      "La descripciÃƒÂ³n no puede superar los 50 caracteres.",
    TYPEPAYMENT_ANNULLED_INVALID:
      "El estado de la forma parasitaria no es vÃƒÂ¡lido.",
    TYPEPAYMENT_UPDATE_REQUIRED: "No existen cambios para guardar.",
    TYPEPAYMENT_PERMISSION_REQUIRED:
      "La cuenta actual no tiene autorizaciÃƒÂ³n para realizar todos los cambios solicitados.",
    AUTHORIZATION_CONTEXT_UNAVAILABLE:
      "No fue posible determinar la autorizaciÃƒÂ³n de la cuenta actual.",
  };

  return messages[backendMessage] || backendMessage || fallbackMessage;
}
