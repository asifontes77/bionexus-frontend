import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const read = path => readFileSync(join(process.cwd(), path), "utf8");
const dialog = read("src/components/examcatalog/ExamPriceAdjustmentDialog.vue");
const scope = read("src/components/examcatalog/ExamPriceAdjustmentScopeDialog.vue");
const preview = read("src/components/examcatalog/ExamPriceAdjustmentPreviewDialog.vue");
const liveSearch = read("src/components/ui/BioNexusLiveSearchSelect.vue");
const confirm = read("src/components/examcatalog/ExamPriceAdjustmentConfirmDialog.vue");
describe("Price adjustment refined UI", () => {
  it("valida porcentaje al intentar y filtra letras", () => { for (const token of ["showErrors ? percentageError","percentagePlaceholder","onPercentageInput","[^0-9"]) assert.ok(dialog.includes(token), token); });
  it("oculta agregados y notifica", () => { for (const token of ["excludedIds","excluded.value.has","toast.success","agregado(s) a la lista"]) assert.ok(scope.includes(token), token); });
  it("usa el select reutilizable con LiveSearch para grupos", () => {
    assert.ok(scope.includes("BioNexusLiveSearchSelect"));
    assert.ok(scope.includes('search-placeholder="Buscar grupo"'));
    for (const token of ['type="search"', "searchPlaceholder", "filtered", "bio-live-options"])
      assert.ok(liveSearch.includes(token), token);
  });
  it("confirma operaciones masivas", () => { assert.ok(scope.includes("confirmGroup")); assert.ok(scope.includes("confirmAll")); assert.ok(confirm.includes("Sí, agregar")); });
  it("abre vista previa separada con grid aprobado", () => { assert.ok(dialog.includes("Abrir vista previa")); assert.ok(dialog.includes("ExamPriceAdjustmentPreviewDialog")); assert.ok(preview.includes("BioNexusDataGrid")); assert.ok(!dialog.includes("previewColumns")); });
  it("mantiene ancho completo", () => { assert.ok(dialog.includes("width:100%;min-width:0")); assert.ok(scope.includes("width:100%;min-width:0")); assert.ok(preview.includes("width:100%;min-width:0")); });
});

