import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const builder = fs.readFileSync(path.join(root, "src/services/patientResultReportBuilder.js"), "utf8");
const view = fs.readFileSync(path.join(root, "src/views/PatientResultsEmailView.vue"), "utf8");
for (const token of [
  'formatRegionalFunctionalDate } from "@/services/regionalFormatter"',
  'getApprover, regionalSettings = {}',
  'formatRegionalFunctionalDate(patient.admission_date, regionalSettings)',
]) if (!builder.includes(token)) throw new Error("BUILDER_REGIONAL_CONTRACT_MISSING:" + token);
if (builder.includes('replaceAllToken(header, "[Fecha]", patient.admission_date)')) throw new Error("RAW_ADMISSION_DATE_REMAINS");
if (!view.includes('regionalSettings.settings)')) throw new Error("REGIONAL_SETTINGS_NOT_PASSED_TO_BUILDER");
console.log("[OK] Contrato regional del reporte de resultados aprobado.");
