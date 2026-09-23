import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const read=path=>readFileSync(join(process.cwd(),path),"utf8");
const dialog=read("src/components/examcatalog/ExamDetailDialog.vue");
const theme=read("src/styles/components.css");
describe("Exam detail shared sections",()=>{
  it("usa tres secciones accent",()=>{
    assert.match(dialog,/title="Información del examen"[^>]*icon="science"[^>]*variant="accent"/);
    assert.match(dialog,/title="Tarifas"[^>]*icon="price_change"[^>]*variant="accent"/);
    assert.match(dialog,/title="Configuración del resultado"[^>]*icon="settings"[^>]*variant="accent"/);
  });
  it("preserva toda la informacion",()=>{
    for(const token of ["exam.description","exam.abbreviation","group?.description","exam.annulled","exam.special_test","taxLabel","tariffFields","hasWorksheet","hasResultFormat"])assert.ok(dialog.includes(token),token);
  });
  it("preserva footer y formato regional",()=>{
    for(const token of ["BioNexusActionButton","formatRegionalNumber","formatUsdPrice","baseCurrencySymbol"])assert.ok(dialog.includes(token),token);
  });
  it("elimina secciones y CSS local anteriores",()=>{
    assert.ok(!dialog.includes("exam-detail-section"));
    assert.ok(!dialog.includes("<style"));
  });
  it("centraliza layout responsive",()=>{
    for(const token of ["BIO NEXUS EXAM DETAIL SECTIONS START",".exam-detail-summary",".exam-price-grid",".exam-config-grid","@media (max-width: 680px)"])assert.ok(theme.includes(token),token);
  });
});