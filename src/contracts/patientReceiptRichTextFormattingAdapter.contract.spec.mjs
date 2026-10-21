import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const adapter = fs.readFileSync(new URL("../components/documents/rich-text/richTextFormattingAdapter.js", import.meta.url), "utf8");
const dialog = fs.readFileSync(new URL("../components/documents/rich-text/RichTextEditorDialog.vue", import.meta.url), "utf8");

test("lectura de formato vive en un adaptador separado", () => {
  assert.match(adapter, /export function readRichTextToolbarState\(/);
  assert.match(adapter, /export function hasUnderline\(/);
  assert.match(adapter, /item\.tagName === "U"/);
  assert.match(adapter, /isVisibleColor\(item\.style\?\.backgroundColor\)/);
  assert.match(adapter, /firstComputedValue\(chain, value => value\.backgroundColor, isVisibleColor\)/);
  assert.match(dialog, /import \{ readRichTextToolbarState \} from '.\/richTextFormattingAdapter'/);
  assert.match(dialog, /Object\.assign\(toolbar, readRichTextToolbarState\(element, firstInput\.value, draft\)\)/);
  assert.match(dialog, /syncToolbar\(token\)/);
  assert.doesNotMatch(dialog, /function firstFormattedValue\(/);
  assert.doesNotMatch(dialog, /function hasUnderline\(/);
});
