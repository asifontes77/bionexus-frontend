import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const url=fs.readFileSync("src/api/apiUrl.js","utf8");
const logo=fs.readFileSync("src/components/laboratory/LaboratoryLogoPanel.vue","utf8");
const detail=fs.readFileSync("src/components/security/UserDetailDialog.vue","utf8");
const identity=fs.readFileSync("src/components/security/UserIdentityDialog.vue","utf8");
const preview=fs.readFileSync("src/components/documents/designer/documentPreviewContext.js","utf8");
test("recursos publicos usan resolvedor central",()=>{
 assert.match(url,/export function resolvePublicAssetUrl/);
 assert.match(url,/return resolveApiUrl\(encodedPath\)/);
 for(const source of [logo,detail,identity,preview]) assert.match(source,/resolvePublicAssetUrl/);
 assert.doesNotMatch(logo,/localhost:8081/);
 assert.doesNotMatch(preview,/VITE_API_PUBLIC_URL/);
});
test("imports Vue permanecen dentro de script setup",()=>{
 for(const source of [detail,identity]) {
   assert.ok(source.indexOf("<script setup>") < source.indexOf("import { resolvePublicAssetUrl"));
   assert.ok(source.indexOf("import { resolvePublicAssetUrl") < source.indexOf("</script>"));
 }
});
test("resolvedor conserva URL absolutas y codifica segmentos",()=>{
 assert.match(url,/\^\(\?:https\?:\|blob:\|data:\)/i);
 assert.match(url,/encodeURIComponent\(decodeURIComponent\(segment\)\)/);
});
