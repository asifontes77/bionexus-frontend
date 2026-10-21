import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const core = fs.readFileSync(new URL("../components/documents/rich-text/RichTextEditorDialog.vue", import.meta.url), "utf8");
const adapter = fs.readFileSync(new URL("../components/documents/rich-text/richTextFormattingAdapter.js", import.meta.url), "utf8");
const compatibility = fs.readFileSync(new URL("../components/documents/designer/DesignerTextPropertiesDialog.vue", import.meta.url), "utf8");

test("editor rich text es reusable entre tipos de documento", () => {
  assert.match(core, /defineProps\(\{ tokens: \{ type: Array, default: \(\) => \[\] \} \}\)/);
  assert.match(core, /defineEmits\(\["apply"\]\)/);
  assert.match(core, /defineExpose\(\{ openCreate, openEdit \}\)/);
  assert.match(core, /readRichTextToolbarState/);
  for (const token of ["laboratory.", "patient.", "receipt", "invoice"]) {
    assert.equal(core.includes(token), false, token);
    assert.equal(adapter.includes(token), false, token);
  }
});

test("comprobantes conservan una fachada compatible", () => {
  assert.match(compatibility, /RichTextEditorDialog/);
  assert.match(compatibility, /:tokens="tokens"/);
  assert.match(compatibility, /@apply="emit\('apply', \$event\)"/);
  assert.match(compatibility, /defineExpose\(\{ openCreate, openEdit \}\)/);
});
