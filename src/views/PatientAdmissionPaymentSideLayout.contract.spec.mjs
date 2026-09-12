import fs from 'node:fs';
const source=fs.readFileSync('src/components/patients/PatientAdmissionPaymentStep.vue','utf8');
for(const token of ['grid-template-columns:minmax(0,1.7fr) minmax(300px,.7fr)','@media(max-width:1100px){.payment-layout{grid-template-columns:1fr}','payment-row-actions','payment-remove-action','payment-apply-action','.summary-panel{position:sticky;top:12px}'])if(!source.includes(token))throw new Error('SIDE_LAYOUT_'+token);
const template=source.slice(0,source.indexOf('<script setup>'));
if(!(template.indexOf('class="payment-panel"')<template.indexOf('class="summary-panel"')))throw new Error('PANEL_ORDER');
console.log('[OK] Pagos a la izquierda y resumen a la derecha restaurados.');
