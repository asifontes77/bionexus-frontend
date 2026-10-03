import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const admission=fs.readFileSync("src/views/PatientAdmissionView.vue","utf8");
const exams=fs.readFileSync("src/components/patients/PatientAdmissionExamsStep.vue","utf8");
const payment=fs.readFileSync("src/components/patients/PatientAdmissionPaymentStep.vue","utf8");
test("Paciente usa checkbox compartido y SectionPanel",()=>{assert.equal((admission.match(/<BioNexusCheckbox/g)||[]).length,2);assert.equal((admission.match(/type="checkbox"/g)||[]).length,0);assert.ok(admission.includes("<BioNexusSectionPanel"));});
test("Examenes usa NumericInput y tarifa limpia",()=>{assert.ok(exams.includes("<BioNexusNumericInput"));assert.ok(exams.includes(':decimals="2"'));assert.ok(exams.includes(':min="0"'));assert.ok(exams.includes(':max="100"'));assert.ok(!exams.includes("(${x.code})"));});
test("Pago usa botones estandar circulares",()=>{assert.ok(payment.includes("BioNexusActionButton"));assert.ok(payment.includes('shape="circle"'));assert.ok(!payment.includes('class="payment-icon-action'));});
