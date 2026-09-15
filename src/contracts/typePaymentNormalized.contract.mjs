import fs from "node:fs";
const model=fs.readFileSync("src/models/typePayment.js","utf8");
const service=fs.readFileSync("src/services/typePaymentService.js","utf8");
for(const token of["code","currencies","fields","currencyIds","defaultCurrencyId","displayOrder"])if(!model.includes(token))throw new Error(`MODEL_${token}`);
for(const token of["normalizeTypePaymentPayload(payload)","normalizeTypePaymentChanges(changes)"])if(!service.includes(token))throw new Error(`SERVICE_${token}`);
for(const legacy of["description_1","description_2","only_dollars"])if(model.includes(legacy)||service.includes(legacy))throw new Error(`LEGACY_${legacy}`);
if(service.includes("forma parasitaria"))throw new Error("WRONG_DOMAIN_MESSAGE");
console.log("[OK] Modelo y servicio Frontend normalizados.");
