import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const dialog = readFileSync("src/components/examcatalog/ExamPriceAdjustmentDialog.vue", "utf8");
describe("Price adjustment percentage decimals", () => {
  it("muestra y captura Porcentaje con dos decimales", () => {
    assert.ok(dialog.includes('BioNexusNumericInput id="adjust-percentage"'));
    assert.ok(dialog.includes(':decimals="2"'));
    assert.ok(!dialog.includes(':decimals="4"'));
  });
  it("preserva limites y payload numerico", () => {
    for (const token of ["percentageMaximum", "operation.value===\"decrease\"?100:1000", "percentage:percentage.value"])
      assert.ok(dialog.includes(token), token);
  });
});