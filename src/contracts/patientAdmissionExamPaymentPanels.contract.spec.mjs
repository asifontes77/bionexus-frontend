import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const parent = fs.readFileSync("src/views/PatientAdmissionView.vue", "utf8");
const exams = fs.readFileSync("src/components/patients/PatientAdmissionExamsStep.vue", "utf8");
const payment = fs.readFileSync("src/components/patients/PatientAdmissionPaymentStep.vue", "utf8");

test("Agregar examen usa boton circular icon-only", () => {
  assert.ok(exams.includes('icon="add" icon-only shape="circle"'));
  assert.ok(exams.includes('label="Agregar examen"'));
  assert.ok(exams.includes('@click="addExam(exam)"'));
});

test("Rutinas permanece intacto", () => {
  assert.ok(exams.includes('@click="addRoutine(routine)"'));
  assert.ok(exams.includes('routineAvailableCount(routine)'));
});

test("los paneles actuales son internos y usan accent", () => {
  assert.equal(parent.includes('title="Exámenes" icon="science"'), false);
  assert.equal(parent.includes('title="Pago y cierre" icon="payments"'), false);
  assert.ok(exams.includes('title="Catálogo"'));
  assert.ok(exams.includes('title="Orden del paciente"'));
  assert.ok(payment.includes('title="Medios de pago"'));
  assert.ok(payment.includes('title="Resumen"'));
  assert.equal((exams.match(/variant="accent" compact/g) || []).length, 2);
  assert.equal((payment.match(/variant="accent" compact/g) || []).length, 2);
});
