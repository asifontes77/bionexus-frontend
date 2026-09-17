import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const source=readFileSync(join(process.cwd(),"src/components/examcatalog/ExamPriceAdjustmentScopeDialog.vue"),"utf8");
describe("Price adjustment compact global search",()=>{
  it("usa la altura efectiva aprobada de 38 px",()=>{assert.ok(source.includes("height:38px;min-height:38px;max-height:38px"));assert.ok(!source.includes(".global-search-input{all:unset;box-sizing:border-box;display:block;width:100%;height:54px"))});
  it("compacta input y boton",()=>{assert.ok(source.includes("padding:0 12px"));assert.ok(source.includes("grid-template-columns:minmax(0,1fr) 108px"))});
  it("preserva clases dedicadas",()=>{assert.ok(source.includes('class="global-search-input"'));assert.ok(source.includes("global-search-button"))});
  it("preserva busqueda global",()=>{for(const token of ["Buscar en todo el catálogo","searchGlobal","searchExamCatalog","Resultados globales"])assert.ok(source.includes(token),token)});
});
