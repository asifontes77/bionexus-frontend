import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";
const dialog=readFileSync("src/components/examcatalog/ExamDialog.vue","utf8"),shared=readFileSync("src/components/ui/BioNexusSearchableSelect.vue","utf8");
describe("Exam catalog tax shared select",()=>{
  it("migra solamente Impuesto del dialogo principal",()=>{assert.ok(dialog.includes('id="exam-tax"'));assert.ok(dialog.includes("BioNexusSearchableSelect"));assert.ok(!dialog.includes('<select id="exam-tax"'))});
  it("preserva identificador numerico y validacion",()=>{for(const token of["id: Number(tax.id)","tax_id: Number(draft.tax_id) || 0","values.value.tax_id > 0"])assert.ok(dialog.includes(token),token)});
  it("preserva etiqueta regional y limpieza de error",()=>{for(const token of["displayName","percentage(tax.value)","@change=\"handleFormMutation\"","function handleFormMutation() { clearError(); }"])assert.ok(dialog.includes(token),token)});
  it("usa la fundacion global aprobada",()=>{for(const token of['<Teleport :to="teleportTarget">','position:dialog?"absolute":"fixed"','grid-template-rows:auto minmax(0,1fr)'])assert.ok(shared.includes(token),token)});
});