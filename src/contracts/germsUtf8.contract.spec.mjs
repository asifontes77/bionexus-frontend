import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
const state = readFileSync("src/components/germs/GermStateDialog.vue", "utf8");
const view = readFileSync("src/views/GermsView.vue", "utf8");
describe("Germs UTF-8 contract", () => {
  it("preserves the approved Spanish labels without mojibake", () => {
    for (const value of ["volver\u00e1", "permanecer\u00e1", "estar\u00e1"]) assert.ok(state.includes(value));
    for (const value of ["g\u00e9rmenes", "Descripci\u00f3n", "devolvi\u00f3 un registro v\u00e1lido"]) assert.ok(view.includes(value));
    assert.ok(!state.includes("\u00c3") && !view.includes("\u00c3"));
  });
});
