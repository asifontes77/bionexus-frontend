import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";
const shared=readFileSync("src/components/ui/BioNexusSearchableSelect.vue","utf8"),dialog=readFileSync("src/components/ui/BioNexusDialog.vue","utf8"),currency=readFileSync("src/components/currencies/CurrencyDialog.vue","utf8");
describe("Global editable select dialog top layer",()=>{
  it("confirma que BioNexusDialog usa la top layer nativa",()=>{assert.ok(dialog.includes("<dialog"));assert.ok(dialog.includes("showModal()"))});
  it("teleporta al dialogo abierto que contiene el selector",()=>{assert.ok(shared.includes('<Teleport :to="teleportTarget">'));assert.ok(shared.includes('const dialog=root.value?.closest?.("dialog[open]")||null'));assert.ok(shared.includes("teleportTarget.value=dialog||document.body"));assert.ok(!shared.includes('<Teleport to="body">'))});
  it("mantiene posicionamiento respecto al viewport",()=>{assert.ok(shared.includes('position:dialog?"absolute":"fixed"'));assert.ok(shared.includes("getBoundingClientRect"));assert.ok(shared.includes("placement.value=openAbove"))});
  it("mantiene la capa del popover dentro de la top layer",()=>{assert.ok(shared.includes("z-index:2147483000"))});
  it("Monedas usa la fundacion corregida",()=>{assert.ok(currency.includes('id="currency-code"'));assert.ok(currency.includes('id="currency-position"'));assert.ok(!currency.includes("<select"))});
});