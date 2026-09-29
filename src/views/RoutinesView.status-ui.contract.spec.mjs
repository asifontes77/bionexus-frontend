import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("./RoutinesView.vue", import.meta.url), "utf8");

assert.ok(source.includes("BioNexusGridToggleCell"));
assert.ok(source.includes("BioNexusOptionFilter"));
assert.ok(source.includes('filterParams:{options:[{value:true,label:"Activo"},{value:false,label:"Desactivado"}]}'));
assert.ok(source.includes('cellRenderer:"BioNexusGridToggleCell"'));
assert.ok(source.includes('onLabel:"Activo"'));
assert.ok(source.includes('offLabel:"Desactivado"'));
assert.ok(source.includes('onToggle:requestStatus'));
assert.ok(source.includes("BioNexusStateDialog"));
assert.ok(source.includes("replaceRow(saved)"));
assert.ok(!source.includes("BioNexusStatusBadgeCell"));
assert.ok(!source.includes('label:"Verdadero"'));
assert.ok(!source.includes('label:"Falso"'));

const start = source.indexOf("function requestStatus(row)");
const end = source.indexOf("async function openDelete(row)");
assert.ok(start >= 0 && end > start);
assert.ok(!source.slice(start, end).includes("loadRows("));

console.log("Routines status UI contract: OK");
