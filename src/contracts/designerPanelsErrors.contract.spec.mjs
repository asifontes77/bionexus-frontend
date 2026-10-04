import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../components/examcatalog/designer/ExamResultGridDesignerDialog.vue", import.meta.url), "utf8");

test("usa BioNexusFormErrors para los errores generales arriba del panel", () => {
  assert.match(source, /<BioNexusFormErrors :errors="fieldFormError" \/>/);
  assert.match(source, /import BioNexusFormErrors from "@\/components\/ui\/BioNexusFormErrors.vue";/);
});

test("mantiene el error especifico en BioNexusFormField", () => {
  assert.match(source, /<BioNexusFormField label="Identificador" field-id="pilot-field-key" :error="fieldKeyError" required>/);
  assert.match(source, /const fieldKeyError=computed/);
});

test("evita duplicar el error especifico en BioNexusFormErrors", () => {
  assert.match(source, /const fieldFormError=computed\(\(\)=>fieldKeyError\.value\?"":fieldError\.value\)/);
  assert.doesNotMatch(source, /<div v-if="fieldError" class="bio-nexus-message bio-nexus-message-error"/);
});

test("limpia el error del identificador cuando el usuario corrige el campo", () => {
  assert.match(source, /function markFieldKeyEdited\(\)\{[^}]*if\(fieldKeyError\.value\)fieldError\.value=""/);
});

test("preserva los paneles accent aprobados", () => {
  assert.match(source, /<BioNexusSectionPanel/);
  assert.match(source, /variant="accent"/);
});