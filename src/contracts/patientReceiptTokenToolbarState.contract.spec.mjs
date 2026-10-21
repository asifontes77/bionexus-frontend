import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const dialog=fs.readFileSync(new URL("../components/documents/rich-text/RichTextEditorDialog.vue",import.meta.url),"utf8");
const token=fs.readFileSync(new URL("../components/documents/rich-text/richTextTokenController.js",import.meta.url),"utf8");
const adapter=fs.readFileSync(new URL("../components/documents/rich-text/richTextFormattingAdapter.js",import.meta.url),"utf8");
test("toolbar restaura propiedades del token",()=>{
 assert.match(dialog,/@mouseup="rememberSelection"/);
 assert.match(dialog,/function syncToolbar\(preferredElement = null\)/);
 assert.match(token,/const formattingElement = tokenFormattingElement\(token, event\.target\)/);
 assert.match(token,/syncToolbar\(formattingElement\)/);
 assert.match(adapter,/export function hasUnderline\(chain\)/);
 assert.match(adapter,/underline: hasUnderline\(chain\)/);
});
