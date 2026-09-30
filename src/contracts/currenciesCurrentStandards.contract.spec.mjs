import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const dialog = readFileSync("src/components/currencies/CurrencyDialog.vue", "utf8");
const view = readFileSync("src/views/CurrenciesView.vue", "utf8");
const service = readFileSync("src/services/currencyService.js", "utf8");

describe("Monedas current standards", () => {
  it("usa componentes compartidos y errores Backend arriba", () => {
    for (const token of ["BioNexusDialog", "BioNexusFormErrors", "BioNexusSectionPanel", "BioNexusActionButton", "BioNexusConfirmDialog"]) assert.ok(dialog.includes(token), token);
    assert.ok(dialog.indexOf("BioNexusFormErrors") < dialog.indexOf("BioNexusSectionPanel"));
    assert.ok(!dialog.includes('v-if="errorMessage" class="bio-nexus-message'));
  });

  it("muestra contadores solo en textos con maxlength", () => {
    assert.ok(dialog.includes("draft.name.length + ' de 80 caracteres'"));
    assert.ok(dialog.includes("draft.symbol.length + ' de 12 caracteres'"));
    assert.equal((dialog.match(/maxlength=/g) || []).length, 2);
  });

  it("Crear y Guardar respetan dirty validez permisos y envio", () => {
    for (const token of ["!dirty.value", "!isValid.value", "props.saving", "!props.canCreate", "!props.canUpdate", ':disabled="submitDisabled"']) assert.ok(dialog.includes(token), token);
  });

  it("confirma descarte por X Cancelar y Esc", () => {
    for (const token of [':prevent-close="saving || dirty"', '@before-close="requestClose"', "discardDialog.value?.ask", "confirmText: 'Sí, salir y descartar cambios'"]) assert.ok(dialog.includes(token), token);
  });

  it("usa boton compartido y Desactivar danger", () => {
    assert.ok(view.includes("BioNexusActionButton"));
    assert.ok(view.includes('icon="create" icon-only shape="rounded"'));
    assert.ok(view.includes("variant:Boolean(r.isActive)?'danger':undefined"));
    assert.ok(!view.includes("<button"));
  });

  it("traduce todos los codigos Backend y usa fallback seguro", () => {
    const codes = [
      "CURRENCY_ACTOR_REQUIRED", "CURRENCY_BASE_CANNOT_BE_DEACTIVATED", "CURRENCY_BODY_REQUIRED",
      "CURRENCY_CODE_ALREADY_EXISTS", "CURRENCY_CODE_INVALID", "CURRENCY_DECIMAL_PLACES_INVALID",
      "CURRENCY_FIELD_UNKNOWN", "CURRENCY_ID_INVALID", "CURRENCY_IN_USE",
      "CURRENCY_LAST_ACTIVE_CANNOT_BE_DEACTIVATED", "CURRENCY_LOCAL_CANNOT_BE_DEACTIVATED",
      "CURRENCY_NAME_ALREADY_EXISTS", "CURRENCY_NAME_INVALID", "CURRENCY_NOT_FOUND",
      "CURRENCY_STATUS_INVALID", "CURRENCY_SYMBOL_INVALID", "CURRENCY_SYMBOL_POSITION_INVALID",
      "CURRENCY_TRANSACTION_UNAVAILABLE", "CURRENCY_UPDATE_REQUIRED"
    ];
    for (const code of codes) assert.ok(service.includes(code), code);
    assert.ok(service.includes("SECURITY_AUDIT_SERVICE_UNAVAILABLE"));
    assert.ok(service.includes("console.error('[currencyError] Código Backend no traducido:', code)"));
    assert.ok(service.includes("return fallback || 'No fue posible completar la operación.'"));
    assert.ok(!service.includes("return m[c]||c||f}"));
  });

  it("preserva protecciones de moneda base y local", () => {
    assert.ok(view.includes("Boolean(r.isBase)||Boolean(r.isLocal)"));
    assert.ok(dialog.includes("decimalPlaces >= 0"));
    assert.ok(dialog.includes("decimalPlaces <= 6"));
  });
});
