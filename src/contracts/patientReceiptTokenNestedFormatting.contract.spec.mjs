import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const dialog=fs.readFileSync(new URL("../components/documents/rich-text/RichTextEditorDialog.vue",import.meta.url),"utf8");
const token=fs.readFileSync(new URL("../components/documents/rich-text/richTextTokenController.js",import.meta.url),"utf8");
const adapter=fs.readFileSync(new URL("../components/documents/rich-text/richTextFormattingAdapter.js",import.meta.url),"utf8");
test("token restaura formato desde wrappers internos",()=>{
 assert.match(token,/function tokenFormattingElement\(token, eventTarget = null\)/);
 assert.match(token,/token\.querySelectorAll\("font,span,b,strong,i,em,u"\)/);
 assert.match(token,/syncToolbar\(formattingElement\)/);
 assert.match(adapter,/function firstExplicitValue\(chain, reader\)/);
 assert.match(adapter,/item\.getAttribute\?\.\("face"\)/);
 assert.match(adapter,/item\.getAttribute\?\.\("color"\)/);
 assert.doesNotMatch(dialog,/v-model\.number="draft\.paragraphGap"/);
});
