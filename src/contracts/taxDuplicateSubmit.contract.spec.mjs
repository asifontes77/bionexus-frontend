import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const dialog = readFileSync("src/components/tax/TaxDialog.vue", "utf8");
const view = readFileSync("src/views/TaxesView.vue", "utf8");

describe("Tax duplicate submit flow", () => {
  it("permite enviar un nombre localmente duplicado para que Backend sea autoritativo", () => {
    assert.ok(dialog.includes("descriptionDuplicate"));
    assert.ok(!dialog.includes("!descriptionDuplicate.value&&numericValue.value"));
  });

  it("muestra el rechazo Backend arriba", () => {
    assert.ok(dialog.includes("BioNexusFormErrors"));
    assert.ok(dialog.indexOf("BioNexusFormErrors") < dialog.indexOf("BioNexusSectionPanel"));
    assert.ok(view.includes('formDialog.value?.setError(getTaxErrorMessage(error'));
    assert.ok(!dialog.includes("setDescriptionError"));
  });
});