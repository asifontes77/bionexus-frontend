import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const view=readFileSync("src/views/PatientReceiptDocumentDesignerView.vue","utf8");
const engine=readFileSync("src/components/documents/designer/useDocumentDesignerEngine.js","utf8");

describe("Patient receipt designer unsaved changes",()=>{
  it("usa el estado dirty real del motor",()=>{
    assert.ok(engine.includes("const dirty = computed(() => documentSnapshot.value !== savedDocument.value)"));
    assert.ok(engine.includes("markSaved()"));
    assert.ok(view.includes("const hasUnsavedChanges=computed(()=>designerReady.value&&dirty.value)"));
  });
  it("protege navegacion interna con el dialogo compartido",()=>{
    for(const token of ['<BioNexusConfirmDialog ref="discardChangesDialog" />','onBeforeRouteLeave','confirmDiscardChanges','discardChangesDialog.value?.ask','title:"Descartar cambios"','Hay cambios sin guardar. ¿Deseas salir y descartarlos?','confirmText:"Sí, salir y descartar cambios"','cancelText:"Continuar editando"']) assert.ok(view.includes(token),token);
  });
  it("protege recarga y cierre solo con cambios efectivos",()=>{
    for(const token of ['beforeunload','handleBeforeUnload','if(!hasUnsavedChanges.value||versionBusy.value)return','event.preventDefault()','event.returnValue=""','removeEventListener("beforeunload",handleBeforeUnload)']) assert.ok(view.includes(token),token);
  });
  it("evita falsos positivos durante la carga y despues de guardar",()=>{
    assert.ok(view.includes('const designerReady=ref(false)'));
    assert.ok(view.includes('designerReady.value=true'));
    assert.ok(view.includes('designerReady.value=false'));
    assert.ok(view.includes('markSaved()'));
    assert.ok(view.includes(':disabled="versionBusy || !dirty || !canSaveDraft"'));
  });
});
