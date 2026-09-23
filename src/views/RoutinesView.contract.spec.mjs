import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const view = read("src/views/RoutinesView.vue");
const dialog = read("src/components/routines/RoutineDialog.vue");
const examDetail = read("src/components/exams/ExamDetailDialog.vue");
const theme = read("src/styles/components.css");
const router = read("src/router/index.js");
const model = read("src/models/routines.js");

for (const value of [
  "routines.create",
  "routines.update",
  "routines.delete",
  "BioNexusDataGrid",
  "BioNexusContextMenu",
  "BioNexusActionButton",
  "BioNexusConfirmDialog",
]) {
  if (!view.includes(value)) throw new Error(`VIEW:${value}`);
}

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
  "block:\"end\"",
  "block:options.block||\"nearest\"",
]) {
  if (!dialog.includes(value)) throw new Error(`DIALOG:${value}`);
}

if (!theme.includes("BIO NEXUS ROUTINES ADMIN START") || !theme.includes("SELECCIONADO · ↑ ↓ · ENTER · ESC")) {
  throw new Error("THEME:SELECTION_GUIDANCE");
}
if (dialog.includes('class="routine-row available-row" @click="add(exam)"')) throw new Error("DIALOG:ROW_MUST_NOT_ADD");
for (const value of ["openDetail(exam)", "detailDialog", "BioNexusActionButton", 'label="Detalle"', 'label="Agregar"', 'label="Quitar"', "icon-only", 'shape="circle"']) if (!dialog.includes(value)) throw new Error(`DIALOG:DETAIL_OR_ADD:${value}`);
for (const value of ["Información del examen", "Descripción", "Abreviatura"]) if (!examDetail.includes(value)) throw new Error(`EXAM_DETAIL:${value}`);
for (const forbidden of ["Precio", "Impuesto", "cost1", "tax_id"]) if (dialog.includes(forbidden)) throw new Error(`DIALOG:FORBIDDEN_DETAIL:${forbidden}`);
if (!router.includes("configuration/routines") || !router.includes("routines.read")) {
  throw new Error("ROUTE");
}
if (!model.includes("hasOwnProperty.call")) throw new Error("ACTIVE");
if (dialog.includes("routine-selected-heading") || dialog.includes("Selecciona un examen y usa ↑ ↓ · Enter · Esc")) throw new Error("DIALOG:HEADER_GUIDANCE_FORBIDDEN");
if (!theme.includes(".selected-row.keyboard-selected::after") || !theme.includes("padding-right:290px") || !theme.includes("font-size:8px") || !theme.includes("@media(max-width:1200px)")) throw new Error("THEME:ORDERING_GUIDANCE_CONTRACT");

console.log("Routines view contract passed");

if(view.includes("<style")||dialog.includes("<style"))throw new Error("ROUTINES_LOCAL_STYLE_FORBIDDEN");
if(view.includes("<button")||dialog.includes("<button"))throw new Error("ROUTINES_NATIVE_BUTTON_FORBIDDEN");
if(view.includes('pinned:"right"')||view.includes('pinned:"left"'))throw new Error("ROUTINES_PINNED_COLUMN_FORBIDDEN");

if(dialog.includes("add-action")||dialog.includes("detail-action"))throw new Error("ROUTINES_LEGACY_ACTION_CLASS_FORBIDDEN");
