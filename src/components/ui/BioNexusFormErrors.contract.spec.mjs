import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const component=readFileSync("src/components/ui/BioNexusFormErrors.vue","utf8");
const theme=readFileSync("src/styles/components.css","utf8");
describe("BioNexusFormErrors",()=>{
  it("acepta un mensaje o múltiples fuentes",()=>{for(const token of ['type: [String, Array, Object]','Array.isArray(value)','Object.values(value)','new Set'])assert.ok(component.includes(token),token);});
  it("muestra lista uniforme con viñetas",()=>{for(const token of ['<ul>','<li v-for=','bio-nexus-form-errors','li::marker','linear-gradient(','box-shadow:','border-inline-start: 5px'])assert.ok(component.includes(token),token);});
  it("expone alerta accesible",()=>{for(const token of ['role="alert"','aria-live="assertive"','aria-atomic="true"'])assert.ok(component.includes(token),token);});
  it("no reemplaza errores de campo",()=>{assert.ok(!component.includes('BioNexusFormField'));});
});
