import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const source = readFileSync(join(process.cwd(),"src/components/examcatalog/ExamPriceAdjustmentScopeDialog.vue"),"utf8");
describe("Price adjustment global exam search",()=>{
  it("ofrece busqueda global por nombre o abreviatura",()=>{for(const token of ["Buscar en todo el catálogo","Nombre o abreviatura del examen","searchExamCatalog","searchGlobal"])assert.ok(source.includes(token),token)});
  it("muestra resultados en BioNexusDataGrid",()=>{assert.ok(source.includes("BioNexusDataGrid"));assert.ok(source.includes("Resultados globales"));assert.ok(source.includes('mode.value = "global"'))});
  it("oculta examenes ya incluidos",()=>{assert.ok(source.includes("excluded.value.has"));assert.ok(source.includes("Los exámenes ya incluidos permanecen ocultos"))});
  it("carga el registro completo antes de agregar un resultado global",()=>{assert.ok(source.includes("getExam(row.id)"));assert.ok(source.includes('mode.value === "global"'))});
  it("preserva seleccion por grupo y operaciones masivas",()=>{for(const token of ["BioNexusLiveSearchSelect","Agregar grupo completo","Agregar todos los exámenes","confirmSelected"])assert.ok(source.includes(token),token)});
  it("mantiene confirmacion de inactivos",()=>{assert.ok(source.includes("showInactiveOption: true"));assert.ok(source.includes("includeInactive"))});
});
