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

it("estandariza contador errores y acciones",()=>{
  for(const token of ["de máximo 150 caracteres","BioNexusFormErrors","BioNexusActionButton","icon=\"cancel\"",":loading=\"saving\""])assert.ok(source.includes(token),token);
  assert.ok(!source.includes("bio-nexus-message-error"));
  assert.ok(!source.includes("class=\"bio-nexus-action bio-nexus-action-secondary\""));
  assert.ok(!source.includes("class=\"bio-nexus-action bio-nexus-action-primary\""));
});

it("ubica el error general antes del contenido",()=>{
  const errorIndex=source.indexOf("<BioNexusFormErrors");
  const panelIndex=source.indexOf("<BioNexusSectionPanel");
  assert.ok(errorIndex>=0,"BioNexusFormErrors");
  assert.ok(panelIndex>=0,"BioNexusSectionPanel");
  assert.ok(errorIndex<panelIndex,"BioNexusFormErrors debe estar antes del panel principal");
  assert.equal((source.match(/<BioNexusFormErrors\b/g)||[]).length,1);
});


it("separa el error general del panel principal",()=>{
  assert.match(source,/class="exam-group-dialog__errors"/);
  assert.match(source,/\.exam-group-dialog__errors\s*\{[\s\S]*?margin-bottom:/);
  const errorIndex=source.indexOf("<BioNexusFormErrors");
  const panelIndex=source.indexOf("<BioNexusSectionPanel");
  assert.ok(errorIndex>=0&&panelIndex>=0&&errorIndex<panelIndex);
});
