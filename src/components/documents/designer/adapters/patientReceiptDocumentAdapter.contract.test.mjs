import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const adapter=await readFile(new URL("./patientReceiptDocumentAdapter.js",import.meta.url),"utf8");
const view=await readFile(new URL("../../../../views/PatientReceiptDocumentDesignerView.vue",import.meta.url),"utf8");
const engine=await readFile(new URL("../useDocumentDesignerEngine.js",import.meta.url),"utf8");

test("encapsula el dominio patient-receipt",()=>{
  for(const token of ["documentType:'patient-receipt'",'templates:Object.freeze','tokenCatalog:Object.freeze','examFieldOptions:Object.freeze','sampleExamRows:Object.freeze','sampleSummary:Object.freeze']) assert.ok(adapter.includes(token),token);
});

test("la vista consume el adaptador y no redefine catalogos",()=>{
  assert.ok(view.includes('patientReceiptDocumentAdapter'));
  assert.ok(view.includes('const DOCUMENT_TYPE=patientReceiptDocumentAdapter.documentType;'));
  assert.equal(view.includes('const receiptTemplates=Object.freeze(['),false);
  assert.equal(view.includes('const tokenCatalog=Object.freeze(['),false);
  assert.equal(view.includes('function examSampleRows(){return[{'),false);
});

test("preserva los limites entre adaptador vista y motor compartido",()=>{
  for(const token of ['Konva.Stage','createMarginGuides','patientReceiptDocumentAdapter','useDocumentDesignerEngine']) assert.ok(view.includes(token),token);
  for(const token of ['documentSnapshot','pushHistory','undo','redo','loadDocument','saveDocument','saveDocumentDesign(documentId']) assert.ok(engine.includes(token),token);
  for(const token of ['patientReceiptDocumentAdapter','patient-receipt','Comprobante','examFieldOptions','tokenCatalog']) assert.equal(engine.includes(token),false,token);
  assert.equal(view.includes('saveDocumentDesign(documentId'),false);
});
