import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const shared = readFileSync("src/components/ui/BioNexusSearchableSelect.vue", "utf8");
describe("Global editable select first open scroll", () => {
  it("enfoca el buscador sin desplazar el dialogo", () => {
    assert.ok(shared.includes("searchInput.value?.focus({preventScroll:true})"));
    assert.ok(!shared.includes("searchInput.value?.focus()"));
  });
  it("preserva y restaura el scroll del dialogo", () => {
    for (const token of ["scrollTop=dialog?.scrollTop||0", "scrollLeft=dialog?.scrollLeft||0", "dialog.scrollTop=scrollTop", "dialog.scrollLeft=scrollLeft"])
      assert.ok(shared.includes(token), token);
  });
  it("retorna y expone foco sin scroll", () => {
    assert.ok(shared.includes("trigger.value?.focus({preventScroll:true})"));
    assert.ok(shared.includes("defineExpose({focus:()=>trigger.value?.focus({preventScroll:true})"));
  });
  it("conserva top layer y posicion relativa", () => {
    for (const token of ['<Teleport :to="teleportTarget">', 'position:dialog?"absolute":"fixed"', "rect.left-bounds.left", "rect.bottom-bounds.top"])
      assert.ok(shared.includes(token), token);
  });
});