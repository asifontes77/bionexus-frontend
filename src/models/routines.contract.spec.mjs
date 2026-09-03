import { readFileSync } from "node:fs";
const model = readFileSync("src/models/routines.js", "utf8");
const service = readFileSync("src/services/routinesService.js", "utf8");
for (const evidence of [
  'Object.prototype.hasOwnProperty.call(value, "active")',
  'Object.prototype.hasOwnProperty.call(item, "active")',
  "registered_exams",
  "examCount",
]) if (!model.includes(evidence)) throw new Error(`Falta evidencia de modelo: ${evidence}`);
for (const evidence of ["/api/routines", 'method: "POST"', 'method: "PATCH"', 'method: "DELETE"'])
  if (!service.includes(evidence)) throw new Error(`Falta evidencia de servicio: ${evidence}`);
console.log("Routines model and service contract passed");
