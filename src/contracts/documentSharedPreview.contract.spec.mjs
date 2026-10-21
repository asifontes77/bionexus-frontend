import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const component=readFileSync("src/components/documents/BioNexusDocumentPreview.vue","utf8");
const dialog=readFileSync("src/components/documents/DocumentDefinitionPreviewDialog.vue","utf8");
const designer=readFileSync("src/views/PatientReceiptDocumentDesignerView.vue","utf8");
test("grid y diseñador consumen el render documental compartido",()=>{assert.ok(component.includes("elementHtml"));assert.ok(dialog.includes("<BioNexusDocumentPreview"));assert.ok(designer.includes("<BioNexusDocumentPreview"));});
test("el preview interno reemplaza el canvas Konva",()=>{assert.ok(designer.includes('v-if="preview"'));assert.ok(designer.includes('v-else class="stage-scaler"'));});
test("el componente final excluye guías de edición",()=>{for(const token of ["safe-area-guide","Konva.Transformer","margin-guide-"])assert.equal(component.includes(token),false,token);});
