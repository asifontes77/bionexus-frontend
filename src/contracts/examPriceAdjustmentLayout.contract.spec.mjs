import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
const read = path => readFileSync(join(process.cwd(),path),"utf8");
const dialog = read("src/components/examcatalog/ExamPriceAdjustmentDialog.vue");
const preview = read("src/components/examcatalog/ExamPriceAdjustmentPreviewDialog.vue");
describe("Price adjustment compact layout",()=>{
  it("retira el texto introductorio",()=>{assert.ok(!dialog.includes("Puedes ajustar el grupo actual"));assert.ok(!dialog.includes("workspace-help"))});
  it("ubica formulario a la izquierda y tarifas a la derecha",()=>{assert.ok(dialog.includes("adjustment-top"));assert.ok(dialog.includes("grid-template-columns:minmax(280px,420px) minmax(0,1fr)"));assert.ok(dialog.indexOf('class="controls"')<dialog.indexOf('class="tariffs"'))});
  it("conserva layout responsive",()=>{assert.ok(dialog.includes("@media(max-width:900px)"));assert.ok(dialog.includes("@media(max-width:720px)"))});
  it("retira texto redundante pero conserva exportacion",()=>{assert.ok(!preview.includes("Puede exportar esta vista previa a Excel o PDF desde el grid."));assert.ok(preview.includes(':export-options="exportOptions"'));assert.ok(preview.includes('fileName:"ajuste-precios-vista-previa"'))});
});
