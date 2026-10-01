import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const dialog = readFileSync("src/components/tax/TaxDialog.vue", "utf8");
const view = readFileSync("src/views/TaxesView.vue", "utf8");
const service = readFileSync("src/services/taxService.js", "utf8");

describe("Tax duplicate descriptions", () => {
  it("normaliza y bloquea duplicados en crear y editar", () => {
    for (const token of [
      "descriptionDuplicate",
      "toLocaleLowerCase",
      "Number(row?.id)!==Number(current.value?.id)",
    ]) assert.ok(dialog.includes(token), token);
  });

  it("presenta el rechazo Backend arriba mediante BioNexusFormErrors", () => {
    assert.ok(dialog.includes("BioNexusFormErrors"));
    assert.ok(dialog.indexOf("BioNexusFormErrors") < dialog.indexOf("BioNexusSectionPanel"));
    assert.ok(!dialog.includes("descriptionServerError"));
    assert.ok(!dialog.includes("setDescriptionError"));
    assert.ok(view.includes('formDialog.value?.setError(getTaxErrorMessage(error'));
    assert.ok(!view.includes("setDescriptionError"));
    assert.ok(service.includes('TAX_DESCRIPTION_ALREADY_EXISTS:"Ya existe un impuesto con esta descripción."'));
  });
});