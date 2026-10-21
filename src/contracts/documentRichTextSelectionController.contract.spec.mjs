import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const source=fs.readFileSync(new URL("../components/documents/rich-text/richTextSelectionController.js",import.meta.url),"utf8");
test("selection controller encapsula rango caret y tracking",()=>{
 assert.match(source,/const savedRange = ref\(null\)/);
 assert.match(source,/const selectedAtomicToken = ref\(null\)/);
 for(const name of ["selectionInsideEditor","saveSelection","restoreSelection","selectionElement","selectToken","placeCaretAfter","startSelectionTracking","stopSelectionTracking"]) assert.ok(source.includes(name),name);
 for(const forbidden of ["toolbar","laboratory.","patient.","receipt","invoice"]) assert.equal(source.includes(forbidden),false,forbidden);
});
