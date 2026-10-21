import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const adapter=fs.readFileSync("src/components/documents/designer/adapters/patientReceiptDocumentAdapter.js","utf8");
const context=fs.readFileSync("src/components/documents/designer/documentPreviewContext.js","utf8");
const designer=fs.readFileSync("src/views/PatientReceiptDocumentDesignerView.vue","utf8");
const tokens=["patient.sex","patient.address","patient.phone","patient.age","currency.usdRate","currency.rateDate"];

test("expone todos los tokens requeridos por el comprobante de referencia",()=>{
  for(const token of tokens){assert.match(adapter,new RegExp(token.replace(".","\\.")));assert.match(context,new RegExp(token.replace(".","\\.")));assert.match(designer,new RegExp(token.replace(".","\\.")));}
});
