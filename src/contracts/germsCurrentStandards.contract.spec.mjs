import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
const dialog=fs.readFileSync("src/components/germs/GermDialog.vue","utf8");
const view=fs.readFileSync("src/views/GermsView.vue","utf8");
describe("Gérmenes usa los estándares visuales vigentes",()=>{
 it("usa layout, errores y panel compartidos",()=>{for(const token of ["BioNexusFormLayout","BioNexusFormErrors","BioNexusSectionPanel","BioNexusFormField"])assert.ok(dialog.includes(token),token);});
 it("muestra error general antes del panel",()=>assert.ok(dialog.indexOf("<BioNexusFormErrors")<dialog.indexOf("<BioNexusSectionPanel")));
 it("conserva límite y contador dinámico",()=>{assert.ok(dialog.includes('maxlength="50"'));;});
 it("elimina nombres y parches heredados de Antibióticos",()=>{assert.ok(!dialog.includes("antibiotic-form"));assert.ok(!dialog.includes("antibiotic-dialog-submit"));assert.ok(!dialog.includes("bio-nexus-message-error"));});
 it("mantiene grid, filtro, switch y diálogo de estado compartidos",()=>{for(const token of ["BioNexusDataGrid","BioNexusGridToggleCell","BioNexusOptionFilter","GermStateDialog"])assert.ok(view.includes(token),token);});
 it("mantiene actualización local ordenada",()=>{assert.ok(view.includes("replaceRow(saved)"));assert.ok(view.includes("localeCompare"));});
});
it("protege el limite y el contador dinamico sin depender de espacios", () => {
  assert.ok(dialog.includes('maxlength="50"'), "GERMS_MAXLENGTH_50");
  assert.ok(/draft\.germen\.length\s*\+\s*['"] de 50 caracteres['"]/.test(dialog), "GERMS_DYNAMIC_COUNTER_STANDARD");
});
it("protege el SectionPanel aprobado de Gérmenes", () => {
  assert.ok(dialog.includes('icon="microbiology"'), "GERMS_SECTION_PANEL_ICON");
  assert.ok(dialog.includes('description="Define el nombre que identifica al microorganismo."'), "GERMS_SECTION_PANEL_DESCRIPTION");
  assert.ok(dialog.includes('variant="accent"'), "GERMS_SECTION_PANEL_ACCENT");
  assert.ok(!dialog.includes('subtitle="Define el nombre que identifica al microorganismo."'), "GERMS_SECTION_PANEL_NO_SUBTITLE");
});

it("protege Activar neutro y Desactivar danger en el menú contextual", () => {
  assert.ok(view.includes('variant: row.annulled ? "default" : "danger"'), "GERMS_CONTEXT_STATUS_VARIANT");
  assert.ok(view.includes('row.annulled ? "Activar" : "Desactivar"'), "GERMS_CONTEXT_STATUS_LABEL");
});

it("protege el cierre con cambios pendientes", () => {
  for (const token of [
    'BioNexusConfirmDialog',
    ':prevent-close="saving || dirty"',
    '@before-close="requestClose"',
    '@click="requestClose"',
    'if (dirty.value)',
    'title: "Descartar cambios"',
    'message: "Hay cambios sin guardar. ¿Deseas salir y descartarlos?"',
    'confirmText: "Sí, salir y descartar cambios"',
    'variant: "danger"',
    'dirty.value = false',
  ]) assert.ok(dialog.includes(token), "GERMS_DISCARD_CONFIRMATION_" + token);
  assert.ok(dialog.includes('function close() { dialog.value?.close(); }'), "GERMS_PROGRAMMATIC_CLOSE_AFTER_SAVE");
});
