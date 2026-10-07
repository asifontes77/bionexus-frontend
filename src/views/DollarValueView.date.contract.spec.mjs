import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./DollarValueView.vue", import.meta.url), "utf8");

test("Vigente desde usa el formateador de fecha funcional sin conversion de zona horaria", () => {
  assert.match(source, /formatRegionalFunctionalDate/);
  assert.match(source, /function formatEffectiveDate\(value\)\{return value\?formatRegionalFunctionalDate\(value,regionalSettingsStore\.settings\):"No disponible"\}/);
  assert.doesNotMatch(source, /function formatEffectiveDate[\s\S]*new Date\(value\)/);
  assert.doesNotMatch(source, /function formatEffectiveDate[\s\S]*timeZone:"America\/Caracas"/);
});

test("Actualizado el conserva el formateador regional de timestamp", () => {
  assert.match(source, /function formatDate\(value\)\{return formatRegionalDateTime\(value,regionalSettingsStore\.settings\)\}/);
});
