import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const dialog = fs.readFileSync("src/components/examcatalog/ExamWorksheetDialog.vue", "utf8");

test("usa BioNexusTabs para Editor y Vista previa", () => {
  assert.ok(dialog.includes('<BioNexusTabs v-model="tab"'));
  assert.ok(dialog.includes('id-prefix="exam-worksheet"'));
  assert.ok(dialog.includes('{key:"editor",label:"Editor"}'));
  assert.ok(dialog.includes('{key:"preview",label:"Vista previa"}'));
  assert.equal(dialog.includes('class="worksheet-tabs"'), false);
});

test("usa acciones compartidas para Cancelar y Guardar", () => {
  assert.ok(dialog.includes('variant="secondary" icon="cancel"'));
  assert.ok(dialog.includes('variant="primary" icon="save"'));
  assert.ok(dialog.includes(':loading="saving"'));
  assert.ok(dialog.includes(':disabled="!dirty || tooLong || !canUpdate"'));
});

test("preserva los 12 comandos especializados y el foco", () => {
  const commands = ["strikeThrough", "bold", "italic", "underline", "justifyLeft", "justifyCenter", "justifyRight", "insertOrderedList", "insertUnorderedList", "subscript", "superscript", "removeFormat"];
  for (const command of commands) assert.ok(dialog.includes(`command('${command}')`), command);
  assert.ok(dialog.includes('editor.value?.focus()'));
  assert.ok(dialog.includes('contenteditable="true"'));
  assert.equal((dialog.match(/<button type="button" title=/g) || []).length, 12);
});

test("preserva seguridad, limite, guardado y cierre pendiente", () => {
  for (const token of ["sanitizePreview", "safePreview", "tooLong", "dirty", "canUpdate", "requestClose", "confirmDialog", "emit(\"save\""] ) assert.ok(dialog.includes(token), token);
});
