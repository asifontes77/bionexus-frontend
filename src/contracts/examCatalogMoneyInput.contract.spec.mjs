import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";
const exam=readFileSync("src/components/examcatalog/ExamDialog.vue","utf8"),adjust=readFileSync("src/components/examcatalog/ExamPriceAdjustmentDialog.vue","utf8"),numeric=readFileSync("src/components/ui/BioNexusNumericInput.vue","utf8");
describe("Exam catalog monetary inputs",()=>{
 it("usa entrada monetaria compartida para las seis tarifas",()=>{assert.ok(exam.includes("BioNexusNumericInput"));assert.ok(exam.includes(':decimals="monetaryDecimals"'));assert.ok(!exam.includes('inputmode="decimal"'));assert.ok(!exam.includes("parseRegionalNumber"))});
 it("mantiene numeros reales y payload Backend",()=>{for(const token of["cost1: price(1) ?? 0","cost6: price(6) ?? 0","Number(row?.['cost' + number]) || 0","Number.isFinite(value) && value >= 0"])assert.ok(exam.includes(token),token)});
 it("migra porcentaje y operacion del ajuste",()=>{for(const token of["BioNexusNumericInput","percentageValue",':decimals="2"',"percentageMaximum","BioNexusSearchableSelect","operationOptions"])assert.ok(adjust.includes(token),token);assert.ok(!adjust.includes("onPercentageInput"));assert.ok(!adjust.includes("percentageText"))});
 it("preserva formateo inmediato por unidades menores",()=>{for(const token of["minorUnits","appendDigits","Backspace","formatRegionalNumber","monetary_decimals"])assert.ok(numeric.includes(token),token)});
});