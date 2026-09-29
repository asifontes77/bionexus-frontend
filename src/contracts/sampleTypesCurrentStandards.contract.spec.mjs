import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
const dialog=fs.readFileSync("src/components/sampletypes/SampleTypeDialog.vue","utf8");
const view=fs.readFileSync("src/views/SampleTypesView.vue","utf8");
describe("Tipos de muestra usa estándares actuales",()=>{
 it("usa componentes compartidos del formulario",()=>{for(const token of ["BioNexusFormLayout","BioNexusFormErrors","BioNexusSectionPanel","BioNexusFormField"])assert.ok(dialog.includes(token),token);});
 it("ubica el error general antes del panel",()=>assert.ok(dialog.indexOf("<BioNexusFormErrors")<dialog.indexOf("<BioNexusSectionPanel")));
 it("usa panel accent con icono y descripción",()=>{for(const token of ['icon="science"','variant="accent"','description="Define la descripción que identifica el tipo de muestra."'])assert.ok(dialog.includes(token),token);});
 it("protege maxlength y contador",()=>{assert.ok(dialog.includes('maxlength="50"'));assert.ok(dialog.includes("draft.description.length + ' de 50 caracteres'"));});
 it("protege el descarte por X, Cancelar y Esc",()=>{for(const token of ["BioNexusConfirmDialog",':prevent-close="saving || changed"','@before-close="requestClose"','@click="requestClose"','title: "Descartar cambios"'])assert.ok(dialog.includes(token),token);});
 it("deshabilita guardar vacío o sin cambios",()=>{assert.ok(dialog.includes('normalizedDescription.value === ""'));assert.ok(dialog.includes('!changed.value'));});
 it("preserva el grid, filtro, switch y estado compartidos",()=>{for(const token of ["BioNexusDataGrid","BioNexusGridToggleCell","BioNexusOptionFilter","SampleTypeStateDialog"])assert.ok(view.includes(token),token);});
 it("protege Activar neutro y Desactivar danger",()=>assert.ok(view.includes("variant:row.annulled?'default':'danger'")));
 it("preserva actualización local y orden",()=>{assert.ok(view.includes("replaceRow(saved)"));assert.ok(view.includes("localeCompare"));});
 it("elimina parches particulares del diálogo",()=>{assert.ok(!dialog.includes("sample-type-form"));assert.ok(!dialog.includes("sample-type-save-disabled"));assert.ok(!dialog.includes("bio-nexus-message-error"));assert.ok(!dialog.includes("<style scoped>"));});
});
it("normaliza las acciones editables del maestro a creación y edición", () => {
  assert.ok(view.includes("authorization.hasPermission('sample-types.create')"), "SAMPLE_TYPES_MASTER_CREATE_PERMISSION");
  assert.ok(view.includes("authorization.hasPermission('sample-types.update')"), "SAMPLE_TYPES_MASTER_UPDATE_PERMISSION");
  assert.ok(!view.includes("sample-types.change-status"), "SAMPLE_TYPES_NO_HISTORICAL_CHANGE_STATUS_PERMISSION");
});
