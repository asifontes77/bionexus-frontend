import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = process.cwd();
const read = path => readFileSync(join(root, path), "utf8");
const view = read("src/views/ExamCatalogView.vue");
const dialog = read("src/components/examcatalog/ExamDialog.vue");
const detail = read("src/components/examcatalog/ExamDetailDialog.vue");

describe("Exam catalog regional monetary contract", () => {
  it("usa configuracion regional en las columnas del grid", () => {
    for (const token of ["formatUsdPrice", "useRegionalSettingsStore", "regionalSettings.settings.base_currency_symbol"])
      assert.ok(view.includes(token), `VIEW_MISSING_${token}`);
    assert.ok(!view.includes('Precio "+p.slice(-1)+" (USD)'));
    assert.ok(!view.includes("toFixed(2)"));
  });

  it("usa simbolo y entrada regional en el dialogo", () => {
    for (const token of ["baseCurrencySymbol", "base_currency_symbol", "parseRegionalNumber", "formatRegionalAmount", 'inputmode="decimal"', "price(number)"])
      assert.ok(dialog.includes(token), `DIALOG_MISSING_${token}`);
    assert.ok(!dialog.includes('tariff.name + \' (USD)\''));
    assert.ok(!dialog.includes('step="0.01"'));
  });

  it("usa simbolo monetario configurado en el detalle", () => {
    for (const token of ["formatUsdPrice", "formatRegionalNumber", "useRegionalSettingsStore", "baseCurrencySymbol", "base_currency_symbol"])
      assert.ok(detail.includes(token), `DETAIL_MISSING_${token}`);
    assert.ok(detail.includes("{{ tariff.name }} ({{ baseCurrencySymbol }})"));
    assert.ok(!detail.includes("{{ tariff.name }} (USD)"));
    assert.ok(!detail.includes("toFixed(2)"));
  });
});
