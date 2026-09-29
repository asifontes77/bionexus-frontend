import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const view = readFileSync("src/views/AntibioticsView.vue", "utf8");
const dialog = readFileSync("src/components/antibiotics/AntibioticDialog.vue", "utf8");
const state = readFileSync("src/components/antibiotics/AntibioticStateDialog.vue", "utf8");
const theme = readFileSync("src/styles/components.css", "utf8");

describe("Antibiotics current visual standard", () => {
  it("uses shared grid, filter, toggle and general errors", () => {
    for (const token of ["BioNexusDataGrid", "BioNexusOptionFilter", "BioNexusGridToggleCell", "BioNexusFormErrors"]) assert.ok(view.includes(token), token);
    assert.ok(view.includes('{ value: true, label: "Activo" }'));
    assert.ok(view.includes('{ value: false, label: "Desactivado" }'));
  });

  it("keeps local stable insertion and status confirmation", () => {
    for (const token of ["compareAntibiotics", "rows.value.splice(currentIndex, 1)", "insertIndex"]) assert.ok(view.includes(token), token);
    assert.ok(state.includes("BioNexusStateDialog"), "BioNexusStateDialog");
    assert.ok(view.includes('variant: row.annulled ? "default" : "danger"'));
    assert.ok(!view.includes("rows.value = next.sort"));
  });

  it("uses the approved shared dialog contracts", () => {
    for (const token of ["BioNexusDialog", "BioNexusSectionPanel", "BioNexusFormField", "BioNexusFormErrors", "BioNexusConfirmDialog", "BioNexusActionButton", "markSaved"]) assert.ok(dialog.includes(token), token);
    assert.ok(dialog.includes("50 caracteres"));
    assert.ok(dialog.includes("10 caracteres. Opcional"));
  });

  it("keeps view-specific CSS scoped and out of the theme", () => {
    assert.ok(view.includes("<style scoped>"));
    assert.ok(dialog.includes("<style scoped>"));
    assert.ok(view.includes(":deep(.ag-pinned-right-header)"));
    assert.ok(dialog.includes(":deep(.antibiotic-entry-dialog .bio-nexus-dialog-body)"));

    assert.ok(!theme.includes("BIO NEXUS ANTIBIOTICS ADMIN START"));
    assert.ok(!theme.includes(".antibiotics-page"));
    assert.ok(!theme.includes(".antibiotic-entry-dialog"));
  });

  it("preserves optional initials and the shared state dialog", () => {
    assert.ok(dialog.includes('maxlength="10"'));
    assert.ok(state.includes("BioNexusStateDialog"));
  });
});

it('Antibioticos usa el layout global entre errores y seccion', () => {
  assert.ok(dialog.includes('<BioNexusFormLayout>'));
  assert.ok(dialog.includes('<BioNexusFormErrors :errors="errorMessage"'));
  assert.ok(dialog.includes('<BioNexusSectionPanel'));
  assert.ok(dialog.includes('</BioNexusFormLayout>'));
  assert.ok(!dialog.includes('antibiotic-dialog-stack'));
  assert.ok(!dialog.includes(':deep(.antibiotic-entry-dialog .bio-nexus-form-errors)'));
});
