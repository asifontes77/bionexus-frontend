import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const source=readFileSync(join(process.cwd(),"src/views/ExamOrderingView.vue"),"utf8");
describe("Exam ordering shared sections",()=>{
  it("usa dos SectionPanel accent",()=>{
    assert.match(source,/title="Grupos de exámenes"[^>]*icon="folder"[^>]*variant="accent"/);
    assert.match(source,/title="Orden del grupo"[^>]*icon="format_list_numbered"[^>]*variant="accent"/);
    assert.equal((source.match(/class="exam-order-section"/g)||[]).length,2);
  });
  it("preserva contadores en actions",()=>{
    assert.equal((source.match(/template #actions/g)||[]).length,2);
    assert.ok(source.includes("groups.length"));
    assert.ok(source.includes("exams.length"));
  });
  it("preserva ambas listas y ordenamiento",()=>{
    assert.equal((source.match(/class="exam-order-list"/g)||[]).length,2);
    for(const token of ["draggable=\"true\"","previewRow","autoScroll","moveSelected","keyboardSelection","SELECCIONADO","reorderExamGroups","reorderExams"])assert.ok(source.includes(token),token);
  });
  it("retira los paneles visuales anteriores",()=>{
    assert.ok(!/class="[^"]*exam-order-panel/.test(source));
    assert.ok(!source.includes("ORDEN GLOBAL"));
    assert.ok(!source.includes("<small>ORDEN DEL GRUPO</small>"));
  });
  it("preserva acciones, permisos y proteccion de salida",()=>{
    for(const token of ["Descartar","Guardar orden","canUpdate","beforeunload","onBeforeRouteLeave"])assert.ok(source.includes(token),token);
  });
});
