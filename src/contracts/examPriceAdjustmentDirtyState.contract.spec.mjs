import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe,it } from "node:test";
const dialog=readFileSync("src/components/examcatalog/ExamPriceAdjustmentDialog.vue","utf8"),view=readFileSync("src/views/ExamCatalogView.vue","utf8");
describe("Price adjustment dirty state",()=>{
 it("protege X Escape y Cancelar",()=>{for(const token of[':prevent-close="saving || hasChanges"','@before-close="requestClose"','@click="requestClose"',"BioNexusConfirmDialog","discardDialog.value?.ask","Continuar editando"])assert.ok(dialog.includes(token),token)});
 it("compara semanticamente todo el borrador",()=>{for(const token of["draftState=computed","operation:operation.value","percentage:percentage.value","tariffIds:[...tariffIds.value]","examIds:workingRecords.value","sort((a,b)=>a-b)","hasChanges=computed"])assert.ok(dialog.includes(token),token)});
 it("crea y limpia snapshot estable",()=>{for(const token of["original.value=signature.value","original.value=\"\"","signature.value!==original.value"])assert.ok(dialog.includes(token),token)});
 it("descarta o continua editando con el dialogo estandar",()=>{for(const token of["Hay cambios sin guardar","Sí, salir y descartar cambios","cancelText:\"Continuar editando\"","if(!accepted)return"])assert.ok(dialog.includes(token),token)});
 it("aplicar exitosamente cierra sin advertencia falsa",()=>{assert.ok(dialog.includes("function markAppliedAndClose(){original.value=signature.value;closeDirect()}"));assert.ok(view.includes("priceAdjustmentDialog.value?.markAppliedAndClose()"));assert.ok(!view.includes("priceAdjustmentDialog.value?.close();await nextTick();"))});
});