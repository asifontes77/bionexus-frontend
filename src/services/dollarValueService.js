import { apiRequest } from "@/api/apiClient";
import { normalizeDollarValue, normalizeDollarValueHistory, normalizeDollarValuePayload } from "@/models/dollarValue";

export async function getCurrentDollarValue() {
  return normalizeDollarValue(await apiRequest("/api/dollarvalue/get"));
}

export async function getDollarValueHistory() {
  return normalizeDollarValueHistory(await apiRequest("/api/dollarvalue/history"));
}

export async function publishDollarValue(value) {
  return normalizeDollarValue(await apiRequest("/api/dollarvalue", { method: "POST", body: normalizeDollarValuePayload({ value }) }));
}

export function dollarValueError(error, fallback) {
  const messages = {
    DOLLAR_VALUE_NOT_FOUND: "No existe una cotizaci\u00f3n registrada.",
    DOLLAR_VALUE_INVALID: "Indica un valor mayor que cero.",
    DOLLAR_VALUE_SCALE_INVALID: "El valor admite un m\u00e1ximo de dos decimales.",
    DOLLAR_VALUE_FIELD_UNKNOWN: "Existen campos no permitidos.",
    DOLLAR_VALUE_ACTOR_REQUIRED: "No fue posible identificar la cuenta activa.",
  };
  return messages[error?.message] || error?.message || fallback;
}

export async function getDollarValueAutomation() {
  return apiRequest("/api/dollarvalue/automation");
}

export async function saveDollarValueAutomation(payload) {
  return apiRequest("/api/dollarvalue/automation/config", { method: "POST", body: payload });
}

export async function runDollarValueAutomation() {
  return apiRequest("/api/dollarvalue/automation/run", { method: "POST" });
}
