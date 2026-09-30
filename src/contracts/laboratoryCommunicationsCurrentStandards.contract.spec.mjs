import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const panel=readFileSync("src/components/laboratory/LaboratoryEmailPanel.vue","utf8");
const view=readFileSync("src/views/LaboratoryView.vue","utf8");
describe("Comunicaciones del laboratorio current standards",()=>{
 it("usa SectionPanel y checkbox comun",()=>{assert.equal((panel.match(/<BioNexusSectionPanel/g)||[]).length,1);assert.equal((panel.match(/<BioNexusCheckbox/g)||[]).length,2);assert.equal((panel.match(/type=\"checkbox\"/g)||[]).length,0)});
 it("preserva contraseña y prueba",()=>{for(const t of ["Déjela vacía para conservar la contraseña actual","La contraseña SMTP nunca se muestra","Probar conexión no guarda cambios ni envía correos","$emit('test-connection')"])assert.ok(panel.includes(t),t)});
 it("muestra errores generales arriba",()=>{assert.ok(view.includes("BioNexusFormErrors"));assert.ok(view.indexOf("BioNexusFormErrors")<view.indexOf("laboratory-navigation"));assert.ok(view.includes("generalError.value = getLaboratoryErrorMessage"))});
 it("protege salida con cambios",()=>{for(const t of ["BioNexusConfirmDialog","onBeforeRouteLeave","beforeunload","confirmDiscard","discardDialog.value?.ask"])assert.ok(view.includes(t),t)});
 it("mantiene estados independientes",()=>{assert.ok(panel.includes(':loading=\"saving\"'));assert.ok(panel.includes(':loading=\"testing\"'));assert.ok(panel.includes('!dirty || hasErrors'));assert.ok(panel.includes('saving || testing || hasErrors'))});
 it("muestra maxlength y contadores dinamicos",()=>{for(const token of ["maxlength=\"255\"","maxlength=\"254\"","de 255 caracteres","de 254 caracteres"])assert.ok(panel.includes(token),token);const model=readFileSync("src/models/laboratory.js","utf8");assert.ok(model.includes("const maximums = { host: 255, user: 254, pass: 255, from: 254 }"))});
});
