import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const dialog=fs.readFileSync("src/components/security/UserIdentityDialog.vue","utf8");
test("los siete campos ordinarios muestran ayuda dinamica",()=>{for(const token of ["form.name.length","form.userName.length","form.email.length","form.telephone.length","form.position.length","form.collegeNumber.length","form.direction.length"])assert.ok(dialog.includes(token),token);assert.equal((dialog.match(/de (20|50|100) caracteres/g)||[]).length,7);});
test("las claves sensibles no muestran contador",()=>{for(const field of ["identity-password","identity-password-confirm","identity-signature-password","identity-signature-confirm"]){const start=dialog.indexOf(`field-id="${field}"`);assert.ok(start>=0);assert.equal(dialog.slice(start,start+220).includes(":help="),false,field);}});
test("errores y error general conservan ubicacion",()=>{assert.ok(dialog.indexOf('v-if="formError"')<dialog.indexOf('title="Datos de identidad"'));assert.equal((dialog.match(/:error="errors\./g)||[]).length,11);});
test("usa cuatro SectionPanel accent y cuatro ActionButton",()=>{assert.equal((dialog.match(/<BioNexusSectionPanel/g)||[]).length,4);assert.equal((dialog.match(/variant="accent" compact/g)||[]).length,4);assert.equal((dialog.match(/<BioNexusActionButton/g)||[]).length,4);assert.equal((dialog.match(/<button\b/g)||[]).length,0);});
test("preserva archivos previews y validaciones",()=>{for(const token of ['ref="photoInput"','ref="signatureInput"','accept="image/png,image/jpeg,image/webp"','selectPhoto','selectSignature','5 * 1024 * 1024','identitySubmitDisabled','validateRemoteEmail','uploadUserAsset'])assert.ok(dialog.includes(token),token);});
