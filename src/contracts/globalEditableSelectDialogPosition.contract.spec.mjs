import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";
const shared=readFileSync("src/components/ui/BioNexusSearchableSelect.vue","utf8"),currency=readFileSync("src/components/currencies/CurrencyDialog.vue","utf8");
describe("Global editable select dialog positioning",()=>{
  it("calcula coordenadas relativas al dialogo destino",()=>{for(const token of["dialog.getBoundingClientRect()","rect.left-bounds.left","rect.bottom-bounds.top","bounds.bottom-rect.top","position:dialog?\"absolute\":\"fixed\""])assert.ok(shared.includes(token),token)});
  it("calcula espacio usando limites del dialogo",()=>{for(const token of["bounds.bottom-rect.bottom","rect.top-bounds.top","spaceAbove>spaceBelow","maxHeight"])assert.ok(shared.includes(token),token)});
  it("ajusta la lista a la altura disponible",()=>{assert.ok(shared.includes("grid-template-rows:auto minmax(0,1fr)"));assert.ok(shared.includes("max-height:none"));assert.ok(shared.includes("overflow:auto"))});
  it("Monedas conserva ambos select compartidos",()=>{assert.ok(currency.includes('id="currency-code"'));assert.ok(currency.includes('id="currency-position"'));assert.ok(!currency.includes("<select"))});
});