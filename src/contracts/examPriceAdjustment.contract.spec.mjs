import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const read = path => readFileSync(join(process.cwd(), path), "utf8");
const view = read("src/views/ExamCatalogView.vue");
const dialog = read("src/components/examcatalog/ExamPriceAdjustmentDialog.vue");
const preview = read("src/components/examcatalog/ExamPriceAdjustmentPreviewDialog.vue");
const scope = read("src/components/examcatalog/ExamPriceAdjustmentScopeDialog.vue");
const service = read("src/services/examCatalogService.js");
describe("Exam price adjustment frontend", () => {
  it("integra Ajustar precios y preserva el Diseñador", () => { for (const token of ["Ajustar precios","applyPriceAdjustment","Diseñador matricial","openResultGridDesigner"]) assert.ok(view.includes(token), token); });
  it("admite aumento y disminucion sobre lista editable", () => { for (const token of ['value="increase"','value="decrease"',"Exámenes incluidos","Quitar seleccionados","Limpiar lista"]) assert.ok(dialog.includes(token), token); });
  it("permite grupos y catalogo completo", () => { for (const token of ["Agregar grupo completo","Agregar todos los exámenes","Agregar seleccionados"]) assert.ok(scope.includes(token), token); });
  it("usa un grid principal y otro en la vista previa separada", () => { assert.equal((dialog.match(/<BioNexusDataGrid/g)||[]).length,1); assert.equal((preview.match(/<BioNexusDataGrid/g)||[]).length,1); assert.ok(!dialog.includes("<table")); });
  it("envia solamente examIds finales", () => { assert.ok(service.includes("/api/examlists/price-adjustment")); assert.ok(dialog.includes("examIds:workingRecords.value.map")); assert.ok(!dialog.includes("groupId:Number")); assert.ok(!dialog.includes("scope:scope.value")); });
  it("preserva pagina y seleccion", () => { for (const token of ["paginationGetCurrentPage","paginationGoToPage","selectedIds","setSelected"]) assert.ok(view.includes(token), token); });
});
