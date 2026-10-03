import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const exams = fs.readFileSync("src/components/patients/PatientAdmissionExamsStep.vue", "utf8");
const payment = fs.readFileSync("src/components/patients/PatientAdmissionPaymentStep.vue", "utf8");

test("los paneles internos de Examenes usan variante naranja", () => {
  assert.ok(exams.includes('class="catalog-panel" title="Catálogo"'));
  assert.ok(exams.includes('class="selected-panel" title="Orden del paciente"'));
  assert.equal((exams.match(/variant="accent" compact/g) || []).length, 2);
});

test("los paneles internos de Pago usan variante naranja", () => {
  assert.ok(payment.includes('class="payment-panel" title="Medios de pago"'));
  assert.ok(payment.includes('class="summary-panel" title="Resumen"'));
  assert.equal((payment.match(/variant="accent" compact/g) || []).length, 2);
});

test("las acciones funcionales permanecen intactas", () => {
  assert.ok(exams.includes('@click="addExam(exam)"'));
  assert.ok(exams.includes('@click="addRoutine(routine)"'));
  assert.ok(payment.includes('@click="addPayment"'));
  assert.ok(payment.includes('@click="applyPayment(payment)"'));
  assert.ok(payment.includes('@click="closeAdmission"'));
});
