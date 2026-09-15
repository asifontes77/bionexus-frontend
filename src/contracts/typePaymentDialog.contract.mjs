import fs from 'node:fs';
const source=fs.readFileSync('src/components/typepayment/TypePaymentDialog.vue','utf8');
const required=[
  'Define la información complementaria que deberá completar el usuario al registrar un pago',
  '<BioNexusActionIcon action="create"/>Agregar campo',
  'title="Quitar campo" aria-label="Quitar campo"',
  '<BioNexusActionIcon action="delete"/>',
  "mode.value==='create'?!props.canCreate:!props.canUpdate||signature.value===original.value",
  'descriptionError.value||currencyError.value||fieldsError.value',
  ':error="descriptionError"',
  ":error=\"fieldError(index,'label')\"",
  'margin:14px auto 0',
  'margin-top:9px',
  'margin-top:13px'
];
for(const token of required)if(!source.includes(token))throw new Error('PAYMENT_DIALOG_MISSING_'+token);
if(source.includes('>Quitar</button>'))throw new Error('REMOVE_BUTTON_NOT_ICON_ONLY');
if(source.includes("signature.value===original.value||(mode.value==='create'"))throw new Error('CREATE_BUTTON_STILL_DIRTY_LOCKED');
console.log('[OK] Dialogo Formas de pago refinado sin alterar alineacion aprobada.');