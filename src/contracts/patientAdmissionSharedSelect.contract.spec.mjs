import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("src/views/PatientAdmissionView.vue", "utf8");

test("Ingreso de pacientes usa selectores compartidos", () => {
  assert.equal((source.match(/<BioNexusSearchableSelect(?:\s|>|\/)/g) || []).length, 5);
  assert.equal((source.match(/<select(?:\s|>)/gi) || []).length, 0);
  for (const id of ["pa-code", "pa-sex", "pa-sample", "pa-sample-type", "pa-client"]) assert.ok(source.includes(`id="${id}"`));
});

test("preserva valores y contratos funcionales", () => {
  for (const token of ["draft.verification_code", "draft.sex", "draft.sample", "draft.sample_type", "draft.client_id", "Tomada aquí", "Referida", "Sin prefijo"]) assert.ok(source.includes(token));
  assert.ok(source.includes('value-key="description"'));
  assert.ok(source.includes('label-key="description"'));
});
