import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const dialog=fs.readFileSync(new URL("../components/documents/rich-text/RichTextEditorDialog.vue",import.meta.url),"utf8");
const token=fs.readFileSync(new URL("../components/documents/rich-text/richTextTokenController.js",import.meta.url),"utf8");
test("token se inserta en rango preservado",()=>{
 assert.match(dialog,/@pointerdown\.prevent="preserveTokenInsertionRange"/);
 assert.match(token,/function preserveTokenInsertionRange\(\)/);
 assert.match(token,/function rangeBelongsToEditor\(range\)/);
 assert.match(token,/selection\.savedRange\.value\?\.cloneRange/);
 assert.match(token,/range\.collapse\(false\)/);
 assert.match(token,/browserSelection\.addRange\(range\)/);
 assert.match(token,/range\.insertNode\(token\)/);
});
