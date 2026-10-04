import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const dialog=fs.readFileSync("src/components/security/UserRolesDialog.vue","utf8");
test("usa panel accent y acciones compartidas",()=>{assert.equal((dialog.match(/<BioNexusSectionPanel/g)||[]).length,1);assert.ok(dialog.includes('title="Roles disponibles"'));assert.ok(dialog.includes('variant="accent" compact'));assert.equal((dialog.match(/<BioNexusActionButton/g)||[]).length,2);assert.equal((dialog.match(/<button\b/g)||[]).length,0);});
test("preserva busqueda borrador y seleccion",()=>{for(const token of ['v-model="searchText"','draftRoleIds.length','filteredRoles','isSelected(role.id)','emit(\'toggle-role\', role)','emit(\'save\')'])assert.ok(dialog.includes(token),token);});
test("preserva roles inactivos visibles y bloqueados",()=>{for(const token of ['inactiveAssignedCount','role.isActive ? "Activo" : "Desactivado"','!role.isActive || !canEdit || !canAssign || saving','user?.hidden'])assert.ok(dialog.includes(token),token);});
test("protege cierre con cambios pendientes",()=>{assert.ok(dialog.includes(':prevent-close="saving || hasChanges"'));assert.ok(dialog.includes('@before-close="requestClose"'));assert.ok(dialog.includes('<BioNexusConfirmDialog ref="discardDialog" />'));assert.ok(dialog.includes('Hay cambios sin guardar. ¿Deseas salir y descartarlos?'));});
test("errores generales permanecen antes y resultados al final",()=>{assert.ok(dialog.indexOf('v-else-if="errorMessage"')<dialog.indexOf('title="Roles disponibles"'));assert.ok(dialog.indexOf('v-if="saveError"')>dialog.indexOf('</BioNexusSectionPanel>'));assert.ok(dialog.includes('v-if="saveMessage"'));});
