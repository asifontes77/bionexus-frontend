import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";
const dialog=readFileSync("src/components/currencies/CurrencyDialog.vue","utf8"),shared=readFileSync("src/components/ui/BioNexusSearchableSelect.vue","utf8");
describe("Currencies shared selects",()=>{
  it("migra ambos select editables",()=>{for(const id of["currency-code","currency-position"]){assert.ok(dialog.includes(`id="${id}"`),id);assert.ok(!dialog.includes(`<select id="${id}"`),`native:${id}`)}assert.ok(!dialog.includes("<select"))});
  it("preserva opciones y efectos",()=>{for(const token of["currencyOptions","symbolPositionOptions","selected?.code","draft.name = item.name","draft.symbol = item.symbol","@change=\"syncDirty\""])assert.ok(dialog.includes(token),token)});
  it("preserva valores persistidos",()=>{for(const token of["value: 'before'","value: 'after'","code: 'VES'","code: 'USD'","code: 'EUR'"])assert.ok(dialog.includes(token),token)});
  it("conserva foco inicial",()=>{assert.ok(shared.includes("defineExpose({focus:"));assert.ok(dialog.includes('ref="firstInput"'));assert.ok(dialog.includes("firstInput.value?.focus()"))});
});