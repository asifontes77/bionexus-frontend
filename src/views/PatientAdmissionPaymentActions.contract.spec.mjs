import fs from 'node:fs';
const source = fs.readFileSync('src/components/patients/PatientAdmissionPaymentStep.vue', 'utf8');
const required = ['BioNexusIcon name="delete"', "isPaymentApplied(payment)?'check':'check_circle'", ':disabled="saving||isPaymentApplied(payment)"', 'paymentActionLabel(payment)', 'Selecciona una forma de pago', 'loadError.value=paymentActionLabel(payment)'];
for (const token of required) if (!source.includes(token)) throw new Error('PAYMENT_ACTION_' + token);
if (source.includes('BioNexusActionIcon action="delete"') || source.includes("isPaymentApplied(payment)?'confirm':'save'")) throw new Error('OLD_ICON_REMAINS');
console.log('[OK] Papelera, check aplicado y aplicacion independiente aprobados.');
