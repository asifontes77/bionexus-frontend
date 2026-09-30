import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
const dialog=fs.readFileSync("src/components/worksheetgroups/WorksheetGroupDialog.vue","utf8");
const view=fs.readFileSync("src/views/WorksheetGroupsView.vue","utf8");
describe("Grupos de hojas de trabajo usa estándares actuales",()=>{
 it("usa layout y errores compartidos",()=>{for(const token of ["BioNexusFormLayout","BioNexusFormErrors","BioNexusFormField"])assert.ok(dialog.includes(token),token);});
 it("ubica el error general antes del contenido",()=>assert.ok(dialog.indexOf("<BioNexusFormErrors")<dialog.indexOf("worksheet-body")));
 it("protege maxlength y contadores",()=>{assert.ok(dialog.includes('maxlength="50"'));assert.ok(dialog.includes('maxlength="200"'));assert.ok(dialog.includes("draft.description.length + ' de 50 caracteres'"));assert.ok(dialog.includes("draft.details.length+' de 200 caracteres'"));});
 it("preserva la validación de exámenes",()=>assert.ok(dialog.includes("Selecciona al menos un examen.")));
 it("protege descarte por X, Cancelar y Esc",()=>{for(const token of ["BioNexusConfirmDialog",':prevent-close="saving || changed"','@before-close="requestClose"','@click="requestClose"'])assert.ok(dialog.includes(token),token);});
 it("preserva detalle, agregar y quitar",()=>{for(const token of ["ExamDetailDialog","openDetail(exam)","add(exam)","remove(index)"])assert.ok(dialog.includes(token),token);});
 it("normaliza permisos a crear y actualizar",()=>{assert.ok(view.includes("worksheet-groups.create"));assert.ok(view.includes("worksheet-groups.update"));assert.ok(!view.includes("worksheet-groups.change-status"));});
 it("protege Activar neutro y Desactivar danger",()=>assert.ok(view.includes("variant:row.annulled?'default':'danger'")));
 it("actualiza localmente y conserva orden",()=>{assert.ok(view.includes("function replaceRow(saved)"));assert.ok(view.includes("localeCompare"));assert.ok(!view.includes("toast.success(payload.mode==='create'?'Grupo creado correctamente.':'Grupo actualizado correctamente.');await loadRows()"));});
 it("preserva grid, filtro, switch y estado",()=>{for(const token of ["BioNexusDataGrid","BioNexusOptionFilter","BioNexusGridToggleCell","WorksheetStateDialog"])assert.ok(view.includes(token),token);});
 it("elimina el parche visual del botón deshabilitado",()=>assert.ok(!dialog.includes("worksheet-entry-dialog .bio-nexus-action-primary:disabled")));
 it("elimina el contrato histórico aislado",()=>assert.ok(!fs.existsSync("src/contracts/worksheetGroupCreateButton.contract.spec.mjs")));
 it("replica exactamente las acciones aprobadas de Rutinas",()=>{
   assert.ok(dialog.includes('size="sm" variant="secondary" icon="visibility" icon-only shape="circle" label="Detalle"'),"WORKSHEET_ROUTINE_DETAIL_PATTERN");
   assert.ok(dialog.includes('size="sm" variant="primary" icon="add" icon-only shape="circle" label="Agregar"'),"WORKSHEET_ROUTINE_ACTION_PATTERN");
   assert.ok(dialog.includes('class="available-actions"'));
   assert.ok(dialog.includes('.available-actions{display:flex;align-items:center;gap:4px;flex:none}'));
   assert.ok(!dialog.includes('.row-actions button'));
 });
 it("mantiene editables los grupos desactivados",()=>{
   assert.ok(dialog.includes('label="Agregar" :disabled="!canManageItems" @click="add(exam)"'));
   assert.ok(!dialog.includes('current?.annulled'),"WORKSHEET_INACTIVE_GROUP_REMAINS_EDITABLE");
 });
});
