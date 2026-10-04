import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../components/patients/PatientResultsEmailHistoryDialog.vue", import.meta.url), "utf8");

test("mantiene el historial como consulta de solo lectura", () => {
  assert.ok(source.includes("<BioNexusDataGrid"));
  assert.ok(!source.includes("<input"));
  assert.ok(!source.includes("<textarea"));
});

test("mantiene adyacentes el error condicional y el grid", () => {
  assert.ok(source.includes("BioNexusFormErrors"));
  assert.ok(source.includes("v-if=\"errorMessage\""));
  assert.ok(source.includes("v-else"));
});

test("usa componentes compartidos", () => {
  assert.ok(source.includes("BioNexusActionButton"));
  assert.ok(source.includes("BioNexusFormErrors"));
  assert.ok(!source.includes("bio-nexus-message-error"));
});

test("agrupa el grid en SectionPanel accent con icono", () => {
  assert.ok(source.includes("title=\"Historial registrado\""));
  assert.ok(source.includes("icon=\"history\""));
  assert.ok(source.includes("variant=\"accent\""));
  assert.match(source, /<BioNexusSectionPanel[\s\S]*<BioNexusDataGrid[\s\S]*<\/BioNexusSectionPanel>/);
});

test("no agrega dirty a una consulta", () => {
  assert.ok(!source.includes("@before-close="));
  assert.ok(!source.includes("BioNexusConfirmDialog"));
});