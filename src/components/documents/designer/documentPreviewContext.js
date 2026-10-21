import { resolvePublicAssetUrl } from '@/api/apiUrl'
const TOKEN_PATTERN=/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function laboratoryLogoUrl(laboratory){
  const logo=String(laboratory?.logo??'').trim();
  if(!logo)return'';
  return resolvePublicAssetUrl(logo);
}

export function laboratoryDocumentContext(laboratory){
  return Object.freeze({
    'laboratory.name':String(laboratory?.business_name??laboratory?.name??'').trim(),
    'laboratory.rif':String(laboratory?.rif??'').trim(),
    'laboratory.phone1':String(laboratory?.phone_1??laboratory?.phone1??'').trim(),
    'laboratory.address':String(laboratory?.address??'').trim(),
    'patient.name':'Paciente de ejemplo',
    'patient.documentNumber':'V-12.345.678',
    'patient.sex':'Femenino',
    'patient.address':'Dirección registrada del paciente',
    'patient.phone':'0414-0000000',
    'patient.age':'43 años',
    'document.number':'0011039',
    'document.date':new Intl.DateTimeFormat('es-VE').format(new Date()),
    'currency.usdRate':'207,0491',
    'currency.rateDate':new Intl.DateTimeFormat('es-VE').format(new Date()),
  });
}

export function resolveDocumentTokens(value,context){
  return String(value??'').replace(TOKEN_PATTERN,(_match,key)=>Object.prototype.hasOwnProperty.call(context,key)?String(context[key]??''):_match);
}
