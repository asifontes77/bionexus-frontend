import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const service=readFileSync("src/services/examCatalogService.js","utf8");
const dialog=readFileSync("src/components/examcatalog/ExamDialog.vue","utf8");
describe("Exam abbreviation uniqueness",()=>{
  it("translates the controlled Backend conflict",()=>assert.ok(service.includes('EXAM_CATALOG_ABBREVIATION_ALREADY_EXISTS: "Ya existe un examen con esa abreviatura dentro del grupo."')));
  it("clears stale general errors after any form mutation",()=>{
    assert.ok(dialog.includes('function handleFormMutation() { clearError(); }'));
    assert.equal((dialog.match(/@input="handleFormMutation"/g)||[]).length,3);
    assert.equal((dialog.match(/@change="handleFormMutation"/g)||[]).length,2);
  });
});
