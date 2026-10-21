import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../views/PatientReceiptDocumentDesignerView.vue", import.meta.url), "utf8");

test("la vista previa interna expone los cinco controles aprobados", () => {
  for (const token of ['class="editor-preview-toolbar"','icon="zoom_out"','icon="zoom_in"','label="Ajustar página"','label="Ajustar ancho"']) assert.ok(source.includes(token), token);
});

test("abrir vista previa guarda el zoom del editor y ajusta la pagina", () => {
  assert.ok(source.includes("editorZoomBeforePreview.value=zoom.value"));
  assert.ok(source.includes("editorZoomModeBeforePreview.value=zoomMode.value"));
  assert.match(source, /preview\.value=true[\s\S]*await nextTick\(\);[\s\S]*fitPage\(\)/);
});

test("cerrar vista previa restaura zoom y modo del editor", () => {
  assert.match(source, /preview\.value=false[\s\S]*applyZoom\(editorZoomBeforePreview\.value,editorZoomModeBeforePreview\.value\)/);
  assert.ok(source.includes("if(preview.value)togglePreview()"));
});

test("ajustar ancho alinea el viewport desde el borde izquierdo", () => {
  assert.ok(source.includes('viewport.value.scrollLeft=mode==="width"?0'));
  assert.ok(source.includes('applyZoom(space.width/pageWidth.value,"width")'));
});

test("los controles visuales no alteran documento ni historial", () => {
  const block = source.slice(source.indexOf("async function togglePreview"), source.indexOf("async function toggleFullscreen"));
  assert.equal(block.includes("pushHistory"), false);
  assert.equal(block.includes("documentJson"), false);
  assert.equal(block.includes("markSaved"), false);
});

test("el resize conserva los modos automaticos", () => {
  assert.ok(source.includes('if(zoomMode.value==="page")fitPage();else if(zoomMode.value==="width")fitWidth()'));
  assert.ok(source.includes("new ResizeObserver(()=>recalculateActiveZoom())"));
});