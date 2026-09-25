import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const dialog=readFileSync("src/components/antibiotics/AntibioticDialog.vue","utf8");
const state=readFileSync("src/components/antibiotics/AntibioticStateDialog.vue","utf8");
const view=readFileSync("src/views/AntibioticsView.vue","utf8");
const theme=readFileSync("src/styles/components.css","utf8");
describe("Antibiotics visual standard",()=>{
  it("usa grid y acciones compartidas",()=>{for(const token of ["BioNexusDataGrid","BioNexusActionButton","BioNexusContextMenu","BioNexusGridActionsCell","BioNexusGridToggleCell","BioNexusOptionFilter","search-enabled","refresh-enabled","page-size-selector","row-context-menu"])assert.ok(view.includes(token),token);assert.ok(!view.includes("<button"));});
  it("estandariza Crear y Editar",()=>{for(const token of ["BioNexusSectionPanel","Información del antibiótico","variant=\"accent\"","BioNexusFormField","BioNexusFormErrors","BioNexusActionButton","BioNexusConfirmDialog","prevent-close","before-close","requestClose","dirty","submitDisabled","firstInput"])assert.ok(dialog.includes(token),token);assert.ok(!dialog.includes("<button")&&!dialog.includes("<style"));});
  it("preserva reglas funcionales",()=>{for(const token of ["description.trim().toUpperCase()","siglas.trim().toUpperCase()","maxlength=\"50\"","maxlength=\"10\"","10 caracteres. Opcional","canCreate","canUpdate","emit(\"submit\""])assert.ok(dialog.includes(token),token);});
  it("preserva dialogo compartido de estado",()=>{assert.ok(state.includes("BioNexusStateDialog"));for(const token of ["Activar antibiótico","Desactivar antibiótico","volverá","permanecerá"])assert.ok(state.includes(token),token);});
  it("centraliza CSS",()=>{for(const token of ["BIO NEXUS ANTIBIOTICS ADMIN START",".antibiotic-section{",".antibiotic-section .bio-nexus-section-panel-body{display:grid;gap:var(--bio-nexus-space-6)}",".antibiotics-grid :is(.ag-pinned-right-header)"])assert.ok(theme.includes(token),token);});
});
