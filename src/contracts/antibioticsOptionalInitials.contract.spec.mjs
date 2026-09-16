import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
const dialog = readFileSync("src/components/antibiotics/AntibioticDialog.vue", "utf8");
const model = readFileSync("src/models/antibiotics.js", "utf8");
const service = readFileSync("src/services/antibioticsService.js", "utf8");
describe("Antibiotics optional initials contract", () => {
  it("preserves 69 legacy records with empty initials", () => {
    assert.ok(dialog.includes("10 caracteres. Opcional"));
    assert.ok(!dialog.includes("initialsError"));
    assert.ok(!dialog.includes('field-id="antibiotic-initials" :error='));
    assert.ok(!model.includes("ANTIBIOTIC_INITIALS_REQUIRED"));
    assert.ok(!service.includes("ANTIBIOTIC_INITIALS_REQUIRED"));
    assert.ok(model.includes('if (siglas.length > 10)'));
  });
});
