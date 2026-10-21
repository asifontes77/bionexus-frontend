import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const designer=await readFile(new URL("./PatientReceiptDocumentDesignerView.vue",import.meta.url),"utf8");
const engine=await readFile(new URL("../components/documents/designer/useDocumentDesignerEngine.js",import.meta.url),"utf8");
const combined=`${designer}\n${engine}`;

assert.ok(engine.includes("documentSnapshot"),"DESIGNER_SNAPSHOT_NOT_FOUND");
assert.ok(engine.includes("pushHistory"),"DESIGNER_HISTORY_NOT_FOUND");
assert.ok(engine.includes("function undo()"),"DESIGNER_UNDO_NOT_FOUND");
assert.ok(engine.includes("function redo()"),"DESIGNER_REDO_NOT_FOUND");
assert.ok(engine.includes("loadDocument"),"DESIGNER_LOAD_NOT_FOUND");
assert.ok(engine.includes("saveDocument"),"DESIGNER_SAVE_NOT_FOUND");
assert.ok(designer.includes("useDocumentDesignerEngine"),"DESIGNER_ENGINE_CONNECTION_NOT_FOUND");
assert.ok(designer.includes("function restoreSnapshot("),"DESIGNER_RESTORE_SNAPSHOT_NOT_FOUND");
assert.ok(designer.includes("Konva.Stage"),"DESIGNER_STAGE_NOT_FOUND");
assert.ok(designer.includes("createMarginGuides"),"DESIGNER_MARGIN_GUIDES_NOT_FOUND");
assert.ok(designer.includes("patientReceiptDocumentAdapter"),"DESIGNER_ADAPTER_NOT_FOUND");
assert.ok(combined.includes("togglePreview")||designer.includes("preview.value=!preview.value"),"DESIGNER_PREVIEW_NOT_FOUND");
