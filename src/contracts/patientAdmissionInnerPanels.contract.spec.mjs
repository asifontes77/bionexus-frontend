import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const parent=fs.readFileSync("src/views/PatientAdmissionView.vue","utf8");
const exams=fs.readFileSync("src/components/patients/PatientAdmissionExamsStep.vue","utf8");
const payment=fs.readFileSync("src/components/patients/PatientAdmissionPaymentStep.vue","utf8");
test("wrappers generales retirados",()=>{assert.equal(parent.includes('title="Exámenes" icon="science"'),false);assert.equal(parent.includes('title="Pago y cierre" icon="payments"'),false);});
test("paneles internos de Examenes",()=>{assert.ok(exams.includes('title="Catálogo"'));assert.ok(exams.includes('title="Orden del paciente"'));assert.ok(exams.includes('@click="addExam(exam)"'));assert.ok(exams.includes('@click="addRoutine(routine)"'));});
test("paneles internos de Pago",()=>{assert.ok(payment.includes('title="Medios de pago"'));assert.ok(payment.includes('title="Resumen"'));assert.ok(payment.includes('@click="addPayment"'));assert.ok(payment.includes('@click="closeAdmission"'));});
