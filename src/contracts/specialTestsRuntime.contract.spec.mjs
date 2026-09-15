import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const view = readFileSync("src/views/SpecialTestsView.vue", "utf8");

describe("SpecialTestsView runtime contract", () => {
  it("imports the item creator used during reconciliation", () => {
    assert.ok(view.includes("createSpecialTestItem,createSpecialTestLab"));
    assert.ok(view.includes("await createSpecialTestItem("));
  });
});
