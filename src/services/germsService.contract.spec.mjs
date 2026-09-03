import fs from "node:fs";
import assert from "node:assert/strict";

const service = fs.readFileSync(new URL("./germsService.js", import.meta.url), "utf8");
const model = fs.readFileSync(new URL("../models/germs.js", import.meta.url), "utf8");

assert.match(service, /const GERMS_PATH = ["']\/api\/list-germs["']/);
assert.equal((service.match(/GERMS_PATH/g) || []).length, 4);
assert.doesNotMatch(service, /["']\/api\/germ["']/);
assert.doesNotMatch(service, /apiRequest\(["']\/list-germs/);
assert.doesNotMatch(service, /GERM_RESPONSE_EMPTY|GERM_RESPONSE_INVALID_JSON|JSON\.parse/);
assert.match(model, /Array\.isArray\(value\)/);
assert.match(model, /Array\.isArray\(value\?\.data\)/);
assert.doesNotMatch(model, /parseJsonResponse|findGermRows|JSON\.parse|GERM_RESPONSE_/);
console.log("GERMS_HTTP_CONTRACT_OK");