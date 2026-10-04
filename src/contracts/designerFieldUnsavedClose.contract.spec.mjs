import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../components/examcatalog/designer/ExamResultGridDesignerDialog.vue", import.meta.url), "utf8");

test("protege X Escape backdrop y Cancelar del dialogo de campo", () => {
  for (const token of [':prevent-close="fieldDirty"', '@before-close="requestFieldClose"', '@click="requestFieldClose"', '@close="handleFieldClosed"']) assert.ok(source.includes(token), token);
});

test("compara el borrador completo contra su snapshot inicial", () => {
  for (const token of ['fieldOriginal=ref("")', 'const fieldSignature=computed', 'const fieldDirty=computed', 'fieldOriginal.value=fieldSignature.value;fieldDialog.value?.open()']) assert.ok(source.includes(token), token);
});

test("usa el dialogo estandar para descartar o continuar editando", () => {
  for (const token of ['<BioNexusConfirmDialog ref="fieldDiscardDialog" />', 'fieldDiscardDialog.value?.ask', 'kicker:"Confirmación"', 'title:"Descartar cambios"', 'Hay cambios sin guardar. ¿Deseas salir y descartarlos?', 'confirmText:"Sí, salir y descartar cambios"', 'cancelText:"Continuar editando"', 'if(!accepted)return']) assert.ok(source.includes(token), token);
});

test("guardar cierra sin advertencia falsa", () => {
  assert.ok(source.includes('fieldOriginal.value=fieldSignature.value;fieldDialog.value?.close();touch()}'));
});

test("preserva los contratos de errores aprobados", () => {
  assert.ok(source.includes('<BioNexusFormErrors :errors="fieldFormError" />'));
  assert.ok(source.includes(':error="fieldKeyError"'));
});