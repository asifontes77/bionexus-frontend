import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(path, "utf8");
const view = read("src/views/RoutinesView.vue");
const dialog = read("src/components/routines/RoutineDialog.vue");
const examDetail = read("src/components/exams/ExamDetailDialog.vue");
const theme = read("src/styles/components.css");
const router = read("src/router/index.js");
const model = read("src/models/routines.js");
const service = read("src/services/routinesService.js");

for (const value of [
  "routines.create",
  "routines.update",
  "routines.delete",
  "BioNexusDataGrid",
  "BioNexusContextMenu",
  "BioNexusActionButton",
  "BioNexusConfirmDialog",
  "BioNexusFormErrors",
  "BioNexusStateDialog",
  "BioNexusGridToggleCell",
]) assert.ok(view.includes(value), `VIEW:${value}`);

for (const value of [
  "move(index,delta)",
  "requestClose",
  "Hay cambios sin guardar. ¿Deseas salir y descartarlos?",
  "Sí, salir y descartar cambios",
  "Selecciona al menos un examen",
  "Object.prototype.hasOwnProperty.call",
  "draggable",
  "startDrag",
  "previewDrag",
  "keyboard-selected",
  "ArrowUp",
  "ArrowDown",
  "Enter",
  "Escape",
  "routine-entry-dialog",
  "order-number",
  "drag-icon",
  "routine-row-copy",
  "catalog-mark",
  "activateKeyboardSelection",
  "scrollIntoView",
  "openDetail(exam)",
  "detailDialog",
]) assert.ok(dialog.includes(value), `DIALOG:${value}`);

assert.ok(view.includes('<BioNexusFormErrors :errors="loadError" />'));
assert.ok(dialog.includes('<BioNexusFormErrors :errors="errorMessage" />'));
assert.ok(dialog.includes("SELECCIONADO · ↑ ↓ · ENTER · ESC"));
assert.match(dialog, /selected-row\.keyboard-selected::after/);
assert.match(dialog, /padding-right:210px/);
assert.match(dialog, /font-size:8px/);
assert.match(dialog, /@media\(max-width:1200px\)/);
assert.ok(view.includes("<style scoped>"));
assert.ok(dialog.includes("<style scoped>"));
assert.doesNotMatch(view, /bio-nexus-message bio-nexus-message-error/);
assert.doesNotMatch(dialog, /bio-nexus-message bio-nexus-message-error/);
assert.doesNotMatch(view, /<button/);
assert.doesNotMatch(dialog, /<button/);
assert.doesNotMatch(view, /pinned:"(?:right|left)"/);
assert.doesNotMatch(theme, /BIO NEXUS ROUTINES ADMIN|\.routines-page|\.routine-entry-dialog/);
assert.ok(router.includes("configuration/routines") && router.includes("routines.read"));
assert.ok(model.includes("hasOwnProperty.call"));
for (const value of ["Información del examen", "Descripción", "Abreviatura"]) assert.ok(examDetail.includes(value), `EXAM_DETAIL:${value}`);

const replaceRowBlock = view.slice(view.indexOf("function compareRoutines"), view.indexOf("async function saveForm"));
assert.match(replaceRowBlock, /function compareRoutines/);
assert.match(replaceRowBlock, /localeCompare\(right\.description,"es",\{sensitivity:"base"\}\)/);
assert.match(replaceRowBlock, /rows\.value\.splice\(currentIndex,1\)/);
assert.match(replaceRowBlock, /rows\.value\.splice\(insertIndex<0\?rows\.value\.length:insertIndex,0,saved\)/, "ROUTINES_CREATE_IN_ACTIVE_ORDER");
assert.doesNotMatch(replaceRowBlock, /rows\.value\.push\(saved\)|rows\.value\s*=|\.sort\(/, "ROUTINES_STABLE_GRID_UPDATE");
assert.match(view, /field:"description"[^}]*sort:"asc"/);

const saveBlock = view.slice(view.indexOf("async function saveForm"), view.indexOf("async function openDelete"));
assert.doesNotMatch(saveBlock, /loadRows\(/, "ROUTINES_SAVE_MUST_NOT_RELOAD_GRID");
assert.ok(service.includes('ROUTINE_DESCRIPTION_ALREADY_EXISTS: "Ya existe una rutina con esa descripción."'));

console.log("Routines view contract: OK");

for (const token of ['changeRoutineStatus','requestStatus(row)','confirmStatus(row)','field:"isActive"','Desactivar rutina','Activar rutina','danger']) assert.ok(view.includes(token),`ROUTINE_STATUS:${token}`);
const statusBlock=view.slice(view.indexOf('function requestStatus(row)'),view.indexOf('async function openDelete(row)'));
assert.ok(!statusBlock.includes('loadRows('),'ROUTINES_STATUS_WITHOUT_RELOAD');
assert.ok(statusBlock.includes('replaceRow(saved)'));

// Estado estándar del grid de Rutinas.
assert.ok(view.includes("BioNexusOptionFilter"), "VIEW:BioNexusOptionFilter");
assert.ok(view.includes('filterParams:{options:[{value:true,label:"Activo"},{value:false,label:"Desactivado"}]}'), "VIEW:EstadoFilterOptions");
assert.ok(view.includes('cellRenderer:"BioNexusGridToggleCell"'), "VIEW:BioNexusGridToggleCellRenderer");
assert.ok(view.includes('onLabel:"Activo"'), "VIEW:EstadoActivo");
assert.ok(view.includes('offLabel:"Desactivado"'), "VIEW:EstadoDesactivado");
assert.ok(view.includes('onToggle:requestStatus'), "VIEW:StatusToggleHandler");
assert.ok(!view.includes("BioNexusStatusBadgeCell"), "VIEW:StatusBadgeForbidden");
assert.ok(!view.includes('label:"Verdadero"'), "VIEW:EstadoVerdaderoForbidden");
assert.ok(!view.includes('label:"Falso"'), "VIEW:EstadoFalsoForbidden");
