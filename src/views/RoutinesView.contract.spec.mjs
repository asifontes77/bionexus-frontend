import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const view = read("src/views/RoutinesView.vue");
const dialog = read("src/components/routines/RoutineDialog.vue");
const router = read("src/router/index.js");
const model = read("src/models/routines.js");

for (const value of [
  "routines.create",
  "routines.update",
  "routines.delete",
  "BioNexusDataGrid",
  "BioNexusContextMenu",
]) {
  if (!view.includes(value)) throw new Error(`VIEW:${value}`);
}

for (const value of [
  "move(index,delta)",
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

if (!dialog.includes("SELECCIONADO") || !dialog.includes("ENTER") || !dialog.includes("ESC")) {
  throw new Error("DIALOG:SELECTION_GUIDANCE");
}
if (dialog.includes('class="routine-row available-row" @click="add(exam)"')) throw new Error("DIALOG:ROW_MUST_NOT_ADD");
for (const value of ["openDetail(exam)", "detailDialog", "Información del examen", "Descripción", "Abreviatura", "Grupo", "Tipo", "Estado", "add-action"]) if (!dialog.includes(value)) throw new Error(`DIALOG:DETAIL_OR_ADD:${value}`);
for (const forbidden of ["Precio", "Impuesto", "cost1", "tax_id"]) if (dialog.includes(forbidden)) throw new Error(`DIALOG:FORBIDDEN_DETAIL:${forbidden}`);
if (!router.includes("configuration/routines") || !router.includes("routines.read")) {
  throw new Error("ROUTE");
}
if (!model.includes("hasOwnProperty.call")) throw new Error("ACTIVE");

console.log("Routines view contract passed");
