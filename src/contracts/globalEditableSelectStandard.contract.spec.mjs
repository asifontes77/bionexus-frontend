import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";
const shared=readFileSync("src/components/ui/BioNexusSearchableSelect.vue","utf8");
describe("Global editable select foundation",()=>{
  it("protege altura y capa global",()=>{assert.ok(shared.includes("height:46px"));assert.ok(shared.includes('<Teleport to="body">'));assert.ok(shared.includes("z-index:6000"));assert.ok(shared.includes('position:"fixed"'))});
  it("reposiciona al cambiar viewport",()=>{assert.ok(shared.includes('addEventListener("resize",onViewportChange)'));assert.ok(shared.includes('addEventListener("scroll",onViewportChange,true)'));assert.ok(shared.includes("openAbove"))});
});