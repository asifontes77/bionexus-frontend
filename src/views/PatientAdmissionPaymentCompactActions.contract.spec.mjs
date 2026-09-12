import fs from 'node:fs';
const source=fs.readFileSync('src/components/patients/PatientAdmissionPaymentStep.vue','utf8');
for(const token of ['payment-row-actions','payment-remove-action','payment-apply-action','action="delete"','min-width:70px'])if(!source.includes(token))throw new Error('COMPACT_ACTION_'+token);
if(source.includes('class="remove-payment"')||source.includes('34px 34px'))throw new Error('OLD_LAYOUT_REMAINS');
const wrapper=source.indexOf('class="payment-row-actions"'),remove=source.indexOf('payment-remove-action',wrapper),apply=source.indexOf('payment-apply-action',wrapper);
if(!(wrapper>=0&&remove>wrapper&&apply>remove))throw new Error('ACTION_GROUP_ORDER');
console.log('[OK] Acciones Eliminar y Aplicar agrupadas, compactas y contiguas.');
