import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const read = path => readFileSync(join(process.cwd(),path),"utf8");
const dialog = read("src/components/examcatalog/ExamPriceAdjustmentDialog.vue");
const preview = read("src/components/examcatalog/ExamPriceAdjustmentPreviewDialog.vue");
describe("Price adjustment preview emphasis and export",()=>{
  it("resalta el acceso a la vista previa",()=>{for(const token of ["preview-action","bio-nexus-action-primary","BioNexusActionIcon","border-left:5px","linear-gradient","preview-attention"])assert.ok(dialog.includes(token),token)});
  it("mantiene el acceso antes del grid",()=>{assert.ok(dialog.indexOf("Vista previa")<dialog.indexOf("Exámenes incluidos"))});
  it("habilita exportacion real en el grid",()=>{assert.ok(preview.includes(':export-options="exportOptions"'));assert.ok(!preview.includes(':export-options="false"'));assert.ok(preview.includes('fileName:"ajuste-precios-vista-previa"'))});
  it("mantiene el grid explicito sin texto redundante",()=>{assert.ok(preview.includes("BioNexusDataGrid"));assert.ok(!preview.includes("Puede exportar esta vista previa a Excel o PDF desde el grid."))});
});
