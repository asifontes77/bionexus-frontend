import fs from 'node:fs';
const source = fs.readFileSync('src/components/patients/PatientAdmissionPaymentStep.vue', 'utf8');
const required = [
  'BioNexusActionIcon',
  'payment-icon-action',
  'payment-apply-action',
  ':aria-label="isPaymentApplied(payment)?',
  "'Pago aplicado':'Aplicar pago'",
  '34px 34px',
];
for (const token of required) {
  if (!source.includes(token)) throw new Error('ICON_ACTION_' + token);
}
if (source.includes('class="apply-payment"') || source.includes('>Aplicar pago</button>')) {
  throw new Error('TEXT_BUTTON_REMAINS');
}
console.log('[OK] Aplicar pago usa accion icon-only compacta y accesible.');
