import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
const view = readFileSync(new URL("../views/PatientReceiptDocumentDesignerView.vue", import.meta.url), "utf8");
const source = readFileSync("src/components/documents/rich-text/RichTextEditorDialog.vue", "utf8");
const adapter = readFileSync("src/components/documents/rich-text/richTextFormattingAdapter.js", "utf8");
const selectionController = readFileSync("src/components/documents/rich-text/richTextSelectionController.js", "utf8");
const tokenController = readFileSync("src/components/documents/rich-text/richTextTokenController.js", "utf8");
describe("Texto libre usa editor con barra superior", () => {
  it("organiza herramientas arriba y contenido abajo", () => {
    assert.ok(source.indexOf('class="text-format-toolbar"') < source.indexOf('class="text-content-editor"')); assert.ok(source.indexOf('class="text-content-editor"') < source.indexOf('class="text-token-toolbar"'));
    assert.ok(source.indexOf('class="text-content-editor"') < source.indexOf('class="text-token-toolbar"'));
    assert.ok(source.includes('grid-template-rows:auto minmax(0,1fr) auto'));
  });
  it("usa acciones compartidas para formato", () => {
    for (const token of ["BioNexusActionButton", "format_bold", "format_italic", "format_underlined", "format_align_left", "format_align_center", "format_align_right", "format_align_justify"]) assert.ok(source.includes(token), token);
  });
  it("aplica formato al rango seleccionado y usa autoaltura", () => {
    for (const token of ["contenteditable=\"true\"", "command('bold')", "document.execCommand", "resizeEditor", "overflowY"]) assert.ok(source.includes(token), token);
  });
  it("aplica todos los controles al rango seleccionado", () => {
    for (const token of ["applyFontFamily","applyFontSize","applyColor","applyInlineStyle","justifyFull"]) assert.ok(source.includes(token), token);
    for (const token of ["savedRange","saveSelection","restoreSelection"]) assert.ok(selectionController.includes(token), token);
  });
  it("preserva fuente y tamaño parciales en el lienzo", () => {
    for (const token of ["css.fontFamily","css.fontSize","item.fontFamily","item.fontSize","backgroundColor"]) assert.ok(view.includes(token), token);
    assert.ok(source.includes('surroundSelection("fontFamily"'));
  });
  it("persiste color y estilos tipograficos por seleccion", () => {
    const inlineStyleTokens = [
      'surroundSelection("fontWeight"',
      'surroundSelection("fontStyle"',
      'surroundSelection("textDecorationLine"',
      'surroundSelection("color"',
      'surroundSelection("backgroundColor"'
    ];
    for (const token of inlineStyleTokens) assert.ok(source.includes(token), token);
    assert.ok(view.includes("item.bold"));
    assert.ok(view.includes("item.italic"));
    assert.ok(view.includes("item.underline"));
    assert.ok(view.includes("item.color"));
  });
  it("trata cada token como un rango atomico", () => {
    for (const token of ["normalizeTokenSpans","data-rich-token","handleEditorClick"]) assert.ok(tokenController.includes(token), token);
    for (const token of ["selectToken","range.selectNodeContents(token)"]) assert.ok(selectionController.includes(token), token);
  });
  it("aplica estilos directamente al token y sincroniza la barra", () => {
    assert.ok(selectionController.includes("selectedAtomicToken"));
    for (const token of ["token.style[styleName]", "textDecorationLine"]) assert.ok(source.includes(token), token);
    assert.ok(adapter.includes("Number(weight) >= 600"), "Number(weight) >= 600");
    assert.ok(view.includes("resolveDocumentTokens"));
  });
  it("cierra subrayado fondo y vista previa a lo ancho", () => {
    assert.ok(source.includes('surroundSelection("textDecorationLine"'));
    assert.ok(adapter.includes('firstComputedValue(chain, value => value.backgroundColor, isVisibleColor)'));
    assert.ok(!source.includes('Espacio entre párrafos'));
    assert.ok(!source.includes('applyParagraphGap'));
    assert.ok(view.includes("fitWidth();"));
  });
  it("mantiene formato completo, borrador y descarte", () => {
    for (const token of ["textColor", "backgroundColor", "fontFamily", "lineHeight", "padding", "original", "BioNexusConfirmDialog", "requestClose"]) assert.ok(source.includes(token), token);
  });
});
