import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const url=fs.readFileSync("src/api/apiUrl.js","utf8");
const client=fs.readFileSync("src/api/apiClient.js","utf8");
const session=fs.readFileSync("src/services/sessionPolicySocket.js","utf8");
const authorization=fs.readFileSync("src/services/authorizationEventsSocket.js","utf8");
test("API usa VITE_API_URL para rutas relativas",()=>{
 assert.match(url,/import\.meta\.env\.VITE_API_URL/);
 assert.match(url,/replace\(\/\\\/\+\$\/, ""\)/);
 assert.match(url,/\^https\?:\\\/\\\//i);
 assert.match(client,/fetch\(resolveApiUrl\(RENEW_PATH\)/);
 assert.match(client,/fetch\(resolveApiUrl\(path\)/);
});
test("sockets usan la misma URL publica",()=>{
 assert.match(session,/resolveSocketNamespace\('\/session-policy'\)/);
 assert.match(authorization,/resolveSocketNamespace\('\/authorization-events'\)/);
});
test("manejo de sesion y timeout permanece",()=>{
 for(const token of ["getSessionPolicySocketId","X-Bio-Nexus-Socket-Id","AbortController","BIO_NEXUS_REQUEST_TIMEOUT","retryAfterRenewal","requestToken !== currentToken"]) assert.ok(client.includes(token),token);
});
