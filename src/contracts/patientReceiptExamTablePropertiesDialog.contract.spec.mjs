import assert from "node:assert/strict";import fs from "node:fs";import test from "node:test";
const view=fs.readFileSync("src/views/PatientReceiptDocumentDesignerView.vue","utf8");const dialog=fs.readFileSync("src/components/documents/designer/DesignerExamTablePropertiesDialog.vue","utf8");
test("panel Propiedades no duplica tabla de examenes",()=>{assert.doesNotMatch(view,/class="designer-panel-section table-designer-panel"/)});
test("crear editar y doble clic usan dialogo",()=>{for(const token of ["examTablePropertiesDialog?.openCreate","examTablePropertiesDialog.value?.openEdit","applyExamTableProperties","model.type==='exam-table'"])assert.ok(view.includes(token),token)});
test("dialogo ofrece diseñador visual vivo tipo hoja de calculo",()=>{for(const token of ["Vista previa de la tabla","exam-preview-paper","sampleRows","sampleSummary","selectedColumn","beginResize","resizeColumn","moveSelectedColumn","addColumn","removeSelectedColumn"])assert.ok(dialog.includes(token),token)});
test("preserva modelo completo y borrador aislado",()=>{for(const token of ["showHeader","showBorders","rowHeight","activeStyle","formatScope","background","textColor","borderColor","activeStyle.alternateBackground","columns","totalRows","requestClose","original","emit(\"apply\""])assert.ok(dialog.includes(token),token)});

test("inspector usa altura completa y scroll propio",()=>{for(const token of [":global(.exam-visual-dialog-body)","height:100%","overflow-y:auto","inspector-section","formatScope"])assert.ok(dialog.includes(token),token)});
test("formato visual se refleja en preview y render Konva",()=>{for(const token of ["fontFamily","fontSize","italic","underline","padding","scopeBorder"])assert.ok(dialog.includes(token),token);for(const token of ["style.fontFamily","style.fontSize","style.padding","style.alternateBackground","textDecoration:decoration(style)"])assert.ok(view.includes(token),token)});
test("inspector usa acordeones planos sin SectionPanel ni recorte interno",()=>{
  assert.doesNotMatch(dialog,/<BioNexusSectionPanel/);
  assert.doesNotMatch(dialog,/import BioNexusSectionPanel/);
  for(const token of ["Columna seleccionada","Presentación","Totales","overflow:visible","height:auto","totals-section-body"])assert.ok(dialog.includes(token),token);
});