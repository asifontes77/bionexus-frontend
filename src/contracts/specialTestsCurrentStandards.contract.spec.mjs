import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const dialog=readFileSync("src/components/specialtests/SpecialTestLabDialog.vue","utf8");
const view=readFileSync("src/views/SpecialTestsView.vue","utf8");
describe("Laboratorios de referencia current standards",()=>{
  it("usa estructura compartida de Rutinas y Examenes",()=>{for(const token of ["BioNexusFormErrors","BioNexusSectionPanel","Información del laboratorio","Gestión de exámenes","variant=\"accent\""])assert.ok(dialog.includes(token),token);assert.equal((dialog.match(/<BioNexusSectionPanel\b/g)||[]).length,2)});
  it("usa botones circulares exactos",()=>{for(const token of ['variant="secondary" icon="visibility" icon-only shape="circle" label="Detalle"','variant="primary" icon="add" icon-only shape="circle" label="Agregar"','variant="danger" icon="delete" icon-only shape="circle" label="Quitar"'])assert.ok(dialog.includes(token),token)});
  it("bloquea Crear y Guardar segun validez dirty permisos y envio",()=>{for(const token of ["const isValid","!isValid.value","!dirty.value","props.saving","!canEditLab.value && !canEditItems.value",':disabled="submitDisabled"'])assert.ok(dialog.includes(token),token)});
  it("preserva errores y contadores",()=>{assert.ok(dialog.includes('<BioNexusFormErrors :errors="errorMessage" />'));for(const value of [60,200,100,255,30])assert.ok(dialog.includes(` de ${value} caracteres`));assert.ok(dialog.includes(':error="nameError"'))});
  it("usa cierre y confirmacion compartidos",()=>{for(const token of [':prevent-close="saving || dirty"','@before-close="requestClose"','discardDialog.value?.ask','confirmText: "Sí, salir y descartar cambios"'])assert.ok(dialog.includes(token),token)});
  it("estandariza grid y estado peligroso",()=>{assert.ok(view.includes("BioNexusActionButton"));assert.ok(view.includes("icon=\"create\" icon-only shape=\"rounded\""));assert.ok(view.includes("variant:r.annulled?undefined:'danger'"));assert.ok(view.includes("BioNexusGridToggleCell"));assert.ok(view.includes("BioNexusContextMenu"))});
  it("no conserva botones o mensajes legacy",()=>{assert.ok(!dialog.includes("<button"));assert.ok(!dialog.includes("BioNexusActionIcon"));assert.ok(!dialog.includes(':message="errorMessage"'));assert.ok(!view.includes("<button"))});
});
describe("Laboratorios de referencia backend errors and selected exams",()=>{
  it("muestra todo error Backend arriba y no lo convierte en error de Nombre",()=>{
    assert.ok(dialog.includes('<BioNexusFormErrors :errors="errorMessage" />'));
    assert.ok(dialog.includes('function setError(value) { errorMessage.value = String(value || ""); }'));
    assert.ok(!dialog.includes("nameServerError"));
  });
  it("mantiene Examenes seleccionados dentro del picker de dos columnas",()=>{
    const pickerStart=dialog.indexOf('<div class="special-test-picker">');
    const selectedStart=dialog.indexOf('<section class="special-test-panel selected-panel">');
    const panelClose=dialog.indexOf('</BioNexusSectionPanel>',pickerStart);
    assert.ok(pickerStart>=0&&selectedStart>pickerStart&&selectedStart<panelClose);
    assert.ok(dialog.includes('v-for="(item, index) in draft.items"'));
    assert.ok(dialog.includes('function add(exam) { draft.items.push'));
  });
});
