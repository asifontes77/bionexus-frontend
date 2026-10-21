import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const dialog=fs.readFileSync(new URL("../components/documents/rich-text/RichTextEditorDialog.vue",import.meta.url),"utf8");
const selection=fs.readFileSync(new URL("../components/documents/rich-text/richTextSelectionController.js",import.meta.url),"utf8");
const token=fs.readFileSync(new URL("../components/documents/rich-text/richTextTokenController.js",import.meta.url),"utf8");
test("Enter conserva el token y crea linea editable",()=>{
 assert.match(dialog,/@keydown="handleEditorKeydown"/);
 assert.match(selection,/function rangeSelectsOnlyToken\(range, token\)/);
 assert.match(selection,/const line = document\.createElement\("div"\)/);
 assert.match(selection,/line\.append\(document\.createElement\("br"\)\)/);
 assert.match(selection,/range\.setStart\(line, 0\)/);
 assert.match(token,/event\.stopPropagation\(\)/);
 assert.match(token,/selection\.placeCaretAfter\(token, true\)/);
});
