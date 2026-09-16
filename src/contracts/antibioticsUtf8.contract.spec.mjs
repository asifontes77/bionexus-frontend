import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
const state = readFileSync("src/components/antibiotics/AntibioticStateDialog.vue", "utf8");
const view = readFileSync("src/views/AntibioticsView.vue", "utf8");
describe("Antibiotics UTF-8 contract", () => {
  it("preserves approved Spanish text without mojibake", () => {
    for (const value of ["Activar antibi\u00f3tico", "volver\u00e1", "permanecer\u00e1"]) assert.ok(state.includes(value));
    for (const value of ["antibi\u00f3ticos", "Descripci\u00f3n", "registro v\u00e1lido"]) assert.ok(view.includes(value));
    assert.ok(!state.includes("\u00c3") && !state.includes("\u00c2"));
    assert.ok(!view.includes("\u00c3") && !view.includes("\u00c2"));
  });
});
