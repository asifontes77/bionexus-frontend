import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const dialog = readFileSync("src/components/typepayment/TypePaymentDialog.vue", "utf8");
const view = readFileSync("src/views/TypePaymentView.vue", "utf8");
const service = readFileSync("src/services/typePaymentService.js", "utf8");

describe("Formas de pago current standards", () => {
  it("usa componentes compartidos y errores arriba", () => {
    for (const token of ["BioNexusFormErrors", "BioNexusSectionPanel", "BioNexusActionButton", "BioNexusConfirmDialog"]) assert.ok(dialog.includes(token), token);
    assert.ok(dialog.indexOf("BioNexusFormErrors") < dialog.indexOf("BioNexusSectionPanel"));
    assert.ok(!dialog.includes('v-if="errorMessage" class="bio-nexus-message'));
  });

  it("usa checkbox comun y layout superior de dos columnas", () => {
    assert.ok(dialog.includes('import BioNexusCheckbox'));
    assert.equal((dialog.match(/<BioNexusCheckbox/g) || []).length, 2);
    assert.ok(dialog.includes('v-model="draft.currencyIds"'));
    assert.ok(dialog.includes('v-model="field.isRequired"'));
    assert.ok(dialog.includes('class="payment-information-grid"'));
    assert.ok(dialog.includes('grid-template-columns:minmax(300px,.9fr) minmax(520px,1.35fr)'));
    assert.ok(dialog.includes('@media(max-width:900px){.payment-information-grid{grid-template-columns:1fr}'));
    assert.equal((dialog.match(/type="checkbox"/g) || []).length, 0);
    assert.ok(dialog.includes(".required-check{align-self:center;margin-top:0;min-height:42px}"));
  });

  it("protege contadores y dirty", () => {
    for (const token of ["draft.description.length + ' de 100 caracteres'", "field.label.length + ' de 100 caracteres'", "field.helpText.length + ' de 255 caracteres'", "dirty.value=signature.value!==original.value", "!dirty.value"]) assert.ok(dialog.includes(token), token);
  });

  it("confirma descarte y usa acciones compartidas", () => {
    for (const token of ['@before-close="requestClose"', "discardDialog.value?.ask", 'shape="circle"', 'variant="danger"', 'icon="arrow_upward"', 'icon="arrow_downward"']) assert.ok(dialog.includes(token), token);
    assert.ok(!dialog.includes("<button"));
  });

  it("conserva monedas campos y orden", () => {
    for (const token of ["currencyIds", "defaultCurrencyId", "fields:draft.fields.map", "addField", "removeField", "moveField"]) assert.ok(dialog.includes(token), token);
    for (const token of ["saveOrder", "acceptKeyboardPosition", "cancelKeyboardPosition", "reconcileRowsSilently"]) assert.ok(view.includes(token), token);
  });

  it("muestra Desactivar danger", () => {
    assert.ok(view.includes('variant: row.annulled ? undefined : "danger"'));
  });

  it("traduce codigos y usa fallback seguro", () => {
    for (const token of ["TYPEPAYMENT_FIELD_CODE_DUPLICATED", "TYPEPAYMENT_REORDER_SCOPE_INVALID", "TYPEPAYMENT_TRANSACTION_UNAVAILABLE", "SECURITY_AUDIT_SERVICE_UNAVAILABLE", 'console.error("[getTypePaymentErrorMessage] Código Backend no traducido:"', 'return fallback || "No fue posible completar la operación."']) assert.ok(service.includes(token), token);
    assert.ok(!service.includes("return messages[code]??code??fallback"));
  });
});
