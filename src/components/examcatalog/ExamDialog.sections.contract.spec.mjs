import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const dialog=readFileSync("src/components/examcatalog/ExamDialog.vue","utf8");
describe("Exam dialog compact shared sections",()=>{
  it("usa dos SectionPanel accent",()=>{
    assert.match(dialog,/title="Información del examen"[^>]*icon="science"[^>]*variant="accent"/);
    assert.match(dialog,/title="Tarifas"[^>]*icon="price_change"[^>]*variant="accent"/);
  });
  it("preserva layout compacto de informacion",()=>{
    assert.ok(dialog.includes(".exam-main-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: var(--bio-nexus-space-3); align-items: start; }"));
    for(const token of ["exam-description","exam-abbreviation","exam-tax","special_test","draft.description.length + ' de 60 caracteres'","draft.abbreviation.length + ' de 10 caracteres'"])assert.ok(dialog.includes(token),token);
  });
  it("preserva tarifas en tres columnas",()=>{
    assert.ok(dialog.includes(".exam-price-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--bio-nexus-space-3); }"));
    for(const token of ["tariffFields","cost1","cost6"])assert.ok(dialog.includes(token),token);
  });
  it("ubica errores según su responsabilidad",()=>{
    const generalError='<BioNexusFormErrors :errors="errorMessage" />';
    assert.ok(dialog.indexOf(generalError)>-1);
    assert.ok(dialog.indexOf(generalError)<dialog.indexOf('title="Información del examen"'));
    assert.ok(dialog.includes(':error="descriptionError"'));
    assert.ok(dialog.includes(':error="abbreviationError"'));
    assert.ok(dialog.includes("align-items: start"));
  });  it("limpia alertas generales cuando el formulario cambia",()=>{
    assert.ok(dialog.includes('function handleFormMutation() { clearError(); }'));
    assert.equal((dialog.match(/@input="handleFormMutation"/g)||[]).length,3);
    assert.equal((dialog.match(/@change="handleFormMutation"/g)||[]).length,2);
  });  it("preserva responsive y cierre controlado",()=>{
    for(const token of ["@media (max-width: 720px)","hasChanges","prevent-close","before-close","discardDialog","Descartar cambios"])assert.ok(dialog.includes(token),token);
  });
  it("elimina solo el panel legacy de tarifas",()=>{
    assert.ok(!dialog.includes("exam-price-panel"));
    assert.ok(dialog.includes("<style scoped>"));
  });
});
