import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
const dialog=fs.readFileSync("src/components/ui/BioNexusDialog.vue","utf8");
describe("BioNexusDialog cierra con Escape mediante el contrato de cierre",()=>{
 it("conserva el listener global y el interceptor del dialog",()=>{assert.ok(dialog.includes('document.addEventListener("keydown", blockEscape, true)'));assert.ok(dialog.includes('@keydown.esc.capture.prevent.stop="blockImplicitClose"'));});
 it("Escape delega en requestClose",()=>{assert.match(dialog,/function blockEscape\(event\)[\s\S]*event\?\.key !== "Escape"[\s\S]*event\.defaultPrevented[\s\S]*requestClose\(\)/);});
 it("requestClose conserva preventClose y before-close",()=>{assert.match(dialog,/function requestClose\(\)[\s\S]*props\.preventClose[\s\S]*emit\("before-close"\)/);});
 it("evita doble procesamiento del mismo Escape",()=>assert.ok(dialog.includes('event.defaultPrevented')));
});
