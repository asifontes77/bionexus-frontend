import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const source=readFileSync(join(process.cwd(),"src/views/TariffsView.vue"),"utf8");
describe("Tariff dialog shared section",()=>{
  it("usa una seccion accent compartida",()=>{
    assert.match(source,/title="Información de la tarifa"[^>]*icon="sell"[^>]*variant="accent"/);
  });
  it("preserva Nombre y Descripcion",()=>{
    for(const token of ['field-id="tariff-name"','field-id="tariff-description"','autofocus','maxlength="100"'])assert.ok(source.includes(token),token);
  });
  it("preserva Crear, Editar y cierre controlado",()=>{
    for(const token of ["openCreate","openEdit","hasChanges","requestCloseDialog","BioNexusConfirmDialog","Sí, salir y descartar cambios"])assert.ok(source.includes(token),token);
  });
  it("preserva el formulario y footer compartido",()=>{
    for(const token of ['id="tariff-form"','BioNexusActionButton','Cancelar','Crear','Guardar'])assert.ok(source.includes(token),token);
  });
  it("no duplica el titulo de la seccion",()=>{
    assert.equal((source.match(/Información de la tarifa/g)||[]).length,1);
  });
});
