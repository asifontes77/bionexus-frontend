import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const dialog=fs.readFileSync(new URL("../components/documents/rich-text/RichTextEditorDialog.vue",import.meta.url),"utf8");
const selection=fs.readFileSync(new URL("../components/documents/rich-text/richTextSelectionController.js",import.meta.url),"utf8");
test("colores respetan seleccion y pueden eliminarse",()=>{
 assert.match(selection,/const atomicToken = sameToken && \(range\.collapsed \|\| rangeSelectsOnlyToken\(range, sameToken\)\)/);
 assert.match(selection,/savedRange\.value = range\.cloneRange\(\)/);
 assert.match(dialog,/label="Quitar color del texto"/);
 assert.match(dialog,/label="Quitar color de fondo"/);
 assert.match(dialog,/"inherit" : "transparent"/);
 assert.doesNotMatch(dialog,/v-model\.number="draft\.paragraphGap"/);
});
