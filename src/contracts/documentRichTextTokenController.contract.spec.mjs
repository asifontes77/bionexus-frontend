import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const source=fs.readFileSync(new URL("../components/documents/rich-text/richTextTokenController.js",import.meta.url),"utf8");
test("token controller encapsula tokens enter y posicion",()=>{
 for(const name of ["tokenFromNode","normalizeTokenSpans","tokenFormattingElement","handleEditorClick","rangeBelongsToEditor","preserveTokenInsertionRange","insertToken","handleEditorKeydown"]) assert.ok(source.includes(name),name);
 assert.match(source,/selection\.savedRange\.value\?\.cloneRange/);
 assert.match(source,/selection\.placeCaretAfter\(token, true\)/);
 for(const forbidden of ["laboratory.","patient.","receipt","invoice"]) assert.equal(source.includes(forbidden),false,forbidden);
});
