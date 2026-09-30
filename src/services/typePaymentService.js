import { apiRequest } from "@/api/apiClient";
import { normalizeTypePayment, normalizeTypePaymentChanges, normalizeTypePaymentPayload, normalizeTypePayments } from "@/models/typePayment";
export async function getTypePayments(){return normalizeTypePayments(await apiRequest("/api/Typepayment"))}
export async function reorderTypePayments(ids){return apiRequest("/api/Typepayment/reorder",{method:"PATCH",body:{ids}})}
export async function createTypePayment(payload){return normalizeTypePayment(await apiRequest("/api/Typepayment",{method:"POST",body:normalizeTypePaymentPayload(payload)}))}
export async function updateTypePayment(id,changes){const normalizedId=Number(id);if(!Number.isInteger(normalizedId)||normalizedId<=0)throw new Error("TYPEPAYMENT_ID_INVALID");return normalizeTypePayment(await apiRequest(`/api/Typepayment/${normalizedId}`,{method:"PATCH",body:normalizeTypePaymentChanges(changes)}))}
export function getTypePaymentErrorMessage(error, fallback = "No fue posible completar la operación.") {
  const code = String(error?.data?.message || error?.message || "").trim();
  const messages = {
    AUTHORIZATION_CONTEXT_UNAVAILABLE: "No fue posible determinar la autorización de la cuenta.",
    SECURITY_AUDIT_SERVICE_UNAVAILABLE: "No fue posible registrar la operación de seguridad. Inténtalo nuevamente.",
    TYPEPAYMENT_ACTOR_REQUIRED: "No fue posible identificar al usuario que realiza la operación.",
    TYPEPAYMENT_ANNULLED_INVALID: "El estado indicado para la forma de pago no es válido.",
    TYPEPAYMENT_CODE_ALREADY_EXISTS: "Ya existe una forma de pago con ese código.",
    TYPEPAYMENT_CODE_INVALID: "El código de la forma de pago no es válido.",
    TYPEPAYMENT_CODE_REQUIRED: "El código de la forma de pago es obligatorio.",
    TYPEPAYMENT_CURRENCIES_REQUIRED: "Selecciona al menos una moneda.",
    TYPEPAYMENT_CURRENCY_INVALID: "Una moneda seleccionada no es válida.",
    TYPEPAYMENT_CURRENCY_NOT_AVAILABLE: "Una moneda seleccionada ya no está disponible.",
    TYPEPAYMENT_DEFAULT_CURRENCY_INVALID: "La moneda predeterminada debe estar entre las monedas disponibles.",
    TYPEPAYMENT_DEFAULT_CURRENCY_REQUIRED: "Selecciona la moneda predeterminada.",
    TYPEPAYMENT_DESCRIPTION_ALREADY_EXISTS: "Ya existe una forma de pago con esa descripción.",
    TYPEPAYMENT_DESCRIPTION_REQUIRED: "La descripción es obligatoria.",
    TYPEPAYMENT_DISPLAY_ORDER_INVALID: "El orden indicado no es válido.",
    TYPEPAYMENT_FIELD_CODE_DUPLICATED: "Existen campos adicionales con el mismo código.",
    TYPEPAYMENT_FIELD_CODE_INVALID: "El código de un campo adicional no es válido.",
    TYPEPAYMENT_FIELD_INVALID: "La configuración de un campo adicional no es válida.",
    TYPEPAYMENT_FIELD_LABEL_REQUIRED: "Completa la etiqueta de todos los campos adicionales.",
    TYPEPAYMENT_FIELD_LENGTH_RANGE_INVALID: "La longitud mínima no puede superar la longitud máxima.",
    TYPEPAYMENT_FIELD_MAX_LENGTH_INVALID: "La longitud máxima de un campo adicional no es válida.",
    TYPEPAYMENT_FIELD_MIN_LENGTH_INVALID: "La longitud mínima de un campo adicional no es válida.",
    TYPEPAYMENT_FIELD_REQUIRED_INVALID: "La obligatoriedad de un campo adicional no es válida.",
    TYPEPAYMENT_FIELD_STATUS_INVALID: "El estado de un campo adicional no es válido.",
    TYPEPAYMENT_FIELD_TEXT_TOO_LONG: "El texto de un campo adicional supera la longitud permitida.",
    TYPEPAYMENT_FIELD_TYPE_INVALID: "El tipo de un campo adicional no es válido.",
    TYPEPAYMENT_FIELDS_ARRAY_REQUIRED: "La colección de campos adicionales no es válida.",
    TYPEPAYMENT_FIELDS_COUNT_INVALID: "La forma de pago supera el máximo de campos adicionales permitido.",
    TYPEPAYMENT_ID_INVALID: "El identificador de la forma de pago no es válido.",
    TYPEPAYMENT_NOT_FOUND: "La forma de pago seleccionada ya no existe.",
    TYPEPAYMENT_PERMISSION_REQUIRED: "La cuenta no tiene autorización para realizar todos los cambios.",
    TYPEPAYMENT_REORDER_IDS_INVALID: "La selección utilizada para ordenar no es válida.",
    TYPEPAYMENT_REORDER_SCOPE_INVALID: "El orden ya no coincide con el catálogo actual. Actualiza e inténtalo nuevamente.",
    TYPEPAYMENT_TEXT_TOO_LONG: "Uno de los textos supera la longitud permitida.",
    TYPEPAYMENT_TRANSACTION_UNAVAILABLE: "No fue posible iniciar la operación. Inténtalo nuevamente.",
    TYPEPAYMENT_UPDATE_REQUIRED: "Debes modificar al menos un dato antes de guardar."
  };
  if (messages[code]) return messages[code];
  if (code) console.error("[getTypePaymentErrorMessage] Código Backend no traducido:", code);
  return fallback || "No fue posible completar la operación.";
}
