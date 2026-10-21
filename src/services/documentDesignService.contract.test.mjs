import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const service = await readFile(new URL("./documentDesignService.js", import.meta.url), "utf8");

test("usa los endpoints de diseno por documentId", () => {
  assert.match(service, /document-definitions\/\$\{id\}\/design/);
  assert.match(service, /getDocumentDesign/);
  assert.match(service, /saveDocumentDesign/);
});
