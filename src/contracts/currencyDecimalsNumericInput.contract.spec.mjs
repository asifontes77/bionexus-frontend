import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const dialog = fs.readFileSync("src/components/currencies/CurrencyDialog.vue", "utf8");

test("Decimales usa BioNexusNumericInput", () => {
  assert.ok(dialog.includes('import BioNexusNumericInput from "@/components/ui/BioNexusNumericInput.vue"'));
  assert.ok(dialog.includes('<BioNexusNumericInput id="currency-decimals"'));
  assert.ok(dialog.includes('v-model="draft.decimalPlaces"'));
  assert.ok(dialog.includes(':decimals="0"'));
  assert.ok(dialog.includes(':min="0"'));
  assert.ok(dialog.includes(':max="6"'));
  assert.ok(dialog.includes('@input="syncDirty"'));
  assert.equal(dialog.includes('id="currency-decimals" v-model.number='), false);
});

test("el contrato funcional del dialogo permanece", () => {
  assert.ok(dialog.includes('draft.decimalPlaces'));
  assert.ok(dialog.includes('syncDirty'));
  assert.ok(dialog.includes('submitDisabled'));
});
