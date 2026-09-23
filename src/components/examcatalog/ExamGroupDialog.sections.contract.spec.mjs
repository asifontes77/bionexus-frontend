import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const source=readFileSync(join(process.cwd(),"src/components/examcatalog/ExamGroupDialog.vue"),"utf8");
describe("Exam group shared section",()=>{
  it("usa una seccion accent compartida",()=>{
    assert.match(source,/title="Información del grupo"[^>]*icon="folder"[^>]*variant="accent"/);
  });
  it("preserva el unico campo y sus validaciones",()=>{
    for(const token of ["BioNexusFormField","openCreate","openEdit","submitDisabled","descriptionError"])assert.ok(source.includes(token),token);
  });
  it("preserva footer, cierre y guardado",()=>{
    for(const token of ["template #footer","Cancelar","Crear","Guardar","BioNexusDialog"])assert.ok(source.includes(token),token);
  });
  it("no duplica el titulo del dialogo",()=>{
    assert.equal((source.match(/Información del grupo/g)||[]).length,1);
  });
});
