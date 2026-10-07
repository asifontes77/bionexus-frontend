import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./DollarValueView.vue", import.meta.url), "utf8");

test("el encabezado del historial no muestra cantidad de registros", () => {
  assert.match(source, /title="Historial de cotizaciones"/);
  assert.doesNotMatch(source, /registro\(s\)/);
  assert.doesNotMatch(source, /subtitle=.*history/);
});

test("el conteo permanece disponible solamente en la paginacion del grid", () => {
  assert.match(source, /:page-size="10"/);
  assert.match(source, /:page-size-selector="\[10,20,50,100\]"/);
});
