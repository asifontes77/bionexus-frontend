import{apiRequest}from'@/api/apiClient';import{currencyPayload,normalizeCurrencies,normalizeCurrency}from'@/models/currency';export async function getCurrencies(){return normalizeCurrencies(await apiRequest('/api/currencies'))}export async function getActiveCurrencies(){return normalizeCurrencies(await apiRequest('/api/currencies/active'))}export async function createCurrency(v){return normalizeCurrency(await apiRequest('/api/currencies',{method:'POST',body:currencyPayload(v)}))}export async function updateCurrency(id,v){const p=currencyPayload(v);delete p.code;return normalizeCurrency(await apiRequest(`/api/currencies/${id}`,{method:'PATCH',body:p}))}export async function changeCurrencyStatus(id,isActive){return normalizeCurrency(await apiRequest(`/api/currencies/${id}/status`,{method:'PATCH',body:{isActive}}))}export function currencyError(error, fallback = 'No fue posible completar la operación.') {
  const code = String(error?.data?.message || error?.message || '').trim()
  const messages = {
    CURRENCY_ACTOR_REQUIRED: 'No fue posible identificar al usuario que realiza la operación.',
    CURRENCY_BASE_CANNOT_BE_DEACTIVATED: 'La moneda base no puede desactivarse.',
    CURRENCY_BODY_REQUIRED: 'Debes proporcionar los datos de la moneda.',
    CURRENCY_CODE_ALREADY_EXISTS: 'Ya existe una moneda con el código seleccionado.',
    CURRENCY_CODE_INVALID: 'El código de la moneda no es válido.',
    CURRENCY_DECIMAL_PLACES_INVALID: 'Los decimales deben ser un número entero entre 0 y 6.',
    CURRENCY_FIELD_UNKNOWN: 'La solicitud contiene un campo de moneda no permitido.',
    CURRENCY_ID_INVALID: 'La moneda seleccionada no es válida.',
    CURRENCY_IN_USE: 'La moneda está asignada a una forma de pago.',
    CURRENCY_LAST_ACTIVE_CANNOT_BE_DEACTIVATED: 'Debe permanecer al menos una moneda activa.',
    CURRENCY_LOCAL_CANNOT_BE_DEACTIVATED: 'La moneda local no puede desactivarse.',
    CURRENCY_NAME_ALREADY_EXISTS: 'Ya existe una moneda con ese nombre.',
    CURRENCY_NAME_INVALID: 'El nombre de la moneda no es válido.',
    CURRENCY_NOT_FOUND: 'La moneda solicitada no existe o ya no está disponible.',
    CURRENCY_STATUS_INVALID: 'El estado indicado para la moneda no es válido.',
    CURRENCY_SYMBOL_INVALID: 'El símbolo de la moneda no es válido.',
    CURRENCY_SYMBOL_POSITION_INVALID: 'La posición del símbolo no es válida.',
    CURRENCY_TRANSACTION_UNAVAILABLE: 'No fue posible iniciar la operación de moneda. Inténtalo nuevamente.',
    CURRENCY_UPDATE_REQUIRED: 'Debes modificar al menos un dato de la moneda.',
    SECURITY_AUDIT_SERVICE_UNAVAILABLE: 'No fue posible registrar la operación de seguridad. Inténtalo nuevamente.'
  }
  if (messages[code]) return messages[code]
  if (code) console.error('[currencyError] Código Backend no traducido:', code)
  return fallback || 'No fue posible completar la operación.'
}
