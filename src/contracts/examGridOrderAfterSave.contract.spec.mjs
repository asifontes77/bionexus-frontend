import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const view=readFileSync("src/views/ExamCatalogView.vue","utf8");
describe("Exam grid order after save",()=>{
  it("reemplaza el examen en el mismo indice",()=>{
    assert.ok(view.includes('const index=exams.value.findIndex(x=>x.id===row.id)'));
    assert.ok(view.includes('const next=[...exams.value];next[index]=row;exams.value=next;return'));
  });
  it("agrega un examen nuevo al final sin reordenar los existentes",()=>{
    assert.ok(view.includes('exams.value=[...exams.value,row]'));
  });
  it("no aplica orden alfabetico implicito al refrescar una fila",()=>{
    assert.ok(!view.includes('exams.value.sort((a,b)=>a.description.localeCompare(b.description))'));
  });
  it("conserva la sincronizacion post-guardado del dialogo",()=>{
    assert.ok(view.includes('replaceExam(row);examDialog.value?.markSaved(row,p.mode==="create")'));
  });
});
