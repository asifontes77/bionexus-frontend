import fs from "node:fs";
import assert from "node:assert/strict";
const dialog=fs.readFileSync("src/components/germs/GermDialog.vue","utf8");
assert.ok(dialog.includes(':help="draft.germen.length+\' de 50 caracteres\'"'));
assert.ok(!dialog.includes(':hint="draft.germen.length+'));
assert.ok(dialog.includes('maxlength="50"'));
assert.ok(dialog.includes('v-model="draft.germen"'));
console.log("[OK] El contador de Germenes usa la propiedad help real de BioNexusFormField.");
