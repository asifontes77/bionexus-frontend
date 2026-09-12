import fs from "node:fs";
import path from "node:path";
const source=fs.readFileSync(path.join(process.cwd(),"src/components/examcatalog/ExamDialog.vue"),"utf8");
for(const token of ["useRegionalSettingsStore","base_currency_symbol","baseCurrencySymbol",":label=\"tariff.name + ' (' + baseCurrencySymbol + ')'\""])if(!source.includes(token))throw new Error("EXAM_CURRENCY_SYMBOL_MISSING_"+token);
if(source.includes("tariff.name + ' (USD)'"))throw new Error("EXAM_CURRENCY_SYMBOL_HARDCODED_USD");
console.log("[OK] Dialogo de examenes usa el simbolo monetario base configurado.");
