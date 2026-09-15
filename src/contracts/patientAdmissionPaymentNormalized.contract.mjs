import fs from "node:fs";
const source=fs.readFileSync("src/components/patients/PatientAdmissionPaymentStep.vue","utf8");
for(const token of["paymentCurrencies","paymentFields","currencyId","fieldValues","defaultCurrencyId","isBase","isLocal","isRequired"])if(!source.includes(token))throw new Error(`MISSING_${token}`);
for(const legacy of["description_1","description_2","only_dollars"])if(source.includes(legacy))throw new Error(`LEGACY_${legacy}`);
if(!source.includes('description1:String(item.fieldValues[fields[0]?.code]'))throw new Error("TEMP_MAPPING_1");
if(!source.includes('description2:String(item.fieldValues[fields[1]?.code]'))throw new Error("TEMP_MAPPING_2");
console.log("[OK] Pago y cierre Frontend normalizados.");
