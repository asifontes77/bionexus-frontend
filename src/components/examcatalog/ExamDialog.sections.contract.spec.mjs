import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const read=path=>readFileSync(join(process.cwd(),path),"utf8");
const dialog=read("src/components/examcatalog/ExamDialog.vue");
const theme=read("src/styles/components.css");
describe("Exam dialog shared sections",()=>{
  it("usa dos secciones accent compartidas",()=>{
    assert.match(dialog,/title="Información del examen"[^>]*icon="science"[^>]*variant="accent"/);
    assert.match(dialog,/title="Tarifas"[^>]*icon="price_change"[^>]*variant="accent"/);
  });
  it("preserva todos los campos funcionales",()=>{
    for(const token of ["exam-description","exam-abbreviation","exam-tax","special_test","tariffFields","cost1","cost6"])assert.ok(dialog.includes(token),token);
  });
  it("preserva dirty state y cierre controlado",()=>{
    for(const token of ["hasChanges","prevent-close","before-close","discardDialog","Descartar cambios"])assert.ok(dialog.includes(token),token);
  });
  it("elimina panel y estilos locales anteriores",()=>{
    assert.ok(!dialog.includes("exam-price-panel"));
    assert.ok(!dialog.includes("<style"));
  });
  it("centraliza layout y responsive",()=>{
    for(const token of ["BIO NEXUS EXAM ENTRY SECTIONS START",".exam-main-grid",".exam-price-grid","exam-entry-dialog","@media (max-width: 720px)"])assert.ok(theme.includes(token),token);
  });
});