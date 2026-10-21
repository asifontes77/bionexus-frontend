import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const dialog=fs.readFileSync(new URL("../components/documents/rich-text/RichTextEditorDialog.vue",import.meta.url),"utf8");
const selection=fs.readFileSync(new URL("../components/documents/rich-text/richTextSelectionController.js",import.meta.url),"utf8");
const token=fs.readFileSync(new URL("../components/documents/rich-text/richTextTokenController.js",import.meta.url),"utf8");
const designer=fs.readFileSync(new URL("../views/PatientReceiptDocumentDesignerView.vue",import.meta.url),"utf8");
test("texto libre inicia vacio y muestra placeholder visual",()=>{
 assert.match(dialog,/data-placeholder="Escribe aquí\.\.\."/);
 assert.match(dialog,/assign\(\{ text: "", html: "" \}\)/);
 assert.match(dialog,/:empty::before\{content:attr\(data-placeholder\)/);
});
test("Enter conserva token y libera caret",()=>{
 assert.match(dialog,/@keydown="handleEditorKeydown"/);
 assert.match(token,/function handleEditorKeydown\(event\)/);
 assert.match(selection,/function placeCaretAfter\(node, insertBreak = false\)/);
 assert.match(selection,/const line = document\.createElement\("div"\)/);
 assert.match(selection,/range\.setStart\(line, 0\)/);
 assert.match(token,/selection\.placeCaretAfter\(token, true\)/);
});
test("selectionchange sincroniza token y texto",()=>{
 assert.match(selection,/document\.addEventListener\("selectionchange", handleDocumentSelectionChange\)/);
 assert.match(selection,/onSelectionChange\?\.\(selectionElement\(\)\)/);
 assert.match(token,/syncToolbar\(formattingElement\)/);
});
test("lienzo conserva saltos de bloque",()=>{
 assert.match(designer,/if\(block&&before>0/);
 assert.match(designer,/if\(piece==='\\n'\)\{commitLine\(\);continue\}/);
});
