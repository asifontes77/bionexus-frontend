import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const view=fs.readFileSync("src/views/PatientReceiptDocumentDesignerView.vue","utf8");
const dialog=fs.readFileSync("src/components/documents/designer/DesignerTextPropertiesDialog.vue","utf8");
const editor=fs.readFileSync("src/components/documents/rich-text/RichTextEditorDialog.vue","utf8");

test("panel Propiedades no duplica la edicion rich text",()=>{
  assert.doesNotMatch(view,/class="designer-panel-section text-block-panel"/);
  assert.doesNotMatch(view,/text-content-/);
  assert.doesNotMatch(view,/insertTokenIntoSelectedText/);
  assert.doesNotMatch(view,/refreshSelectedTextBlock/);
  assert.doesNotMatch(view,/<strong>Bloque de texto<\/strong>/);
  assert.doesNotMatch(view,/<strong>Insertar token<\/strong>/);
});

test("dialogo rich text sigue siendo la unica entrada de edicion",()=>{
  for(const token of [
    "textPropertiesDialog?.openCreate()",
    "textPropertiesDialog.value?.openEdit(clonePlain(model))",
    "Editar propiedades",
    "dblclick dbltap",
    "applyTextProperties"
  ]) assert.ok(view.includes(token),token);
  assert.match(dialog,/RichTextEditorDialog/);
  assert.match(dialog,/openCreate/);
  assert.match(dialog,/openEdit/);
  assert.match(editor,/defineExpose\(\{ openCreate, openEdit \}\)/);
});

test("modelo y render rich text permanecen intactos",()=>{
  assert.match(view,/richTextRuns\(model\.html,model\.text,laboratoryPreviewContext\.value,defaults\)/);
  assert.match(view,/Object\.assign\(model,payload\.values\)/);
});
