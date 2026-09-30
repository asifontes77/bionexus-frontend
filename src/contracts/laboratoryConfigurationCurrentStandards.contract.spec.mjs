import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const general=readFileSync("src/components/laboratory/LaboratoryGeneralPanel.vue","utf8");
const identity=readFileSync("src/views/LaboratoryIdentityView.vue","utf8");
const service=readFileSync("src/services/laboratoryService.js","utf8");
describe("Configuracion de laboratorio current standards",()=>{
 it("usa contadores y checkbox comun",()=>{assert.ok(general.includes("BioNexusCheckbox"));assert.ok(general.includes('v-model="model.settingQR.activeQR"'));assert.equal((general.match(/type="checkbox"/g)||[]).length,0);assert.ok(general.includes("field.max + ' caracteres'"));assert.ok(general.includes("model.settingQR[field.key]"))});
 it("muestra errores generales arriba",()=>{assert.ok(identity.includes("BioNexusFormErrors"));assert.ok(identity.indexOf("BioNexusFormErrors")<identity.indexOf("identity-toolbar"));assert.ok(identity.includes("generalError.value=getLaboratoryErrorMessage"))});
 it("protege salida con cambios",()=>{for(const token of ["BioNexusConfirmDialog","onBeforeRouteLeave","beforeunload","confirmDiscard","discardDialog.value?.ask"])assert.ok(identity.includes(token),token)});
 it("limpia errores al editar",()=>assert.ok(identity.includes("watch(laboratory,()=>{if(generalError.value)generalError.value=''}")));
 it("usa fallback seguro",()=>{for(const token of ["LABORATORY_EMAIL_FIELD_UNKNOWN","LABORATORY_TRANSACTION_UNAVAILABLE","SECURITY_AUDIT_SERVICE_UNAVAILABLE","console.error('[getLaboratoryErrorMessage] Código Backend no traducido:'","return fallback || 'No fue posible completar la operación.'"])assert.ok(service.includes(token),token);assert.ok(!service.includes("error?.message || fallback"))});
 it("usa SectionPanel sin paneles visuales redundantes",()=>{const logo=readFileSync("src/components/laboratory/LaboratoryLogoPanel.vue","utf8");assert.equal((general.match(/<BioNexusSectionPanel/g)||[]).length,3);assert.equal((logo.match(/<BioNexusSectionPanel/g)||[]).length,1);for(const token of ["Identificación","Contacto","Código QR de contacto","#actions"])assert.ok(general.includes(token),token);assert.ok(logo.includes('title="Logo del laboratorio"'));assert.ok(!general.includes('class="bio-nexus-panel laboratory-panel"'));assert.ok(!logo.includes('class="bio-nexus-panel laboratory-panel logo-panel"'))});
});
