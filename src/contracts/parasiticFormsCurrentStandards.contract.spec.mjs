import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

const dialog = fs.readFileSync("src/components/parasiticforms/ParasiticformDialog.vue", "utf8");
const view = fs.readFileSync("src/views/ParasiticformsView.vue", "utf8");

describe("Formas parasitarias usa estándares actuales", () => {
  it("usa layout, errores, panel y field compartidos", () => {
    for (const token of ["BioNexusFormLayout", "BioNexusFormErrors", "BioNexusSectionPanel", "BioNexusFormField"]) assert.ok(dialog.includes(token), token);
  });

  it("ubica el error general antes del panel", () => assert.ok(dialog.indexOf("<BioNexusFormErrors") < dialog.indexOf("<BioNexusSectionPanel")));

  it("usa panel accent con icono y descripción", () => {
    for (const token of ['icon="microbiology"', 'variant="accent"', 'description="Define la descripción que identifica la forma parasitaria."']) assert.ok(dialog.includes(token), token);
  });

  it("protege maxlength y contador", () => {
    assert.ok(dialog.includes('maxlength="50"'));
    assert.ok(dialog.includes("draft.description.length + ' de 50 caracteres'") || dialog.includes("draft.description.length+' de 50 caracteres'"));
  });

  it("protege descarte por Cancelar, X y Esc", () => {
    for (const token of ["BioNexusConfirmDialog", ':prevent-close="saving || changed"', '@before-close="requestClose"', '@click="requestClose"', 'title: "Descartar cambios"']) assert.ok(dialog.includes(token), token);
  });

  it("deshabilita guardar vacío o sin cambios", () => {
    assert.ok(dialog.includes('normalizedDescription.value === ""'));
    assert.ok(dialog.includes('!changed.value'));
  });

  it("mantiene grid, filtro, switch y estado compartidos", () => {
    for (const token of ["BioNexusDataGrid", "BioNexusGridToggleCell", "BioNexusOptionFilter", "ParasiticformStateDialog"]) assert.ok(view.includes(token), token);
  });

  it("protege Activar neutro y Desactivar danger", () => assert.ok(view.includes('variant: record.annulled ? "default" : "danger"')));

  it("mantiene actualización local y orden", () => {
    assert.ok(view.includes("replaceRecord(updated)"));
    assert.ok(view.includes("localeCompare"));
  });

  it("elimina el formulario particular heredado", () => {
    assert.ok(!dialog.includes("parasiticform-dialog-body"));
    assert.ok(!dialog.includes("bio-nexus-message-error"));
    assert.ok(!dialog.includes("<style scoped>"));
  });
});
