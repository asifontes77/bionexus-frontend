import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const dialog=readFileSync("src/components/examcatalog/ExamDialog.vue","utf8");
const view=readFileSync("src/views/ExamCatalogView.vue","utf8");
describe("Exam dialog saved state",()=>{
  it("adopta la respuesta normalizada y reinicia la firma",()=>{
    assert.ok(dialog.includes('function markSaved(row, closeAfterSave = false)'));
    assert.ok(dialog.includes('current.value = row; assign(row); attempted.value = false; errorMessage.value = "";'));
    assert.ok(dialog.includes('defineExpose({ openCreate, openEdit, close, clearError, setError, markSaved });'));
  });
  it("mantiene Editar abierto y cierra Crear sin pasar por descarte",()=>{
    assert.ok(view.includes('examDialog.value?.markSaved(row,p.mode==="create")'));
    assert.ok(!view.includes('replaceExam(row);examDialog.value?.close();toast.success'));
    assert.ok(dialog.includes('if (closeAfterSave) dialog.value?.close();'));
  });
  it("conserva el dirty state y el bloqueo de Guardar",()=>{
    assert.ok(dialog.includes('signature.value !== original.value'));
    assert.ok(dialog.includes('!hasChanges.value'));
    assert.ok(dialog.includes('if (hasChanges.value)'));
  });
});
