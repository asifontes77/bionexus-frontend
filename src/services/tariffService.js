import { apiRequest } from "@/api/apiClient";

export function getTariffs() { return apiRequest("/api/tariffs"); }
export function reorderTariffs(ids) { return apiRequest("/api/tariffs/reorder", { method: "PATCH", body: { ids } }); }
export function createTariff(values) { return apiRequest("/api/tariffs", { method: "POST", body: values }); }
export function updateTariff(id, values) { return apiRequest(`/api/tariffs/${id}`, { method: "PATCH", body: values }); }
export function changeTariffStatus(id, isActive) { return apiRequest(`/api/tariffs/${id}/status`, { method: "PATCH", body: { isActive } }); }
export function setDefaultTariff(id) { return apiRequest(`/api/tariffs/${id}/default`, { method: "POST" }); }
export function tariffError(error, fallback = "No fue posible completar la operación.") {
  const key = String(error?.message || "");
  const messages = {
    TARIFF_NOT_FOUND: "La tarifa seleccionada ya no existe.",
    TARIFF_CODE_OR_NAME_ALREADY_EXISTS: "Ya existe una tarifa con el mismo código o nombre.",
    TARIFF_POSITION_ALREADY_EXISTS: "La posición ya está asignada a otra tarifa.",
    TARIFF_DEFAULT_CANNOT_BE_DEACTIVATED: "La tarifa predeterminada no puede inactivarse.",
    TARIFF_LAST_ACTIVE_CANNOT_BE_DEACTIVATED: "Debe permanecer al menos una tarifa activa.",
    TARIFF_DEFAULT_MUST_BE_ACTIVE: "Solo una tarifa activa puede definirse como predeterminada.",
  };
  return messages[key] || key || fallback;
}
