import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const view = readFileSync(join(process.cwd(), "src/views/SpecialTestsView.vue"), "utf8");
const stateStart = view.indexOf("async function saveState(row)");
const stateClose = "}finally{saving.value=false}}";
const stateCloseIndex = view.indexOf(stateClose, stateStart);
const stateBlock = stateStart >= 0 && stateCloseIndex > stateStart
  ? view.slice(stateStart, stateCloseIndex + stateClose.length)
  : "";

describe("SpecialTestsView state refresh contract", () => {
  it("reemplaza inmediatamente la fila con la respuesta normalizada del PATCH", () => {
    assert.ok(view.includes("function replaceRow(saved)"));
    assert.ok(stateBlock.includes("const saved=await updateSpecialTestLab(row.id,{annulled:!row.annulled})"));
    assert.ok(stateBlock.includes("replaceRow(saved)"));
  });

  it("usa el resultado normalizado, crea nuevas referencias reactivas y conserva el orden", () => {
    assert.ok(view.includes("rows.value.map(row=>row.id===saved.id?saved:row)"));
    assert.ok(view.includes("rows.value=next.sort((a,b)=>a.description.localeCompare(b.description,'es'))"));
  });

  it("aísla saveState y no depende de una recarga bloqueada mientras saving está activo", () => {
    assert.ok(stateStart >= 0 && stateCloseIndex > stateStart);
    assert.ok(!stateBlock.includes("await loadRows()"));
  });
});

