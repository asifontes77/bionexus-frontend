import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";
const designer=readFileSync("src/views/PatientReceiptDocumentDesignerView.vue","utf8");
const preview=readFileSync("src/components/documents/DocumentDefinitionPreviewDialog.vue","utf8");
const resolver=readFileSync("src/components/documents/designer/documentPreviewContext.js","utf8");
describe("real laboratory document context",()=>{
 it("resolves canonical laboratory fields",()=>{for(const token of ["laboratory.name","business_name","laboratory.rif","laboratory.phone1","phone_1","laboratory.address"])assert.ok(resolver.includes(token),token)});
 it("uses the approved public asset path without persisting the URL",()=>{assert.ok(resolver.includes("resolvePublicAssetUrl"));assert.ok(designer.includes("laboratoryLogoUrl(laboratory.value)"));assert.ok(preview.includes("laboratoryLogoUrl(laboratory.value)"));assert.equal(designer.includes("src:model.logo"),false)});
 it("shares token resolution between designer and preview",()=>{assert.ok(designer.includes("richTextRuns(model.html,model.text,laboratoryPreviewContext.value,defaults)"));assert.ok(preview.includes('resolveDocumentTokens(element.text||"",laboratoryDocumentContext(laboratory.value))'))});
 it("keeps tokens in documentJson and excludes laboratory from serialization",()=>{assert.ok(designer.includes("serializeDocument:()=>({version:documentSchemaVersion"));assert.equal(designer.includes("serializeDocument:()=>({laboratory"),false);assert.ok(designer.includes("markSaved()"))});
 it("loads laboratory before marking the design saved",()=>{assert.ok(designer.indexOf("await loadLaboratory()")<designer.indexOf("markSaved()"));assert.ok(preview.includes("Promise.all([getDocumentDesign(definition.id),getLaboratory()])"))});
});
