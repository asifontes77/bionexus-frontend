import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const read = path => readFileSync(join(process.cwd(), path), "utf8");
const dialog = read("src/components/examcatalog/ExamPriceAdjustmentDialog.vue");
const preview = read("src/components/examcatalog/ExamPriceAdjustmentPreviewDialog.vue");
const scope = read("src/components/examcatalog/ExamPriceAdjustmentScopeDialog.vue");
const actions = read("src/components/grid/BioNexusGridActionsCell.vue");
describe("Price adjustment editable workspace", () => {
  it("usa grids aprobados sin tabla manual", () => { assert.equal((dialog.match(/<BioNexusDataGrid/g)||[]).length,1); assert.equal((preview.match(/<BioNexusDataGrid/g)||[]).length,1); assert.ok(!dialog.includes("<table")); });
  it("agrega varios grupos y todo el catalogo", () => { for (const token of ["Agregar grupo completo","Agregar todos los exámenes","getExamsByGroup","cache"]) assert.ok(scope.includes(token), token); });
  it("permite quitar individual y multiple", () => { for (const token of ["Quitar seleccionados","Limpiar lista","removeSelected","remove(row.id)"]) assert.ok(dialog.includes(token), token); });
  it("envia la lista final", () => { assert.ok(dialog.includes("examIds:workingRecords.value.map")); });
  it("detiene propagacion", () => { assert.ok(actions.includes("event?.stopPropagation?.()")); });
});
