import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const engine=await readFile(new URL("./useDocumentDesignerEngine.js",import.meta.url),"utf8");
const view=await readFile(new URL("../../../views/PatientReceiptDocumentDesignerView.vue",import.meta.url),"utf8");

test("encapsula estado historial y persistencia genéricos",()=>{
  for(const token of ['documentType','serializeDocument','restoreDocument','documentSnapshot','pushHistory','undo','redo','loadDocument','saveDocument','markSaved']) assert.ok(engine.includes(token),token);
});

test("no acopla el motor al dominio de comprobantes",()=>{
  for(const token of ['patientReceiptDocumentAdapter','patient-receipt','Comprobante','examFieldOptions','tokenCatalog']) assert.equal(engine.includes(token),false,token);
});

test("la vista consume el motor y conserva Konva y el adaptador",()=>{
  assert.ok(view.includes('useDocumentDesignerEngine'));
  assert.ok(view.includes('patientReceiptDocumentAdapter'));
  assert.ok(view.includes('Konva.Stage'));
  assert.ok(view.includes('createMarginGuides'));
  assert.equal(view.includes('function pushHistory(){'),false);
  assert.equal(view.includes('saveDocumentDesign(documentId'),false);
});